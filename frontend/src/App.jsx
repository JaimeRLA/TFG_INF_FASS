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

  // URL del Backend
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
      setView('seleccionar_paciente');
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
    if (!paciente.id || listaIds.length === 0) return alert("Faltan datos o síntomas.");

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

  // --- FUNCIONES DE DESCARGA ---

  const descargarTodoCSV = () => {
    if (listaPacientes.length === 0) return alert("No hay datos para exportar.");
    const encabezados = "ID_Interno,NHC_Hash,Genero,Rango_Edad,nFASS,oFASS,Riesgo,Fecha\n";
    const filas = listaPacientes.map(p => 
      `${p.id},${p.nhc_hash},${p.genero},${p.rango_edad},${p.nfass},${p.ofass_grade},${p.risk_level},${p.fecha}`
    ).join("\n");
    
    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Historial_Completo_FASS_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  const generarReportePDF = (p) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Reporte Clínico - ${p.nhc_hash.substring(0,8)}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .title { color: #2563eb; font-size: 24px; font-weight: bold; margin: 0; }
            .section { margin-bottom: 25px; padding: 15px; background: #f8fafc; border-radius: 8px; }
            .section-title { font-weight: bold; text-transform: uppercase; font-size: 14px; color: #64748b; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .label { font-weight: bold; color: #475569; }
            .result-box { text-align: center; padding: 20px; border: 2px solid #2563eb; border-radius: 12px; margin-top: 20px; }
            .nfass { font-size: 32px; color: #2563eb; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">FASS System - Informe de Evaluación</h1>
              <p>ID Evaluación: ${p.id} | Fecha: ${new Date(p.fecha).toLocaleString()}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Datos del Paciente (Pseudonimizado)</div>
            <div class="grid">
              <div><span class="label">NHC Hash:</span> ${p.nhc_hash}</div>
              <div><span class="label">Género:</span> ${p.genero === 'M' ? 'Masculino' : 'Femenino'}</div>
              <div><span class="label">Rango de Edad:</span> ${p.rango_edad}</div>
              <div><span class="label">Médico Responsable:</span> ${usuarioLogueado}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Resultados de Gravedad</div>
            <div class="result-box">
              <div>Puntuación nFASS</div>
              <div class="nfass">${p.nfass} Puntos</div>
              <div style="margin-top:10px; font-weight:bold;">Grado oFASS: ${p.ofass_grade} | Nivel de Riesgo: ${p.risk_level}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Notas de Seguridad</div>
            <p style="font-size: 11px; color: #94a3b8;">Este documento cumple con la normativa RGPD vigente. Los datos identificativos reales no se almacenan en este reporte impreso para garantizar la privacidad del paciente.</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
            descargarTodoCSV={descargarTodoCSV}
            generarReportePDF={generarReportePDF}
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
      </div>
      <ChatBot />
    </div>
  );
};

export default App;