import React, { useState } from 'react';
import { Search, Users,User, Calendar, ArrowRight, Fingerprint } from 'lucide-react';
import { styles } from '../AppStyles.js';
import CryptoJS from 'crypto-js'; 

const SeleccionarPacienteView = ({ listaPacientes, seleccionarPacienteExistente, setView }) => {
  const [busqueda, setBusqueda] = useState('');

  // LÓGICA DE FILTRADO INTELIGENTE
  const pacientesFiltrados = listaPacientes.filter(p => {
    const term = busqueda.trim();
    if (!term) return true;

    // Calculamos el hash de lo que el usuario está escribiendo para comparar
    const hashDeBusqueda = CryptoJS.SHA256(term).toString();
    const hashEnDB = (p.nhc_hash || p.id || "").toLowerCase();

    return (
      hashEnDB.includes(term.toLowerCase()) || 
      hashEnDB === hashDeBusqueda               
    );
  });

  return (
    /* He subido el maxWidth a 1000px para que no sea tan estrecho */
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      <button onClick={() => setView('perfil')} style={styles.backBtn}>
        ← Cancelar
      </button>

      <div style={{ ...styles.cardStyle, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        
        {/* Cabecera con el icono del Menú */}
        <div style={{ marginBottom: '30px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '12px' }}>
            <Users color="#16a34a" size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
              Localizar Paciente
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', margin: '4px 0 0' }}>
              Introduzca el <strong>NHC real</strong> para realizar una búsqueda inversa en la base de datos.
            </p>
          </div>
        </div>

        {/* BUSCADOR - Ahora con fondo blanco y borde suave */}
        <div style={{ position: 'relative', marginBottom: '35px' }}>
          <Search 
            style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
            size={22} 
          />
          <input
            type="text"
            placeholder="Escriba el NHC del paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              width: '100%',
              padding: '16px 16px 16px 50px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '1.05rem',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff', // Aseguramos fondo blanco
              color: '#1e293b',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
            }}
          />
        </div>

        {/* LISTADO DE RESULTADOS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((p, index) => (
              <div 
                key={index} 
                onClick={() => seleccionarPacienteExistente(p)}
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  border: '1px solid #f1f5f9',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.backgroundColor = '#f8faff';
                    e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '10px' }}>
                    <Fingerprint size={24} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                      ID: {p.id ? p.id.substring(0, 16) : '---'}...
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', display: 'flex', gap: '15px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={16} /> {p.genero === 'M' ? 'Masc.' : 'Fem.'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={16} /> {p.rango_edad}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '600' }}>
                  <span>Seleccionar</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '50px', 
              color: '#94a3b8', 
              background: '#f8fafc', 
              borderRadius: '16px', 
              border: '2px dashed #e2e8f0' 
            }}>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>No hay pacientes que coincidan con "{busqueda}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeleccionarPacienteView;