import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, ClipboardList, Info, Users, History, LogOut } from 'lucide-react';

// Importación de módulos y componentes
import { SECCIONES_SINTOMAS } from './data/sintomas';
import ResultadoCard from './components/ResultadoCard';
import ChatBot from './components/ChatBot';
import FormularioPaciente from './components/FormularioPaciente';
import Login from './components/Login';
import Historial from './components/Historial';
import AdminUsuarios from './components/AdminUsuarios';

const App = () => {
  // --- ESTADOS DE AUTENTICACIÓN Y NAVEGACIÓN ---
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [view, setView] = useState('calculadora'); // 'calculadora', 'historial', 'usuarios'

  // --- ESTADOS DE LA CALCULADORA ---
  const [paciente, setPaciente] = useState({ nombre: '', id: '' });
  const [seleccionados, setSeleccionados] = useState({});
  const [resultado, setResultado] = useState(null);

  const estilosConfig = { cardStyle, cardTitleStyle, inputStyle, selectStyle };

  const handleSelectChange = (grupoId, valor) => {
    setSeleccionados(prev => ({ ...prev, [grupoId]: valor }));
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (!paciente.nombre || !paciente.id || listaIds.length === 0) {
      alert("Por favor, complete los datos obligatorios.");
      return;
    }
    try {
      const res = await axios.post('https://tfg-inf-fass.onrender.com/calculate', {
        nombre: paciente.nombre,
        paciente_id: paciente.id,
        sintomas: listaIds
      });
      setResultado(res.data);
    } catch (err) { console.error("Error:", err); }
  };

  // --- RENDERIZADO CONDICIONAL: LOGIN ---
  if (!usuarioLogueado) {
    return <Login onLoginSuccess={(nombre) => setUsuarioLogueado(nombre)} />;
  }

  // --- RENDERIZADO CONDICIONAL: VISTAS ---
  if (view === 'historial') {
    return <Historial volver={() => setView('calculadora')} />;
  }

  if (view === 'usuarios') {
    return <AdminUsuarios volver={() => setView('calculadora')} />;
  }

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f1f5f9', margin: 0, padding: '20px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* HEADER CON NAVEGACIÓN */}
      <header style={headerWrapperStyle}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#2563eb', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <HeartPulse size={35} /> FASS Severity Calculator
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Sesión iniciada como: <strong>{usuarioLogueado}</strong>
          </p>
        </div>

        <nav style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setView('historial')} style={navButtonStyle}>
            <History size={18} /> Historial
          </button>

          {/* SOLO EL ADMIN VE ESTE BOTÓN */}
          {usuarioLogueado === 'admin' && (
            <button onClick={() => setView('usuarios')} style={adminNavButton}>
              <Users size={18} /> Admin Usuarios
            </button>
          )}

          <button onClick={() => setUsuarioLogueado(null)} style={logoutButtonStyle}>
            <LogOut size={18} /> Salir
          </button>
        </nav>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '30px', width: '100%', maxWidth: '100%', alignItems: 'start' }}>
        
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <FormularioPaciente paciente={paciente} setPaciente={setPaciente} estilos={estilosConfig} />

          <div style={cardStyle}>
            <h3 style={cardTitleStyle}><ClipboardList size={18} color="#2563eb"/> Evaluación de Síntomas</h3>
            {SECCIONES_SINTOMAS.map(sec => (
              <div key={sec.titulo} style={{ marginBottom: '30px' }}>
                <h4 style={sectionHeaderStyle}>{sec.titulo}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {sec.grupos.map(grupo => (
                    <div key={grupo.label}>
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
            <button onClick={enviarEvaluacion} style={buttonStyle}>Calcular Gravedad nFASS</button>
          </div>
        </section>

        <aside style={{ position: 'sticky', top: '20px' }}>
          {resultado ? (
            <ResultadoCard resultado={resultado} />
          ) : (
            <div style={{ padding: '80px 40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '28px', border: '3px dashed #cbd5e1', color: '#94a3b8' }}>
              <Info size={60} style={{ margin: '0 auto 20px auto', display: 'block' }} />
              <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>Seleccione síntomas para iniciar la evaluación clínica.</p>
            </div>
          )}
        </aside>
      </main>

      <ChatBot />
    </div>
  );
};

// --- ESTILOS ---
const headerWrapperStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '30px', 
  backgroundColor: '#fff', 
  padding: '15px 25px', 
  borderRadius: '20px', 
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
};

const navButtonStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  padding: '10px 15px', 
  backgroundColor: '#f8fafc', 
  border: '1px solid #e2e8f0', 
  borderRadius: '12px', 
  cursor: 'pointer', 
  fontWeight: '600',
  color: '#475569'
};

const adminNavButton = { 
  ...navButtonStyle, 
  backgroundColor: '#fffbeb', 
  color: '#92400e', 
  border: '1px solid #fde68a' 
};

const logoutButtonStyle = { 
  ...navButtonStyle, 
  backgroundColor: '#fff1f2', 
  color: '#be123c', 
  border: '1px solid #fecdd3' 
};

const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' };
const cardTitleStyle = { margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: '700' };
const sectionHeaderStyle = { color: '#2563eb', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', fontWeight: '800' };
const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#000' };
const selectStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', color: '#000' };
const buttonStyle = { width: '100%', padding: '18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 15px rgba(37, 99, 235, 0.3)' };

export default App;