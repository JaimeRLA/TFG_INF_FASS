import sqlite3
import os
import json
import psycopg2  # Necesario para conectar con PostgreSQL en Render
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .data_models import ReactionRequest
from .logic import calcular_nfass_ofass

app = FastAPI()

# --- CONFIGURACIÓN DE CONEXIÓN DINÁMICA ---
# Render inyecta automáticamente DATABASE_URL si lo configuras en Environment
DATABASE_URL = os.getenv("DATABASE_URL")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "fass_database.db")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tfg-inf-fass-1.onrender.com",
        "http://localhost:5173" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    """Retorna conexión a PostgreSQL en Render o SQLite en local"""
    if DATABASE_URL:
        # Usamos PostgreSQL (Render)
        return psycopg2.connect(DATABASE_URL)
    else:
        # Usamos SQLite (Local)
        return sqlite3.connect(DB_PATH)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Query compatible con PostgreSQL (usando SERIAL) y SQLite (ajustado abajo)
    create_table_query = '''
        CREATE TABLE IF NOT EXISTS registros (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            paciente_id TEXT NOT NULL,
            sintomas TEXT,
            nfass REAL,
            ofass_grade INTEGER,
            ofass_category TEXT,
            risk_level TEXT,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''
    
    # Ajuste manual para SQLite si estamos en local
    if not DATABASE_URL:
        create_table_query = create_table_query.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")

    cursor.execute(create_table_query)
    conn.commit()
    conn.close()

init_db()

@app.post("/calculate")
async def calculate(request: ReactionRequest):
    if not request.sintomas:
        raise HTTPException(status_code=400, detail="No se enviaron síntomas")

    # Ejecutar lógica basada en Tabla S1 y S12
    resultado = calcular_nfass_ofass(request.sintomas)
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Marcadores de posición: %s para PostgreSQL, ? para SQLite
        placeholder = "%s" if DATABASE_URL else "?"
        
        query = f'''
            INSERT INTO registros (
                nombre, paciente_id, sintomas, nfass, 
                ofass_grade, ofass_category, risk_level
            )
            VALUES ({', '.join([placeholder]*7)})
        '''
        
        cursor.execute(query, (
            request.nombre, 
            request.paciente_id, 
            json.dumps(request.sintomas), 
            resultado["nfass"], 
            resultado["ofass_grade"],
            resultado["ofass_category"],
            resultado["risk_level"]
        ))
        conn.commit()
        print(f"EXITO: Guardado nFASS {resultado['nfass']} para {request.nombre}")
    except Exception as e:
        print(f"ERROR CRITICO BBDD: {e}")
        raise HTTPException(status_code=500, detail="Error interno al guardar en base de datos")
    finally:
        conn.close()
    
    return resultado

@app.get("/history")
async def get_history():
    conn = get_connection()
    try:
        # Para SQLite usamos Row para facilitar el diccionario
        if not DATABASE_URL:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM registros ORDER BY fecha DESC')
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        else:
            # Para PostgreSQL mapeamos manualmente a diccionario
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM registros ORDER BY fecha DESC')
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]
    finally:
        conn.close()