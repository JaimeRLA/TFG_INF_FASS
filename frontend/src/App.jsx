import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, ClipboardList, Info, User, LogOut, ArrowRight, Activity, History, ArrowLeft } from 'lucide-react';

// Componentes
import { SECCIONES_SINTOMAS } from './data/sintomas';
import ResultadoCard from './components/ResultadoCard';
import ChatBot from './components/ChatBot';
import Login from './components/Login';
import Historial from './components/Historial'; // Asegúrate de tener este componente

const App = () => {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [view, setView] = useState('perfil'); 
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
      // Enviamos el usuarioLogueado como query param para que el backend sepa quién es el médico
      const res = await axios.post(`https://tfg-inf-fass.onrender.com/calculate?medico=${usuarioLogueado}`, {
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
      
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartPulse size={30} color="#2563eb" />
          <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0 }}>FASS System</h1>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Dr/a. <strong>{usuarioLogueado}</strong></span>
            <button onClick={() => setUsuarioLogueado(null)} style={logoutBtn}>
              <LogOut size={18} /> Salir
            </button>
        </div>
      </header>

      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* VISTA: PERFIL */}
        {view === 'perfil' && (
          <div style={{ display: 'flex', gap: '30px', marginTop: '40px', justifyContent: 'center' }}>
            <div style={{ ...profileCard, flex: 1, maxWidth: '500px' }}>
              <div style={avatarStyle}><User size={40} color="#2563eb" /></div>
              <h2 style={{ margin: '10px 0', color: '#1e293b', fontWeight: '800' }}>Nueva Evaluación</h2>
              <p style={{ color: '#475569', marginBottom: '30px' }}>Realizar un nuevo cálculo de severidad para un paciente.</p>
              <button onClick={() => setView('calculadora')} style={startBtn}>
                Abrir Calculadora <ArrowRight size={20} />
              </button>
            </div>

            <div style={{ ...profileCard, flex: 1, maxWidth: '500px', border: '1px solid #e2e8f0' }}>
              <div style={{ ...avatarStyle, backgroundColor: '#f0fdf4' }}><History size={40} color="#16a34a" /></div>
              <h2 style={{ margin: '10px 0', color: '#1e293b', fontWeight: '800' }}>Mis Registros</h2>
              <p style={{ color: '#475569', marginBottom: '30px' }}>Consultar el historial de casos registrados por usted.</p>
              <button onClick={() => setView('historial')} style={{ ...startBtn, backgroundColor: '#16a34a' }}>
                Ver mis casos <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* VISTA: HISTORIAL */}
        {view === 'historial' && (
          <div style={{ marginTop: '20px' }}>
             <button onClick={() => setView('perfil')} style={backBtn}><ArrowLeft size={18}/> Volver al perfil</button>
             <Historial usuario={usuarioLogueado} />
          </div>
        )}

        {/* VISTA: CALCULADORA */}
        {view === 'calculadora' && (
          <main style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'stretch' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button onClick={() => setView('perfil')} style={backBtn}><ArrowLeft size={18}/> Volver al perfil</button>
              
              <div style={cardStyle}>
                <h3 style={cardTitle}><User size={18} color="#2563eb" /> Datos del Paciente</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <input placeholder="Nombre" style={inputStyle} onChange={e => setPaciente({...paciente, nombre: e.target.value})} />
                  <input placeholder="ID Historia" style={inputStyle} onChange={e => setPaciente({...paciente, id: e.target.value})} />
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={cardTitle}><Activity size={18} color="#2563eb" /> Evaluación Clínica</h3>
                {SECCIONES_SINTOMAS.map(sec => (
                  <div key={sec.titulo} style={{ marginBottom: '25px' }}>
                    <h4 style={secHeader}>{sec.titulo}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {sec.grupos.map(grupo => (
                        <div key={grupo.id_base}>
                          <label style={labelStyle}>{grupo.label}</label>
                          <select style={selectStyle} onChange={(e) => handleSelectChange(grupo.id_base, e.target.value)}>
                            <option value="">-- No presenta --</option>
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

            <aside style={{ marginTop: '45px' }}>
              {resultado ? <ResultadoCard resultado={resultado} /> : (
                <div style={emptyCard}><Info size={40} /><p>Esperando evaluación...</p></div>
              )}
            </aside>
          </main>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

// Estilos (se mantienen los que tenías, solo ajustamos algunos)
const headerStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', alignItems: 'center' };
const profileCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const avatarStyle = { width: '70px', height: '70px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' };
const startBtn = { padding: '14px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '1rem' };
const backBtn = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' };
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer', outline: 'none' };
const calcBtn = { width: '100%', padding: '18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 15px rgba(37, 99, 235, 0.3)' };
const logoutBtn = { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' };
const cardTitle = { margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: '800' };
const secHeader = { fontSize: '0.8rem', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800', borderBottom: '2px solid #f1f5f9', paddingBottom: '5px', marginBottom: '15px' };
const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' };
const emptyCard = { padding: '80px 40px', textAlign: 'center', color: '#94a3b8', border: '3px dashed #cbd5e1', borderRadius: '28px', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' };

export default App;