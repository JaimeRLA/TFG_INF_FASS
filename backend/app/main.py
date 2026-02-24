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

    placeholder = "%s" if DATABASE_URL else "?"

    cursor.execute("DROP TABLE IF EXISTS registros CASCADE")
    
    # 2. CREACIÓN DE LA TABLA CON TODOS LOS NUEVOS CAMPOS
    cursor.execute('''CREATE TABLE IF NOT EXISTS registros (
        id SERIAL PRIMARY KEY,
        nhc TEXT,
        fecha_nacimiento TEXT,
        genero TEXT,
        medico TEXT,
        respuestas_json TEXT,
        sintomas TEXT,
        nfass REAL,
        ofass_grade INTEGER,
        ofass_category TEXT,
        risk_level TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Tabla de Usuarios
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
        cursor.execute(f"SELECT username FROM usuarios WHERE username = {placeholder}", (request.username,))
        if cursor.fetchone():
            return {"success": False, "message": "El nombre de usuario ya está registrado"}
        
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

import json

@app.post("/calculate")
async def calculate(request: dict):
    # 1. Realizar el cálculo con los síntomas recibidos
    sintomas_ids = request.get("sintomas", [])
    resultado = calcular_nfass_ofass(sintomas_ids)
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"

        # 2. VALIDACIÓN DE SEGURIDAD (Usando Género en lugar de Nombre como verificador)
        cursor.execute(f"SELECT genero FROM registros WHERE nhc = {placeholder} LIMIT 1", (request["paciente_id"],))
        existente = cursor.fetchone()
        
        if existente and existente[0] != request["genero"]:
            return {
                "success": False, 
                "message": f"ALERTA: El NHC {request['paciente_id']} ya está registrado con un género distinto ({existente[0]})."
            }
        
        # 3. Preparar los datos para la inserción
        # Convertimos los objetos a strings (JSON) para que quepan en las celdas de texto
        respuestas_json = json.dumps(request.get("respuestas", {}))
        sintomas_json = json.dumps(sintomas_ids)

        # La consulta ahora tiene 10 campos (ajustada a tu nueva base de datos)
        query = f"""INSERT INTO registros 
                (nhc, fecha_nacimiento, genero, medico, respuestas_json, sintomas, nfass, ofass_grade, ofass_category, risk_level) 
                VALUES ({','.join([placeholder]*10)})"""
        
        cursor.execute(query, (
            request.get("paciente_id", ""), 
            request.get("fecha_nacimiento", ""), 
            request.get("genero", ""), 
            request.get("medico", "desconocido"),
            respuestas_json,
            sintomas_json, 
            float(resultado["nfass"]), 
            int(resultado["ofass_grade"]), 
            resultado["ofass_category"], 
            resultado["risk_level"]
        ))
        conn.commit()
    except Exception as e:
        print(f"Error en base de datos: {e}")
        return {"success": False, "message": str(e)}
    finally:
        conn.close()
    
    # Devolvemos el objeto de resultado al frontend
    return resultado

@app.get("/history")
async def get_history():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM registros ORDER BY fecha DESC')
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    finally:
        conn.close()

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
    
@app.get("/pacientes_unicos")
async def get_pacientes_unicos(medico: str = Query(...)):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        # Usamos DISTINCT para que no salgan nombres repetidos si un paciente tiene varios registros
        query = f"SELECT DISTINCT nombre, paciente_id, edad, sexo, antecedentes FROM registros WHERE medico = {placeholder}"
        cursor.execute(query, (medico,))
        
        pacientes = []
        for row in cursor.fetchall():
            pacientes.append({
                "nombre": row[0],
                "id": row[1],
                "edad": row[2],
                "sexo": row[3],
                "antecedentes": row[4]
            })
        return pacientes
    finally:
        conn.close()