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
    # Forzamos la conversión a string y nos aseguramos de que no sea None
    clean_pwd = str(password or "")[:72]
    
    # IMPORTANTE: Usamos el método directo del contexto para evitar errores de tipo
    return pwd_context.hash(clean_pwd)

def verify_password(plain_password: str, hashed_password: str):
    if not hashed_password or not plain_password:
        return False
    
    # Limpiamos la entrada igual que al crear el hash
    clean_pwd = str(plain_password or "")[:72]
    
    try:
        # Verificación explícita
        return pwd_context.verify(clean_pwd, str(hashed_password))
    except Exception as e:
        print(f"Error de verificación: {e}")
        return False

def encrypt_data(text: str):
    if not text: return ""
    # Aseguramos que el resultado sea siempre un string para la DB
    return cipher.encrypt(str(text).encode()).decode('utf-8')

def decrypt_data(token: str):
    if not token: return ""
    try:
        return cipher.decrypt(token.encode()).decode()
    except Exception:
        return str(token) # Si no está cifrado, devuelve el texto tal cual