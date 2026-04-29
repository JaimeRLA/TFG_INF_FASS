import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, Lock, User, UserPlus, LogIn, Mail, Stethoscope, Building2, Phone, Hash } from 'lucide-react';
import { styles } from '../AppStyles.js';

const font = '"Inter", system-ui, -apple-system, sans-serif';

const InputRow = ({ icon, ...props }) => (
  <div style={styles.loginInputGroup}>
    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
    <input style={styles.loginInput} {...props} />
  </div>
);

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', nombre: '', email: '', especialidad: '', colegiado: '', hospital: '', telefono: '' });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

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
          onLoginSuccess(res.data.username, res.data.nombre || res.data.username);
        } else {
          setError(res.data.message || "Credenciales incorrectas");
        }
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setMsg("");
    setForm({ username: '', password: '', nombre: '', email: '', especialidad: '', colegiado: '', hospital: '', telefono: '' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0f172a',
      display: 'flex',
      fontFamily: font,
    }}>
      {/* Columna izquierda — branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '64px',
        paddingTop: '48px',
        borderRight: '1px solid #1e293b',
        display: window.innerWidth < 800 ? 'none' : 'flex',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <HeartPulse size={28} color="#93c5fd" />
          <span style={{ fontSize: '1.2rem', color: '#f1f5f9', fontWeight: '700', letterSpacing: '0.04em' }}>
            FASS <span style={{ color: '#93c5fd' }}>System</span>
          </span>
        </div>
        <h1 style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: '700', lineHeight: 1.3, margin: '0 0 16px 0' }}>
          Escala de Severidad<br />de Alergia Alimentaria FASS
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '380px', margin: '0 0 40px 0' }}>
          Plataforma clínica para la evaluación y almacenamiento de datos de pacientes con alergias alimentarias.
          Datos protegidos según normativa RGPD.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {['Pseudonimización automática de pacientes', 'Historial clínico estructurado', 'Exportación de datos CSV'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#93c5fd', flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Columna derecha — formulario */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '48px 40px',
        overflowY: 'auto',
        backgroundColor: '#f8fafc',
      }}>
        {/* Header del form */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            {isRegister ? 'Solicitud de acceso' : 'Inicio de sesión'}
          </p>
          <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '700' }}>
            {isRegister ? 'Solicitar acceso' : 'Bienvenido'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            {isRegister
              ? 'Complete el formulario. El administrador revisará su solicitud y le enviará las credenciales por email.'
              : 'Introduzca sus credenciales para acceder al sistema.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {isRegister ? (
            <>
              <label htmlFor="reg-nombre" style={{ ...styles.labelStyleV2, marginBottom: '6px' }}>Nombre completo</label>
              <InputRow id="reg-nombre" icon={<User size={16} />} type="text" placeholder="Dr. María García López" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />

              <label htmlFor="reg-email" style={{ ...styles.labelStyleV2, marginTop: '8px', marginBottom: '6px' }}>Correo electrónico</label>
              <InputRow id="reg-email" icon={<Mail size={16} />} type="email" placeholder="correo@hospital.es" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />

              <label htmlFor="reg-especialidad" style={{ ...styles.labelStyleV2, marginTop: '8px', marginBottom: '6px' }}>Especialidad médica</label>
              <InputRow id="reg-especialidad" icon={<Stethoscope size={16} />} type="text" placeholder="Alergología" value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})} required />

              <label htmlFor="reg-colegiado" style={{ ...styles.labelStyleV2, marginTop: '8px', marginBottom: '6px' }}>Número de colegiado</label>
              <InputRow id="reg-colegiado" icon={<Hash size={16} />} type="text" placeholder="28012345" value={form.colegiado} onChange={e => setForm({...form, colegiado: e.target.value})} required />

              <label htmlFor="reg-hospital" style={{ ...styles.labelStyleV2, marginTop: '8px', marginBottom: '6px' }}>Hospital / Centro</label>
              <InputRow id="reg-hospital" icon={<Building2 size={16} />} type="text" placeholder="Hospital Universitario..." value={form.hospital} onChange={e => setForm({...form, hospital: e.target.value})} required />

              <label htmlFor="reg-telefono" style={{ ...styles.labelStyleV2, marginTop: '8px', marginBottom: '6px' }}>Teléfono de contacto</label>
              <InputRow id="reg-telefono" icon={<Phone size={16} />} type="tel" placeholder="+34 600 000 000" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} required />
            </>
          ) : (
            <>
              <label htmlFor="log-email" style={{ ...styles.labelStyleV2, marginBottom: '6px' }}>Correo electrónico</label>
              <InputRow id="log-email" icon={<Mail size={16} />} type="email" placeholder="correo@hospital.es" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />

              <label htmlFor="log-password" style={{ ...styles.labelStyleV2, marginTop: '8px', marginBottom: '6px' }}>Contraseña</label>
              <InputRow id="log-password" icon={<Lock size={16} />} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </>
          )}

          {error && <div role="alert" style={{ ...styles.loginErrorBox, marginTop: '12px' }}>{error}</div>}
          {msg   && <div role="status" style={{ ...styles.loginSuccessBox, marginTop: '12px' }}>{msg}</div>}

          <button type="submit" style={{ ...styles.loginButton, marginTop: '20px' }}>
            {isRegister ? <><UserPlus size={16} /> Solicitar acceso</> : <><LogIn size={16} /> Entrar al sistema</>}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={toggleMode} style={styles.loginToggleBtn}>
            {isRegister ? '¿Ya tiene cuenta? Iniciar sesión' : '¿No tiene cuenta? Solicitar acceso'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;