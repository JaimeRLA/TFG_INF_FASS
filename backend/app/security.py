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

# backend/app/security.py

def hash_password(password: str):
    # 1. Aseguramos que sea string
    pwd = str(password)
    # 2. Cortamos a 72 por límite de algoritmo
    pwd = pwd[:72]
    # 3. Lo convertimos a bytes y luego otra vez a string limpio
    # Esto elimina cualquier carácter oculto que confunda a Bcrypt
    clean_pwd = pwd.encode('utf-8').decode('utf-8')
    
    return pwd_context.hash(clean_pwd)

def verify_password(plain_password: str, hashed_password: str):
    if not hashed_password or not plain_password:
        return False
    try:
        # Repetimos la limpieza para la verificación
        pwd = str(plain_password)[:72]
        clean_pwd = pwd.encode('utf-8').decode('utf-8')
        
        return pwd_context.verify(clean_pwd, hashed_password)
    except Exception as e:
        print(f"Error en verificación: {e}")
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