import numpy as np
from .sintomas import DB_SINTOMAS

def calcular_nfass_ofass(sintomas_ids):
    """
    Calcula la severidad nFASS basada en la Tabla 2.
    Paso 1 & 2: Calcular contribución por Órgano/Sistema (nFASSo)
    Paso 3: Sumar contribuciones y aplicar log2(suma) + 2
    """
    if not sintomas_ids:
        return {
            "nfass": 0.0, 
            "ofass_grade": 0, 
            "ofass_category": "No Symptoms", 
            "risk_level": "Low"
        }

    # 1. Agrupamos los lambdas por SISTEMA (Órgano), no por epsilon
    # Estructura: { 'Skin': {'epsilon': 0, 'lambdas': [0.08, ...]}, 'Eye': ... }
    sistemas_data = {}

    for s_id in sintomas_ids:
        if s_id in DB_SINTOMAS:
            s = DB_SINTOMAS[s_id]
            sys_name = s['sys']
            
            if sys_name not in sistemas_data:
                sistemas_data[sys_name] = {
                    'epsilon': s['epsilon'],
                    'lambdas_sum': 0
                }
            
            # Sumamos los lambdas de los síntomas que pertenecen al mismo sistema
            sistemas_data[sys_name]['lambdas_sum'] += s['lambda']

    # 2. Paso 2 de la Tabla: Calcular nFASSo por cada sistema
    # nFASSo = 2^ε * (1 + Σλ)
    suma_total_sistemas = 0
    for sys_name, data in sistemas_data.items():
        eps = data['epsilon']
        suma_lam = data['lambdas_sum']
        
        nfass_organo = (2**eps) * (1 + suma_lam)
        suma_total_sistemas += nfass_organo

    # 3. Paso 3 de la Tabla: Transformación logarítmica
    # nFASS = log2( Σ nFASSo ) + 2
    if suma_total_sistemas <= 0:
        return {"nfass": 0.0, "ofass_grade": 0, "ofass_category": "N/A", "risk_level": "Low"}

    nfass_final = round(np.log2(suma_total_sistemas) + 2, 2)

    # 4. Clasificación oFASS (Basada en rangos clínicos estándar)
    # nFASS de 6.59 (como el ejemplo de la tabla) es Grado 5
    if nfass_final >= 6.0:
        ofass_grade, category, risk = 5, "Life-threatening", "Very High"
    elif nfass_final >= 5.0:
        ofass_grade, category, risk = 4, "Severe", "High"
    elif nfass_final >= 3.5:
        ofass_grade, category, risk = 3, "Moderate", "Medium"
    elif nfass_final >= 2.0:
        ofass_grade, category, risk = 2, "Mild-Moderate", "Medium"
    else:
        ofass_grade, category, risk = 1, "Mild", "Low"

    return {
        "nfass": nfass_final,
        "ofass_grade": ofass_grade,
        "ofass_category": category,
        "risk_level": risk
    }