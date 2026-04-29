import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowRight, 
  Clock, 
  Target, 
  MapPin, 
  Stethoscope, 
  AlertCircle,
  Pill,
  Lock
} from 'lucide-react';
import { styles } from '../AppStyles.js';

const EventRecordView = ({ evento, handleEvento, setView, esPacienteExistente }) => {
  
  const [errorFecha, setErrorFecha] = useState('');

  // --- RESTRICCIONES DE TIEMPO ---
  const getLimitesFecha = () => {
    const d = new Date();
    
    // Límite Superior: Ahora (con 1 min de margen para evitar errores de segundos)
    const futuro = new Date(d.getTime() + 60000);
    const ahoraString = futuro.toISOString().slice(0, 16);

    // Límite Inferior: Hace 120 años
    const pasado = new Date();
    pasado.setFullYear(pasado.getFullYear() - 120);
    const minimoString = pasado.toISOString().slice(0, 16);

    return { ahoraString, minimoString };
  };

  useEffect(() => {
    const { ahoraString, minimoString } = getLimitesFecha();
    
    if (evento.reaccion_fecha) {
      if (evento.reaccion_fecha > ahoraString) {
        setErrorFecha('La fecha y hora de la reacción no pueden ser futuras.');
      } else if (evento.reaccion_fecha < minimoString) {
        setErrorFecha('La fecha es demasiado antigua (>120 años).');
      } else {
        setErrorFecha('');
      }
    }
  }, [evento.reaccion_fecha]);

  // Componente interno para las preguntas de Sí/No
  const PreguntaTratamientoLocal = ({ id, label }) => (
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
              onClick={() => handleEvento(id, valEnvio)}
              aria-pressed={evento[id] === valEnvio}
              aria-label={`${label}: ${op}`}
              style={{
                padding: '4px 12px',
                borderRadius: '3px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: evento[id] === valEnvio ? (valEnvio === 'Yes' ? '#0f172a' : '#475569') : 'transparent',
                color: evento[id] === valEnvio ? '#fff' : '#64748b',
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
      
      <button 
        onClick={() => setView(esPacienteExistente ? 'perfil' : 'registro_paciente')} 
        style={styles.backBtn}
      >
        {esPacienteExistente ? '← Volver a Menú' : '← Volver a Antecedentes'}
      </button>

      <div style={{ ...styles.cardStyle, padding: '28px' }}>
        <div style={{ marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="#1d4ed8" size={20} />
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>Registro clínico</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '2px 0 0' }}>Registro del Evento</h3>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '8px 0 0 30px' }}>Detalles clínicos de la reacción actual</p>
        </div>

        {/* SECCIÓN 1: TIEMPO Y DURACIÓN */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={Clock} title="Cronología de la Reacción" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <div>
              <label htmlFor="ev-fecha" style={styles.labelStyle}>Fecha y hora de la reacción:</label>
              <input 
                id="ev-fecha"
                type="datetime-local" 
                style={{
                    ...styles.inputStyle,
                    borderColor: errorFecha ? '#ef4444' : '#e2e8f0',
                    borderWidth: errorFecha ? '2px' : '1px',
                    backgroundColor: errorFecha ? '#fff1f2' : '#fff',
                    outline: errorFecha ? 'none' : 'initial'
                }} 
                value={evento.reaccion_fecha || ''} 
                onChange={e => handleEvento('reaccion_fecha', e.target.value)} 
              />
              {errorFecha && (
                <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', fontWeight: 'bold' }}>
                  <AlertCircle size={16} /> {errorFecha}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="ev-duracion" style={styles.labelStyle}>Duración de los síntomas:</label>
              <input 
                id="ev-duracion"
                style={styles.inputStyle} 
                value={evento.duration || ''} 
                placeholder="ej: 30 min, 2 horas" 
                onChange={e => handleEvento('duration', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DISPARADORES */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={Target} title="Disparadores Sospechosos" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div><label htmlFor="ev-food" style={styles.labelStyle}>Alimento/s:</label><input id="ev-food" style={styles.inputStyle} value={evento.trigger_food || ''} onChange={e => handleEvento('trigger_food', e.target.value)} placeholder="Nombre" /></div>
            <div><label htmlFor="ev-insect" style={styles.labelStyle}>Insectos o Garrapatas:</label><input id="ev-insect" style={styles.inputStyle} value={evento.trigger_insect || ''} onChange={e => handleEvento('trigger_insect', e.target.value)} placeholder="Nombre" /></div>
            <div><label htmlFor="ev-drug" style={styles.labelStyle}>Medicamento/s:</label><input id="ev-drug" style={styles.inputStyle} value={evento.trigger_drug || ''} onChange={e => handleEvento('trigger_drug', e.target.value)} placeholder="Nombre" /></div>
          </div>
        </div>

        {/* SECCIÓN 3: CONTEXTO */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={MapPin} title="Entorno y Actividad" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <select aria-label="Lugar de la reacción" style={styles.selectStyle} value={evento.location || ''} onChange={e => handleEvento('location', e.target.value)}>
              <option value="">Lugar de la reacción...</option>
              <option value="Home">Domicilio</option>
              <option value="School">Escuela / Centro Educativo</option>
              <option value="Care Services">Servicios de Cuidado</option>
              <option value="Work">Trabajo</option>
              <option value="Dining out">Restaurante / Fuera</option>
              <option value="Other">Otro</option>
            </select>
            <select aria-label="Actividad inmediatamente antes de la reacción" style={styles.selectStyle} value={evento.activity || ''} onChange={e => handleEvento('activity', e.target.value)}>
              <option value="">Actividad inmediatamente antes...</option>
              <option value="Eating">Comiendo</option>
              <option value="Gardening">Jardinería</option>
              <option value="Exercise">Ejercicio</option>
              <option value="Other">Otra</option>
            </select>
          </div>
        </div>

        {/* SECCIÓN 4: MANEJO */}
        <div style={{ marginBottom: '40px' }}>
          <SectionHeader icon={Stethoscope} title="Manejo y Tratamiento" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PreguntaTratamientoLocal id="adrenaline" label="¿Se administró adrenalina?" />
            <PreguntaTratamientoLocal id="other_treatment_yn" label="¿Se administró algún otro tratamiento?" />
            {evento.other_treatment_yn === 'Yes' && (
              <textarea 
                aria-label="Detalles del tratamiento administrado"
                style={{ ...styles.detailInput }} 
                value={evento.other_treatment_details || ''} 
                placeholder="Proporcione detalles (Esteroides, Antihistamínicos, etc)..." 
                onChange={e => handleEvento('other_treatment_details', e.target.value)} 
              />
            )}
            <PreguntaTratamientoLocal id="ambulance" label="¿Se llamó a una ambulancia?" />
          </div>
        </div>

        {/* BOTÓN FINAL DE VISTA */}
        <button 
          onClick={() => {
            if (!errorFecha) setView('calculadora');
          }} 
          disabled={!!errorFecha} 
          style={{ 
            ...styles.calcBtn, 
            width: '100%', 
            padding: '12px', 
            borderRadius: '6px', 
            fontSize: '0.95rem',
            backgroundColor: errorFecha ? '#94a3b8' : '#0f172a', 
            boxShadow: 'none',
            cursor: errorFecha ? 'not-allowed' : 'pointer',
            opacity: errorFecha ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {errorFecha ? 'Fecha no válida' : 'Continuar a Evaluación de Síntomas'} 
          {!errorFecha && <ArrowRight size={22} />}
        </button>
      </div>
    </div>
  );
};

export default EventRecordView;