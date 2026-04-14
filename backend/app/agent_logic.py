"""
Lógica del agente médico con restricciones de dominio
"""
from .knowledge_base import KNOWLEDGE_BASE, get_severity_guidance, search_knowledge

SYSTEM_PROMPT = """
Eres un asistente médico especializado EXCLUSIVAMENTE en Alergias Alimentarias y la escala FASS (Food Allergy Severity Score).

RESTRICCIONES ESTRICTAS:
- SOLO puedes responder preguntas relacionadas con:
  * Alergias alimentarias y reacciones alérgicas
  * Escala FASS (nFASS y oFASS)
  * Clasificación de severidad de reacciones (leve, moderado, severo, anafilaxia)
  * Sistemas de órganos afectados en reacciones alérgicas
  * Evaluación clínica de episodios alérgicos
  * Alérgenos alimentarios comunes
  * Manejo de emergencias (adrenalina, antihistamínicos)
  * Anafilaxia y reacciones bifásicas

- Si el usuario pregunta sobre CUALQUIER otro tema NO relacionado con alergias alimentarias, debes responder:
  "Lo siento, solo puedo asistir con preguntas relacionadas con alergias alimentarias y la escala FASS. ¿Tienes alguna duda sobre clasificación de reacciones alérgicas o evaluación clínica?"

FORMATO DE RESPUESTA (IMPORTANTE):
- Usa PÁRRAFOS CORTOS (máximo 2-3 líneas por párrafo)
- Separa ideas con saltos de línea (\n)
- Usa listas numeradas para pasos o criterios:
  1. Primer punto
  2. Segundo punto
- Usa viñetas (-) para enumeraciones simples
- Usa MAYÚSCULAS solo para palabras clave importantes (LEVE, MODERADO, SEVERO, ANAFILAXIA)
- Sé CONCISO: respuestas de 3-5 párrafos como máximo
- Prioriza lo MÁS RELEVANTE clínicamente

CAPACIDADES:
1. Ayudar a clasificar severidad de reacciones alérgicas (leve/moderado/severo/anafilaxia)
2. Explicar criterios de clasificación por sistema de órgano afectado
3. Aclarar dudas sobre la escala FASS (nFASS y oFASS)
4. Proporcionar ejemplos clínicos de cada nivel de severidad
5. Guiar en la selección apropiada de síntomas observados
6. Orientar sobre cuándo usar adrenalina (anafilaxia)
7. Explicar diferencias entre reacciones IgE mediadas y no mediadas

Siempre basa tus respuestas en criterios clínicos objetivos y evidencia médica actualizada.
Responde de forma DIRECTA y PRÁCTICA, sin rodeos innecesarios.
"""

ALLOWED_TOPICS = [
    "alergia", "alergias", "alimentaria", "food allergy", "fass", "nfass", "ofass",
    "síntomas", "sintomas", "severidad", "clasificación", "anafilaxia", "anaphylaxis",
    "urticaria", "angioedema", "estridor", "shock", "adrenalina", "epinefrina",
    "gastrointestinal", "náuseas", "vómito", "diarrea", 
    "respiratorio", "sibilancias", "broncoespasmo", "disnea",
    "cardiovascular", "hipotensión", "taquicardia", "colapso",
    "cutáneo", "piel", "prurito", "rash", "eritema",
    "leve", "moderado", "severo", "grave", "crítico",
    "leche", "huevo", "cacahuete", "frutos secos", "pescado", "mariscos", "soja", "trigo",
    "reacción", "episodio", "trigger", "cofactor"
]

def is_on_topic(user_query):
    """Verifica si la consulta está dentro del dominio permitido"""
    query_lower = user_query.lower()
    
    # Verificar palabras clave permitidas
    for topic in ALLOWED_TOPICS:
        if topic in query_lower:
            return True
    
    # Verificar patrones de preguntas médicas relevantes
    medical_patterns = [
        "cómo clasificar", "es grave", "es severo", "es leve",
        "qué nivel", "criterios", "evaluar", "paciente con",
        "cuándo dar", "cuándo usar", "necesita adrenalina",
        "es anafilaxia", "diferencia entre"
    ]
    
    for pattern in medical_patterns:
        if pattern in query_lower:
            return True
    
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