import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HeartPulse, Info, User, LogOut, ArrowRight, Activity, 
  ArrowLeft, ClipboardCheck, Users, Search, ChevronDown, ChevronUp 
} from 'lucide-react';

import { SECCIONES_SINTOMAS } from './data/sintomas';
import ResultadoCard from './components/ResultadoCard';
import ChatBot from './components/ChatBot';
import Login from './components/Login';

const App = () => {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [view, setView] = useState('perfil'); 
  const [resultado, setResultado] = useState(null);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  
  // Datos básicos del paciente
  const [paciente, setPaciente] = useState({ 
    id: '', fecha_nacimiento: '', genero: '' 
  });

  // Estado para todas las preguntas nuevas (Cuestionario)
  const [cuestionario, setCuestionario] = useState({});
  const [seleccionados, setSeleccionados] = useState({});

  const handleCuestionario = (pregunta, valor) => {
    setCuestionario(prev => ({ ...prev, [pregunta]: valor }));
  };

  const handleSelectChange = (grupoId, valor) => {
    setSeleccionados(prev => ({ ...prev, [grupoId]: valor }));
  };

  const reiniciarApp = () => {
    setPaciente({ id: '', fecha_nacimiento: '', genero: '' });
    setCuestionario({});
    setSeleccionados({});
    setResultado(null);
    setView('perfil');
  };

  const cargarPacientesExistentes = async () => {
    try {
      const res = await axios.get(`https://tfg-inf-fass.onrender.com/pacientes_unicos?medico=${usuarioLogueado}`);
      setListaPacientes(res.data);
      setView('seleccionar_paciente');
    } catch (err) { alert("Error cargando pacientes"); }
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (!paciente.id) return alert("NHC obligatorio");

    try {
      const res = await axios.post('https://tfg-inf-fass.onrender.com/calculate', {
        paciente_id: paciente.id,
        fecha_nacimiento: paciente.fecha_nacimiento,
        genero: paciente.genero,
        respuestas: cuestionario, // Se guarda como JSON en el backend
        sintomas: listaIds,
        medico: usuarioLogueado
      });
      setResultado(res.data);
    } catch (err) { console.error(err); }
  };

  if (!usuarioLogueado) return <Login onLoginSuccess={setUsuarioLogueado} />;

  // Componente Reutilizable para Pregunta Si/No + Detalles
  const PreguntaSN = ({ id, label, placeholder = "Detalles..." }) => (
    <div style={{ marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>{label}</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['Yes', 'No'].map(op => (
            <button 
              key={op}
              onClick={() => handleCuestionario(id, op)}
              style={{
                padding: '5px 15px', borderRadius: '8px', border: '1px solid #e2e8f0',
                backgroundColor: cuestionario[id] === op ? '#2563eb' : '#fff',
                color: cuestionario[id] === op ? '#fff' : '#64748b', cursor: 'pointer'
              }}
            >{op}</button>
          ))}
        </div>
      </div>
      {cuestionario[id] === 'Yes' && (
        <input 
          style={inputStyle} 
          placeholder={placeholder}
          onChange={(e) => handleCuestionario(`${id}_detalles`, e.target.value)}
        />
      )}
    </div>
  );

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: '"Inter", sans-serif' }}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartPulse size={30} color="#2563eb" />
          <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0, fontWeight: '800' }}>FASS System</h1>
        </div>
        <button onClick={() => setUsuarioLogueado(null)} style={logoutBtn}><LogOut size={18} /> Salir</button>
      </header>

      <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto' }}>
        
        {view === 'perfil' && (
           <div style={{ display: 'flex', gap: '30px', marginTop: '60px', justifyContent: 'center' }}>
             <div style={optionCard}>
               <User size={40} color="#2563eb" />
               <h2>Nuevo Paciente</h2>
               <button onClick={() => setView('registro_paciente')} style={startBtn}>Empezar</button>
             </div>
             <div style={optionCard}>
               <Users size={40} color="#16a34a" />
               <h2>Paciente Existente</h2>
               <button onClick={cargarPacientesExistentes} style={{...startBtn, backgroundColor: '#16a34a'}}>Buscar</button>
             </div>
           </div>
        )}

        {view === 'registro_paciente' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button onClick={() => setView('perfil')} style={backBtn}>← Volver</button>
            
            {/* SECCIÓN 1: DATOS BÁSICOS */}
            <div style={cardStyle}>
              <h3 style={cardTitle}><ClipboardCheck color="#2563eb" /> Datos del Paciente</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div style={inputWrapper}><label style={labelStyle}>NHC / ID</label><input style={inputStyle} value={paciente.id} onChange={e => setPaciente({...paciente, id: e.target.value})} /></div>
                <div style={inputWrapper}><label style={labelStyle}>Fecha Nacimiento</label><input type="date" style={inputStyle} value={paciente.fecha_nacimiento} onChange={e => setPaciente({...paciente, fecha_nacimiento: e.target.value})} /></div>
                <div style={inputWrapper}><label style={labelStyle}>Género</label>
                  <select style={selectStyle} value={paciente.genero} onChange={e => setPaciente({...paciente, genero: e.target.value})}>
                    <option value="">Seleccionar...</option><option value="M">Masculino</option><option value="F">Femenino</option><option value="O">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: HISTORIAL MÉDICO (Cuestionario) */}
            <div style={{...cardStyle, marginTop: '20px'}}>
              <h3 style={cardTitle}>Historial de Alergias y Medicación</h3>
              <PreguntaSN id="p1" label="1. Do you have any confirmed allergies?" />
              <div style={{padding: '10px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '15px'}}>
                <p style={{fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b'}}>2. Do you have suspected allergies to:</p>
                <PreguntaSN id="p2_foods" label="• Foods?" />
                <PreguntaSN id="p2_insects" label="• Insects or ticks?" />
                <PreguntaSN id="p2_meds" label="• Medications?" />
              </div>
              <PreguntaSN id="p3" label="3. Taking allergy/asthma medications? (Antihistamines, sprays...)" />
              <PreguntaSN id="p4" label="4. Prescribed adrenaline device?" />
              <PreguntaSN id="p6_asthma" label="6. Do you have Asthma?" />
              <PreguntaSN id="p6_eczema" label="6. Do you have Eczema?" />
              <PreguntaSN id="p9" label="9. Family history of allergies?" />
              
              <button onClick={() => setView('calculadora')} style={{...startBtn, width: '100%', marginTop: '20px'}}>Siguiente: Evaluación de Reacción <ArrowRight /></button>
            </div>
          </div>
        )}

        {view === 'calculadora' && (
          <main style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            <section style={{ flex: '1' }}>
              <div style={cardStyle}>
                <h3 style={cardTitle}><Activity color="#2563eb" /> Detalles de la Reacción</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                   <div style={inputWrapper}><label style={labelStyle}>Date/Time of Reaction</label><input type="datetime-local" style={inputStyle} onChange={e => handleCuestionario('reaccion_fecha', e.target.value)} /></div>
                   <div style={inputWrapper}><label style={labelStyle}>Location</label>
                    <select style={selectStyle} onChange={e => handleCuestionario('reaccion_lugar', e.target.value)}>
                      <option value="Home">Home</option><option value="School">School</option><option value="Dining Out">Dining Out</option>
                    </select>
                   </div>
                </div>

                {SECCIONES_SINTOMAS.map(sec => (
                  <div key={sec.titulo} style={{ marginBottom: '25px' }}>
                    <h4 style={secHeader}>{sec.titulo}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {sec.grupos.map(grupo => (
                        <div key={grupo.id_base}>
                          <label style={labelStyle}>{grupo.label}</label>
                          <select style={selectStyle} onChange={(e) => handleSelectChange(grupo.id_base, e.target.value)}>
                            <option value="">-- No --</option>
                            {grupo.options.map(opt => <option key={opt.id} value={opt.id}>{opt.text}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={enviarEvaluacion} style={calcBtn}>Calcular nFASS / oFASS</button>
              </div>
            </section>

            <aside style={{ width: '400px', position: 'sticky', top: '20px' }}>
              {resultado ? <ResultadoCard resultado={resultado} /> : <div style={emptyCard}>Esperando datos...</div>}
              <button onClick={reiniciarApp} style={newEvalBtn}>Nuevo Paciente</button>
            </aside>
          </main>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

// --- ESTILOS (Resumidos para brevedad, mantener los anteriores) ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' };
const optionCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '300px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const startBtn = { padding: '12px 25px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' };
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' };
const inputWrapper = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#64748b' };
const cardTitle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', marginBottom: '20px', fontWeight: '800' };
const secHeader = { fontSize: '0.75rem', color: '#2563eb', textTransform: 'uppercase', borderBottom: '1px solid #eee', marginBottom: '15px' };
const calcBtn = { width: '100%', padding: '20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '20px' };
const backBtn = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' };
const logoutBtn = { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' };
const emptyCard = { padding: '50px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '20px' };
const newEvalBtn = { width: '100%', marginTop: '10px', padding: '12px', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '12px', background: 'none', fontWeight: 'bold', cursor: 'pointer' };

export default App;