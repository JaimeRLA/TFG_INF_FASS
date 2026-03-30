import React, { useState } from 'react';
import { Search, User, Calendar, ArrowRight } from 'lucide-react';
import { styles } from '../AppStyles.js';
import axios from 'axios';

const SeleccionarPacienteView = ({ listaPacientes, seleccionarPacienteExistente, setView }) => {
  const [busqueda, setBusqueda] = useState('');

  // FUNCIÓN DE FILTRADO
  // Filtra por el Hash que se ve O intenta filtrar si el usuario escribe el NHC
  const pacientesFiltrados = listaPacientes.filter(p => {
    const term = busqueda.toLowerCase();
    const hashCompleto = (p.nhc_hash || p.id || "").toLowerCase();
    
    // 1. Coincidencia directa con lo que se ve (el hash)
    if (hashCompleto.includes(term)) return true;

    // 2. Aquí podrías añadir lógica de hash en JS si fuera necesario, 
    // pero por ahora buscamos por el fragmento visible.
    return false;
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => setView('perfil')} style={styles.backBtn}>
        ← Cancelar
      </button>

      <div style={styles.cardStyle}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ ...styles.cardTitle, color: '#1e293b' }}>
            <Search color="#2563eb" size={24} /> Buscar Paciente
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Introduzca el NHC o el identificador Hash para localizar al paciente.
          </p>
        </div>

        {/* BUSCADOR */}
        <div style={{ position: 'relative', marginBottom: '25px' }}>
          <Search 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
            size={20} 
          />
          <input
            type="text"
            placeholder="Escriba NHC o Hash..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              ...styles.inputStyle, 
              paddingLeft: '40px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((p, index) => (
              <div 
                key={index} 
                onClick={() => seleccionarPacienteExistente(p)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ backgroundColor: '#eff6ff', padding: '8px', borderRadius: '10px' }}>
                    <User size={20} color="#2563eb" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontFamily: 'monospace' }}>
                      ID: {p.nhc_hash ? p.nhc_hash.substring(0, 12) : 'Sin ID'}...
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '10px' }}>
                      <span>{p.genero === 'M' ? 'Masc.' : 'Fem.'}</span>
                      <span>•</span>
                      <span>{p.rango_edad}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight size={20} color="#cbd5e1" />
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', border: '2px dashed #f1f5f9', borderRadius: '12px' }}>
              No se han encontrado pacientes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeleccionarPacienteView;