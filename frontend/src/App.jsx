import React, { useState } from 'react';
import axios from 'axios';
import { HeartPulse, LogOut, Info, BookOpen, HelpCircle, Home, ShieldCheck, Database, Zap, FileText, Activity } from 'lucide-react';

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
          <HeartPulse size={30} color="#1e293b" />
          <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0, fontWeight: '800' }}>FASS System</h1>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <nav style={{ display: 'flex', gap: '5px', backgroundColor: '#f8fafc', padding: '5px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <button onClick={() => setTabActiva('app')} style={tabActiva === 'app' ? styles.tabActive : styles.tabInactive}>
            <Home size={16} color="currentColor" /> Aplicación
          </button>
          <button onClick={() => setTabActiva('puntuacion')} style={tabActiva === 'puntuacion' ? styles.tabActive : styles.tabInactive}>
            <BookOpen size={16} color="currentColor" /> Escala nFASS
          </button>
          <button onClick={() => setTabActiva('about')} style={tabActiva === 'about' ? styles.tabActive : styles.tabInactive}>
            <HelpCircle size={16} color="currentColor" /> Ayuda
          </button>
        </nav>

        <button onClick={() => setUsuarioLogueado(null)} style={styles.logoutBtn}><LogOut size={18} /> Salir</button>
      </header>

      <div style={{ padding: '20px', maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* PESTAÑA: ESCALA NFASS (DETALLADA) */}
        {tabActiva === 'puntuacion' && (
          <div style={{...styles.infoCard, backgroundColor: '#ffffff', color: '#1e293b'}}>
            <button onClick={() => setTabActiva('app')} style={styles.closeBtn}>×</button>
            <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '25px' }}>
                <h2 style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <BookOpen size={28} /> Comprensión de las Escalas nFASS y oFASS
                </h2>
                <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1.1rem' }}>Soporte a la decisión clínica basado en algoritmos de ponderación logarítmica.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={20} color="#2563eb" /> nFASS (Numerical Score)
                    </h3>
                    <p style={{ lineHeight: '1.6', color: '#334155' }}>
                        A diferencia de las escalas tradicionales, el <strong>nFASS</strong> es una métrica continua que calcula la gravedad exacta mediante la fórmula:
                        <code style={{ display: 'block', padding: '15px', background: '#f8fafc', borderRadius: '10px', margin: '15px 0', border: '1px solid #e2e8f0', color: '#2563eb', fontWeight: 'bold' }}>
                            nFASS = log2(Σ 2^ε * (1 + λ)) + 2
                        </code>
                        Donde <strong>ε (épsilon)</strong> representa el peso de los síntomas y <strong>λ (lambda)</strong> el impacto de los cofactores/antecedentes.
                    </p>
                </div>
                <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} color="#16a34a" /> oFASS (Ordinal Grade)
                    </h3>
                    <p style={{ lineHeight: '1.6', color: '#334155' }}>
                        Es la categorización clínica en 5 grados de gravedad. Los grados <strong>4 y 5</strong> indican anafilaxia grave con riesgo vital inmediato y una correlación de <strong>Odds Ratio 188.9</strong> para el uso de adrenalina.
                    </p>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px'}}>
                <div style={{padding: '20px', borderRadius: '15px', border: '1px solid #bbf7d0', background: '#f0fdf4'}}>
                    <h4 style={{margin: '0 0 10px 0', color: '#16a34a', fontWeight: '800'}}>LEVE (Grados 1-2)</h4>
                    <p style={{margin: 0, fontSize: '0.9rem', color: '#166534'}}>Afectación cutánea (urticaria, angioedema) o gastrointestinal moderada. Riesgo bajo de compromiso sistémico.</p>
                </div>
                <div style={{padding: '20px', borderRadius: '15px', border: '1px solid #fed7aa', background: '#fff7ed'}}>
                    <h4 style={{margin: '0 0 10px 0', color: '#ea580c', fontWeight: '800'}}>MODERADO (Grado 3)</h4>
                    <p style={{margin: 0, fontSize: '0.9rem', color: '#9a3412'}}>Compromiso respiratorio (sibilancias, tos persistente) o cardiovascular leve. Requiere monitorización clínica.</p>
                </div>
                <div style={{padding: '20px', borderRadius: '15px', border: '1px solid #fecdd3', background: '#fff1f2'}}>
                    <h4 style={{margin: '0 0 10px 0', color: '#dc2626', fontWeight: '800'}}>GRAVE (Grados 4-5)</h4>
                    <p style={{margin: 0, fontSize: '0.9rem', color: '#991b1b'}}>Fallo multiorgánico, colapso circulatorio, estridor o cianosis. <strong>Administración de adrenalina prioritaria.</strong></p>
                </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: ABOUT / AYUDA (DETALLADA) */}
        {tabActiva === 'about' && (
          <div style={{...styles.infoCard, backgroundColor: '#ffffff', color: '#1e293b'}}>
            <button onClick={() => setTabActiva('app')} style={styles.closeBtn}>×</button>
            <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '25px' }}>
                <h2 style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <HelpCircle size={28} /> Manual Operativo del Sistema
                </h2>
                <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1.1rem' }}>Guía técnica para la gestión de evaluaciones de reacciones alérgicas.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Zap color="#2563eb" size={24} />
                        <h4 style={{ margin: 0, fontWeight: '800' }}>Flujo de Trabajo</h4>
                    </div>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.95rem', color: '#475569', lineHeight: '2' }}>
                        <li><strong>Paciente:</strong> NHC + Demográficos.</li>
                        <li><strong>Antecedentes:</strong> Factores de riesgo.</li>
                        <li><strong>Event Record:</strong> Cronología del evento.</li>
                        <li><strong>Calculadora:</strong> Diagnóstico clínico.</li>
                    </ul>
                </div>

                <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <ShieldCheck color="#16a34a" size={24} />
                        <h4 style={{ margin: 0, fontWeight: '800' }}>Seguridad RGPD</h4>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
                        El NHC real es seudonimizado localmente mediante <strong>SHA-256</strong>. El servidor solo recibe un Hash irreversible, garantizando que la identidad del paciente nunca sea expuesta en la nube.
                    </p>
                </div>

                <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Database color="#ea580c" size={24} />
                        <h4 style={{ margin: 0, fontWeight: '800' }}>Investigación</h4>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
                        Desde el <strong>Historial Global</strong>, el facultativo puede exportar todos los datos en formato CSV para análisis estadísticos o reportes individuales en PDF para la historia clínica.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '30px', padding: '20px', background: '#eff6ff', borderRadius: '15px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <Info size={24} color="#2563eb" style={{ flexShrink: 0 }} />
                <div>
                    <strong style={{ display: 'block', marginBottom: '5px' }}>Asistencia Clínica:</strong>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
                        En la esquina inferior derecha dispone de un <strong>Asistente Clínico Inteligente</strong>. Puede consultarle sobre dosis, interpretación de síntomas críticos (Estridor, Colapso) o dudas operativas sobre el sistema nFASS.
                    </p>
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