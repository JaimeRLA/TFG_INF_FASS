import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, ArrowLeft } from 'lucide-react';
import { styles } from '../AppStyles.js';

const SeleccionarPacienteView = ({ listaPacientes, onSeleccionar, setView }) => {
  const [busqueda, setBusqueda] = useState('');
  const [hashBusqueda, setHashBusqueda] = useState('');

  // Efecto para generar el hash de lo que el médico escribe en el buscador
  useEffect(() => {
    const generarHashLocal = async () => {
      if (busqueda.length > 2) {
        // Opción A: Si tienes una función de hash en JS
        // Opción B: Llamada rápida al backend (más seguro para mantener el mismo algoritmo)
        try {
          const res = await fetch(`http://localhost:8000/get_hash/${busqueda}`);
          const data = await res.json();
          setHashBusqueda(data.hash);
        } catch (e) {
          setHashBusqueda('');
        }
      } else {
        setHashBusqueda('');
      }
    };
    generarHashLocal();
  }, [busqueda]);

  // FILTRADO INTELIGENTE
  const pacientesFiltrados = listaPacientes.filter(p => {
    const term = busqueda.toLowerCase();
    return (
      p.nhc_hash.toLowerCase().includes(term) || // Busca por los caracteres del Hash
      p.nhc_hash === hashBusqueda                // Busca por el NHC real convertido
    );
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => setView('perfil')} style={styles.backBtn}>
        ← Cancelar
      </button>

      <div style={styles.cardStyle}>
        <h3 style={styles.cardTitle}>Seleccionar Paciente</h3>
        
        {/* BUSCADOR */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
            size={20} 
          />
          <input
            type="text"
            placeholder="Buscar por NHC real o por Hash..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ ...styles.inputStyle, paddingLeft: '40px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((p) => (
              <div 
                key={p.nhc_hash} 
                onClick={() => onSeleccionar(p)}
                style={{
                  ...styles.inputWrapper,
                  padding: '15px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: '#fff'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ backgroundColor: '#eff6ff', p: '10px', borderRadius: '50%', padding: '8px' }}>
                    <User size={24} color="#3b82f6" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace' }}>
                      ID: {p.nhc_hash}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '10px' }}>
                      <span>{p.genero === 'H' ? 'Varón' : 'Mujer'}</span>
                      <span>•</span>
                      <span>{p.rango_edad} años</span>
                    </div>
                  </div>
                </div>
                <div style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: '500' }}>
                  Seleccionar →
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No se encontraron pacientes que coincidan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeleccionarPacienteView;