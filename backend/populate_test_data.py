"""
Script para poblar la base de datos con casos de prueba del sistema FASS
Genera pacientes ficticios con diferentes severidades, alérgenos y fechas
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import sqlite3
import psycopg2
import json
import hashlib
from datetime import datetime, timedelta
from app.security import encrypt_data, hash_password
from app.logic import calcular_nfass_ofass

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return sqlite3.connect(os.path.join(os.path.dirname(__file__), "app/fass_database.db"))

def generate_pseudonym(nhc):
    """Genera hash SHA256 del NHC"""
    hash_obj = hashlib.sha256(nhc.encode())
    return hash_obj.hexdigest()

# Casos de prueba con diferentes severidades y alérgenos
CASOS_PRUEBA = [
    # Caso 1: Anafilaxis severa por cacahuetes (reciente)
    {
        "nhc": "TEST001",
        "medico": "Dr. García",
        "rango_edad": "18-29",
        "genero": "Femenino",
        "alergeno": "Cacahuetes",
        "sintomas": [
            "itchy_mouth",           # SAO
            "urticaria_more_10",     # Urticaria generalizada
            "angioedema_generalized",# Angioedema facial
            "wheezing_severe",       # Broncoespasmo severo
            "cv_bp_drop",            # Hipotensión moderada
            "nausea_pain",           # Náuseas
            "emesis_1"               # Vómitos
        ],
        "respuestas": {
            "antecedentes": "Asma controlada",
            "medicacion_previa": "Antihistamínico 30 min antes",
            "lugar_reaccion": "Restaurante",
            "tiempo_sintomas": "15 minutos"
        },
        "dias_atras": 5
    },
    # Caso 2: Reacción moderada a leche (hace 1 mes)
    {
        "nhc": "TEST002",
        "medico": "Dr. García",
        "rango_edad": "Pediatría (<18)",
        "genero": "Masculino",
        "alergeno": "Leche de vaca",
        "sintomas": [
            "rash_few",              # Eritema localizado
            "pruritus_os_2",         # Prurito moderado
            "nausea_pain",           # Dolor abdominal
            "diarrhoea"              # Diarrea
        ],
        "respuestas": {
            "antecedentes": "Dermatitis atópica",
            "medicacion_previa": "Ninguna",
            "lugar_reaccion": "Domicilio",
            "tiempo_sintomas": "30 minutos"
        },
        "dias_atras": 30
    },
    # Caso 3: Anafilaxis por marisco (hace 2 meses)
    {
        "nhc": "TEST003",
        "medico": "Dr. García",
        "rango_edad": "30-49",
        "genero": "Masculino",
        "alergeno": "Gambas",
        "sintomas": [
            "itchy_mouth",           # SAO
            "angioedema_significant",# Angioedema lengua y labios
            "urticaria_more_10",     # Urticaria generalizada
            "wheezing_exp",          # Disnea moderada
            "cv_bp_drop",            # Hipotensión severa
            "ns_dizzy",              # Mareo
            "emesis_multiple"        # Vómitos persistentes
        ],
        "respuestas": {
            "antecedentes": "Primera reacción",
            "medicacion_previa": "Ninguna",
            "lugar_reaccion": "Restaurante",
            "tiempo_sintomas": "10 minutos"
        },
        "dias_atras": 60
    },
    # Caso 4: Reacción leve a huevo (hace 3 meses)
    {
        "nhc": "TEST004",
        "medico": "Dr. García",
        "rango_edad": "Pediatría (<18)",
        "genero": "Femenino",
        "alergeno": "Huevo",
        "sintomas": [
            "rash_few",              # Eritema perioral
            "pruritus_os"            # Prurito leve
        ],
        "respuestas": {
            "antecedentes": "Alergia conocida a huevo",
            "medicacion_previa": "Ninguna",
            "lugar_reaccion": "Domicilio",
            "tiempo_sintomas": "60 minutos"
        },
        "dias_atras": 90
    },
    # Caso 5: Anafilaxis por frutos secos (hace 4 meses)
    {
        "nhc": "TEST005",
        "medico": "Dr. García",
        "rango_edad": "50-69",
        "genero": "Femenino",
        "alergeno": "Nueces",
        "sintomas": [
            "angioedema_significant",# Angioedema facial
            "urticaria_more_10",     # Urticaria generalizada
            "wheezing_exp",          # Broncoespasmo moderado
            "cv_tachycardia",        # Taquicardia
            "nausea_pain",           # Náuseas
            "emesis_1"               # Vómitos
        ],
        "respuestas": {
            "antecedentes": "Alergia a frutos secos conocida",
            "medicacion_previa": "Antihistamínico",
            "lugar_reaccion": "Panadería",
            "tiempo_sintomas": "5 minutos"
        },
        "dias_atras": 120
    },
    # Caso 6: Reacción moderada a soja (hace 5 meses)
    {
        "nhc": "TEST006",
        "medico": "Dr. García",
        "rango_edad": "30-49",
        "genero": "Masculino",
        "alergeno": "Soja",
        "sintomas": [
            "pruritus_os_2",         # Prurito moderado
            "urticaria_3_10",        # Urticaria localizada
            "rhinitis_less_10",      # Rinorrea
            "nausea_pain"            # Náuseas
        ],
        "respuestas": {
            "antecedentes": "Ninguno",
            "medicacion_previa": "Ninguna",
            "lugar_reaccion": "Domicilio",
            "tiempo_sintomas": "45 minutos"
        },
        "dias_atras": 150
    },
    # Caso 7: Reacción leve a kiwi (hace 6 meses)
    {
        "nhc": "TEST007",
        "medico": "Dr. García",
        "rango_edad": "18-29",
        "genero": "Femenino",
        "alergeno": "Kiwi",
        "sintomas": [
            "itchy_mouth",           # SAO
            "pruritus_os"            # Prurito leve
        ],
        "respuestas": {
            "antecedentes": "Alergia al polen",
            "medicacion_previa": "Ninguna",
            "lugar_reaccion": "Domicilio",
            "tiempo_sintomas": "5 minutos"
        },
        "dias_atras": 180
    },
    # Caso 8: Anafilaxis por pescado (hace 7 meses)
    {
        "nhc": "TEST008",
        "medico": "Dr. García",
        "rango_edad": "50-69",
        "genero": "Masculino",
        "alergeno": "Merluza",
        "sintomas": [
            "angioedema_significant",# Angioedema lengua y labios
            "urticaria_more_10",     # Urticaria generalizada
            "wheezing_severe",       # Disnea severa
            "wheezing_audible",      # Broncoespasmo severo
            "cv_bp_drop",            # Hipotensión moderada
            "emesis_multiple"        # Vómitos persistentes
        ],
        "respuestas": {
            "antecedentes": "Asma no controlada",
            "medicacion_previa": "Ninguna",
            "lugar_reaccion": "Restaurante",
            "tiempo_sintomas": "20 minutos"
        },
        "dias_atras": 210
    },
    # Caso 9: Reacción moderada a trigo (hace 8 meses)
    {
        "nhc": "TEST009",
        "medico": "Dr. García",
        "rango_edad": "Pediatría (<18)",
        "genero": "Masculino",
        "alergeno": "Trigo",
        "sintomas": [
            "rash_more_50",          # Eritema generalizado
            "pruritus_os_2",         # Prurito moderado
            "nausea_pain",           # Dolor abdominal
            "diarrhoea",             # Diarrea
            "emesis_1"               # Náuseas
        ],
        "respuestas": {
            "antecedentes": "Dermatitis atópica",
            "medicacion_previa": "Ninguna",
            "lugar_reaccion": "Colegio",
            "tiempo_sintomas": "30 minutos"
        },
        "dias_atras": 240
    },
    # Caso 10: Anafilaxis severa por cacahuetes (hace 10 meses)
    {
        "nhc": "TEST010",
        "medico": "Dr. García",
        "rango_edad": "30-49",
        "genero": "Femenino",
        "alergeno": "Cacahuetes",
        "sintomas": [
            "itchy_mouth",           # SAO
            "angioedema_generalized",# Angioedema generalizado
            "urticaria_more_10",     # Urticaria generalizada
            "wheezing_audible",      # Disnea severa + broncoespasmo
            "cv_collapse",           # Hipotensión severa + síncope
            "frequent_nausea_pain_dec", # Dolor abdominal severo
            "emesis_multiple"        # Vómitos
        ],
        "respuestas": {
            "antecedentes": "Asma moderada",
            "medicacion_previa": "Ninguna",
            "lugar_reaccion": "Vía pública",
            "tiempo_sintomas": "5 minutos"
        },
        "dias_atras": 300
    },
    # Casos adicionales para otro médico (Dr. Martínez)
    {
        "nhc": "TEST011",
        "medico": "Dr. Martínez",
        "rango_edad": "18-29",
        "genero": "Masculino",
        "alergeno": "Almendras",
        "sintomas": [
            "urticaria_more_10",     # Urticaria generalizada
            "pruritus_os_2",         # Prurito moderado
            "rhinitis_less_10"       # Rinorrea
        ],
        "respuestas": {
            "antecedentes": "Alergia polen",
            "medicacion_previa": "Antihistamínico",
            "lugar_reaccion": "Domicilio",
            "tiempo_sintomas": "20 minutos"
        },
        "dias_atras": 15
    },
    {
        "nhc": "TEST012",
        "medico": "Dr. Martínez",
        "rango_edad": "Pediatría (<18)",
        "genero": "Femenino",
        "alergeno": "Fresas",
        "sintomas": [
            "itchy_mouth",           # SAO
            "rash_few",              # Eritema perioral
            "urticaria_more_3"       # Urticaria localizada
        ],
        "respuestas": {
            "antecedentes": "Ninguno",
            "medicacion_previa": "Ninguna",
            "lugar_reaccion": "Domicilio",
            "tiempo_sintomas": "10 minutos"
        },
        "dias_atras": 45
    }
]

def poblar_base_datos():
    """Inserta todos los casos de prueba en la base de datos"""
    conn = get_connection()
    cursor = conn.cursor()
    placeholder = "%s" if DATABASE_URL else "?"
    
    print(f"🔄 Insertando {len(CASOS_PRUEBA)} casos de prueba...\n")
    
    insertados = 0
    errores = 0
    
    for i, caso in enumerate(CASOS_PRUEBA, 1):
        try:
            # 1. Generar hash del NHC
            nhc_hash = generate_pseudonym(caso["nhc"])
            
            # 2. Encriptar datos sensibles
            genero_enc = encrypt_data(caso["genero"])
            respuestas_enc = encrypt_data(json.dumps(caso["respuestas"]))
            evento_json = {
                "alergeno": caso["alergeno"],
                "fecha_evento": (datetime.now() - timedelta(days=caso["dias_atras"])).strftime("%Y-%m-%d")
            }
            evento_enc = encrypt_data(json.dumps(evento_json))
            sintomas_enc = encrypt_data(json.dumps(caso["sintomas"]))
            
            # 3. Calcular nFASS y OFASS
            resultado = calcular_nfass_ofass(caso["sintomas"])
            
            # 4. Insertar o actualizar paciente
            cursor.execute(f"SELECT id FROM pacientes WHERE nhc_hash = {placeholder}", (nhc_hash,))
            res_paciente = cursor.fetchone()
            
            if res_paciente:
                paciente_id = res_paciente[0]
            else:
                cursor.execute(f"""
                    INSERT INTO pacientes (nhc_hash, rango_edad, genero, medico)
                    VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder})
                    RETURNING id
                """, (nhc_hash, caso["rango_edad"], genero_enc, caso["medico"]))
                paciente_id = cursor.fetchone()[0]
            
            # 5. Insertar registro con fecha personalizada
            if DATABASE_URL:
                # PostgreSQL
                cursor.execute(f"""
                    INSERT INTO registros 
                    (paciente_id, medico, respuestas_json, evento_json, sintomas, 
                     nfass, ofass_grade, ofass_category, risk_level, fecha)
                    VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder},
                            {placeholder}, {placeholder}, {placeholder}, {placeholder}, 
                            NOW() - INTERVAL '{caso['dias_atras']} days')
                """, (
                    paciente_id, caso["medico"], respuestas_enc, evento_enc, sintomas_enc,
                    float(resultado["nfass"]), int(resultado["ofass_grade"]),
                    resultado["ofass_category"], resultado["risk_level"]
                ))
            else:
                # SQLite
                fecha_evento = (datetime.now() - timedelta(days=caso["dias_atras"])).strftime("%Y-%m-%d %H:%M:%S")
                cursor.execute(f"""
                    INSERT INTO registros 
                    (paciente_id, medico, respuestas_json, evento_json, sintomas, 
                     nfass, ofass_grade, ofass_category, risk_level, fecha)
                    VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder},
                            {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
                """, (
                    paciente_id, caso["medico"], respuestas_enc, evento_enc, sintomas_enc,
                    float(resultado["nfass"]), int(resultado["ofass_grade"]),
                    resultado["ofass_category"], resultado["risk_level"], fecha_evento
                ))
            
            conn.commit()
            insertados += 1
            
            print(f"✅ Caso {i}/{len(CASOS_PRUEBA)}: {caso['alergeno']} - {resultado['ofass_category']} "
                  f"(nFASS: {resultado['nfass']:.2f}, OFASS: {resultado['ofass_grade']}) - {caso['medico']}")
            
        except Exception as e:
            errores += 1
            print(f"❌ Error en caso {i} ({caso.get('alergeno', 'desconocido')}): {str(e)}")
            conn.rollback()
    
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"✅ Insertados correctamente: {insertados}")
    print(f"❌ Errores: {errores}")
    print(f"📊 Total procesados: {len(CASOS_PRUEBA)}")
    print(f"{'='*60}\n")

def crear_usuarios_prueba():
    """Crea usuarios de prueba para los médicos"""
    conn = get_connection()
    cursor = conn.cursor()
    placeholder = "%s" if DATABASE_URL else "?"
    
    usuarios = [
        {"username": "Dr. García", "password": "garcia123"},
        {"username": "Dr. Martínez", "password": "martinez123"},
        {"username": "admin", "password": "admin123"}
    ]
    
    print("🔄 Creando usuarios de prueba...\n")
    
    for user in usuarios:
        try:
            # Verificar si ya existe
            cursor.execute(f"SELECT id FROM usuarios WHERE username = {placeholder}", (user["username"],))
            if cursor.fetchone():
                print(f"⚠️  Usuario '{user['username']}' ya existe, omitiendo...")
                continue
            
            # Hash de la contraseña
            hashed_pw = hash_password(user["password"])
            
            # Insertar usuario
            cursor.execute(
                f"INSERT INTO usuarios (username, password) VALUES ({placeholder}, {placeholder})",
                (user["username"], hashed_pw)
            )
            conn.commit()
            print(f"✅ Usuario creado: {user['username']} / {user['password']}")
            
        except Exception as e:
            print(f"❌ Error creando usuario {user['username']}: {str(e)}")
            conn.rollback()
    
    conn.close()
    print()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏥 SISTEMA FASS - Población de Datos de Prueba")
    print("="*60 + "\n")
    
    try:
        crear_usuarios_prueba()
        poblar_base_datos()
        print("✅ Proceso completado. Puedes probar el dashboard ahora.\n")
    except Exception as e:
        print(f"❌ Error crítico: {str(e)}\n")
        import traceback
        traceback.print_exc()
