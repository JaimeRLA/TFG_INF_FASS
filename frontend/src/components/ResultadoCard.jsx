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
      padding: '40px 30px', // Aumentado padding horizontal para dar más aire al ser más ancha
      borderRadius: '28px', // Bordes un poco más suaves
      border: `2px solid ${config.border}`, 
      textAlign: 'center', 
      boxShadow: '0 15px 30px -5px rgba(0,0,0,0.12)',
      position: 'relative',
      width: '100%', // Asegura que ocupe todo el ancho del aside padre
      boxSizing: 'border-box' // Importante para que el padding no sume al ancho
    }}>
      {/* Etiqueta Superior */}
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px',
        backgroundColor: '#fff', 
        padding: '6px 16px', 
        borderRadius: '20px', 
        fontSize: '0.75rem', 
        fontWeight: '800', 
        color: config.text,
        border: `1px solid ${config.border}`,
        marginBottom: '20px', // Más espacio abajo
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        {config.icon} {config.label}
      </div>

      <p style={{ textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.15em', color: config.text, opacity: 0.7, fontSize: '0.7rem', margin: 0 }}>
        Clasificación oFASS-5
      </p>
      
      {/* GRADO GIGANTE - Aumentado un poco más para aprovechar el ancho */}
      <h2 style={{ 
        fontSize: '8.5rem', 
        margin: '0', 
        fontWeight: '900', 
        lineHeight: 0.9, 
        color: '#0f172a',
        letterSpacing: '-5px'
      }}>
        {grado}
      </h2>
      
      <p style={{ 
        fontSize: '1.4rem', 
        fontWeight: '800', 
        marginTop: '10px',
        marginBottom: '30px', 
        color: config.text,
        lineHeight: 1.2
      }}>
        {resultado.ofass_category || 'Categoría no definida'}
      </p>
      
      {/* Índice nFASS - Ensanchado y con más presencia */}
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '20px', 
        borderRadius: '20px', 
        border: `1px solid #e2e8f0`, 
        marginBottom: '25px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
      }}>
        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.05em' }}>
           ÍNDICE NFASS (SCORE CLINICO)
        </div>
        <strong style={{ fontSize: '2.8rem', color: '#1e293b', fontWeight: '900' }}>
          {resultado.nfass || '0.0'}
        </strong>
      </div>

      {/* Evidencia Científica */}
      <div style={{ 
        textAlign: 'left', 
        backgroundColor: 'rgba(255,255,255,0.7)', 
        padding: '20px', 
        borderRadius: '18px', 
        fontSize: '0.8rem', 
        color: '#334155',
        border: '1px solid rgba(255,255,255,0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#2563eb', fontWeight: '800' }}>
          <ShieldCheck size={16} /> VALIDACIÓN CIENTÍFICA (EuroPrevall)
        </div>
        <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: 1.5, listStyleType: 'circle' }}>
          <li>Correlación clínica significativa: <strong>p {'<'} 0.001</strong></li>
          <li>{grado >= 4 ? "Alta probabilidad de requerir Adrenalina." : "Riesgo bajo/moderado de intervención crítica."}</li>
          {grado >= 4 && <li style={{fontWeight: '600', color: config.text, marginTop: '4px'}}>Requiere monitorización hemodinámica estrecha.</li>}
        </ul>
      </div>

      {/* Alerta Roja Crítica - Estilo mejorado */}
      {grado >= 4 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '18px', 
          backgroundColor: '#be123c', 
          color: '#fff', 
          borderRadius: '20px', 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center', 
          textAlign: 'left',
          boxShadow: '0 10px 15px -3px rgba(190, 18, 60, 0.3)'
        }}>
          <AlertTriangle size={30} strokeWidth={2} />
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', lineHeight: 1.4 }}>
            <strong>PROTOCOLO DE URGENCIA ACTIVADO:</strong> Compromiso sistémico detectado. Intervención médica inmediata necesaria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultadoCard;