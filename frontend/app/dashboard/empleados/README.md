# 👥 Gestión de Empleados - Frontend

Módulo completo para la gestión de empleados del Sistema MPD con CRUD, perfiles detallados y calendario personal.

## 🎯 Funcionalidades Implementadas

### 👥 Lista de Empleados (`/dashboard/empleados`)

**Características principales:**
- ✅ Tabla responsiva con información completa
- ✅ Filtros avanzados por estado, jerarquía y área
- ✅ Búsqueda por texto libre (nombre, legajo, email)
- ✅ Paginación con navegación intuitiva
- ✅ Exportación a Excel con filtros aplicados
- ✅ Estados visuales con badges y colores
- ✅ Acceso directo a perfil y edición
- ✅ Botones para nuevo empleado e importación

**Filtros disponibles:**
- **Por estado**: Todos, Activos, Inactivos
- **Por jerarquía**: Magistrado, Funcionario, Empleado
- **Por área**: Filtro dinámico con áreas disponibles
- **Búsqueda libre**: Texto en nombre, legajo o email

### 📄 Perfil de Empleado (`/dashboard/empleados/[id]`)

**Información mostrada:**
- ✅ Datos personales completos (nombre, contacto, documento)
- ✅ Información laboral (cargo, área, jerarquía, antigüedad)
- ✅ Saldos de licencias por tipo (compensatorios, estudio, etc.)
- ✅ Estadísticas de solicitudes con resumen
- ✅ Tabs de navegación para organizar contenido
- ✅ Calendario personal integrado
- ✅ Botón de edición con permisos

**Tabs de navegación:**
- **Perfil**: Información personal y laboral
- **Estadísticas**: Métricas de licencias y rendimiento
- **Historial**: Solicitudes pasadas y timeline
- **Calendario**: Vista mensual con licencias y eventos

### ➕ Nuevo Empleado (`/dashboard/empleados/nuevo`)

**Formulario completo:**
- ✅ Información personal (nombre, email, documento, contacto)
- ✅ Información laboral (cargo, jerarquía, área, fecha ingreso)
- ✅ Asignación de jefatura directa según jerarquía
- ✅ Observaciones adicionales opcionales
- ✅ Resumen en tiempo real
- ✅ Validaciones completas

**Validaciones implementadas:**
- ✅ Campos obligatorios marcados
- ✅ Formato de email válido
- ✅ Legajo único en el sistema
- ✅ Jerarquía y área válidas
- ✅ Fecha de ingreso coherente
- ✅ Jefatura directa según jerarquía

### ✏️ Editar Empleado (`/dashboard/empleados/[id]/editar`)

**Funcionalidades avanzadas:**
- ✅ Formulario pre-cargado con datos existentes
- ✅ Detección de cambios sin guardar
- ✅ Validaciones en tiempo real
- ✅ Botones de activar/desactivar empleado
- ✅ Confirmaciones para cambios críticos
- ✅ Navegación con advertencias de cambios

**Estados del empleado:**
- **Activo**: Empleado trabajando normalmente
- **Inactivo**: Empleado desactivado del sistema
- **En Licencia**: Empleado con licencia activa
- **Suspendido**: Empleado con suspensión temporal

### 📅 Calendario Personal

**Vista mensual completa:**
- ✅ Navegación entre meses con botones
- ✅ Licencias históricas con estados visuales
- ✅ Licencias futuras programadas
- ✅ Períodos especiales (feria judicial, recesos)
- ✅ Leyenda de colores por tipo de evento
- ✅ Lista de próximas licencias
- ✅ Tooltips informativos en eventos

**Tipos de eventos:**
- 🟢 **Licencias Aprobadas**: Verde con icono de check
- 🟡 **Licencias Pendientes**: Amarillo con icono de reloj
- 🔴 **Licencias Rechazadas**: Rojo con icono de X
- 🔵 **Feria Judicial**: Azul para períodos especiales
- 🟣 **Recesos**: Púrpura para períodos institucionales

## 🏗️ Arquitectura Técnica

### 📁 Estructura de Archivos

```
frontend/app/dashboard/empleados/
├── page.tsx                    # Lista de empleados
├── [id]/page.tsx              # Perfil de empleado
├── [id]/editar/page.tsx       # Formulario de edición
├── nuevo/page.tsx             # Formulario nuevo empleado
└── README.md                  # Esta documentación

frontend/lib/
├── types/empleados.ts         # Tipos TypeScript
└── api/empleados.ts           # Servicios API

frontend/components/empleados/
└── calendario-empleado.tsx    # Componente de calendario
```

### 🔧 Servicios API

**EmpleadosService:**
- `obtenerEmpleados(filtros)` - Lista con filtros y paginación
- `obtenerEmpleadoPorId(id)` - Perfil completo
- `crearEmpleado(datos)` - Nuevo empleado
- `actualizarEmpleado(id, datos)` - Editar existente
- `activarEmpleado(id)` - Activar empleado
- `desactivarEmpleado(id)` - Desactivar empleado
- `buscarEmpleados(termino)` - Búsqueda para autocompletado
- `obtenerAreas()` - Lista de áreas disponibles
- `obtenerPosiblesJefes(jerarquia)` - Jefes según jerarquía
- `obtenerEstadisticasLicencias(id)` - Métricas del empleado
- `obtenerCalendarioEmpleado(id)` - Eventos del calendario
- `exportarEmpleados(filtros)` - Exportar a Excel

