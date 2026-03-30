# backend/app/security.py
import os
import base64
import hashlib
from datetime import datetime
from passlib.context import CryptContext
from cryptography.fernet import Fernet

# 1. Motor para contraseñas (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Generación de la Llave Fernet (Cifrado Simétrico)
SECRET_PHRASE = os.getenv("ENCRYPTION_KEY", "fass_system_secret_phrase_2026")
key_32_bytes = hashlib.sha256(SECRET_PHRASE.encode()).digest()
cipher_key = base64.urlsafe_b64encode(key_32_bytes)
cipher = Fernet(cipher_key)

# --- NUEVAS FUNCIONES PARA PSEUDONIMIZACIÓN Y MINIMIZACIÓN ---

def generate_pseudonym(nhc: str):
    """
    Transforma el NHC en un token irreversible (Hash SHA-256).
    Esto es PSEUDONIMIZACIÓN técnica. No usa la llave Fernet,
    por lo que es imposible recuperar el NHC original.
    """
    if not nhc: return ""
    return hashlib.sha256(str(nhc).encode()).hexdigest()

def get_age_range(dob_str: str):
    """
    Convierte una fecha exacta en un rango etario.
    Esto es MINIMIZACIÓN de datos. Evitamos guardar la fecha exacta
    para reducir el riesgo de re-identificación.
    """
    try:
        birth_date = datetime.strptime(dob_str, "%Y-%m-%d")
        today = datetime.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        if age < 18: return "Pediatría (<18)"
        if age < 30: return "18-29"
        if age < 50: return "30-49"
        if age < 70: return "50-69"
        return "70+"
    except Exception:
        return "Rango no determinado"

# --- Funciones de Seguridad Existentes ---

def hash_password(password: str):
    clean_pwd = str(password or "")[:72]
    return pwd_context.hash(clean_pwd)

def verify_password(plain_password: str, hashed_password: str):
    if not hashed_password or not plain_password: return False
    clean_pwd = str(plain_password or "")[:72]
    try:
        return pwd_context.verify(clean_pwd, str(hashed_password))
    except Exception:
        return False

def encrypt_data(text: str):
    """Cifrado Fernet para contenido clínico (Síntomas/Notas)"""
    if not text: return ""
    return cipher.encrypt(str(text).encode()).decode('utf-8')

def decrypt_data(token: str):
    """Descifrado Fernet para mostrar historial al médico"""
    if not token: return ""
    try:
        return cipher.decrypt(token.encode()).decode()
    except Exception:
        return str(token)