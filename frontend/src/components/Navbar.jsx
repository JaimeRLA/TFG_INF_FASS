import React from 'react';
import { HeartPulse, LogOut, Home, BookOpen, HelpCircle, BarChart3 } from 'lucide-react';
import { styles } from '../AppStyles.js';

const Navbar = ({ tabActiva, setTabActiva, setUsuarioLogueado }) => {
  return (
    <header style={styles.headerStyle}>
      {/* LOGOTIPO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <HeartPulse size={20} color="#93c5fd" />
        <span style={{
          fontSize: '1rem',
          color: '#f1f5f9',
          fontWeight: '700',
          letterSpacing: '0.04em',
          fontFamily: '"Inter", system-ui, sans-serif',
        }}>
          FASS <span style={{ color: '#93c5fd' }}>System</span>
        </span>
      </div>

      {/* NAVEGACIÓN POR PESTAÑAS — underline style */}
      <nav style={{
        display: 'flex',
        height: '100%',
        alignItems: 'stretch',
        gap: '0',
      }}>
        {[
          { key: 'app',        icon: <Home size={15} />,      label: 'Aplicación' },
          { key: 'dashboard',  icon: <BarChart3 size={15} />, label: 'Dashboard'  },
          { key: 'puntuacion', icon: <BookOpen size={15} />,  label: 'Escala nFASS' },
          { key: 'about',      icon: <HelpCircle size={15} />,label: 'Ayuda'      },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTabActiva(key)}
            style={{
              ...( tabActiva === key ? styles.tabActive : styles.tabInactive ),
              height: '100%',
              paddingLeft: '16px',
              paddingRight: '16px',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </nav>

      {/* SALIR */}
      <button
        onClick={() => setUsuarioLogueado(null)}
        style={styles.logoutBtn}
      >
        <LogOut size={15} /> Salir
      </button>
    </header>
  );
};

export default Navbar;
