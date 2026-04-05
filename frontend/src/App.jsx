import React, { useState } from 'react';
import axios from 'axios';

import { styles } from './AppStyles.js';
import ChatBot from './components/ChatBot';
import Navbar from './components/Navbar';
import { generarReportePDF } from './utils/pdfGenerator';

// Vistas principales
import MenuView from './views/MenuView';
import HistorialView from './views/HistorialView';
import SeleccionarPacienteView from './views/SeleccionarPacienteView';
import AntecedentesView from './views/AntecedentesView';
import EventRecordView from './views/EventRecordView';
import CalculadoraView from './views/CalculadoraView';
import Login from './views/Login';

// Vistas de Información y Soporte
import PuntuacionView from './views/PuntuacionView';
import AboutView from './views/AboutView';

const App = () => {
  // --- ESTADOS DE NAVEGACIÓN ---
  const [tabActiva, setTabActiva] = useState('app'); 
  const [view, setView] = useState('perfil');
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  // --- ESTADOS DE DATOS ---
  const [esPacienteExistente, setEsPacienteExistente] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [listaPacientes, setListaPacientes] = useState([]);
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

  const BASE_URL = "https://tfg-inf-fass.onrender.com";
  const TFG_KEY = import.meta.env.VITE_APP_TFG_KEY;

  // --- HANDLERS DE FORMULARIO ---
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

  // --- LLAMADAS A API ---
  const cargarHistorial = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/history`, {
        params: { medico: usuarioLogueado }, 
        headers: { 'x-tfg-key': TFG_KEY }
      });
      setListaPacientes(res.data);
      setView('historial_global');
    } catch (err) { alert("Error al cargar el historial"); }
  };

  const cargarPacientesExistentes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/pacientes_unicos`, {
        params: { medico: usuarioLogueado },
        headers: { 'x-tfg-key': TFG_KEY }
      });
      setListaPacientes(res.data);
      setView('seleccionar_pac_existente');
    } catch (err) { alert("Error al cargar pacientes"); }
  };

  const seleccionarPacienteExistente = (p) => {
    setEditandoId(null); 
    setEsPacienteExistente(true); 
    setPaciente({ id: p.nhc_hash || p.id || '', rango_edad: p.rango_edad || '', genero: p.genero || '', fecha_nacimiento: '' });
    setResultado(null);
    setView('event_record'); 
  };

  const seleccionarParaEditar = (p) => {
    setEditandoId(p.id); 
    setEsPacienteExistente(false); 
    setPaciente({ id: p.nhc_hash || '', rango_edad: p.rango_edad || '', genero: p.genero || '' });
    setEvento(p.evento_json || {});
    setCuestionario(p.respuestas_json || {});
    const sintomasPrevios = {};
    if (p.sintomas) p.sintomas.forEach(idSintoma => { sintomasPrevios[idSintoma] = idSintoma; });
    setSeleccionados(sintomasPrevios);
    setResultado(null);
    setView('registro_paciente'); 
  };

  const eliminarEvaluacion = async (id_db) => {
    if (!id_db || !window.confirm("¿Estás seguro?")) return;
    try {
      await axios.delete(`${BASE_URL}/evaluacion/${id_db}`, {
        params: { medico: usuarioLogueado },
        headers: { 'x-tfg-key': TFG_KEY }
      });
      cargarHistorial();
    } catch (err) { alert("Error al borrar."); }
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    if (!paciente.id || listaIds.length === 0) return alert("Por favor, seleccione síntomas.");
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
        if (res.data.id_registro) setEditandoId(res.data.id_registro);
      }
    } catch (err) { alert("Error al calcular."); }
  };

  const descargarTodoCSV = () => {
    if (listaPacientes.length === 0) return alert("No hay datos para exportar.");
    const encabezados = "ID_Interno,NHC_Hash,Genero,Rango_Edad,nFASS,oFASS,Riesgo,Fecha\n";
    const filas = listaPacientes.map(p => 
      `${p.id},${p.nhc_hash},${p.genero},${p.rango_edad},${p.nfass},${p.ofass_grade},${p.risk_level},${p.fecha}`
    ).join("\n");
    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Historial_FASS_Completo_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  if (!usuarioLogueado) return <Login onLoginSuccess={setUsuarioLogueado} />;

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: '"Inter", sans-serif' }}>
      
      <Navbar 
        tabActiva={tabActiva} 
        setTabActiva={setTabActiva} 
        setUsuarioLogueado={setUsuarioLogueado} 
      />

      <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* VISTAS DE LA APLICACIÓN PRINCIPAL */}
        {tabActiva === 'app' && (
          <>
            {view === 'perfil' && (
              <MenuView 
                setView={setView} 
                cargarPacientesExistentes={cargarPacientesExistentes} 
                cargarHistorial={cargarHistorial} 
              />
            )}

            {view === 'historial_global' && (
              <HistorialView 
                listaPacientes={listaPacientes} 
                seleccionarPacienteExistente={seleccionarParaEditar} 
                descargarTodoCSV={descargarTodoCSV} 
                generarReportePDF={(p) => generarReportePDF(p, usuarioLogueado)} 
                eliminarEvaluacion={eliminarEvaluacion} 
                setView={setView} 
              />
            )}

            {view === 'seleccionar_pac_existente' && (
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
                validarYPasarAEvento={() => setView('event_record')} 
                setView={setView} 
                esPacienteExistente={esPacienteExistente} 
                listaPacientes={listaPacientes} 
              />
            )}

            {view === 'event_record' && (
              <EventRecordView 
                evento={evento} 
                handleEvento={handleEvento} 
                setView={(v) => (v === 'perfil' && esPacienteExistente ? reiniciarApp() : setView(v))} 
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
          </>
        )}

        {/* VISTAS DE DOCUMENTACIÓN Y AYUDA */}
        {tabActiva === 'puntuacion' && <PuntuacionView setTabActiva={setTabActiva} />}
        
        {tabActiva === 'about' && <AboutView setTabActiva={setTabActiva} />}

      </div>

      <ChatBot />
    </div>
  );
};

export default App;