### 📊 Tipos TypeScript

**Principales interfaces:**
- `EmpleadoCompleto` - Entidad principal con datos relacionados
- `EmpleadoBasico` - Versión simplificada para listas
- `NuevoEmpleado` - Datos para crear empleado
- `ActualizarEmpleado` - Datos para editar empleado
- `FiltrosEmpleados` - Parámetros de filtrado
- `SaldosLicencias` - Días disponibles por tipo
- `EstadisticasLicenciasEmpleado` - Métricas personales
- `CalendarioEmpleado` - Eventos del calendario personal

**Enums y constantes:**
- `Jerarquia`: MAGISTRADO, FUNCIONARIO, EMPLEADO
- `EstadoEmpleado`: ACTIVO, LICENCIA, SUSPENDIDO, INACTIVO
- `COLORES_ESTADO_EMPLEADO`: Colores para badges
- `COLORES_JERARQUIA`: Colores por jerarquía

### 🎨 Componentes UI

**Características del diseño:**
- ✅ Glassmorphism premium dark theme consistente
- ✅ Efectos de hover y transiciones suaves
- ✅ Badges con colores específicos por estado y jerarquía
- ✅ Formularios responsivos con validación visual
- ✅ Tablas con scroll horizontal en móvil
- ✅ Calendario interactivo con navegación
- ✅ Tabs de navegación en perfiles

**Estados visuales:**
- 🟢 **Activo**: Verde con icono UserCheck
- 🔴 **Inactivo**: Gris con icono UserX
- 🔵 **En Licencia**: Azul con icono Clock
- 🟡 **Suspendido**: Rojo con icono AlertCircle

## 🚀 Uso y Navegación

### 📱 Flujo de Usuario

1. **Acceso**: Desde sidebar → "Empleados"
2. **Lista**: Ver todos los empleados con filtros
3. **Perfil**: Click en "Ver" para información completa
4. **Editar**: Click en "Editar" para modificar datos
5. **Nuevo**: Botón "Nuevo Empleado" para crear
6. **Calendario**: Tab "Calendario" en el perfil

### 🔐 Permisos por Rol

**Admin/RRHH:**
- ✅ Ver todos los empleados
- ✅ Crear nuevos empleados
- ✅ Editar cualquier empleado
- ✅ Activar/Desactivar empleados
- ✅ Exportar datos
- ✅ Importar empleados masivamente

**Supervisor:**
- ✅ Ver empleados de su área
- ✅ Ver perfiles completos
- ✅ Editar empleados subordinados
- ❌ No puede crear/eliminar empleados

**Empleado:**
- ✅ Ver solo su propio perfil
- ✅ Ver calendario personal
- ❌ No puede editar datos
- ❌ No puede ver otros empleados

### 📈 Métricas y Exportación

**Datos exportables:**
- Lista completa de empleados con filtros
- Información personal y laboral
- Saldos de licencias actuales
- Estadísticas de solicitudes
- Datos de contacto y jerarquía

**Formato de exportación:**
- Excel (.xlsx) con formato profesional
- Columnas organizadas por categorías
- Filtros aplicados mantenidos
- Metadatos de exportación incluidos

## 🔄 Integración con Backend

### 🌐 APIs Utilizadas

**Endpoints principales:**
- `GET /api/empleados` - Lista con filtros
- `GET /api/empleados/:id` - Perfil completo
- `POST /api/empleados` - Crear nuevo
- `PUT /api/empleados/:id` - Actualizar
- `DELETE /api/empleados/:id` - Desactivar
- `GET /api/empleados/areas` - Lista de áreas
- `POST /api/empleados/import` - Importación masiva

### 🔄 Estados de Sincronización

**Manejo de estados:**
- ✅ Loading states con spinners glassmorphism
- ✅ Error handling con mensajes específicos
- ✅ Actualización automática después de cambios
- ✅ Validación de permisos en tiempo real
- ✅ Confirmaciones para acciones críticas

## 🎯 Próximos Pasos

### 📋 Mejoras Planificadas (Fase 5)

- [ ] **Importación masiva** desde Excel con validaciones
- [ ] **Organigramas interactivos** con jerarquías visuales
- [ ] **Reportes personalizados** por empleado
- [ ] **Notificaciones** de cambios importantes
- [ ] **Historial de cambios** con timeline detallado
- [ ] **Integración con AD** para sincronización
- [ ] **Fotos de perfil** con gestión de archivos

### 🔧 Optimizaciones Técnicas

- [ ] **React Query** para cache inteligente
- [ ] **Virtualization** para listas grandes
- [ ] **Lazy loading** de componentes pesados
- [ ] **WebSockets** para actualizaciones en tiempo real
- [ ] **Búsqueda avanzada** con filtros combinados

---

**Desarrollado con ❤️ para el Sistema de Licencias MPD**  
*Fase 4 completada - Julio 2025*
