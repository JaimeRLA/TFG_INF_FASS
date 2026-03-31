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
    
    // Límite Superior: Ahora (con 1 min de margen)
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

  const PreguntaTratamientoLocal = ({ id, label }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '500' }}>{label}</span>
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
        {['Yes', 'No'].map(op => (
          <button
            key={op}
            onClick={() => handleEvento(id, op)}
            style={{
              padding: '5px 15px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: evento[id] === op ? (op === 'Yes' ? '#ef4444' : '#64748b') : 'transparent',
              color: evento[id] === op ? '#fff' : '#64748b',
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
      backgroundColor: '#fef2f2',
      borderLeft: '4px solid #ef4444',
      borderRadius: '0 8px 8px 0'
    }}>
      <Icon size={20} color="#ef4444" />
      <h4 style={{ margin: 0, fontSize: '1rem', color: '#991b1b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
        {esPacienteExistente ? '← Cancelar' : '← Volver a Antecedentes'}
      </button>

      <div style={{ ...styles.cardStyle, padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#fef2f2', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <Activity color="#ef4444" size={32} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Event Record</h3>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Detalles clínicos de la reacción actual</p>
        </div>

        {/* SECCIÓN 1: TIEMPO Y DURACIÓN */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={Clock} title="Timeline of Reaction" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <div>
              <label style={styles.labelStyle}>Date and time of reaction:</label>
              <input 
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', fontWeight: 'bold' }}>
                  <AlertCircle size={16} /> {errorFecha}
                </div>
              )}
            </div>
            <div>
              <label style={styles.labelStyle}>Duration of symptoms:</label>
              <input 
                style={styles.inputStyle} 
                value={evento.duration || ''} 
                placeholder="e.g. 30 mins, 2 hours" 
                onChange={e => handleEvento('duration', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DISPARADORES */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={Target} title="Suspected Triggers" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div><label style={styles.labelStyle}>Food/s:</label><input style={styles.inputStyle} value={evento.trigger_food || ''} onChange={e => handleEvento('trigger_food', e.target.value)} placeholder="Name" /></div>
            <div><label style={styles.labelStyle}>Insects or Ticks:</label><input style={styles.inputStyle} value={evento.trigger_insect || ''} onChange={e => handleEvento('trigger_insect', e.target.value)} placeholder="Name" /></div>
            <div><label style={styles.labelStyle}>Drug/s (Medication):</label><input style={styles.inputStyle} value={evento.trigger_drug || ''} onChange={e => handleEvento('trigger_drug', e.target.value)} placeholder="Name" /></div>
          </div>
        </div>

        {/* SECCIÓN 3: CONTEXTO */}
        <div style={{ marginBottom: '45px' }}>
          <SectionHeader icon={MapPin} title="Environment & Activity" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <select style={styles.selectStyle} value={evento.location || ''} onChange={e => handleEvento('location', e.target.value)}>
              <option value="">Location of reaction...</option>
              <option value="Home">Home</option>
              <option value="School">School</option>
              <option value="Care Services">Education/Care Services</option>
              <option value="Work">Work</option>
              <option value="Dining out">Dining out</option>
              <option value="Other">Other</option>
            </select>
            <select style={styles.selectStyle} value={evento.activity || ''} onChange={e => handleEvento('activity', e.target.value)}>
              <option value="">Activity immediately before...</option>
              <option value="Eating">Eating</option>
              <option value="Gardening">Gardening</option>
              <option value="Exercise">Exercise</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* SECCIÓN 4: MANEJO */}
        <div style={{ marginBottom: '40px' }}>
          <SectionHeader icon={Stethoscope} title="Management & Treatment" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PreguntaTratamientoLocal id="adrenaline" label="Was adrenaline administered?" />
            <PreguntaTratamientoLocal id="other_treatment_yn" label="Was any other treatment given?" />
            {evento.other_treatment_yn === 'Yes' && (
              <textarea 
                style={{ ...styles.detailInput, border: '1px solid #ef4444', backgroundColor: '#fff8f8' }} 
                value={evento.other_treatment_details || ''} 
                placeholder="Provide details (Steroids, Antihistamines, etc)..." 
                onChange={e => handleEvento('other_treatment_details', e.target.value)} 
              />
            )}
            <PreguntaTratamientoLocal id="ambulance" label="Was an ambulance called?" />
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
            padding: '20px', 
            borderRadius: '15px', 
            fontSize: '1.1rem',
            backgroundColor: errorFecha ? '#cbd5e1' : '#ef4444', 
            boxShadow: errorFecha ? 'none' : '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
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