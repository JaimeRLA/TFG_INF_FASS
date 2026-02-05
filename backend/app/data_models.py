from pydantic import BaseModel
from typing import List

class ReactionRequest(BaseModel):
    nombre: str          # Debe ser 'nombre'
    paciente_id: str     # Debe ser 'paciente_id'
    sintomas: List[str]  # Lista de IDs de síntomas [cite: 1, 12]