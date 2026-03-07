import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, LogOut } from 'lucide-react';

import { styles } from './AppStyles.js';
import ChatBot from './components/ChatBot';
import Login from './components/Login';

// Vistas
import MenuView from './views/MenuView';
import HistorialView from './views/HistorialView';
import SeleccionarPacienteView from './views/SeleccionarPacienteView';
import AntecedentesView from './views/AntecedentesView';
import EventRecordView from './views/EventRecordView';
import CalculadoraView from './views/CalculadoraView';


const App = () => {
  // --- ESTADOS ---
  const [esPacienteExistente, setEsPacienteExistente] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [view, setView] = useState('perfil');
  const [resultado, setResultado] = useState(null);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const [paciente, setPaciente] = useState({ id: '', fecha_nacimiento: '', genero: '' });
  const [cuestionario, setCuestionario] = useState({});
  const [seleccionados, setSeleccionados] = useState({});
  const [evento, setEvento] = useState({
    reaccion_fecha: '', trigger_food: '', trigger_insect: '', trigger_drug: '',
    duration: '', location: '', activity: '', adrenaline: '',
    other_treatment_yn: '', other_treatment_details: '', ambulance: '', other_info: '',
    drug_reason: '', drug_form: '', drug_other: '', drug_onset: '', drug_tolerance: '', drug_details_extra: ''
  });

  // --- LÓGICA ---
  const handleEvento = (campo, valor) => setEvento(prev => ({ ...prev, [campo]: valor }));
  const handleCuestionario = (pregunta, valor) => setCuestionario(prev => ({ ...prev, [pregunta]: valor }));
  const handleSelectChange = (grupoId, valor) => setSeleccionados(prev => ({ ...prev, [grupoId]: valor }));

  const reiniciarApp = () => {
    setEsPacienteExistente(false); 
    setEditandoId(null);
    setPaciente({ id: '', fecha_nacimiento: '', genero: '' });
    setCuestionario({});
    setSeleccionados({});
    setEvento({
      reaccion_fecha: '', trigger_food: '', trigger_insect: '', trigger_drug: '',
      duration: '', location: '', activity: '', adrenaline: '',
      other_treatment_yn: '', other_treatment_details: '', ambulance: '', other_info: '',
      drug_reason: '', drug_form: '', drug_other: '', drug_onset: '', drug_tolerance: '', drug_details_extra: ''
    });
    setResultado(null);
    setView('perfil');
  };



// Y en tus funciones de Axios:
const cargarHistorial = async () => {
  try {
    // 1. Obtenemos la llave (asegúrate de que esté en tu .env o usa la cadena directa para probar)
    const TFG_KEY = import.meta.env.VITE_APP_TFG_KEY || 'Clave_Secreta_App_2024';

    // 2. Enviamos el médico como parámetro de consulta (Query Param)
    const res = await axios.get(`https://tfg-inf-fass.onrender.com/history`, {
      params: { medico: usuarioLogueado }, // <-- Añadimos esto
      headers: { 
        'x-tfg-key': TFG_KEY 
      }
    });
    
    setListaPacientes(res.data);
    setView('historial_global');
  } catch (err) { 
    console.error("Error detalle:", err.response);
    alert("Error al cargar SU historial. Acceso denegado."); 
  }
};

  const cargarPacientesExistentes = async () => {
    try {
      setFiltroBusqueda(''); 
      const res = await axios.get(`https://tfg-inf-fass.onrender.com/pacientes_unicos?medico=${usuarioLogueado}`, {
        headers: { 'x-tfg-key': 'Clave_Secreta_App_2024' }
      });
      setListaPacientes(res.data);
      setView('seleccionar_paciente');
    } catch (err) { 
      console.error(err);
      alert("Error al cargar pacientes. Acceso denegado por seguridad."); 
    }
  };

  // REGISTRAR NUEVO EVENTO (BLOQUEA VOLVER)
  const seleccionarPacienteExistente = (p) => {
    setEditandoId(null); 
    setEsPacienteExistente(true); 
    setPaciente({
      id: p.id || p.nhc || '',
      fecha_nacimiento: p.fecha_nacimiento || '',
      genero: p.genero || ''
    });
    setResultado(null);
    setView('event_record'); 
  };

  // EDITAR REPORTE (PERMITE VOLVER)
  const seleccionarParaEditar = (p) => {
    setEditandoId(p.id); 
    setEsPacienteExistente(false); 
    setPaciente({
      id: p.nhc || '',
      fecha_nacimiento: p.fecha_nacimiento || '',
      genero: p.genero || ''
    });
    setEvento(p.evento_json || {});
    setCuestionario(p.respuestas_json || {});
    
    const sintomasPrevios = {};
    if (p.sintomas) {
      p.sintomas.forEach(idSintoma => {
        sintomasPrevios[idSintoma] = idSintoma; 
      });
    }
    setSeleccionados(sintomasPrevios);
    setResultado(null);
    setView('registro_paciente'); 
  };

  const eliminarEvaluacion = async (id_db) => {
    if (!id_db) return;
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      const res = await axios.delete(`https://tfg-inf-fass.onrender.com/evaluacion/${id_db}?medico=${usuarioLogueado}`, {
        headers: { 'x-tfg-key': 'Clave_Secreta_App_2024' }
      });
      if (res.data.success || res.status === 200) {
        alert("Registro eliminado.");
        cargarHistorial();
      }
    } catch (err) { alert("Error al borrar el registro."); }
  };

  const validarYPasarAEvento = async () => {
    if (!paciente.id || !paciente.fecha_nacimiento || !paciente.genero) {
      alert("NHC, Fecha de Nacimiento y Género son obligatorios.");
      return;
    }
    setView('event_record');
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (!paciente.id) return alert("Error: Falta ID del paciente.");

    try {
      const res = await axios.post('https://tfg-inf-fass.onrender.com/calculate', {
        id: editandoId, 
        paciente_id: paciente.id,
        fecha_nacimiento: paciente.fecha_nacimiento,
        genero: paciente.genero,
        respuestas: cuestionario,
        evento: evento,
        sintomas: listaIds,
        medico: usuarioLogueado
      });
      
      if (res.data.success === false) {
        alert(res.data.message);
      } else {
        setResultado(res.data);
      }
    } catch (err) { 
      alert("Error en el cálculo. Revisa la conexión con el servidor."); 
    }
  };

  const descargarPaciente = (p) => {
    const encabezados = "NHC,Fecha_Nac,Genero,nFASS,oFASS,Risk,Fecha_Evaluacion\n";
    const fila = `${p.nhc},${p.fecha_nacimiento},${p.genero},${p.nfass},${p.ofass_grade},${p.risk_level},${p.fecha}\n`;
    const blob = new Blob([encabezados + fila], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `NHC_${p.nhc}_evaluacion.csv`);
    a.click();
  };

  const pacientesFiltrados = listaPacientes.filter(p =>
    p.id && p.id.toString().toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  if (!usuarioLogueado) return <Login onLoginSuccess={setUsuarioLogueado} />;

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: '"Inter", sans-serif' }}>
      <header style={styles.headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartPulse size={30} color="#2563eb" />
          <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0, fontWeight: '800' }}>FASS System</h1>
        </div>
        <button onClick={() => setUsuarioLogueado(null)} style={styles.logoutBtn}><LogOut size={18} /> Salir</button>
      </header>

      <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto' }}>
        {view === 'perfil' && <MenuView setView={setView} cargarPacientesExistentes={cargarPacientesExistentes} cargarHistorial={cargarHistorial} />}
        
        {view === 'historial_global' && (
          <HistorialView 
            listaPacientes={listaPacientes} 
            seleccionarPacienteExistente={seleccionarParaEditar} 
            descargarPaciente={descargarPaciente} 
            eliminarEvaluacion={eliminarEvaluacion} 
            setView={setView} 
          />
        )}
        
        {view === 'seleccionar_paciente' && <SeleccionarPacienteView pacientesFiltrados={pacientesFiltrados} setFiltroBusqueda={setFiltroBusqueda} seleccionarPacienteExistente={seleccionarPacienteExistente} setView={setView} />}
        {view === 'registro_paciente' && <AntecedentesView paciente={paciente} setPaciente={setPaciente} cuestionario={cuestionario} handleCuestionario={handleCuestionario} validarYPasarAEvento={validarYPasarAEvento} setView={setView} />}
        
        {view === 'event_record' && (
          <EventRecordView 
            evento={evento} 
            handleEvento={handleEvento} 
            setView={setView} 
            esPacienteExistente={esPacienteExistente} 
          />
        )}
        {view === 'calculadora' && (
          <CalculadoraView 
            paciente={paciente} 
            handleSelectChange={handleSelectChange} 
            enviarEvaluacion={enviarEvaluacion} 
            resultado={resultado} 
            reiniciarApp={reiniciarApp} 
            setView={setView} 
            esPacienteExistente={esPacienteExistente}
          />
        )}
      </div>
      <ChatBot />
    </div>
  );
};

export default App;