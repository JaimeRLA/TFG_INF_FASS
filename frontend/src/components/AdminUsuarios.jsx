import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, ArrowLeft, ShieldCheck } from 'lucide-react';

const AdminUsuarios = ({ volver }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const res = await axios.get('https://tfg-inf-fass.onrender.com/users');
        setUsuarios(res.data);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      } finally {
        setCargando(false);
      }
    };
    obtenerUsuarios();
  }, []);

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: '30px' }}>
        <button onClick={volver} style={backButtonStyle}>
          <ArrowLeft size={20} /> Volver
        </button>
        <h2 style={{ color: '#1e293b', marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} color="#2563eb" /> Usuarios Registrados (Personal Médico)
        </h2>
      </header>

      {cargando ? (
        <p>Cargando personal...</p>
      ) : (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nombre de Usuario / Colegiado</th>
                <th style={thStyle}>Estado de Acceso</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} style={trStyle}>
                  <td style={tdStyle}>#{u.id}</td>
                  <td style={tdStyle}><strong>{u.username}</strong></td>
                  <td style={tdStyle}>
                    <span style={badgeStyle}>
                      <ShieldCheck size={14} /> Autorizado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Estilos rápidos coherentes con tu App
const containerStyle = { padding: '40px', backgroundColor: '#f1f5f9', minHeight: '100vh' };
const backButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' };
const tableWrapper = { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadStyle = { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '15px', color: '#64748b', fontWeight: '700' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '15px', color: '#1e293b' };
const badgeStyle = { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' };

export default AdminUsuarios;