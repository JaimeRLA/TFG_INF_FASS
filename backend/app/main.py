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
from .logic import calcular_nfass_ofass
from .data_models import ReactionRequest
from .prompt import SYSTEM_PROMPT


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

# --- ENDPOINTS ---
@app.post("/calculate")
async def calculate(request: ReactionRequest):
    resultado = calcular_nfass_ofass(request.sintomas)
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
    
    # --- AQUÍ ESTÁ TU "BASE DE CONOCIMIENTO" ---
    system_prompt = SYSTEM_PROMPT 
    try:
        client = Groq(api_key=key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", # Asegúrate de usar el modelo nuevo
            messages=[
                {"role": "system", "content": system_prompt}, # Aquí inyectamos la info
                {"role": "user", "content": user_message}
            ],
            timeout=25.0
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        return {"response": f"Error del asistente: {str(e)}"}
    

@app.get("/history")
async def get_history():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM registros ORDER BY fecha DESC')
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    finally: conn.close()