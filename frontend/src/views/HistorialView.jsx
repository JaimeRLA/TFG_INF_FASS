import React, { useState } from 'react';
import { ClipboardList, Trash2, ShieldCheck, Download, Search, Fingerprint, Calendar, User, Clock } from 'lucide-react'; // Añadido Clock
import { styles } from '../AppStyles.js';
import CryptoJS from 'crypto-js';

const HistorialView = ({ listaPacientes, seleccionarPacienteExistente, descargarPaciente, eliminarEvaluacion, setView }) => {
  const [busqueda, setBusqueda] = useState('');

  const pacientesFiltrados = listaPacientes.filter(p => {
    const term = busqueda.trim();
    if (!term) return true;

    const hashDeBusqueda = CryptoJS.SHA256(term).toString();
    const hashEnDB = (p.nhc_hash || "").toLowerCase();

    return (
      hashEnDB.includes(term.toLowerCase()) || 
      hashEnDB === hashDeBusqueda
    );
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <button onClick={() => setView('perfil')} style={styles.backBtn}>← Volver al Menú</button>
      
      <div style={styles.cardStyle}>
        {/* CABECERA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#fff7ed', padding: '10px', borderRadius: '10px' }}>
              <ClipboardList color="#ea580c" size={28} />
            </div>
            <div>
                <h3 style={{ ...styles.cardTitle, color: '#1e293b', margin: 0 }}>
                Historial Clínico Pseudonimizado
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                    Puede buscar eventos de pacientes introduciendo su <strong>NHC real</strong>.
                </p>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            fontSize: '0.75rem', 
            color: '#ea580c', 
            backgroundColor: '#fff7ed', 
            padding: '6px 14px', 
            borderRadius: '20px',
            border: '1px solid #ffedd5',
            fontWeight: '700',
            whiteSpace: 'nowrap'
          }}>
            <ShieldCheck size={14} /> RGPD: Datos Protegidos
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div style={{ position: 'relative', marginBottom: '25px' }}>
          <Search 
            style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
            size={20} 
          />
          <input
            type="text"
            placeholder="Filtrar por NHC real o fragmento de ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              width: '100%',
              padding: '14px 14px 14px 48px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#ea580c';
              e.target.style.boxShadow = '0 0 0 4px rgba(234, 88, 12, 0.05)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
            }}
          />
        </div>

        {/* LISTADO DE EVALUACIONES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {pacientesFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
               <p style={{ color: '#64748b', margin: 0 }}>No se han encontrado registros coincidentes.</p>
            </div>
          ) : (
            pacientesFiltrados.map((p, index) => (
              <div key={index} style={{
                ...styles.itemPacienteStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
                transition: 'all 0.2s'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Fingerprint size={18} color="#ea580c" />
                    <strong style={{ color: '#1e293b', fontFamily: 'monospace', fontSize: '1.05rem' }}>
                      ID: {p.nhc_hash ? p.nhc_hash.substring(0, 16) : 'N/A'}...
                    </strong>
                    <span style={{ fontSize: '0.6rem', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', color: '#64748b', fontWeight: '800', border: '1px solid #e2e8f0' }}>
                      PROTECTED
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14}/> {p.genero}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14}/> {p.rango_edad}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14}/> 
                      {/* Mostramos fecha y hora formateada */}
                      {new Date(p.fecha).toLocaleDateString()} - {new Date(p.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'inline-block',
                    fontSize: '0.85rem', 
                    color: '#ea580c', 
                    fontWeight: '700',
                    backgroundColor: '#fff7ed',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    Resultado: nFASS {p.nfass} | oFASS Grado {p.ofass_grade} ({p.risk_level})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => seleccionarPacienteExistente(p)} 
                    style={{ ...styles.actionBtnGray, padding: '8px 16px' }}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => descargarPaciente(p)} 
                    style={{ ...styles.actionBtnBlue, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#2563eb' }}
                  >
                    <Download size={14} /> CSV
                  </button>
                  <button 
                    onClick={() => eliminarEvaluacion(p.id)} 
                    style={{ 
                      ...styles.actionBtnRed, 
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px'
                    }} 
                    title="Eliminar Registro"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PIE DE SEGURIDAD */}
      <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px dashed #ea580c' }}>
        <p style={{ fontSize: '0.75rem', color: '#7c2d12', margin: 0, lineHeight: '1.5' }}>
          <strong>Nota de Seguridad:</strong> Este sistema implementa medidas de seudonimización técnica. 
          Los identificadores originales (NHC) han sido transformados mediante funciones hash irreversibles (SHA-256).
        </p>
      </div>
    </div>
  );
};

export default HistorialView;