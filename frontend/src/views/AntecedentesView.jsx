import React from 'react';
import { 
  ClipboardCheck, 
  ArrowRight, 
  Lock, 
  User, 
  Stethoscope, 
  Pill, 
  Activity, 
  ShieldAlert,
  Home
} from 'lucide-react';
import { styles } from '../AppStyles.js';

const AntecedentesView = ({ paciente, setPaciente, cuestionario, handleCuestionario, validarYPasarAEvento, setView, esPacienteExistente }) => {
  
  const handlePacienteChange = (e) => {
    const { name, value } = e.target;
    setPaciente(prev => ({ ...prev, [name]: value }));
  };

  // Componente interno para las preguntas de Sí/No (Estilo Event Record)
  const PreguntaClinicaLocal = ({ id, label }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '500' }}>{label}</span>
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
        {['Yes', 'No'].map(op => (
          <button
            key={op}
            onClick={() => handleCuestionario(id, op)}
            style={{
              padding: '5px 15px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: cuestionario[id] === op ? (op === 'Yes' ? '#2563eb' : '#64748b') : 'transparent',
              color: cuestionario[id] === op ? '#fff' : '#64748b',
            }}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );

  // Componente para las cabeceras de sección azul (Igual que Event Record)
  const SectionHeader = ({ icon: Icon, title }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
      padding: '10px 15px',
      backgroundColor: '#f8fafc',
      borderLeft: '4px solid #2563eb',
      borderRadius: '0 8px 8px 0'
    }}>
      <Icon size={20} color="#2563eb" />
      <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </h4>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => setView('perfil')} style={styles.backBtn}>← Cancelar</button>
      
      <div style={{ ...styles.cardStyle, padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#eff6ff', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <ClipboardCheck color="#2563eb" size={32} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Antecedentes del Paciente</h3>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Complete el perfil clínico previo a la evaluación de síntomas</p>
        </div>

        {/* SECCIÓN 1: IDENTIFICACIÓN */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={User} title="Identificación del Paciente" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label style={styles.labelStyle}>NHC / Identificador</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  name="id"
                  disabled={esPacienteExistente}
                  value={paciente.id || ''}
                  onChange={handlePacienteChange}
                  placeholder="Ej: 123456" 
                  style={{ ...styles.inputStyle, backgroundColor: esPacienteExistente ? '#f8fafc' : '#fff' }} 
                />
                {esPacienteExistente && <Lock size={16} style={{ position: 'absolute', right: 12, top: 14, color: '#94a3b8' }} />}
              </div>
            </div>
            <div>
              <label style={styles.labelStyle}>{esPacienteExistente ? 'Rango de Edad' : 'Fecha de Nacimiento'}</label>
              {esPacienteExistente ? (
                <input type="text" disabled value={paciente.rango_edad || ''} style={{ ...styles.inputStyle, backgroundColor: '#f8fafc' }} />
              ) : (
                <input type="date" name="fecha_nacimiento" value={paciente.fecha_nacimiento || ''} onChange={handlePacienteChange} style={styles.inputStyle} />
              )}
            </div>
            <div>
              <label style={styles.labelStyle}>Género</label>
              <select 
                name="genero" 
                value={paciente.genero || ''} 
                onChange={handlePacienteChange} 
                disabled={esPacienteExistente} 
                style={{ ...styles.selectStyle, backgroundColor: esPacienteExistente ? '#f8fafc' : '#fff' }}
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: ALERGIAS CONOCIDAS */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={ShieldAlert} title="Alergias y Reacciones Conocidas" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <PreguntaClinicaLocal id="q1" label="Do you have any confirmed allergies?" />
            <PreguntaClinicaLocal id="q2_foods" label="Suspected allergy to Foods?" />
            <PreguntaClinicaLocal id="q2_insects" label="Suspected allergy to Insects/Ticks?" />
            <PreguntaClinicaLocal id="q2_meds" label="Suspected allergy to Medications?" />
            
            {(cuestionario.q1 === 'Yes' || cuestionario.q2_foods === 'Yes' || cuestionario.q2_insects === 'Yes' || cuestionario.q2_meds === 'Yes') && (
              <textarea 
                style={{ ...styles.detailInput, border: '1px solid #2563eb', backgroundColor: '#f0f7ff' }} 
                placeholder="Details about allergens and previous reactions..." 
                value={cuestionario.q1_details || cuestionario.q2_details || ''}
                onChange={e => handleCuestionario('q1_details', e.target.value)} 
              />
            )}
          </div>
        </div>

        {/* SECCIÓN 3: MEDICACIÓN ACTUAL */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={Pill} title="Medicación y Tratamientos" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x 40px', rowGap: '10px' }}>
            <PreguntaClinicaLocal id="q3_anti" label="Antihistamines?" />
            <PreguntaClinicaLocal id="q3_nasal" label="Nasal sprays?" />
            <PreguntaClinicaLocal id="q3_puff" label="Asthma puffers?" />
            <PreguntaClinicaLocal id="q4" label="Prescribed adrenaline?" />
            <PreguntaClinicaLocal id="q5" label="Other supplements?" />
          </div>
          {cuestionario.q5 === 'Yes' && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px' }} 
              placeholder="Specify medications..." 
              value={cuestionario.q5_details || ''}
              onChange={e => handleCuestionario('q5_details', e.target.value)} 
            />
          )}
        </div>

        {/* SECCIÓN 4: CONDICIONES CRÓNICAS */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={Activity} title="Condiciones Crónicas" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 40px' }}>
            <PreguntaClinicaLocal id="q6_rhin" label="Allergic rhinitis?" />
            <PreguntaClinicaLocal id="q6_asth" label="Asthma?" />
            <PreguntaClinicaLocal id="q6_ecze" label="Eczema?" />
            <PreguntaClinicaLocal id="q6_hive" label="Hives?" />
            <PreguntaClinicaLocal id="q6_head" label="Regular headaches?" />
            <PreguntaClinicaLocal id="q9" label="Family history?" />
          </div>
        </div>

        {/* SECCIÓN 5: OTROS */}
        <div style={{ marginBottom: '40px' }}>
          <SectionHeader icon={Home} title="Entorno y Otros" />
          <PreguntaClinicaLocal id="q7" label="Do you live with indoor pets?" />
          <PreguntaClinicaLocal id="q10" label="Other medical problems/surgeries?" />
          {cuestionario.q10 === 'Yes' && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px' }} 
              placeholder="Describe other clinical issues..." 
              value={cuestionario.q10_details || ''}
              onChange={e => handleCuestionario('q10_details', e.target.value)} 
            />
          )}
        </div>

        <button 
          onClick={validarYPasarAEvento} 
          style={{ 
            ...styles.calcBtn, 
            width: '100%', 
            padding: '20px', 
            borderRadius: '15px', 
            fontSize: '1.1rem',
            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
          }}
        >
          Continuar a Event Record <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default AntecedentesView;