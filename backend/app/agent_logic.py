"""
Lógica del asistente FASS — uso de la aplicación y conceptos de la escala.
"""
from .knowledge_base import KNOWLEDGE_BASE, get_severity_guidance, search_knowledge, APP_USAGE, FASS_CONCEPTS, FAQ

SYSTEM_PROMPT = """
Eres el asistente oficial del sistema FAR.
Tu función principal es ayudar a los médicos que usan esta aplicación.

PRIORIDADES (en orden):
1. Resolver dudas sobre el USO DE LA APLICACIÓN (flujos, pantallas, funcionalidades).
2. Explicar conceptos técnicos y clínicos de la escala FASS (nFASS, oFASS, síntomas, grados).
3. Orientar sobre alergias alimentarias en el contexto de la evaluación clínica.

DOMINIOS PERMITIDOS:
- Cómo registrarse, iniciar sesión, recuperar acceso.
- Cómo registrar una nueva evaluación (flujo paso a paso).
- Cómo usar la calculadora de síntomas.
- Cómo consultar, exportar o eliminar el historial.
- Qué muestra el dashboard y cómo interpretarlo.
- Qué significa un resultado nFASS/oFASS concreto.
- Cómo funciona la pseudonimización del NHC y el cifrado de datos.
- Criterios de selección de síntomas por sistema orgánico.
- Diferencia entre nFASS y oFASS y cómo se calculan.
- Criterios de anafilaxia y cuándo usar adrenalina.
- Alérgenos alimentarios comunes y reacciones alérgicas.

RESTRICCIÓN:
Si la pregunta no tiene ninguna relación con la aplicación FASS ni con alergias alimentarias, responde:
"Solo puedo ayudarte con el uso del sistema FASS o con dudas sobre alergias alimentarias. ¿En qué puedo ayudarte?"

FORMATO DE RESPUESTA:
- Respuestas directas y prácticas, sin introducción innecesaria.
- Usa listas numeradas para pasos o flujos.
- Usa viñetas (-) para enumeraciones.
- Párrafos cortos (2-3 líneas máximo).
- Destaca en MAYÚSCULAS solo términos clave (nFASS, oFASS, ANAFILAXIA, NHC).
- Máximo 5 párrafos o 10 puntos de lista.

CONOCIMIENTO DE LA APLICACIÓN:
- Registro: formulario → aprobación por admin → credenciales por email.
- Login: email + contraseña → sesión en sessionStorage (se cierra al cerrar navegador).
- Evaluación: Seleccionar paciente → Antecedentes → Evento → Síntomas → Puntuación.
- NHC: nunca se almacena en claro, se pseudonimiza con SHA-256.
- Historial: buscar por NHC, ver evaluaciones, exportar PDF/CSV, eliminar (solo propias).
- Dashboard: estadísticas propias filtradas por rango temporal.
- Eliminación: solo el médico autor puede borrar sus evaluaciones (403 si otro intenta).
- Sesión: sessionStorage con clave fass_usuario y fass_nombre.

CONOCIMIENTO DE LA ESCALA:
- nFASS = log2(Σ 2^ε × (1 + Σλ)) + 2, calculado automáticamente.
- oFASS: grado 1 (Mild) → 2 (Moderate) → 3 (Severe) → 4 (Very Severe) → 5 (Anaphylaxis).
- 5 sistemas orgánicos: cutáneo (ε=1), gastrointestinal (ε=2), respiratorio (ε=3), cardiovascular (ε=4), neurológico (ε=3).
- Solo marcar síntomas del episodio actual, no antecedentes.
- Anafilaxia: hipotensión, broncoespasmo grave, estridor o pérdida de conciencia → adrenalina IM inmediata + 112.
"""

ALLOWED_TOPICS = [
    # uso app
    "registro", "registrar", "login", "iniciar sesión", "contraseña", "credenciales",
    "evaluación", "evaluacion", "calculadora", "síntomas", "sintomas", "historial",
    "paciente", "nhc", "dashboard", "estadísticas", "exportar", "pdf", "csv",
    "eliminar", "borrar", "sesión", "acceso", "cuenta", "médico", "usuario",
    "flujo", "pantalla", "formulario", "antecedentes", "evento", "puntuación",
    "cifrado", "seguridad", "datos", "privacidad",
    # fass
    "fass", "nfass", "ofass", "score", "grado", "severidad", "clasificación",
    "mild", "moderate", "severe", "anaphylaxis", "anafilaxia",
    # clínico
    "alergia", "alergias", "alimentaria", "reacción", "síntoma", "urticaria",
    "angioedema", "broncoespasmo", "hipotensión", "adrenalina", "epinefrina",
    "alérgeno", "leche", "huevo", "cacahuete", "frutos secos", "pescado", "soja",
    "cutáneo", "respiratorio", "cardiovascular", "gastrointestinal", "neurológico"
]

def is_on_topic(user_query: str) -> bool:
    q = user_query.lower()
    if any(t in q for t in ALLOWED_TOPICS):
        return True
    patterns = [
        "cómo", "como", "qué es", "que es", "para qué", "para que",
        "cuándo", "cuando", "dónde", "donde", "puedo", "tengo que",
        "explica", "muéstrame", "muestrame", "diferencia", "significa"
    ]
    return any(p in q for p in patterns)

    
    return False

def get_off_topic_response():
    """Respuesta para temas fuera del dominio"""
    return {
        "response": "Lo siento, solo puedo asistir con preguntas relacionadas con alergias alimentarias y la escala FASS. ¿Tienes alguna duda sobre clasificación de reacciones alérgicas o evaluación clínica?",
        "suggestions": [
            "¿Cómo clasifico la severidad de una urticaria?",
            "¿Cuándo una reacción se considera anafilaxia?",
            "¿Qué diferencia hay entre reacción leve y moderada?",
            "¿Cuándo debo usar adrenalina?",
            "Explícame los criterios del sistema respiratorio"
        ]
    }

def process_medical_query(user_query):
    """Procesa consulta médica con restricciones de dominio"""
    
    # 1. Verificar si está en el dominio
    if not is_on_topic(user_query):
        return get_off_topic_response()
    
    # 2. Buscar en base de conocimiento
    knowledge_results = search_knowledge(user_query)
    
    # 3. Construir contexto para el LLM
    context = {
        "system_prompt": SYSTEM_PROMPT,
        "user_query": user_query,
        "knowledge_base": knowledge_results,
        "severity_criteria": KNOWLEDGE_BASE["criteria_classification"]["severity_levels"]
    }
    
    return context

def get_symptom_guidance(symptom_name, organ_system):
    """Proporciona guía específica para clasificar un síntoma"""
    
    severity_guide = get_severity_guidance(organ_system)
    
    if not severity_guide:
        return {"error": "Sistema de órgano no encontrado"}
    
    return {
        "symptom": symptom_name,
        "organ_system": severity_guide.get("name"),
        "severity_indicators": severity_guide.get("severity_indicators"),
        "common_symptoms": severity_guide.get("common_symptoms"),
        "guidance": f"""
Para clasificar '{symptom_name}' en el sistema {severity_guide.get('name')}:

LEVE: {severity_guide.get('severity_indicators', {}).get('mild')}
MODERADO: {severity_guide.get('severity_indicators', {}).get('moderate')}
SEVERO: {severity_guide.get('severity_indicators', {}).get('severe')}

Considere:
- Frecuencia del síntoma
- Impacto en actividades diarias
- Necesidad de tratamiento
- Presencia de complicaciones
"""
    }