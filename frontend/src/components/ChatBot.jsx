import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, MessageSquare } from 'lucide-react';

const ChatBot = () => {
  const [chatInput, setChatInput] = useState("");
  const [mensajes, setMensajes] = useState([
    { rol: 'bot', texto: 'Hola, soy tu asistente clínico FASS. ¿En qué puedo ayudarte con la evaluación del paciente?' }
  ]);
  const [cargandoChat, setCargandoChat] = useState(false);
  const [minimizado, setMinimizado] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (!minimizado) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, minimizado]);

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

  // Función para formatear el texto del bot
  const formatearTexto = (texto) => {
    // Dividir en párrafos
    const parrafos = texto.split('\n').filter(p => p.trim());
    
    return parrafos.map((parrafo, idx) => {
      // Detectar listas con números (1., 2., etc.)
      if (/^\d+\./.test(parrafo.trim())) {
        return (
          <div key={idx} style={{ 
            marginBottom: '8px', 
            paddingLeft: '12px',
            display: 'flex',
            gap: '8px'
          }}>
            <span style={{ fontWeight: '700', color: '#2563eb', minWidth: '20px' }}>
              {parrafo.match(/^\d+\./)[0]}
            </span>
            <span>{parrafo.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
      }
      
      // Detectar listas con viñetas (-, *, •)
      if (/^[\-\*•]/.test(parrafo.trim())) {
        return (
          <div key={idx} style={{ 
            marginBottom: '6px', 
            paddingLeft: '12px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <span style={{ color: '#2563eb', minWidth: '12px', marginTop: '2px' }}>•</span>
            <span>{parrafo.replace(/^[\-\*•]\s*/, '')}</span>
          </div>
        );
      }

      // Detectar títulos (TODO MAYÚSCULAS o termina en :)
      if (parrafo === parrafo.toUpperCase() && parrafo.length < 50) {
        return (
          <div key={idx} style={{ 
            fontWeight: '700', 
            color: '#1e293b',
            marginTop: idx > 0 ? '12px' : '0',
            marginBottom: '8px',
            fontSize: '0.95rem',
            borderLeft: '3px solid #2563eb',
            paddingLeft: '10px'
          }}>
            {parrafo}
          </div>
        );
      }

      // Párrafo normal
      return (
        <p key={idx} style={{ 
          margin: '0 0 10px 0',
          lineHeight: '1.6'
        }}>
          {parrafo}
        </p>
      );
    });
  };

  return (
    <div style={{ 
      position: 'fixed', bottom: '20px', right: '20px', width: '400px', 
      backgroundColor: '#fff', borderRadius: '8px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)', 
      overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 1000, 
      display: 'flex', flexDirection: 'column', transition: 'max-height 0.25s ease',
      maxHeight: minimizado ? '48px' : '560px'
    }}>
      {/* HEADER */}
      <div 
        onClick={() => setMinimizado(!minimizado)}
        style={{ 
          backgroundColor: '#0f172a', color: '#fff', padding: '12px 16px', 
          fontWeight: '600', fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={15} color="#93c5fd" />
          <span>Asistente Clínico FASS</span>
          <div style={{ 
            width: '6px', height: '6px', borderRadius: '50%', 
            backgroundColor: '#4ade80',
          }}></div>
        </div>
        <span style={{ fontSize: '16px', lineHeight: '1', color: '#94a3b8' }}>
          {minimizado ? '▲' : '▼'}
        </span>
      </div>

      {!minimizado && (
        <>
          <div style={{ 
            height: '420px', 
            overflowY: 'auto', 
            padding: '16px', 
            backgroundColor: '#f8fafc',
            scrollBehavior: 'smooth'
          }}>
            {mensajes.map((m, i) => (
              <div key={i} style={{ 
                marginBottom: '12px', 
                textAlign: m.rol === 'user' ? 'right' : 'left',
              }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '10px 14px', 
                  borderRadius: m.rol === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  backgroundColor: m.rol === 'user' ? '#0f172a' : '#fff',
                  color: m.rol === 'user' ? '#fff' : '#0f172a',
                  maxWidth: '88%', 
                  fontSize: '0.85rem', 
                  lineHeight: '1.6',
                  border: m.rol === 'bot' ? '1px solid #e2e8f0' : 'none',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {m.rol === 'bot' ? formatearTexto(m.texto) : m.texto}
                </div>
              </div>
            ))}
            {cargandoChat && (
              <div style={{ display: 'flex', gap: '8px', padding: '8px', alignItems: 'center' }}>
                <div style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: '#1d4ed8',
                  animation: 'pulse 1.5s ease-in-out infinite' 
                }}></div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Generando respuesta clínica...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div style={{ 
            display: 'flex', 
            padding: '10px 12px', 
            gap: '8px', 
            borderTop: '1px solid #e2e8f0', 
            backgroundColor: '#fff' 
          }}>
            <input 
              style={{ 
                flex: 1, 
                border: '1px solid #e2e8f0', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                outline: 'none', 
                fontSize: '0.875rem',
                backgroundColor: '#f8fafc', 
                color: '#0f172a',
                fontFamily: '"Inter", sans-serif'
              }} 
              placeholder="Pregunta sobre alergias o score FASS..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
            />
            <button 
              onClick={handleChat} 
              disabled={!chatInput.trim() || cargandoChat}
              style={{ 
                backgroundColor: chatInput.trim() && !cargandoChat ? '#0f172a' : '#94a3b8', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '8px 10px', 
                cursor: chatInput.trim() && !cargandoChat ? 'pointer' : 'not-allowed', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default ChatBot;