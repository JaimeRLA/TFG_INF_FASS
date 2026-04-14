import React, { useState } from 'react';
import axios from 'axios';
import { Send, MessageSquare } from 'lucide-react'; // Añadido MessageSquare para un toque más profesional

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
      setMensajes(prev => [...prev, { rol: 'bot', texto: 'Error de conexión con el asistente clínico.' }]);
    } finally {
      setCargandoChat(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', bottom: '25px', right: '25px', width: '380px', 
      backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', 
      overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 1000, 
      display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease',
      transform: minimizado ? 'translateY(10px)' : 'translateY(0)'
    }}>
      {/* HEADER CON AZUL OSCURO #1e293b */}
      <div 
        onClick={() => setMinimizado(!minimizado)}
        style={{ 
          backgroundColor: '#1e293b', color: '#fff', padding: '16px 20px', 
          fontWeight: '700', display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={18} color="#94a3b8" />
          <div style={{ position: 'relative' }}>
            Asistente Clínico
            <div style={{ 
              position: 'absolute', top: '-2px', right: '-12px', 
              width: '8px', height: '8px', borderRadius: '50%', 
              backgroundColor: '#4ade80', border: '2px solid #1e293b' 
            }}></div>
          </div>
        </div>
        <span style={{ fontSize: '24px', lineHeight: '0' }}>
          {minimizado ? '+' : '−'}
        </span>
      </div>

      {!minimizado && (
        <>
          <div style={{ height: '380px', overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc' }}>
            {mensajes.map((m, i) => (
              <div key={i} style={{ marginBottom: '18px', textAlign: m.rol === 'user' ? 'right' : 'left' }}>
                <div style={{ 
                  display: 'inline-block', padding: '12px 16px', 
                  borderRadius: m.rol === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  backgroundColor: m.rol === 'user' ? '#1e293b' : '#fff', // Burbujas del usuario en azul oscuro
                  color: m.rol === 'user' ? '#fff' : '#1e293b',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
                  maxWidth: '85%', fontSize: '0.9rem', lineHeight: '1.5',
                  border: m.rol === 'bot' ? '1px solid #e2e8f0' : 'none'
                }}>
                  {m.texto}
                </div>
              </div>
            ))}
            {cargandoChat && (
              <div style={{ display: 'flex', gap: '5px', padding: '5px' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Escribiendo respuesta clínica...</div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', padding: '15px', gap: '10px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fff' }}>
            <input 
              style={{ 
                flex: 1, border: '1px solid #e2e8f0', padding: '12px 15px', 
                borderRadius: '12px', outline: 'none', fontSize: '0.9rem',
                backgroundColor: '#f1f5f9', color: '#1e293b'
              }} 
              placeholder="Consulta el score o duda clínica..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChat()}
            />
            <button 
              onClick={handleChat} 
              style={{ 
                backgroundColor: '#1e293b', color: '#fff', border: 'none', 
                borderRadius: '12px', padding: '12px', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;