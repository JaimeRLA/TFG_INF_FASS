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
          setIsRegister(false);
          setForm({ username: '', password: '' });
        } else {
          // IMPORTANTE: Enviamos el nombre escrito en el input
          onLoginSuccess(form.username); 
        }
      } else {
        setError(res.data.message || "Error en las credenciales");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div style={loginContainerStyle}>
      <div style={loginCardStyle}>
        <HeartPulse size={60} color="#2563eb" style={{ marginBottom: '10px' }} />
        <h2 style={{ margin: '10px 0', color: '#1e293b', fontSize: '1.8rem', fontWeight: '800' }}>
          {isRegister ? "Crear Cuenta" : "Acceso Clínico"}
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '30px' }}>
            {isRegister ? "Regístrese en el sistema FASS" : "Identifíquese para evaluar pacientes"}
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={inputGroup}>
            <User size={20} color="#64748b" />
            <input 
              type="text" 
              placeholder="Nombre de usuario" 
              style={loginInput}
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
          </div>
          <div style={inputGroup}>
            <Lock size={20} color="#64748b" />
            <input 
              type="password" 
              placeholder="Contraseña" 
              style={loginInput}
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>

          {error && <div style={errorBox}>{error}</div>}
          {msg && <div style={successBox}>{msg}</div>}

          <button type="submit" style={loginButtonStyle}>
            {isRegister ? <><UserPlus size={20}/> Registrarme ahora</> : <><LogIn size={20}/> Iniciar Sesión</>}
          </button>
        </form>

        <button 
          onClick={() => { setIsRegister(!isRegister); setError(""); setMsg(""); }} 
          style={toggleButtonStyle}
        >
          {isRegister ? "¿Ya tiene cuenta? Inicia sesión" : "¿No tiene cuenta? Regístrese aquí"}
        </button>
      </div>
    </div>
  );
};

// Estilos
const loginContainerStyle = { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', margin: 0 };
const loginCardStyle = { padding: '50px 40px', backgroundColor: '#ffffff', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', width: '100%', maxWidth: '450px', textAlign: 'center', border: '1px solid #e2e8f0' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '12px', border: '2px solid #e2e8f0', padding: '14px 18px', borderRadius: '16px', marginBottom: '20px', backgroundColor: '#f8fafc' };
const loginInput = { border: 'none', outline: 'none', width: '100%', backgroundColor: 'transparent', fontSize: '1rem', color: '#0f172a', fontWeight: '500' };
const loginButtonStyle = { width: '100%', padding: '16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', marginTop: '10px' };
const toggleButtonStyle = { background: 'none', border: 'none', color: '#2563eb', marginTop: '25px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700', textDecoration: 'underline' };
const errorBox = { backgroundColor: '#fff1f2', color: '#be123c', padding: '12px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '20px' };
const successBox = { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '20px' };

export default Login;