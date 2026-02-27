import React from 'react';
import { Activity } from 'lucide-react';
import { styles } from '../AppStyles.js';
import { SECCIONES_SINTOMAS } from '../data/sintomas';
import ResultadoCard from '../components/ResultadoCard';

const CalculadoraView = ({ paciente, handleSelectChange, enviarEvaluacion, resultado, reiniciarApp, setView }) => (
  <main style={styles.calculatorLayout}>
    <section style={{ flex: '1', minWidth: '0' }}>
      <button onClick={() => setView('event_record')} style={styles.backBtn}>← Volver a Event Record</button>
      <div style={styles.cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ ...styles.cardTitle, margin: 0 }}><Activity color="#2563eb" /> Evaluación de la Reacción</h3>
          <span style={styles.pacienteBadgeStyle}>NHC: {paciente.id}</span>
        </div>
        {SECCIONES_SINTOMAS.map(sec => (
          <div key={sec.titulo} style={{ marginBottom: '25px' }}>
            <h4 style={styles.secHeader}>{sec.titulo}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {sec.grupos.map(grupo => (
                <div key={grupo.id_base}>
                  <label style={styles.labelStyle}>{grupo.label}</label>
                  <select style={styles.selectStyle} onChange={(e) => handleSelectChange(grupo.id_base, e.target.value)}>
                    <option value="">-- No --</option>
                    {grupo.options.map(opt => <option key={opt.id} value={opt.id}>{opt.text}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={enviarEvaluacion} style={styles.calcBtn}>Calcular Gravedad nFASS</button>
      </div>
    </section>
    <aside style={styles.asideStyle}>
      {resultado ? <ResultadoCard resultado={resultado} /> : <div style={styles.emptyCard}>Esperando evaluación...</div>}
      <button onClick={reiniciarApp} style={styles.newEvalBtn}>Finalizar y Salir</button>
    </aside>
  </main>
);

export default CalculadoraView;