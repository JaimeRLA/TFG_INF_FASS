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
            
            {/* Color forzado a #1e293b (Azul muy oscuro/negro) */}
            <h2 style={{ margin: '10px 0', color: '#1e293b', fontWeight: '800' }}>
              Bienvenido, Dr/a. {usuarioLogueado}
            </h2>
            
            <p style={{ color: '#475569', marginBottom: '30px', fontSize: '1.1rem' }}>
              Su cuenta está activa y autorizada para el uso de la calculadora de severidad FASS.
            </p>
            
            <button onClick={() => setView('calculadora')} style={startBtn}>
              Acceder a la Calculadora Clínica <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* VISTA 2: CALCULADORA */}
        {view === 'calculadora' && (
        <main style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1fr', // Proporción más equilibrada y ancha
          gap: '30px', 
          width: '100%',
          maxWidth: '1400px', // Limita el ancho máximo para que no se estire infinito
          margin: '0 auto',
          alignItems: 'stretch' // Fuerza a que empiecen a la misma altura
        }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button onClick={() => setView('perfil')} style={backBtn}>← Volver a mi perfil</button>
            
            {/* CARD: DATOS DEL PACIENTE */}
            <div style={cardStyle}>
              <h3 style={cardTitle}><User size={20} color="#2563eb" /> Datos del Paciente</h3>
              <div style={{ display: 'flex', gap: '20px' }}>
                <input 
                  placeholder="Nombre del Paciente" 
                  style={inputStyle} 
                  onChange={e => setPaciente({...paciente, nombre: e.target.value})} 
                />
                <input 
                  placeholder="ID Historia Clínica" 
                  style={inputStyle} 
                  onChange={e => setPaciente({...paciente, id: e.target.value})} 
                />
              </div>
            </div>

            {/* CARD: SÍNTOMAS */}
            <div style={cardStyle}>
              <h3 style={cardTitle}><Activity size={20} color="#2563eb" /> Evaluación Clínica</h3>
              {SECCIONES_SINTOMAS.map(sec => (
                <div key={sec.titulo} style={{ marginBottom: '30px' }}>
                  <h4 style={secHeader}>{sec.titulo}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {sec.grupos.map(grupo => (
                      <div key={grupo.id_base}>
                        <label style={labelStyle}>{grupo.label}</label>
                        <select 
                          style={selectStyle} 
                          onChange={(e) => handleSelectChange(grupo.id_base, e.target.value)}
                        >
                          <option value="">-- No presenta --</option>
                          {grupo.options.map(opt => (
                            <option key={opt.id} value={opt.id} style={{color: '#000'}}>{opt.text}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={enviarEvaluacion} style={calcBtn}>Calcular Gravedad nFASS</button>
            </div>
          </section>

          {/* COLUMNA DE RESULTADOS (Ahora alineada y más ancha) */}
          <aside style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Añadimos un margen superior para compensar el botón de "Volver" y que queden alineados */}
            <div style={{ marginTop: '45px', height: '100%' }}>
              {resultado ? (
                <ResultadoCard resultado={resultado} />
              ) : (
                <div style={emptyCard}>
                  <Info size={50} style={{marginBottom: '15px'}} />
                  <p style={{fontSize: '1.1rem', fontWeight: '600'}}>Esperando evaluación...</p>
                  <p style={{fontSize: '0.9rem', opacity: 0.8}}>Seleccione los síntomas para ver el Grado FASS aquí.</p>
                </div>
              )}
            </div>
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
const cardStyle = { 
  backgroundColor: '#fff', 
  padding: '35px', // Más padding interno
  borderRadius: '24px', 
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', 
  border: '1px solid #e2e8f0' 
};

const inputStyle = { 
  width: '100%', 
  padding: '16px', // Un poco más grande
  borderRadius: '14px', 
  border: '2px solid #e2e8f0', 
  backgroundColor: '#f8fafc', 
  color: '#0f172a', 
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const selectStyle = { 
  width: '100%', 
  padding: '14px', 
  borderRadius: '14px', 
  border: '2px solid #e2e8f0', 
  backgroundColor: '#f8fafc', 
  color: '#0f172a', 
  fontSize: '1rem',
  cursor: 'pointer',
  outline: 'none',
  boxSizing: 'border-box'
};
const calcBtn = {
  width: '100%',
  padding: '18px',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '15px',
  fontSize: '1.1rem',
  fontWeight: '800',
  cursor: 'pointer',
  marginTop: '10px',
  boxShadow: '0 8px 15px rgba(37, 99, 235, 0.3)'
};

const logoutBtn = { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' };
const backBtn = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '10px', textAlign: 'left' };
const cardTitle = {
  margin: '0 0 20px 0',
  fontSize: '1.2rem',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#1e293b', // Color oscuro para "Datos del Paciente"
  fontWeight: '800'
};
const secHeader = {
  fontSize: '0.8rem',
  color: '#2563eb', // El azul brillante de antes para las secciones
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: '800',
  borderBottom: '2px solid #f1f5f9',
  paddingBottom: '5px',
  marginBottom: '15px'
};
const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: '#475569', // Gris oscuro para los títulos de síntomas
  display: 'block',
  marginBottom: '6px'
};
const emptyCard = { 
  height: '100%', // Para que ocupe todo el alto disponible
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px', 
  textAlign: 'center', 
  color: '#94a3b8', 
  backgroundColor: '#fff',
  border: '3px dashed #cbd5e1', 
  borderRadius: '28px' 
};
export default App;















