"""
Base de conocimiento del asistente FASS.
Cubre dos dominios principales:
  1. Uso de la aplicación (flujos, pantallas, funcionalidades)
  2. Conceptos técnicos y clínicos de la escala FASS
"""

# ---------------------------------------------------------------------------
# 1. USO DE LA APLICACIÓN
# ---------------------------------------------------------------------------

APP_USAGE = {

    "registro_medico": {
        "titulo": "Cómo registrarse en el sistema",
        "pasos": [
            "Accede a la pantalla de Login y pulsa 'Solicitar acceso'.",
            "Rellena el formulario con nombre, email, especialidad, número de colegiado, hospital y teléfono.",
            "Pulsa 'Enviar solicitud'. El administrador del sistema recibirá un aviso por email.",
            "Una vez que el administrador apruebe tu solicitud, recibirás tus credenciales (usuario y contraseña temporal) en el email proporcionado.",
            "Inicia sesión con esas credenciales en la pantalla de Login."
        ],
        "notas": [
            "No es posible crearse una cuenta sin aprobación previa del administrador.",
            "Si ya tienes cuenta activa con ese email, el sistema te lo indicará.",
            "Si enviaste una solicitud y no recibes respuesta, puedes volver a enviarla y se sobreescribirá la anterior."
        ]
    },

    "login": {
        "titulo": "Cómo iniciar sesión",
        "pasos": [
            "En la pantalla de Login, introduce tu email y la contraseña recibida por correo.",
            "Pulsa 'Entrar'.",
            "Si las credenciales son correctas, accederás al menú principal."
        ],
        "notas": [
            "La sesión se mantiene mientras el navegador esté abierto (sessionStorage).",
            "Al cerrar el navegador o la pestaña, la sesión se cierra automáticamente.",
            "Si olvidas tu contraseña, contacta con el administrador del sistema."
        ]
    },

    "nueva_evaluacion": {
        "titulo": "Cómo registrar una nueva evaluación clínica",
        "pasos": [
            "1. SELECCIONAR PACIENTE: Introduce el NHC del paciente. Si ya existe en el sistema, se cargará su perfil. Si es nuevo, introduce su fecha de nacimiento y género.",
            "2. ANTECEDENTES: Rellena el formulario de antecedentes (alergias conocidas, tratamientos previos, comorbilidades).",
            "3. EVENTO: Describe el evento actual (fecha, alimento sospechoso, tiempo de reacción, tratamiento administrado).",
            "4. SÍNTOMAS: Selecciona todos los síntomas observados en la calculadora. Están organizados por sistema orgánico.",
            "5. PUNTUACIÓN: Revisa el resultado nFASS/oFASS generado automáticamente y confirma el registro."
        ],
        "notas": [
            "El NHC nunca se almacena directamente; se guarda su hash SHA-256 (pseudonimización).",
            "Puedes navegar hacia atrás en el flujo para corregir datos antes de confirmar.",
            "Una vez confirmada, la evaluación queda guardada en el historial del paciente."
        ]
    },

    "calculadora_sintomas": {
        "titulo": "Cómo usar la calculadora de síntomas",
        "descripcion": "La pantalla de calculadora muestra todos los síntomas agrupados por sistema orgánico (cutáneo, respiratorio, cardiovascular, gastrointestinal, neurológico). Debes marcar ÚNICAMENTE los síntomas que el paciente presenta en este episodio.",
        "consejos": [
            "Marca solo los síntomas observados en la evaluación actual, no los antecedentes.",
            "Si un síntoma es dudoso, es preferible no marcarlo.",
            "El sistema calcula automáticamente nFASS y oFASS al pulsar 'Calcular'.",
            "Puedes volver atrás y modificar los síntomas antes de confirmar."
        ]
    },

    "historial": {
        "titulo": "Cómo consultar el historial de un paciente",
        "pasos": [
            "Accede a 'Historial' desde el menú principal.",
            "Busca al paciente por su NHC.",
            "Se mostrarán todas las evaluaciones previas ordenadas por fecha.",
            "Puedes ver el detalle de cada evaluación, incluyendo síntomas, scores y nivel de riesgo."
        ],
        "exportacion": [
            "Desde el historial puedes exportar los datos en formato PDF o CSV.",
            "El PDF incluye un resumen clínico del episodio.",
            "El CSV permite importar los datos en herramientas externas."
        ],
        "eliminar": [
            "Puedes eliminar una evaluación pulsando el icono de borrar en el registro correspondiente.",
            "Solo puedes eliminar evaluaciones que tú mismo hayas registrado.",
            "La eliminación es permanente y no puede deshacerse."
        ]
    },

    "dashboard": {
        "titulo": "Qué muestra el dashboard",
        "descripcion": "El dashboard muestra estadísticas agregadas de tus evaluaciones: distribución por grado oFASS, número de pacientes, evolución temporal y alérgenos más frecuentes.",
        "notas": [
            "Solo se muestran datos de evaluaciones registradas por ti.",
            "Puedes filtrar por rango temporal (último mes, último año, todo)."
        ]
    },

    "chatbot": {
        "titulo": "Para qué sirve el asistente de IA",
        "descripcion": "El asistente está especializado en alergias alimentarias y en el uso de la aplicación FASS. Puedes preguntarle sobre cómo usar cualquier funcionalidad, qué significa un resultado, o conceptos clínicos de la escala FASS.",
        "limitaciones": [
            "El asistente NO puede responder preguntas fuera del ámbito de alergias alimentarias y del uso de esta aplicación.",
            "No sustituye el criterio clínico del médico.",
            "No tiene acceso a los datos de tus pacientes."
        ]
    },

    "seguridad_datos": {
        "titulo": "Cómo se protegen los datos clínicos",
        "descripcion": "El sistema aplica varias capas de protección:",
        "medidas": [
            "El NHC del paciente se pseudonimiza con SHA-256. Nunca se almacena en claro.",
            "Los campos clínicos (síntomas, antecedentes, evento) se cifran con AES-128-CBC (Fernet) antes de guardarse en la base de datos.",
            "Las contraseñas se almacenan como hashes bcrypt irreversibles.",
            "Toda la comunicación se realiza por HTTPS.",
            "Los endpoints clínicos requieren autenticación mediante token JWT (Bearer token)."
        ]
    }
}

