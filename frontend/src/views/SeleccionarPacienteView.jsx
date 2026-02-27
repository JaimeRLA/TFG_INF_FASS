import React from 'react';
import { Users, Search, ArrowRight } from 'lucide-react';
import { styles } from '../AppStyles.js';

const SeleccionarPacienteView = ({ pacientesFiltrados, setFiltroBusqueda, seleccionarPacienteExistente, setView }) => (
  <div style={{ maxWidth: '800px', margin: '40px auto' }}>
    <button onClick={() => setView('perfil')} style={styles.backBtn}>← Volver</button>
    <div style={styles.cardStyle}>
      <h3 style={{ ...styles.cardTitle, color: '#000' }}><Users size={22} color="#2563eb" /> Buscar Paciente</h3>
      <div style={styles.searchBar}>
        <Search size={20} color="#94a3b8" />
        <input style={styles.searchInput} placeholder="Escriba el NHC..." onChange={(e) => setFiltroBusqueda(e.target.value)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {pacientesFiltrados.map(p => (
          <div key={p.id} onClick={() => seleccionarPacienteExistente(p)} style={styles.itemPacienteStyle}>
            <strong style={{ color: '#1e293b' }}>NHC: {p.id}</strong>
            <span style={{ color: '#64748b' }}>{p.genero} | Nacimiento: {p.fecha_nacimiento}</span>
            <ArrowRight size={18} color="#2563eb" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SeleccionarPacienteView;