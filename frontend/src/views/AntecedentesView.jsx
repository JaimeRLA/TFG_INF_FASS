import React from 'react';
import { ClipboardCheck, ArrowRight, Lock } from 'lucide-react';
import { styles } from '../AppStyles.js';

const AntecedentesView = ({ paciente, setPaciente, cuestionario, handleCuestionario, validarYPasarAEvento, setView, esPacienteExistente }) => {
  
  // Función para actualizar los campos de identificación
  const handlePacienteChange = (e) => {
    const { name, value } = e.target;
    setPaciente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const PreguntaClinicaLocal = ({ id, label }) => (
    <div style={styles.rowYesNo}>
      <span style={{ ...styles.labelStyle, fontWeight: '500', flex: 1 }}>{label}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['Yes', 'No'].map(op => (
          <button
            key={op}
            onClick={() => handleCuestionario(id, op)}
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

        {/* 1. IDENTIFICACIÓN BÁSICA - ADAPTADA A PSEUDONIMIZACIÓN */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={styles.secHeader}>
            1. Identificación {esPacienteExistente ? '(Modo Pseudónimo)' : 'Básica'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', alignItems: 'end' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', width: '100%' }}>
              
              {/* NHC / HASH */}
              <div style={{ flex: 1 }}>
                <label style={styles.labelStyle}>
                  {esPacienteExistente ? 'NHC (Hash Irreversible)' : 'NHC / ID'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    name="id"
                    disabled={esPacienteExistente}
                    value={paciente.id || ''}
                    onChange={handlePacienteChange}
                    placeholder={esPacienteExistente ? "" : "Ej: 123456"} 
                    style={{
                      ...styles.inputStyle,
                      backgroundColor: esPacienteExistente ? '#f8fafc' : '#fff',
                      color: esPacienteExistente ? '#64748b' : '#000',
                      paddingRight: esPacienteExistente ? '35px' : '10px'
                    }} 
                  />
                  {esPacienteExistente && <Lock size={16} style={{ position: 'absolute', right: 10, top: 12, color: '#94a3b8' }} />}
                </div>
              </div>

              {/* FECHA O RANGO DE EDAD */}
              <div style={{ flex: 1 }}>
                <label style={styles.labelStyle}>
                  {esPacienteExistente ? 'Rango de Edad' : 'Fecha Nacimiento'}
                </label>
                {esPacienteExistente ? (
                  <input 
                    type="text"
                    disabled
                    value={paciente.rango_edad || 'No disponible'}
                    style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', color: '#64748b' }}
                  />
                ) : (
                  <input 
                    type="date" 
                    name="fecha_nacimiento"
                    value={paciente.fecha_nacimiento || ''}
                    onChange={handlePacienteChange}
                    style={styles.inputStyle} 
                  />
                )}
              </div>

              {/* GÉNERO */}
              <div style={{ flex: 1 }}>
                <label style={styles.labelStyle}>Género</label>
                <select 
                  name="genero"
                  value={paciente.genero || ''}
                  onChange={handlePacienteChange}
                  disabled={esPacienteExistente}
                  style={{
                    ...styles.selectStyle,
                    backgroundColor: esPacienteExistente ? '#f8fafc' : '#fff'
                  }}
                >
                  <option value="">Select...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

            </div>
          </div>
          {esPacienteExistente && (
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
              * Los datos de identidad están protegidos mediante seudonimización. El NHC original no es recuperable.
            </p>
          )}
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
              <textarea 
                style={styles.detailInput} 
                placeholder="Please provide details..." 
                value={cuestionario.q2_details || ''}
                onChange={e => handleCuestionario('q2_details', e.target.value)} 
              />
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
              <textarea 
                style={styles.detailInput} 
                placeholder="Please provide details..." 
                value={cuestionario.q3_details || ''}
                onChange={e => handleCuestionario('q3_details', e.target.value)} 
              />
            )}
          </div>

          <div style={styles.gridQuestions}>
            <div style={styles.questionBlock}>
              <PreguntaClinicaLocal id="q4" label="4. Prescribed adrenaline device?" />
            </div>
            <div style={styles.questionBlock}>
              <PreguntaClinicaLocal id="q5" label="5. Other medications/supplements?" />
              {cuestionario.q5 === 'Yes' && (
                <textarea 
                  style={styles.detailInput} 
                  placeholder="Provide details..." 
                  value={cuestionario.q5_details || ''}
                  onChange={e => handleCuestionario('q5_details', e.target.value)} 
                />
              )}
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
            {cuestionario.q7 === 'Yes' && (
              <textarea 
                style={styles.detailInput} 
                placeholder="Details..." 
                value={cuestionario.q7_details || ''}
                onChange={e => handleCuestionario('q7_details', e.target.value)} 
              />
            )}
          </div>

          <div style={styles.questionBlock}>
            <PreguntaClinicaLocal id="q9" label="9. Family history of allergies?" />
            {cuestionario.q9 === 'Yes' && (
              <textarea 
                style={styles.detailInput} 
                placeholder="Details..." 
                value={cuestionario.q9_details || ''}
                onChange={e => handleCuestionario('q9_details', e.target.value)} 
              />
            )}
          </div>

          <div style={styles.questionBlock}>
            <PreguntaClinicaLocal id="q10" label="10. Other medical problems/surgeries?" />
            {cuestionario.q10 === 'Yes' && (
              <textarea 
                style={styles.detailInput} 
                placeholder="Details..." 
                value={cuestionario.q10_details || ''}
                onChange={e => handleCuestionario('q10_details', e.target.value)} 
              />
            )}
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