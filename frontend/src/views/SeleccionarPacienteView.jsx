import React, { useState } from 'react';
import { Search, User, Calendar, ArrowRight, Fingerprint } from 'lucide-react';
import { styles } from '../AppStyles.js';
import CryptoJS from 'crypto-js'; // Importamos para buscar por NHC real

const SeleccionarPacienteView = ({ listaPacientes, seleccionarPacienteExistente, setView }) => {
  const [busqueda, setBusqueda] = useState('');

  // LÓGICA DE FILTRADO INTELIGENTE
  const pacientesFiltrados = listaPacientes.filter(p => {
    const term = busqueda.trim();
    if (!term) return true;

    // 1. Calculamos el hash de lo que el usuario está escribiendo para comparar
    const hashDeBusqueda = CryptoJS.SHA256(term).toString();
    const hashEnDB = (p.nhc_hash || p.id || "").toLowerCase();

    return (
      hashEnDB.includes(term.toLowerCase()) || // Por si busca por el fragmento de Hash visible
      hashEnDB === hashDeBusqueda               // ¡ESTO PERMITE BUSCAR POR NHC REAL!
    );
  });

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <button onClick={() => setView('perfil')} style={styles.backBtn}>
        ← Cancelar
      </button>

      <div style={{ ...styles.cardStyle, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#eff6ff', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <Search color="#2563eb" size={28} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Localizar Paciente</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
            Introduzca el <strong>NHC real</strong> para buscar en la base de datos pseudonimizada.
          </p>
        </div>

        {/* BUSCADOR ESTILIZADO */}
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <Search 
            style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
            size={20} 
          />
          <input
            type="text"
            placeholder="Escriba el NHC (ej: 9999)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              width: '100%',
              padding: '14px 14px 14px 45px',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((p, index) => (
              <div 
                key={index} 
                onClick={() => seleccionarPacienteExistente(p)}
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid #f1f5f9',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <Fingerprint size={22} color="#2563eb" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontFamily: 'monospace', fontSize: '1rem' }}>
                      ID: {p.id ? p.id.substring(0, 12) : '---'}...
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', display: 'flex', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} /> {p.genero === 'M' ? 'Masc.' : 'Fem.'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {p.rango_edad}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight size={20} color="#cbd5e1" />
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
              <p style={{ margin: 0 }}>No hay coincidencias para "{busqueda}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeleccionarPacienteView;