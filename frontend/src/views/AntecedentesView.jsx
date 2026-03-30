import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  ArrowRight, 
  Lock, 
  User, 
  Stethoscope, 
  Pill, 
  Activity, 
  ShieldAlert,
  Home,
  AlertCircle 
} from 'lucide-react';
import { styles } from '../AppStyles.js';
import CryptoJS from 'crypto-js';

const AntecedentesView = ({ paciente, setPaciente, cuestionario, handleCuestionario, validarYPasarAEvento, setView, esPacienteExistente, listaPacientes }) => {
  
  const [errorNHC, setErrorNHC] = useState('');
  const [errorFecha, setErrorFecha] = useState('');

  // --- RESTRICCIONES DE FECHA ---
  const hoy = new Date().toISOString().split("T")[0]; 
  const hace120Anios = new Date();
  hace120Anios.setFullYear(hace120Anios.getFullYear() - 120);
  const fechaMinima = hace120Anios.toISOString().split("T")[0]; 

  useEffect(() => {
    // 1. Validación de NHC duplicado
    if (!esPacienteExistente && paciente.id) {
      const nhcNormalizado = paciente.id.trim();
      const hashIntroducido = CryptoJS.SHA256(nhcNormalizado).toString();
      const yaExiste = listaPacientes.some(p => p.nhc_hash === hashIntroducido);
      
      if (yaExiste) {
        setErrorNHC('Este NHC ya existe. Use "Seleccionar Paciente".');
      } else {
        setErrorNHC('');
      }
    } else {
      setErrorNHC('');
    }

    // 2. Validación de FECHA Razonable
    if (!esPacienteExistente && paciente.fecha_nacimiento) {
      const fechaCargada = paciente.fecha_nacimiento;
      if (fechaCargada > hoy) {
        setErrorFecha('La fecha no puede ser futura.');
      } else if (fechaCargada < fechaMinima) {
        setErrorFecha('La fecha es demasiado antigua (>120 años).');
      } else {
        setErrorFecha('');
      }
    } else {
      setErrorFecha('');
    }
  }, [paciente.id, paciente.fecha_nacimiento, listaPacientes, esPacienteExistente, hoy, fechaMinima]);

  const handlePacienteChange = (e) => {
    const { name, value } = e.target;
    setPaciente(prev => ({ ...prev, [name]: value }));
  };

  const hayErrores = !!errorNHC || !!errorFecha;

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
                  maxLength={20}
                  style={{ 
                    ...styles.inputStyle, 
                    backgroundColor: esPacienteExistente ? '#f8fafc' : '#fff',
                    borderColor: errorNHC ? '#ef4444' : '#e2e8f0',
                    borderWidth: errorNHC ? '2px' : '1px'
                  }} 
                />
                {esPacienteExistente && <Lock size={16} style={{ position: 'absolute', right: 12, top: 14, color: '#94a3b8' }} />}
              </div>
              {errorNHC && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.75rem', marginTop: '5px', fontWeight: '600' }}>
                  <AlertCircle size={14} /> {errorNHC}
                </div>
              )}
            </div>
            <div>
              <label style={styles.labelStyle}>{esPacienteExistente ? 'Rango de Edad' : 'Fecha de Nacimiento'}</label>
              {esPacienteExistente ? (
                <input type="text" disabled value={paciente.rango_edad || ''} style={{ ...styles.inputStyle, backgroundColor: '#f8fafc' }} />
              ) : (
                <input 
                  type="date" 
                  name="fecha_nacimiento" 
                  value={paciente.fecha_nacimiento || ''} 
                  onChange={handlePacienteChange} 
                  max={hoy} 
                  min={fechaMinima}
                  style={{ 
                    ...styles.inputStyle,
                    borderColor: errorFecha ? '#ef4444' : '#e2e8f0',
                    borderWidth: errorFecha ? '2px' : '1px'
                  }} 
                />
              )}
              {errorFecha && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.75rem', marginTop: '5px', fontWeight: '600' }}>
                  <AlertCircle size={14} /> {errorFecha}
                </div>
              )}
            </div>
            <div>
              <label style={styles.labelStyle}>Género</label>
              <select 
                name="genero" value={paciente.genero || ''} onChange={handlePacienteChange} disabled={esPacienteExistente} 
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
            {cuestionario.q1 === 'Yes' && (
              <textarea 
                style={{ ...styles.detailInput, border: '1px solid #2563eb', backgroundColor: '#f0f7ff' }} 
                placeholder="Details about confirmed allergies..." 
                value={cuestionario.q1_details || ''}
                onChange={e => handleCuestionario('q1_details', e.target.value)} 
              />
            )}
            <PreguntaClinicaLocal id="q2_foods" label="Suspected allergy to Foods?" />
            <PreguntaClinicaLocal id="q2_insects" label="Suspected allergy to Insects/Ticks?" />
            <PreguntaClinicaLocal id="q2_meds" label="Suspected allergy to Medications?" />
            
            {(cuestionario.q2_foods === 'Yes' || cuestionario.q2_insects === 'Yes' || cuestionario.q2_meds === 'Yes') && (
              <textarea 
                style={{ ...styles.detailInput, border: '1px solid #2563eb', backgroundColor: '#f0f7ff' }} 
                placeholder="Details about suspected allergens..." 
                value={cuestionario.q2_details || ''}
                onChange={e => handleCuestionario('q2_details', e.target.value)} 
              />
            )}
          </div>
        </div>

        {/* SECCIÓN 3: MEDICACIÓN ACTUAL */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={Pill} title="Medicación y Tratamientos" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 40px' }}>
            <PreguntaClinicaLocal id="q3_anti" label="Antihistamines?" />
            <PreguntaClinicaLocal id="q3_nasal" label="Nasal sprays?" />
            <PreguntaClinicaLocal id="q3_puff" label="Asthma puffers?" />
            <PreguntaClinicaLocal id="q4" label="Prescribed adrenaline?" />
            <PreguntaClinicaLocal id="q5" label="Other supplements?" />
          </div>
          {(cuestionario.q3_anti === 'Yes' || cuestionario.q3_nasal === 'Yes' || cuestionario.q3_puff === 'Yes' || cuestionario.q5 === 'Yes') && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px' }} 
              placeholder="Specify medications and dosages..." 
              value={cuestionario.q3_details || cuestionario.q5_details || ''}
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
            <PreguntaClinicaLocal id="q9" label="Family history of allergy?" />
          </div>
          {cuestionario.q9 === 'Yes' && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px' }} 
              placeholder="Family history details..." 
              value={cuestionario.q9_details || ''}
              onChange={e => handleCuestionario('q9_details', e.target.value)} 
            />
          )}
        </div>

        {/* SECCIÓN 5: OTROS */}
        <div style={{ marginBottom: '40px' }}>
          <SectionHeader icon={Home} title="Entorno y Otros" />
          <PreguntaClinicaLocal id="q7" label="Do you live with indoor pets?" />
          {cuestionario.q7 === 'Yes' && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px', marginBottom: '15px' }} 
              placeholder="Type of pets..." 
              value={cuestionario.q7_details || ''}
              onChange={e => handleCuestionario('q7_details', e.target.value)} 
            />
          )}
          <PreguntaClinicaLocal id="q10" label="Other medical problems/surgeries?" />
          {cuestionario.q10 === 'Yes' && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px' }} 
              placeholder="Describe other medical issues..." 
              value={cuestionario.q10_details || ''}
              onChange={e => handleCuestionario('q10_details', e.target.value)} 
            />
          )}
        </div>

        <button 
          onClick={validarYPasarAEvento} 
          disabled={hayErrores} 
          style={{ 
            ...styles.calcBtn, 
            width: '100%', padding: '20px', borderRadius: '15px', fontSize: '1.1rem',
            backgroundColor: hayErrores ? '#cbd5e1' : '#2563eb',
            cursor: hayErrores ? 'not-allowed' : 'pointer',
            opacity: hayErrores ? 0.7 : 1
          }}
        >
          Continuar a Event Record <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default AntecedentesView;