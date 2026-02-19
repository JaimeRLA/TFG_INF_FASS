import sqlite3
import os
import json
import psycopg2 
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from .logic import calcular_nfass_ofass
from .data_models import ReactionRequest
from .prompt import SYSTEM_PROMPT
from pydantic import BaseModel

app = FastAPI()

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tfg-inf-fass-1.onrender.com", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- BASE DE DATOS ---
DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return sqlite3.connect(os.path.join(os.path.dirname(__file__), "fass_database.db"))

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Marcador de posición dinámico para la semilla inicial
    placeholder = "%s" if DATABASE_URL else "?"

    # Tabla de Registros Clínicos
    query_registros = '''CREATE TABLE IF NOT EXISTS registros (
                id SERIAL PRIMARY KEY, nombre TEXT, paciente_id TEXT, 
                sintomas TEXT, nfass REAL, ofass_grade INTEGER, 
                ofass_category TEXT, risk_level TEXT, fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'''
    
    # Tabla de Usuarios (Médicos)
    query_usuarios = '''CREATE TABLE IF NOT EXISTS usuarios (
                        id SERIAL PRIMARY KEY, 
                        username TEXT UNIQUE, 
                        password TEXT)'''

    if not DATABASE_URL:
        query_registros = query_registros.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
        query_usuarios = query_usuarios.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
    
    cursor.execute(query_registros)
    cursor.execute(query_usuarios)
    
    # Usuario médico por defecto
    try:
        cursor.execute(f"INSERT INTO usuarios (username, password) VALUES ({placeholder}, {placeholder})", 
                       ("medico_fass", "tfg2024"))
    except:
        pass 
    
    conn.commit()
    conn.close()

init_db()

# --- MODELOS DE DATOS ---
class LoginRequest(BaseModel):
    username: str
    password: str

# --- ENDPOINTS DE AUTENTICACIÓN ---

@app.post("/register")
async def register(request: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor()
    placeholder = "%s" if DATABASE_URL else "?"
    try:
        # Verificar existencia
        cursor.execute(f"SELECT username FROM usuarios WHERE username = {placeholder}", (request.username,))
        if cursor.fetchone():
            return {"success": False, "message": "El nombre de usuario ya está registrado"}
        
        # Insertar nuevo usuario
        cursor.execute(f"INSERT INTO usuarios (username, password) VALUES ({placeholder}, {placeholder})", 
                       (request.username, request.password))
        conn.commit()
        return {"success": True, "message": "Registro completado con éxito"}
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        conn.close()

@app.post("/login")
async def login(request: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor()
    placeholder = "%s" if DATABASE_URL else "?"
    
    query = f"SELECT username FROM usuarios WHERE username = {placeholder} AND password = {placeholder}"
    
    cursor.execute(query, (request.username, request.password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {"success": True, "message": "Acceso concedido", "username": user[0]}
    return {"success": False, "message": "Usuario o contraseña incorrectos"}

# --- ENDPOINTS CLÍNICOS ---

# Modifica el endpoint de guardado en main.py
@app.post("/calculate")
async def calculate(request: ReactionRequest, medico: str = Query(...)):
    resultado = calcular_nfass_ofass(request.sintomas)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        # Añadimos 'medico' a la consulta (necesitarás añadir la columna a la DB o recrearla)
        query = f"INSERT INTO registros (nombre, paciente_id, sintomas, nfass, ofass_grade, ofass_category, risk_level, medico) VALUES ({','.join([placeholder]*8)})"
        cursor.execute(query, (request.nombre, request.paciente_id, json.dumps(request.sintomas), float(resultado["nfass"]), int(resultado["ofass_grade"]), resultado["ofass_category"], resultado["risk_level"], medico))
        conn.commit()
    finally: conn.close()
    return resultado

# Modifica el historial para que solo devuelva lo del médico actual
@app.get("/history")
async def get_history(medico: str = Query(...)):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        cursor.execute(f'SELECT * FROM registros WHERE medico = {placeholder} ORDER BY fecha DESC', (medico,))
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    finally: conn.close()

# --- ASISTENTE IA ---

@app.get("/chat")
async def chat_asistente(user_message: str = Query(...)):
    key = os.getenv("GROQ_API_KEY")
    if not key:
        return {"response": "Error: Groq API Key no configurada."}
    try:
        client = Groq(api_key=key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT}, 
                {"role": "user", "content": user_message}
            ],
            timeout=25.0
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        return {"response": f"Error del asistente: {str(e)}"}
