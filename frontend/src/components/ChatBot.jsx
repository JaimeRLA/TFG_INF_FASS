import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [mensajes, setMensajes] = useState([
    { rol: 'bot', texto: 'Hola, soy tu asistente clínico FASS. ¿Deseas saber sobre la sensibilidad del modelo o las cohortes de validación? [cite: 30, 8]' }
  ]);
  const [cargando, setCargando] = useState(false);
  const [minimizado, setMinimizado] = useState(true);

  const enviarMensaje = async () => {
    if (!input.trim()) return;
    const userMsg = { rol: 'user', texto: input };
    setMensajes([...mensajes, userMsg]);
    setInput("");
    setCargando(true);

    try {
      const res = await axios.get(`https://tfg-inf-fass.onrender.com/chat?user_message=${encodeURIComponent(input)}`);
      setMensajes(prev => [...prev, { rol: 'bot', texto: res.data.response }]);
    } catch (err) {
      setMensajes(prev => [...prev, { rol: 'bot', texto: 'Error de conexión con el modelo.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '25px', right: '25px', width: '380px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', zIndex: 1000 }}>
      <div onClick={() => setMinimizado(!minimizado)} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '15px', borderRadius: '20px 20px 0 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
        <span>Asistente Clínico (Llama 3.3)</span>
        <span>{minimizado ? '+' : '-'}</span>
      </div>
      
      {!minimizado && (
        <>
          <div style={{ height: '300px', overflowY: 'auto', padding: '15px', backgroundColor: '#f8fafc' }}>
            {mensajes.map((m, i) => (
              <div key={i} style={{ marginBottom: '10px', textAlign: m.rol === 'user' ? 'right' : 'left' }}>
                <span style={{ display: 'inline-block', padding: '10px', borderRadius: '12px', backgroundColor: m.rol === 'user' ? '#2563eb' : '#eee', color: m.rol === 'user' ? '#fff' : '#000' }}>
                  {m.texto}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', padding: '10px', gap: '5px' }}>
            <input style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && enviarMensaje()} />
            <button onClick={enviarMensaje} style={{ padding: '10px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none' }}><Send size={18}/></button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;