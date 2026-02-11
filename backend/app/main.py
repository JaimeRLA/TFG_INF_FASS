import sqlite3
import os
import json
import psycopg2 
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from groq import Groq

# --- MODELOS DE DATOS (Directamente aquí para evitar errores de importación) ---
class ReactionRequest(BaseModel):
    nombre: str
    paciente_id: str
    sintomas: List[str]

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
    query = '''CREATE TABLE IF NOT EXISTS registros (
                id SERIAL PRIMARY KEY, nombre TEXT, paciente_id TEXT, 
                sintomas TEXT, nfass REAL, ofass_grade INTEGER, 
                ofass_category TEXT, risk_level TEXT, fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'''
    if not DATABASE_URL:
        query = query.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
    cursor.execute(query)
    conn.commit()
    conn.close()

init_db()

# --- LÓGICA DE CÁLCULO ---
def calcular_nfass_ofass_internal(sintomas_ids):
    if not sintomas_ids:
        return {"nfass": 0, "ofass_grade": 0, "ofass_category": "N/A", "risk_level": "Low"}
    
    DB_SINTOMAS = {
        'itchy_mouth': {'sys': 'Oral', 'lambda': 0.05, 'epsilon': -1},
        'nausea_pain': {'sys': 'GI', 'lambda': 0.03, 'epsilon': 0},
        'frequent_nausea_pain': {'sys': 'GI', 'lambda': 0.04, 'epsilon': 0},
        'frequent_nausea_pain_dec': {'sys': 'GI', 'lambda': 0.05, 'epsilon': 0},
        'emesis_1': {'sys': 'GI', 'lambda': 0.05, 'epsilon': 0},
        'emesis_multiple': {'sys': 'GI', 'lambda': 0.08, 'epsilon': 0},
        'diarrhoea': {'sys': 'GI', 'lambda': 0.05, 'epsilon': 0},
        'diarrhoea_multiple': {'sys': 'GI', 'lambda': 0.08, 'epsilon': 0},
        'pruritus_os': {'sys': 'Skin', 'lambda': 0.01, 'epsilon': 0},
        'pruritus_os_2': {'sys': 'Skin', 'lambda': 0.02, 'epsilon': 0},
        'pruritus_os_hard': {'sys': 'Skin', 'lambda': 0.05, 'epsilon': 0},
        'rash_few': {'sys': 'Skin', 'lambda': 0.01, 'epsilon': 0},
        'rash_less_50': {'sys': 'Skin', 'lambda': 0.05, 'epsilon': 0},
        'rash_more_50': {'sys': 'Skin', 'lambda': 0.08, 'epsilon': 0},
        'urticaria_more_3': {'sys': 'Skin', 'lambda': 0.05, 'epsilon': 0},
        'urticaria_3_10': {'sys': 'Skin', 'lambda': 0.07, 'epsilon': 0},
        'urticaria_more_10': {'sys': 'Skin', 'lambda': 0.08, 'epsilon': 0},
        'angioedema_mild': {'sys': 'Skin', 'lambda': 0.05, 'epsilon': 0},
        'angioedema_significant': {'sys': 'Skin', 'lambda': 0.07, 'epsilon': 0},
        'angioedema_generalized': {'sys': 'Skin', 'lambda': 0.08, 'epsilon': 0},
        'rhinitis_rare': {'sys': 'Eye/Nose', 'lambda': 0.01, 'epsilon': 0},
        'rhinitis_less_10': {'sys': 'Eye/Nose', 'lambda': 0.05, 'epsilon': 0},
        'rhinitis_long': {'sys': 'Eye/Nose', 'lambda': 0.08, 'epsilon': 0},
        'eyes_rare': {'sys': 'Eye/Nose', 'lambda': 0.05, 'epsilon': 0},
        'eyes_continuos': {'sys': 'Eye/Nose', 'lambda': 0.08, 'epsilon': 0},
        'wheezing_exp': {'sys': 'Bronchi', 'lambda': 0.06, 'epsilon': 2},
        'wheezing_severe': {'sys': 'Bronchi', 'lambda': 0.07, 'epsilon': 2},
        'wheezing_audible': {'sys': 'Bronchi', 'lambda': 0.08, 'epsilon': 2},
        'laryngeal_throat': {'sys': 'Larynx', 'lambda': 0.05, 'epsilon': 2},
        'laryngeal_more_3': {'sys': 'Larynx', 'lambda': 0.05, 'epsilon': 2},
        'laryngeal_frequent_cough': {'sys': 'Larynx', 'lambda': 0.07, 'epsilon': 2},
        'laryngeal_stridor': {'sys': 'Larynx', 'lambda': 0.08, 'epsilon': 2},
        'cv_tachycardia': {'sys': 'CV', 'lambda': 0.05, 'epsilon': 4},
        'cv_bp_drop': {'sys': 'CV', 'lambda': 0.07, 'epsilon': 4},
        'cv_collapse': {'sys': 'CV', 'lambda': 0.08, 'epsilon': 4},
        'ns_dizzy': {'sys': 'NS', 'lambda': 0.05, 'epsilon': 4},
        'ns_significant_change': {'sys': 'NS', 'lambda': 0.07, 'epsilon': 4},
        'ns_loss_consciousness': {'sys': 'NS', 'lambda': 0.08, 'epsilon': 4}
    }

    total_lambdas = 0
    for s_id in sintomas_ids:
        s_id_clean = s_id.strip() # Limpia espacios accidentales
        if s_id_clean in DB_SINTOMAS:
            s = DB_SINTOMAS[s_id_clean]
            total_lambdas += 2**s['epsilon'] * (1 + s['lambda'])

    nfass_final = round(np.log2(total_lambdas) + 2, 3)
    
    if nfass_final >= 6.0: ofass, cat, risk = 5, "Severe", "High"
    elif nfass_final >= 4.0: ofass, cat, risk = 4, "Severe", "High"
    elif nfass_final >= 3.0: ofass, cat, risk = 3, "Moderate", "Medium"
    elif nfass_final >= 2.0: ofass, cat, risk = 2, "Moderate", "Medium"
    else: ofass, cat, risk = 1, "Mild", "Low"

    return {"nfass": nfass_final, "ofass_grade": ofass, "ofass_category": cat, "risk_level": risk}

