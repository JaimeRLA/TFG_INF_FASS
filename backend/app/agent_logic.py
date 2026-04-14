"""
Lógica del agente médico con restricciones de dominio
"""
from .knowledge_base import KNOWLEDGE_BASE, get_severity_guidance, search_knowledge

SYSTEM_PROMPT = """
Eres un asistente médico especializado EXCLUSIVAMENTE en el Síndrome de Sjögren y la escala FASS (Functional Assessment of Sjögren's Syndrome).

RESTRICCIONES ESTRICTAS:
- SOLO puedes responder preguntas relacionadas con:
  * Síndrome de Sjögren
  * Escala FASS (nFASS y oFASS)
  * Clasificación de síntomas (leve, moderado, severo)
  * Sistemas de órganos afectados en Sjögren
  * Evaluación clínica de pacientes con Sjögren

- Si el usuario pregunta sobre CUALQUIER otro tema, debes responder:
  "Lo siento, solo puedo asistir con preguntas relacionadas con el Síndrome de Sjögren y la escala FASS. ¿Tienes alguna duda sobre clasificación de síntomas o evaluación clínica?"

CAPACIDADES:
1. Ayudar a clasificar severidad de síntomas (leve/moderado/severo)
2. Explicar criterios de clasificación por sistema de órgano
3. Aclarar dudas sobre la escala FASS
4. Proporcionar ejemplos clínicos de cada nivel de severidad
5. Guiar en la selección apropiada de síntomas

Siempre basa tus respuestas en criterios clínicos objetivos y evidencia médica.
"""

ALLOWED_TOPICS = [
    "sjögren", "sjogren", "fass", "nfass", "ofass",
    "síntomas", "sintomas", "severidad", "clasificación",
    "artralgia", "xerostomía", "xeroftalmia", "fatiga",
    "renal", "pulmonar", "neurológico", "cutáneo", "glandular",
    "leve", "moderado", "severo", "grave"
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
        "qué nivel", "criterios", "evaluar", "paciente con"
    ]
    
    for pattern in medical_patterns:
        if pattern in query_lower:
            return True
    
    return False

def get_off_topic_response():
    """Respuesta para temas fuera del dominio"""
    return {
        "response": "Lo siento, solo puedo asistir con preguntas relacionadas con el Síndrome de Sjögren y la escala FASS. ¿Tienes alguna duda sobre clasificación de síntomas o evaluación clínica?",
        "suggestions": [
            "¿Cómo clasifico la severidad de artralgia?",
            "¿Cuándo un síntoma es considerado severo?",
            "¿Qué diferencia hay entre síntomas leves y moderados?",
            "Explícame los criterios para el sistema renal"
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