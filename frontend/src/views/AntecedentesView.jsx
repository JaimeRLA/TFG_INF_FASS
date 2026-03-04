import React from 'react';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { styles } from '../AppStyles.js';

const AntecedentesView = ({ paciente, setPaciente, cuestionario, handleCuestionario, validarYPasarAEvento, setView }) => {
  
  // Componente interno modificado para usar styles.labelStyle
  const PreguntaClinicaLocal = ({ id, label }) => (
    <div style={styles.rowYesNo}>
      {/* Aplicamos el estilo de etiqueta (NHC) a la pregunta */}
      <span style={{ ...styles.labelStyle, fontWeight: '500', flex: 1 }}>{label}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['Yes', 'No'].map(op => (
          <button
            key={op}
            onClick={() => handleCuestionario(id, op)}
            // Aseguramos que el botón herede la fuente de la app
            style={{
              ...(cuestionario[id] === op ? styles.btnMiniActive : styles.btnMini),
              fontFamily: 'inherit' 
            }}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );

  // Estilo común para los subtítulos de sección (como el 2, 3, 6)
  const headerSeccionEstilo = {
    ...styles.labelStyle,
    fontSize: '1rem',
    marginBottom: '15px',
    display: 'block',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '5px'
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => setView('perfil')} style={styles.backBtn}>← Cancelar</button>
      
      <div style={styles.cardStyle}>
        <h3 style={{ ...styles.cardTitle, color: '#000' }}>
          <ClipboardCheck color="#2563eb" /> Antecedentes del Paciente
        </h3>

        {/* 1. IDENTIFICACIÓN BÁSICA */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={styles.secHeader}>1. Identificación Básica</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', alignItems: 'end' }}>
            <div style={styles.inputWrapper}>
              <label style={styles.labelStyle}>NHC / ID</label>
              <input style={styles.inputStyle} value={paciente.id} onChange={e => setPaciente({ ...paciente, id: e.target.value })} placeholder="Ej: 123456" />
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.labelStyle}>Fecha Nacimiento</label>
              <input type="date" style={styles.inputStyle} value={paciente.fecha_nacimiento} onChange={e => setPaciente({ ...paciente, fecha_nacimiento: e.target.value })} />
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.labelStyle}>Género</label>
              <select style={styles.selectStyle} value={paciente.genero} onChange={e => setPaciente({ ...paciente, genero: e.target.value })} >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* CUESTIONARIO CLÍNICO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={styles.questionBlock}>
            <PreguntaClinicaLocal id="q1" label="1. Do you have any confirmed allergies?" />
            {cuestionario.q1 === 'Yes' && (
              <textarea 
                style={{ ...styles.detailInput, marginTop: '10px' }} 
                placeholder="Please provide details..." 
                value={cuestionario.q1_details || ''}
                onChange={e => handleCuestionario('q1_details', e.target.value)} 
              />
            )}
          </div>

          <div style={styles.questionBlock}>
            <h4 style={headerSeccionEstilo}>2. Do you have suspected allergies to:</h4>
            <div style={styles.gridQuestions}>
              <PreguntaClinicaLocal id="q2_foods" label="• Foods?" />
              <PreguntaClinicaLocal id="q2_insects" label="• Insects or ticks?" />
              <PreguntaClinicaLocal id="q2_meds" label="• Medications?" />
              <PreguntaClinicaLocal id="q2_other" label="• Other?" />
            </div>
            {(cuestionario.q2_foods === 'Yes' || cuestionario.q2_insects === 'Yes' || cuestionario.q2_meds === 'Yes' || cuestionario.q2_other === 'Yes') && (
              <textarea style={styles.detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q2_details', e.target.value)} />
            )}
          </div>

          <div style={styles.questionBlock}>
            <h4 style={headerSeccionEstilo}>3. Are you taking any of the following allergy or asthma medications:</h4>
            <div style={styles.gridQuestions}>
              <PreguntaClinicaLocal id="q3_anti" label="• Antihistamines?" />
              <PreguntaClinicaLocal id="q3_eyes" label="• Eyedrops?" />
              <PreguntaClinicaLocal id="q3_nasal" label="• Nasal sprays?" />
              <PreguntaClinicaLocal id="q3_puff" label="• Asthma puffers?" />
              <PreguntaClinicaLocal id="q3_cream" label="• Eczema creams?" />
            </div>
            {(cuestionario.q3_anti === 'Yes' || cuestionario.q3_eyes === 'Yes' || cuestionario.q3_nasal === 'Yes' || cuestionario.q3_puff === 'Yes' || cuestionario.q3_cream === 'Yes') && (
              <textarea style={styles.detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q3_details', e.target.value)} />
            )}
          </div>

          <div style={styles.gridQuestions}>
            <div style={styles.questionBlock}>
              <PreguntaClinicaLocal id="q4" label="4. Prescribed adrenaline device?" />
            </div>
            <div style={styles.questionBlock}>
              <PreguntaClinicaLocal id="q5" label="5. Other medications/supplements?" />
              {cuestionario.q5 === 'Yes' && <textarea style={styles.detailInput} placeholder="Provide details..." onChange={e => handleCuestionario('q5_details', e.target.value)} />}
            </div>
          </div>

          <div style={styles.questionBlock}>
            <h4 style={headerSeccionEstilo}>6. Do you have any of the following:</h4>
            <div style={styles.gridQuestions}>
              <PreguntaClinicaLocal id="q6_rhin" label="• Allergic rhinitis?" />
              <PreguntaClinicaLocal id="q6_asth" label="• Asthma?" />
              <PreguntaClinicaLocal id="q6_ecze" label="• Eczema?" />
              <PreguntaClinicaLocal id="q6_hive" label="• Hives?" />
              <PreguntaClinicaLocal id="q6_head" label="• Regular headaches?" />
              <PreguntaClinicaLocal id="q6_sinu" label="• Sinus problems?" />
              <PreguntaClinicaLocal id="q6_mouth" label="• Itchy mouth?" />
            </div>
          </div>

          <div style={styles.questionBlock}>
            <PreguntaClinicaLocal id="q7" label="7. Do you live with indoor pets?" />
            {cuestionario.q7 === 'Yes' && <textarea style={styles.detailInput} placeholder="Details..." onChange={e => handleCuestionario('q7_details', e.target.value)} />}
          </div>

          <div style={styles.questionBlock}>
            <PreguntaClinicaLocal id="q9" label="9. Family history of allergies?" />
            {cuestionario.q9 === 'Yes' && <textarea style={styles.detailInput} placeholder="Details..." onChange={e => handleCuestionario('q9_details', e.target.value)} />}
          </div>

          <div style={styles.questionBlock}>
            <PreguntaClinicaLocal id="q10" label="10. Other medical problems/surgeries?" />
            {cuestionario.q10 === 'Yes' && <textarea style={styles.detailInput} placeholder="Details..." onChange={e => handleCuestionario('q10_details', e.target.value)} />}
          </div>
        </div>

        <button onClick={validarYPasarAEvento} style={styles.calcBtn}>
          Continuar a Event Record <ArrowRight />
        </button>
      </div>
    </div>
  );
};

export default AntecedentesView;