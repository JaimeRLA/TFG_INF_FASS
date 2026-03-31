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
    link.setAttribute("download", `Historial_FASS_Completo_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  const generarReportePDF = (p) => {
    const printWindow = window.open('', '_blank');
    const ev = p.evento_json || {};
    const resp = p.respuestas_json || {};
    const sintomasList = p.sintomas || [];

    // Mapeo de Antecedentes para lectura fácil
    const labelMap = {
      q1: "Alergias Confirmadas", q2_foods: "Alergia Alimentos", q2_insects: "Alergia Insectos",
      q2_meds: "Alergia Medicamentos", q3_anti: "Antihistamínicos", q3_nasal: "Sprays Nasales",
      q3_puff: "Inhaladores", q4: "Adrenalina Prescrita", q5: "Suplementos/Otros",
      q6_rhin: "Rinitis Alérgica", q6_asth: "Asma", q6_ecze: "Eczema",
      q6_hive: "Urticaria", q6_head: "Cefaleas", q9: "Historia Familiar",
      q7: "Mascotas", q10: "Otras Cirugías/Problemas"
    };

    const htmlContent = `
      <html>
        <head>
          <title>Reporte nFASS - ${p.nhc_hash.substring(0,8)}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.4; font-size: 13px; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .title { color: #2563eb; font-size: 24px; font-weight: bold; margin: 0; }
            .badge { background: #f1f5f9; padding: 4px 10px; border-radius: 5px; font-size: 11px; font-weight: bold; color: #475569; border: 1px solid #e2e8f0; }
            .section { margin-bottom: 18px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            .section-title { background: #f8fafc; padding: 8px 15px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-transform: uppercase; }
            .content { padding: 12px 15px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
            .label { display: block; font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
            .value { font-size: 13px; color: #0f172a; font-weight: 500; }
            .check-item { display: inline-block; width: 48%; margin-bottom: 5px; }
            .check-box { font-weight: bold; color: #2563eb; }
            .result-container { display: flex; gap: 15px; margin-top: 10px; }
            .result-card { flex: 1; text-align: center; padding: 12px; border-radius: 8px; border: 2px solid #e2e8f0; }
            .result-card.highlight { border-color: #2563eb; background: #eff6ff; }
            .big-number { font-size: 28px; font-weight: 800; color: #2563eb; margin: 2px 0; }
            .symptom-tag { display: inline-block; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; margin: 2px; font-size: 11px; border: 1px solid #e2e8f0; }
            .footer { margin-top: 35px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">FASS System - Reporte Clínico Detallado</h1>
              <p style="margin:2px 0;">ID Evaluación: ${p.id} | Generado: ${new Date().toLocaleString()}</p>
            </div>
            <div class="badge">PROPIEDAD DEL FACULTATIVO</div>
          </div>

          <div class="section">
            <div class="section-title">1. Información del Paciente</div>
            <div class="content">
              <div class="grid">
                <div><span class="label">Identificador (Hash)</span><span class="value" style="font-size:11px;">${p.nhc_hash}</span></div>
                <div><span class="label">Género</span><span class="value">${p.genero === 'M' ? 'Masculino' : 'Femenino'}</span></div>
                <div><span class="label">Rango de Edad</span><span class="value">${p.rango_edad}</span></div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. Antecedentes y Cuestionario Clínico</div>
            <div class="content">
              ${Object.entries(labelMap).map(([key, label]) => `
                <div class="check-item">
                  <span class="check-box">${resp[key] === 'Yes' ? '☑' : '☐'}</span> 
                  <span class="value">${label}</span>
                </div>
              `).join('')}
              ${resp.q1_details || resp.q2_details || resp.q5_details ? `
                <div style="margin-top:10px; padding:8px; background:#fefce8; border-radius:5px; border:1px solid #fef08a;">
                  <span class="label">Detalles de Antecedentes:</span>
                  <span class="value">${[resp.q1_details, resp.q2_details, resp.q5_details].filter(Boolean).join(' | ')}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">3. Detalles del Evento (Reacción Actual)</div>
            <div class="content">
              <div class="grid">
                <div><span class="label">Fecha/Hora</span><span class="value">${ev.reaccion_fecha || '-'}</span></div>
                <div><span class="label">Duración</span><span class="value">${ev.duration || '-'}</span></div>
                <div><span class="label">Ubicación</span><span class="value">${ev.location || '-'}</span></div>
                <div><span class="label">Adrenalina</span><span class="value" style="color:${ev.adrenaline === 'Yes' ? '#ef4444' : 'inherit'}; font-weight:bold;">${ev.adrenaline || 'No'}</span></div>
                <div><span class="label">Ambulancia</span><span class="value">${ev.ambulance || 'No'}</span></div>
                <div><span class="label">Tratamiento Otros</span><span class="value">${ev.other_treatment_yn === 'Yes' ? 'Sí' : 'No'}</span></div>
              </div>
              <div style="margin-top:10px; border-top:1px dashed #e2e8f0; padding-top:8px;">
                <span class="label">Triggers Sospechados:</span>
                <span class="value">${[ev.trigger_food, ev.trigger_insect, ev.trigger_drug].filter(Boolean).join(', ') || 'No especificado'}</span>
              </div>
              ${ev.other_treatment_details ? `<div><span class="label">Detalle tratamiento:</span><span class="value">${ev.other_treatment_details}</span></div>` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">4. Hallazgos Clínicos (Síntomas)</div>
            <div class="content">
              ${sintomasList.length > 0 ? 
                sintomasList.map(s => `<span class="symptom-tag">${s}</span>`).join('') : 
                '<span class="value">No se registraron síntomas específicos.</span>'}
              <div style="margin-top:10px;">
                <span class="label">Notas Clínicas adicionales:</span>
                <p class="value" style="margin-top:2px; font-style:italic;">${ev.other_info || 'Sin observaciones adicionales.'}</p>
              </div>
            </div>
          </div>

          <div class="section" style="border:none;">
            <div class="section-title" style="background:#1e293b; color:white; border-radius:8px 8px 0 0;">5. Escalas de Gravedad Finales</div>
            <div class="result-container">
              <div class="result-card highlight">
                <span class="label">Puntuación nFASS</span>
                <div class="big-number">${p.nfass}</div>
                <span class="value">Puntos Totales</span>
              </div>
              <div class="result-card">
                <span class="label">Escala oFASS</span>
                <div class="big-number" style="color:#0f172a;">${p.ofass_grade}</div>
                <span class="value">Grado Clínico</span>
              </div>
              <div class="result-card">
                <span class="label">Riesgo Estimado</span>
                <div class="big-number" style="color:${p.risk_level === 'Alto' ? '#ef4444' : '#10b981'}; font-size:20px;">${p.risk_level.toUpperCase()}</div>
                <span class="value">Nivel de Acción</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Este informe es un documento de apoyo clínico. La decisión final depende del criterio del médico.</p>
            <p style="margin-top:20px;">Firma del Facultativo (${usuarioLogueado}): __________________________________________</p>
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