import numpy as np 
from .sintomas import DB_SINTOMAS

def calcular_nfass_ofass(sintomas_ids):
    """
    Calcula la severidad nFASS agrupando lambdas por nivel de epsilon.
    Fórmula: nFASS = log2( Σ [ 2^ε * (1 + Σ λ_en_ese_ε) ] ) + 2
    """
    if not sintomas_ids:
        return {
            "nfass": 0.0, 
            "ofass_grade": 0, 
            "ofass_category": "No Symptoms", 
            "risk_level": "Low"
        }

    # 1. Agrupamos los lambdas por cada nivel de epsilon (ε)
    # Diccionario: { epsilon: suma_de_lambdas }
    grupos_epsilon = {}
    sistemas_afectados = set()

    for s_id in sintomas_ids:
        if s_id in DB_SINTOMAS:
            s = DB_SINTOMAS[s_id]
            eps = s['epsilon']
            lam = s['lambda']
            
            # Sumamos el lambda al grupo correspondiente de epsilon
            grupos_epsilon[eps] = grupos_epsilon.get(eps, 0) + lam
            sistemas_afectados.add(s['sys'])

    # 2. Calculamos la suma ponderada final usando los grupos
    total_weighted = 0
    for eps, suma_lambdas in grupos_epsilon.items():
        # Aquí sumamos los lambdas primero antes de multiplicar por la potencia
        total_weighted += (2**eps) * (1 + suma_lambdas)

    # 3. Aplicación de la fórmula logarítmica
    if total_weighted <= 0:
        return {"nfass": 0.0, "ofass_grade": 0, "ofass_category": "N/A", "risk_level": "Low"}

    nfass_final = round(np.log2(total_weighted) + 2, 3)

    # Limitar el nFASS a un rango lógico (0 - 10)
    nfass_final = max(0.0, min(10.0, nfass_final))

    # 4. Clasificación oFASS
    # Nota: Al sumar lambdas primero, los valores de nFASS suelen ser más bajos,
    # por lo que los puntos de corte se ajustan ligeramente.
    if nfass_final >= 6.5:
        ofass_grade, category, risk = 5, "Severe", "High"
    elif nfass_final >= 4.5:
        ofass_grade, category, risk = 4, "Severe", "High"
    elif nfass_final >= 3.0:
        ofass_grade, category, risk = 3, "Moderate", "Medium"
    elif nfass_final >= 1.5:
        ofass_grade, category, risk = 2, "Moderate", "Medium"
    else:
        ofass_grade, category, risk = 1, "Mild", "Low"

    return {
        "nfass": nfass_final,
        "ofass_grade": ofass_grade,
        "ofass_category": category,
        "risk_level": risk
    }