# src/data_models.py
from pydantic import BaseModel
from typing import List, Optional, Dict

class LoginRequest(BaseModel):
    username: str
    password: str

class EvaluacionRequest(BaseModel):
    id: Optional[int] = None           # ID de la EVALUACIÓN (para el UPDATE)
    paciente_id: str                   # Aquí el Frontend enviará el NHC (si es nuevo) o el HASH (si ya existe)
    fecha_nacimiento: Optional[str] = None  # Opcional, porque si el paciente ya existe, no la volvemos a enviar
    genero: str
    medico: str
    respuestas: Dict                   # Los Antecedentes (q1, q2...)
    evento: Dict                       # Detalles de la reacción
    sintomas: List[str]                # Lista de IDs de síntomas seleccionados