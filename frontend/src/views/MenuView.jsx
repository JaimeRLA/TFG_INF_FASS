import React, { useState } from 'react';
import { User, Users, ClipboardList, ArrowRight } from 'lucide-react';
import { styles } from '../AppStyles.js';

const font = '"Inter", system-ui, -apple-system, sans-serif';

const MenuView = ({ setView, cargarPacientesExistentes, cargarHistorial, usuarioLogueado }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const menuOptions = [
    {
      id: 'registro',
      title: 'Nuevo Registro',
      desc: 'Inscribir un paciente por primera vez y definir sus antecedentes clínicos.',
      icon: <User size={22} color="#1d4ed8" />,
      action: () => setView('registro_paciente'),
      btnLabel: 'Empezar',
    },
    {
      id: 'evaluacion',
      title: 'Nueva Evaluación',
      desc: 'Registrar un nuevo evento para un paciente que ya cuenta con NHC.',
      icon: <Users size={22} color="#1d4ed8" />,
      action: cargarPacientesExistentes,
      btnLabel: 'Buscar NHC',
    },
    {
      id: 'historial',
      title: 'Historial Completo',
      desc: 'Ver reportes anteriores, modificarlos o descargar los datos clínicos.',
      icon: <ClipboardList size={22} color="#1d4ed8" />,
      action: cargarHistorial,
      btnLabel: 'Ver Registros',
    },
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '32px auto', padding: '0 16px', fontFamily: font }}>

      {/* BIENVENIDA */}
      <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
          Panel Principal
        </p>
        <h1 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '700', margin: '0 0 4px 0' }}>
          Bienvenido/a, <span style={{ color: '#1d4ed8' }}>{usuarioLogueado}</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Seleccione la acción que desea realizar.
        </p>
      </div>

      {/* GRID DE ACCIONES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {menuOptions.map((opt) => {
          const hovered = hoveredCard === opt.id;
          return (
            <div
              key={opt.id}
              onMouseEnter={() => setHoveredCard(opt.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: hovered ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                cursor: 'default',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: hovered ? '0 4px 12px rgba(29, 78, 216, 0.08)' : 'none',
              }}
            >
              {/* Icono */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                {opt.icon}
              </div>

              <h2 style={{
                fontSize: '1rem',
                color: '#0f172a',
                fontWeight: '700',
                margin: '0 0 8px 0',
                fontFamily: font,
              }}>
                {opt.title}
              </h2>

              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                fontSize: '0.875rem',
                margin: '0 0 24px 0',
                flexGrow: 1,
              }}>
                {opt.desc}
              </p>

              <button
                onClick={opt.action}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontFamily: font,
                  transition: 'background-color 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#0f172a'}
              >
                {opt.btnLabel} <ArrowRight size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {/* PIE */}
      <div style={{ marginTop: '48px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
          Plataforma de Soporte de Decisiones Clínicas · nFASS v2.0
        </p>
      </div>
    </div>
  );
};

export default MenuView;

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
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 2px 0', fontWeight: '500' }}>
          Bienvenido/a,{' '}
          <span style={{ color: '#1e293b', fontWeight: '700' }}>{usuarioLogueado}</span>
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
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