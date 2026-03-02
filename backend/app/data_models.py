# src/data_models.py
from pydantic import BaseModel
from typing import List, Optional, Dict

class LoginRequest(BaseModel):
    username: str
    password: str

class EvaluacionRequest(BaseModel):
    id: Optional[int] = None  # Puede ser None si es un registro nuevo
    paciente_id: str
    fecha_nacimiento: str
    genero: str
    medico: str
    respuestas: Dict          # Los Antecedentes (q1, q2...)
    evento: Dict              # Detalles de la reacción
    sintomas: List[str]       # Lista de IDs de síntomas seleccionados