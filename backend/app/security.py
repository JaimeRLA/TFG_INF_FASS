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


def hash_password(password: str):
    # Forzamos a que sea string y luego truncamos
    pw_str = str(password)
    return pwd_context.hash(pw_str[:72])

def verify_password(plain_password: str, hashed_password: str):
    # Forzamos a que sea string el password que llega del login
    pw_str = str(plain_password)
    return pwd_context.invoke_hash(hashed_password).verify(pw_str[:72])

# Funciones de Datos
def encrypt_data(text):
    return cipher.encrypt(text.encode()).decode()

def decrypt_data(token):
    return cipher.decrypt(token.encode()).decode()