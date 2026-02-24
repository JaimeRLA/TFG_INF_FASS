import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HeartPulse, Info, User, LogOut, ArrowRight, Activity, 
  ArrowLeft, ClipboardCheck, Users, Search, ClipboardList 
} from 'lucide-react';

// Componentes externos
import { SECCIONES_SINTOMAS } from './data/sintomas';
import ResultadoCard from './components/ResultadoCard';
import ChatBot from './components/ChatBot';
import Login from './components/Login';

const App = () => {
  // --- ESTADOS ---
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [view, setView] = useState('perfil'); 
  const [resultado, setResultado] = useState(null);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  
  // Datos del paciente (NHC como clave única)
  const [paciente, setPaciente] = useState({ 
    id: '', fecha_nacimiento: '', genero: '' 
  });

  // Estado para el gran cuestionario médico
  const [cuestionario, setCuestionario] = useState({});
  const [seleccionados, setSeleccionados] = useState({});

  // --- LÓGICA DE DATOS ---
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
    } catch (err) { alert("Error al conectar con la base de datos."); }
  };

  const seleccionarPacienteExistente = (p) => {
    setPaciente({
      id: p.id || p.paciente_id,
      fecha_nacimiento: p.fecha_nacimiento || '',
      genero: p.genero || ''
    });
    // Si el paciente ya existe, podrías cargar su último cuestionario si lo guardas en JSON
    setResultado(null);
    setSeleccionados({});
    setView('calculadora');
  };

  const validarYPasarACalculadora = async () => {
    if (!paciente.id || !paciente.fecha_nacimiento || !paciente.genero) {
      alert("NHC, Fecha de Nacimiento y Género son obligatorios.");
      return;
    }
    // Validación de seguridad por NHC (evitar duplicados incoherentes)
    try {
      const res = await axios.get(`https://tfg-inf-fass.onrender.com/pacientes_unicos?medico=${usuarioLogueado}`);
      const duplicado = res.data.find(p => p.id === paciente.id);
      if (duplicado && duplicado.genero !== paciente.genero) {
        alert(`ALERTA: El NHC ${paciente.id} ya existe con datos distintos. Verifique la historia clínica.`);
        return;
      }
      setView('calculadora');
    } catch (e) { setView('calculadora'); }
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (!paciente.id) return alert("Error: Falta ID del paciente.");

    try {
      const res = await axios.post('https://tfg-inf-fass.onrender.com/calculate', {
        paciente_id: paciente.id,
        fecha_nacimiento: paciente.fecha_nacimiento,
        genero: paciente.genero,
        respuestas: cuestionario, // Se envía como objeto completo al backend
        sintomas: listaIds,
        medico: usuarioLogueado
      });
      setResultado(res.data);
    } catch (err) { alert("Error en el cálculo. Revise la consola."); }
  };

  // Filtrado para el buscador
  const pacientesFiltrados = listaPacientes.filter(p => 
    p.id.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  if (!usuarioLogueado) return <Login onLoginSuccess={setUsuarioLogueado} />;

  // Componente interno para preguntas SI/NO
  const PreguntaSN = ({ id, label }) => (
    <div style={preguntaContainer}>
      <span style={preguntaLabel}>{label}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['Yes', 'No'].map(op => (
          <button 
            key={op}
            onClick={() => handleCuestionario(id, op)}
            style={{...btnMini, backgroundColor: cuestionario[id] === op ? '#2563eb' : '#fff', color: cuestionario[id] === op ? '#fff' : '#64748b'}}
          >{op}</button>
        ))}
      </div>
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
        
        {/* VISTA: PERFIL */}
        {view === 'perfil' && (
           <div style={{ display: 'flex', gap: '30px', marginTop: '60px', justifyContent: 'center' }}>
             <div style={optionCard}>
               <div style={avatarStyle}><User size={40} color="#2563eb" /></div>
               <h2>Nuevo Paciente</h2>
               <p style={{color:'#64748b', marginBottom:'20px'}}>Registro completo de sintomatología y antecedentes.</p>
               <button onClick={() => setView('registro_paciente')} style={startBtn}>Empezar Registro</button>
             </div>
             <div style={optionCard}>
               <div style={{...avatarStyle, backgroundColor:'#f0fdf4'}}><Users size={40} color="#16a34a" /></div>
               <h2>Paciente Existente</h2>
               <p style={{color:'#64748b', marginBottom:'20px'}}>Acceder a historial y realizar nueva evaluación.</p>
               <button onClick={cargarPacientesExistentes} style={{...startBtn, backgroundColor: '#16a34a'}}>Buscar NHC</button>
             </div>
           </div>
        )}

        {/* VISTA: SELECCIONAR PACIENTE */}
        {view === 'seleccionar_paciente' && (
          <div style={{ maxWidth: '800px', margin: '40px auto' }}>
            <button onClick={() => setView('perfil')} style={backBtn}>← Volver</button>
            <div style={cardStyle}>
              <h3 style={cardTitle}><Users size={22} color="#2563eb" /> Buscar Paciente</h3>
              <div style={searchBar}>
                <Search size={20} color="#94a3b8" />
                <input style={searchInput} placeholder="Escriba el NHC..." onChange={(e) => setFiltroBusqueda(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                {pacientesFiltrados.map(p => (
                  <div key={p.id} onClick={() => seleccionarPacienteExistente(p)} style={itemPacienteStyle}>
                    <strong>NHC: {p.id}</strong>
                    <span>{p.genero} | Nacimiento: {p.fecha_nacimiento}</span>
                    <ArrowRight size={18} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VISTA: REGISTRO INTEGRADO */}
        {view === 'registro_paciente' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button onClick={() => setView('perfil')} style={backBtn}>← Cancelar</button>
            
            <div style={cardStyle}>
              <h3 style={cardTitle}><ClipboardCheck color="#2563eb" /> Identificación del Paciente</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div style={inputWrapper}><label style={labelStyle}>NHC / ID</label><input style={inputStyle} value={paciente.id} onChange={e => setPaciente({...paciente, id: e.target.value})} /></div>
                <div style={inputWrapper}><label style={labelStyle}>Fecha de Nacimiento</label><input type="date" style={inputStyle} value={paciente.fecha_nacimiento} onChange={e => setPaciente({...paciente, fecha_nacimiento: e.target.value})} /></div>
                <div style={inputWrapper}><label style={labelStyle}>Género</label>
                  <select style={selectStyle} value={paciente.genero} onChange={e => setPaciente({...paciente, genero: e.target.value})}>
                    <option value="">Seleccionar...</option><option value="Male">Male</option><option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{...cardStyle, marginTop: '20px'}}>
              <h3 style={cardTitle}><ClipboardList color="#2563eb" /> Cuestionario de Antecedentes</h3>
              <PreguntaSN id="q1" label="1. Do you have any confirmed allergies?" />
              <textarea style={{...inputStyle, marginTop:'-10px', marginBottom:'15px'}} placeholder="If yes, details..." onChange={e => handleCuestionario('q1_det', e.target.value)} />
              
              <div style={subSection}>
                <p style={subSectionTitle}>2. Suspected allergies to:</p>
                <PreguntaSN id="q2_food" label="• Foods?" />
                <PreguntaSN id="q2_insects" label="• Insects or ticks?" />
                <PreguntaSN id="q2_meds" label="• Medications?" />
                <PreguntaSN id="q2_other" label="• Other?" />
              </div>

              <div style={subSection}>
                <p style={subSectionTitle}>3. Allergy or asthma medications:</p>
                <PreguntaSN id="q3_antihist" label="• Antihistamines?" />
                <PreguntaSN id="q3_nasal" label="• Nasal sprays?" />
                <PreguntaSN id="q3_asthma" label="• Asthma puffers?" />
              </div>

              <PreguntaSN id="q4" label="4. Prescribed adrenaline device?" />
              <PreguntaSN id="q6_asthma" label="6. Do you have Asthma?" />
              <PreguntaSN id="q8" label="8. Do you live in a damp house?" />
              <PreguntaSN id="q9" label="9. Family history of allergies?" />

              <button onClick={validarYPasarACalculadora} style={{...startBtn, width:'100%', marginTop:'20px'}}>Continuar a Evaluación de Reacción <ArrowRight /></button>
            </div>
          </div>
        )}

        {/* VISTA: CALCULADORA (Layout corregido para no solapar) */}
        {view === 'calculadora' && (
          <main style={calculatorLayout}>
            <section style={{ flex: '1', minWidth: '0' }}>
              <button onClick={() => setView('registro_paciente')} style={backBtn}>← Editar antecedentes</button>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{...cardTitle, margin: 0}}><Activity color="#2563eb" /> Síntomas de la Reacción</h3>
                    <span style={pacienteBadge}>NHC: {paciente.id}</span>
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
                <button onClick={enviarEvaluacion} style={calcBtn}>Calcular Gravedad nFASS</button>
              </div>
            </section>

            <aside style={asideStyle}>
              {resultado ? <ResultadoCard resultado={resultado} /> : <div style={emptyCard}>Esperando evaluación de síntomas...</div>}
              <button onClick={reiniciarApp} style={newEvalBtn}>Finalizar y Nuevo Paciente</button>
            </aside>
          </main>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

// --- ESTILOS ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', alignItems: 'center' };
const optionCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const avatarStyle = { width: '70px', height: '70px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' };
const startBtn = { padding: '14px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' };
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.9rem' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '4px', display: 'block' };
const inputWrapper = { display: 'flex', flexDirection: 'column' };
const cardTitle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '20px', fontWeight: '800', color: '#1e293b' };
const secHeader = { fontSize: '0.75rem', color: '#2563eb', textTransform: 'uppercase', borderBottom: '1px solid #eee', marginBottom: '15px', paddingBottom: '5px', fontWeight: '800' };
const calcBtn = { width: '100%', padding: '18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' };
const backBtn = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center' };
const logoutBtn = { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' };
const emptyCard = { padding: '50px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '20px', backgroundColor: '#fff' };
const newEvalBtn = { width: '100%', marginTop: '10px', padding: '12px', border: '2px solid #2563eb', color: '#2563eb', borderRadius: '12px', background: 'none', fontWeight: 'bold', cursor: 'pointer' };
const searchBar = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', width: '100%' };
const itemPacienteStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0' };
const pacienteBadge = { backgroundColor: '#eff6ff', color: '#2563eb', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' };
const calculatorLayout = { display: 'flex', gap: '30px', alignItems: 'flex-start' };
const asideStyle = { width: '400px', flexShrink: '0', position: 'sticky', top: '20px' };
const preguntaContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' };
const preguntaLabel = { fontSize: '0.9rem', color: '#475569', fontWeight: '500' };
const btnMini = { padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' };
const subSection = { backgroundColor: '#fbfcfd', padding: '15px', borderRadius: '15px', border: '1px solid #f1f5f9', marginBottom: '15px' };
const subSectionTitle = { fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' };

export default App;