import React from 'react';
import { ClipboardList, Trash2, ShieldCheck, Download } from 'lucide-react';
import { styles } from '../AppStyles.js';

const HistorialView = ({ listaPacientes, seleccionarPacienteExistente, descargarPaciente, eliminarEvaluacion, setView }) => (
  <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
    <button onClick={() => setView('perfil')} style={styles.backBtn}>← Volver al Menú</button>
    
    <div style={styles.cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ ...styles.cardTitle, color: '#000', margin: 0 }}>
          <ClipboardList color="#ea580c" /> Historial Clínico Pseudonimizado
        </h3>
        {/* Etiqueta visual de seguridad para el TFG */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px', 
          fontSize: '0.75rem', 
          color: '#059669', 
          backgroundColor: '#ecfdf5', 
          padding: '4px 12px', 
          borderRadius: '20px',
          border: '1px solid #d1fae5'
        }}>
          <ShieldCheck size={14} /> RGPD: Datos Protegidos
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {listaPacientes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No se han encontrado registros para este facultativo.</p>
        ) : (
          listaPacientes.map((p, index) => (
            <div key={index} style={styles.itemPacienteStyle}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#1e293b', fontFamily: 'monospace' }}>
                    ID: {p.nhc_hash ? p.nhc_hash.substring(0, 12) : 'N/A'}...
                  </strong>
                  <span style={{ fontSize: '0.65rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#64748b', fontWeight: 'bold' }}>
                    HASH-SHA256
                  </span>
                </div>
                
                <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  <strong>Paciente:</strong> {p.genero} | <strong>Rango Edad:</strong> {p.rango_edad} | 
                  <strong> Fecha Eval:</strong> {new Date(p.fecha).toLocaleDateString()}
                </p>
                
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#2563eb', fontWeight: '600' }}>
                  Resultado: nFASS {p.nfass} | oFASS Grado {p.ofass_grade} ({p.risk_level})
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => seleccionarPacienteExistente(p)} 
                  style={styles.actionBtnGray}
                >
                  Editar
                </button>
                <button 
                  onClick={() => descargarPaciente(p)} 
                  style={{ ...styles.actionBtnBlue, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={14} /> CSV
                </button>
                <button 
                  onClick={() => eliminarEvaluacion(p.id)} 
                  style={styles.actionBtnRed} 
                  title="Eliminar Registro"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
          <strong>Nota de Seguridad:</strong> Este sistema implementa medidas de seudonimización técnica. 
          Los identificadores originales (NHC) han sido transformados mediante funciones hash irreversibles 
          y las fechas de nacimiento han sido minimizadas a rangos etarios según las directrices del EDPB 2025.
        </p>
      </div>
    </div>
  </div>
);

export default HistorialView;