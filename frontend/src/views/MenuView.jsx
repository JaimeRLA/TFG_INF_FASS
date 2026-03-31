import React, { useState } from 'react';
import { UserPlus, Search, FolderClock, ArrowRight } from 'lucide-react';
import { styles } from '../AppStyles.js';

const MenuView = ({ setView, cargarPacientesExistentes, cargarHistorial }) => {
  // Estado local para efectos de hover si no usas CSS externo
  const [hoveredCard, setHoveredCard] = useState(null);

  const menuOptions = [
    {
      id: 'registro',
      title: 'Nuevo Registro',
      desc: 'Inscribir un paciente por primera vez en el sistema y definir sus antecedentes clínicos.',
      icon: <UserPlus size={32} />,
      color: '#2563eb',
      bgColor: '#eff6ff',
      action: () => setView('registro_paciente'),
      btnLabel: 'Empezar Registro'
    },
    {
      id: 'evaluacion',
      title: 'Nueva Evaluación',
      desc: 'Registrar una nueva reacción alérgica para un paciente que ya cuenta con NHC en el sistema.',
      icon: <Search size={32} />,
      color: '#16a34a',
      bgColor: '#f0fdf4',
      action: cargarPacientesExistentes,
      btnLabel: 'Buscar Paciente'
    },
    {
      id: 'historial',
      title: 'Historial Clínico',
      desc: 'Acceder a la base de datos de reportes anteriores para consulta, edición o exportación de datos.',
      icon: <FolderClock size={32} />,
      color: '#4f46e5',
      bgColor: '#eef2ff',
      action: cargarHistorial,
      btnLabel: 'Ver Registros'
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      {/* CABECERA DE BIENVENIDA */}
      <div style={{ marginBottom: '50px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '850', color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.5px' }}>
          Gestión de Anafilaxia
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>
          Seleccione una acción para comenzar el protocolo clínico.
        </p>
      </div>

      {/* GRID DE OPCIONES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {menuOptions.map((opt) => (
          <div 
            key={opt.id}
            onMouseEnter={() => setHoveredCard(opt.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              ...styles.optionCard,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '40px 30px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: hoveredCard === opt.id ? `2px solid ${opt.color}` : '2px solid #f1f5f9',
              boxShadow: hoveredCard === opt.id ? '0 20px 25px -5px rgba(0, 0, 0, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
              transform: hoveredCard === opt.id ? 'translateY(-5px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default'
            }}
          >
            <div>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: opt.bgColor, 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: opt.color,
                marginBottom: '24px'
              }}>
                {opt.icon}
              </div>
              
              <h2 style={{ 
                fontSize: '1.4rem', 
                fontWeight: '800', 
                color: '#1e293b', 
                marginBottom: '12px' 
              }}>
                {opt.title}
              </h2>
              
              <p style={{ 
                color: '#64748b', 
                lineHeight: '1.6', 
                fontSize: '0.95rem', 
                marginBottom: '30px' 
              }}>
                {opt.desc}
              </p>
            </div>

            <button 
              onClick={opt.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                backgroundColor: opt.color,
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'filter 0.2s',
                filter: hoveredCard === opt.id ? 'brightness(1.1)' : 'none'
              }}
            >
              {opt.btnLabel}
              <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* PIE DE PÁGINA PROFESIONAL */}
      <div style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Plataforma de Soporte de Decisiones Clínicas • nFASS v2.0
        </p>
      </div>
    </div>
  );
};

export default MenuView;