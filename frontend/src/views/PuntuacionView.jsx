import React from 'react';
import { BookOpen, Zap, Activity } from 'lucide-react';
import { styles } from '../AppStyles.js';

const PuntuacionView = ({ setTabActiva }) => {
  return (
    <div style={{...styles.infoCard, backgroundColor: '#ffffff', color: '#1e293b'}}>
      <button onClick={() => setTabActiva('app')} style={styles.closeBtn}>×</button>
      
      <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '25px' }}>
        <h2 style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <BookOpen size={28} /> Comprensión de las Escalas nFASS y oFASS
        </h2>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1.1rem' }}>
          Soporte a la decisión clínica basado en algoritmos de ponderación logarítmica.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="#2563eb" /> nFASS (Numerical Score)
          </h3>
          <p style={{ lineHeight: '1.6', color: '#334155' }}>
            A diferencia de las escalas tradicionales, el <strong>nFASS</strong> es una métrica continua que calcula la gravedad exacta mediante la fórmula:
            <code style={{ display: 'block', padding: '15px', background: '#f8fafc', borderRadius: '10px', margin: '15px 0', border: '1px solid #e2e8f0', color: '#2563eb', fontWeight: 'bold' }}>
              nFASS = log2(Σ 2^ε * (1 + λ)) + 2
            </code>
            Donde <strong>ε (épsilon)</strong> representa el peso de los síntomas y <strong>λ (lambda)</strong> el impacto de los cofactores.
          </p>
        </div>
        
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#16a34a" /> oFASS (Ordinal Grade)
          </h3>
          <p style={{ lineHeight: '1.6', color: '#334155' }}>
            Es la categorización clínica en 5 grados de gravedad. Los grados <strong>4 y 5</strong> indican anafilaxia grave con riesgo vital inmediato y una alta correlación con el uso de adrenalina.
          </p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px'}}>
        <div style={{padding: '20px', borderRadius: '15px', border: '1px solid #bbf7d0', background: '#f0fdf4'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#16a34a', fontWeight: '800'}}>LEVE (Grados 1-2)</h4>
          <p style={{margin: 0, fontSize: '0.9rem', color: '#166534'}}>Afectación cutánea o gastrointestinal moderada. Riesgo bajo de compromiso sistémico.</p>
        </div>
        <div style={{padding: '20px', borderRadius: '15px', border: '1px solid #fed7aa', background: '#fff7ed'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#ea580c', fontWeight: '800'}}>MODERADO (Grado 3)</h4>
          <p style={{margin: 0, fontSize: '0.9rem', color: '#9a3412'}}>Compromiso respiratorio o cardiovascular leve. Requiere monitorización clínica.</p>
        </div>
        <div style={{padding: '20px', borderRadius: '15px', border: '1px solid #fecdd3', background: '#fff1f2'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#dc2626', fontWeight: '800'}}>GRAVE (Grados 4-5)</h4>
          <p style={{margin: 0, fontSize: '0.9rem', color: '#991b1b'}}>Fallo multiorgánico o colapso. <strong>Administración de adrenalina prioritaria.</strong></p>
        </div>
      </div>
    </div>
  );
};

export default PuntuacionView;