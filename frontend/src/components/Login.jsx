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
      // Ajusta la URL si es necesario para tu entorno de producción o local
      const res = await axios.post(`https://tfg-inf-fass.onrender.com${endpoint}`, form);
      
      if (res.data.success) {
        if (isRegister) {
          setMsg("Registro completado con éxito. Ya puede iniciar sesión.");
          setIsRegister(false);
          setForm({ username: '', password: '' });
        } else {
          // ESTO ES CLAVE: Enviamos el nombre al App.jsx para la página de Perfil
          onLoginSuccess(form.username); 
        }
      } else {
        setError(res.data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error de conexión con el servidor de base de datos.");
    }
  };

  return (
    <div style={loginContainerStyle}>
      <div style={loginCardStyle}>
        <HeartPulse size={60} color="#2563eb" style={{ marginBottom: '15px' }} />
        
        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.8rem', fontWeight: '800' }}>
          {isRegister ? "Registro Médico" : "Acceso al Sistema"}
        </h2>
        
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '30px' }}>
            {isRegister ? "Cree su cuenta para realizar evaluaciones" : "Identifíquese para gestionar sus pacientes"}
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* CAMPO USUARIO */}
          <div style={inputGroup}>
            <User size={20} color="#64748b" />
            <input 
              type="text" 
              placeholder="Usuario / ID Médico" 
              style={loginInput}
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
          </div>

          {/* CAMPO CONTRASEÑA */}
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

          {/* ALERTAS */}
          {error && <div style={errorBox}>{error}</div>}
          {msg && <div style={successBox}>{msg}</div>}

          <button type="submit" style={loginButtonStyle}>
            {isRegister ? (
              <><UserPlus size={20}/> Crear mi cuenta</>
            ) : (
              <><LogIn size={20}/> Entrar al Sistema</>
            )}
          </button>
        </form>

        <button 
          onClick={() => { setIsRegister(!isRegister); setError(""); setMsg(""); }} 
          style={toggleButtonStyle}
        >
          {isRegister ? "¿Ya tiene cuenta? Inicie sesión aquí" : "¿No tiene cuenta todavía? Regístrese"}
        </button>
      </div>
    </div>
  );
};

// --- ESTILOS PROFESIONALES ---
const loginContainerStyle = { 
  height: '100vh', 
  width: '100vw', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  backgroundColor: '#f1f5f9', 
  margin: 0, 
  padding: 0 
};

const loginCardStyle = { 
  padding: '50px 40px', 
  backgroundColor: '#ffffff', 
  borderRadius: '28px', 
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', 
  width: '100%', 
  maxWidth: '420px', 
  textAlign: 'center', 
  border: '1px solid #e2e8f0' 
};

const inputGroup = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  border: '2px solid #e2e8f0', 
  padding: '14px 18px', 
  borderRadius: '16px', 
  marginBottom: '20px', 
  backgroundColor: '#f8fafc' 
};

const loginInput = { 
  border: 'none', 
  outline: 'none', 
  width: '100%', 
  backgroundColor: 'transparent', 
  fontSize: '1rem', 
  color: '#1e293b', // TEXTO OSCURO (NO BLANCO)
  fontWeight: '500' 
};

const loginButtonStyle = { 
  width: '100%', 
  padding: '16px', 
  backgroundColor: '#2563eb', 
  color: '#ffffff', 
  border: 'none', 
  borderRadius: '16px', 
  fontWeight: '800', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '10px', 
  fontSize: '1.1rem', 
  boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)', 
  marginTop: '10px' 
};

const toggleButtonStyle = { 
  background: 'none', 
  border: 'none', 
  color: '#2563eb', 
  marginTop: '25px', 
  cursor: 'pointer', 
  fontSize: '0.95rem', 
  fontWeight: '700', 
  textDecoration: 'underline' 
};

const errorBox = { 
  backgroundColor: '#fff1f2', 
  color: '#be123c', 
  padding: '12px', 
  borderRadius: '12px', 
  fontSize: '0.9rem', 
  fontWeight: '600', 
  marginBottom: '20px', 
  border: '1px solid #fecdd3' 
};

const successBox = { 
  backgroundColor: '#f0fdf4', 
  color: '#16a34a', 
  padding: '12px', 
  borderRadius: '12px', 
  fontSize: '0.9rem', 
  fontWeight: '600', 
  marginBottom: '20px', 
  border: '1px solid #bbf7d0' 
};

export default Login;