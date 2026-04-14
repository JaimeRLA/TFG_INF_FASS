# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

## [2.1.0] - 2026-04-14

### 🔄 CORRECCIÓN CRÍTICA

#### Actualización de Contexto Clínico
- **FASS corregido**: Food Allergy Severity Score (NO Sjögren's Syndrome)
- Base de conocimiento actualizada para reflejar alergias alimentarias
- Sistema de prompts del agente IA actualizado
- Documentación corregida en README y knowledge_base

#### Contexto Actualizado
- **FASS**: Food Allergy Severity Score - Escala de severidad de alergia alimentaria
- **oFASS**: Formato ordinal (3 y 5 grados) generado por consenso de expertos
- **nFASS**: Score numérico calculado mediante modelado matemático
- **Objetivo**: Evaluar severidad de reacciones alérgicas a alimentos

#### Base de Conocimiento Expandida
- FAQ actualizado con información correcta sobre alergias alimentarias
- Nuevas entradas sobre:
  - Alérgenos alimentarios comunes (leche, huevo, cacahuete, frutos secos, etc.)
  - Cofactores que aumentan severidad (ejercicio, AINEs, alcohol)
  - Reacciones bifásicas (10-20% de anafilaxias)
  - Criterios de uso de adrenalina
  - Diferenciación entre reacciones IgE y no IgE mediadas

#### Agente IA Actualizado
- Prompts especializados en alergias alimentarias
- Tópicos permitidos expandidos: alérgenos, anafilaxia, adrenalina, etc.
- Sugerencias de ayuda contextualizadas a reacciones alérgicas
- Restricción estricta al dominio de alergias alimentarias

---

## [2.0.0] - 2026-04-14

### ✨ Añadido

#### Sistema de Notificaciones Toast
- Nuevo componente `Toast` con 4 tipos de notificaciones (success, error, warning, info)
- Hook personalizado `useToast` para gestión centralizada de notificaciones
- Animaciones de entrada/salida suaves
- Auto-cierre configurable por notificación
- Múltiples toasts simultáneos apilados

#### Loading States
- Componente `LoadingSpinner` con 3 tamaños (small, medium, large)
- Spinner fullscreen para operaciones pesadas
- Estados de carga específicos:
  - `isLoadingHistorial`: Carga de historial clínico
  - `isLoadingPacientes`: Carga de lista de pacientes 
  - `isCalculating`: Cálculo de score FASS
  - `isDeleting`: Eliminación de evaluaciones
- Botones deshabilitados durante operaciones asíncronas
- Feedback visual inmediato en todas las interacciones

#### Validación de Formularios
- Componente `FormField` para validación visual consistente
- Validación en tiempo real con feedback inmediato
- Campos obligatorios marcados con asterisco `*` rojo
- Mensajes de error específicos bajo cada campo
- Validaciones implementadas:
  - NHC duplicado con detección via hash SHA-256
  - Fecha de nacimiento futura bloqueada
  - Rango de edad lógico (máximo 120 años)
  - Género obligatorio
  - Al menos 1 síntoma seleccionado

#### Manejo de Errores Mejorado
- Mensajes de error específicos según contexto
- Logs en consola para debugging (desarrollo)
- Diferentes mensajes para:
  - Errores de red/conectividad
  - Validación de datos
  - Permisos/autenticación
  - Operaciones fallidas

### 🔄 Cambiado

- **Reemplazados todos los `alert()` nativos** por notificaciones toast
- **Mejoradas confirmaciones** de acciones destructivas con mensajes más claros
- **Exportación CSV** ahora muestra mensaje de éxito con contador de registros
- **Descarga PDF** con feedback visual mejorado
- **Vista CalculadoraView** ahora recibe prop `isCalculating` para mostrar estado de carga
- **Botón "Calcular"** muestra spinner animado durante procesamiento

### 🐛 Corregido

- Color de texto en input del chatbot (ahora visible)
- Doble envío de formularios durante procesamiento
- Falta de feedback en operaciones asíncronas largas
- Mensajes de error genéricos confusos

### 🎨 Mejorado

- Consistencia visual en todos los mensajes de feedback
- UX más fluida con indicadores de progreso
- Reducción de frustración del usuario con validación preventiva
- Accesibilidad mejorada con iconos descriptivos

---

## [1.0.0] - 2026-03-01

### Lanzamiento Inicial

- Sistema de evaluación nFASS/oFASS
- Gestión de pacientes con pseudonimización
- Historial clínico completo
- Exportación PDF y CSV
- Chatbot de IA para consultas clínicas
- Autenticación de usuarios médicos
- Base de datos PostgreSQL/SQLite

---

## Tipos de Cambios

- `✨ Añadido` - Nuevas funcionalidades
- `🔄 Cambiado` - Cambios en funcionalidades existentes
- `🗑️ Deprecado` - Funcionalidades que serán eliminadas
- `🐛 Corregido` - Corrección de bugs
- `🔒 Seguridad` - Cambios de seguridad
- `🎨 Mejorado` - Mejoras de UX/UI
