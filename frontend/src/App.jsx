import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, ClipboardList, Info, User, LogOut, ArrowRight, Activity, ArrowLeft, ClipboardCheck } from 'lucide-react';

import { SECCIONES_SINTOMAS } from './data/sintomas';
import ResultadoCard from './components/ResultadoCard';
import ChatBot from './components/ChatBot';
import Login from './components/Login';

const App = () => {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [view, setView] = useState('perfil'); 
  
  // Estado completo del paciente
  const [paciente, setPaciente] = useState({ 
    nombre: '', 
    id: '', 
    edad: '', 
    sexo: '', 
    antecedentes: '' 
  });
  
  const [seleccionados, setSeleccionados] = useState({});
  const [resultado, setResultado] = useState(null);

  const handleSelectChange = (grupoId, valor) => {
    setSeleccionados(prev => ({ ...prev, [grupoId]: valor }));
  };

  const reiniciarApp = () => {
    setPaciente({ nombre: '', id: '', edad: '', sexo: '', antecedentes: '' });
    setSeleccionados({});
    setResultado(null);
    setView('perfil');
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (listaIds.length === 0) {
      alert("Por favor, seleccione al menos un síntoma para la evaluación.");
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
        
        {/* PASO 1: PERFIL / BIENVENIDA */}
        {view === 'perfil' && (
          <div style={profileCard}>
            <div style={avatarStyle}><User size={40} color="#2563eb" /></div>
            <h2 style={{ color: '#1e293b', fontWeight: '800', margin: '10px 0' }}>Panel Clínico</h2>
            <p style={{ color: '#475569', marginBottom: '30px' }}>Bienvenido al sistema de evaluación de severidad FASS.</p>
            <button onClick={() => setView('registro_paciente')} style={startBtn}>
              Registrar Nuevo Paciente <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* PASO 2: FORMULARIO DE DATOS DEL PACIENTE */}
        {view === 'registro_paciente' && (
          <div style={{ maxWidth: '800px', margin: '40px auto' }}>
            <button onClick={() => setView('perfil')} style={backBtn}>← Cancelar</button>
            <div style={cardStyle}>
              <h3 style={cardTitle}><ClipboardCheck size={22} color="#2563eb" /> Datos del Paciente</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={inputWrapper}>
                  <label style={labelStyle}>Nombre Completo</label>
                  <input style={inputStyle} value={paciente.nombre} onChange={e => setPaciente({...paciente, nombre: e.target.value})} placeholder="Nombre y Apellidos" />
                </div>
                <div style={inputWrapper}>
                  <label style={labelStyle}>Número de Historia (NHC)</label>
                  <input style={inputStyle} value={paciente.id} onChange={e => setPaciente({...paciente, id: e.target.value})} placeholder="ID Paciente" />
                </div>
                <div style={inputWrapper}>
                  <label style={labelStyle}>Edad</label>
                  <input type="number" style={inputStyle} value={paciente.edad} onChange={e => setPaciente({...paciente, edad: e.target.value})} placeholder="Años" />
                </div>
                <div style={inputWrapper}>
                  <label style={labelStyle}>Sexo Biológico</label>
                  <select style={selectStyle} value={paciente.sexo} onChange={e => setPaciente({...paciente, sexo: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <label style={labelStyle}>Antecedentes Clínicos (Asma, Alergias, etc.)</label>
                <textarea 
                    style={{...inputStyle, height: '80px', resize: 'none'}} 
                    value={paciente.antecedentes}
                    onChange={e => setPaciente({...paciente, antecedentes: e.target.value})}
                    placeholder="Resumen de antecedentes relevantes..."
                />
              </div>
              <button 
                onClick={() => (paciente.nombre && paciente.id) ? setView('calculadora') : alert("Nombre e ID son obligatorios")} 
                style={{...startBtn, width: '100%', marginTop: '30px', justifyContent: 'center'}}
              >
                Continuar a Evaluación de Síntomas <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: CALCULADORA DE SÍNTOMAS */}
        {view === 'calculadora' && (
          <main style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'stretch' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button onClick={() => setView('registro_paciente')} style={backBtn}>← Editar datos del paciente</button>
              
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{...cardTitle, margin: 0}}><Activity size={20} color="#2563eb" /> Síntomas Actuales</h3>
                    <span style={pacienteBadge}>{paciente.nombre} | NHC: {paciente.id}</span>
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
                <button onClick={enviarEvaluacion} style={calcBtn}>Finalizar y Obtener Grado FASS</button>
              </div>
            </section>

            <aside style={{ marginTop: '45px' }}>
              {resultado ? (
                <div>
                  <ResultadoCard resultado={resultado} />
                  <button onClick={reiniciarApp} style={{...logoutBtn, color: '#2563eb', marginTop: '20px', width: '100%', justifyContent: 'center', border: '1px solid #2563eb', padding: '10px', borderRadius: '10px'}}>
                    Nueva Evaluación de Paciente
                  </button>
                </div>
              ) : (
                <div style={emptyCard}>
                  <Info size={40} style={{marginBottom: '15px'}} />
                  <p style={{margin: 0, fontWeight: '600'}}>Esperando datos...</p>
                  <p style={{fontSize: '0.8rem', opacity: 0.7}}>Complete los síntomas para ver el resultado.</p>
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

// --- ESTILOS ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', alignItems: 'center' };
const profileCard = { backgroundColor: '#fff', padding: '50px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', margin: '50px auto', maxWidth: '500px' };
const avatarStyle = { width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' };
const startBtn = { padding: '15px 30px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '10px' };
const cardStyle = { backgroundColor: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const inputWrapper = { display: 'flex', flexDirection: 'column', gap: '8px' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer', outline: 'none' };
const calcBtn = { width: '100%', padding: '20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px' };
const logoutBtn = { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' };
const backBtn = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '15px', fontWeight: '700' };
const cardTitle = { margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: '800' };
const secHeader = { fontSize: '0.8rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: '800', borderBottom: '2px solid #f1f5f9', paddingBottom: '5px', marginBottom: '15px' };
const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '2px' };
const emptyCard = { padding: '80px 40px', textAlign: 'center', color: '#94a3b8', border: '3px dashed #cbd5e1', borderRadius: '28px', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' };
const pacienteBadge = { backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800' };

export default App;