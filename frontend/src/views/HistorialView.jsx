import React from 'react';
import { ClipboardList, Trash2 } from 'lucide-react';
import { styles } from '../AppStyles.js';

const HistorialView = ({ listaPacientes, seleccionarPacienteExistente, descargarPaciente, eliminarEvaluacion, setView }) => (
  <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
    <button onClick={() => setView('perfil')} style={styles.backBtn}>← Volver</button>
    <div style={styles.cardStyle}>
      <h3 style={{ ...styles.cardTitle, color: '#000' }}><ClipboardList color="#ea580c" /> Historial de Evaluaciones</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {listaPacientes.map((p, index) => (
          <div key={index} style={styles.itemPacienteStyle}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#1e293b' }}>NHC: {p.nhc}</strong>
              <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Eval: {new Date(p.fecha).toLocaleDateString()} | nFASS: {p.nfass} | oFASS: {p.ofass_grade}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => seleccionarPacienteExistente(p)} style={styles.actionBtnGray}>Editar</button>
              <button onClick={() => descargarPaciente(p)} style={styles.actionBtnBlue}>CSV</button>
              <button onClick={() => eliminarEvaluacion(p.id)} style={styles.actionBtnRed} title="Eliminar Registro">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default HistorialView;