import React from 'react';
import { User, Users, ClipboardList } from 'lucide-react';
import { styles } from '../AppStyles.js';

const MenuView = ({ setView, cargarPacientesExistentes, cargarHistorial }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginTop: '60px' }}>
    <div style={styles.optionCard}>
      <div style={styles.avatarStyle}><User size={40} color="#2563eb" /></div>
      <h2 style={styles.cardHeading}>Nuevo Registro</h2>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.9rem' }}>Inscribir un paciente por primera vez y sus antecedentes.</p>
      <button onClick={() => setView('registro_paciente')} style={styles.startBtn}>Empezar</button>
    </div>
    <div style={styles.optionCard}>
      <div style={{ ...styles.avatarStyle, backgroundColor: '#f0fdf4' }}><Users size={40} color="#16a34a" /></div>
      <h2 style={styles.cardHeading}>Nueva Evaluación</h2>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.9rem' }}>Registrar un nuevo evento para un paciente ya existente.</p>
      <button onClick={cargarPacientesExistentes} style={{ ...styles.startBtn, backgroundColor: '#16a34a' }}>Buscar NHC</button>
    </div>
    <div style={styles.optionCard}>
      <div style={{ ...styles.avatarStyle, backgroundColor: '#fff7ed' }}><ClipboardList size={40} color="#ea580c" /></div>
      <h2 style={styles.cardHeading}>Historial Completo</h2>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.9rem' }}>Ver reportes anteriores, modificarlos o descargarlos.</p>
      <button onClick={cargarHistorial} style={{ ...styles.startBtn, backgroundColor: '#ea580c' }}>Ver Registros</button>
    </div>
  </div>
);

export default MenuView;