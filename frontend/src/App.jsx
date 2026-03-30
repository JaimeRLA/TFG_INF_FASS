import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, LogOut } from 'lucide-react';

import { styles } from './AppStyles.js';
import ChatBot from './components/ChatBot';

// Vistas
import MenuView from './views/MenuView';
import HistorialView from './views/HistorialView';
import SeleccionarPacienteView from './views/SeleccionarPacienteView';
import AntecedentesView from './views/AntecedentesView';
import EventRecordView from './views/EventRecordView';
import CalculadoraView from './views/CalculadoraView';
import Login from './views/Login';

const App = () => {
  // --- ESTADOS ---
  const [esPacienteExistente, setEsPacienteExistente] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [view, setView] = useState('perfil');
  const [resultado, setResultado] = useState(null);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const [paciente, setPaciente] = useState({ id: '', fecha_nacimiento: '', rango_edad: '', genero: '' });
  
  const [cuestionario, setCuestionario] = useState({});
  const [seleccionados, setSeleccionados] = useState({});
  const [evento, setEvento] = useState({
    reaccion_fecha: '', trigger_food: '', trigger_insect: '', trigger_drug: '',
    duration: '', location: '', activity: '', adrenaline: '',
    other_treatment_yn: '', other_treatment_details: '', ambulance: '', other_info: '',
    drug_reason: '', drug_form: '', drug_other: '', drug_onset: '', drug_tolerance: '', drug_details_extra: ''
  });

  // URL del Backend - Asegúrate de que coincida con tu Render
  const BASE_URL = "https://tfg-inf-fass.onrender.com";
  const TFG_KEY = import.meta.env.VITE_APP_TFG_KEY;

  const handleEvento = (campo, valor) => setEvento(prev => ({ ...prev, [campo]: valor }));
  const handleCuestionario = (pregunta, valor) => setCuestionario(prev => ({ ...prev, [pregunta]: valor }));
  const handleSelectChange = (grupoId, valor) => setSeleccionados(prev => ({ ...prev, [grupoId]: valor }));

  const reiniciarApp = () => {
    setEsPacienteExistente(false); 
    setEditandoId(null);
    setPaciente({ id: '', fecha_nacimiento: '', rango_edad: '', genero: '' });
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

  const cargarHistorial = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/history`, {
        params: { medico: usuarioLogueado }, 
        headers: { 'x-tfg-key': TFG_KEY }
      });
      setListaPacientes(res.data);
      setView('historial_global');
    } catch (err) { 
      console.error("Error historial:", err.response?.data || err.message);
      alert("Error al cargar el historial: " + (err.response?.data?.detail || "Fallo de conexión")); 
    }
  };

  const cargarPacientesExistentes = async () => {
    try {
      setFiltroBusqueda(''); 
      const res = await axios.get(`${BASE_URL}/pacientes_unicos`, {
        params: { medico: usuarioLogueado },
        headers: { 'x-tfg-key': TFG_KEY }
      });
      setListaPacientes(res.data);
      setView('seleccionar_paciente');
    } catch (err) { 
      console.error("Error pacientes:", err.response?.data || err.message);
      alert("Error al cargar pacientes: " + (err.response?.data?.detail || "Fallo de conexión")); 
    }
  };

  const seleccionarPacienteExistente = (p) => {
    setEditandoId(null); 
    setEsPacienteExistente(true); 
    setPaciente({
      id: p.nhc_hash || p.id || '', // Priorizamos nhc_hash para pacientes existentes
      rango_edad: p.rango_edad || '', 
      genero: p.genero || '',
      fecha_nacimiento: '' 
    });
    setResultado(null);
    setView('event_record'); 
  };

  const seleccionarParaEditar = (p) => {
    setEditandoId(p.id); 
    setEsPacienteExistente(false); 
    setPaciente({
      id: p.nhc_hash || '', 
      rango_edad: p.rango_edad || '', 
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
      await axios.delete(`${BASE_URL}/evaluacion/${id_db}`, {
        params: { medico: usuarioLogueado },
        headers: { 'x-tfg-key': TFG_KEY }
      });
      alert("Registro eliminado con éxito.");
      cargarHistorial();
    } catch (err) { alert("Error al borrar el registro."); }
  };

  const validarYPasarAEvento = async () => {
    const identificadorOk = paciente.id;
    const edadOk = esPacienteExistente ? paciente.rango_edad : paciente.fecha_nacimiento;

    if (!identificadorOk || !edadOk || !paciente.genero) {
      alert("NHC/ID, Edad/Fecha y Género son campos obligatorios.");
      return;
    }
    setView('event_record');
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    
    if (!paciente.id) return alert("Error: Falta ID del paciente.");
    if (listaIds.length === 0) return alert("Por favor, seleccione al menos un síntoma.");

    const idParaEnviar = (editandoId && editandoId > 0) ? parseInt(editandoId) : null;

    try {
      const res = await axios.post(`${BASE_URL}/calculate`, {
        id: idParaEnviar, 
        paciente_id: paciente.id,
        fecha_nacimiento: paciente.fecha_nacimiento || paciente.rango_edad, 
        genero: paciente.genero,
        respuestas: cuestionario,
        evento: evento,
        sintomas: listaIds,
        medico: usuarioLogueado
      });
      
      if (res.data.success) {
        setResultado(res.data);
        if (res.data.id_registro) {
          setEditandoId(res.data.id_registro);
        }
      } else {
        alert("Error del servidor: " + res.data.message);
      }
    } catch (err) { 
      console.error("Error en la petición:", err);
      alert("Error crítico: " + (err.response?.data?.detail || "Fallo de conexión")); 
    }
  };

  const descargarPaciente = (p) => {
    const encabezados = "NHC_Hash,Rango_Edad,Genero,nFASS,oFASS,Risk,Fecha_Evaluacion\n";
    const fila = `${p.nhc_hash},${p.rango_edad},${p.genero},${p.nfass},${p.ofass_grade},${p.risk_level},${p.fecha}\n`;
    const blob = new Blob([encabezados + fila], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Pseudonimo_${p.nhc_hash.substring(0,8)}_evaluacion.csv`);
    a.click();
  };

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
        
        {view === 'seleccionar_paciente' && (
          <SeleccionarPacienteView 
            listaPacientes={listaPacientes}
            seleccionarPacienteExistente={seleccionarPacienteExistente} 
            setView={setView} 
          />
        )}        
        
        {view === 'registro_paciente' && (
          <AntecedentesView 
            paciente={paciente} 
            setPaciente={setPaciente} 
            cuestionario={cuestionario} 
            handleCuestionario={handleCuestionario} 
            validarYPasarAEvento={validarYPasarAEvento} 
            setView={setView} 
            esPacienteExistente={esPacienteExistente} 
            listaPacientes={listaPacientes} // <--- AÑADE ESTA LÍNEA
          />
        )}
        
        {view === 'event_record' && (
          <EventRecordView 
            evento={evento} 
            handleEvento={handleEvento} 
            setView={(nuevaVista) => {
              if (nuevaVista === 'perfil' && esPacienteExistente) {
                reiniciarApp();
              } else {
                setView(nuevaVista);
              }
            }} 
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