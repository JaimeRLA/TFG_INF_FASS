# FASS — Food Allergy Severity Score

> Sistema web clínico para la evaluación automatizada de reacciones alérgicas alimentarias basado en la escala FASS. Desarrollado como Trabajo de Fin de Grado en Ingeniería Informática.

**Demo en producción:**
- Frontend: https://tfg-inf-fass-1.onrender.com
- Backend API: https://tfg-inf-fass.onrender.com

---

## Índice

1. [¿Qué es FASS?](#qué-es-fass)
2. [Arquitectura](#arquitectura)
3. [Stack tecnológico](#stack-tecnológico)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Instalación y desarrollo local](#instalación-y-desarrollo-local)
6. [Variables de entorno](#variables-de-entorno)
7. [API — Endpoints](#api--endpoints)
8. [Base de datos](#base-de-datos)
9. [Seguridad y privacidad](#seguridad-y-privacidad)
10. [Flujo de registro de médicos](#flujo-de-registro-de-médicos)
11. [Vistas del frontend](#vistas-del-frontend)
12. [Asistente de IA](#asistente-de-ia)
13. [Despliegue en Render](#despliegue-en-render)
14. [Autor y licencia](#autor-y-licencia)

---

## ¿Qué es FASS?

**FASS (Food Allergy Severity Score)** es una escala clínica de severidad de alergia alimentaria desarrollada mediante consenso multidisciplinario de expertos. Evalúa la gravedad de una reacción alérgica a partir de los síntomas observados en múltiples sistemas orgánicos (cutáneo, respiratorio, cardiovascular, gastrointestinal, neurológico).

La escala se presenta en dos formatos:

| Formato | Descripción |
|---------|-------------|
| **oFASS** (ordinal) | Grado 1–5 con categoría textual (Mild, Moderate, Severe, Very Severe, Anaphylaxis) |
| **nFASS** (numérico) | Score continuo calculado con modelado matemático logarítmico |

### Fórmula nFASS

Para cada sistema orgánico afectado se calcula su contribución:

$$nFASS_{organo} = 2^{\varepsilon} \cdot (1 + \sum \lambda_i)$$

Donde $\varepsilon$ es el peso del sistema orgánico y $\lambda_i$ el peso de cada síntoma. El score final es:

$$nFASS = \log_2\left(\sum_{organos} nFASS_{organo}\right) + 2$$

---

## Arquitectura

```
Navegador (React SPA)
        │  HTTPS / Axios
        ▼
  Render CDN (frontend estático)
        │
        │  HTTPS / JSON
        ▼
  Render Web Service (FastAPI + Uvicorn)
        │          │          │
        ▼          ▼          ▼
  PostgreSQL    Brevo SMTP   Groq API
  fass_db3      (email)      (LLaMA 3.3 70B)
  Render Oregon
```

- El frontend es una **SPA React sin React Router**: la navegación se gestiona mediante `useState('view')` en `App.jsx`.
- El backend es una **API FastAPI** con Uvicorn como servidor ASGI.
- La base de datos es **PostgreSQL** en Render (Oregon). En desarrollo local se usa SQLite como fallback automático.

---

## Stack tecnológico

### Frontend

| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.2 | Framework SPA |
| Vite | 7.2 | Build tool y dev server |
| Axios | 1.13 | Peticiones HTTP al backend |
| Lucide React | 0.563 | Iconografía |

### Backend

| Librería | Versión | Uso |
|----------|---------|-----|
| FastAPI | latest | Framework API REST |
| Uvicorn | latest | Servidor ASGI |
| psycopg2-binary | latest | Driver PostgreSQL |
| passlib[bcrypt] | 1.7.4 | Hash de contraseñas |
| bcrypt | 4.0.1 | Backend nativo bcrypt |
| cryptography | latest | Cifrado Fernet AES-128-CBC |
| groq | latest | Cliente Groq SDK (IA) |
| numpy | latest | Cálculo nFASS |
| pydantic[email] | latest | Validación de modelos |
| python-multipart | latest | Formularios multipart |

---

## Estructura del proyecto

```
TFG_INF_FASS/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # Endpoints FastAPI, init BD, lógica email
│       ├── logic.py           # Algoritmo nFASS/oFASS
│       ├── security.py        # Fernet encrypt/decrypt, bcrypt, SHA-256, rangos edad
│       ├── data_models.py     # Modelos Pydantic (LoginRequest, RegisterRequest, EvaluacionRequest)
│       ├── sintomas.py        # Base de datos de síntomas con pesos λ y ε
│       ├── knowledge_base.py  # Base de conocimiento del chatbot
│       ├── agent_logic.py     # SYSTEM_PROMPT del asistente IA
│       └── routes/
│           └── agent_routes.py
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx            # Máquina de estados de navegación
│       ├── main.jsx
│       ├── components/
│       │   ├── ChatBot.jsx
│       │   ├── FormField.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── Navbar.jsx
│       │   ├── ResultadoCard.jsx
│       │   └── Toast.jsx
│       ├── hooks/
│       │   └── useToast.js
│       ├── views/
│       │   ├── Login.jsx
│       │   ├── MenuView.jsx
│       │   ├── DashboardView.jsx
│       │   ├── SeleccionarPacienteView.jsx
│       │   ├── AntecedentesView.jsx
│       │   ├── EventRecordView.jsx
│       │   ├── CalculadoraView.jsx
│       │   ├── PuntuacionView.jsx
│       │   ├── HistorialView.jsx
│       │   └── AboutView.jsx
│       ├── data/
│       │   └── sintomas.js
│       └── utils/
│           └── pdfGenerator.js
└── docs/
    ├── arquitectura.html / .png
    ├── backend_flow.html / .png
    └── endpoints.html / .png
```

---

## Instalación y desarrollo local

### Requisitos previos

- Python 3.10+
- Node.js 18+
- (Opcional) PostgreSQL local — sin él usa SQLite automáticamente

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API disponible en http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App disponible en http://localhost:5173
```

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | No* | URL de conexión PostgreSQL. Sin ella usa SQLite local |
| `APP_SECRET_KEY` | Sí | Clave compartida para autenticar peticiones clínicas (`x-tfg-key`) |
| `ENCRYPTION_KEY` | Sí | Frase de la que se deriva la clave Fernet (SHA-256) para cifrado en reposo |
| `GROQ_API_KEY` | Sí | API key de Groq para el chatbot LLaMA |
| `SMTP_USER` | Sí | Usuario SMTP de Brevo |
| `SMTP_PASSWORD` | Sí | Contraseña SMTP de Brevo |
| `FROM_EMAIL` | No | Remitente de emails (defecto: dirección del autor) |
| `BACKEND_URL` | No | URL pública del backend (para links en emails) |
| `FRONTEND_URL` | No | URL pública del frontend (para links en emails) |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_APP_TFG_KEY` | Valor de `APP_SECRET_KEY` para incluir en cabecera `x-tfg-key` |
| `VITE_APP_API_URL` | URL base del backend |

---

## API — Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/register` | Solicitud de alta de médico. Cifra PII y notifica al admin por email |
| `GET` | `/approve/{token}` | Aprobación de solicitud por admin. Crea usuario, borra PII, envía credenciales |
| `POST` | `/login` | Autenticación con bcrypt. Devuelve `username` y `nombre` |

### Clínica — requieren cabecera `x-tfg-key`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/calculate` | Registra evaluación: pseudonimiza NHC, calcula nFASS/oFASS, cifra y persiste |
| `GET` | `/history` | Historial de evaluaciones del médico autenticado. Descifra en servidor |
| `GET` | `/stats` | Estadísticas agregadas por médico y rango temporal |
| `GET` | `/pacientes_unicos` | Lista de pacientes del médico (NHC descifrado) |
| `DELETE` | `/evaluacion/{id}` | Elimina una evaluación. Devuelve 403 si el médico no es el autor |

### IA y utilidades

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/chat` | Chatbot médico especializado (LLaMA 3.3 70B vía Groq, dominio restringido) |
| `GET` | `/get_hash/{nhc}` | Devuelve el hash SHA-256 del NHC para búsqueda en frontend |

---

## Base de datos

### `usuarios`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PK | Identificador autoincremental |
| `username` | TEXT UNIQUE | Email del médico |
| `password` | TEXT | Hash bcrypt |
| `nombre` | TEXT | Nombre del médico (guardado en aprobación) |

### `solicitudes_registro`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PK | — |
| `email` | TEXT UNIQUE | Email en claro (identificador) |
| `nombre` | TEXT | Cifrado Fernet |
| `especialidad` | TEXT | Cifrado Fernet |
| `colegiado` | TEXT | Cifrado Fernet |
| `hospital` | TEXT | Cifrado Fernet |
| `telefono` | TEXT | Cifrado Fernet |
| `token` | TEXT UNIQUE | `secrets.token_urlsafe(32)` |
| `status` | TEXT | `'pending'` (se borra al aprobar) |
| `fecha` | TIMESTAMP | Automática |

### `pacientes`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PK | — |
| `nhc_hash` | TEXT UNIQUE | SHA-256 irreversible del NHC |
| `rango_edad` | TEXT | Categoría etaria (minimización de datos) |
| `genero` | TEXT | Cifrado Fernet |
| `medico` | TEXT | Username del facultativo responsable |

### `registros`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL PK | — |
| `paciente_id` | INTEGER FK | Referencia a `pacientes.id` |
| `medico` | TEXT | Username del médico que registró |
| `respuestas_json` | TEXT | Antecedentes cifrados (Fernet JSON) |
| `evento_json` | TEXT | Detalles del evento cifrados (Fernet JSON) |
| `sintomas` | TEXT | IDs de síntomas cifrados (Fernet JSON) |
| `nfass` | REAL | Score numérico de severidad |
| `ofass_grade` | INTEGER | Grado ordinal 1–5 |
| `ofass_category` | TEXT | Categoría textual del grado |
| `risk_level` | TEXT | Nivel de riesgo clínico |
| `fecha` | TIMESTAMP | Automática |

---

## Seguridad y privacidad

### Tránsito — TLS/HTTPS

Toda la comunicación entre cliente y servidor viaja cifrada. Render termina TLS delante de ambos servicios (frontend y backend) con certificados gestionados por la plataforma.

### Autenticación — bcrypt

Las contraseñas se hashean con `passlib[bcrypt]` (rounds=12, salt aleatorio de 128 bits). Protege contra fuerza bruta, diccionario y tablas arcoíris. Las contraseñas iniciales se generan con `secrets.token_urlsafe(10)`.

### Autorización — `x-tfg-key` + CORS

Los cinco endpoints clínicos requieren la cabecera `x-tfg-key` con el valor de `APP_SECRET_KEY`. CORS limita el origen a tres dominios permitidos. El endpoint `DELETE /evaluacion/{id}` verifica además que el médico que borra sea el autor del registro (HTTP 403 si no).

### Cifrado en reposo — Fernet AES-128-CBC

Los campos clínicos (`respuestas_json`, `evento_json`, `sintomas`, `genero`) y los datos PII de solicitudes (`nombre`, `especialidad`, `colegiado`, `hospital`, `telefono`) se cifran con Fernet antes de persistir. La clave Fernet de 32 bytes se deriva de `ENCRYPTION_KEY` mediante SHA-256:

```python
key = base64.urlsafe_b64encode(hashlib.sha256(SECRET_PHRASE.encode()).digest())
cipher = Fernet(key)
```

### Pseudonimización — SHA-256 del NHC

El NHC del paciente nunca se almacena. Se sustituye por su hash SHA-256 irreversible (`nhc_hash`). La fecha de nacimiento exacta tampoco se guarda: se convierte en rango etario (`18-29`, `30-49`, etc.) aplicando minimización de datos.

### Ciclo de vida de datos PII de solicitudes

Los datos personales del médico solicitante se cifran al recibir la solicitud y se **eliminan permanentemente** de la base de datos en el momento de la aprobación. Solo persiste en `usuarios` el email (username), el hash bcrypt y el nombre.

---

## Flujo de registro de médicos

```
1. Médico rellena formulario en frontend
         │
         ▼
2. POST /register
   → Cifra PII con Fernet → INSERT solicitudes_registro
   → Email al admin con datos en claro + botón "Aprobar"
         │
         ▼
3. Admin hace clic en enlace /approve/{token}
   → Descifra PII → genera contraseña aleatoria
   → INSERT usuarios (username, bcrypt_hash, nombre)
   → DELETE solicitudes_registro   ← PII eliminada
   → Email al médico con credenciales
         │
         ▼
4. Médico hace POST /login
   → bcrypt verify → devuelve {username, nombre}
   → Frontend guarda en sessionStorage
```

---

## Vistas del frontend

| Vista | Descripción |
|-------|-------------|
| `Login` | Autenticación. Guarda sesión en `sessionStorage` |
| `MenuView` | Menú principal de navegación |
| `DashboardView` | Estadísticas y resumen del médico |
| `SeleccionarPacienteView` | Búsqueda de paciente por NHC (hash) o creación nuevo |
| `AntecedentesView` | Formulario de antecedentes del paciente |
| `EventRecordView` | Registro del evento alérgico actual |
| `CalculadoraView` | Selección de síntomas para el cálculo FASS |
| `PuntuacionView` | Resultado nFASS/oFASS con indicador visual de severidad |
| `HistorialView` | Historial completo de evaluaciones. Exportación PDF/CSV |
| `AboutView` | Información sobre la escala FASS y el sistema |

La navegación no usa React Router. `App.jsx` mantiene un estado `view` que determina qué componente se renderiza.

---

## Asistente de IA

El chatbot (`/chat`) utiliza el modelo **LLaMA 3.3 70B** a través de la API de **Groq** con un `SYSTEM_PROMPT` de dominio estrictamente restringido a:

- Alergias alimentarias y reacciones alérgicas
- Escala FASS (nFASS y oFASS)
- Clasificación de severidad
- Alérgenos comunes
- Manejo de emergencias y anafilaxia

Cualquier pregunta fuera de este dominio recibe una respuesta de rechazo explícita. El timeout de la llamada a Groq es de 25 segundos.

---

## Despliegue en Render

| Servicio | Tipo | URL |
|----------|------|-----|
| Frontend | Static Site | https://tfg-inf-fass-1.onrender.com |
| Backend | Web Service | https://tfg-inf-fass.onrender.com |
| Base de datos | PostgreSQL | Render Oregon (interno) |

El backend detecta automáticamente si existe `DATABASE_URL` (PostgreSQL en producción) o usa SQLite local en desarrollo.

El email se envía vía **Brevo SMTP** en el puerto **2525** con STARTTLS.

---

## Autor y licencia

**Autor:** Jaime Ruiz López-Alvarado  
**Proyecto:** Trabajo de Fin de Grado — Ingeniería Informática  
**Versión:** 2.0.0  
**Última actualización:** Abril 2026  

Proyecto académico. Todos los derechos reservados.
