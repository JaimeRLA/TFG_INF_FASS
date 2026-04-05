import React from 'react';
import { HelpCircle, Zap, ShieldCheck, Database, Info } from 'lucide-react';
import { styles } from '../AppStyles.js';

const AboutView = ({ setTabActiva }) => {
  return (
    <div style={{...styles.infoCard, backgroundColor: '#ffffff', color: '#1e293b'}}>
      <button onClick={() => setTabActiva('app')} style={styles.closeBtn}>×</button>
      
      <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '25px' }}>
        <h2 style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <HelpCircle size={28} /> Manual Operativo del Sistema
        </h2>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1.1rem' }}>Guía técnica para la gestión de evaluaciones de reacciones alérgicas.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Zap color="#2563eb" size={24} />
            <h4 style={{ margin: 0, fontWeight: '800' }}>Flujo de Trabajo</h4>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '0.95rem', color: '#475569', lineHeight: '2' }}>
            <li><strong>Paciente:</strong> Identificación por NHC.</li>
            <li><strong>Antecedentes:</strong> Factores de riesgo previos.</li>
            <li><strong>Event Record:</strong> Detalles de la reacción.</li>
            <li><strong>Calculadora:</strong> Selección de síntomas.</li>
          </ul>
        </div>

        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <ShieldCheck color="#16a34a" size={24} />
            <h4 style={{ margin: 0, fontWeight: '800' }}>Seguridad RGPD</h4>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
            El NHC real es seudonimizado localmente mediante <strong>SHA-256</strong>. El servidor nunca recibe datos personales identificables.
          </p>
        </div>

        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Database color="#ea580c" size={24} />
            <h4 style={{ margin: 0, fontWeight: '800' }}>Investigación</h4>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
            El sistema permite exportar el historial en formato CSV para análisis estadísticos o reportes PDF individuales.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#eff6ff', borderRadius: '15px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
        <Info size={24} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ display: 'block', marginBottom: '5px' }}>Asistencia Clínica:</strong>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
            Dispone de un <strong>Asistente Clínico Inteligente</strong> en la esquina inferior derecha para resolver dudas sobre síntomas o dosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutView;