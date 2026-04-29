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
      borderBottom: '1px solid #e2e8f0'
    }}>
      <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>{label}</span>
      <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
        {['Sí', 'No'].map(op => {
          const valEnvio = op === 'Sí' ? 'Yes' : 'No';
          return (
            <button
              key={op}
              onClick={() => handleCuestionario(id, valEnvio)}
              style={{
                padding: '4px 12px',
                borderRadius: '3px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: cuestionario[id] === valEnvio ? (valEnvio === 'Yes' ? '#0f172a' : '#475569') : 'transparent',
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
      gap: '8px',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e2e8f0',
    }}>
      <Icon size={15} color="#1d4ed8" />
      <h4 style={{ margin: 0, fontSize: '0.7rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </h4>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => setView('perfil')} style={styles.backBtn}>← Volver al Menú</button>
      
      <div style={{ ...styles.cardStyle, padding: '28px' }}>
        <div style={{ marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardCheck color="#1d4ed8" size={20} />
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>Registro de paciente</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '2px 0 0' }}>Antecedentes del Paciente</h3>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '8px 0 0 30px' }}>Complete el perfil clínico previo a la evaluación de síntomas</p>
        </div>

        {/* SECCIÓN 1: IDENTIFICACIÓN */}
        <div style={{ marginBottom: '28px' }}>
          <SectionHeader icon={User} title="Identificación del Paciente" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label style={styles.labelStyle}>NHC / Identificador*</label>
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
              <label style={styles.labelStyle}>{esPacienteExistente ? 'Rango de Edad' : 'Fecha de Nacimiento*'}</label>
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
              <label style={styles.labelStyle}>Género*</label>
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
        <div style={{ marginBottom: '28px' }}>
          <SectionHeader icon={ShieldAlert} title="Alergias y Reacciones Conocidas" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <PreguntaClinicaLocal id="q1" label="¿Tiene alguna alergia confirmada?" />
            {cuestionario.q1 === 'Yes' && (
              <textarea 
                style={{ ...styles.detailInput }} 
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
                style={{ ...styles.detailInput }} 
                placeholder="Detalles sobre los alérgenos sospechosos..." 
                value={cuestionario.q2_details || ''}
                onChange={e => handleCuestionario('q2_details', e.target.value)} 
              />
            )}
          </div>
        </div>

        {/* SECCIÓN 3: MEDICACIÓN ACTUAL */}
        <div style={{ marginBottom: '28px' }}>
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
        <div style={{ marginBottom: '28px' }}>
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
            width: '100%', padding: '12px', borderRadius: '6px', fontSize: '0.95rem',
            backgroundColor: hayErroresBloqueantes ? '#94a3b8' : '#0f172a',
            cursor: hayErroresBloqueantes ? 'not-allowed' : 'pointer',
            opacity: hayErroresBloqueantes ? 0.7 : 1
          }}
        >
          Continuar al Registro del Evento <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default AntecedentesView;