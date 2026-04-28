import React from 'react';
import { BookOpen, Zap, Activity } from 'lucide-react';
import { styles } from '../AppStyles.js';

const PuntuacionView = ({ setTabActiva }) => {
  return (
    <div style={{...styles.infoCard}}>
      <button onClick={() => setTabActiva('app')} style={styles.closeBtn}>×</button>
      
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Referencia Clínica</p>
        <h2 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
          <BookOpen size={20} color="#1d4ed8" /> Escalas nFASS y oFASS
        </h2>
        <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.9rem', margin: '6px 0 0 0' }}>
          Soporte a la decisión clínica basado en algoritmos de ponderación logarítmica.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <Zap size={16} color="#1d4ed8" /> nFASS (Numerical Score)
          </h3>
          <p style={{ lineHeight: '1.65', color: '#334155', fontSize: '0.875rem', margin: 0 }}>
            A diferencia de las escalas tradicionales, el <strong>nFASS</strong> es una métrica continua que calcula la gravedad exacta mediante la fórmula:
            <code style={{ display: 'block', padding: '12px', background: '#f8fafc', borderRadius: '6px', margin: '12px 0', border: '1px solid #e2e8f0', color: '#1d4ed8', fontWeight: 'bold', fontSize: '0.875rem' }}>
              nFASS = log2(Σ 2^ε * (1 + λ)) + 2
            </code>
            Donde <strong>ε (épsilon)</strong> representa el peso de los síntomas y <strong>λ (lambda)</strong> el impacto de los cofactores.
          </p>
        </div>
        
        <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <Activity size={16} color="#15803d" /> oFASS (Ordinal Grade)
          </h3>
          <p style={{ lineHeight: '1.65', color: '#334155', fontSize: '0.875rem', margin: 0 }}>
            Es la categorización clínica en 5 grados de gravedad. Los grados <strong>4 y 5</strong> indican anafilaxia grave con riesgo vital inmediato y una alta correlación con el uso de adrenalina.
          </p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px'}}>
        <div style={{padding: '16px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4'}}>
          <h4 style={{margin: '0 0 8px 0', color: '#15803d', fontWeight: '700', fontSize: '0.875rem'}}>LEVE (Grados 1-2)</h4>
          <p style={{margin: 0, fontSize: '0.825rem', color: '#166534', lineHeight: '1.5'}}>Afectación cutánea o gastrointestinal moderada. Riesgo bajo de compromiso sistémico.</p>
        </div>
        <div style={{padding: '16px', borderRadius: '6px', border: '1px solid #fde68a', background: '#fffbeb'}}>
          <h4 style={{margin: '0 0 8px 0', color: '#92400e', fontWeight: '700', fontSize: '0.875rem'}}>MODERADO (Grado 3)</h4>
          <p style={{margin: 0, fontSize: '0.825rem', color: '#78350f', lineHeight: '1.5'}}>Compromiso respiratorio o cardiovascular leve. Requiere monitorización clínica.</p>
        </div>
        <div style={{padding: '16px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2'}}>
          <h4 style={{margin: '0 0 8px 0', color: '#b91c1c', fontWeight: '700', fontSize: '0.875rem'}}>GRAVE (Grados 4-5)</h4>
          <p style={{margin: 0, fontSize: '0.825rem', color: '#991b1b', lineHeight: '1.5'}}>Fallo multiorgánico o colapso. <strong>Administración de adrenalina prioritaria.</strong></p>
        </div>
      </div>
    </div>
  );
};

export default PuntuacionView;