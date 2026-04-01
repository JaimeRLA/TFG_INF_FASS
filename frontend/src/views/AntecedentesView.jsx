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

const AntecedentesView = ({ 
  paciente, 
  setPaciente, 
  cuestionario, 
  handleCuestionario, 
  validarYPasarAEvento, 
  setView, 
  esPacienteExistente, 
  listaPacientes 
}) => {
  
  const [errorNHC, setErrorNHC] = useState('');
  const [errorFecha, setErrorFecha] = useState('');

  // --- RESTRICCIONES DE FECHA LÓGICA ---
  const hoy = new Date().toISOString().split("T")[0]; 
  const hace120Anios = new Date();
  hace120Anios.setFullYear(hace120Anios.getFullYear() - 120);
  const fechaMinima = hace120Anios.toISOString().split("T")[0]; 

  useEffect(() => {
    // 1. VALIDACIÓN DE NHC DUPLICADO
    if (!esPacienteExistente && paciente.id) {
      const nhcNormalizado = paciente.id.trim();
      const hashIntroducido = CryptoJS.SHA256(nhcNormalizado).toString();
      
      const yaExiste = listaPacientes.some(p => p.nhc_hash === hashIntroducido);
      
      if (yaExiste) {
        setErrorNHC('Este NHC ya está registrado. Use "Seleccionar Paciente" para añadir eventos.');
      } else {
        setErrorNHC('');
      }
    } else {
      setErrorNHC('');
    }

    // 2. VALIDACIÓN DE FECHA RAZONABLE
    if (!esPacienteExistente && paciente.fecha_nacimiento) {
      const fechaSeleccionada = paciente.fecha_nacimiento;
      if (fechaSeleccionada > hoy) {
        setErrorFecha('Error: La fecha de nacimiento no puede ser futura.');
      } else if (fechaSeleccionada < fechaMinima) {
        setErrorFecha('Error: Fecha fuera de rango clínico (>120 años).');
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

  const hayErroresBloqueantes = !!errorNHC || !!errorFecha;

  // Componente interno para las preguntas de Sí/No (Traducido)
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
        {['Sí', 'No'].map(op => {
          const valEnvio = op === 'Sí' ? 'Yes' : 'No'; // Mantenemos valor interno en inglés para la DB si es necesario, pero mostramos español
          return (
            <button
              key={op}
              onClick={() => handleCuestionario(id, valEnvio)}
              style={{
                padding: '5px 15px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: cuestionario[id] === valEnvio ? (valEnvio === 'Yes' ? '#2563eb' : '#64748b') : 'transparent',
                color: cuestionario[id] === valEnvio ? '#fff' : '#64748b',
              }}
            >
              {op}
            </button>
          );
        })}
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
      <button onClick={() => setView('perfil')} style={styles.backBtn}>← Volver al Menú</button>
      
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
            <PreguntaClinicaLocal id="q1" label="¿Tiene alguna alergia confirmada?" />
            {cuestionario.q1 === 'Yes' && (
              <textarea 
                style={{ ...styles.detailInput, border: '1px solid #2563eb', backgroundColor: '#f0f7ff' }} 
                placeholder="Detalles sobre las alergias confirmadas..." 
                value={cuestionario.q1_details || ''}
                onChange={e => handleCuestionario('q1_details', e.target.value)} 
              />
            )}
            <PreguntaClinicaLocal id="q2_foods" label="¿Sospecha de alergia a Alimentos?" />
            <PreguntaClinicaLocal id="q2_insects" label="¿Sospecha de alergia a Insectos/Garrapatas?" />
            <PreguntaClinicaLocal id="q2_meds" label="¿Sospecha de alergia a Medicamentos?" />
            
            {(cuestionario.q2_foods === 'Yes' || cuestionario.q2_insects === 'Yes' || cuestionario.q2_meds === 'Yes') && (
              <textarea 
                style={{ ...styles.detailInput, border: '1px solid #2563eb', backgroundColor: '#f0f7ff' }} 
                placeholder="Detalles sobre los alérgenos sospechosos..." 
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
            <PreguntaClinicaLocal id="q3_anti" label="¿Toma Antihistamínicos?" />
            <PreguntaClinicaLocal id="q3_nasal" label="¿Usa Sprays nasales?" />
            <PreguntaClinicaLocal id="q3_puff" label="¿Usa Inhaladores para el asma?" />
            <PreguntaClinicaLocal id="q4" label="¿Tiene adrenalina prescrita?" />
            <PreguntaClinicaLocal id="q5" label="¿Toma otros suplementos?" />
          </div>
          {(cuestionario.q3_anti === 'Yes' || cuestionario.q3_nasal === 'Yes' || cuestionario.q3_puff === 'Yes' || cuestionario.q5 === 'Yes') && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px' }} 
              placeholder="Especifique medicamentos y dosis..." 
              value={cuestionario.q3_details || cuestionario.q5_details || ''}
              onChange={e => handleCuestionario('q5_details', e.target.value)} 
            />
          )}
        </div>

        {/* SECCIÓN 4: CONDICIONES CRÓNICAS */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={Activity} title="Condiciones Crónicas" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 40px' }}>
            <PreguntaClinicaLocal id="q6_rhin" label="¿Padece Rinitis alérgica?" />
            <PreguntaClinicaLocal id="q6_asth" label="¿Padece Asma?" />
            <PreguntaClinicaLocal id="q6_ecze" label="¿Padece Eczema?" />
            <PreguntaClinicaLocal id="q6_hive" label="¿Padece Urticaria?" />
            <PreguntaClinicaLocal id="q6_head" label="¿Sufre dolores de cabeza regulares?" />
            <PreguntaClinicaLocal id="q9" label="¿Hay antecedentes familiares de alergia?" />
          </div>
          {cuestionario.q9 === 'Yes' && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px' }} 
              placeholder="Detalles de los antecedentes familiares..." 
              value={cuestionario.q9_details || ''}
              onChange={e => handleCuestionario('q9_details', e.target.value)} 
            />
          )}
        </div>

        {/* SECCIÓN 5: ENTORNO Y OTROS */}
        <div style={{ marginBottom: '40px' }}>
          <SectionHeader icon={Home} title="Entorno y Otros" />
          <PreguntaClinicaLocal id="q7" label="¿Convive con mascotas en el interior?" />
          {cuestionario.q7 === 'Yes' && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px', marginBottom: '15px' }} 
              placeholder="Tipo de mascotas..." 
              value={cuestionario.q7_details || ''}
              onChange={e => handleCuestionario('q7_details', e.target.value)} 
            />
          )}
          <PreguntaClinicaLocal id="q10" label="¿Otros problemas médicos o cirugías?" />
          {cuestionario.q10 === 'Yes' && (
            <textarea 
              style={{ ...styles.detailInput, marginTop: '15px' }} 
              placeholder="Describa otros problemas médicos..." 
              value={cuestionario.q10_details || ''}
              onChange={e => handleCuestionario('q10_details', e.target.value)} 
            />
          )}
        </div>

        <button 
          onClick={validarYPasarAEvento} 
          disabled={hayErroresBloqueantes} 
          style={{ 
            ...styles.calcBtn, 
            width: '100%', padding: '20px', borderRadius: '15px', fontSize: '1.1rem',
            backgroundColor: hayErroresBloqueantes ? '#cbd5e1' : '#2563eb',
            cursor: hayErroresBloqueantes ? 'not-allowed' : 'pointer',
            opacity: hayErroresBloqueantes ? 0.7 : 1,
            boxShadow: hayErroresBloqueantes ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
          }}
        >
          Continuar al Registro del Evento <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default AntecedentesView;