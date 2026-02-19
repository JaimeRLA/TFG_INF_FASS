import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HeartPulse, ClipboardList, Info, User, LogOut, 
  ArrowRight, Activity, ArrowLeft, ClipboardCheck, Users, Search 
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
  const [paciente, setPaciente] = useState({ 
    nombre: '', id: '', edad: '', sexo: '', antecedentes: '' 
  });
  const [seleccionados, setSeleccionados] = useState({});
  const [resultado, setResultado] = useState(null);
  
  // Estados para pacientes existentes
  const [listaPacientes, setListaPacientes] = useState([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // --- LÓGICA ---
  const handleSelectChange = (grupoId, valor) => {
    setSeleccionados(prev => ({ ...prev, [grupoId]: valor }));
  };

  const reiniciarApp = () => {
    setPaciente({ nombre: '', id: '', edad: '', sexo: '', antecedentes: '' });
    setSeleccionados({});
    setResultado(null);
    setView('perfil');
  };

  const cargarPacientesExistentes = async () => {
    try {
      const res = await axios.get(`https://tfg-inf-fass.onrender.com/pacientes_unicos?medico=${usuarioLogueado}`);
      setListaPacientes(res.data);
      setView('seleccionar_paciente');
    } catch (err) {
      console.error("Error cargando pacientes", err);
      alert("No se pudo cargar la lista de pacientes.");
    }
  };

  const seleccionarPaciente = (p) => {
    setPaciente({
      nombre: p.nombre,
      id: p.id,
      edad: p.edad,
      sexo: p.sexo,
      antecedentes: p.antecedentes
    });
    setResultado(null); // Limpiar resultados previos
    setSeleccionados({}); // Limpiar síntomas previos
    setView('calculadora');
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (listaIds.length === 0) {
      alert("Por favor, seleccione al menos un síntoma.");
      return;
    }
    try {
      const res = await axios.post('https://tfg-inf-fass.onrender.com/calculate', {
        ...paciente,
        sintomas: listaIds,
        medico: usuarioLogueado
      });
      setResultado(res.data);
    } catch (err) { console.error("Error al calcular:", err); }
  };

  const pacientesFiltrados = listaPacientes.filter(p => 
    p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
    p.id.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  if (!usuarioLogueado) {
    return <Login onLoginSuccess={(nombre) => setUsuarioLogueado(nombre)} />;
  }

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: '"Inter", sans-serif' }}>
      
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartPulse size={30} color="#2563eb" />
          <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0, fontWeight: '800' }}>FASS System</h1>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Dr/a. <strong>{usuarioLogueado}</strong></span>
          <button onClick={() => setUsuarioLogueado(null)} style={logoutBtn}>
            <LogOut size={18} /> Salir
          </button>
        </div>
      </header>

      <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* VISTA: PERFIL (Doble Opción) */}
        {view === 'perfil' && (
          <div style={{ display: 'flex', gap: '30px', marginTop: '60px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={optionCard}>
              <div style={avatarStyle}><User size={40} color="#2563eb" /></div>
              <h2 style={cardHeading}>Nuevo Paciente</h2>
              <p style={cardSubtext}>Registrar datos demográficos y clínicos desde cero.</p>
              <button onClick={() => { setPaciente({nombre:'', id:'', edad:'', sexo:'', antecedentes:''}); setView('registro_paciente'); }} style={startBtn}>
                Crear Ficha <ArrowRight size={20} />
              </button>
            </div>

            <div style={{ ...optionCard, border: '1px solid #e2e8f0' }}>
              <div style={{ ...avatarStyle, backgroundColor: '#f0fdf4' }}><Users size={40} color="#16a34a" /></div>
              <h2 style={cardHeading}>Paciente Existente</h2>
              <p style={cardSubtext}>Recuperar datos de un paciente ya registrado en el sistema.</p>
              <button onClick={cargarPacientesExistentes} style={{ ...startBtn, backgroundColor: '#16a34a' }}>
                Buscar en Lista <Search size={20} />
              </button>
            </div>
          </div>
        )}

        {/* VISTA: SELECCIONAR PACIENTE */}
        {view === 'seleccionar_paciente' && (
          <div style={{ maxWidth: '800px', margin: '40px auto' }}>
            <button onClick={() => setView('perfil')} style={backBtn}>← Volver al panel</button>
            <div style={cardStyle}>
              <h3 style={cardTitle}><Users size={22} color="#2563eb" /> Directorio de Pacientes</h3>
              <div style={searchBar}>
                <Search size={20} color="#94a3b8" />
                <input 
                  style={searchInput} 
                  placeholder="Buscar por nombre o NHC..." 
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                {pacientesFiltrados.length === 0 ? (
                  <div style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No se encontraron pacientes.</div>
                ) : (
                  pacientesFiltrados.map((p) => (
                    <div key={p.id} onClick={() => seleccionarPaciente(p)} style={itemPacienteStyle}>
                      <div>
                        <div style={{ fontWeight: '800', color: '#1e293b' }}>{p.nombre}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NHC: {p.id} | {p.sexo} | {p.edad} años</div>
                      </div>
                      <ArrowRight size={20} color="#2563eb" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VISTA: REGISTRO NUEVO PACIENTE */}
        {view === 'registro_paciente' && (
          <div style={{ maxWidth: '800px', margin: '40px auto' }}>
            <button onClick={() => setView('perfil')} style={backBtn}>← Cancelar</button>
            <div style={cardStyle}>
              <h3 style={cardTitle}><ClipboardCheck size={22} color="#2563eb" /> Nueva Ficha Clínica</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={inputWrapper}><label style={labelStyle}>Nombre Completo</label><input style={inputStyle} value={paciente.nombre} onChange={e => setPaciente({...paciente, nombre: e.target.value})} placeholder="Nombre" /></div>
                <div style={inputWrapper}><label style={labelStyle}>NHC / ID</label><input style={inputStyle} value={paciente.id} onChange={e => setPaciente({...paciente, id: e.target.value})} placeholder="ID Único" /></div>
                <div style={inputWrapper}><label style={labelStyle}>Edad</label><input type="number" style={inputStyle} value={paciente.edad} onChange={e => setPaciente({...paciente, edad: e.target.value})} /></div>
                <div style={inputWrapper}><label style={labelStyle}>Sexo</label>
                  <select style={selectStyle} value={paciente.sexo} onChange={e => setPaciente({...paciente, sexo: e.target.value})}>
                    <option value="">Seleccionar...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}><label style={labelStyle}>Antecedentes</label><textarea style={{...inputStyle, height: '80px', resize: 'none'}} value={paciente.antecedentes} onChange={e => setPaciente({...paciente, antecedentes: e.target.value})} /></div>
              <button onClick={() => (paciente.nombre && paciente.id) ? setView('calculadora') : alert("Nombre e ID obligatorios")} style={{...startBtn, width: '100%', marginTop: '30px', justifyContent: 'center'}}>Continuar a Síntomas <ArrowRight size={20} /></button>
            </div>
          </div>
        )}

        {/* VISTA: CALCULADORA */}
        {view === 'calculadora' && (
          <main style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'stretch' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
              <button onClick={() => setView('perfil')} style={backBtn}>← Cambiar paciente</button>
              <div style={{...cardStyle, width: '100%'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{...cardTitle, margin: 0}}><Activity size={20} color="#2563eb" /> Evaluación</h3>
                    <span style={pacienteBadge}>{paciente.nombre} (NHC: {paciente.id})</span>
                </div>
                {SECCIONES_SINTOMAS.map(sec => (
                  <div key={sec.titulo} style={{ marginBottom: '30px' }}>
                    <h4 style={secHeader}>{sec.titulo}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {sec.grupos.map(grupo => (
                        <div key={grupo.id_base}>
                          <label style={labelStyle}>{grupo.label}</label>
                          <select style={selectStyle} onChange={(e) => handleSelectChange(grupo.id_base, e.target.value)}>
                            <option value="">-- Sin síntomas --</option>
                            {grupo.options.map(opt => <option key={opt.id} value={opt.id} style={{color: '#000'}}>{opt.text}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={enviarEvaluacion} style={calcBtn}>Calcular Grado FASS</button>
              </div>
            </section>

            <aside style={{ marginTop: '35px', position: 'sticky', top: '20px', height: 'fit-content' }}>
              {resultado ? (
                <div>
                  <ResultadoCard resultado={resultado} />
                  <button onClick={reiniciarApp} style={newEvalBtn}>Nueva Evaluación</button>
                </div>
              ) : (
                <div style={emptyCard}>
                  <Info size={40} style={{marginBottom: '15px'}} />
                  <p style={{margin: 0, fontWeight: '600'}}>Esperando síntomas...</p>
                </div>
              )}
            </aside>
          </main>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

// --- ESTILOS MEJORADOS ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', alignItems: 'center' };
const optionCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '350px' };
const avatarStyle = { width: '70px', height: '70px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' };
const cardHeading = { color: '#1e293b', fontWeight: '800', margin: '10px 0', fontSize: '1.4rem' };
const cardSubtext = { color: '#64748b', marginBottom: '30px', fontSize: '0.95rem', lineHeight: '1.5' };
const startBtn = { padding: '14px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '10px' };
const cardStyle = { backgroundColor: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer', outline: 'none' };
const calcBtn = { width: '100%', padding: '18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px' };
const backBtn = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '10px', fontWeight: '700', padding: '0', textAlign: 'left', alignSelf: 'flex-start' };
const logoutBtn = { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' };
const cardTitle = { margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: '800' };
const secHeader = { fontSize: '0.8rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: '800', borderBottom: '2px solid #f1f5f9', paddingBottom: '5px', marginBottom: '15px' };
const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '2px' };
const emptyCard = { padding: '40px 20px', textAlign: 'center', color: '#94a3b8', border: '3px dashed #cbd5e1', borderRadius: '28px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '200px' };
const pacienteBadge = { backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800' };
const searchBar = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '12px 20px', borderRadius: '14px', border: '2px solid #e2e8f0', marginTop: '10px' };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1rem', color: '#1e293b' };
const itemPacienteStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 25px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer', transition: '0.2s' };
const inputWrapper = { display: 'flex', flexDirection: 'column', gap: '8px' };
const newEvalBtn = { color: '#2563eb', marginTop: '20px', width: '100%', background: 'none', border: '2px solid #2563eb', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };

export default App;