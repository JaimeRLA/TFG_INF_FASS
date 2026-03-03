import sqlite3
import os
import json
import psycopg2 
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from .logic import calcular_nfass_ofass
from .prompt import SYSTEM_PROMPT
from pydantic import BaseModel
from .data_models import LoginRequest, EvaluacionRequest
# --- Añade estos imports al principio ---
from .security import hash_password, verify_password, encrypt_data, decrypt_data
from fastapi import Header, HTTPException

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
    try:
        cursor = conn.cursor()
        # --- PASO 1: BORRADO AGRESIVO ---
        #print("Limpiando tablas antiguas...")
        cursor.execute("DROP TABLE IF EXISTS registros CASCADE")
       
        cursor.execute('''CREATE TABLE IF NOT EXISTS registros (
            id SERIAL PRIMARY KEY,
            nhc TEXT,
            fecha_nacimiento TEXT,
            genero TEXT,
            medico TEXT,
            respuestas_json TEXT,  -- Aquí guardaremos los Antecedentes
            evento_json TEXT,      -- Aquí guardaremos el Event Record (NUEVO)
            sintomas TEXT,
            nfass REAL,
            ofass_grade INTEGER,
            ofass_category TEXT,
            risk_level TEXT,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')

        # Asegurar tabla usuarios
        cursor.execute('''CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT
        )''')
        
        conn.commit()
        print("Base de datos sincronizada correctamente.")
    except Exception as e:
        print(f"Error en init_db: {e}")
    finally:
        conn.close()

# Ejecutamos el reseteo
init_db()

@app.get("/pacientes_unicos")
async def get_pacientes_unicos(medico: str = Query(...)):    
    #if x_app_key != "mi_clave_secreta_de_app":
        #raise HTTPException(status_code=401, detail="Acceso no autorizado desde fuera de la App")
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        
        # 1. Buscamos los datos que están "RUIDO" (cifrados) en la DB
        query = f"SELECT nhc, fecha_nacimiento, genero FROM registros WHERE medico = {placeholder}"
        cursor.execute(query, (medico,))
        
        pacientes_dict = {} 
        
        for row in cursor.fetchall():
            # Los datos vienen como 'gAAAAABl...'
            raw_nhc = row[0]
            raw_fecha = row[1]
            raw_genero = row[2]
            
            try:
                # 2. EL SERVIDOR USA LA CLAVE PARA DESCIFRAR
                # Aquí es donde ocurre la "magia": el servidor lee el ruido y lo vuelve texto
                nhc_real = decrypt_data(raw_nhc)
                fecha_real = decrypt_data(raw_fecha)
                genero_real = decrypt_data(raw_genero)
                
                # 3. Solo lo añadimos si se pudo descifrar correctamente
                if nhc_real not in pacientes_dict:
                    pacientes_dict[nhc_real] = {
                        "id": nhc_real,
                        "fecha_nacimiento": fecha_real,
                        "genero": genero_real
                    }
            except:
                # Si el dato no está cifrado (viejo) o la clave falla, lo ignoramos por seguridad
                continue
                
        return list(pacientes_dict.values())
    finally:
        conn.close()

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
        
        # CIFRAMOS LA CONTRASEÑA ANTES DE GUARDAR
        hashed_pw = hash_password(request.password) 
        
        cursor.execute(f"INSERT INTO usuarios (username, password) VALUES ({placeholder}, {placeholder})", 
                       (request.username, hashed_pw))
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
    
    query = f"SELECT username, password FROM usuarios WHERE username = {placeholder}"
    cursor.execute(query, (request.username,))
    user = cursor.fetchone()
    conn.close()
    
    if user and verify_password(request.password, user[1]): 
        # IMPORTANTE: Asegúrate de devolver success: True
        return {"success": True, "message": "Acceso concedido", "username": user[0]}
        
    return {"success": False, "message": "Usuario o contraseña incorrectos"}

# --- ENDPOINTS CLÍNICOS ---
@app.get("/history")
async def get_history():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM registros ORDER BY fecha DESC')
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        resultados = []
        for row in rows:
            reg = dict(zip(columns, row))
            
            # DESCIFRADO CAMPO POR CAMPO
            # Usamos try/except por cada uno por si hay datos viejos sin cifrar
            try:
                reg["nhc"] = decrypt_data(reg["nhc"])
                reg["fecha_nacimiento"] = decrypt_data(reg["fecha_nacimiento"])
                reg["genero"] = decrypt_data(reg["genero"])
                
                # Los JSON hay que descifrarlos y luego convertirlos de texto a objeto Python
                reg["respuestas_json"] = json.loads(decrypt_data(reg["respuestas_json"]))
                reg["evento_json"] = json.loads(decrypt_data(reg["evento_json"]))
                reg["sintomas"] = json.loads(decrypt_data(reg["sintomas"]))
            except Exception as e:
                # Si falla (dato viejo), intentamos cargar los JSON normales si no estaban cifrados
                try:
                    reg["respuestas_json"] = json.loads(reg["respuestas_json"])
                    reg["evento_json"] = json.loads(reg["evento_json"])
                    reg["sintomas"] = json.loads(reg["sintomas"])
                except: pass
            
            resultados.append(reg)
        return resultados
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
    

# --- ENDPOINT CALCULATE (Asegurar retorno de resultado) ---
@app.post("/calculate")
async def calculate(request: EvaluacionRequest):
    # 1. Cálculos clínicos (NFASS/OFASS) - Se hacen con los datos limpios del Front
    sintomas_ids = request.sintomas
    resultado = calcular_nfass_ofass(sintomas_ids)
    
    # 2. CIFRADO TOTAL DE DATOS PERSONALES
    # Ciframos el NHC y el resto de campos antes de enviarlos a la DB
    nhc_c = encrypt_data(str(request.paciente_id))
    fecha_n_c = encrypt_data(str(request.fecha_nacimiento))
    genero_c = encrypt_data(str(request.genero))
    
    # Ciframos los objetos JSON
    respuestas_json = encrypt_data(json.dumps(request.respuestas))
    evento_json = encrypt_data(json.dumps(request.evento))
    sintomas_json = encrypt_data(json.dumps(sintomas_ids))

    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        
        # Lógica: Si viene un request.id > 0, es una EDICIÓN (UPDATE)
        # Si no viene ID (es null o 0), es un NUEVO EVENTO (INSERT)
        if request.id:
            # ACTUALIZAR UN REGISTRO EXISTENTE
            query = f"""UPDATE registros SET 
                        nhc={placeholder}, fecha_nacimiento={placeholder}, genero={placeholder}, 
                        medico={placeholder}, respuestas_json={placeholder}, evento_json={placeholder}, 
                        sintomas={placeholder}, nfass={placeholder}, ofass_grade={placeholder}, 
                        ofass_category={placeholder}, risk_level={placeholder}
                        WHERE id={placeholder}"""
            
            cursor.execute(query, (
                nhc_c, fecha_n_c, genero_c, request.medico, 
                respuestas_json, evento_json, sintomas_json, 
                float(resultado["nfass"]), int(resultado["ofass_grade"]), 
                resultado["ofass_category"], resultado["risk_level"], request.id
            ))
        else:
            # CREAR NUEVA INSTANCIA (NUEVO EVENTO)
            # Esto funcionará tanto para pacientes nuevos como existentes
            query = f"""INSERT INTO registros 
                    (nhc, fecha_nacimiento, genero, medico, respuestas_json, evento_json, sintomas, 
                     nfass, ofass_grade, ofass_category, risk_level) 
                    VALUES ({','.join([placeholder]*11)})"""
            
            cursor.execute(query, (
                nhc_c, fecha_n_c, genero_c, request.medico, 
                respuestas_json, evento_json, sintomas_json, 
                float(resultado["nfass"]), int(resultado["ofass_grade"]), 
                resultado["ofass_category"], resultado["risk_level"]
            ))
        
        conn.commit()
        # Devolvemos el resultado al Front-end con éxito
        return {**resultado, "success": True}

    except Exception as e:
        if conn: conn.rollback()
        print(f"Error en base de datos: {e}")
        return {"success": False, "message": str(e)}
    finally:
        conn.close()

@app.delete("/evaluacion/{id_evaluacion}")
async def eliminar_registro(id_evaluacion: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # Usamos el placeholder correcto según la DB
        query = "DELETE FROM registros WHERE id = %s" if DATABASE_URL else "DELETE FROM registros WHERE id = ?"
        cursor.execute(query, (id_evaluacion,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return {"success": False, "message": "No se encontró el registro"}
            
        return {"success": True, "message": "Registro eliminado"}
    except Exception as e:
        print(f"Error al eliminar: {e}")
        return {"success": False, "message": str(e)}
    finally:
        conn.close()

@app.get("/lista_usuarios_debug")
async def ver_usuarios():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, password, username FROM usuarios")
    users = cursor.fetchall()
    conn.close()
    return {"usuarios": users}

@app.get("/debug_db")
async def debug_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT nhc, fecha_nacimiento FROM registros LIMIT 5')
    return cursor.fetchall() # Esto te mostrará el "ruido" gAAAA... si está funcionando