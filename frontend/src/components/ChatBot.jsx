import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

const ChatBot = () => {
  const [chatInput, setChatInput] = useState("");
  const [mensajes, setMensajes] = useState([
    { rol: 'bot', texto: 'Hola, soy tu asistente clínico FASS. ¿En qué puedo ayudarte con la evaluación del paciente?' }
  ]);
  const [cargandoChat, setCargandoChat] = useState(false);
  const [minimizado, setMinimizado] = useState(true);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { rol: 'user', texto: chatInput };
    setMensajes(prev => [...prev, userMsg]);
    setChatInput("");
    setCargandoChat(true);

    try {
      const res = await axios.get(`https://tfg-inf-fass.onrender.com/chat?user_message=${encodeURIComponent(chatInput)}`);
      setMensajes(prev => [...prev, { rol: 'bot', texto: res.data.response }]);
    } catch (err) {
      setMensajes(prev => [...prev, { rol: 'bot', texto: 'Error de conexión con Llama 3.' }]);
    } finally {
      setCargandoChat(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', bottom: '25px', right: '25px', width: '380px', 
      backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', 
      overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 1000, 
      display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' 
    }}>
      <div 
        onClick={() => setMinimizado(!minimizado)}
        style={{ 
          backgroundColor: '#2563eb', color: '#fff', padding: '15px 18px', 
          fontWeight: '800', display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
          Asistente Clínico (Llama 3)
        </div>
        <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
          {minimizado ? '+' : '-'}
        </button>
      </div>

      {!minimizado && (
        <>
          <div style={{ height: '350px', overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc' }}>
            {mensajes.map((m, i) => (
              <div key={i} style={{ marginBottom: '15px', textAlign: m.rol === 'user' ? 'right' : 'left' }}>
                <div style={{ 
                  display: 'inline-block', padding: '12px 16px', 
                  borderRadius: m.rol === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  backgroundColor: m.rol === 'user' ? '#2563eb' : '#fff',
                  color: m.rol === 'user' ? '#fff' : '#1e293b',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '85%', fontSize: '0.9rem', lineHeight: '1.4'
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
        </>
      )}
    </div>
  );
};

export default ChatBot;