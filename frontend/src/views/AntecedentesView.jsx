import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  ArrowRight, 
  Lock, 
  User, 
  ShieldAlert,
  Pill,
  Activity,
  Home,
  AlertCircle
} from 'lucide-react';
import { styles } from '../AppStyles.js';
import CryptoJS from 'crypto-js'; // Asegúrate de tener crypto-js instalado

const AntecedentesView = ({ 
  paciente, 
  setPaciente, 
  cuestionario, 
  handleCuestionario, 
  validarYPasarAEvento, 
  setView, 
  esPacienteExistente,
  listaPacientes // <-- Asegúrate de pasar esta prop desde App.jsx
}) => {
  
  const [errorNHC, setErrorNHC] = useState('');

  // Validación de NHC repetido
  useEffect(() => {
    if (!esPacienteExistente && paciente.id) {
      const nhcIntroducido = paciente.id.trim();
      // Generamos el hash del NHC introducido para comparar con la DB
      const hashIntroducido = CryptoJS.SHA256(nhcIntroducido).toString();
      
      const yaExiste = listaPacientes.some(p => p.nhc_hash === hashIntroducido);
      
      if (yaExiste) {
        setErrorNHC('Este NHC ya está registrado. Use "Seleccionar Paciente" para añadir un nuevo evento.');
      } else {
        setErrorNHC('');
      }
    }
  }, [paciente.id, listaPacientes, esPacienteExistente]);

  const handlePacienteChange = (e) => {
    const { name, value } = e.target;
    setPaciente(prev => ({ ...prev, [name]: value }));
  };

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
      alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '10px 15px',
      backgroundColor: '#f8fafc', borderLeft: '4px solid #2563eb', borderRadius: '0 8px 8px 0'
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
                  style={{ 
                    ...styles.inputStyle, 
                    backgroundColor: esPacienteExistente ? '#f8fafc' : '#fff',
                    borderColor: errorNHC ? '#ef4444' : '#e2e8f0' 
                  }} 
                />
                {esPacienteExistente && <Lock size={16} style={{ position: 'absolute', right: 12, top: 14, color: '#94a3b8' }} />}
              </div>
              {errorNHC && (
                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> {errorNHC}
                </div>
              )}
            </div>
            {/* ... Resto de inputs de identificación igual ... */}
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

        {/* ... SECCIONES 2 A 5 SE MANTIENEN IGUAL ... */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={ShieldAlert} title="Alergias y Reacciones Conocidas" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <PreguntaClinicaLocal id="q1" label="Do you have any confirmed allergies?" />
            <PreguntaClinicaLocal id="q2_foods" label="Suspected allergy to Foods?" />
            <PreguntaClinicaLocal id="q2_insects" label="Suspected allergy to Insects/Ticks?" />
            <PreguntaClinicaLocal id="q2_meds" label="Suspected allergy to Medications?" />
          </div>
        </div>
        
        {/* (Omitido por brevedad para no repetir todo el cuestionario, pero mantén las secciones que ya tenías) */}

        <button 
          onClick={validarYPasarAEvento} 
          disabled={!!errorNHC} // Bloqueamos el botón si hay error
          style={{ 
            ...styles.calcBtn, 
            width: '100%', padding: '20px', borderRadius: '15px', fontSize: '1.1rem',
            opacity: errorNHC ? 0.6 : 1,
            cursor: errorNHC ? 'not-allowed' : 'pointer',
            boxShadow: errorNHC ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
          }}
        >
          Continuar a Event Record <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default AntecedentesView;