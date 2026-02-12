import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const ResultadoCard = ({ resultado }) => {
  if (!resultado) return null;

  const esGrave = resultado.risk_level === 'High';

  return (
    <div style={{ 
      backgroundColor: esGrave ? '#fff1f2' : '#f0fdf4', 
      padding: '40px 25px', 
      borderRadius: '24px', 
      border: `3px solid ${esGrave ? '#fecdd3' : '#bbf7d0'}`, 
      textAlign: 'center', 
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' 
    }}>
      <p style={{ textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em', color: esGrave ? '#be123c' : '#16a34a', fontSize: '0.8rem', marginBottom: '10px' }}>Sistema oFASS-5</p>
      <h2 style={{ fontSize: '7rem', margin: '10px 0', fontWeight: '900', lineHeight: 1, color: '#0f172a' }}>{resultado.ofass_grade}</h2>
      <p style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '20px', color: esGrave ? '#be123c' : '#166534' }}>{resultado.ofass_category}</p>
      
      <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '16px', border: '1px solid #fff', marginBottom: '20px' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>Índice nFASS:</p>
        <strong style={{ fontSize: '2.2rem', color: '#1e293b' }}>{resultado.nfass}</strong>
      </div>

      <div style={{ textAlign: 'left', backgroundColor: '#fff', padding: '15px', borderRadius: '12px', fontSize: '0.85rem', color: '#334155', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2563eb', fontWeight: '700' }}>
          <ShieldCheck size={16} /> Validación EuroPrevall
        </div>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '5px' }}>
            {resultado.ofass_grade >= 4 
              ? "Riesgo crítico: Alta probabilidad de requerir Adrenalina (OR > 25.7)." 
              : "Probabilidad moderada/baja de intervención con Adrenalina."}
          </li>
          <li>Precisión del modelo (ROC-AUC): 0.88 para casos severos.</li>
          {resultado.ofass_grade === 5 && (
            <li style={{ marginTop: '5px' }}>Riesgo CMT: 37.4% requirió tratamiento crítico.</li>
          )}
        </ul>
      </div>

      {esGrave && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#be123c', color: '#fff', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left' }}>
          <AlertTriangle size={32} />
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', lineHeight: 1.3 }}>
            <strong>URGENCIA:</strong> 58.1% de pacientes Grado 5 requieren urgencias.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultadoCard;