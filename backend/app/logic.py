import numpy as np 
def calcular_nfass_ofass(sintomas_ids):
    """
    Calcula la severidad nFASS y mapea a oFASS según las tablas S1, S2 y S12.
    Fórmula: Σ (λ * 10^ε) con ajustes de base por gravedad.
    """
    if not sintomas_ids:
        return {"nfass": 0, "ofass_grade": 0, "ofass_category": "N/A", "risk_level": "Low"}

    # Base de datos de síntomas según Tabla S1 y S12 
    DB_SINTOMAS = {
        'itchy_mouth':      {'sys': 'Oral',    'lambda': 0.05, 'epsilon': -1},
        'nausea_pain':      {'sys': 'GI',      'lambda': 0.03, 'epsilon': 0},
        'frequent_nausea_pain':      {'sys': 'GI',      'lambda': 0.04, 'epsilon': 0},
        'frequent_nausea_pain_dec':      {'sys': 'GI',      'lambda': 0.05, 'epsilon': 0},
        'emesis_1':         {'sys': 'GI',      'lambda': 0.05, 'epsilon': 0},
        'emesis_multiple':  {'sys': 'GI',      'lambda': 0.08, 'epsilon': 0},
        'diarrhoea':         {'sys': 'GI',      'lambda': 0.05, 'epsilon': 0},
        'diarrhoea_multiple':  {'sys': 'GI',      'lambda': 0.08, 'epsilon': 0},
        'pruritus_os':    {'sys': 'Skin',    'lambda': 0.01, 'epsilon': 0},
        'pruritus_os_2':  {'sys': 'Skin',    'lambda': 0.02, 'epsilon': 0},
        'pruritus_os_hard':  {'sys': 'Skin',    'lambda': 0.05, 'epsilon': 0},
        'rash_few':    {'sys': 'Skin',    'lambda': 0.01, 'epsilon': 0},
        'rash_less_50':  {'sys': 'Skin',    'lambda': 0.05, 'epsilon': 0},
        'rash_more_50':  {'sys': 'Skin',    'lambda': 0.08, 'epsilon': 0},
        'urticaria_more_3':    {'sys': 'Skin',    'lambda': 0.05, 'epsilon': 0},
        'urticaria_3_10':    {'sys': 'Skin',    'lambda': 0.07, 'epsilon': 0},
        'urticaria_more_10':    {'sys': 'Skin',    'lambda': 0.08, 'epsilon': 0},
        'angioedema_mild ':  {'sys': 'Skin',    'lambda': 0.05, 'epsilon': 0},
        'angioedema_significant':  {'sys': 'Skin',    'lambda': 0.07, 'epsilon': 0},
        'angioedema_generalized':  {'sys': 'Skin',    'lambda': 0.08, 'epsilon': 0},
        'rhinitis_rare':     {'sys': 'Eye/Nose', 'lambda': 0.01, 'epsilon': 0},
        'rhinitis_less_10':  {'sys': 'Eye/Nose', 'lambda': 0.05, 'epsilon': 0},
        'rhinitis_long':  {'sys': 'Eye/Nose', 'lambda': 0.08, 'epsilon': 0},
        'eyes_rare':     {'sys': 'Eye/Nose', 'lambda': 0.05, 'epsilon': 0},
        'eyes_continuos':  {'sys': 'Eye/Nose', 'lambda': 0.08, 'epsilon': 0},
        'wheezing_exp':     {'sys': 'Bronchi', 'lambda': 0.06, 'epsilon': 2},
        'wheezing_severe':  {'sys': 'Bronchi', 'lambda': 0.07, 'epsilon': 2},
        'wheezing_audible':  {'sys': 'Bronchi', 'lambda': 0.08, 'epsilon': 2},
        'laryngeal_throat':          {'sys': 'Larynx',  'lambda': 0.05, 'epsilon': 2},
        'laryngeal_more_3':          {'sys': 'Larynx',  'lambda': 0.05, 'epsilon': 2},
        'laryngeal_frequent_cough':          {'sys': 'Larynx',  'lambda': 0.07, 'epsilon': 2},
        'laryngeal_stridor':          {'sys': 'Larynx',  'lambda': 0.08, 'epsilon': 2},
        'cv_tachycardia':          {'sys': 'CV',      'lambda': 0.05, 'epsilon': 4},
        'cv_bp_drop':          {'sys': 'CV',      'lambda': 0.07, 'epsilon': 4},
        'cv_collapse':      {'sys': 'CV',      'lambda': 0.08, 'epsilon': 4},
        'ns_dizzy':{'sys': 'NS',      'lambda': 0.05, 'epsilon': 4},
        'ns_significant_change ':{'sys': 'NS',      'lambda': 0.07, 'epsilon': 4},
        'ns_loss_consciousness':{'sys': 'NS',      'lambda': 0.08, 'epsilon': 4}


        
    }

    total_lambdas_weighted = 0
    max_epsilon = -1
    sistemas_afectados = set()

    # Cálculo nFASS puro [cite: 5, 34]
    for s_id in sintomas_ids:
        if s_id in DB_SINTOMAS:
            s = DB_SINTOMAS[s_id]
            total_lambdas_weighted += 2**s['epsilon']*(1+s['lambda'])
            sistemas_afectados.add(s['sys'])
            if s['epsilon'] > max_epsilon:
                max_epsilon = s['epsilon']

    nfass_final = round(np.log2((total_lambdas_weighted)) + 2,3)

    # Clasificación oFASS-5 y oFASS-3 [cite: 26, 30]
    if nfass_final >= 6.0:
        ofass_grade, category, risk = 5, "Severe", "High"
    elif nfass_final >= 4.0:
        ofass_grade, category, risk = 4, "Severe", "High"
    elif nfass_final >= 3.0:
        ofass_grade, category, risk = 3, "Moderate", "Medium"
    elif nfass_final >= 2.0:
        ofass_grade, category, risk = 2, "Moderate", "Medium"
    else:
        ofass_grade, category, risk = 1, "Mild", "Low"

    return {
    "nfass": nfass_final,
    "ofass_grade": ofass_grade,
    "ofass_category": category,
    "risk_level": risk
    } 