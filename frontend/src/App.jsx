import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, ClipboardList, Info, User, LogOut, ArrowRight, Activity } from 'lucide-react';

// Componentes
import { SECCIONES_SINTOMAS } from './data/sintomas';
import ResultadoCard from './components/ResultadoCard';
import ChatBot from './components/ChatBot';
import Login from './components/Login';

const App = () => {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [view, setView] = useState('perfil'); // Vistas: 'perfil' o 'calculadora'
  const [paciente, setPaciente] = useState({ nombre: '', id: '' });
  const [seleccionados, setSeleccionados] = useState({});
  const [resultado, setResultado] = useState(null);

  const handleSelectChange = (grupoId, valor) => {
    setSeleccionados(prev => ({ ...prev, [grupoId]: valor }));
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (!paciente.nombre || !paciente.id || listaIds.length === 0) {
      alert("Complete los datos del paciente y síntomas.");
      return;
    }
    try {
      const res = await axios.post('https://tfg-inf-fass.onrender.com/calculate', {
        nombre: paciente.nombre,
        paciente_id: paciente.id,
        sintomas: listaIds
      });
      setResultado(res.data);
    } catch (err) { console.error(err); }
  };

  if (!usuarioLogueado) {
    return <Login onLoginSuccess={(nombre) => setUsuarioLogueado(nombre)} />;
  }

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: '"Inter", sans-serif' }}>
      
      {/* HEADER SIMPLE */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartPulse size={30} color="#2563eb" />
          <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0 }}>FASS System</h1>
        </div>
        <button onClick={() => setUsuarioLogueado(null)} style={logoutBtn}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </header>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* VISTA 1: PERFIL DEL USUARIO REGISTRADO */}
        {view === 'perfil' && (
          <div style={profileCard}>
            <div style={avatarStyle}><User size={40} color="#2563eb" /></div>
            <h2 style={{ margin: '10px 0' }}>Bienvenido, Dr/a. {usuarioLogueado}</h2>
            <p style={{ color: '#000000', marginBottom: '30px' }}>Su cuenta está activa y autorizada para el uso de la calculadora de severidad FASS.</p>
            
            <button onClick={() => setView('calculadora')} style={startBtn}>
              Acceder a la Calculadora Clínica <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* VISTA 2: CALCULADORA */}
        {view === 'calculadora' && (
          <main style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '25px' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button onClick={() => setView('perfil')} style={backBtn}>← Volver a mi perfil</button>
              
              <div style={cardStyle}>
                <h3 style={cardTitle}><User size={18} /> Datos del Paciente</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <input placeholder="Nombre" style={inputStyle} onChange={e => setPaciente({...paciente, nombre: e.target.value})} />
                  <input placeholder="ID Historia" style={inputStyle} onChange={e => setPaciente({...paciente, id: e.target.value})} />
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={cardTitle}><Activity size={18} /> Evaluación</h3>
                {SECCIONES_SINTOMAS.map(sec => (
                  <div key={sec.titulo} style={{ marginBottom: '20px' }}>
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
                <button onClick={enviarEvaluacion} style={calcBtn}>Calcular Grado FASS</button>
              </div>
            </section>

            <aside>
              {resultado ? <ResultadoCard resultado={resultado} /> : (
                <div style={emptyCard}><Info size={40} /><p>Inicie una evaluación</p></div>
              )}
            </aside>
          </main>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

// --- ESTILOS ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' };
const profileCard = { backgroundColor: '#fff', padding: '50px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginTop: '50px' };
const avatarStyle = { width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' };
const startBtn = { padding: '15px 30px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '1rem' };
const cardStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '18px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#000' };
const selectStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#000' };
const calcBtn = { width: '100%', padding: '15px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const logoutBtn = { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' };
const backBtn = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '10px', textAlign: 'left' };
const cardTitle = { margin: '0 0 15px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' };
const secHeader = { fontSize: '0.8rem', color: '#2563eb', textTransform: 'uppercase', marginBottom: '10px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '5px' };
const emptyCard = { padding: '50px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '20px' };

export default App;