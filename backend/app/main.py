import sqlite3
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .data_models import ReactionRequest
from .logic import calcular_nfass_ofass

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "fass_database.db")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Definición precisa basada en los resultados de validación [cite: 30, 34]
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            paciente_id TEXT NOT NULL,
            sintomas TEXT,
            nfass REAL,
            ofass_grade INTEGER,
            ofass_category TEXT,
            risk_level TEXT,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.post("/calculate")
async def calculate(request: ReactionRequest):
    # Validar entrada
    if not request.sintomas:
        raise HTTPException(status_code=400, detail="No se enviaron síntomas")

    # Ejecutar lógica basada en Tabla S1 y S12 [cite: 2, 34]
    resultado = calcular_nfass_ofass(request.sintomas)
    
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        # Inserción explícita de los 7 campos de interés
        cursor.execute('''
            INSERT INTO registros (
                nombre, paciente_id, sintomas, nfass, 
                ofass_grade, ofass_category, risk_level
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            request.nombre, 
            request.paciente_id, 
            json.dumps(request.sintomas), # Guardamos como JSON string para integridad
            resultado["nfass"], 
            resultado["ofass_grade"],
            resultado["ofass_category"],
            resultado["risk_level"]
        ))
        conn.commit()
        print(f"EXITO: Guardado nFASS {resultado['nfass']} para {request.nombre}")
    except sqlite3.Error as e:
        print(f"ERROR CRITICO BBDD: {e}")
        raise HTTPException(status_code=500, detail="Error interno al guardar en base de datos")
    finally:
        conn.close()
    
    return resultado

@app.get("/history")
async def get_history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM registros ORDER BY fecha DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]