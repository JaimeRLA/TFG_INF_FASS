import React, { useState } from 'react';
import { User, Users, ClipboardList, ArrowRight } from 'lucide-react';
import { styles } from '../AppStyles.js';

const font = '"Inter", system-ui, -apple-system, sans-serif';

const MenuView = ({ setView, iniciarNuevoRegistro, cargarPacientesExistentes, cargarHistorial, usuarioLogueado }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const menuOptions = [
    {
      id: 'registro',
      title: 'Nuevo Registro',
      desc: 'Inscribir un paciente por primera vez y definir sus antecedentes clínicos.',
      icon: <User size={22} color="#1d4ed8" />,
      action: iniciarNuevoRegistro,
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