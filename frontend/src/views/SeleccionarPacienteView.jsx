import React from 'react';
import { Search, User, Calendar, Venus, Mars } from 'lucide-react';
import { styles } from '../AppStyles.js';

const SeleccionarPacienteView = ({ pacientesFiltrados, setFiltroBusqueda, seleccionarPacienteExistente, setView }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => setView('perfil')} style={styles.backBtn}>← Volver</button>
      
      <div style={styles.cardStyle}>
        <h3 style={styles.cardTitle}><Search color="#2563eb" /> Buscar Paciente</h3>
        
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
          <input
            type="text"
            placeholder="Escriba el Hash o ID del paciente..."
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            style={{ ...styles.inputStyle, paddingLeft: '40px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pacientesFiltrados.map((p, index) => (
            <div 
              key={index} 
              onClick={() => seleccionarPacienteExistente(p)}
              style={{
                ...styles.itemPacienteStyle,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                padding: '15px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="#64748b" />
                  <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.95rem' }}>
                    ID: {p.id ? p.id.substring(0, 12) : 'Sin ID'}...
                  </span>
                  <span style={{ fontSize: '0.7rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#64748b' }}>
                    PSEUDÓNIMO
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {p.genero === 'M' ? <Mars size={16} color="#3b82f6" /> : <Venus size={16} color="#ec4899" />}
                  <span style={{ fontWeight: '600', color: '#475569' }}>{p.genero}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.85rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} />
                  <span>Rango Edad: <strong>{p.rango_edad}</strong></span>
                </div>
              </div>
            </div>
          ))}
          
          {pacientesFiltrados.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No se encontraron pacientes coincidentes.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeleccionarPacienteView;