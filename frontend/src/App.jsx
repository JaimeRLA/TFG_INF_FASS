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
  
  const [paciente, setPaciente] = useState({ 
    id: '', fecha_nacimiento: '', genero: '' 
  });

  const [cuestionario, setCuestionario] = useState({});
  const [seleccionados, setSeleccionados] = useState({});

  // --- LÓGICA ---
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
    setResultado(null);
    setSeleccionados({});
    setView('calculadora');
  };

  const validarYPasarACalculadora = async () => {
    if (!paciente.id || !paciente.fecha_nacimiento || !paciente.genero) {
      alert("NHC, Fecha de Nacimiento y Género son obligatorios.");
      return;
    }
    setView('calculadora');
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (!paciente.id) return alert("Error: Falta ID del paciente.");

    try {
      const res = await axios.post('https://tfg-inf-fass.onrender.com/calculate', {
        paciente_id: paciente.id,
        fecha_nacimiento: paciente.fecha_nacimiento,
        genero: paciente.genero,
        respuestas: cuestionario,
        sintomas: listaIds,
        medico: usuarioLogueado
      });

      // Si el backend devuelve un mensaje de error (como el de género incorrecto)
      if (res.data.success === false) {
        alert(res.data.message);
      } else {
        // Si todo va bien, el resultado llegará aquí y se actualizará la tarjeta
        setResultado(res.data);
      }
    } catch (err) { 
      console.error("Error en la petición:", err);
      alert("Error en el cálculo. Verifique la conexión con el servidor."); 
    }
  };

  const pacientesFiltrados = listaPacientes.filter(p => 
  p.id && p.id.toString().toLowerCase().includes(filtroBusqueda.toLowerCase())
);

  if (!usuarioLogueado) return <Login onLoginSuccess={setUsuarioLogueado} />;

  // Componente de Pregunta Estilo Calculadora con botones PEQUEÑOS
  const PreguntaClinica = ({ id, label }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', maxWidth: '70%' }}>{label}</span>
      <div style={{ display: 'flex', gap: '5px' }}>
        {['Yes', 'No'].map(op => (
          <button 
            key={op}
            onClick={() => handleCuestionario(id, op)}
            style={{
              padding: '4px 12px',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: cuestionario[id] === op ? '#2563eb' : '#e2e8f0',
              backgroundColor: cuestionario[id] === op ? '#2563eb' : '#fff',
              color: cuestionario[id] === op ? '#fff' : '#64748b',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
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
               <h2 style={cardHeading}>Nuevo Paciente</h2>
               <p style={{color:'#64748b', marginBottom:'20px'}}>Registro completo de sintomatología y antecedentes.</p>
               <button onClick={() => setView('registro_paciente')} style={startBtn}>Empezar Registro</button>
             </div>
             <div style={optionCard}>
               <div style={{...avatarStyle, backgroundColor:'#f0fdf4'}}><Users size={40} color="#16a34a" /></div>
               <h2 style={cardHeading}>Paciente Existente</h2>
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

        {/* VISTA: REGISTRO (CON TODAS LAS PREGUNTAS 1-10) */}
{view === 'registro_paciente' && (
  <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
    <button onClick={() => setView('perfil')} style={backBtn}>← Cancelar</button>
    
    <div style={cardStyle}>
      <h3 style={cardTitle}><ClipboardCheck color="#2563eb" /> Antecedentes del Paciente</h3>
      
      {/* SECCIÓN 1: IDENTIFICACIÓN */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={secHeader}>Identificación Básica</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={inputWrapper}><label style={labelStyle}>NHC / ID</label><input style={inputStyle} value={paciente.id} onChange={e => setPaciente({...paciente, id: e.target.value})} /></div>
          <div style={inputWrapper}><label style={labelStyle}>Fecha Nacimiento</label><input type="date" style={inputStyle} value={paciente.fecha_nacimiento} onChange={e => setPaciente({...paciente, fecha_nacimiento: e.target.value})} /></div>
          <div style={inputWrapper}><label style={labelStyle}>Género</label>
            <select style={selectStyle} value={paciente.genero} onChange={e => setPaciente({...paciente, genero: e.target.value})}>
              <option value="">Seleccionar...</option><option value="Male">Male</option><option value="Female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* CUESTIONARIO COMPLETO 1-10 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Pregunta 1 */}
        <div style={questionBlock}>
          <PreguntaClinica id="q1" label="1. Do you have any confirmed allergies?" />
          {cuestionario.q1 === 'Yes' && <textarea style={detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q1_details', e.target.value)} />}
        </div>

        {/* Pregunta 2 */}
        <div style={questionBlock}>
          <h4 style={subLabel}>2. Do you have suspected allergies to:</h4>
          <div style={gridQuestions}>
            <PreguntaClinica id="q2_foods" label="• Foods?" />
            <PreguntaClinica id="q2_insects" label="• Insects or ticks (stings or bites)?" />
            <PreguntaClinica id="q2_meds" label="• Medications (drugs)?" />
            <PreguntaClinica id="q2_other" label="• Other?" />
          </div>
          {(cuestionario.q2_foods === 'Yes' || cuestionario.q2_insects === 'Yes' || cuestionario.q2_meds === 'Yes' || cuestionario.q2_other === 'Yes') && 
            <textarea style={detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q2_details', e.target.value)} />}
        </div>

        {/* Pregunta 3 */}
        <div style={questionBlock}>
          <h4 style={subLabel}>3. Are you taking any of the following allergy or asthma medications:</h4>
          <div style={gridQuestions}>
            <PreguntaClinica id="q3_anti" label="• Antihistamines?" />
            <PreguntaClinica id="q3_eyes" label="• Eyedrops?" />
            <PreguntaClinica id="q3_nasal" label="• Nasal sprays?" />
            <PreguntaClinica id="q3_puff" label="• Asthma puffers?" />
            <PreguntaClinica id="q3_cream" label="• Eczema creams?" />
          </div>
          {(cuestionario.q3_anti === 'Yes' || cuestionario.q3_eyes === 'Yes' || cuestionario.q3_nasal === 'Yes' || cuestionario.q3_puff === 'Yes' || cuestionario.q3_cream === 'Yes') && 
            <textarea style={detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q3_details', e.target.value)} />}
        </div>

        {/* Preguntas 4 y 5 */}
        <div style={gridQuestions}>
            <div style={questionBlock}>
                <PreguntaClinica id="q4" label="4. Prescribed adrenaline (epinephrine) device?" />
            </div>
            <div style={questionBlock}>
                <PreguntaClinica id="q5" label="5. Taking other medications or supplements?" />
                {cuestionario.q5 === 'Yes' && <textarea style={detailInput} placeholder="Provide details..." onChange={e => handleCuestionario('q5_details', e.target.value)} />}
            </div>
        </div>

        {/* Pregunta 6 */}
        <div style={questionBlock}>
          <h4 style={subLabel}>6. Do you have any of the following:</h4>
          <div style={gridQuestions}>
            <PreguntaClinica id="q6_rhin" label="• Allergic rhinitis (hay fever)?" />
            <PreguntaClinica id="q6_asth" label="• Asthma?" />
            <PreguntaClinica id="q6_ecze" label="• Eczema?" />
            <PreguntaClinica id="q6_hive" label="• Hives?" />
            <PreguntaClinica id="q6_head" label="• Regular headaches?" />
            <PreguntaClinica id="q6_sinu" label="• Sinus problems?" />
            <PreguntaClinica id="q6_mouth" label="• Itchy mouth after raw fruit/veg?" />
          </div>
          {['q6_rhin', 'q6_asth', 'q6_ecze', 'q6_hive', 'q6_head', 'q6_sinu', 'q6_mouth'].some(k => cuestionario[k] === 'Yes') && 
            <textarea style={detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q6_details', e.target.value)} />}
        </div>

        {/* Preguntas 7 a 10 */}
        <div style={questionBlock}><PreguntaClinica id="q7" label="7. Do you live in a house with indoor pets?" />{cuestionario.q7 === 'Yes' && <textarea style={detailInput} placeholder="Details..." onChange={e => handleCuestionario('q7_details', e.target.value)} />}</div>
        <div style={questionBlock}><PreguntaClinica id="q8" label="8. Do you live in a damp house?" /></div>
        <div style={questionBlock}><PreguntaClinica id="q9" label="9. Family history of allergies/asthma/eczema?" />{cuestionario.q9 === 'Yes' && <textarea style={detailInput} placeholder="Details..." onChange={e => handleCuestionario('q9_details', e.target.value)} />}</div>
        <div style={questionBlock}><PreguntaClinica id="q10" label="10. Any other medical problems or surgeries?" />{cuestionario.q10 === 'Yes' && <textarea style={detailInput} placeholder="Details..." onChange={e => handleCuestionario('q10_details', e.target.value)} />}</div>

      </div>

      <button onClick={validarYPasarACalculadora} style={calcBtn}>Continuar a Evaluación de Síntomas <ArrowRight /></button>
    </div>
  </div>
)}

        {/* VISTA: CALCULADORA */}
        {view === 'calculadora' && (
          <main style={calculatorLayout}>
            <section style={{ flex: '1', minWidth: '0' }}>
              <button onClick={() => setView('registro_paciente')} style={backBtn}>← Editar antecedentes</button>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{...cardTitle, margin: 0}}><Activity color="#2563eb" /> Evaluación de la Reacción</h3>
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
              {resultado ? <ResultadoCard resultado={resultado} /> : <div style={emptyCard}>Esperando evaluación...</div>}
              <button onClick={reiniciarApp} style={newEvalBtn}>Finalizar y Salir</button>
            </aside>
          </main>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

// --- ESTILOS (Mantenidos y Centrados) ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', alignItems: 'center' };
const optionCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const cardHeading = { color: '#000', fontWeight: '800', margin: '15px 0', fontSize: '1.4rem' };
const avatarStyle = { width: '70px', height: '70px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' };
const startBtn = { padding: '14px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' };
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' };
const inputWrapper = { display: 'flex', flexDirection: 'column' };
const cardTitle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '20px', fontWeight: '800' };
const secHeader = { fontSize: '0.75rem', color: '#2563eb', textTransform: 'uppercase', borderBottom: '1px solid #eee', marginBottom: '15px', paddingBottom: '5px', fontWeight: '800' };
const calcBtn = { width: '100%', padding: '18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' };
const backBtn = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' };
const logoutBtn = { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' };
const emptyCard = { padding: '50px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '20px', backgroundColor: '#fff' };
const newEvalBtn = { width: '100%', marginTop: '10px', padding: '12px', border: '2px solid #2563eb', color: '#2563eb', borderRadius: '12px', background: 'none', fontWeight: 'bold', cursor: 'pointer' };
const searchBar = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', width: '100%' };
const itemPacienteStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0' };
const pacienteBadge = { backgroundColor: '#eff6ff', color: '#2563eb', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' };
const calculatorLayout = { display: 'flex', gap: '30px', alignItems: 'flex-start' };
const asideStyle = { width: '400px', flexShrink: '0', position: 'sticky', top: '20px' };
const questionBlock = {
  padding: '15px',
  backgroundColor: '#fbfcfd',
  borderRadius: '12px',
  border: '1px solid #f1f5f9'
};

const subLabel = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: '#1e293b',
  marginBottom: '10px'
};

const gridQuestions = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px 30px'
};

const detailInput = {
  width: '100%',
  marginTop: '10px',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#fff',
  fontSize: '0.85rem',
  minHeight: '60px',
  resize: 'none'
};

export default App;