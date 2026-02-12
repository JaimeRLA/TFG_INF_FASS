// src/data/sintomas.js

export const SECCIONES_SINTOMAS = [
    {
      titulo: "1. Oral y Gastrointestinal",
      grupos: [
        { label: "Cavidad Oral", id_base: "oral", options: [{ id: "itchy_mouth", text: "Picor oral/garganta (λ: 0.05)" }] },
        {
          label: "Dolor / Náuseas", id_base: "gi_pain", options: [
            { id: "nausea_pain", text: "Leve (λ: 0.03)" },
            { id: "frequent_nausea_pain", text: "Frecuente (λ: 0.04)" },
            { id: "frequent_nausea_pain_dec", text: "Distrés/Actividad baja (λ: 0.05)" }
          ]
        },
        { label: "Vómitos", id_base: "gi_emesis", options: [{ id: "emesis_1", text: "1 episodio (λ: 0.05)" }, { id: "emesis_multiple", text: "> 1 episodio (λ: 0.08)" }] },
        { label: "Diarrea", id_base: "gi_diarrhoea", options: [{ id: "diarrhoea", text: "1 episodio (λ: 0.05)" }, { id: "diarrhoea_multiple", text: "> 1 episodio (λ: 0.08)" }] }
      ]
    },
    {
      titulo: "2. Piel y Mucosas",
      grupos: [
        {
          label: "Prurito (Rascado)", id_base: "skin_pruritus", options: [
            { id: "pruritus_os", text: "Ocasional (λ: 0.01)" },
            { id: "pruritus_os_2", text: "Continuo (λ: 0.02)" },
            { id: "pruritus_os_hard", text: "Intenso (λ: 0.05)" }
          ]
        },
        {
          label: "Rash / Eritema", id_base: "skin_rash", options: [
            { id: "rash_few", text: "Faint (λ: 0.05)" },
            { id: "rash_less_50", text: "≤ 50% (λ: 0.07)" },
            { id: "rash_3_10", text: "> 50% (λ: 0.08)" }
          ]
        },
        {
          label: "Urticaria", id_base: "skin_urticaria_new", options: [
            { id: "urticaria_more_3", text: "Localizada / Pocas (λ: 0.05)" },
            { id: "urticaria_3_10", text: "Moderada (λ: 0.07)" },
            { id: "urticaria_more_10", text: "Generalizada (λ: 0.08)" }
          ]
        },
        {
          label: "Angioedema", id_base: "skin_angioedema", options: [
            { id: "angioedema_mild", text: "Leve (λ: 0.05)" },
            { id: "angioedema_significant", text: "Facial / Significativo (λ: 0.07)" },
            { id: "angioedema_generalized", text: "Generalizado (λ: 0.08)" }
          ]
        }
      ]
    },
    {
      titulo: "3. Ocular y Nasal",
      grupos: [
        { label: "Rinitis", id_base: "rhinitis", options: [{ id: "rhinitis_rare", text: "Ocasional (λ: 0.01)" }, { id: "rhinitis_less_10", text: "Frecuente (λ: 0.05)" }, { id: "rhinitis_long", text: "Persistente (λ: 0.08)" }] },
        { label: "Conjuntivitis", id_base: "eyes", options: [{ id: "eyes_rare", text: "Intermitente (λ: 0.05)" }, { id: "eyes_continuos", text: "Continuo (λ: 0.08)" }] }
      ]
    },
    {
      titulo: "4. Sistémico (CV / NS / Resp)",
      grupos: [
        { label: "Bronquios", id_base: "bronchi", options: [{ id: "wheezing_exp", text: "Sibilancia Esp. (λ: 0.06)" }, { id: "wheezing_severe", text: "Insp/Esp. (λ: 0.07)" }, { id: "wheezing_audible", text: "Audible (λ: 0.08)" }] },
        { 
          label: "Laringe", id_base: "laryngeal", options: [
            { id: "laryngeal_throat", text: "Picor/Opresión garganta (λ: 0.05)" },
            { id: "laryngeal_more_3", text: "Tos persistente (>3) (λ: 0.05)" },
            { id: "laryngeal_frequent_cough", text: "Ronquera/Tos frecuente (λ: 0.07)" },
            { id: "laryngeal_stridor", text: "Estridor laríngeo (λ: 0.08)" }
          ] 
        },        
        { label: "Cardio (CV)", id_base: "cv", options: [{ id: "cv_tachycardia", text: "Tachycardia (λ: 0.05)" },{ id: "cv_bp_drop", text: "Baja TA > 20% (λ: 0.07)" }, { id: "cv_collapse", text: "Colapso CV (λ: 0.08)" }] },
        { label: "Nervioso (NS)", id_base: "ns", options: [{ id: "ns_dizzy", text: "Mareo (λ: 0.05)" },{ id: "ns_significant_change", text: "Cambio Consciencia (λ: 0.07)" }, { id: "ns_loss_consciousness", text: "Pérdida conciencia (λ: 0.08)" }] }
      ]
    }
];