# ---------------------------------------------------------------------------
# 2. ESCALA FASS — CONCEPTOS TÉCNICOS Y CLÍNICOS
# ---------------------------------------------------------------------------

FASS_CONCEPTS = {

    "que_es_fass": {
        "titulo": "¿Qué es la escala FASS?",
        "descripcion": (
            "FASS (Food Allergy Severity Score) es una escala clínica para evaluar la gravedad "
            "de reacciones alérgicas alimentarias. Se presenta en dos formatos: "
            "nFASS (score numérico continuo) y oFASS (grado ordinal 1-5)."
        )
    },

    "nfass": {
        "titulo": "¿Qué es nFASS?",
        "descripcion": (
            "El nFASS es un score numérico continuo que cuantifica la severidad de una reacción. "
            "Se calcula aplicando una transformación logarítmica sobre la suma ponderada de los síntomas "
            "por sistema orgánico: nFASS = log2(Σ nFASSórgano) + 2, "
            "donde nFASSórgano = 2^ε × (1 + Σλ_síntoma). "
            "ε es el peso del sistema orgánico y λ el peso de cada síntoma."
        ),
        "interpretacion": [
            "Valores bajos (≈2-4): reacción leve, afectación de uno o pocos sistemas con síntomas leves.",
            "Valores medios (≈5-7): reacción moderada-severa, varios sistemas afectados.",
            "Valores altos (>8): reacción muy severa o anafilaxia, múltiples sistemas afectados con síntomas graves."
        ]
    },

    "ofass": {
        "titulo": "¿Qué es oFASS?",
        "descripcion": "El oFASS es la clasificación ordinal derivada del nFASS, expresada en 5 grados:",
        "grados": {
            "1": {"categoria": "Mild", "descripcion": "Reacción leve localizada, sin compromiso sistémico."},
            "2": {"categoria": "Moderate", "descripcion": "Síntomas en más de un sistema, sin compromiso vital."},
            "3": {"categoria": "Severe", "descripcion": "Síntomas severos en múltiples sistemas, puede requerir adrenalina."},
            "4": {"categoria": "Very Severe", "descripcion": "Compromiso severo multisistémico, requiere tratamiento urgente."},
            "5": {"categoria": "Anaphylaxis", "descripcion": "Anafilaxia con compromiso cardiovascular o respiratorio grave."}
        }
    },

    "sistemas_organicos": {
        "titulo": "Sistemas orgánicos evaluados",
        "descripcion": "La escala evalúa síntomas en 5 sistemas orgánicos, cada uno con su peso ε:",
        "sistemas": {
            "cutaneo": {"epsilon": 1, "ejemplos": ["urticaria", "angioedema", "eritema", "prurito"]},
            "gastrointestinal": {"epsilon": 2, "ejemplos": ["náuseas", "vómitos", "diarrea", "dolor abdominal"]},
            "respiratorio": {"epsilon": 3, "ejemplos": ["rinorrea", "sibilancias", "broncoespasmo", "estridor"]},
            "cardiovascular": {"epsilon": 4, "ejemplos": ["hipotensión", "taquicardia", "síncope", "shock"]},
            "neurologico": {"epsilon": 3, "ejemplos": ["cefalea", "mareo", "pérdida de conciencia"]}
        }
    },

    "anafilaxia": {
        "titulo": "Criterios de anafilaxia",
        "descripcion": "Se considera anafilaxia (oFASS grado 5) cuando hay compromiso cardiovascular grave o respiratorio severo tras exposición al alérgeno:",
        "criterios": [
            "Hipotensión severa o shock.",
            "Broncoespasmo grave o estridor.",
            "Pérdida o disminución de conciencia.",
            "Combinación de síntomas en múltiples sistemas con progresión rápida."
        ],
        "tratamiento": "Requiere adrenalina intramuscular inmediata (0.3-0.5 mg en muslo anterolateral). Llamar al 112."
    },

    "seleccion_sintomas": {
        "titulo": "Criterios para seleccionar síntomas en la calculadora",
        "descripcion": "Solo se deben marcar los síntomas presentes en el episodio actual que se está evaluando:",
        "reglas": [
            "Marca únicamente lo que el paciente presenta ahora, no antecedentes.",
            "Si un síntoma es leve y transitorio (ej: picor oral breve), se puede incluir si fue parte del episodio.",
            "En caso de duda entre dos síntomas de distinta gravedad del mismo sistema, selecciona el más representativo del momento de la reacción.",
            "No acumules síntomas de episodios distintos en una misma evaluación."
        ]
    }
}

