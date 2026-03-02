# backend/app/security.py
import os
import base64
import hashlib
from passlib.context import CryptContext
from cryptography.fernet import Fernet

# 1. Motor para contraseñas (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Generación Robusta de la Llave Fernet
# Leemos la variable de Render. Si no existe, usamos una frase por defecto.
SECRET_PHRASE = os.getenv("ENCRYPTION_KEY", "fass_system_secret_phrase_2026")

# Convertimos cualquier frase en una llave de 32 bytes usando SHA-256
# Esto garantiza que siempre sea válida para Fernet
key_32_bytes = hashlib.sha256(SECRET_PHRASE.encode()).digest()
cipher_key = base64.urlsafe_b64encode(key_32_bytes)
cipher = Fernet(cipher_key)

# --- Funciones de Seguridad ---

def hash_password(password: str):
    clean_password = str(password)[:72]
    return pwd_context.hash(clean_password)

def verify_password(plain_password: str, hashed_password: str):
    clean_password = str(plain_password)[:72]
    try:
        return pwd_context.verify(clean_password, hashed_password)
    except Exception:
        return False

def encrypt_data(text: str):
    if not text: return ""
    return cipher.encrypt(str(text).encode()).decode()

def decrypt_data(token: str):
    if not token: return ""
    try:
        return cipher.decrypt(token.encode()).decode()
    except Exception:
        return str(token) # Si no está cifrado, devuelve el texto tal cual