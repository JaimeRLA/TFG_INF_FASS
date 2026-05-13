# backend/app/security.py
import os
import base64
import hashlib
from passlib.context import CryptContext
from cryptography.fernet import Fernet

# 1. Motor para contraseñas (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Generación de la Llave Fernet (Cifrado Simétrico)
SECRET_PHRASE = os.getenv("ENCRYPTION_KEY", "")
if not SECRET_PHRASE:
    SECRET_PHRASE = "fass_system_secret_phrase_2026"
    print("⚠️  ADVERTENCIA: ENCRYPTION_KEY no configurada. Usando clave por defecto (INSEGURO EN PRODUCCIÓN)")

key_32_bytes = hashlib.sha256(SECRET_PHRASE.encode()).digest()
cipher_key = base64.urlsafe_b64encode(key_32_bytes)
cipher = Fernet(cipher_key)

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
    """Cifrado Fernet para contenido clínico"""
    if not text: return ""
    return cipher.encrypt(str(text).encode()).decode('utf-8')

def decrypt_data(token: str):
    """Descifrado Fernet para mostrar historial al médico. Lanza excepción si el token es inválido."""
    if not token: return ""
    return cipher.decrypt(token.encode()).decode()
