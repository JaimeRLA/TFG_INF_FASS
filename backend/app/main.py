import sqlite3
import os
import json
import psycopg2 
import hashlib # Para la pseudonimización
from datetime import datetime
from fastapi import FastAPI, Query, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from .logic import calcular_nfass_ofass
from .prompt import SYSTEM_PROMPT
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
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY")

def get_connection():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return sqlite3.connect(os.path.join(os.path.dirname(__file__), "fass_database.db"))

def init_db():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # TABLA 1: PACIENTES (Identidad Pseudonimizada)
        cursor.execute('''CREATE TABLE IF NOT EXISTS pacientes (
            id SERIAL PRIMARY KEY,
            nhc_hash TEXT UNIQUE,
            rango_edad TEXT,
            genero TEXT,
            medico TEXT
        )''')
        # TABLA 2: REGISTROS (Clínica vinculada por ID interno)
        cursor.execute('''CREATE TABLE IF NOT EXISTS registros (
            id SERIAL PRIMARY KEY,
            paciente_id INTEGER REFERENCES pacientes(id),
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

# --- UTILIDADES DE PRIVACIDAD ---

def get_age_range(dob_str):
    """Convierte fecha exacta en rango de edad (Minimización de datos)"""
    try:
        if not "-" in dob_str and not dob_str.isdigit():
             birth_date = datetime.strptime(dob_str, "%Y-%m-%d")
             today = datetime.today()
             age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
             if age < 18: return "Pediatría (<18)"
             if age < 30: return "18-29"
             if age < 50: return "30-49"
             if age < 70: return "50-69"
             return "70+"
        return dob_str
    except:
        return dob_str if dob_str else "No especificado"

def generate_pseudonym(nhc):
    """Genera un hash irreversible del NHC (Pseudonimización)"""
    if len(str(nhc)) == 64:
        return str(nhc)
    return hashlib.sha256(str(nhc).encode()).hexdigest()

# --- ENDPOINTS DE PACIENTES ---

@app.get("/pacientes_unicos")
async def get_pacientes_unicos(medico: str = Query(...), x_tfg_key: str = Header(None)):
    if x_tfg_key != APP_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Acceso no autorizado")

    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        query = f"SELECT nhc_hash, rango_edad, genero FROM pacientes WHERE medico = {placeholder}"
        cursor.execute(query, (medico,))
        
        pacientes = []
        for row in cursor.fetchall():
            pacientes.append({
                "id": row[0], 
                "rango_edad": row[1],
                "genero": decrypt_data(row[2])
            })
        return pacientes
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
        cursor.execute(f"INSERT INTO usuarios (username, password) VALUES ({placeholder}, {placeholder})", (request.username, hashed_pw))
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
async def get_history(medico: str = Query(...), x_tfg_key: str = Header(None)):
    if x_tfg_key != APP_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Acceso no autorizado")

    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        
        query = f"""
            SELECT r.*, p.nhc_hash, p.rango_edad, p.genero 
            FROM registros r
            JOIN pacientes p ON r.paciente_id = p.id
            WHERE r.medico = {placeholder} 
            ORDER BY r.fecha DESC
        """
        cursor.execute(query, (medico,))
        
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        resultados = []
        for row in rows:
            reg = dict(zip(columns, row))
            reg["genero"] = decrypt_data(reg["genero"])
            reg["respuestas_json"] = json.loads(decrypt_data(reg["respuestas_json"]))
            reg["evento_json"] = json.loads(decrypt_data(reg["evento_json"]))
            reg["sintomas"] = json.loads(decrypt_data(reg["sintomas"]))
            resultados.append(reg)
        return resultados
    finally:
        conn.close()

@app.post("/calculate")
async def calculate(request: EvaluacionRequest):
    resultado = calcular_nfass_ofass(request.sintomas)
    
    # 1. Pseudonimización y Minimización
    nhc_pseudo = generate_pseudonym(request.paciente_id)
    rango_edad = get_age_range(request.fecha_nacimiento)
    genero_c = encrypt_data(str(request.genero))
    
    # 2. Cifrado de clínica
    respuestas_c = encrypt_data(json.dumps(request.respuestas))
    evento_c = encrypt_data(json.dumps(request.evento))
    sintomas_c = encrypt_data(json.dumps(request.sintomas))

    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        
        # --- PASO 3: GESTIÓN DEL PACIENTE (BUSCAR O CREAR) ---
        cursor.execute(f"SELECT id FROM pacientes WHERE nhc_hash = {placeholder}", (nhc_pseudo,))
        res_paciente = cursor.fetchone()
        
        if res_paciente:
            int_paciente_id = res_paciente[0]
            cursor.execute(f"UPDATE pacientes SET rango_edad = {placeholder} WHERE id = {placeholder}", (rango_edad, int_paciente_id))
        else:
            cursor.execute(f"""
                INSERT INTO pacientes (nhc_hash, rango_edad, genero, medico)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder})
                RETURNING id
            """, (nhc_pseudo, rango_edad, genero_c, request.medico))
            int_paciente_id = cursor.fetchone()[0]

        # --- PASO 4: GUARDADO DE EVALUACIÓN (UPDATE SI EXISTE ID, INSERT SI NO) ---
        id_final = None
        if request.id and int(request.id) > 0:
            id_final = int(request.id)
            query = f"""UPDATE registros SET 
                        paciente_id={placeholder}, medico={placeholder}, respuestas_json={placeholder}, 
                        evento_json={placeholder}, sintomas={placeholder}, nfass={placeholder}, 
                        ofass_grade={placeholder}, ofass_category={placeholder}, risk_level={placeholder}
                        WHERE id={placeholder}"""
            cursor.execute(query, (int_paciente_id, request.medico, respuestas_c, evento_c, 
                                   sintomas_c, float(resultado["nfass"]), int(resultado["ofass_grade"]), 
                                   resultado["ofass_category"], resultado["risk_level"], id_final))
        else:
            query = f"""INSERT INTO registros (paciente_id, medico, respuestas_json, evento_json, 
                        sintomas, nfass, ofass_grade, ofass_category, risk_level) 
                        VALUES ({','.join([placeholder]*9)}) RETURNING id"""
            cursor.execute(query, (int_paciente_id, request.medico, respuestas_c, evento_c, 
                                   sintomas_c, float(resultado["nfass"]), int(resultado["ofass_grade"]), 
                                   resultado["ofass_category"], resultado["risk_level"]))
            id_final = cursor.fetchone()[0]

        conn.commit()
        # Devolvemos id_registro para que el frontend lo use en los siguientes clics de "Calcular"
        return {**resultado, "success": True, "id_registro": id_final}
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
        cursor.execute(f"SELECT medico FROM registros WHERE id = {placeholder}", (id_evaluacion,))
        res = cursor.fetchone()
        if not res or res[0] != medico:
            raise HTTPException(status_code=403, detail="No tienes permiso")
        cursor.execute(f"DELETE FROM registros WHERE id = {placeholder}", (id_evaluacion,))
        conn.commit()
        return {"success": True}
    finally:
        conn.close()

# --- UTILIDADES ADICIONALES ---

@app.get("/get_hash/{nhc}")
async def get_hash(nhc: str):
    """Devuelve el hash SHA256 completo para facilitar búsquedas"""
    hash_obj = hashlib.sha256(nhc.encode())
    return {"hash": hash_obj.hexdigest()}

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