# ---------------------------------------------------------------------------
# 3. PREGUNTAS FRECUENTES (FAQ)
# ---------------------------------------------------------------------------

FAQ = {
    "¿Cómo busco un paciente existente?": (
        "En la pantalla 'Seleccionar Paciente', introduce el NHC del paciente. "
        "El sistema calculará su hash internamente y buscará si ya existe un registro. "
        "Si existe, mostrará su perfil. Si no, te pedirá los datos para crear uno nuevo."
    ),
    "¿Por qué no puedo eliminar una evaluación de otro médico?": (
        "Por diseño de seguridad, cada médico solo puede eliminar las evaluaciones que él mismo ha registrado. "
        "Si necesitas eliminar un registro de otro facultativo, contacta con el administrador."
    ),
    "¿Qué significa que el NHC se pseudonimiza?": (
        "El NHC nunca se guarda directamente en la base de datos. "
        "En su lugar se almacena su huella SHA-256, que es una cadena irreversible. "
        "Esto significa que, aunque alguien accediera a la base de datos, no podría recuperar el NHC real."
    ),
    "¿Puedo acceder desde varios dispositivos?": (
        "Sí, la aplicación es una web accesible desde cualquier navegador. "
        "Ten en cuenta que la sesión se guarda en sessionStorage, por lo que al cerrar el navegador tendrás que volver a iniciar sesión."
    ),
    "¿Cómo interpreto un nFASS de 6.5?": (
        "Un nFASS de 6.5 corresponde a una reacción de severidad moderada-alta (oFASS grado 3, Severe). "
        "Implica afectación de varios sistemas orgánicos con síntomas significativos. "
        "Revisa el grado oFASS asignado y el nivel de riesgo que muestra la pantalla de Puntuación."
    ),
    "¿Qué hago si el asistente no responde a mi pregunta?": (
        "El asistente solo responde preguntas sobre alergias alimentarias, la escala FASS y el uso de esta aplicación. "
        "Si tu duda es técnica o de administración del sistema, contacta con el administrador."
    ),
    "¿Los datos del paciente están seguros?": (
        "Sí. Los datos clínicos se cifran con AES-128-CBC antes de guardarse. "
        "El NHC se pseudonimiza con SHA-256. Las contraseñas se hashean con bcrypt. "
        "Toda la comunicación va por HTTPS."
    ),
    "¿Cómo exporto el historial a PDF?": (
        "En la pantalla de Historial, busca al paciente y pulsa el botón de exportar PDF. "
        "Se generará un documento con el resumen clínico de todas sus evaluaciones."
    ),
    "¿Qué diferencia hay entre nFASS y oFASS?": (
        "nFASS es un score numérico continuo que resulta del cálculo matemático sobre los síntomas seleccionados. "
        "oFASS es la clasificación ordinal en grados 1-5 (Mild a Anaphylaxis) derivada del nFASS. "
        "Ambos se calculan automáticamente al confirmar los síntomas."
    ),
    "¿Cuándo debo usar adrenalina?": (
        "Cuando el paciente presenta signos de anafilaxia: hipotensión, broncoespasmo grave, estridor o pérdida de conciencia. "
        "Corresponde a oFASS grado 5. La adrenalina intramuscular (0.3-0.5 mg) es el tratamiento de elección. Llama al 112."
    )
}

