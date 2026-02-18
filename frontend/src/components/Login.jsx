import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, Lock, User } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://tfg-inf-fass.onrender.com/login', form);
      if (res.data.success) {
        onLoginSuccess();
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div style={loginContainerStyle}>
      <div style={loginCardStyle}>
        <HeartPulse size={50} color="#2563eb" />
        <h2 style={{ margin: '20px 0' }}>Acceso Clínico</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={inputGroup}>
            <User size={18} />
            <input 
              type="text" 
              placeholder="Usuario" 
              style={loginInput}
              onChange={e => setForm({...form, username: e.target.value})}
            />
          </div>
          <div style={inputGroup}>
            <Lock size={18} />
            <input 
              type="password" 
              placeholder="Contraseña" 
              style={loginInput}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>
          {error && <p style={{ color: '#be123c', fontSize: '0.9rem' }}>{error}</p>}
          <button type="submit" style={loginButtonStyle}>Entrar</button>
        </form>
      </div>
    </div>
  );
};

// Estilos rápidos para el login
const loginContainerStyle = { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' };
const loginCardStyle = { padding: '40px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', marginBottom: '15px' };
const loginInput = { border: 'none', outline: 'none', width: '100%' };
const loginButtonStyle = { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };

export default Login;