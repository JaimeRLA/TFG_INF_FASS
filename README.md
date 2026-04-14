# FASS System - Food Allergy Severity Score

Sistema web para evaluación clínica de reacciones alérgicas alimentarias basado en la escala FASS.

## 📋 ¿Qué es FASS?

**FASS (Food Allergy Severity Score)** es una escala de severidad de alergia alimentaria desarrollada mediante consenso multidisciplinario de expertos, disponible en dos formatos:

- **oFASS (ordinal)**: Clasificación por grados (3 y 5 niveles) generada por consenso de expertos
- **nFASS (numerical)**: Score numérico calculado mediante modelado matemático

La escala evalúa la severidad de reacciones alérgicas a alimentos basándose en síntomas clínicos observados en múltiples sistemas orgánicos.

## 🚀 Características Principales

- ✅ Evaluación nFASS y oFASS automatizada
- 🔒 Protección de datos (pseudonimización NHC con SHA-256)
- 📊 Registro de eventos alérgicos y historial clínico
- 📄 Exportación a PDF y CSV
- 🤖 Asistente de IA especializado en alergias alimentarias
- ⚡ Interfaz moderna y responsiva
- 🚨 Detección de anafilaxia y alertas de severidad

## 🆕 Mejoras Recientes (v2.0)

### Sistema de Notificaciones Toast
- Reemplazados todos los alerts nativos por notificaciones toast modernas
- 4 tipos: success (verde), error (rojo), warning (amarillo), info (azul)
- Auto-cierre configurable con animaciones suaves

### Loading States
- Spinners visuales en todas las operaciones asíncronas
- Indicadores de progreso específicos (cargando historial, calculando, eliminando)
- Overlay de pantalla completa para operaciones pesadas
- Botones deshabilitados durante procesamiento

### Validación de Formularios
- Validación en tiempo real con feedback visual
- Campos obligatorios marcados con asterisco rojo
- Mensajes de error específicos bajo cada campo
- Validación de NHC duplicado
- Validación de fechas de nacimiento lógicas

### Manejo de Errores Mejorado
- Mensajes específicos según tipo de error
- Logs en consola para debugging
- Captura de errores de red con mensajes amigables
- Confirmaciones para acciones destructivas

## 📦 Instalación

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Stack Tecnológico

**Frontend:**
- React 18
- Axios
- Lucide React (iconos)
- CryptoJS (encriptación)
- Vite (build tool)

**Backend:**
- FastAPI
- PostgreSQL / SQLite
- Groq AI (chatbot)
- NumPy (cálculos)

## 🔧 Configuración

Crear archivo `.env` en `/frontend`:
```env
VITE_APP_TFG_KEY=tu_clave_secreta
VITE_APP_API_URL=https://tu-backend.com
```

Crear archivo `.env` en `/backend`:
```env
DATABASE_URL=postgresql://...
APP_SECRET_KEY=tu_secret_key
GROQ_API_KEY=tu_groq_key
```

## 📚 Componentes Nuevos

### Toast (Notificaciones)
```jsx
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';

const { success, error, warning, info } = useToast();

// Uso:
success("Evaluación de reacción alérgica guardada correctamente");
error("No se pudo conectar al servidor");
warning("Debe seleccionar al menos un síntoma");
info("Paciente con historia de anafilaxia previa");
```

### LoadingSpinner
```jsx
import LoadingSpinner from './components/LoadingSpinner';

<LoadingSpinner 
  size="medium" 
  message="Cargando datos..." 
  fullScreen={true} 
/>
```

### FormField (Validación visual)
```jsx
import FormField from './components/FormField';

<FormField 
  label="NHC del Paciente" 
  error={errorNHC}
  required={true}
  helpText="Identificador único del paciente"
>
  <input type="text" name="nhc" />
</FormField>
```

## 🎨 Paleta de Colores

- **Primario:** `#2563eb` (azul)
- **Secundario:** `#1e293b` (azul oscuro)
- **Success:** `#16a34a` (verde)
- **Error:** `#dc2626` (rojo)
- **Warning:** `#f59e0b` (amarillo)
- **Info:** `#60a5fa` (azul claro)
- **Background:** `#f1f5f9` (gris muy claro)

## 📖 Documentación Adicional

- [Escala FASS Food Allergy](docs/FASS_Scale.md)
- [Criterios de Anafilaxia](docs/Anaphylaxis_Criteria.md)
- [API Reference](docs/API.md)
- [Guía de Usuario](docs/User_Guide.md)
- [Alérgenos Comunes](docs/Common_Allergens.md)

## 👨‍💻 Desarrollo

### Comandos útiles
```bash
# Frontend dev
npm run dev

# Backend dev
uvicorn app.main:app --reload

# Build producción
npm run build

# Preview build
npm run preview
```

## 🔐 Seguridad

- Pseudonimización SHA-256 de identificadores de pacientes (NHC)
- Headers de seguridad CORS configurados
- Validación server-side de todos los inputs
- Encriptación de datos sensibles en tránsito (HTTPS)
- Cumplimiento RGPD para datos médicos
- No se almacenan identificadores personales en texto plano

## 📄 Licencia

Proyecto académico - TFG Informática
Universidad [Nombre]

---

**Autor:** Jaime Ruiz
**Versión:** 2.0.0
**Última actualización:** Abril 2026
