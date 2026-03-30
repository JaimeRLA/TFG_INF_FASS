import React from 'react';
import { 
  Activity, 
  ArrowLeft, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  UserCheck
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

  // Componente para las cabeceras de sección azul
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
    <main style={{ ...styles.calculatorLayout, maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      
      <section style={{ flex: '1', minWidth: '0' }}>
        
        {!esPacienteExistente && (
          <button onClick={() => setView('event_record')} style={styles.backBtn}>
            ← Volver a Event Record
          </button>
        )}

        <div style={{ ...styles.cardStyle, padding: '35px' }}>
          {/* CABECERA DE LA CALCULADORA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '12px' }}>
                <Stethoscope color="#2563eb" size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Evaluación de Síntomas</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>Seleccione los hallazgos clínicos observados en la reacción</p>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
               <div style={{ 
                 backgroundColor: '#f1f5f9', 
                 padding: '6px 12px', 
                 borderRadius: '10px', 
                 border: '1px solid #e2e8f0',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '6px'
               }}>
                 <UserCheck size={14} color="#64748b" />
                 <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', fontFamily: 'monospace' }}>
                   {paciente.id.substring(0,10)}...
                 </span>
               </div>
               {esPacienteExistente && (
                 <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '800', display: 'block', marginTop: '5px' }}>
                   ● PACIENTE RECURRENTE
                 </span>
               )}
            </div>
          </div>

          {/* LISTADO DE SECCIONES DE SINTOMAS */}
          {SECCIONES_SINTOMAS.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: '40px' }}>
              <SectionHeader icon={Activity} title={sec.titulo} />
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px',
                padding: '0 5px'
              }}>
                {sec.grupos.map(grupo => (
                  <div key={grupo.id_base} style={{
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s'
                  }}>
                    <label style={{ ...styles.labelStyle, marginBottom: '10px', display: 'block', fontSize: '0.9rem' }}>
                      {grupo.label}
                    </label>
                    <select 
                      style={{ ...styles.selectStyle, backgroundColor: '#fff' }} 
                      onChange={(e) => handleSelectChange(grupo.id_base, e.target.value)}
                    >
                      <option value="">-- No observado --</option>
                      {grupo.options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.text}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button 
            onClick={enviarEvaluacion} 
            style={{ 
              ...styles.calcBtn, 
              width: '100%', 
              padding: '20px', 
              fontSize: '1.1rem',
              borderRadius: '15px',
              backgroundColor: '#2563eb',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
              marginTop: '20px'
            }}
          >
            {resultado ? 'Actualizar Cálculo Gravedad' : 'Calcular Puntuación nFASS'}
          </button>
        </div>
      </section>

      {/* PANEL LATERAL DE RESULTADOS - ENSANCHADO A 500px */}
    <aside style={{ ...styles.asideStyle, width: '500px', minWidth: '500px' }}>
      <div style={{ position: 'sticky', top: '20px' }}>
        {resultado ? (
          <div style={{ animation: 'slideInRight 0.4s ease' }}>
            <ResultadoCard resultado={resultado} />
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              backgroundColor: '#ecfdf5', 
              borderRadius: '10px', 
              border: '1px solid #d1fae5',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <CheckCircle2 size={16} color="#059669" />
              <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: '600' }}>
                Evaluación guardada automáticamente.
              </span>
            </div>
          </div>
        ) : (
          <div style={{ 
            ...styles.emptyCard, 
            padding: '80px 20px', 
            border: '2px dashed #e2e8f0',
            backgroundColor: '#fff',
            color: '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <FileText size={40} strokeWidth={1} />
            <p style={{ margin: 0, fontWeight: '500' }}>Esperando datos clínicos...</p>
          </div>
        )}
        
        {/* BOTÓN CON Z-INDEX PARA QUE EL ASISTENTE NO LO TAPE */}
        <button 
          onClick={reiniciarApp} 
          style={{ 
            ...styles.newEvalBtn, 
            marginTop: '25px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#1e293b',
            position: 'relative', // Necesario para el zIndex
            zIndex: 9999,         // Por encima del asistente
            cursor: 'pointer'
          }}
        >
          <AlertCircle size={18} /> Finalizar y Guardar Sesión
        </button>
      </div>
    </aside>
    </main>
  );
};

export default CalculadoraView;