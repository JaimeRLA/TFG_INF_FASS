import sqlite3
import os
import json
import psycopg2 
from fastapi import FastAPI, Query, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from .logic import calcular_nfass_ofass
from .prompt import SYSTEM_PROMPT
from pydantic import BaseModel
from .data_models import LoginRequest, EvaluacionRequest
from .security import hash_password, verify_password, encrypt_data, decrypt_data

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
# Intenta leer la clave desde Render, si no existe usa la de local
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY")

def get_connection():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return sqlite3.connect(os.path.join(os.path.dirname(__file__), "fass_database.db"))

def init_db():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # Tabla de Registros Clínicos (TEXT para soportar cifrado Fernet)
        cursor.execute('''CREATE TABLE IF NOT EXISTS registros (
            id SERIAL PRIMARY KEY,
            nhc TEXT,
            fecha_nacimiento TEXT,
            genero TEXT,
            medico TEXT,
            respuestas_json TEXT,
            evento_json TEXT,
            sintomas TEXT,
            nfass REAL,
            ofass_grade INTEGER,
            ofass_category TEXT,
            risk_level TEXT,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        # Tabla de Usuarios
        cursor.execute('''CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT
        )''')
        conn.commit()
    except Exception as e:
        print(f"Error en init_db: {e}")
    finally:
        conn.close()

init_db()

# --- ENDPOINTS DE PACIENTES ---

@app.get("/pacientes_unicos")
async def get_pacientes_unicos(medico: str = Query(...), x_tfg_key: str = Header(None)):
    if x_tfg_key != APP_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Acceso no autorizado")

    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        query = f"SELECT nhc, fecha_nacimiento, genero FROM registros WHERE medico = {placeholder}"
        cursor.execute(query, (medico,))
        
        pacientes_dict = {}
        for row in cursor.fetchall():
            nhc_real = decrypt_data(row[0])
            if nhc_real not in pacientes_dict:
                pacientes_dict[nhc_real] = {
                    "id": nhc_real,
                    "fecha_nacimiento": decrypt_data(row[1]),
                    "genero": decrypt_data(row[2])
                }
        return list(pacientes_dict.values())
    finally:
        conn.close()

# --- ENDPOINTS DE AUTENTICACIÓN ---

@app.post("/register")
async def register(request: LoginRequest):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        cursor.execute(f"SELECT username FROM usuarios WHERE username = {placeholder}", (request.username,))
        if cursor.fetchone():
            return {"success": False, "message": "El nombre de usuario ya existe"}
        
        hashed_pw = hash_password(request.password) 
        cursor.execute(f"INSERT INTO usuarios (username, password) VALUES ({placeholder}, {placeholder})", 
                       (request.username, hashed_pw))
        conn.commit()
        return {"success": True, "message": "Registro completado"}
    finally:
        conn.close()

@app.post("/login")
async def login(request: LoginRequest):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        cursor.execute(f"SELECT username, password FROM usuarios WHERE username = {placeholder}", (request.username,))
        user = cursor.fetchone()
        if user and verify_password(request.password, user[1]): 
            return {"success": True, "username": user[0]}
        return {"success": False, "message": "Credenciales inválidas"}
    finally:
        conn.close()

# --- ENDPOINTS CLÍNICOS ---
@app.get("/history")
async def get_history():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # Seleccionamos todo sin filtrar por médico ni requerir headers
        cursor.execute('SELECT * FROM registros ORDER BY fecha DESC')
        
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        resultados = []
        for row in rows:
            reg = dict(zip(columns, row))
            try:
                # Descifrado completo para visualización
                reg["nhc"] = decrypt_data(reg["nhc"])
                reg["fecha_nacimiento"] = decrypt_data(reg["fecha_nacimiento"])
                reg["genero"] = decrypt_data(reg["genero"])
                reg["respuestas_json"] = json.loads(decrypt_data(reg["respuestas_json"]))
                reg["evento_json"] = json.loads(decrypt_data(reg["evento_json"]))
                reg["sintomas"] = json.loads(decrypt_data(reg["sintomas"]))
            except Exception:
                # Fallback para datos antiguos o que no estén cifrados
                try:
                    reg["respuestas_json"] = json.loads(reg["respuestas_json"])
                    reg["evento_json"] = json.loads(reg["evento_json"])
                    reg["sintomas"] = json.loads(reg["sintomas"])
                except: 
                    pass
            
            resultados.append(reg)
        return resultados
    finally:
        conn.close()

@app.post("/calculate")
async def calculate(request: EvaluacionRequest):
    resultado = calcular_nfass_ofass(request.sintomas)
    
    # Cifrado simétrico de datos PII (Personally Identifiable Information)
    nhc_c = encrypt_data(str(request.paciente_id))
    fecha_n_c = encrypt_data(str(request.fecha_nacimiento))
    genero_c = encrypt_data(str(request.genero))
    respuestas_c = encrypt_data(json.dumps(request.respuestas))
    evento_c = encrypt_data(json.dumps(request.evento))
    sintomas_c = encrypt_data(json.dumps(request.sintomas))

    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        
        if request.id and int(request.id) > 0:
            query = f"""UPDATE registros SET 
                        nhc={placeholder}, fecha_nacimiento={placeholder}, genero={placeholder}, 
                        medico={placeholder}, respuestas_json={placeholder}, evento_json={placeholder}, 
                        sintomas={placeholder}, nfass={placeholder}, ofass_grade={placeholder}, 
                        ofass_category={placeholder}, risk_level={placeholder}
                        WHERE id={placeholder}"""
            cursor.execute(query, (nhc_c, fecha_n_c, genero_c, request.medico, respuestas_c, 
                                   evento_c, sintomas_c, float(resultado["nfass"]), 
                                   int(resultado["ofass_grade"]), resultado["ofass_category"], 
                                   resultado["risk_level"], int(request.id)))
        else:
            query = f"""INSERT INTO registros (nhc, fecha_nacimiento, genero, medico, respuestas_json, 
                        evento_json, sintomas, nfass, ofass_grade, ofass_category, risk_level) 
                        VALUES ({','.join([placeholder]*11)})"""
            cursor.execute(query, (nhc_c, fecha_n_c, genero_c, request.medico, respuestas_c, 
                                   evento_c, sintomas_c, float(resultado["nfass"]), 
                                   int(resultado["ofass_grade"]), resultado["ofass_category"], 
                                   resultado["risk_level"]))
        conn.commit()
        return {**resultado, "success": True}
    except Exception as e:
        if conn: conn.rollback()
        return {"success": False, "message": f"Error persistencia: {str(e)}"}
    finally:
        conn.close()

@app.delete("/evaluacion/{id_evaluacion}")
async def eliminar_registro(id_evaluacion: int, medico: str = Query(...), x_tfg_key: str = Header(None)):
    if x_tfg_key != APP_SECRET_KEY:
        raise HTTPException(status_code=401, detail="No autorizado")

    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        
        # Validación de propiedad (Ownership check)
        cursor.execute(f"SELECT medico FROM registros WHERE id = {placeholder}", (id_evaluacion,))
        res = cursor.fetchone()
        if not res or res[0] != medico:
            raise HTTPException(status_code=403, detail="No tienes permiso")

        cursor.execute(f"DELETE FROM registros WHERE id = {placeholder}", (id_evaluacion,))
        conn.commit()
        return {"success": True}
    finally:
        conn.close()

@app.get("/chat")
async def chat_asistente(user_message: str = Query(...)):
    key = os.getenv("GROQ_API_KEY")
    if not key: return {"response": "Error de configuración IA"}
    try:
        client = Groq(api_key=key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[{"role": "system", "content": SYSTEM_PROMPT}, 
                      {"role": "user", "content": user_message}],
            timeout=25.0
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        return {"response": f"Error IA: {str(e)}"}