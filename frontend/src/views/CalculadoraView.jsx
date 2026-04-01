import React from 'react';
import { 
  Activity, 
  Stethoscope, 
  CheckCircle2, 
  FileText,
  UserCheck,
  XCircle,
  ArrowLeft // Importamos ArrowLeft para mantener la coherencia visual
} from 'lucide-react';
import { styles } from '../AppStyles.js';
import { SECCIONES_SINTOMAS } from '../data/sintomas';
import ResultadoCard from '../components/ResultadoCard';

const CalculadoraView = ({ 
  paciente, 
  handleSelectChange, 
  enviarEvaluacion, 
  resultado, 
  reiniciarApp, 
  setView, 
  esPacienteExistente 
}) => {

  const SectionHeader = ({ icon: Icon, title }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
      padding: '10px 15px',
      backgroundColor: '#eff6ff',
      borderLeft: '4px solid #2563eb',
      borderRadius: '0 8px 8px 0'
    }}>
      <Icon size={20} color="#2563eb" />
      <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </h4>
    </div>
  );

  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      gap: '40px', 
      maxWidth: '1500px', 
      margin: '0 auto', 
      padding: '20px',
      alignItems: 'flex-start' 
    }}>
      
      {/* COLUMNA IZQUIERDA: CALCULADORA */}
      <section style={{ flex: '1', minWidth: '0' }}>
        
        {/* BOTÓN VOLVER: Estilo unificado con el resto de la app */}
        <button 
          onClick={() => setView('event_record')} 
          style={{
              ...styles.backBtn,
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
          }}
        >
          ← Volver a Event Record
        </button>

        <div style={{ ...styles.cardStyle, padding: '35px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '12px' }}>
                <Stethoscope color="#2563eb" size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Evaluación de Síntomas</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>Seleccione los hallazgos clínicos observados</p>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
               <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                 <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', fontFamily: 'monospace' }}>
                   NHC: {paciente.id ? paciente.id.substring(0,10) : '---'}
                 </span>
               </div>
               {esPacienteExistente && (
                 <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '800', display: 'block', marginTop: '5px' }}>
                   ● PACIENTE RECURRENTE
                 </span>
               )}
            </div>
          </div>

          {SECCIONES_SINTOMAS.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: '40px' }}>
              <SectionHeader icon={Activity} title={sec.titulo} />
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px'
              }}>
                {sec.grupos.map(grupo => (
                  <div key={grupo.id_base} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                    <label style={{ ...styles.labelStyle, marginBottom: '10px', display: 'block', fontSize: '0.85rem' }}>
                      {grupo.label}
                    </label>
                    <select 
                      style={{ ...styles.selectStyle, backgroundColor: '#fff' }} 
                      onChange={(e) => handleSelectChange(grupo.id_base, e.target.value)}
                    >
                      <option value="">-- No observado --</option>
                      {grupo.options.map(opt => <option key={opt.id} value={opt.id}>{opt.text}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button 
            onClick={enviarEvaluacion} 
            style={{ ...styles.calcBtn, width: '100%', padding: '20px', borderRadius: '15px', backgroundColor: '#2563eb' }}
          >
            {resultado ? 'Actualizar Cálculo' : 'Calcular Gravedad nFASS'}
          </button>
        </div>
      </section>

      {/* COLUMNA DERECHA: RESULTADOS (FIJA) */}
      <aside style={{ 
        width: '500px', 
        minWidth: '500px', 
        position: 'sticky', 
        top: '20px', 
        alignSelf: 'flex-start' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <button 
            onClick={reiniciarApp} 
            style={{ 
              padding: '18px',
              borderRadius: '18px',
              border: 'none',
              backgroundColor: '#1e293b',
              color: '#fff',
              fontWeight: '800',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.2s'
            }}
          >
            <XCircle size={22} /> Finalizar y Guardar Sesión
          </button>

          {resultado ? (
            <div style={{ animation: 'slideInRight 0.4s ease' }}>
              <ResultadoCard resultado={resultado} />
              <div style={{ 
                marginTop: '15px', padding: '15px', backgroundColor: '#ecfdf5', 
                borderRadius: '12px', border: '1px solid #d1fae5', display: 'flex', gap: '8px', alignItems: 'center' 
              }}>
                <CheckCircle2 size={18} color="#059669" />
                <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: '700' }}>
                  Datos sincronizados correctamente.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ 
              padding: '100px 20px', border: '2px dashed #cbd5e1', borderRadius: '24px', 
              backgroundColor: '#fff', textAlign: 'center', color: '#94a3b8' 
            }}>
              <FileText size={50} strokeWidth={1} style={{ marginBottom: '10px' }} />
              <p style={{ fontWeight: '600' }}>Seleccione síntomas para evaluar</p>
            </div>
          )}
        </div>
      </aside>
    </main>
  );
};

export default CalculadoraView;