# ---------------------------------------------------------------------------
# 4. FUNCIONES DE ACCESO
# ---------------------------------------------------------------------------

def get_app_usage(topic: str = None):
    if topic:
        return APP_USAGE.get(topic)
    return APP_USAGE

def get_fass_concept(concept: str = None):
    if concept:
        return FASS_CONCEPTS.get(concept)
    return FASS_CONCEPTS

def get_faq(question_fragment: str = None):
    if not question_fragment:
        return FAQ
    q_lower = question_fragment.lower()
    results = {k: v for k, v in FAQ.items() if any(w in k.lower() or w in v.lower() for w in q_lower.split())}
    return results if results else FAQ

def search_knowledge(query: str):
    """Búsqueda unificada en toda la base de conocimiento."""
    q = query.lower()
    results = []

    for key, val in FAQ.items():
        if any(w in key.lower() or w in val.lower() for w in q.split() if len(w) > 3):
            results.append({"tipo": "faq", "pregunta": key, "respuesta": val})

    for key, val in APP_USAGE.items():
        titulo = val.get("titulo", "")
        if any(w in titulo.lower() or w in key.lower() for w in q.split() if len(w) > 3):
            results.append({"tipo": "uso_app", "tema": key, "titulo": titulo})

    for key, val in FASS_CONCEPTS.items():
        titulo = val.get("titulo", "")
        if any(w in titulo.lower() or w in key.lower() for w in q.split() if len(w) > 3):
            results.append({"tipo": "concepto_fass", "tema": key, "titulo": titulo})

    return results

def get_severity_guidance(organ_system=None):
    """Compatibilidad con el import existente en agent_logic."""
    if organ_system:
        return FASS_CONCEPTS["sistemas_organicos"]["sistemas"].get(organ_system)
    return FASS_CONCEPTS["ofass"]["grados"]

# Compatibilidad con el dict KNOWLEDGE_BASE usado en agent_logic (get_severity_guidance lo sustituye)
KNOWLEDGE_BASE = {
    "app_usage": APP_USAGE,
    "fass_concepts": FASS_CONCEPTS,
    "faq": FAQ
}
