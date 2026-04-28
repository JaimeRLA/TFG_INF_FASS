import React, { useState } from 'react';
import { ClipboardList, Trash2, ShieldCheck, Download, Search, Fingerprint, Calendar, User, Clock, FileDown, FileText } from 'lucide-react'; 
import { styles } from '../AppStyles.js';
import CryptoJS from 'crypto-js';

const HistorialView = ({ listaPacientes, seleccionarPacienteExistente, descargarPaciente, eliminarEvaluacion, setView, descargarTodoCSV, generarReportePDF }) => {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList color="#1d4ed8" size={20} />
            <div>
                <h3 style={{ ...styles.cardTitle, margin: 0, fontSize: '1rem' }}>
                Historial Clínico Pseudonimizado
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                    Busque eventos introduciendo el <strong>NHC real</strong> del paciente.
                </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px', 
              fontSize: '0.75rem', 
              color: '#92400e', 
              backgroundColor: '#fffbeb', 
              padding: '4px 10px', 
              borderRadius: '4px',
              border: '1px solid #fde68a',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}>
              <ShieldCheck size={13} /> RGPD: Datos Protegidos
            </div>
            
            <button 
              onClick={descargarTodoCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <FileDown size={14} /> Exportar CSV
            </button>
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
            <div style={{ textAlign: 'center', padding: '40px', background: '#fafafa', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
               <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>No se han encontrado registros coincidentes.</p>
            </div>
          ) : (
            pacientesFiltrados.map((p, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                transition: 'border-color 0.15s'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Fingerprint size={15} color="#475569" />
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {p.nhc_hash ? p.nhc_hash.substring(0, 16) : 'N/A'}...
                    </strong>
                    <span style={{ fontSize: '0.6rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#64748b', fontWeight: '700', border: '1px solid #e2e8f0', letterSpacing: '0.05em' }}>
                      PROTECTED
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><User size={12}/> {p.genero}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={12}/> {p.rango_edad}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12}/> 
                      {new Date(p.fecha).toLocaleDateString()} · {new Date(p.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.775rem', 
                    color: '#92400e', 
                    fontWeight: '600',
                    backgroundColor: '#fffbeb',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #fde68a'
                  }}>
                    nFASS {p.nfass} · oFASS Grado {p.ofass_grade} · {p.risk_level}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '12px' }}>
                  <button 
                    onClick={() => seleccionarPacienteExistente(p)} 
                    style={styles.actionBtnGray}
                  >
                    Editar
                  </button>
                  
                  <button 
                    onClick={() => generarReportePDF(p)} 
                    style={{ 
                      ...styles.actionBtnBlue, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                    }}
                  >
                    <FileText size={13} /> PDF
                  </button>

                  <button 
                    onClick={() => eliminarEvaluacion(p.id)} 
                    style={{ 
                      ...styles.actionBtnRed, 
                      padding: '6px 8px',
                    }} 
                    title="Eliminar Registro"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PIE DE SEGURIDAD */}
      <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a' }}>
        <p style={{ fontSize: '0.75rem', color: '#78350f', margin: 0, lineHeight: '1.5' }}>
          <strong>Nota de Seguridad:</strong> Este sistema implementa medidas de seudonimización técnica. 
          Los identificadores originales (NHC) han sido transformados mediante funciones hash irreversibles (SHA-256).
        </p>
      </div>
    </div>
  );
};

export default HistorialView;