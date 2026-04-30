import React, { useState } from 'react';
import axios from 'axios';

import { styles } from './AppStyles.js';
import ChatBot from './components/ChatBot';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import { useToast } from './hooks/useToast';
import { generarReportePDF } from './utils/pdfGenerator';

// Vistas principales
import MenuView from './views/MenuView';
import HistorialView from './views/HistorialView';
import SeleccionarPacienteView from './views/SeleccionarPacienteView';
import AntecedentesView from './views/AntecedentesView';
import EventRecordView from './views/EventRecordView';
import CalculadoraView from './views/CalculadoraView';
import { SECCIONES_SINTOMAS } from './data/sintomas';
import Login from './views/Login';

// Vistas de Información y Soporte
import DashboardView from './views/DashboardView';
import PuntuacionView from './views/PuntuacionView';
import AboutView from './views/AboutView';

const App = () => {
  // --- HOOK DE NOTIFICACIONES ---
  const { toasts, removeToast, success, error, warning, info } = useToast();

  // --- ESTADOS DE NAVEGACIÓN ---
  const [tabActiva, setTabActiva] = useState('app'); 
  const [view, setView] = useState('perfil');
  const [usuarioLogueado, setUsuarioLogueado] = useState(
    () => sessionStorage.getItem('fass_usuario') || null
  );
  const [nombreMedico, setNombreMedico] = useState(
    () => sessionStorage.getItem('fass_nombre') || ''
  );

  // --- ESTADOS DE DATOS ---
  const [esPacienteExistente, setEsPacienteExistente] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  // --- ESTADOS DE LOADING ---
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);
  const [isLoadingPacientes, setIsLoadingPacientes] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const iniciarNuevoRegistro = () => {
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
    setView('registro_paciente');
  };

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
    setIsLoadingHistorial(true);
    try {
      const res = await axios.get(`${BASE_URL}/history`, {
        params: { medico: usuarioLogueado }, 
        headers: { 'x-tfg-key': TFG_KEY }
      });
      setListaPacientes(res.data);
      setView('historial_global');
      success(`Historial cargado: ${res.data.length} evaluaciones encontradas`);
    } catch (err) { 
      error("No se pudo cargar el historial. Verifique su conexión e intente nuevamente.");
      console.error('Error cargarHistorial:', err);
    } finally {
      setIsLoadingHistorial(false);
    }
  };

  const cargarPacientesExistentes = async () => {
    setIsLoadingPacientes(true);
    try {
      const res = await axios.get(`${BASE_URL}/pacientes_unicos`, {
        params: { medico: usuarioLogueado },
        headers: { 'x-tfg-key': TFG_KEY }
      });
      setListaPacientes(res.data);
      setView('seleccionar_pac_existente');
      info(`${res.data.length} pacientes disponibles`);
    } catch (err) { 
      error("No se pudo cargar la lista de pacientes. Intente nuevamente.");
      console.error('Error cargarPacientes:', err);
    } finally {
      setIsLoadingPacientes(false);
    }
  };

  const seleccionarPacienteExistente = (p) => {
    setEditandoId(null); 
    setEsPacienteExistente(true); 
    setPaciente({ id: p.nhc_hash || p.id || '', rango_edad: p.rango_edad || '', genero: p.genero || '', fecha_nacimiento: '' });
    setResultado(null);
    setView('event_record');
    info(`Paciente seleccionado: ${p.rango_edad} - ${p.genero}`);
  };

  const seleccionarParaEditar = (p) => {
    setEditandoId(p.id); 
    setEsPacienteExistente(false); 
    setPaciente({ id: p.nhc_hash || '', rango_edad: p.rango_edad || '', genero: p.genero || '' });
    setEvento(p.evento_json || {});
    setCuestionario(p.respuestas_json || {});
    const sintomasPrevios = {};
    if (p.sintomas) {
      const reverseMap = {};
      SECCIONES_SINTOMAS.forEach(sec => sec.grupos.forEach(grupo => grupo.options.forEach(opt => { reverseMap[opt.id] = grupo.id_base; })));
      p.sintomas.forEach(idSintoma => { const grupoId = reverseMap[idSintoma]; if (grupoId) sintomasPrevios[grupoId] = idSintoma; });
    }
    setSeleccionados(sintomasPrevios);
    setResultado(null);
    setView('registro_paciente'); 
  };

  const eliminarEvaluacion = async (id_db) => {
    if (!id_db) return;
    
    if (!window.confirm("¿Está seguro de eliminar esta evaluación? Esta acción no se puede deshacer.")) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/evaluacion/${id_db}`, {
        params: { medico: usuarioLogueado },
        headers: { 'x-tfg-key': TFG_KEY }
      });
      success("Evaluación eliminada correctamente");
      cargarHistorial();
    } catch (err) { 
      error("No se pudo eliminar la evaluación. Por favor, intente nuevamente.");
      console.error('Error eliminarEvaluacion:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const enviarEvaluacion = async () => {
    const listaIds = Object.values(seleccionados).filter(id => id !== "");
    
    // Validación de campos requeridos
    if (!paciente.id) {
      warning("Por favor, ingrese el identificador del paciente (NHC)");
      return;
    }
    if (listaIds.length === 0) {
      warning("Debe seleccionar al menos un síntoma para calcular el score FASS");
      return;
    }
    if (!paciente.genero) {
      warning("Por favor, seleccione el género del paciente");
      return;
    }
    
    const idParaEnviar = (editandoId && editandoId > 0) ? parseInt(editandoId) : null;
    setIsCalculating(true);
    
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
      }, { headers: { 'x-tfg-key': TFG_KEY } });
      if (res.data.success) {
        setResultado(res.data);
        if (res.data.id_registro) setEditandoId(res.data.id_registro);
        success(idParaEnviar ? "Evaluación actualizada correctamente" : "Evaluación guardada correctamente");
      }
    } catch (err) { 
      error("Error al calcular el score FASS. Verifique los datos e intente nuevamente.");
      console.error('Error enviarEvaluacion:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const descargarTodoCSV = () => {
    if (listaPacientes.length === 0) {
      warning("No hay datos disponibles para exportar");
      return;
    }
    try {
      const encabezados = "ID_Interno,NHC_Hash,Genero,Rango_Edad,nFASS,oFASS,Riesgo,Fecha\n";
      const filas = listaPacientes.map(p => 
        `${p.id},${p.nhc_hash},${p.genero},${p.rango_edad},${p.nfass},${p.ofass_grade},${p.risk_level},${p.fecha}`
      ).join("\n");
      const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `Historial_FASS_Completo_${new Date().toLocaleDateString()}.csv`);
      link.click();
      success(`Archivo CSV descargado: ${listaPacientes.length} registros exportados`);
    } catch (err) {
      error("Error al generar el archivo CSV");
      console.error('Error descargarCSV:', err);
    }
  };

  const handleLoginSuccess = (username, nombre) => {
    sessionStorage.setItem('fass_usuario', username);
    sessionStorage.setItem('fass_nombre', nombre);
    setUsuarioLogueado(username);
    setNombreMedico(nombre);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('fass_usuario');
    sessionStorage.removeItem('fass_nombre');
    setUsuarioLogueado(null);
    setNombreMedico('');
  };

  if (!usuarioLogueado) return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      
      <Navbar 
        tabActiva={tabActiva} 
        setTabActiva={setTabActiva} 
        setUsuarioLogueado={handleLogout} 
      />

      <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* VISTAS DE LA APLICACIÓN PRINCIPAL */}
        {tabActiva === 'app' && (
          <>
            {view === 'perfil' && (
              <MenuView 
                setView={setView}
                iniciarNuevoRegistro={iniciarNuevoRegistro}
                cargarPacientesExistentes={cargarPacientesExistentes} 
                cargarHistorial={cargarHistorial}
                usuarioLogueado={nombreMedico || usuarioLogueado}
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
                seleccionados={seleccionados}
                enviarEvaluacion={enviarEvaluacion} 
                resultado={resultado} 
                reiniciarApp={reiniciarApp} 
                setView={setView} 
                esPacienteExistente={esPacienteExistente}
                isCalculating={isCalculating}
              />
            )}
          </>
        )}

        {/* VISTAS DE DOCUMENTACIÓN Y AYUDA */}
        {tabActiva === 'dashboard' && <DashboardView usuarioLogueado={usuarioLogueado} setTabActiva={setTabActiva} />}
        
        {tabActiva === 'puntuacion' && <PuntuacionView setTabActiva={setTabActiva} />}
        
        {tabActiva === 'about' && <AboutView setTabActiva={setTabActiva} />}

      </div>

      {/* TOAST NOTIFICATIONS */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>

      {/* LOADING OVERLAYS */}
      {(isLoadingHistorial || isLoadingPacientes || isDeleting) && (
        <LoadingSpinner 
          fullScreen 
          message={
            isLoadingHistorial ? "Cargando historial..." :
            isLoadingPacientes ? "Cargando pacientes..." :
            isDeleting ? "Eliminando evaluación..." : "Procesando..."
          }
        />
      )}

      <ChatBot />
    </div>
  );
};

export default App;