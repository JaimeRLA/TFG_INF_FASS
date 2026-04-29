import React from 'react';
import { 
  Activity, 
  Stethoscope, 
  CheckCircle2, 
  FileText,
  UserCheck,
  XCircle,
  ArrowLeft,
  Loader2
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
  esPacienteExistente,
  isCalculating = false
}) => {

  const SectionHeader = ({ icon: Icon, title }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e2e8f0',
    }}>
      <Icon size={15} color="#1d4ed8" />
      <h4 style={{ margin: 0, fontSize: '0.7rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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

        <div style={{ ...styles.cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Stethoscope color="#1d4ed8" size={20} />
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>Evaluación clínica</p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '2px 0 0' }}>Evaluación de Síntomas</h3>
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
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px'
              }}>
                {sec.grupos.map(grupo => (
                  <div key={grupo.id_base} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fafafa' }}>
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
            disabled={isCalculating}
            style={{ 
              ...styles.calcBtn, 
              width: '100%', 
              padding: '12px', 
              borderRadius: '6px',
              backgroundColor: isCalculating ? '#94a3b8' : '#0f172a',
              cursor: isCalculating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: isCalculating ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isCalculating && <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />}
            {isCalculating ? 'Calculando...' : (resultado ? 'Actualizar Cálculo' : 'Calcular Gravedad nFASS')}
          </button>
          
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </section>

      {/* COLUMNA DERECHA: RESULTADOS (FIJA) */}
      <aside style={{ 
        width: '420px', 
        minWidth: '420px', 
        position: 'sticky', 
        top: '20px', 
        alignSelf: 'flex-start' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <button 
            onClick={reiniciarApp} 
            style={{ 
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0f172a',
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <XCircle size={22} /> Finalizar y Guardar Sesión
          </button>

          {resultado ? (
            <div style={{ animation: 'slideInRight 0.4s ease' }}>
              <ResultadoCard resultado={resultado} />
              <div style={{ 
                marginTop: '12px', padding: '10px 14px', backgroundColor: '#f0fdf4', 
                borderRadius: '6px', border: '1px solid #d1fae5', display: 'flex', gap: '8px', alignItems: 'center' 
              }}>
                <CheckCircle2 size={18} color="#059669" />
                <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: '700' }}>
                  Datos sincronizados correctamente.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ 
              padding: '60px 20px', border: '1px dashed #cbd5e1', borderRadius: '8px', 
              backgroundColor: '#fafafa', textAlign: 'center', color: '#94a3b8' 
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