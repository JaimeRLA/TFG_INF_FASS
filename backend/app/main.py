import sqlite3
import os
import json
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import psycopg2 
import hashlib # Para la pseudonimización
from datetime import datetime
from fastapi import FastAPI, Query, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from groq import Groq
from .logic import calcular_nfass_ofass
from .agent_logic import SYSTEM_PROMPT
from .data_models import LoginRequest, RegisterRequest, EvaluacionRequest
from .security import hash_password, verify_password, encrypt_data, decrypt_data
from .sintomas import DB_SINTOMAS

app = FastAPI()

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tfg-inf-fass-1.onrender.com", 
        "https://tfg-inf-fass.onrender.com",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- BASE DE DATOS ---
DATABASE_URL = os.getenv("DATABASE_URL")
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY")

# --- CONFIGURACIÓN EMAIL (Brevo SMTP) ---
SMTP_USER = os.getenv("SMTP_USER", "")        # login de Brevo (a99405001@smtp-brevo.com)
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "") # SMTP key de Brevo
FROM_EMAIL = os.getenv("FROM_EMAIL", "jruiz.lopez.alvarado@gmail.com")  # remitente verificado en Brevo
ADMIN_EMAIL = "jruiz.lopez.alvarado@gmail.com"
BACKEND_URL = os.getenv("BACKEND_URL", "https://tfg-inf-fass.onrender.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://tfg-inf-fass-1.onrender.com")

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
        # Tabla de Solicitudes de Registro (pendientes de aprobación)
        cursor.execute('''CREATE TABLE IF NOT EXISTS solicitudes_registro (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE,
            nombre TEXT,
            especialidad TEXT,
            colegiado TEXT,
            hospital TEXT,
            telefono TEXT,
            token TEXT UNIQUE,
            status TEXT DEFAULT 'pending',
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        # Si ya es un rango, lo devolvemos para evitar errores
        if "-" in dob_str or "+" in dob_str or "Pediatría" in dob_str:
            return dob_str
            
        birth_date = datetime.strptime(dob_str, "%Y-%m-%d")
        today = datetime.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        if age < 18: return "Pediatría (<18)"
        if age < 30: return "18-29"
        if age < 50: return "30-49"
        if age < 70: return "50-69"
        return "70+"
    except:
        return dob_str if dob_str else "No especificado"

def generate_pseudonym(nhc):
    """Genera un hash irreversible del NHC (Pseudonimización)"""
    if len(str(nhc)) == 64:
        return str(nhc)
    return hashlib.sha256(str(nhc).encode()).hexdigest()

# --- UTILIDAD DE EMAIL (Brevo SMTP) ---
def send_email(to: str, subject: str, html_body: str):
    print(f"[EMAIL] Intentando enviar a={to} | SMTP_USER='{SMTP_USER}' | PASSWORD_SET={'Sí' if SMTP_PASSWORD else 'NO'}")
    if not SMTP_USER or not SMTP_PASSWORD:
        print("[EMAIL] ERROR: SMTP_USER o SMTP_PASSWORD no configuradas en las variables de entorno.")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"FASS Sistema <{FROM_EMAIL}>"
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP("smtp-relay.brevo.com", 587) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to, msg.as_string())
        print(f"[EMAIL] Enviado correctamente a {to}")
    except Exception as e:
        print(f"[EMAIL] ERROR al enviar a {to}: {e}")

# --- ENDPOINTS DE PACIENTES ---
@app.get("/pacientes_unicos")
async def get_pacientes_unicos(medico: str = Query(...), x_tfg_key: str = Header(None)):
    if x_tfg_key != APP_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Acceso no autorizado")

    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        # Obtenemos los datos únicos de los pacientes registrados por el médico
        query = f"SELECT nhc_hash, rango_edad, genero FROM pacientes WHERE medico = {placeholder}"
        cursor.execute(query, (medico,))
        
        pacientes = []
        for row in cursor.fetchall():
            pacientes.append({
                "id": row[0], # Enviamos el hash como ID para que el frontend lo maneje
                "nhc_hash": row[0],
                "rango_edad": row[1],
                "genero": decrypt_data(row[2])
            })
        return pacientes
    finally:
        conn.close()

# --- ENDPOINTS DE AUTENTICACIÓN ---
@app.post("/register")
def register(request: RegisterRequest):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"

        # Verificar si ya tiene cuenta activa
        cursor.execute(f"SELECT username FROM usuarios WHERE username = {placeholder}", (request.email,))
        if cursor.fetchone():
            return {"success": False, "message": "Este correo ya tiene una cuenta activa."}

        # Verificar solicitud previa — si existe (pending o rechazada), se sobreescribe y reenvía
        cursor.execute(f"SELECT status FROM solicitudes_registro WHERE email = {placeholder}", (request.email,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute(f"DELETE FROM solicitudes_registro WHERE email = {placeholder}", (request.email,))

        token = secrets.token_urlsafe(32)
        cursor.execute(
            f"INSERT INTO solicitudes_registro (email, nombre, especialidad, colegiado, hospital, telefono, token) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})",
            (request.email, request.nombre, request.especialidad, request.colegiado, request.hospital, request.telefono, token)
        )
        conn.commit()

        # Email al admin
        approve_link = f"{BACKEND_URL}/approve/{token}"
        send_email(
            ADMIN_EMAIL,
            f"[FASS] Nueva solicitud de acceso: {request.nombre}",
            f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
                <h2 style="color:#1e293b">Nueva solicitud de registro en FASS</h2>
                <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">
                    <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Nombre:</td><td style="padding:10px">{request.nombre}</td></tr>
                    <tr><td style="padding:10px;font-weight:bold">Email:</td><td style="padding:10px">{request.email}</td></tr>
                    <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Especialidad:</td><td style="padding:10px">{request.especialidad}</td></tr>
                    <tr><td style="padding:10px;font-weight:bold">Nº Colegiado:</td><td style="padding:10px">{request.colegiado}</td></tr>
                    <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Hospital/Centro:</td><td style="padding:10px">{request.hospital}</td></tr>
                    <tr><td style="padding:10px;font-weight:bold">Teléfono:</td><td style="padding:10px">{request.telefono}</td></tr>
                </table>
                <br>
                <a href="{approve_link}" style="background:#1e293b;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-size:16px">
                    Aprobar acceso
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:20px">Si no reconoce esta solicitud, ignórela.</p>
            </div>
            """
        )

        return {"success": True, "message": "Solicitud enviada correctamente. Recibirá sus credenciales por correo cuando sea aprobado."}
    except Exception as e:
        if conn: conn.rollback()
        return {"success": False, "message": f"Error al procesar la solicitud: {str(e)}"}
    finally:
        conn.close()


@app.get("/approve/{token}", response_class=HTMLResponse)
def approve_registration(token: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"

        cursor.execute(
            f"SELECT email, nombre, especialidad, colegiado, hospital, telefono, status FROM solicitudes_registro WHERE token = {placeholder}",
            (token,)
        )
        solicitud = cursor.fetchone()

        if not solicitud:
            return HTMLResponse(
                "<html><body style='font-family:Arial;padding:40px;text-align:center'><h2>❌ Enlace inválido o expirado.</h2></body></html>",
                status_code=404
            )

        email, nombre, especialidad, colegiado, hospital, telefono, status = solicitud

        if status == 'approved':
            return HTMLResponse(
                f"<html><body style='font-family:Arial;padding:40px;text-align:center'><h2>ℹ️ Esta solicitud ya fue aprobada para <b>{email}</b>.</h2></body></html>"
            )

        # Generar contraseña aleatoria
        password = secrets.token_urlsafe(10)
        hashed_pw = hash_password(password)

        # Crear usuario
        cursor.execute(
            f"INSERT INTO usuarios (username, password) VALUES ({placeholder}, {placeholder})",
            (email, hashed_pw)
        )

        # Marcar solicitud como aprobada
        cursor.execute(
            f"UPDATE solicitudes_registro SET status = 'approved' WHERE token = {placeholder}",
            (token,)
        )
        conn.commit()

        # Enviar credenciales al usuario
        send_email(
            email,
            "[FASS] Tu acceso ha sido aprobado",
            f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
                <h2 style="color:#1e293b">Bienvenido/a al Sistema FASS, {nombre}</h2>
                <p>Tu solicitud de acceso ha sido aprobada. Aquí están tus credenciales de acceso:</p>
                <div style="background:#f1f5f9;border-radius:8px;padding:20px;margin:20px 0">
                    <p style="margin:6px 0"><b>Usuario (email):</b> {email}</p>
                    <p style="margin:6px 0"><b>Contraseña:</b> <code style="font-size:1.2em;background:#e2e8f0;padding:4px 8px;border-radius:4px">{password}</code></p>
                </div>
                <a href="{FRONTEND_URL}" style="background:#1e293b;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-size:16px">
                    Acceder al sistema
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:20px">Guarda tu contraseña en un lugar seguro.</p>
            </div>
            """
        )

        return HTMLResponse(f"""
        <html>
        <body style="font-family:Arial,sans-serif;padding:40px;text-align:center;background:#f8fafc">
            <div style="max-width:500px;margin:auto;background:white;padding:40px;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.1)">
                <h2 style="color:#1e293b">✅ Acceso aprobado</h2>
                <p>Se ha aprobado el acceso para <b>{nombre}</b> ({email}).</p>
                <p>Las credenciales han sido enviadas a su correo electrónico.</p>
            </div>
        </body>
        </html>
        """)
    except Exception as e:
        if conn: conn.rollback()
        return HTMLResponse(f"<html><body style='font-family:Arial;padding:40px'><h2>Error: {str(e)}</h2></body></html>", status_code=500)
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
            # Buscar el nombre en solicitudes_registro
            cursor.execute(f"SELECT nombre FROM solicitudes_registro WHERE email = {placeholder}", (request.username,))
            sol = cursor.fetchone()
            nombre = sol[0] if sol else request.username
            return {"success": True, "username": user[0], "nombre": nombre}
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

        id_final = None
        # Si recibimos un ID válido, actualizamos (UPDATE), si no, creamos (INSERT)
        if request.id and str(request.id).isdigit() and int(request.id) > 0:
            id_final = int(request.id)
            query = f"""UPDATE registros SET 
                        paciente_id={placeholder}, medico={placeholder}, respuestas_json={placeholder}, 
                        evento_json={placeholder}, sintomas={placeholder}, nfass={placeholder}, 
                        ofass_grade={placeholder}, ofass_category={placeholder}, risk_level={placeholder}
                        WHERE id={placeholder}"""
            cursor.execute(query, (
                int_paciente_id, request.medico, respuestas_c, evento_c, 
                sintomas_c, float(resultado["nfass"]), int(resultado["ofass_grade"]), 
                resultado["ofass_category"], resultado["risk_level"], id_final
            ))
        else:
            query = f"""INSERT INTO registros (paciente_id, medico, respuestas_json, evento_json, 
                        sintomas, nfass, ofass_grade, ofass_category, risk_level) 
                        VALUES ({','.join([placeholder]*9)}) RETURNING id"""
            cursor.execute(query, (
                int_paciente_id, request.medico, respuestas_c, evento_c, 
                sintomas_c, float(resultado["nfass"]), int(resultado["ofass_grade"]), 
                resultado["ofass_category"], resultado["risk_level"]
            ))
            id_final = cursor.fetchone()[0]

        conn.commit()
        # Devolvemos el ID generado para que el Frontend lo guarde y evite duplicados al recalcular
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
    """Devuelve el hash SHA256 completo para el buscador del frontend"""
    hash_obj = hashlib.sha256(nhc.encode())
    return {"hash": hash_obj.hexdigest()}

@app.get("/stats")
async def get_stats(medico: str = Query(...), timeRange: str = Query("all"), x_tfg_key: str = Header(None)):
    """Obtiene estadísticas agregadas de pacientes y evaluaciones por médico"""
    if x_tfg_key != APP_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Acceso no autorizado")

    conn = get_connection()
    try:
        cursor = conn.cursor()
        placeholder = "%s" if DATABASE_URL else "?"
        
        # Construir filtro de tiempo
        time_filter = ""
        if timeRange != "all":
            days_map = {"30d": 30, "90d": 90, "365d": 365}
            days = days_map.get(timeRange, 0)
            if days > 0:
                if DATABASE_URL:
                    time_filter = f"AND r.fecha >= NOW() - INTERVAL '{days} days'"
                else:
                    time_filter = f"AND r.fecha >= datetime('now', '-{days} days')"
        
        # Consulta principal
        query = f"""
            SELECT 
                r.id, r.paciente_id, r.nfass, r.ofass_grade, 
                r.ofass_category, r.risk_level, r.sintomas, 
                r.evento_json, r.fecha
            FROM registros r
            WHERE r.medico = {placeholder} {time_filter}
        """
        cursor.execute(query, (medico,))
        rows = cursor.fetchall()
        
        if not rows:
            return {
                "total_patients": 0,
                "total_evaluations": 0,
                "anaphylaxis_count": 0,
                "anaphylaxis_percent": 0,
                "avg_nfass": 0,
                "severity_distribution": [],
                "top_allergens": [],
                "affected_systems": [],
                "monthly_trend": []
            }
        
        # Procesar datos
        pacientes_unicos = set()
        total_nfass = 0
        anaphylaxis = 0
        severity_counts = {}
        allergen_counts = {}
        system_counts = {}
        monthly_counts = {}
        
        for row in rows:
            pid, nfass, ofass_grade, ofass_category, risk_level, sintomas_enc, evento_enc, fecha = row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]
            
            pacientes_unicos.add(pid)
            total_nfass += nfass if nfass else 0
            
            # Anafilaxis (OFASS ≥ 3)
            if ofass_grade and ofass_grade >= 3:
                anaphylaxis += 1
            
            # Distribución de severidad
            severity = ofass_category if ofass_category else "N/A"
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            # Alérgenos principales
            try:
                evento = json.loads(decrypt_data(evento_enc))
                partes = []
                for campo in ["trigger_food", "trigger_insect", "trigger_drug"]:
                    val = evento.get(campo, "").strip()
                    if val:
                        partes.append(val)
                alergeno = ", ".join(partes) if partes else "Desconocido"
                allergen_counts[alergeno] = allergen_counts.get(alergeno, 0) + 1
            except:
                pass
            
            # Sistemas afectados (usando el campo 'sys' de DB_SINTOMAS)
            SYS_MAP = {
                "Oral": "Orofaringe",
                "Skin": "Piel",
                "GI": "Gastrointestinal",
                "Eye/Nose": "Ojos/Nariz",
                "Bronchi": "Respiratorio",
                "Larynx": "Laringe",
                "CV": "Cardiovascular",
                "NS": "Neurológico"
            }
            try:
                sintomas_list = json.loads(decrypt_data(sintomas_enc))
                sistemas_vistos = set()
                for s_id in sintomas_list:
                    if s_id in DB_SINTOMAS:
                        sys_key = DB_SINTOMAS[s_id]['sys']
                        sys_name = SYS_MAP.get(sys_key, sys_key)
                        sistemas_vistos.add(sys_name)
                for sys_name in sistemas_vistos:
                    system_counts[sys_name] = system_counts.get(sys_name, 0) + 1
            except:
                pass
            
            # Tendencia mensual
            try:
                if isinstance(fecha, str):
                    mes = fecha[:7]  # YYYY-MM
                else:
                    mes = fecha.strftime("%Y-%m")
                monthly_counts[mes] = monthly_counts.get(mes, 0) + 1
            except:
                pass
        
        total_evaluations = len(rows)
        total_patients = len(pacientes_unicos)
        avg_nfass = total_nfass / total_evaluations if total_evaluations > 0 else 0
        anaphylaxis_percent = (anaphylaxis / total_evaluations * 100) if total_evaluations > 0 else 0
        
        # Colores para gráficos
        severity_colors = {
            "Mild": "#10b981",
            "Moderate": "#f59e0b",
            "Severe": "#ef4444",
            "No Symptoms": "#6b7280",
            "N/A": "#6b7280"
        }
        
        system_colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]
        allergen_colors = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16"]
        
        # Top 5 alérgenos
        top_allergens = sorted(allergen_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_allergens_data = [
            {"name": name, "value": count, "color": allergen_colors[i % len(allergen_colors)]}
            for i, (name, count) in enumerate(top_allergens)
        ]
        
        # Top 5 sistemas afectados
        top_systems = sorted(system_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_systems_data = [
            {"name": name, "value": count, "color": system_colors[i % len(system_colors)]}
            for i, (name, count) in enumerate(top_systems)
        ]
        
        # Distribución de severidad
        severity_data = [
            {"name": sev, "value": count, "color": severity_colors.get(sev, "#6b7280")}
            for sev, count in severity_counts.items()
        ]
        
        # Últimos 12 meses
        monthly_sorted = sorted(monthly_counts.items(), key=lambda x: x[0], reverse=True)[:12]
        monthly_sorted.reverse()  # Orden cronológico
        monthly_data = [
            {"name": mes, "value": count, "color": "#3b82f6"}
            for mes, count in monthly_sorted
        ]
        
        return {
            "total_patients": total_patients,
            "total_evaluations": total_evaluations,
            "anaphylaxis_count": anaphylaxis,
            "anaphylaxis_percent": round(anaphylaxis_percent, 1),
            "avg_nfass": round(avg_nfass, 2),
            "severity_distribution": severity_data,
            "top_allergens": top_allergens_data,
            "affected_systems": top_systems_data,
            "monthly_trend": monthly_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas: {str(e)}")
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