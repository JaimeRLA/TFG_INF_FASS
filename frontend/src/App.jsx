import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, LogOut, Info, BookOpen, HelpCircle, Home } from 'lucide-react';

import { styles } from './AppStyles.js';
import ChatBot from './components/ChatBot';
import { generarReportePDF } from './utils/pdfGenerator';

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
  const [tabActiva, setTabActiva] = useState('app'); 
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
      alert("Error al cargar el historial"); 
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
      setView('seleccionar_pac_existente');
    } catch (err) { 
      alert("Error al cargar pacientes"); 
    }
  };

  const seleccionarPacienteExistente = (p) => {
    setEditandoId(null); 
    setEsPacienteExistente(true); 
    setPaciente({
      id: p.nhc_hash || p.id || '',
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
      p.sintomas.forEach(idSintoma => { sintomasPrevios[idSintoma] = idSintoma; });
    }
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

  const validarYPasarAEvento = async () => {
    if (!paciente.id || (!paciente.fecha_nacimiento && !paciente.rango_edad) || !paciente.genero) {
      alert("Faltan campos obligatorios.");
      return;
    }
    setView('event_record');
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
      <header style={styles.headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartPulse size={30} color="#2563eb" />
          <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0, fontWeight: '800' }}>FASS System</h1>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <nav style={{ display: 'flex', gap: '5px', backgroundColor: '#f8fafc', padding: '5px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <button onClick={() => setTabActiva('app')} style={tabActiva === 'app' ? styles.tabActive : styles.tabInactive}>
            <Home size={16} /> Aplicación
          </button>
          <button onClick={() => setTabActiva('puntuacion')} style={tabActiva === 'puntuacion' ? styles.tabActive : styles.tabInactive}>
            <BookOpen size={16} /> Escala nFASS
          </button>
          <button onClick={() => setTabActiva('about')} style={tabActiva === 'about' ? styles.tabActive : styles.tabInactive}>
            <HelpCircle size={16} /> Ayuda
          </button>
        </nav>

        <button onClick={() => setUsuarioLogueado(null)} style={styles.logoutBtn}><LogOut size={18} /> Salir</button>
      </header>

      <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* PESTAÑA: ESCALA NFASS */}
        {tabActiva === 'puntuacion' && (
          <div style={{...styles.infoCard, backgroundColor: '#ffffff', color: '#1e293b'}}>
            <button onClick={() => setTabActiva('app')} style={styles.closeBtn}>×</button>
            <h2 style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={24} /> Interpretación de Puntuación nFASS
            </h2>
            <p style={{marginTop: '20px', fontSize: '1.05rem'}}>
                La puntuación <strong>nFASS (Numerical Fass)</strong> es un algoritmo de soporte de decisiones que pondera los síntomas de una reacción alérgica según su gravedad clínica y compromiso de órganos vitales.
            </p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
                <div style={{padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc'}}>
                    <h4 style={{margin: '0 0 10px 0', color: '#16a34a'}}>Gravedad Leve (Grado 1-2)</h4>
                    <p style={{margin: 0, fontSize: '0.9rem'}}>Síntomas limitados a piel y mucosas o afectación gastrointestinal leve. Riesgo bajo de progresión inmediata.</p>
                </div>
                <div style={{padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc'}}>
                    <h4 style={{margin: '0 0 10px 0', color: '#ea580c'}}>Gravedad Moderada (Grado 3)</h4>
                    <p style={{margin: 0, fontSize: '0.9rem'}}>Afectación respiratoria o cardiovascular moderada. Requiere observación estricta y tratamiento activo.</p>
                </div>
                <div style={{padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc'}}>
                    <h4 style={{margin: '0 0 10px 0', color: '#dc2626'}}>Gravedad Grave (Grado 4-5)</h4>
                    <p style={{margin: 0, fontSize: '0.9rem'}}>Compromiso vital inminente (shock, fallo respiratorio). Prioridad absoluta de adrenalina IM.</p>
                </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: ABOUT / AYUDA */}
        {tabActiva === 'about' && (
          <div style={{...styles.infoCard, backgroundColor: '#ffffff', color: '#1e293b'}}>
            <button onClick={() => setTabActiva('app')} style={styles.closeBtn}>×</button>
            <h2 style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HelpCircle size={24} /> Funcionamiento de la Aplicación
            </h2>
            <div style={{lineHeight: '1.6', marginTop: '20px'}}>
                <p>Bienvenido al sistema <strong>nFASS v2.0</strong>. Este software está diseñado para estandarizar la evaluación de reacciones alérgicas agudas.</p>
                <h4 style={{marginBottom: '10px'}}>Pasos para realizar una evaluación:</h4>
                <ol>
                    <li><strong>Registro de Paciente:</strong> Introduzca el NHC. El sistema lo seudonimizará automáticamente por seguridad (RGPD).</li>
                    <li><strong>Antecedentes:</strong> Marque los factores de riesgo previos y alergias confirmadas.</li>
                    <li><strong>Event Record:</strong> Registre los detalles de la reacción actual (trigger, tiempo, lugar).</li>
                    <li><strong>Calculadora:</strong> Seleccione todos los síntomas observados. El sistema calculará la gravedad en tiempo real.</li>
                </ol>
                <div style={{marginTop: '20px', padding: '15px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe'}}>
                    <strong>Privacidad:</strong> No guardamos nombres ni apellidos. El NHC se convierte en un hash irreversible mediante SHA-256 antes de ser enviado a la base de datos.
                </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL DE LA APP */}
        {tabActiva === 'app' && (
          <>
            {view === 'perfil' && <MenuView setView={setView} cargarPacientesExistentes={cargarPacientesExistentes} cargarHistorial={cargarHistorial} />}
            
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
                validarYPasarAEvento={validarYPasarAEvento} 
                setView={setView} 
                esPacienteExistente={esPacienteExistente} 
                listaPacientes={listaPacientes}
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
          </>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

export default App;