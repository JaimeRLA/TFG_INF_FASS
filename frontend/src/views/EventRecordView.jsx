import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { styles } from '../AppStyles.js';

const EventRecordView = ({ evento, handleEvento, setView, esPacienteExistente }) => {
  
  // Componente interno para estandarizar las preguntas Yes/No con el estilo de NHC
  const PreguntaTratamientoLocal = ({ id, label }) => (
    <div style={styles.rowYesNo}>
      {/* Aplicamos styles.labelStyle para que coincida con NHC/Fecha Nacimiento */}
      <span style={{ ...styles.labelStyle, fontWeight: '500', flex: 1 }}>{label}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['Yes', 'No'].map(op => (
          <button
            key={op}
            onClick={() => handleEvento(id, op)}
            style={{
              ...(evento[id] === op ? styles.btnMiniActive : styles.btnMini),
              fontFamily: 'inherit',
              padding: '6px 15px'
            }}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {!esPacienteExistente && (
        <button onClick={() => setView('registro_paciente')} style={styles.backBtn}>
           ← Volver a Antecedentes
        </button>
      )}

      <div style={styles.cardStyle}>
        <h3 style={{ ...styles.cardTitle, color: '#000' }}>
          <Activity color="#ef4444" /> Event Record (Reaction Details)
        </h3>

        {esPacienteExistente && (
          <div style={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '0.9rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🔒 Perfil de paciente verificado. Los antecedentes están bloqueados.</span>
          </div>
        )}

        {/* 1. DETALLES DE TIEMPO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={styles.inputWrapper}>
            <label style={styles.labelStyle}>Date and time of reaction:</label>
            <input type="datetime-local" style={styles.inputStyle} value={evento.reaccion_fecha} onChange={e => handleEvento('reaccion_fecha', e.target.value)} />
          </div>
          <div style={styles.inputWrapper}>
            <label style={styles.labelStyle}>Duration of symptoms:</label>
            <input style={styles.inputStyle} value={evento.duration} placeholder="e.g. 30 mins, 2 hours" onChange={e => handleEvento('duration', e.target.value)} />
          </div>
        </div>

        {/* 2. DISPARADORES */}
        <h4 style={styles.secHeader}>Suspected Triggers</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={styles.inputWrapper}><label style={styles.labelStyle}>Food/s:</label><input style={styles.inputStyle} value={evento.trigger_food} onChange={e => handleEvento('trigger_food', e.target.value)} placeholder="Name" /></div>
          <div style={styles.inputWrapper}><label style={styles.labelStyle}>Insects or Ticks:</label><input style={styles.inputStyle} value={evento.trigger_insect} onChange={e => handleEvento('trigger_insect', e.target.value)} placeholder="Name" /></div>
          <div style={styles.inputWrapper}><label style={styles.labelStyle}>Drug/s (Medication):</label><input style={styles.inputStyle} value={evento.trigger_drug} onChange={e => handleEvento('trigger_drug', e.target.value)} placeholder="Name" /></div>
        </div>

        {evento.trigger_drug && (
          <div style={{ ...styles.questionBlock, borderLeft: '5px solid #2563eb', marginBottom: '20px', paddingLeft: '15px' }}>
            <h4 style={{ ...styles.labelStyle, marginBottom: '10px', color: '#2563eb' }}>Drug Allergy Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={styles.inputWrapper}><label style={styles.labelStyle}>Reason prescribed:</label><input style={styles.inputStyle} value={evento.drug_reason} onChange={e => handleEvento('drug_reason', e.target.value)} /></div>
              <div style={styles.inputWrapper}><label style={styles.labelStyle}>Form (capsule, IV...):</label><input style={styles.inputStyle} value={evento.drug_form} onChange={e => handleEvento('drug_form', e.target.value)} /></div>
              <div style={styles.inputWrapper}><label style={styles.labelStyle}>Other drugs taken:</label><input style={styles.inputStyle} value={evento.drug_other} onChange={e => handleEvento('drug_other', e.target.value)} /></div>
              <div style={styles.inputWrapper}>
                <label style={styles.labelStyle}>Time of onset:</label>
                <select style={styles.selectStyle} value={evento.drug_onset} onChange={e => handleEvento('drug_onset', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="within 1-2 hours">within 1-2 hours</option>
                  <option value="after 2 hours">after 2 hours</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 3. ENTORNO */}
        <h4 style={styles.secHeader}>Environment & Activity</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={styles.inputWrapper}>
            <label style={styles.labelStyle}>Location of reaction:</label>
            <select style={styles.selectStyle} value={evento.location} onChange={e => handleEvento('location', e.target.value)}>
              <option value="">Select...</option>
              <option value="Home">Home</option>
              <option value="School">School</option>
              <option value="Care Services">Education/Care Services</option>
              <option value="Work">Work</option>
              <option value="Dining out">Dining out</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={styles.inputWrapper}>
            <label style={styles.labelStyle}>Activity immediately before:</label>
            <select style={styles.selectStyle} value={evento.activity} onChange={e => handleEvento('activity', e.target.value)}>
              <option value="">Select...</option>
              <option value="Eating">Eating</option>
              <option value="Gardening">Gardening</option>
              <option value="Exercise">Exercise</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* 4. MANEJO Y TRATAMIENTO */}
        <h4 style={styles.secHeader}>Management & Treatment</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Pregunta 1 */}
          <PreguntaTratamientoLocal id="adrenaline" label="Was adrenaline administered?" />
          
          {/* Pregunta 2 */}
          <PreguntaTratamientoLocal id="other_treatment_yn" label="Was any other treatment given?" />
          {evento.other_treatment_yn === 'Yes' && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '-10px' }} 
              value={evento.other_treatment_details} 
              placeholder="Provide details (Steroids, Antihistamines, etc)..." 
              onChange={e => handleEvento('other_treatment_details', e.target.value)} 
            />
          )}

          {/* Pregunta 3 */}
          <PreguntaTratamientoLocal id="ambulance" label="Was an ambulance called?" />

        </div>
                
        <div style={{ marginTop: '25px' }}>
          <label style={styles.labelStyle}>Other relevant information:</label>
          <textarea 
            style={styles.detailInput} 
            value={evento.other_info} 
            placeholder="Additional clinical notes..."
            onChange={e => handleEvento('other_info', e.target.value)} 
          />
        </div>
        
        <button onClick={() => setView('calculadora')} style={{ ...styles.calcBtn, marginTop: '30px' }}>
          Continuar a Síntomas <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default EventRecordView;