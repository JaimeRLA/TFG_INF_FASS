"""
Base de conocimiento médica extendida para asistencia en clasificación de síntomas del Síndrome de Sjögren
"""

KNOWLEDGE_BASE = {
    "symptoms_detailed": {
        # ============================================
        # 1. ORAL Y GASTROINTESTINAL
        # ============================================
        "oral": {
            "system": "Oral y Gastrointestinal",
            "epsilon": 2,
            "symptoms": {
                "itchy_mouth": {
                    "id": "itchy_mouth",
                    "name": "Picor oral/garganta",
                    "lambda": 0.05,
                    "severity": "leve",
                    "clinical_description": "Sensación de prurito en mucosa oral o faríngea",
                    "classification_guide": {
                        "cuando_seleccionar": "Paciente reporta sensación de picazón o irritación en boca o garganta sin dolor significativo",
                        "signs_to_look": [
                            "Paciente se pasa la lengua frecuentemente por paladar",
                            "Refiere necesidad de rascarse la garganta",
                            "Sensación de irritación sin lesiones visibles"
                        ],
                        "differential": "Diferenciar de dolor faríngeo (infección) o xerostomía severa",
                        "cuando_no_seleccionar": "Si hay dolor intenso, lesiones visibles o disfagia"
                    },
                    "clinical_impact": "Bajo - molestia sin limitación funcional",
                    "treatment_considerations": "Generalmente responde a hidratación y medidas locales"
                }
            }
        },
        "gi_pain": {
            "system": "Oral y Gastrointestinal",
            "epsilon": 2,
            "symptoms": {
                "nausea_pain": {
                    "id": "nausea_pain",
                    "name": "Dolor/Náuseas leves",
                    "lambda": 0.03,
                    "severity": "leve",
                    "clinical_description": "Malestar abdominal o náuseas ocasionales que no interfieren con actividades",
                    "classification_guide": {
                        "cuando_seleccionar": "Náuseas o dolor abdominal leve, intermitente, que no requiere medicación",
                        "signs_to_look": [
                            "Paciente puede continuar con actividades normales",
                            "No presenta vómitos",
                            "No requiere analgésicos o antieméticos",
                            "Síntomas mejoran espontáneamente"
                        ],
                        "severity_markers": {
                            "leve": "Ocasional, <3 veces/semana, autolimitado",
                            "escala_dolor": "1-3/10 en escala EVA"
                        },
                        "differential": "Diferenciar de dispepsia funcional o gastritis leve",
                        "cuando_no_seleccionar": "Si hay vómitos, dolor intenso o síntomas diarios"
                    },
                    "clinical_impact": "Bajo - no interfiere con actividades diarias",
                    "treatment_considerations": "Medidas dietéticas, observación"
                },
                "frequent_nausea_pain": {
                    "id": "frequent_nausea_pain",
                    "name": "Dolor/Náuseas frecuentes",
                    "lambda": 0.04,
                    "severity": "moderado",
                    "clinical_description": "Náuseas o dolor abdominal recurrente que puede requerir medicación ocasional",
                    "classification_guide": {
                        "cuando_seleccionar": "Síntomas presentes >3-4 días/semana o requieren medicación ocasional",
                        "signs_to_look": [
                            "Paciente refiere molestias frecuentes",
                            "Ha requerido antieméticos o analgésicos al menos una vez",
                            "Síntomas predicibles (ej: después de comidas)",
                            "Puede requerir ajustes dietéticos"
                        ],
                        "severity_markers": {
                            "moderado": "Semanal, afecta algunas actividades",
                            "escala_dolor": "4-6/10 en escala EVA"
                        },
                        "differential": "Considerar gastritis, síndrome intestino irritable, dispepsia",
                        "cuando_no_seleccionar": "Si hay vómitos persistentes o incapacidad para trabajar"
                    },
                    "clinical_impact": "Moderado - afecta calidad de vida, requiere tratamiento",
                    "treatment_considerations": "Antieméticos, analgésicos, modificación dietética"
                },
                "frequent_nausea_pain_dec": {
                    "id": "frequent_nausea_pain_dec",
                    "name": "Dolor/Náuseas con distrés o actividad disminuida",
                    "lambda": 0.05,
                    "severity": "moderado-severo",
                    "clinical_description": "Síntomas significativos que limitan actividades diarias o causan distrés",
                    "classification_guide": {
                        "cuando_seleccionar": "Náuseas/dolor que impiden actividades normales o causan ansiedad significativa",
                        "signs_to_look": [
                            "Paciente ha faltado al trabajo/escuela",
                            "Evita comer por miedo a síntomas",
                            "Refiere ansiedad anticipatoria",
                            "Pérdida de peso no intencional",
                            "Requiere medicación regular"
                        ],
                        "severity_markers": {
                            "severo": "Diario o casi diario, limitación funcional",
                            "escala_dolor": "6-8/10 en escala EVA",
                            "impacto_psicologico": "Ansiedad, evitación de situaciones"
                        },
                        "differential": "Descartar patología orgánica grave (úlcera, obstrucción)",
                        "cuando_no_seleccionar": "Si hay vómitos incoercibles o signos de alarma (sangrado, pérdida de peso severa)"
                    },
                    "clinical_impact": "Alto - limitación funcional, deterioro calidad de vida",
                    "treatment_considerations": "Tratamiento farmacológico activo, evaluación gastroenterológica, apoyo psicológico"
                }
            }
        },
        "gi_emesis": {
            "system": "Oral y Gastrointestinal",
            "epsilon": 3,
            "symptoms": {
                "emesis_1": {
                    "id": "emesis_1",
                    "name": "Vómito - 1 episodio",
                    "lambda": 0.05,
                    "severity": "moderado",
                    "clinical_description": "Episodio aislado de vómito en período evaluado",
                    "classification_guide": {
                        "cuando_seleccionar": "Un solo episodio de vómito en las últimas 24-48 horas",
                        "signs_to_look": [
                            "Episodio único, autolimitado",
                            "Paciente puede tolerar líquidos después",
                            "No hay deshidratación",
                            "Estado general conservado"
                        ],
                        "severity_markers": {
                            "moderado": "1 episodio, sin complicaciones",
                            "hidratacion": "Mucosas húmedas, buen turgor cutáneo"
                        },
                        "differential": "Distinguir de náuseas sin vómito o gastroenteritis aguda",
                        "cuando_no_seleccionar": "Si hay múltiples episodios o signos de deshidratación"
                    },
                    "clinical_impact": "Moderado - episodio aislado sin complicaciones",
                    "treatment_considerations": "Observación, hidratación oral, antiemético si necesario"
                },
                "emesis_multiple": {
                    "id": "emesis_multiple",
                    "name": "Vómito - >1 episodio",
                    "lambda": 0.08,
                    "severity": "severo",
                    "clinical_description": "Múltiples episodios de vómito que pueden causar deshidratación",
                    "classification_guide": {
                        "cuando_seleccionar": "Dos o más episodios de vómito en 24 horas",
                        "signs_to_look": [
                            "Vómitos recurrentes",
                            "Dificultad para tolerar líquidos",
                            "Signos de deshidratación (mucosas secas, oliguria)",
                            "Debilidad, mareo postural",
                            "Puede requerir hidratación IV"
                        ],
                        "severity_markers": {
                            "severo": "≥2 episodios/24h",
                            "hidratacion": "Signos de deshidratación",
                            "funcional": "Incapacidad para mantener hidratación oral"
                        },
                        "red_flags": [
                            "Vómitos con sangre (hematemesis)",
                            "Signos de deshidratación severa",
                            "Dolor abdominal intenso asociado",
                            "Fiebre alta"
                        ],
                        "cuando_no_seleccionar": "Si es un solo episodio aislado"
                    },
                    "clinical_impact": "Alto - riesgo de deshidratación, requiere intervención",
                    "treatment_considerations": "Antieméticos IV, hidratación IV si necesario, evaluación urgente"
                }
            }
        },
        "gi_diarrhoea": {
            "system": "Oral y Gastrointestinal",
            "epsilon": 3,
            "symptoms": {
                "diarrhoea": {
                    "id": "diarrhoea",
                    "name": "Diarrea - 1 episodio",
                    "lambda": 0.05,
                    "severity": "moderado",
                    "clinical_description": "Episodio único de deposiciones líquidas o muy blandas",
                    "classification_guide": {
                        "cuando_seleccionar": "Una deposición diarreica en período evaluado (24-48h)",
                        "signs_to_look": [
                            "Deposición líquida única",
                            "Sin sangre o moco",
                            "Sin fiebre",
                            "Paciente mantiene hidratación",
                            "No hay dolor abdominal severo"
                        ],
                        "severity_markers": {
                            "moderado": "1 episodio, autolimitado",
                            "clasificacion_bristol": "Tipo 6-7 en escala Bristol"
                        },
                        "differential": "Distinguir de cambio transitorio vs inicio de gastroenteritis",
                        "cuando_no_seleccionar": "Si hay sangre, mucosidad abundante o múltiples episodios"
                    },
                    "clinical_impact": "Moderado - episodio aislado sin complicaciones",
                    "treatment_considerations": "Hidratación oral, observación, dieta blanda"
                },
                "diarrhoea_multiple": {
                    "id": "diarrhoea_multiple",
                    "name": "Diarrea - >1 episodio",
                    "lambda": 0.08,
                    "severity": "severo",
                    "clinical_description": "Múltiples episodios de diarrea que pueden causar deshidratación",
                    "classification_guide": {
                        "cuando_seleccionar": "Dos o más deposiciones diarreicas en 24 horas",
                        "signs_to_look": [
                            "≥2 deposiciones líquidas/24h",
                            "Urgencia fecal",
                            "Puede haber dolor abdominal tipo cólico",
                            "Riesgo de deshidratación",
                            "Limitación de actividades"
                        ],
                        "severity_markers": {
                            "severo": "≥3 deposiciones/24h o >1L de pérdidas",
                            "hidratacion": "Evaluar signos de deshidratación",
                            "funcional": "Interfiere con trabajo/actividades"
                        },
                        "red_flags": [
                            "Sangre en heces (hematoquecia)",
                            "Fiebre >38.5°C",
                            "Signos de deshidratación",
                            "Dolor abdominal severo",
                            "Duración >3 días"
                        ],
                        "evaluate_for": [
                            "Gastroenteritis infecciosa",
                            "Colitis microscópica (común en Sjögren)",
                            "Enfermedad celíaca asociada",
                            "Malabsorción"
                        ]
                    },
                    "clinical_impact": "Alto - riesgo de deshidratación y desnutrición",
                    "treatment_considerations": "Hidratación agresiva, antidiarreicos si apropiado, estudios microbiológicos, evaluación gastroenterológica"
                }
            }
        },

        # ============================================
        # 2. PIEL Y MUCOSAS
        # ============================================
        "skin_pruritus": {
            "system": "Piel y Mucosas",
            "epsilon": 1,
            "symptoms": {
                "pruritus_os": {
                    "id": "pruritus_os",
                    "name": "Prurito ocasional",
                    "lambda": 0.01,
                    "severity": "leve",
                    "clinical_description": "Picazón cutánea intermitente que no interfiere con actividades",
                    "classification_guide": {
                        "cuando_seleccionar": "Prurito esporádico, <3 veces/semana, no afecta sueño ni actividades",
                        "signs_to_look": [
                            "Rascado ocasional sin lesiones",
                            "Sin excoriaciones",
                            "Sueño no afectado",
                            "No requiere antihistamínicos regulares",
                            "Piel sin cambios significativos"
                        ],
                        "severity_markers": {
                            "leve": "EVA prurito <3/10",
                            "frecuencia": "<3 episodios/semana",
                            "duracion": "<30 minutos/episodio"
                        },
                        "differential": "Distinguir de xerosis (piel seca) simple vs prurito patológico"
                    },
                    "clinical_impact": "Bajo - no afecta calidad de vida",
                    "treatment_considerations": "Hidratación cutánea, emolientes"
                },
                "pruritus_os_2": {
                    "id": "pruritus_os_2",
                    "name": "Prurito continuo",
                    "lambda": 0.02,
                    "severity": "moderado",
                    "clinical_description": "Picazón persistente que puede interrumpir actividades o sueño ocasionalmente",
                    "classification_guide": {
                        "cuando_seleccionar": "Prurito diario o casi diario, puede afectar sueño, requiere tratamiento",
                        "signs_to_look": [
                            "Rascado frecuente visible",
                            "Excoriaciones leves",
                            "Alguna alteración del sueño",
                            "Usa antihistamínicos ocasionalmente",
                            "Xerosis cutánea moderada"
                        ],
                        "severity_markers": {
                            "moderado": "EVA prurito 4-6/10",
                            "frecuencia": "Diario",
                            "impacto_sueno": "1-2 despertares/semana"
                        },
                        "differential": "Descartar causas secundarias (dermatitis, alergia, colestasis)"
                    },
                    "clinical_impact": "Moderado - afecta calidad de vida y sueño",
                    "treatment_considerations": "Antihistamínicos, corticoides tópicos leves, emolientes intensivos"
                },
                "pruritus_os_hard": {
                    "id": "pruritus_os_hard",
                    "name": "Prurito intenso",
                    "lambda": 0.05,
                    "severity": "severo",
                    "clinical_description": "Picazón intensa e incapacitante que interfiere significativamente con sueño y actividades",
                    "classification_guide": {
                        "cuando_seleccionar": "Prurito severo, constante, alteración importante del sueño, excoriaciones significativas",
                        "signs_to_look": [
                            "Excoriaciones severas, sangrado",
                            "Liquenificación cutánea",
                            "Insomnio significativo",
                            "Necesita antihistamínicos diarios/múltiples",
                            "Impacto emocional (ansiedad, depresión)",
                            "Limitación funcional"
                        ],
                        "severity_markers": {
                            "severo": "EVA prurito >7/10",
                            "frecuencia": "Constante o casi constante",
                            "impacto_sueno": "Despertares nocturnos diarios",
                            "funcional": "Interfiere con trabajo/actividades sociales"
                        },
                        "red_flags": [
                            "Ictericia (colestasis)",
                            "Pérdida de peso (linfoma, cáncer)",
                            "Adenopatías",
                            "Fiebre"
                        ],
                        "evaluate_for": [
                            "Cirrosis biliar primaria (común en Sjögren)",
                            "Linfoma",
                            "Reacción medicamentosa",
                            "Dermatosis pruriginosas"
                        ]
                    },
                    "clinical_impact": "Alto - deterioro significativo calidad de vida, impacto psicológico",
                    "treatment_considerations": "Tratamiento sistémico agresivo, evaluación dermatológica urgente, considerar gabapentina/pregabalina, apoyo psicológico"
                }
            }
        },
        "skin_rash": {
            "system": "Piel y Mucosas",
            "epsilon": 2,
            "symptoms": {
                "rash_few": {
                    "id": "rash_few",
                    "name": "Rash/Eritema leve (Faint)",
                    "lambda": 0.05,
                    "severity": "leve",
                    "clinical_description": "Eritema tenue, localizado, sin síntomas sistémicos",
                    "classification_guide": {
                        "cuando_seleccionar": "Eritema leve, localizado, <10% superficie corporal, sin síntomas",
                        "signs_to_look": [
                            "Enrojecimiento tenue",
                            "Bien delimitado",
                            "Área pequeña (<10% SC)",
                            "Sin edema ni descamación",
                            "No hay prurito significativo",
                            "Sin adenopatías"
                        ],
                        "severity_markers": {
                            "leve": "<10% superficie corporal",
                            "distribucion": "Localizado",
                            "sintomas": "Asintomático o prurito mínimo"
                        },
                        "differential": "Distinguir de eritema fisiológico vs patológico"
                    },
                    "clinical_impact": "Bajo - hallazgo clínico sin impacto funcional",
                    "treatment_considerations": "Observación, emolientes, puede no requerir tratamiento"
                },
                "rash_less_50": {
                    "id": "rash_less_50",
                    "name": "Rash/Eritema ≤50% superficie",
                    "lambda": 0.07,
                    "severity": "moderado",
                    "clinical_description": "Eritema extendido que afecta hasta la mitad de la superficie corporal",
                    "classification_guide": {
                        "cuando_seleccionar": "Rash que compromete 10-50% de superficie corporal",
                        "signs_to_look": [
                            "Eritema moderado a intenso",
                            "Múltiples áreas afectadas",
                            "10-50% superficie corporal",
                            "Puede haber descamación leve",
                            "Prurito moderado",
                            "Sin afectación mucosas"
                        ],
                        "severity_markers": {
                            "moderado": "10-50% superficie corporal",
                            "distribucion": "Múltiple pero no generalizado",
                            "morfologia": "Maculopapular, puede ser confluente"
                        },
                        "evaluate_for": [
                            "Lupus cutáneo subagudo (SCLE)",
                            "Vasculitis cutánea",
                            "Reacción medicamentosa",
                            "Dermatitis"
                        ]
                    },
                    "clinical_impact": "Moderado - afecta apariencia y comodidad",
                    "treatment_considerations": "Corticoides tópicos, antihistamínicos, protección solar, evaluación dermatológica"
                },
                "rash_3_10": {
                    "id": "rash_3_10",
                    "name": "Rash/Eritema >50% superficie",
                    "lambda": 0.08,
                    "severity": "severo",
                    "clinical_description": "Eritema extenso y generalizado que afecta más de la mitad del cuerpo",
                    "classification_guide": {
                        "cuando_seleccionar": "Rash generalizado, >50% superficie corporal, puede haber síntomas sistémicos",
                        "signs_to_look": [
                            "Eritema extenso, confluente",
                            ">50% superficie corporal",
                            "Puede incluir tronco y extremidades",
                            "Descamación significativa posible",
                            "Prurito intenso común",
                            "Puede haber afectación mucosas"
                        ],
                        "severity_markers": {
                            "severo": ">50% superficie corporal",
                            "distribucion": "Generalizado",
                            "sintomas_sistemicos": "Fiebre, malestar posibles"
                        },
                        "red_flags": [
                            "Ampollas o lesiones necróticas",
                            "Afectación mucosas (Stevens-Johnson)",
                            "Fiebre alta",
                            "Adenopatías generalizadas",
                            "Deterioro estado general"
                        ],
                        "evaluate_for": [
                            "Eritema multiforme",
                            "Reacción medicamentosa severa (DRESS, SJS)",
                            "Lupus eritematoso sistémico activo",
                            "Vasculitis sistémica"
                        ]
                    },
                    "clinical_impact": "Alto - requiere evaluación urgente, puede ser grave",
                    "treatment_considerations": "Evaluación dermatológica urgente, considerar hospitalización, corticoides sistémicos, suspender fármacos sospechosos"
                }
            }
        },
        "skin_urticaria_new": {
            "system": "Piel y Mucosas",
            "epsilon": 2,
            "symptoms": {
                "urticaria_more_3": {
                    "id": "urticaria_more_3",
                    "name": "Urticaria localizada/pocas lesiones",
                    "lambda": 0.05,
                    "severity": "leve",
                    "clinical_description": "Ronchas localizadas, pocas en número, sin generalización",
                    "classification_guide": {
                        "cuando_seleccionar": "Pocas ronchas (<10), localizadas, sin afectación extensa",
                        "signs_to_look": [
                            "<10 lesiones habonosas",
                            "Localizadas en una o dos áreas",
                            "Prurito leve a moderado",
                            "Sin angioedema",
                            "Responde a antihistamínico único",
                            "Episodio único o recurrencias leves"
                        ],
                        "severity_markers": {
                            "leve": "<10 habones",
                            "distribucion": "Localizada",
                            "tamaño": "<5cm diámetro"
                        },
                        "morfologia": "Habones eritematosos, bien delimitados, elevados, transitorios (<24h)"
                    },
                    "clinical_impact": "Bajo - molestia transitoria",
                    "treatment_considerations": "Antihistamínico oral, observación, identificar trigger"
                },
                "urticaria_3_10": {
                    "id": "urticaria_3_10",
                    "name": "Urticaria moderada",
                    "lambda": 0.07,
                    "severity": "moderado",
                    "clinical_description": "Múltiples ronchas, moderadamente extendidas, mayor sintomatología",
                    "classification_guide": {
                        "cuando_seleccionar": "10-50 lesiones habonosas o afectación de múltiples áreas corporales",
                        "signs_to_look": [
                            "10-50 habones",
                            "Múltiples áreas corporales",
                            "Prurito moderado a intenso",
                            "Puede haber angioedema facial leve",
                            "Requiere antihistamínicos dobles dosis",
                            "Recurrencias frecuentes"
                        ],
                        "severity_markers": {
                            "moderado": "10-50 habones o confluentes",
                            "distribucion": "Múltiple",
                            "impacto": "Interfiere con actividades/sueño"
                        },
                        "evaluate_for": [
                            "Urticaria crónica espontánea",
                            "Urticaria autoinmune (asociada a Sjögren)",
                            "Urticaria física (dermografismo)",
                            "Deficiencia complemento (raro)"
                        ]
                    },
                    "clinical_impact": "Moderado - afecta calidad de vida, requiere tratamiento sostenido",
                    "treatment_considerations": "Antihistamínicos altas dosis, considerar anti-IgE (omalizumab) si crónica, corticoides cortos"
                },
                "urticaria_more_10": {
                    "id": "urticaria_more_10",
                    "name": "Urticaria generalizada",
                    "lambda": 0.08,
                    "severity": "severo",
                    "clinical_description": "Urticaria extensa y generalizada, alto riesgo de angioedema o anafilaxia",
                    "classification_guide": {
                        "cuando_seleccionar": "Urticaria generalizada, >50 lesiones o >50% superficie corporal",
                        "signs_to_look": [
                            ">50 habones o confluentes generalizados",
                            "Afectación tronco y extremidades",
                            "Prurito severo e incapacitante",
                            "Angioedema asociado frecuente",
                            "Puede haber síntomas sistémicos",
                            "Riesgo de progresión a anafilaxia"
                        ],
                        "severity_markers": {
                            "severo": ">50 habones o generalizado",
                            "sistémico": "Puede haber hipotensión, broncoespasmo",
                            "angioedema": "Frecuentemente asociado"
                        },
                        "red_flags": [
                            "Dificultad respiratoria (laríngeo)",
                            "Hipotensión",
                            "Mareo, síncope",
                            "Dolor abdominal intenso (edema intestinal)",
                            "Lesiones que duran >24h (vasculitis urticarial)"
                        ],
                        "evaluate_for": [
                            "Anafilaxia inminente",
                            "Vasculitis urticarial (lesiones >24h, dejan hiperpigmentación)",
                            "Síndrome autoinflamatorio",
                            "Reacción medicamentosa severa"
                        ]
                    },
                    "clinical_impact": "Alto - potencialmente amenazante para la vida",
                    "treatment_considerations": "Evaluación urgente, antihistamínicos IV, corticoides IV, adrenalina si signos anafilaxia, hospitalización posible"
                }
            }
        },
        "skin_angioedema": {
            "system": "Piel y Mucosas",
            "epsilon": 3,
            "symptoms": {
                "angioedema_mild": {
                    "id": "angioedema_mild",
                    "name": "Angioedema leve",
                    "lambda": 0.05,
                    "severity": "moderado",
                    "clinical_description": "Edema subcutáneo localizado, no facial, sin compromiso respiratorio",
                    "classification_guide": {
                        "cuando_seleccionar": "Hinchazón localizada en extremidades, manos, pies, sin cara ni vía aérea",
                        "signs_to_look": [
                            "Edema subcutáneo localizado",
                            "Generalmente en extremidades",
                            "No afecta cara ni cuello",
                            "Sin dificultad respiratoria",
                            "Puede durar 24-72h",
                            "Responde a antihistamínicos"
                        ],
                        "severity_markers": {
                            "leve": "Localizado periférico",
                            "areas": "Manos, pies, sin cara",
                            "via_aerea": "No comprometida"
                        },
                        "differential": "Distinguir de edema venoso/linfático vs angioedema verdadero"
                    },
                    "clinical_impact": "Moderado - molestia sin riesgo vital",
                    "treatment_considerations": "Antihistamínicos, corticoides si severo, observación"
                },
                "angioedema_significant": {
                    "id": "angioedema_significant",
                    "name": "Angioedema facial/significativo",
                    "lambda": 0.07,
                    "severity": "severo",
                    "clinical_description": "Edema que afecta cara, labios, lengua - mayor riesgo de compromiso respiratorio",
                    "classification_guide": {
                        "cuando_seleccionar": "Hinchazón facial, labios, lengua, párpados - requiere vigilancia estrecha",
                        "signs_to_look": [
                            "Edema facial evidente",
                            "Labios engrosados",
                            "Lengua hinchada (puede dificultar habla)",
                            "Puede afectar paladar blando",
                            "Sensación de opresión faríngea",
                            "Voz nasal posible"
                        ],
                        "severity_markers": {
                            "severo": "Afectación facial",
                            "riesgo": "Potencial compromiso vía aérea",
                            "observacion": "Requiere vigilancia en urgencias"
                        },
                        "red_flags": [
                            "Dificultad para tragar",
                            "Cambios en la voz (estridor)",
                            "Dificultad respiratoria",
                            "Sensación de ahogo"
                        ],
                        "evaluate_for": [
                            "Angioedema hereditario (deficiencia C1-INH)",
                            "Angioedema por IECAs",
                            "Angioedema alérgico",
                            "Anafilaxia"
                        ]
                    },
                    "clinical_impact": "Alto - riesgo de progresión a compromiso respiratorio",
                    "treatment_considerations": "Evaluación urgente, antihistamínicos IV, corticoides IV, adrenalina disponible, observación hospitalaria, evaluar vía aérea"
                },
                "angioedema_generalized": {
                    "id": "angioedema_generalized",
                    "name": "Angioedema generalizado",
                    "lambda": 0.08,
                    "severity": "severo-crítico",
                    "clinical_description": "Edema extenso que afecta múltiples áreas incluyendo mucosas y potencialmente vía aérea",
                    "classification_guide": {
                        "cuando_seleccionar": "Angioedema extenso, múltiples sitios, con compromiso mucoso o respiratorio",
                        "signs_to_look": [
                            "Edema en múltiples áreas corporales",
                            "Cara, cuello, extremidades afectados",
                            "Puede incluir mucosa oral, faríngea",
                            "Edema laríngeo posible",
                            "Dificultad respiratoria",
                            "Puede haber dolor abdominal (edema intestinal)"
                        ],
                        "severity_markers": {
                            "critico": "Compromiso vía aérea",
                            "multisitio": "≥3 áreas corporales",
                            "sintomas_sistemicos": "Disnea, hipotensión posible"
                        },
                        "red_flags": [
                            "ESTRIDOR - emergencia inmediata",
                            "Dificultad respiratoria severa",
                            "Cianosis",
                            "Hipotensión",
                            "Alteración estado mental"
                        ],
                        "immediate_actions": [
                            "Evaluar vía aérea INMEDIATAMENTE",
                            "Adrenalina IM si signos anafilaxia",
                            "Preparar intubación si necesario",
                            "Antihistamínicos + corticoides IV",
                            "Monitorización continua"
                        ]
                    },
                    "clinical_impact": "CRÍTICO - potencialmente fatal, requiere manejo emergente",
                    "treatment_considerations": "EMERGENCIA - manejo en UCI/urgencias, asegurar vía aérea, adrenalina, antihistamínicos IV, corticoides IV, considerar C1-INH si angioedema hereditario"
                }
            }
        },

        # ============================================
        # 3. OCULAR Y NASAL
        # ============================================
        "rhinitis": {
            "system": "Ocular y Nasal",
            "epsilon": 1,
            "symptoms": {
                "rhinitis_rare": {
                    "id": "rhinitis_rare",
                    "name": "Rinitis ocasional",
                    "lambda": 0.01,
                    "severity": "leve",
                    "clinical_description": "Congestión o rinorrea intermitente, sin impacto funcional",
                    "classification_guide": {
                        "cuando_seleccionar": "Síntomas nasales ocasionales, <3 días/semana, no afecta sueño ni actividades",
                        "signs_to_look": [
                            "Estornudos ocasionales",
                            "Rinorrea leve intermitente",
                            "Congestión nasal leve",
                            "No afecta sueño",
                            "No requiere medicación regular",
                            "Síntomas autolimitados"
                        ],
                        "severity_markers": {
                            "leve": "<3 días/semana, <4 semanas",
                            "impacto": "No interfiere con actividades diarias",
                            "sueno": "No afectado"
                        }
                    },
                    "clinical_impact": "Bajo - molestia mínima",
                    "treatment_considerations": "No necesariamente requiere tratamiento, medidas ambientales"
                },
                "rhinitis_less_10": {
                    "id": "rhinitis_less_10",
                    "name": "Rinitis frecuente",
                    "lambda": 0.05,
                    "severity": "moderado",
                    "clinical_description": "Síntomas nasales frecuentes que requieren tratamiento regular",
                    "classification_guide": {
                        "cuando_seleccionar": "Síntomas ≥4 días/semana o >4 semanas consecutivas",
                        "signs_to_look": [
                            "Congestión nasal frecuente",
                            "Rinorrea persistente",
                            "Puede afectar sueño levemente",
                            "Requiere antihistamínicos o esteroides nasales",
                            "Puede afectar concentración",
                            "Respiración oral ocasional"
                        ],
                        "severity_markers": {
                            "moderado": "≥4 días/semana o persistente",
                            "impacto": "Afecta algunas actividades",
                            "tratamiento": "Requiere medicación regular"
                        },
                        "evaluate_for": [
                            "Rinitis alérgica",
                            "Sequedad nasal (en Sjögren)",
                            "Sinusitis crónica"
                        ]
                    },
                    "clinical_impact": "Moderado - afecta calidad de vida",
                    "treatment_considerations": "Corticoides nasales, antihistamínicos, irrigación nasal"
                },
                "rhinitis_long": {
                    "id": "rhinitis_long",
                    "name": "Rinitis persistente",
                    "lambda": 0.08,
                    "severity": "severo",
                    "clinical_description": "Síntomas nasales constantes que impactan significativamente la función",
                    "classification_guide": {
                        "cuando_seleccionar": "Síntomas diarios, constantes, con impacto severo en sueño y actividades",
                        "signs_to_look": [
                            "Congestión constante/obstrucción nasal completa",
                            "Respiración oral habitual",
                            "Alteración significativa del sueño",
                            "Cefalea frecuente",
                            "Anosmia (pérdida olfato)",
                            "Impacto en trabajo/escuela",
                            "Tratamiento máximo con respuesta parcial"
                        ],
                        "severity_markers": {
                            "severo": "Diario, constante",
                            "impacto": "Alteración severa sueño y actividades",
                            "complicaciones": "Sinusitis recurrente, poliposis"
                        },
                        "evaluate_for": [
                            "Poliposis nasal",
                            "Sinusitis crónica refractaria",
                            "Rinitis vasomotora severa",
                            "Descartar granulomatosis (Wegener)"
                        ]
                    },
                    "clinical_impact": "Alto - deterioro significativo calidad de vida",
                    "treatment_considerations": "Evaluación ORL, considerar cirugía (polipectomía), tratamiento biológico si poliposis, manejo multidisciplinario"
                }
            }
        },
        "eyes": {
            "system": "Ocular y Nasal",
            "epsilon": 2,
            "symptoms": {
                "eyes_rare": {
                    "id": "eyes_rare",
                    "name": "Conjuntivitis intermitente",
                    "lambda": 0.05,
                    "severity": "leve-moderado",
                    "clinical_description": "Inflamación conjuntival episódica sin secuelas",
                    "classification_guide": {
                        "cuando_seleccionar": "Episodios de ojo rojo/irritación con períodos libres de síntomas",
                        "signs_to_look": [
                            "Hiperemia conjuntival intermitente",
                            "Lagrimeo o sensación cuerpo extraño",
                            "Períodos asintomáticos entre episodios",
                            "Sin secreción purulenta",
                            "Responde a lágrimas artificiales",
                            "Sin afectación corneal"
                        ],
                        "severity_markers": {
                            "leve": "Episodios <3 días/mes",
                            "vision": "No afectada",
                            "cronicidad": "Episódico, no continuo"
                        },
                        "differential": "Distinguir ojo seco (Sjögren) de conjuntivitis alérgica/infecciosa"
                    },
                    "clinical_impact": "Moderado - episodios limitados en tiempo",
                    "treatment_considerations": "Lágrimas artificiales, antihistamínicos tópicos si alérgico, higiene ocular"
                },
                "eyes_continuos": {
                    "id": "eyes_continuos",
                    "name": "Conjuntivitis continua",
                    "lambda": 0.08,
                    "severity": "severo",
                    "clinical_description": "Inflamación conjuntival persistente con potencial compromiso corneal",
                    "classification_guide": {
                        "cuando_seleccionar": "Síntomas oculares diarios, persistentes, con impacto en visión o actividades",
                        "signs_to_look": [
                            "Hiperemia conjuntival constante",
                            "Ojo rojo persistente",
                            "Sensación cuerpo extraño constante",
                            "Fotofobia",
                            "Visión borrosa posible",
                            "Puede haber queratitis (tinción fluoresceína +)",
                            "Requiere tratamiento continuo"
                        ],
                        "severity_markers": {
                            "severo": "Síntomas diarios >4 semanas",
                            "vision": "Puede estar afectada",
                            "cornea": "Puede haber compromiso corneal"
                        },
                        "red_flags": [
                            "Disminución aguda visión",
                            "Dolor ocular severo",
                            "Secreción purulenta (infección)",
                            "Lesiones corneales (úlcera)"
                        ],
                        "evaluate_for": [
                            "Queratoconjuntivitis seca (Sjögren)",
                            "Conjuntivitis crónica",
                            "Blefaritis asociada",
                            "Uveítis (dolor, fotofobia, visión disminuida)"
                        ]
                    },
                    "clinical_impact": "Alto - riesgo de daño corneal y pérdida visual",
                    "treatment_considerations": "Evaluación oftalmológica urgente, lágrimas artificiales frecuentes, ciclosporina tópica, tapones punctuales, tratar infección si presente"
                }
            }
        },

        # ============================================
        # 4. SISTÉMICO (CV/NS/RESP)
        # ============================================
        "bronchi": {
            "system": "Respiratorio",
            "epsilon": 3,
            "symptoms": {
                "wheezing_exp": {
                    "id": "wheezing_exp",
                    "name": "Sibilancias espiratorias",
                    "lambda": 0.06,
                    "severity": "moderado",
                    "clinical_description": "Sibilancias audibles con estetoscopio solo en espiración forzada",
                    "classification_guide": {
                        "cuando_seleccionar": "Sibilancias detectadas solo durante auscultación con espiración forzada",
                        "signs_to_look": [
                            "Sibilancias solo con estetoscopio",
                            "Solo durante espiración forzada",
                            "No audibles a distancia",
                            "Sin disnea en reposo",
                            "Saturación O2 normal",
                            "Puede haber tos seca"
                        ],
                        "severity_markers": {
                            "moderado": "Solo espiración forzada",
                            "audible": "Solo con estetoscopio",
                            "funcion": "Espirometría levemente alterada posible"
                        },
                        "differential": "Asma leve, bronquitis, enfermedad pulmonar intersticial"
                    },
                    "clinical_impact": "Moderado - requiere evaluación pero sin compromiso inmediato",
                    "treatment_considerations": "Broncodilatadores si necesario, espirometría, evaluación pulmonar"
                },
                "wheezing_severe": {
                    "id": "wheezing_severe",
                    "name": "Sibilancias inspiratorias/espiratorias",
                    "lambda": 0.07,
                    "severity": "severo",
                    "clinical_description": "Sibilancias en ambas fases respiratorias, indica obstrucción significativa",
                    "classification_guide": {
                        "cuando_seleccionar": "Sibilancias tanto en inspiración como espiración con estetoscopio",
                        "signs_to_look": [
                            "Sibilancias bifásicas (insp + esp)",
                            "Audibles con estetoscopio en reposo",
                            "Puede haber taquipnea leve",
                            "Uso musculatura accesoria posible",
                            "Saturación O2 puede estar levemente disminuida",
                            "Disnea con esfuerzos moderados"
                        ],
                        "severity_markers": {
                            "severo": "Bifásico (insp + esp)",
                            "esfuerzo": "Disnea con actividad moderada",
                            "saturacion": "SatO2 92-95%"
                        },
                        "evaluate_for": [
                            "Asma moderada-severa",
                            "Bronquitis aguda severa",
                            "Exacerbación EPOC",
                            "Enfermedad intersticial pulmonar"
                        ]
                    },
                    "clinical_impact": "Alto - requiere tratamiento activo",
                    "treatment_considerations": "Broncodilatadores, corticoides, oxígeno si necesario, evaluación urgente"
                },
                "wheezing_audible": {
                    "id": "wheezing_audible",
                    "name": "Sibilancias audibles sin estetoscopio",
                    "lambda": 0.08,
                    "severity": "severo-crítico",
                    "clinical_description": "Sibilancias audibles a distancia sin estetoscopio - obstrucción severa",
                    "classification_guide": {
                        "cuando_seleccionar": "Sibilancias audibles sin estetoscopio, a distancia del paciente",
                        "signs_to_look": [
                            "Sibilancias audibles a distancia",
                            "No requiere estetoscopio",
                            "Disnea evidente",
                            "Taquipnea (FR >20-24)",
                            "Uso musculatura accesoria prominente",
                            "Saturación O2 <92% aire ambiente",
                            "Habla entrecortada",
                            "Ansiedad/agitación"
                        ],
                        "severity_markers": {
                            "critico": "Audible sin estetoscopio",
                            "respiratorio": "Insuficiencia respiratoria",
                            "saturacion": "SatO2 <92%",
                            "funcion": "Peak-flow <50% predicho"
                        },
                        "red_flags": [
                            "Tórax silente (ausencia sibilancias = obstrucción severa)",
                            "Cianosis",
                            "Alteración estado mental",
                            "Hipotensión",
                            "Bradipnea (signo pre-parada)"
                        ],
                        "immediate_actions": [
                            "Evaluación URGENTE",
                            "Oxígeno suplementario",
                            "Broncodilatadores nebulizados",
                            "Corticoides sistémicos",
                            "Preparar ventilación si empeora"
                        ]
                    },
                    "clinical_impact": "CRÍTICO - riesgo vital, requiere manejo urgente",
                    "treatment_considerations": "EMERGENCIA - oxígeno, broncodilatadores continuos, corticoides IV, magnesio IV si crisis asmática, considerar UCI"
                }
            }
        },
        "laryngeal": {
            "system": "Respiratorio",
            "epsilon": 3,
            "symptoms": {
                "laryngeal_throat": {
                    "id": "laryngeal_throat",
                    "name": "Picor/Opresión garganta",
                    "lambda": 0.05,
                    "severity": "leve-moderado",
                    "clinical_description": "Sensación de irritación o opresión faríngea sin compromiso respiratorio",
                    "classification_guide": {
                        "cuando_seleccionar": "Molestia faríngea, sensación opresión leve, sin disnea ni estridor",
                        "signs_to_look": [
                            "Sensación de opresión garganta",
                            "Picor faríngeo",
                            "Carraspeo frecuente",
                            "Sin cambios en la voz",
                            "Sin dificultad respiratoria",
                            "Sin estridor"
                        ],
                        "severity_markers": {
                            "leve": "Molestia sin compromiso ventilatorio",
                            "voz": "Normal",
                            "respiracion": "Sin alteración"
                        }
                    },
                    "clinical_impact": "Moderado - requiere vigilancia pero sin urgencia inmediata",
                    "treatment_considerations": "Observación, antihistamínicos, corticoides si progresa"
                },
                "laryngeal_more_3": {
                    "id": "laryngeal_more_3",
                    "name": "Tos persistente (>3 episodios)",
                    "lambda": 0.05,
                    "severity": "moderado",
                    "clinical_description": "Tos frecuente y persistente, más de 3 episodios en período evaluado",
                    "classification_guide": {
                        "cuando_seleccionar": ">3 episodios de tos en las últimas horas o tos persistente",
                        "signs_to_look": [
                            "Tos frecuente, >3 episodios",
                            "Tos seca o productiva",
                            "Puede interferir con habla",
                            "Sin hemoptisis",
                            "Sin estridor",
                            "Saturación O2 normal"
                        ],
                        "severity_markers": {
                            "moderado": ">3 episodios/evaluación",
                            "impacto": "Interfiere con actividades",
                            "noche": "Puede alterar sueño"
                        },
                        "evaluate_for": [
                            "Tos irritativa (sequedad vías altas en Sjögren)",
                            "Goteo postnasal",
                            "Asma (tos variante)",
                            "Bronquitis"
                        ]
                    },
                    "clinical_impact": "Moderado - molestia significativa",
                    "treatment_considerations": "Antitusígenos, hidratación, tratar causa subyacente"
                },
                "laryngeal_frequent_cough": {
                    "id": "laryngeal_frequent_cough",
                    "name": "Ronquera/Tos frecuente",
                    "lambda": 0.07,
                    "severity": "severo",
                    "clinical_description": "Cambios en la voz (disfonía) y tos persistente que sugieren afectación laríngea",
                    "classification_guide": {
                        "cuando_seleccionar": "Voz ronca/cambios vocales + tos frecuente",
                        "signs_to_look": [
                            "Disfonía (voz ronca)",
                            "Tos persistente severa",
                            "Puede haber dolor al hablar",
                            "Voz apagada o débil",
                            "Sin estridor (aún)",
                            "Puede haber disnea leve con esfuerzo"
                        ],
                        "severity_markers": {
                            "severo": "Disfonía + tos persistente",
                            "funcional": "Dificultad para comunicarse",
                            "riesgo": "Puede progresar a obstrucción"
                        },
                        "evaluate_for": [
                            "Laringitis",
                            "Edema laríngeo incipiente",
                            "Parálisis cuerda vocal",
                            "Laringoespasmo"
                        ]
                    },
                    "clinical_impact": "Alto - requiere evaluación ORL urgente",
                    "treatment_considerations": "Evaluación laringoscópica, corticoides, reposo vocal, vigilancia estrecha"
                },
                "laryngeal_stridor": {
                    "id": "laryngeal_stridor",
                    "name": "Estridor laríngeo",
                    "lambda": 0.08,
                    "severity": "CRÍTICO",
                    "clinical_description": "Ruido respiratorio agudo inspiratorio que indica obstrucción vía aérea superior - EMERGENCIA",
                    "classification_guide": {
                        "cuando_seleccionar": "Ruido inspiratorio áspero audible (estridor) - EMERGENCIA",
                        "signs_to_look": [
                            "ESTRIDOR: sonido inspiratorio áspero, agudo",
                            "Audible sin estetoscopio",
                            "Respiración dificultosa",
                            "Tiraje supraesternal/intercostal",
                            "Ansiedad extrema",
                            "Posición en trípode",
                            "Cianosis posible",
                            "Puede haber voz apagada (\"hot potato voice\")"
                        ],
                        "severity_markers": {
                            "critico": "ESTRIDOR presente",
                            "obstruccion": "Vía aérea superior comprometida",
                            "saturacion": "Puede estar disminuida"
                        },
                        "red_flags": [
                            "ESTRIDOR BIFÁSICO (insp + esp) = obstrucción severa",
                            "Disfonía completa/afonía",
                            "Babeo (incapacidad tragar)",
                            "Cianosis",
                            "Bradipnea súbita (pre-parada)",
                            "Alteración estado mental"
                        ],
                        "immediate_actions": [
                            "EMERGENCIA MÉDICA",
                            "NO dejar solo al paciente",
                            "NO acostar (mantener sentado)",
                            "Oxígeno alto flujo",
                            "Adrenalina nebulizada",
                            "Adrenalina IM si anafilaxia",
                            "Corticoides IV",
                            "Preparar intubación/cricotirotomía",
                            "Avisar anestesia/ORL URGENTE"
                        ],
                        "causes": [
                            "Angioedema laríngeo",
                            "Anafilaxia",
                            "Epiglotitis",
                            "Cuerpo extraño",
                            "Edema Reinke severo"
                        ]
                    },
                    "clinical_impact": "CRÍTICO - RIESGO VITAL INMEDIATO",
                    "treatment_considerations": "EMERGENCIA VITAL - manejo en área crítica, asegurar vía aérea, adrenalina, corticoides IV, preparar intubación, considerar cricotirotomía si falla intubación"
                }
            }
        },
        "cv": {
            "system": "Cardiovascular",
            "epsilon": 4,
            "symptoms": {
                "cv_tachycardia": {
                    "id": "cv_tachycardia",
                    "name": "Taquicardia",
                    "lambda": 0.05,
                    "severity": "moderado",
                    "clinical_description": "Frecuencia cardíaca elevada (>100 lpm) sin hipotensión",
                    "classification_guide": {
                        "cuando_seleccionar": "FC >100 lpm pero paciente estable, sin hipotensión ni síncope",
                        "signs_to_look": [
                            "FC 100-120 lpm (adultos)",
                            "Palpitaciones",
                            "TA normal o levemente elevada (respuesta autonómica)",
                            "Sin dolor torácico",
                            "Sin síncope",
                            "Puede haber ansiedad"
                        ],
                        "severity_markers": {
                            "moderado": "FC 100-120 sin inestabilidad",
                            "hemodinamica": "TA conservada",
                            "sintomas": "Palpitaciones pero estable"
                        },
                        "evaluate_for": [
                            "Taquicardia sinusal (ansiedad, dolor, hipovolemia)",
                            "Arritmia (fibrilación auricular)",
                            "Respuesta alérgica/anafilaxia temprana"
                        ]
                    },
                    "clinical_impact": "Moderado - requiere vigilancia",
                    "treatment_considerations": "ECG, monitorización, tratar causa subyacente, considerar beta-bloqueantes si apropiado"
                },
                "cv_bp_drop": {
                    "id": "cv_bp_drop",
                    "name": "Caída TA >20%",
                    "lambda": 0.07,
                    "severity": "severo",
                    "clinical_description": "Hipotensión con disminución >20% de TA basal - inestabilidad hemodinámica",
                    "classification_guide": {
                        "cuando_seleccionar": "Caída de TA sistólica >20% del basal o TAS <90 mmHg",
                        "signs_to_look": [
                            "TAS <90 mmHg o caída >20%",
                            "Mareo, sensación lipotimia",
                            "Palidez",
                            "Sudoración fría",
                            "Taquicardia compensatoria",
                            "Puede haber confusión leve",
                            "Llenado capilar enlentecido"
                        ],
                        "severity_markers": {
                            "severo": "TAS <90 o caída >20%",
                            "perfusion": "Signos hipoperfusión",
                            "consciencia": "Puede estar alterada levemente"
                        },
                        "evaluate_for": [
                            "Shock anafiláctico",
                            "Hipovolemia",
                            "Shock distributivo (sepsis)",
                            "Shock cardiogénico"
                        ]
                    },
                    "clinical_impact": "Alto - requiere intervención urgente",
                    "treatment_considerations": "Posición Trendelenburg, líquidos IV, adrenalina si anafilaxia, monitorización hemodinámica"
                },
                "cv_collapse": {
                    "id": "cv_collapse",
                    "name": "Colapso cardiovascular",
                    "lambda": 0.08,
                    "severity": "CRÍTICO",
                    "clinical_description": "Fallo circulatorio con hipotensión severa, hipoperfusión y alteración consciencia - SHOCK",
                    "classification_guide": {
                        "cuando_seleccionar": "Hipotensión severa con signos de shock y/o alteración consciencia",
                        "signs_to_look": [
                            "TAS <70 mmHg o indetectable",
                            "Alteración consciencia (confusión, obnubilación)",
                            "Palidez extrema/cianosis",
                            "Pulsos periféricos débiles/ausentes",
                            "Llenado capilar >3 segundos",
                            "Oliguria/anuria",
                            "Puede haber bradicardia (signo ominoso)"
                        ],
                        "severity_markers": {
                            "critico": "TAS <70 mmHg",
                            "perfusion": "Shock evidente",
                            "consciencia": "Alterada",
                            "lactato": ">4 mmol/L probable"
                        },
                        "red_flags": [
                            "Parada cardíaca inminente",
                            "Bradicardia + hipotensión",
                            "Síncope",
                            "No responde a estímulos"
                        ],
                        "immediate_actions": [
                            "CÓDIGO AZUL / RCP si necesario",
                            "Posición supina + Trendelenburg",
                            "Adrenalina IM (anafilaxia) - NO RETRASAR",
                            "Líquidos IV rápidos (bolos)",
                            "Oxígeno alto flujo",
                            "Monitorización continua",
                            "Preparar vasopresores",
                            "Considerar intubación"
                        ],
                        "shock_types": [
                            "Anafiláctico (distributivo)",
                            "Hipovolémico",
                            "Cardiogénico",
                            "Distributivo (sepsis)"
                        ]
                    },
                    "clinical_impact": "CRÍTICO - RIESGO VITAL INMEDIATO",
                    "treatment_considerations": "EMERGENCIA - reanimación, adrenalina, líquidos, vasopresores, manejo UCI, identificar y tratar causa"
                }
            }
        },
        "ns": {
            "system": "Neurológico",
            "epsilon": 4,
            "symptoms": {
                "ns_dizzy": {
                    "id": "ns_dizzy",
                    "name": "Mareo",
                    "lambda": 0.05,
                    "severity": "moderado",
                    "clinical_description": "Sensación de mareo o inestabilidad sin pérdida de consciencia",
                    "classification_guide": {
                        "cuando_seleccionar": "Mareo, sensación lipotimia o inestabilidad sin síncope",
                        "signs_to_look": [
                            "Sensación de mareo",
                            "Inestabilidad leve",
                            "Puede referir \"vértigo\" (aclarar tipo)",
                            "TA puede estar levemente baja",
                            "Sin pérdida consciencia",
                            "Responde a medidas simples (sentarse)"
                        ],
                        "severity_markers": {
                            "moderado": "Mareo sin síncope",
                            "funcional": "Puede mantenerse en pie con apoyo",
                            "orientacion": "Conservada"
                        },
                        "differential": [
                            "Hipotensión ortostática",
                            "Vértigo periférico",
                            "Hipoglucemia leve",
                            "Ansiedad"
                        ]
                    },
                    "clinical_impact": "Moderado - requiere evaluación",
                    "treatment_considerations": "Sentar/acostar paciente, medir TA/glucemia, observación, tratar causa"
                },
                "ns_significant_change": {
                    "id": "ns_significant_change",
                    "name": "Cambio significativo consciencia",
                    "lambda": 0.07,
                    "severity": "severo",
                    "clinical_description": "Alteración del estado mental (confusión, desorientación, somnolencia)",
                    "classification_guide": {
                        "cuando_seleccionar": "Confusión, desorientación, somnolencia o alteración conducta",
                        "signs_to_look": [
                            "Confusión o desorientación",
                            "Somnolencia aumentada",
                            "Respuesta lenta a estímulos",
                            "Puede no reconocer personas/lugar",
                            "Lenguaje incoherente posible",
                            "Glasgow >13 pero alterado"
                        ],
                        "severity_markers": {
                            "severo": "Alteración estado mental evidente",
                            "glasgow": "13-14 (o disminución ≥2 puntos)",
                            "orientacion": "Desorientado tiempo/espacio"
                        },
                        "evaluate_for": [
                            "Hipoxia",
                            "Hipoglucemia",
                            "Shock (hipoperfusión cerebral)",
                            "Encefalopat Síndrome confusional agudo"
                        ]
                    },
                    "clinical_impact": "Alto - requiere evaluación urgente",
                    "treatment_considerations": "Evaluación neurológica urgente, glucemia, oximetría, TC cerebral si necesario, tratar causa subyacente"
                },
                "ns_loss_consciousness": {
                    "id": "ns_loss_consciousness",
                    "name": "Pérdida de consciencia",
                    "lambda": 0.08,
                    "severity": "CRÍTICO",
                    "clinical_description": "Síncope o pérdida completa de consciencia - indica hipoperfusión cerebral severa",
                    "classification_guide": {
                        "cuando_seleccionar": "Síncope (pérdida consciencia transitoria) o inconsciencia mantenida",
                        "signs_to_look": [
                            "Pérdida consciencia (síncope)",
                            "No responde a estímulos verbales",
                            "Glasgow ≤12 o inconsciencia",
                            "Puede haber relajación esfínteres",
                            "Palidez extrema",
                            "Bradicardia o taquicardia"
                        ],
                        "severity_markers": {
                            "critico": "Síncope o Glasgow ≤12",
                            "duracion": "Si >5 min = muy grave",
                            "recuperacion": "Evaluar si recupera o persiste"
                        },
                        "red_flags": [
                            "Síncope sin pródromo (cardíaco)",
                            "Síncope con ejercicio (miocardiopatía)",
                            "No recupera consciencia rápidamente",
                            "Convulsiones asociadas",
                            "Traumatismo craneal por caída"
                        ],
                        "immediate_actions": [
                            "Evaluar ABC (vía aérea, respiración, circulación)",
                            "Posición supina + elevar piernas",
                            "Evaluar pulso/TA",
                            "Glucemia capilar STAT",
                            "Oxígeno si necesario",
                            "ECG urgente",
                            "Activar código si no recupera"
                        ],
                        "syncope_types": [
                            "Vasovagal (más común, benigno)",
                            "Cardiogénico (arritmia - GRAVE)",
                            "Ortostático (hipovolemia)",
                            "Neurológico (convulsión, ACV)"
                        ]
                    },
                    "clinical_impact": "CRÍTICO - potencial riesgo vital",
                    "treatment_considerations": "EMERGENCIA - evaluación inmediata, ECG, monitorización continua, evaluación cardiológica/neurológica urgente, hospitalización probable"
                }
            }
        }
    },

    # ============================================
    # CRITERIOS DE CLASIFICACIÓN GENERALES
    # ============================================
    "classification_criteria": {
        "severity_levels": {
            "mild": {
                "description": "Síntomas que no interfieren significativamente con actividades diarias",
                "impact": "Bajo impacto en calidad de vida",
                "treatment": "Puede no requerir tratamiento o solo medidas sintomáticas",
                "examples": [
                    "Síntomas ocasionales (<3 días/semana)",
                    "Autolimitados",
                    "No afectan sueño ni trabajo",
                    "No requieren medicación regular"
                ]
            },
            "moderate": {
                "description": "Síntomas que interfieren moderadamente pero no impiden todas las actividades",
                "impact": "Impacto moderado, requiere tratamiento activo",
                "treatment": "Requiere tratamiento regular",
                "examples": [
                    "Síntomas frecuentes (≥4 días/semana)",
                    "Afectan algunas actividades",
                    "Pueden alterar sueño ocasionalmente",
                    "Requieren medicación regular"
                ]
            },
            "severe": {
                "description": "Síntomas que impiden actividades diarias normales o representan riesgo",
                "impact": "Alto impacto, puede haber riesgo vital",
                "treatment": "Requiere intervención urgente o tratamiento intensivo",
                "examples": [
                    "Síntomas constantes/diarios",
                    "Limitación funcional importante",
                    "Alteración significativa sueño",
                    "Posible riesgo vital",
                    "Puede requerir hospitalización"
                ]
            },
            "critical": {
                "description": "Situación que representa riesgo vital inmediato",
                "impact": "EMERGENCIA MÉDICA",
                "treatment": "Requiere manejo urgente, potencialmente en UCI",
                "examples": [
                    "Compromiso vía aérea (estridor)",
                    "Shock cualquier tipo",
                    "Pérdida consciencia",
                    "Insuficiencia respiratoria"
                ]
            }
        },
        "red_flags": {
            "airway": ["Estridor", "Disfagia completa", "Babeo", "Estridor bifásico"],
            "breathing": ["SatO2 <90%", "Cianosis", "Tórax silente", "Bradipnea súbita"],
            "circulation": ["TAS <70", "Shock", "Síncope", "Parada cardíaca"],
            "neurological": ["Glasgow ≤12", "Convulsiones", "Déficit focal agudo"]
        }
    },

    # ============================================
    # PREGUNTAS FRECUENTES (FAQ)
    # ============================================
    "faq": {
        "what_is_fass": "FASS (Functional Assessment of Sjögren's Syndrome) es una escala de evaluación que mide la severidad y el impacto funcional del Síndrome de Sjögren basándose en sistemas de órganos afectados.",
        "what_is_nfass": "nFASS es la puntuación numérica calculada mediante logaritmo que integra la afectación de múltiples sistemas. Rangos: 0-2 (leve), 2-3.5 (moderado), 3.5-5 (severo), >5 (muy severo).",
        "what_is_ofass": "oFASS es la clasificación ordinal (grados 1-5) derivada del nFASS que facilita la comunicación clínica y estratificación de pacientes.",
        
        "how_to_select_symptoms": "Seleccione síntomas basándose en: 1) Presencia clínica actual (últimas 24-48h), 2) Severidad objetiva, 3) Impacto funcional, 4) Necesidad de tratamiento. Use las guías específicas de cada síntoma.",
        
        "when_symptoms_severe": "Un síntoma es severo cuando: 1) Limita significativamente la función, 2) Ocurre diariamente o casi diariamente, 3) Requiere tratamiento intensivo, 4) Tiene alto impacto en calidad de vida, 5) Presenta riesgo de complicaciones.",
        
        "when_symptoms_critical": "Síntomas CRÍTICOS requieren acción inmediata: ESTRIDOR (vía aérea), SHOCK (cardiovascular), PÉRDIDA CONSCIENCIA (neurológico), INSUFICIENCIA RESPIRATORIA. Estos son EMERGENCIAS MÉDICAS.",
        
        "difference_mild_moderate": "LEVE: ocasional (<3 días/sem), no limita actividades, no requiere tratamiento regular. MODERADO: frecuente (≥4 días/sem), limita algunas actividades, requiere tratamiento regular, afecta calidad de vida.",
        
        "difference_moderate_severe": "MODERADO: síntomas frecuentes pero paciente funcional con tratamiento. SEVERO: síntomas constantes, limitación funcional importante, requiere tratamiento intensivo o intervención urgente.",
        
        "epsilon_meaning": "Epsilon (ε) es el peso del sistema de órgano en la escala FASS. Valores más altos indican mayor impacto clínico: ε=1 (menor impacto), ε=4 (mayor impacto). Refleja la gravedad potencial de afectar ese sistema.",
        
        "lambda_meaning": "Lambda (λ) es el peso individual del síntoma dentro de su sistema. Valores más altos indican mayor severidad: λ=0.01-0.03 (leve), λ=0.04-0.06 (moderado), λ=0.07-0.08 (severo).",
        
        "how_calculate_nfass": "nFASS se calcula: 1) Sumar lambdas de síntomas por cada sistema, 2) Multiplicar por 2^epsilon del sistema, 3) Sumar todos los sistemas, 4) Aplicar log2(suma) + 2.",
        
        "when_hospitalize": "Considerar hospitalización si: síntomas CRÍTICOS, multiple organ involvement severo, nFASS >5, síntomas con red flags, incapacidad para autocuidado, necesidad oxígeno/líquidos IV.",
        
        "sjogren_overlap": "El Síndrome de Sjögren puede solaparse con LES, AR, esclerosis sistémica. La escala FASS evalúa la contribución específica del Sjögren, pero considere manifestaciones de enfermedades coexistentes.",
        
        "treatment_impact": "El tratamiento efectivo debe disminuir el nFASS. Reevalúe periódicamente. Un nFASS estable o en aumento a pesar de tratamiento indica necesidad de ajuste terapéutico o reevaluación diagnóstica."
    }
}

