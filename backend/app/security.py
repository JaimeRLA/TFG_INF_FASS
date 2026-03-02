# src/security.py
import os
from passlib.context import CryptContext
from cryptography.fernet import Fernet

# Motor para contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Motor para datos (NHC, Antecedentes)
# La llave se lee de Render. Si no existe, se usa una de respaldo (solo para local)
SECRET_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher = Fernet(SECRET_KEY.encode())

# Funciones de Contraseña
def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# Funciones de Datos
def encrypt_data(text):
    return cipher.encrypt(text.encode()).decode()

def decrypt_data(token):
    return cipher.decrypt(token.encode()).decode()