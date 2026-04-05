import React from 'react';
import { HeartPulse, LogOut, Home, BookOpen, HelpCircle } from 'lucide-react';
import { styles } from '../AppStyles.js';

const Navbar = ({ tabActiva, setTabActiva, setUsuarioLogueado }) => {
  return (
    <header style={styles.headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <HeartPulse size={30} color="#1e293b" />
        <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0, fontWeight: '800' }}>FASS System</h1>
      </div>

      {/* NAVEGACIÓN POR PESTAÑAS */}
      <nav style={{ 
        display: 'flex', 
        gap: '5px', 
        backgroundColor: '#f8fafc', 
        padding: '5px', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0' 
      }}>
        <button 
          onClick={() => setTabActiva('app')} 
          style={tabActiva === 'app' ? styles.tabActive : styles.tabInactive}
        >
          <Home size={16} color="currentColor" /> Aplicación
        </button>
        <button 
          onClick={() => setTabActiva('puntuacion')} 
          style={tabActiva === 'puntuacion' ? styles.tabActive : styles.tabInactive}
        >
          <BookOpen size={16} color="currentColor" /> Escala nFASS
        </button>
        <button 
          onClick={() => setTabActiva('about')} 
          style={tabActiva === 'about' ? styles.tabActive : styles.tabInactive}
        >
          <HelpCircle size={16} color="currentColor" /> Ayuda
        </button>
      </nav>

      <button 
        onClick={() => setUsuarioLogueado(null)} 
        style={styles.logoutBtn}
      >
        <LogOut size={18} /> Salir
      </button>
    </header>
  );
};

export default Navbar;