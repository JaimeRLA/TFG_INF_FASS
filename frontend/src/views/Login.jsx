import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, Lock, User, UserPlus, LogIn, Mail, Stethoscope, Building2, Phone, Hash } from 'lucide-react';
import { styles } from '../AppStyles.js';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', nombre: '', email: '', especialidad: '', colegiado: '', hospital: '', telefono: '' });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Usar variable de entorno o fallback a la URL de producción
  const API_URL = import.meta.env.VITE_APP_API_URL || 'https://tfg-inf-fass.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      if (isRegister) {
        const res = await axios.post(`${API_URL}/register`, {
          nombre: form.nombre,
          email: form.email,
          especialidad: form.especialidad,
          colegiado: form.colegiado,
          hospital: form.hospital,
          telefono: form.telefono,
        });
        if (res.data.success) {
          setMsg(res.data.message);
          setIsRegister(false);
          setForm({ username: '', password: '', nombre: '', email: '', especialidad: '', colegiado: '', hospital: '', telefono: '' });
        } else {
          setError(res.data.message || "Error al enviar la solicitud.");
        }
      } else {
        const res = await axios.post(`${API_URL}/login`, {
          username: form.username,
          password: form.password,
        });
        if (res.data.success) {
          onLoginSuccess(res.data.username);
        } else {
          setError(res.data.message || "Credenciales incorrectas");
        }
      }
    } catch (err) {
      setError("Error de conexión con el servidor de base de datos.");
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <HeartPulse size={isRegister ? 40 : 60} color="#1e293b" style={{ marginBottom: isRegister ? '8px' : '15px' }} />
        
        <h2 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: isRegister ? '1.4rem' : '1.8rem', fontWeight: '800' }}>
          {isRegister ? "Solicitud de Acceso" : "Acceso al Sistema"}
        </h2>
        
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: isRegister ? '16px' : '30px' }}>
            {isRegister ? "Rellene el formulario y el administrador le enviará sus credenciales" : "Identifíquese para gestionar sus pacientes"}
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {isRegister ? (
            <>
              {/* CAMPO NOMBRE */}
              <div style={styles.loginInputGroup}>
                <User size={20} color="#64748b" />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  style={styles.loginInput}
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  required
                />
              </div>
              {/* CAMPO EMAIL */}
              <div style={styles.loginInputGroup}>
                <Mail size={20} color="#64748b" />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  style={styles.loginInput}
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              {/* CAMPO ESPECIALIDAD */}
              <div style={styles.loginInputGroup}>
                <Stethoscope size={20} color="#64748b" />
                <input
                  type="text"
                  placeholder="Especialidad médica"
                  style={styles.loginInput}
                  value={form.especialidad}
                  onChange={e => setForm({...form, especialidad: e.target.value})}
                  required
                />
              </div>
              {/* CAMPO COLEGIADO */}
              <div style={styles.loginInputGroup}>
                <Hash size={20} color="#64748b" />
                <input
                  type="text"
                  placeholder="Número de colegiado"
                  style={styles.loginInput}
                  value={form.colegiado}
                  onChange={e => setForm({...form, colegiado: e.target.value})}
                  required
                />
              </div>
              {/* CAMPO HOSPITAL */}
              <div style={styles.loginInputGroup}>
                <Building2 size={20} color="#64748b" />
                <input
                  type="text"
                  placeholder="Hospital / Centro de trabajo"
                  style={styles.loginInput}
                  value={form.hospital}
                  onChange={e => setForm({...form, hospital: e.target.value})}
                  required
                />
              </div>
              {/* CAMPO TELÉFONO */}
              <div style={styles.loginInputGroup}>
                <Phone size={20} color="#64748b" />
                <input
                  type="tel"
                  placeholder="Teléfono de contacto"
                  style={styles.loginInput}
                  value={form.telefono}
                  onChange={e => setForm({...form, telefono: e.target.value})}
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* CAMPO EMAIL (LOGIN) */}
              <div style={styles.loginInputGroup}>
                <Mail size={20} color="#64748b" />
                <input
                  type="email"
                  placeholder="Correo electrónico"
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
            </>
          )}

          {/* ALERTAS */}
          {error && <div style={styles.loginErrorBox}>{error}</div>}
          {msg && <div style={styles.loginSuccessBox}>{msg}</div>}

          <button type="submit" style={styles.loginButton}>
            {isRegister ? (
              <><UserPlus size={20}/> Solicitar acceso</>
            ) : (
              <><LogIn size={20}/> Entrar al Sistema</>
            )}
          </button>
        </form>

        <button 
          onClick={() => { setIsRegister(!isRegister); setError(""); setMsg(""); setForm({ username: '', password: '', nombre: '', email: '', especialidad: '', colegiado: '', hospital: '', telefono: '' }); }} 
          style={styles.loginToggleBtn}
        >
          {isRegister ? "¿Ya tiene cuenta? Inicie sesión aquí" : "¿No tiene cuenta? Solicite acceso"}
        </button>
      </div>
    </div>
  );
};

export default Login;