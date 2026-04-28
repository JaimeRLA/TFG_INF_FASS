import React from 'react';
import { ShieldCheck, AlertTriangle, Activity, CheckCircle, AlertCircle } from 'lucide-react';

const ResultadoCard = ({ resultado }) => {
  // 1. Seguridad: Si no hay resultado o datos clave, no renderizamos nada (evita el gris)
  if (!resultado || resultado.ofass_grade === undefined) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
        Cargando resultados...
      </div>
    );
  }

  // 2. Normalizamos el grado a número
  const grado = parseInt(resultado.ofass_grade) || 0;
  
  // 3. Configuración de colores y etiquetas
  const getConfig = (g) => {
    if (g >= 4) return { 
      bg: '#fff1f2', border: '#fecdd3', text: '#be123c', 
      label: 'CRÍTICO', icon: <AlertTriangle size={20} /> 
    };
    if (g === 3) return { 
      bg: '#fffbeb', border: '#fef3c7', text: '#b45309', 
      label: 'MODERADO', icon: <AlertCircle size={20} /> 
    };
    return { 
      bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', 
      label: 'LEVE', icon: <CheckCircle size={20} /> 
    };
  };

  const config = getConfig(grado);

  return (
    <div style={{ 
      backgroundColor: config.bg, 
      padding: '24px',
      borderRadius: '8px',
      border: `1px solid ${config.border}`, 
      textAlign: 'center', 
      position: 'relative',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Etiqueta Superior */}
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px',
        backgroundColor: '#fff', 
        padding: '4px 12px', 
        borderRadius: '4px', 
        fontSize: '0.7rem', 
        fontWeight: '700', 
        color: config.text,
        border: `1px solid ${config.border}`,
        marginBottom: '16px',
        letterSpacing: '0.05em',
      }}>
        {config.icon} {config.label}
      </div>

      <p style={{ textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.1em', color: config.text, opacity: 0.7, fontSize: '0.65rem', margin: 0 }}>
        Clasificación oFASS-5
      </p>
      
      {/* GRADO */}
      <h2 style={{ 
        fontSize: '7rem', 
        margin: '0', 
        fontWeight: '800', 
        lineHeight: 0.9, 
        color: '#0f172a',
        letterSpacing: '-4px'
      }}>
        {grado}
      </h2>
      
      <p style={{ 
        fontSize: '1.1rem', 
        fontWeight: '700', 
        marginTop: '8px',
        marginBottom: '20px', 
        color: config.text,
        lineHeight: 1.2
      }}>
        {resultado.ofass_category || 'Categoría no definida'}
      </p>
      
      {/* Índice nFASS */}
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '14px', 
        borderRadius: '6px', 
        border: `1px solid #e2e8f0`, 
        marginBottom: '16px',
      }}>
        <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
           Índice nFASS (Score Clínico)
        </div>
        <strong style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800' }}>
          {resultado.nfass || '0.0'}
        </strong>
      </div>

      {/* Evidencia Científica */}
      <div style={{ 
        textAlign: 'left', 
        backgroundColor: 'rgba(255,255,255,0.8)', 
        padding: '14px', 
        borderRadius: '6px', 
        fontSize: '0.775rem', 
        color: '#334155',
        border: '1px solid rgba(255,255,255,0.9)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#1d4ed8', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <ShieldCheck size={13} /> Validación Científica (EuroPrevall)
        </div>
        <ul style={{ paddingLeft: '16px', margin: 0, lineHeight: 1.6, listStyleType: 'disc' }}>
          <li>Correlación clínica significativa: <strong>p {'<'} 0.001</strong></li>
          <li>{grado >= 4 ? "Alta probabilidad de requerir Adrenalina." : "Riesgo bajo/moderado de intervención crítica."}</li>
          {grado >= 4 && <li style={{fontWeight: '600', color: config.text, marginTop: '4px'}}>Requiere monitorización hemodinámica estrecha.</li>}
        </ul>
      </div>

      {/* Alerta Crítica */}
      {grado >= 4 && (
        <div style={{ 
          marginTop: '14px', 
          padding: '12px 14px', 
          backgroundColor: '#b91c1c', 
          color: '#fff', 
          borderRadius: '6px', 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'flex-start', 
          textAlign: 'left',
        }}>
          <AlertTriangle size={18} strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', lineHeight: 1.4 }}>
            <strong>PROTOCOLO DE URGENCIA:</strong> Compromiso sistémico detectado. Intervención médica inmediata necesaria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultadoCard;