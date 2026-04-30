# src/data_models.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    nombre: str
    email: EmailStr
    especialidad: str
    colegiado: str
    hospital: str
    telefono: str

class EvaluacionRequest(BaseModel):
    id: Optional[int] = None          
    paciente_id: str                   
    fecha_nacimiento: Optional[str] = None  
    genero: str
    medico: str
    respuestas: Dict               
    evento: Dict                    
    sintomas: List[str]              