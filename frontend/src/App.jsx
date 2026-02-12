import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, ClipboardList, User, Info } from 'lucide-react';
import { SECCIONES_SINTOMAS } from './data/sintomas';
import ResultadoCard from './components/ResultadoCard';
import ChatBot from './components/ChatBot';

const App = () => {
  const [paciente, setPaciente] = useState({ nombre: '', id: '' });
  const [seleccionados, setSeleccionados] = useState({});
  const [resultado, setResultado] = useState(null);

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

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f1f5f9', margin: 0, padding: '20px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      <header style={{ width: '100%', textAlign: 'left', marginBottom: '30px', paddingLeft: '5px' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#2563eb', fontWeight: '800', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px', margin: '0 0 5px 0' }}>
          <HeartPulse size={40} /> FASS Severity Calculator
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>Basado en el sistema nFASS/oFASS</p>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '30px', width: '100%', maxWidth: '100%', alignItems: 'start' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}><User size={18} color="#2563eb"/> Identificación del Paciente</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <input placeholder="Nombre Completo" style={inputStyle} onChange={e => setPaciente({...paciente, nombre: e.target.value})} />
              <input placeholder="ID Historia Clínica" style={inputStyle} onChange={e => setPaciente({...paciente, id: e.target.value})} />
            </div>
          </div>

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

// ESTILOS ORIGINALES 
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' };
const cardTitleStyle = { margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: '700', textAlign: 'left' };
const sectionHeaderStyle = { color: '#2563eb', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', fontWeight: '800', textAlign: 'left' };
const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px', textAlign: 'left' };
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#000', textAlign: 'left' };
const selectStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', color: '#000', textAlign: 'left' };
const buttonStyle = { width: '100%', padding: '18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 15px rgba(37, 99, 235, 0.3)' };

export default App;