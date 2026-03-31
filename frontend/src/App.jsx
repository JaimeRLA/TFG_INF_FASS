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
    const ev = p.evento_json || {};
    const resp = p.respuestas_json || {};
    const sints = p.sintomas || [];

    const htmlContent = `
      <html>
        <head>
          <title>Reporte Clínico - ${p.nhc_hash.substring(0,8)}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .title { color: #2563eb; font-size: 26px; font-weight: bold; margin: 0; }
            .badge { background: #eff6ff; color: #2563eb; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: bold; border: 1px solid #bfdbfe; }
            .section { margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
            .section-title { background: #f8fafc; padding: 8px 15px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; }
            .content { padding: 15px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
            .label { display: block; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .value { font-size: 14px; color: #0f172a; font-weight: 500; }
            .result-container { display: flex; gap: 15px; margin-top: 10px; }
            .result-card { flex: 1; text-align: center; padding: 15px; border-radius: 10px; border: 2px solid #e2e8f0; }
            .result-card.highlight { border-color: #2563eb; background: #f0f7ff; }
            .big-number { font-size: 30px; font-weight: 800; color: #2563eb; margin: 5px 0; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">FASS System - Informe Clínico</h1>
              <p style="margin:4px 0;">ID Registro: ${p.id} | Fecha Informe: ${new Date().toLocaleString()}</p>
            </div>
            <div class="badge">CONFIDENCIAL</div>
          </div>

          <div class="section">
            <div class="section-title">1. Identificación del Paciente</div>
            <div class="content">
              <div class="grid">
                <div><span class="label">NHC (Hash)</span><span class="value" style="font-family:monospace;">${p.nhc_hash}</span></div>
                <div><span class="label">Género</span><span class="value">${p.genero === 'M' ? 'Masculino' : 'Femenino'}</span></div>
                <div><span class="label">Rango Edad</span><span class="value">${p.rango_edad}</span></div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. Detalles de la Reacción (Event Record)</div>
            <div class="content">
              <div class="grid">
                <div><span class="label">Fecha Evento</span><span class="value">${ev.reaccion_fecha || '-'}</span></div>
                <div><span class="label">Duración</span><span class="value">${ev.duration || '-'}</span></div>
                <div><span class="label">Ubicación</span><span class="value">${ev.location || '-'}</span></div>
                <div><span class="label">Actividad</span><span class="value">${ev.activity || '-'}</span></div>
                <div><span class="label">Adrenalina</span><span class="value">${ev.adrenaline || 'No'}</span></div>
                <div><span class="label">Ambulancia</span><span class="value">${ev.ambulance || 'No'}</span></div>
              </div>
              <div style="margin-top:10px;">
                <span class="label">Disparadores Sospechados</span>
                <span class="value">${[ev.trigger_food, ev.trigger_drug, ev.trigger_insect].filter(Boolean).join(', ') || 'Desconocido'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">3. Síntomas Registrados</div>
            <div class="content">
              <span class="value">${sints.join(' • ') || 'No hay síntomas registrados individualmente'}</span>
              <div style="margin-top:10px; padding-top:10px; border-top: 1px dashed #e2e8f0;">
                <span class="label">Notas adicionales</span>
                <span class="value">${ev.other_info || 'Sin observaciones.'}</span>
              </div>
            </div>
          </div>

          <div class="section" style="border:none;">
            <div class="section-title" style="background:#1e293b; color:white; border-radius:10px 10px 0 0;">4. Evaluación de Gravedad</div>
            <div class="result-container">
              <div class="result-card highlight">
                <span class="label">Scoring nFASS</span>
                <div class="big-number">${p.nfass}</div>
                <span class="value">Puntos</span>
              </div>
              <div class="result-card">
                <span class="label">Grado oFASS</span>
                <div class="big-number" style="color:#0f172a;">${p.ofass_grade}</div>
                <span class="value">Gravedad</span>
              </div>
              <div class="result-card">
                <span class="label">Nivel Riesgo</span>
                <div class="big-number" style="color:${p.risk_level === 'Alto' ? '#ef4444' : '#10b981'}; font-size:22px;">${p.risk_level.toUpperCase()}</div>
                <span class="value">Prioridad</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Este documento es un reporte técnico generado por nFASS v2.0. Requiere validación y firma facultativa.</p>
            <br/><br/>
            <p>Firma del Médico (${usuarioLogueado}): __________________________________________</p>
          </div>
          
          <script>
            window.onload = function() { 
              setTimeout(() => { window.print(); window.onafterprint = function() { window.close(); }; }, 500); 
            };
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