# --- ENDPOINTS ---

@app.post("/calculate")
async def calculate(request: ReactionRequest):
    resultado = calcular_nfass_ofass_internal(request.sintomas)
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        query = f"INSERT INTO registros (nombre, paciente_id, sintomas, nfass, ofass_grade, ofass_category, risk_level) VALUES ({','.join([placeholder]*7)})"
        cursor.execute(query, (request.nombre, request.paciente_id, json.dumps(request.sintomas), float(resultado["nfass"]), int(resultado["ofass_grade"]), resultado["ofass_category"], resultado["risk_level"]))
        conn.commit()
    finally: conn.close()
    return resultado

@app.get("/chat")
async def chat_asistente(user_message: str = Query(...)):
    key = os.getenv("GROQ_API_KEY")
    if not key:
        return {"response": "Error: No configuraste la variable GROQ_API_KEY en Render."}
    
    try:
        # Forzamos la inicialización aquí para capturar el error exacto
        client = Groq(api_key=key)
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Responde brevemente."},
                {"role": "user", "content": user_message}
            ],
            timeout=20.0 # Añadimos un tiempo de espera para evitar que Render corte la conexión
        )
        return {"response": completion.choices[0].message.content}
    
    except Exception as e:
        # Esto nos dirá en el chat exactamente qué está fallando (si es la clave, el modelo o la red)
        print(f"Error detallado en Groq: {str(e)}")
        return {"response": f"Error interno del servidor: {str(e)}"}
    

@app.get("/history")
async def get_history():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM registros ORDER BY fecha DESC')
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    finally: conn.close()