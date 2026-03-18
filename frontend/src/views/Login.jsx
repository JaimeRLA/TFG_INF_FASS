import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, Lock, User, UserPlus, LogIn } from 'lucide-react';
import { styles } from '../AppStyles.js';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Usar variable de entorno o fallback a la URL de producción
  const API_URL = import.meta.env.VITE_APP_API_URL || 'https://tfg-inf-fass.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    
    const endpoint = isRegister ? '/register' : '/login';
    
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, form);
      
      if (res.data.success) {
        if (isRegister) {
          setMsg("Registro completado con éxito. Ya puede iniciar sesión.");
          setIsRegister(false);
          setForm({ username: '', password: '' });
        } else {
          // Éxito: notificamos al componente padre (App.js)
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
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <HeartPulse size={60} color="#2563eb" style={{ marginBottom: '15px' }} />
        
        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.8rem', fontWeight: '800' }}>
          {isRegister ? "Registro Médico" : "Acceso al Sistema"}
        </h2>
        
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '30px' }}>
            {isRegister ? "Cree su cuenta para realizar evaluaciones" : "Identifíquese para gestionar sus pacientes"}
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* CAMPO USUARIO */}
          <div style={styles.loginInputGroup}>
            <User size={20} color="#64748b" />
            <input 
              type="text" 
              placeholder="Usuario / ID Médico" 
              style={styles.loginInput}
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div style={styles.loginInputGroup}>
            <Lock size={20} color="#64748b" />
            <input 
              type="password" 
              placeholder="Contraseña" 
              style={styles.loginInput}
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>

          {/* ALERTAS */}
          {error && <div style={styles.loginErrorBox}>{error}</div>}
          {msg && <div style={styles.loginSuccessBox}>{msg}</div>}

          <button type="submit" style={styles.loginButton}>
            {isRegister ? (
              <><UserPlus size={20}/> Crear mi cuenta</>
            ) : (
              <><LogIn size={20}/> Entrar al Sistema</>
            )}
          </button>
        </form>

        <button 
          onClick={() => { setIsRegister(!isRegister); setError(""); setMsg(""); }} 
          style={styles.loginToggleBtn}
        >
          {isRegister ? "¿Ya tiene cuenta? Inicie sesión aquí" : "¿No tiene cuenta todavía? Regístrese"}
        </button>
      </div>
    </div>
  );
};

export default Login;