def get_symptom_detail(symptom_id):
    """Obtiene información detallada de un síntoma específico"""
    for system_key, system_data in KNOWLEDGE_BASE["symptoms_detailed"].items():
        if "symptoms" in system_data:
            if symptom_id in system_data["symptoms"]:
                return system_data["symptoms"][symptom_id]
    return None

def get_severity_guidance(organ_system=None):
    """Obtiene guía de severidad"""
    if organ_system:
        return KNOWLEDGE_BASE["symptoms_detailed"].get(organ_system)
    return KNOWLEDGE_BASE["classification_criteria"]["severity_levels"]

def search_knowledge(query):
    """Busca en la base de conocimiento"""
    query_lower = query.lower()
    results = []
    
    # Buscar en FAQs
    for key, value in KNOWLEDGE_BASE["faq"].items():
        if any(term in key or term in value.lower() for term in query_lower.split()):
            results.append({"type": "faq", "question": key, "answer": value})
    
    # Buscar síntomas específicos
    for system_key, system_data in KNOWLEDGE_BASE["symptoms_detailed"].items():
        if "symptoms" in system_data:
            for symptom_id, symptom_data in system_data["symptoms"].items():
                if any(term in symptom_data["name"].lower() or term in symptom_data.get("clinical_description", "").lower() 
                       for term in query_lower.split()):
                    results.append({
                        "type": "symptom",
                        "id": symptom_id,
                        "data": symptom_data
                    })
    
    return results

def get_red_flags():
    """Obtiene todas las red flags del sistema"""
    return KNOWLEDGE_BASE["classification_criteria"]["red_flags"]