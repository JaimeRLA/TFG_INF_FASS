import React, { useState } from 'react';
import { User, Users, ClipboardList, ArrowRight } from 'lucide-react';
import { styles } from '../AppStyles.js';

const MenuView = ({ setView, cargarPacientesExistentes, cargarHistorial, usuarioLogueado }) => {
  // Estado para el efecto visual al pasar el ratón
  const [hoveredCard, setHoveredCard] = useState(null);

  const menuOptions = [
    {
      id: 'registro',
      title: 'Nuevo Registro',
      desc: 'Inscribir un paciente por primera vez y definir sus antecedentes clínicos.',
      icon: <User size={40} />,
      color: '#2563eb', // Azul original
      bgColor: '#eff6ff',
      action: () => setView('registro_paciente'),
      btnLabel: 'Empezar'
    },
    {
      id: 'evaluacion',
      title: 'Nueva Evaluación',
      desc: 'Registrar un nuevo evento para un paciente que ya cuenta con NHC.',
      icon: <Users size={40} />,
      color: '#16a34a', // Verde original
      bgColor: '#f0fdf4',
      action: cargarPacientesExistentes,
      btnLabel: 'Buscar NHC'
    },
    {
      id: 'historial',
      title: 'Historial Completo',
      desc: 'Ver reportes anteriores, modificarlos o descargar los datos clínicos.',
      icon: <ClipboardList size={40} />,
      color: '#ea580c', // Naranja original
      bgColor: '#fff7ed',
      action: cargarHistorial,
      btnLabel: 'Ver Registros'
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>

      {/* BIENVENIDA */}
      <div style={{ marginBottom: '35px' }}>
        <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
          Bienvenido, <span style={{ color: '#2563eb' }}>{usuarioLogueado}</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          ¿Qué desea hacer hoy?
        </p>
      </div>
      
      {/* GRID DE OPCIONES (Sin título superior) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '30px'
      }}>
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
              borderRadius: '28px',
              border: hoveredCard === opt.id ? `2px solid ${opt.color}` : '2px solid #f1f5f9',
              boxShadow: hoveredCard === opt.id 
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.08)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
              transform: hoveredCard === opt.id ? 'translateY(-8px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default'
            }}
          >
            <div>
              <div style={{ 
                ...styles.avatarStyle,
                width: '70px',
                height: '70px',
                backgroundColor: opt.bgColor,
                color: opt.color,
                marginBottom: '25px',
                borderRadius: '18px'
              }}>
                {opt.icon}
              </div>
              
              <h2 style={{ 
                ...styles.cardHeading,
                fontSize: '1.5rem',
                color: '#0f172a',
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
                ...styles.startBtn,
                backgroundColor: opt.color,
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                border: 'none',
                color: '#fff',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
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