import React from 'react';
import { Activity, ArrowLeft, CheckCircle } from 'lucide-react';
import { styles } from '../AppStyles.js';
import { SECCIONES_SINTOMAS } from '../data/sintomas';
import ResultadoCard from '../components/ResultadoCard';

const CalculadoraView = ({ paciente, handleSelectChange, enviarEvaluacion, resultado, reiniciarApp, setView, esPacienteExistente }) => (
  <main style={styles.calculatorLayout}>
    <section style={{ flex: '1', minWidth: '0' }}>
      {/* Botón de volver coherente con el flujo */}
      <button onClick={() => setView('event_record')} style={styles.backBtn}>
        <ArrowLeft size={18} /> Volver a Event Record
      </button>

      <div style={styles.cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ ...styles.cardTitle, margin: 0 }}>
            <Activity color="#2563eb" /> Evaluación de la Reacción
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={styles.pacienteBadgeStyle}>NHC: {paciente.id}</span>
            {esPacienteExistente && (
              <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase' }}>
                Paciente Registrado
              </span>
            )}
          </div>
        </div>

        {SECCIONES_SINTOMAS.map(sec => (
          <div key={sec.titulo} style={{ marginBottom: '25px' }}>
            <h4 style={styles.secHeader}>{sec.titulo}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {sec.grupos.map(grupo => (
                <div key={grupo.id_base}>
                  <label style={styles.labelStyle}>{grupo.label}</label>
                  <select 
                    style={styles.selectStyle} 
                    onChange={(e) => handleSelectChange(grupo.id_base, e.target.value)}
                  >
                    <option value="">-- No --</option>
                    {grupo.options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.text}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={enviarEvaluacion} 
          style={{ 
            ...styles.calcBtn, 
            backgroundColor: resultado ? '#059669' : '#2563eb',
            transition: 'background-color 0.3s ease'
          }}
        >
          {resultado ? 'Recalcular Gravedad' : 'Calcular Gravedad nFASS'}
        </button>
      </div>
    </section>

    <aside style={styles.asideStyle}>
      {resultado ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <ResultadoCard resultado={resultado} />
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#166534',
            fontSize: '0.85rem'
          }}>
            <CheckCircle size={16} /> Evaluación guardada en el historial.
          </div>
        </div>
      ) : (
        <div style={styles.emptyCard}>Esperando evaluación...</div>
      )}
      
      <button 
        onClick={reiniciarApp} 
        style={{ 
          ...styles.newEvalBtn, 
          marginTop: '10px',
          fontWeight: '700'
        }}
      >
        Finalizar y Salir
      </button>
    </aside>
  </main>
);

export default CalculadoraView;