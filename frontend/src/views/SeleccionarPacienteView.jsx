import React, { useState } from 'react';
import { Search, User, Calendar, ArrowRight, Fingerprint, Users, ShieldCheck } from 'lucide-react';
import { styles } from '../AppStyles.js';
import CryptoJS from 'crypto-js'; 

const SeleccionarPacienteView = ({ listaPacientes, seleccionarPacienteExistente, setView }) => {
  const [busqueda, setBusqueda] = useState('');

  // LÓGICA DE FILTRADO INTELIGENTE
  const pacientesFiltrados = (listaPacientes || []).filter(p => {
    const term = busqueda.trim();
    if (!term) return true;

    try {
      const hashDeBusqueda = CryptoJS.SHA256(term).toString();
      const hashEnDB = (p.nhc_hash || p.id || "").toLowerCase();

      return (
        hashEnDB.includes(term.toLowerCase()) || 
        hashEnDB === hashDeBusqueda               
      );
    } catch (e) {
      return (p.nhc_hash || "").toLowerCase().includes(term.toLowerCase());
    }
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      <button onClick={() => setView('perfil')} style={styles.backBtn}>
        ← Volver a Menú
      </button>

      <div style={styles.cardStyle}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users color="#1d4ed8" size={18} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Localizar Paciente
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                Introduzca el <strong>NHC real</strong> para buscar al paciente.
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            fontSize: '0.75rem', 
            color: '#15803d', 
            backgroundColor: '#f0fdf4', 
            padding: '4px 10px', 
            borderRadius: '4px',
            border: '1px solid #bbf7d0',
            fontWeight: '600'
          }}>
            <ShieldCheck size={13} /> RGPD: Datos Protegidos
          </div>
        </div>

        {/* BUSCADOR */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
            size={15} 
          />
          <input
            type="text"
            placeholder="Escriba el NHC del paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              width: '100%',
              padding: '9px 12px 9px 36px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff', 
              color: '#0f172a',
              fontFamily: '"Inter", sans-serif'
            }}
          />
        </div>

        {/* LISTADO - Huellas Azules */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((p, index) => (
              <div 
                key={index} 
                onClick={() => seleccionarPacienteExistente(p)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.15s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Fingerprint size={16} color="#475569" />
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {p.nhc_hash ? p.nhc_hash.substring(0, 16) : (p.id ? String(p.id).substring(0,16) : '---')}...
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', display: 'flex', gap: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <User size={12} /> {p.genero === 'M' ? 'Masc.' : 'Fem.'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={12} /> {p.rango_edad}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1d4ed8', fontWeight: '600', fontSize: '0.8rem' }}>
                  <span>Seleccionar</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#94a3b8', 
              background: '#fafafa', 
              borderRadius: '6px', 
              border: '1px dashed #cbd5e1' 
            }}>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>No hay pacientes que coincidan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeleccionarPacienteView;