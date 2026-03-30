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
      padding: '30px 20px', 
      borderRadius: '24px', 
      border: `2px solid ${config.border}`, 
      textAlign: 'center', 
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {/* Etiqueta Superior */}
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px',
        backgroundColor: '#fff', 
        padding: '5px 12px', 
        borderRadius: '20px', 
        fontSize: '0.7rem', 
        fontWeight: '800', 
        color: config.text,
        border: `1px solid ${config.border}`,
        marginBottom: '15px'
      }}>
        {config.icon} {config.label}
      </div>

      <p style={{ textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.1em', color: config.text, opacity: 0.7, fontSize: '0.65rem', margin: 0 }}>
        Clasificación oFASS
      </p>
      
      {/* GRADO GIGANTE */}
      <h2 style={{ 
        fontSize: '7rem', 
        margin: '5px 0', 
        fontWeight: '900', 
        lineHeight: 1, 
        color: '#0f172a',
        letterSpacing: '-3px'
      }}>
        {grado}
      </h2>
      
      <p style={{ 
        fontSize: '1.2rem', 
        fontWeight: '800', 
        marginBottom: '20px', 
        color: config.text,
        lineHeight: 1.2
      }}>
        {resultado.ofass_category || 'Categoría no definida'}
      </p>
      
      {/* Índice nFASS */}
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '12px', 
        borderRadius: '16px', 
        border: `1px solid #e2e8f0`, 
        marginBottom: '20px'
      }}>
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>
           ÍNDICE NFASS
        </div>
        <strong style={{ fontSize: '2rem', color: '#1e293b', fontWeight: '900' }}>
          {resultado.nfass || '0.0'}
        </strong>
      </div>

      {/* Evidencia Científica */}
      <div style={{ 
        textAlign: 'left', 
        backgroundColor: 'rgba(255,255,255,0.6)', 
        padding: '15px', 
        borderRadius: '15px', 
        fontSize: '0.75rem', 
        color: '#334155' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#2563eb', fontWeight: '800' }}>
          <ShieldCheck size={14} /> VALIDACIÓN CIENTÍFICA
        </div>
        <ul style={{ paddingLeft: '15px', margin: 0, lineHeight: 1.4 }}>
          <li>Correlación EuroPrevall: <strong>p {'<'} 0.001</strong></li>
          <li>{grado >= 4 ? "Monitorización hemodinámica necesaria." : "Seguimiento clínico estándar."}</li>
        </ul>
      </div>

      {/* Alerta Roja Crítica */}
      {grado >= 4 && (
        <div style={{ 
          marginTop: '15px', 
          padding: '12px', 
          backgroundColor: '#be123c', 
          color: '#fff', 
          borderRadius: '15px', 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center', 
          textAlign: 'left'
        }}>
          <AlertTriangle size={24} />
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600' }}>
            Requiere intervención inmediata.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultadoCard;