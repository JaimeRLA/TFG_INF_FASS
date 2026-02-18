import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, Lock, User, UserPlus, LogIn } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    
    const endpoint = isRegister ? '/register' : '/login';
    
    try {
      const res = await axios.post(`https://tfg-inf-fass.onrender.com${endpoint}`, form);
      if (res.data.success) {
        if (isRegister) {
          setMsg("Registro completado. Ya puedes iniciar sesión.");
          setIsRegister(false); // Volver al modo login
        } else {
          onLoginSuccess();
        }
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div style={loginContainerStyle}>
      <div style={loginCardStyle}>
        <HeartPulse size={50} color="#2563eb" />
        <h2 style={{ margin: '15px 0 5px 0' }}>{isRegister ? "Crear Cuenta" : "Acceso Clínico"}</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
            {isRegister ? "Regístrate para evaluar pacientes" : "Introduce tus credenciales médicas"}
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={inputGroup}>
            <User size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Nombre de usuario" 
              style={loginInput}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
          </div>
          <div style={inputGroup}>
            <Lock size={18} color="#64748b" />
            <input 
              type="password" 
              placeholder="Contraseña" 
              style={loginInput}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>

          {error && <p style={{ color: '#be123c', fontSize: '0.85rem', fontWeight: '600' }}>{error}</p>}
          {msg && <p style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: '600' }}>{msg}</p>}

          <button type="submit" style={loginButtonStyle}>
            {isRegister ? <><UserPlus size={18}/> Registrarme</> : <><LogIn size={18}/> Entrar</>}
          </button>
        </form>

        <button 
          onClick={() => setIsRegister(!isRegister)} 
          style={{ background: 'none', border: 'none', color: '#2563eb', marginTop: '20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
        >
          {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
        </button>
      </div>
    </div>
  );
};

// Estilos consistentes con tu App.jsx
const loginContainerStyle = { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' };
const loginCardStyle = { padding: '40px', backgroundColor: '#fff', borderRadius: '28px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', width: '380px', textAlign: 'center', border: '1px solid #e2e8f0' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '10px', border: '2px solid #e2e8f0', padding: '12px', borderRadius: '14px', marginBottom: '15px', backgroundColor: '#f8fafc' };
const loginInput = { border: 'none', outline: 'none', width: '100%', backgroundColor: 'transparent', fontSize: '1rem' };
const loginButtonStyle = { width: '100%', padding: '15px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' };

export default Login;