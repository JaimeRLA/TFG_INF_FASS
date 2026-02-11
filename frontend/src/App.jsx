import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, ClipboardList, User, ShieldCheck, AlertTriangle, Info, Send } from 'lucide-react';

const App = () => {
  const [paciente, setPaciente] = useState({ nombre: '', id: '' });
  const [seleccionados, setSeleccionados] = useState({});
  const [resultado, setResultado] = useState(null);

  // --- NUEVOS ESTADOS PARA EL CHATBOT LLAMA ---
  const [chatInput, setChatInput] = useState("");
  const [mensajes, setMensajes] = useState([
    { rol: 'bot', texto: 'Hola, soy tu asistente clínico FASS. ¿En qué puedo ayudarte con la evaluación del paciente?' }
  ]);
  const [cargandoChat, setCargandoChat] = useState(false);

  const SECCIONES_SINTOMAS = [
    {
      titulo: "1. Oral y Gastrointestinal",
      grupos: [
        { label: "Cavidad Oral", id_base: "oral", options: [{ id: "itchy_mouth", text: "Picor oral/garganta (λ: 0.05)" }] },
        {
          label: "Dolor / Náuseas", id_base: "gi_pain", options: [
            { id: "nausea_pain", text: "Leve (λ: 0.03)" },
            { id: "frequent_nausea_pain", text: "Frecuente (λ: 0.04)" },
            { id: "frequent_nausea_pain_dec", text: "Distrés/Actividad baja (λ: 0.05)" }
          ]
        },
        { label: "Vómitos", id_base: "gi_emesis", options: [{ id: "emesis_1", text: "1 episodio (λ: 0.05)" }, { id: "emesis_multiple", text: "> 1 episodio (λ: 0.08)" }] },
        { label: "Diarrea", id_base: "gi_diarrhoea", options: [{ id: "diarrhoea", text: "1 episodio (λ: 0.05)" }, { id: "diarrhoea_multiple", text: "> 1 episodio (λ: 0.08)" }] }
      ]
    },
    {
      titulo: "2. Piel y Mucosas",
      grupos: [
        {
          label: "Prurito (Rascado)", id_base: "skin_pruritus", options: [
            { id: "pruritus_os", text: "Ocasional (λ: 0.01)" },
            { id: "pruritus_os_2", text: "Continuo (λ: 0.02)" },
            { id: "pruritus_os_hard", text: "Intenso (λ: 0.05)" }
          ]
        },
        {
          label: "Rash / Eritema", id_base: "skin_rash", options: [
            { id: "rash_few", text: "Faint (λ: 0.05)" },
            { id: "rash_less_50", text: "≤ 50% (λ: 0.07)" },
            { id: "rash_3_10", text: "> 50% (λ: 0.08)" }
          ]
        },
        {
          label: "Urticaria", id_base: "skin_urticaria_new", options: [
            { id: "urticaria_more_3", text: "Localizada / Pocas (λ: 0.05)" },
            { id: "urticaria_3_10", text: "Moderada (λ: 0.07)" },
            { id: "urticaria_more_10", text: "Generalizada (λ: 0.08)" }
          ]
        },
        {
          label: "Angioedema", id_base: "skin_angioedema", options: [
            { id: "angioedema_mild", text: "Leve (λ: 0.05)" },
            { id: "angioedema_significant", text: "Facial / Significativo (λ: 0.07)" },
            { id: "angioedema_generalized", text: "Generalizado (λ: 0.08)" }
          ]
        }
      ]
    },
    {
      titulo: "3. Ocular y Nasal",
      grupos: [
        { label: "Rinitis", id_base: "rhinitis", options: [{ id: "rhinitis_rare", text: "Ocasional (λ: 0.01)" }, { id: "rhinitis_less_10", text: "Frecuente (λ: 0.05)" }, { id: "rhinitis_long", text: "Persistente (λ: 0.08)" }] },
        { label: "Conjuntivitis", id_base: "eyes", options: [{ id: "eyes_rare", text: "Intermitente (λ: 0.05)" }, { id: "eyes_continuos", text: "Continuo (λ: 0.08)" }] }
      ]
    },
    {
      titulo: "4. Sistémico (CV / NS / Resp)",
      grupos: [
        { label: "Bronquios", id_base: "bronchi", options: [{ id: "wheezing_exp", text: "Sibilancia Esp. (λ: 0.06)" }, { id: "wheezing_severe", text: "Insp/Esp. (λ: 0.07)" }, { id: "wheezing_audible", text: "Audible (λ: 0.08)" }] },
        { 
          label: "Laringe", id_base: "laryngeal", options: [
            { id: "laryngeal_throat", text: "Picor/Opresión garganta (λ: 0.05)" },
            { id: "laryngeal_more_3", text: "Tos persistente (>3) (λ: 0.05)" },
            { id: "laryngeal_frequent_cough", text: "Ronquera/Tos frecuente (λ: 0.07)" },
            { id: "laryngeal_stridor", text: "Estridor laríngeo (λ: 0.08)" }
          ] 
        },        
        { label: "Cardio (CV)", id_base: "cv", options: [{ id: "cv_tachycardia", text: "Tachycardia (λ: 0.05)" },{ id: "cv_bp_drop", text: "Baja TA > 20% (λ: 0.07)" }, { id: "cv_collapse", text: "Colapso CV (λ: 0.08)" }] },
        { label: "Nervioso (NS)", id_base: "ns", options: [{ id: "ns_dizzy", text: "Mareo (λ: 0.05)" },{ id: "ns_significant_change", text: "Cambio Consciencia (λ: 0.07)" }, { id: "ns_loss_consciousness", text: "Pérdida conciencia (λ: 0.08)" }] }
      ]
    }
  ];

  const handleSelectChange = (grupoId, valor) => {
    setSeleccionados(prev => ({ ...prev, [grupoId]: valor }));
  };

  // --- LÓGICA DE ENVÍO DE IA (LLAMA) ---
  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { rol: 'user', texto: chatInput };
    setMensajes(prev => [...prev, userMsg]);
    setChatInput("");
    setCargandoChat(true);

    try {
      const res = await axios.post(`https://tfg-inf-fass.onrender.com/chat?user_message=${chatInput}`);
      setMensajes(prev => [...prev, { rol: 'bot', texto: res.data.response }]);
    } catch (err) {
      setMensajes(prev => [...prev, { rol: 'bot', texto: 'Lo siento, ha habido un error en la conexión con el asistente.' }]);
    } finally {
      setCargandoChat(false);
    }
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
            <div style={{ backgroundColor: resultado.risk_level === 'High' ? '#fff1f2' : '#f0fdf4', padding: '40px 25px', borderRadius: '24px', border: `3px solid ${resultado.risk_level === 'High' ? '#fecdd3' : '#bbf7d0'}`, textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <p style={{ textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em', color: resultado.risk_level === 'High' ? '#be123c' : '#16a34a', fontSize: '0.8rem', marginBottom: '10px' }}>Sistema oFASS-5</p>
              <h2 style={{ fontSize: '7rem', margin: '10px 0', fontWeight: '900', lineHeight: 1, color: '#0f172a' }}>{resultado.ofass_grade}</h2>
              <p style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '20px', color: resultado.risk_level === 'High' ? '#be123c' : '#166534' }}>{resultado.ofass_category}</p>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '16px', border: '1px solid #fff', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>Índice nFASS:</p>
                <strong style={{ fontSize: '2.2rem', color: '#1e293b' }}>{resultado.nfass}</strong>
              </div>
              <div style={{ textAlign: 'left', backgroundColor: '#fff', padding: '15px', borderRadius: '12px', fontSize: '0.85rem', color: '#334155', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2563eb', fontWeight: '700' }}><ShieldCheck size={16} /> Validación EuroPrevall</div>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li style={{ marginBottom: '5px' }}>{resultado.ofass_grade >= 4 ? "Riesgo crítico: Alta probabilidad de requerir Adrenalina (OR > 25.7)." : "Probabilidad moderada/baja de intervención con Adrenalina."}</li>
                  <li>Precisión del modelo (ROC-AUC): 0.88 para casos severos.</li>
                </ul>
              </div>
              {resultado.risk_level === 'High' && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#be123c', color: '#fff', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left' }}>
                  <AlertTriangle size={32} />
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', lineHeight: 1.3 }}><strong>URGENCIA:</strong> Alta correlación con necesidad de cuidados de emergencia (OR 292.0).</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '80px 40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '28px', border: '3px dashed #cbd5e1', color: '#94a3b8' }}>
              <Info size={60} style={{ margin: '0 auto 20px auto', display: 'block' }} />
              <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>Seleccione síntomas para iniciar la evaluación clínica.</p>
            </div>
          )}
        </aside>
      </main>

      {/* --- WIDGET DE CHAT FLOTANTE LLAMA-3 --- */}
      <div style={{ position: 'fixed', bottom: '25px', right: '25px', width: '380px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '100px', borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
          Asistente Clínico (Llama 3)
        </div>
        <div style={{ height: '350px', overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc' }}>
          {mensajes.map((m, i) => (
            <div key={i} style={{ marginBottom: '15px', textAlign: m.rol === 'user' ? 'right' : 'left' }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '12px 16px', 
                borderRadius: m.rol === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                backgroundColor: m.rol === 'user' ? '#2563eb' : '#fff',
                color: m.rol === 'user' ? '#fff' : '#1e293b',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                maxWidth: '85%',
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                {m.texto}
              </div>
            </div>
          ))}
          {cargandoChat && <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Escribiendo...</p>}
        </div>
        <div style={{ display: 'flex', padding: '15px', gap: '10px', borderTop: '1px solid #f1f5f9' }}>
          <input 
            style={{ flex: 1, border: '1px solid #e2e8f0', padding: '12px 15px', borderRadius: '12px', outline: 'none', fontSize: '0.9rem' }} 
            placeholder="Describe síntomas o duda clínica..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChat()}
          />
          <button onClick={handleChat} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ESTILOS
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' };
const cardTitleStyle = { margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: '700', textAlign: 'left' };
const sectionHeaderStyle = { color: '#2563eb', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', fontWeight: '800', textAlign: 'left' };
const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px', textAlign: 'left' };
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#000', textAlign: 'left' };
const selectStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', color: '#000', textAlign: 'left' };
const buttonStyle = { width: '100%', padding: '18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 15px rgba(37, 99, 235, 0.3)' };

export default App;