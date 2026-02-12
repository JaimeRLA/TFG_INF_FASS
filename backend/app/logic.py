import numpy as np 
from .sintomas import DB_SINTOMAS

def calcular_nfass_ofass(sintomas_ids):
    """
    Calcula la severidad nFASS y mapea a oFASS según las tablas S1, S2 y S12.
    Fórmula: Σ (λ * 10^ε) con ajustes de base por gravedad.
    """
    if not sintomas_ids:
        return {"nfass": 0, "ofass_grade": 0, "ofass_category": "N/A", "risk_level": "Low"}

    total_lambdas_weighted = 0
    sistemas_afectados = set()

    # Cálculo nFASS puro [cite: 5, 34]
    for s_id in sintomas_ids:
        if s_id in DB_SINTOMAS:
            s = DB_SINTOMAS[s_id]
            total_lambdas_weighted += 2**s['epsilon']*(1+s['lambda'])
            sistemas_afectados.add(s['sys'])

    nfass_final = round(np.log2((total_lambdas_weighted)) + 2,3)

    # Clasificación oFASS-5 y oFASS-3 [cite: 26, 30]
    if nfass_final >= 6.0:
        ofass_grade, category, risk = 5, "Severe"
    elif nfass_final >= 4.0:
        ofass_grade, category, risk = 4, "Severe"
    elif nfass_final >= 3.0:
        ofass_grade, category, risk = 3, "Moderate"
    elif nfass_final >= 2.0:
        ofass_grade, category, risk = 2, "Moderate"
    else:
        ofass_grade, category, risk = 1, "Mild"

    return {
    "nfass": nfass_final,
    "ofass_grade": ofass_grade,
    "ofass_category": category,
    "risk_level": risk
    } 