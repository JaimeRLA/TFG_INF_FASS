import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HeartPulse, Info, User, LogOut, ArrowRight, Activity, 
  ArrowLeft, ClipboardCheck, Users, Search, ClipboardList, Trash2
} from 'lucide-react';

import { styles } from './AppStyles.js'; 

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
  const [editandoId, setEditandoId] = useState(null);
  
  const [paciente, setPaciente] = useState({ 
    id: '', fecha_nacimiento: '', genero: '' 
  });

  const [cuestionario, setCuestionario] = useState({});
  const [seleccionados, setSeleccionados] = useState({});
  
  const [evento, setEvento] = useState({
    reaccion_fecha: '', trigger_food: '', trigger_insect: '', trigger_drug: '', 
    duration: '', location: '', activity: '', adrenaline: '', 
    other_treatment_yn: '', other_treatment_details: '', ambulance: '', other_info: '',
    drug_reason: '', drug_form: '', drug_other: '', drug_onset: '', drug_tolerance: '', drug_details_extra: ''
  });

  // --- LÓGICA ---
  const handleEvento = (campo, valor) => {
    setEvento(prev => ({ ...prev, [campo]: valor }));
  };

  const handleCuestionario = (pregunta, valor) => {
    setCuestionario(prev => ({ ...prev, [pregunta]: valor }));
  };

  const handleSelectChange = (grupoId, valor) => {
    setSeleccionados(prev => ({ ...prev, [grupoId]: valor }));
  };

  const reiniciarApp = () => {
    setEditandoId(null);
    setPaciente({ id: '', fecha_nacimiento: '', genero: '' });
    setCuestionario({});
    setSeleccionados({});
    setEvento({
      reaccion_fecha: '', trigger_food: '', trigger_insect: '', trigger_drug: '', 
      duration: '', location: '', activity: '', adrenaline: '', 
      other_treatment_yn: '', other_treatment_details: '', ambulance: '', other_info: '',
      drug_reason: '', drug_form: '', drug_other: '', drug_onset: '', drug_tolerance: '', drug_details_extra: ''
    });
    setResultado(null);
    setView('perfil');
  };

  const cargarHistorial = async () => {
    try {
      const res = await axios.get('https://tfg-inf-fass.onrender.com/history');
      setListaPacientes(res.data);
      setView('historial_global');
    } catch (err) { alert("Error al cargar el historial."); }
  };

  const cargarPacientesExistentes = async () => {
    try {
      const res = await axios.get(`https://tfg-inf-fass.onrender.com/pacientes_unicos?medico=${usuarioLogueado}`);
      setListaPacientes(res.data);
      setView('seleccionar_paciente');
    } catch (err) { alert("Error al conectar con la base de datos."); }
  };

  const seleccionarPacienteExistente = (p) => {
    setEditandoId(p.id || null);
    setPaciente({
      id: p.nhc || p.id || '', 
      fecha_nacimiento: p.fecha_nacimiento || '',
      genero: p.genero || ''
    });
    setResultado(null);
    setView('event_record'); 
  };

  const eliminarEvaluacion = async (id_db) => {
    if (!id_db) {
      alert("Error: No se pudo encontrar el ID del registro.");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.")) return;
    try {
      const res = await axios.delete(`https://tfg-inf-fass.onrender.com/evaluacion/${id_db}`);
      if (res.data.success || res.status === 200) {
        alert("Registro eliminado correctamente.");
        const resHistory = await axios.get('https://tfg-inf-fass.onrender.com/history');
        setListaPacientes(resHistory.data);
      } else {
        alert("El servidor no pudo eliminar el registro: " + res.data.message);
      }
    } catch (err) {
      console.error("Error al borrar:", err);
      alert("Error de conexión al intentar eliminar.");
    }
  };

  const validarYPasarAEvento = async () => {
    if (!paciente.id || !paciente.fecha_nacimiento || !paciente.genero) {
      alert("NHC, Fecha de Nacimiento y Género son obligatorios.");
      return;
    }
    setView('event_record');
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (!paciente.id) return alert("Error: Falta ID del paciente.");
    try {
      const res = await axios.post('https://tfg-inf-fass.onrender.com/calculate', {
        id: editandoId,
        paciente_id: paciente.id,
        fecha_nacimiento: paciente.fecha_nacimiento,
        genero: paciente.genero,
        respuestas: cuestionario,
        evento: evento,
        sintomas: listaIds,
        medico: usuarioLogueado
      });
      if (res.data.success === false) {
        alert(res.data.message);
      } else {
        setResultado(res.data);
      }
    } catch (err) { 
      console.error("Error en la petición:", err);
      alert("Error en el cálculo. Verifique la conexión con el servidor."); 
    }
  };

  const descargarPaciente = (p) => {
    const encabezados = "NHC,Fecha_Nac,Genero,nFASS,oFASS,Risk,Fecha_Evaluacion\n";
    const fila = `${p.nhc},${p.fecha_nacimiento},${p.genero},${p.nfass},${p.ofass_grade},${p.risk_level},${p.fecha}\n`;
    const blob = new Blob([encabezados + fila], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `NHC_${p.nhc}_evaluacion.csv`);
    a.click();
  };

  const pacientesFiltrados = listaPacientes.filter(p => 
    p.id && p.id.toString().toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  if (!usuarioLogueado) return <Login onLoginSuccess={setUsuarioLogueado} />;

  const PreguntaClinica = ({ id, label }) => (
    <div style={styles.rowYesNo}>
      <span style={styles.subLabelNormal}>{label}</span>
      <div style={{ display: 'flex', gap: '5px' }}>
        {['Yes', 'No'].map(op => (
          <button 
            key={op}
            onClick={() => handleCuestionario(id, op)}
            style={cuestionario[id] === op ? styles.btnMiniActive : styles.btnMini}
          >{op}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: '"Inter", sans-serif' }}>
      <header style={styles.headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartPulse size={30} color="#2563eb" />
          <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0, fontWeight: '800' }}>FASS System</h1>
        </div>
        <button onClick={() => setUsuarioLogueado(null)} style={styles.logoutBtn}><LogOut size={18} /> Salir</button>
      </header>

      <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto' }}>
        
        {view === 'perfil' && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginTop: '60px' }}>
             <div style={styles.optionCard}>
               <div style={styles.avatarStyle}><User size={40} color="#2563eb" /></div>
               <h2 style={styles.cardHeading}>Nuevo Registro</h2>
               <p style={{color:'#64748b', marginBottom:'20px', fontSize: '0.9rem'}}>Inscribir un paciente por primera vez y sus antecedentes.</p>
               <button onClick={() => setView('registro_paciente')} style={styles.startBtn}>Empezar</button>
             </div>
             <div style={styles.optionCard}>
               <div style={{...styles.avatarStyle, backgroundColor:'#f0fdf4'}}><Users size={40} color="#16a34a" /></div>
               <h2 style={styles.cardHeading}>Nueva Evaluación</h2>
               <p style={{color:'#64748b', marginBottom:'20px', fontSize: '0.9rem'}}>Registrar un nuevo evento para un paciente ya existente.</p>
               <button onClick={cargarPacientesExistentes} style={{...styles.startBtn, backgroundColor: '#16a34a'}}>Buscar NHC</button>
             </div>
             <div style={styles.optionCard}>
               <div style={{...styles.avatarStyle, backgroundColor:'#fff7ed'}}><ClipboardList size={40} color="#ea580c" /></div>
               <h2 style={styles.cardHeading}>Historial Completo</h2>
               <p style={{color:'#64748b', marginBottom:'20px', fontSize: '0.9rem'}}>Ver reportes anteriores, modificarlos o descargarlos.</p>
               <button onClick={cargarHistorial} style={{...styles.startBtn, backgroundColor: '#ea580c'}}>Ver Registros</button>
             </div>
           </div>
        )}

        {view === 'historial_global' && (
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <button onClick={() => setView('perfil')} style={styles.backBtn}>← Volver</button>
            <div style={styles.cardStyle}>
              <h3 style={styles.cardTitle}><ClipboardList color="#ea580c" /> Historial de Evaluaciones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {listaPacientes.map((p, index) => (
                  <div key={index} style={styles.itemPacienteStyle}>
                    <div style={{ flex: 1 }}>
                      <strong style={{color: '#1e293b'}}>NHC: {p.nhc}</strong>
                      <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Eval: {new Date(p.fecha).toLocaleDateString()} | nFASS: {p.nfass} | oFASS: {p.ofass_grade}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => seleccionarPacienteExistente(p)} style={styles.actionBtnGray}>Editar</button>
                      <button onClick={() => descargarPaciente(p)} style={styles.actionBtnBlue}>CSV</button>
                      <button onClick={() => eliminarEvaluacion(p.id)} style={styles.actionBtnRed} title="Eliminar Registro">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'seleccionar_paciente' && (
        <div style={{ maxWidth: '800px', margin: '40px auto' }}>
          <button onClick={() => setView('perfil')} style={styles.backBtn}>← Volver</button>
          <div style={styles.cardStyle}>
            <h3 style={styles.cardTitle}><Users size={22} color="#2563eb" /> Buscar Paciente</h3>
            <div style={styles.searchBar}>
              <Search size={20} color="#94a3b8" />
              <input style={styles.searchInput} placeholder="Escriba el NHC..." onChange={(e) => setFiltroBusqueda(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              {pacientesFiltrados.map(p => (
                <div key={p.id} onClick={() => seleccionarPacienteExistente(p)} style={styles.itemPacienteStyle}>
                  <strong style={{color: '#1e293b'}}>NHC: {p.id}</strong>
                  <span style={{color: '#64748b'}}>{p.genero} | Nacimiento: {p.fecha_nacimiento}</span>
                  <ArrowRight size={18} color="#2563eb" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

        {view === 'registro_paciente' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={() => setView('perfil')} style={styles.backBtn}>← Cancelar</button>
            <div style={styles.cardStyle}>
              <h3 style={styles.cardTitle}><ClipboardCheck color="#2563eb" /> Antecedentes del Paciente</h3>
              <div style={{ marginBottom: '30px' }}>
                <h4 style={styles.secHeader}>1. Identificación Básica</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', alignItems: 'end' }}>
                  <div style={styles.inputWrapper}><label style={styles.labelStyle}>NHC / ID</label><input style={styles.inputStyle} value={paciente.id} onChange={e => setPaciente({...paciente, id: e.target.value})} placeholder="Ej: 123456" /></div>
                  <div style={styles.inputWrapper}><label style={styles.labelStyle}>Fecha Nacimiento</label><input type="date" style={styles.inputStyle} value={paciente.fecha_nacimiento} onChange={e => setPaciente({...paciente, fecha_nacimiento: e.target.value})} /></div>
                  <div style={styles.inputWrapper}><label style={styles.labelStyle}>Género</label>
                    <select style={styles.selectStyle} value={paciente.genero} onChange={e => setPaciente({...paciente, genero: e.target.value})} >
                      <option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={styles.questionBlock}><PreguntaClinica id="q1" label="1. Do you have any confirmed allergies?" />{cuestionario.q1 === 'Yes' && <textarea style={styles.detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q1_details', e.target.value)} />}</div>
                <div style={styles.questionBlock}>
                  <h4 style={styles.subLabel}>2. Do you have suspected allergies to:</h4>
                  <div style={styles.gridQuestions}><PreguntaClinica id="q2_foods" label="• Foods?" /><PreguntaClinica id="q2_insects" label="• Insects or ticks (stings or bites)?" /><PreguntaClinica id="q2_meds" label="• Medications (drugs)?" /><PreguntaClinica id="q2_other" label="• Other?" /></div>
                  {(cuestionario.q2_foods === 'Yes' || cuestionario.q2_insects === 'Yes' || cuestionario.q2_meds === 'Yes' || cuestionario.q2_other === 'Yes') && <textarea style={styles.detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q2_details', e.target.value)} />}
                </div>
                <div style={styles.questionBlock}>
                  <h4 style={styles.subLabel}>3. Are you taking any of the following allergy or asthma medications:</h4>
                  <div style={styles.gridQuestions}><PreguntaClinica id="q3_anti" label="• Antihistamines?" /><PreguntaClinica id="q3_eyes" label="• Eyedrops?" /><PreguntaClinica id="q3_nasal" label="• Nasal sprays?" /><PreguntaClinica id="q3_puff" label="• Asthma puffers?" /><PreguntaClinica id="q3_cream" label="• Eczema creams?" /></div>
                  {(cuestionario.q3_anti === 'Yes' || cuestionario.q3_eyes === 'Yes' || cuestionario.q3_nasal === 'Yes' || cuestionario.q3_puff === 'Yes' || cuestionario.q3_cream === 'Yes') && <textarea style={styles.detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q3_details', e.target.value)} />}
                </div>
                <div style={styles.gridQuestions}><div style={styles.questionBlock}><PreguntaClinica id="q4" label="4. Prescribed adrenaline (epinephrine) device?" /></div><div style={styles.questionBlock}><PreguntaClinica id="q5" label="5. Taking other medications or supplements?" />{cuestionario.q5 === 'Yes' && <textarea style={styles.detailInput} placeholder="Provide details..." onChange={e => handleCuestionario('q5_details', e.target.value)} />}</div></div>
                <div style={styles.questionBlock}>
                  <h4 style={styles.subLabel}>6. Do you have any of the following:</h4>
                  <div style={styles.gridQuestions}><PreguntaClinica id="q6_rhin" label="• Allergic rhinitis (hay fever)?" /><PreguntaClinica id="q6_asth" label="• Asthma?" /><PreguntaClinica id="q6_ecze" label="• Eczema?" /><PreguntaClinica id="q6_hive" label="• Hives?" /><PreguntaClinica id="q6_head" label="• Regular headaches?" /><PreguntaClinica id="q6_sinu" label="• Sinus problems?" /><PreguntaClinica id="q6_mouth" label="• Itchy mouth after raw fruit/veg?" /></div>
                  {['q6_rhin', 'q6_asth', 'q6_ecze', 'q6_hive', 'q6_head', 'q6_sinu', 'q6_mouth'].some(k => cuestionario[k] === 'Yes') && <textarea style={styles.detailInput} placeholder="Please provide details..." onChange={e => handleCuestionario('q6_details', e.target.value)} />}
                </div>
                <div style={styles.questionBlock}><PreguntaClinica id="q7" label="7. Do you live in a house with indoor pets?" />{cuestionario.q7 === 'Yes' && <textarea style={styles.detailInput} placeholder="Details..." onChange={e => handleCuestionario('q7_details', e.target.value)} />}</div>
                <div style={styles.questionBlock}><PreguntaClinica id="q8" label="8. Do you live in a damp house?" /></div>
                <div style={styles.questionBlock}><PreguntaClinica id="q9" label="9. Family history of allergies/asthma/eczema?" />{cuestionario.q9 === 'Yes' && <textarea style={styles.detailInput} placeholder="Details..." onChange={e => handleCuestionario('q9_details', e.target.value)} />}</div>
                <div style={styles.questionBlock}><PreguntaClinica id="q10" label="10. Any other medical problems or surgeries?" />{cuestionario.q10 === 'Yes' && <textarea style={styles.detailInput} placeholder="Details..." onChange={e => handleCuestionario('q10_details', e.target.value)} />}</div>
              </div>
              <button onClick={validarYPasarAEvento} style={styles.calcBtn}>Continuar a Event Record <ArrowRight /></button>
            </div>
          </div>
        )}

        {view === 'event_record' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={() => setView('registro_paciente')} style={styles.backBtn}>← Volver a Antecedentes</button>
            <div style={styles.cardStyle}>
              <h3 style={styles.cardTitle}><Activity color="#ef4444" /> Event Record (Reaction Details)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={styles.inputWrapper}><label style={styles.labelStyle}>Date and time of reaction:</label><input type="datetime-local" style={styles.inputStyle} onChange={e => handleEvento('reaccion_fecha', e.target.value)} /></div>
                <div style={styles.inputWrapper}><label style={styles.labelStyle}>Duration of symptoms:</label><input style={styles.inputStyle} placeholder="e.g. 30 mins, 2 hours" onChange={e => handleEvento('duration', e.target.value)} /></div>
              </div>
              <h4 style={styles.secHeader}>Suspected Triggers</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={styles.inputWrapper}><label style={styles.labelStyle}>Food/s:</label><input style={styles.inputStyle} onChange={e => handleEvento('trigger_food', e.target.value)} placeholder="Suspected Food Name" /></div>
                <div style={styles.inputWrapper}><label style={styles.labelStyle}>Insects or Ticks:</label><input style={styles.inputStyle} onChange={e => handleEvento('trigger_insect', e.target.value)} placeholder="Suspected Insect Name" /></div>
                <div style={styles.inputWrapper}><label style={styles.labelStyle}>Drug/s (Medication):</label><input style={styles.inputStyle} value={evento.trigger_drug} onChange={e => handleEvento('trigger_drug', e.target.value)} placeholder="Suspected Drug Name" /></div>
              </div>
              {evento.trigger_drug && (
                <div style={{...styles.questionBlock, borderLeft: '5px solid #2563eb', marginBottom: '20px'}}>
                  <h4 style={styles.subLabel}>Drug Allergy Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={styles.inputWrapper}><label style={styles.labelStyle}>Reason why drug was prescribed:</label><input style={styles.inputStyle} onChange={e => handleEvento('drug_reason', e.target.value)} /></div>
                    <div style={styles.inputWrapper}><label style={styles.labelStyle}>Form (capsule, tablet, liquid, IV):</label><input style={styles.inputStyle} onChange={e => handleEvento('drug_form', e.target.value)} /></div>
                    <div style={styles.inputWrapper}><label style={styles.labelStyle}>Other drugs taken at the time:</label><input style={styles.inputStyle} onChange={e => handleEvento('drug_other', e.target.value)} /></div>
                    <div style={styles.inputWrapper}>
                      <label style={styles.labelStyle}>Time of onset:</label>
                      <select style={styles.selectStyle} onChange={e => handleEvento('drug_onset', e.target.value)}>
                        <option value="">Select...</option><option value="within 1-2 hours">within 1-2 hours</option><option value="after 2 hours">after 2 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              <h4 style={styles.secHeader}>Environment & Activity</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={styles.inputWrapper}><label style={styles.labelStyle}>Location of reaction:</label><select style={styles.selectStyle} onChange={e => handleEvento('location', e.target.value)}><option value="">Select...</option><option value="Home">Home</option><option value="School">School</option><option value="Care Services">Childrens Education/Care Services</option><option value="Work">Work</option><option value="Dining out">Dining out</option><option value="Other">Other</option></select></div>
                <div style={styles.inputWrapper}><label style={styles.labelStyle}>Activity immediately before:</label><select style={styles.selectStyle} onChange={e => handleEvento('activity', e.target.value)}><option value="">Select...</option><option value="Eating">Eating</option><option value="Gardening">Gardening</option><option value="Exercise">Exercise</option><option value="Other">Other</option></select></div>
              </div>
              <h4 style={styles.secHeader}>Management & Treatment</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={styles.rowYesNo}><span style={styles.subLabelNormal}>Was adrenaline administered?</span><div style={{display:'flex',gap:'5px'}}>{['Yes', 'No'].map(op => (<button key={op} onClick={() => handleEvento('adrenaline', op)} style={evento.adrenaline === op ? styles.btnMiniActive : styles.btnMini}>{op}</button>))}</div></div>
                <div style={styles.rowYesNo}><span style={styles.subLabelNormal}>Was any other treatment given?</span><div style={{display:'flex',gap:'5px'}}>{['Yes', 'No'].map(op => (<button key={op} onClick={() => handleEvento('other_treatment_yn', op)} style={evento.other_treatment_yn === op ? styles.btnMiniActive : styles.btnMini}>{op}</button>))}</div></div>
                {evento.other_treatment_yn === 'Yes' && <textarea style={styles.detailInput} placeholder="Provide details..." onChange={e => handleEvento('other_treatment_details', e.target.value)} />}
                <div style={styles.rowYesNo}><span style={styles.subLabelNormal}>Was an ambulance called?</span><div style={{display:'flex',gap:'5px'}}>{['Yes', 'No'].map(op => (<button key={op} onClick={() => handleEvento('ambulance', op)} style={evento.ambulance === op ? styles.btnMiniActive : styles.btnMini}>{op}</button>))}</div></div>
              </div>
              <button onClick={() => setView('calculadora')} style={styles.calcBtn}>Continuar a Síntomas <ArrowRight /></button>
            </div>
          </div>
        )}

        {view === 'calculadora' && (
          <main style={styles.calculatorLayout}>
            <section style={{ flex: '1', minWidth: '0' }}>
              <button onClick={() => setView('event_record')} style={styles.backBtn}>← Volver a Event Record</button>
              <div style={styles.cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{...styles.cardTitle, margin: 0}}><Activity color="#2563eb" /> Evaluación de la Reacción</h3>
                    <span style={styles.pacienteBadgeStyle}>NHC: {paciente.id}</span>
                </div>
                {SECCIONES_SINTOMAS.map(sec => (
                  <div key={sec.titulo} style={{ marginBottom: '25px' }}>
                    <h4 style={styles.secHeader}>{sec.titulo}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {sec.grupos.map(grupo => (
                        <div key={grupo.id_base}>
                          <label style={styles.labelStyle}>{grupo.label}</label>
                          <select style={styles.selectStyle} onChange={(e) => handleSelectChange(grupo.id_base, e.target.value)}>
                            <option value="">-- No --</option>
                            {grupo.options.map(opt => <option key={opt.id} value={opt.id}>{opt.text}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={enviarEvaluacion} style={styles.calcBtn}>Calcular Gravedad nFASS</button>
              </div>
            </section>
            <aside style={styles.asideStyle}>
              {resultado ? <ResultadoCard resultado={resultado} /> : <div style={styles.emptyCard}>Esperando evaluación...</div>}
              <button onClick={reiniciarApp} style={styles.newEvalBtn}>Finalizar y Salir</button>
            </aside>
          </main>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

export default App;