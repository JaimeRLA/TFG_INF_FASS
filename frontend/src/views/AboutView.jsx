import React from 'react';
import { HelpCircle, Zap, ShieldCheck, Database, Info } from 'lucide-react';
import { styles } from '../AppStyles.js';

const AboutView = ({ setTabActiva }) => {
  return (
    <div style={{...styles.infoCard}}>
      <button onClick={() => setTabActiva('app')} style={styles.closeBtn}>×</button>
      
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Documentación</p>
        <h2 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
          <HelpCircle size={20} color="#1d4ed8" /> Manual Operativo del Sistema
        </h2>
        <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.9rem', margin: '6px 0 0 0' }}>Guía técnica para la gestión de evaluaciones de reacciones alérgicas.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap color="#1d4ed8" size={18} />
            <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>Flujo de Trabajo</h4>
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '0.875rem', color: '#475569', lineHeight: '2', margin: 0 }}>
            <li><strong>Paciente:</strong> Identificación por NHC.</li>
            <li><strong>Antecedentes:</strong> Factores de riesgo previos.</li>
            <li><strong>Event Record:</strong> Detalles de la reacción.</li>
            <li><strong>Calculadora:</strong> Selección de síntomas.</li>
          </ul>
        </div>

        <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldCheck color="#15803d" size={18} />
            <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>Seguridad RGPD</h4>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            El NHC real es seudonimizado localmente mediante <strong>SHA-256</strong>. El servidor nunca recibe datos personales identificables.
          </p>
        </div>

        <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Database color="#475569" size={18} />
            <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>Investigación</h4>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            El sistema permite exportar el historial en formato CSV para análisis estadísticos o reportes PDF individuales.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Info size={18} color="#1d4ed8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', color: '#1e3a8a' }}>Asistencia Clínica:</strong>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
            Dispone de un <strong>Asistente Clínico Inteligente</strong> en la esquina inferior derecha para resolver dudas sobre síntomas o dosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutView;