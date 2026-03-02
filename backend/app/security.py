# backend/app/security.py
import os
from passlib.context import CryptContext
from cryptography.fernet import Fernet

# Forzamos el uso de bcrypt de forma explícita
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Gestión de la llave de cifrado
SECRET_KEY = os.getenv("ENCRYPTION_KEY", "llave_por_defecto_de_32_caracteres_!")
# Aseguramos que la llave tenga el formato correcto para Fernet
if len(SECRET_KEY) < 32:
    SECRET_KEY = SECRET_KEY.ljust(32)[:32]
import base64
cipher_key = base64.urlsafe_b64encode(SECRET_KEY.encode())
cipher = Fernet(cipher_key)

def hash_password(password: str):
    # Convertimos a string por si acaso y truncamos a 72 para evitar el límite de bcrypt
    clean_password = str(password)[:72]
    return pwd_context.hash(clean_password)

def verify_password(plain_password: str, hashed_password: str):
    # Verificación segura
    clean_password = str(plain_password)[:72]
    try:
        return pwd_context.verify(clean_password, hashed_password)
    except Exception:
        return False

def encrypt_data(text: str):
    return cipher.encrypt(str(text).encode()).decode()

def decrypt_data(token: str):
    try:
        return cipher.decrypt(token.encode()).decode()
    except Exception:
        return str(token) # Si falla, devolvemos el original