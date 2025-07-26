# 🔧 Manual de Administrador - Sistema de Licencias MPD

## 🎯 **Introducción**

Este manual está dirigido a administradores del sistema que necesitan gestionar configuraciones avanzadas, usuarios, y mantener el funcionamiento óptimo del Sistema de Gestión de Licencias.

## 🔐 **Gestión de Usuarios y Permisos**

### 👥 **Administración de Usuarios**

#### **Crear Nuevo Usuario**
1. Navega a **"Administración" > "Usuarios"**
2. Haz clic en **"Nuevo Usuario"**
3. Completa la información:
   - **Datos personales**: Nombre, email, teléfono
   - **Credenciales**: Usuario, contraseña temporal
   - **Rol**: Administrador, Supervisor, Usuario
   - **Permisos específicos**: Personalización granular

#### **Roles del Sistema**
| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **Administrador** | Completos | Gestión total del sistema |
| **Supervisor** | Aprobación, Reportes | Gestión de su área |
| **RRHH** | Empleados, Configuración | Gestión de personal |
| **Usuario** | Consulta, Solicitudes | Operación básica |

#### **Matriz de Permisos**
```
FUNCIONALIDAD          | ADMIN | SUPERVISOR | RRHH | USUARIO
--------------------- |-------|------------|------|--------
Crear Solicitudes     |   ✅   |     ✅      |  ✅   |   ✅
Aprobar Solicitudes   |   ✅   |     ✅      |  ✅   |   ❌
Gestionar Empleados   |   ✅   |     ❌      |  ✅   |   ❌
Ver Reportes          |   ✅   |     ✅      |  ✅   |   ❌
Configurar Sistema    |   ✅   |     ❌      |  ❌   |   ❌
Gestionar Usuarios    |   ✅   |     ❌      |  ❌   |   ❌
```

### 🔑 **Gestión de Accesos**

#### **Autenticación**
- **SSO Integration**: Configuración con Active Directory
- **2FA**: Autenticación de dos factores opcional
- **Session Management**: Control de sesiones activas
- **Password Policies**: Políticas de contraseñas

#### **Auditoría de Accesos**
- **Login Logs**: Registro de inicios de sesión
- **Action Logs**: Registro de acciones por usuario
- **Failed Attempts**: Intentos fallidos de acceso
- **Security Alerts**: Alertas de seguridad automáticas

## ⚙️ **Configuración del Sistema**

### 📋 **Tipos de Licencia**

#### **Gestionar Tipos**
1. Ve a **"Configuración" > "Tipos de Licencia"**
2. **Agregar nuevo tipo**:
   - Nombre del tipo
   - Descripción
   - Días máximos por año
   - Requiere documentación
   - Aprobación automática/manual
   - Color para calendario

#### **Tipos Predefinidos**
```
TIPO                    | DÍAS MAX | DOCUMENTOS | APROBACIÓN
---------------------- |----------|------------|------------
Licencia Anual         |    30    |     No     |   Manual
Licencia Enfermedad    |    60    |     Sí     |   Manual
Licencia Compensatoria |    15    |     No     |  Automática
Franco Compensatorio   |     5    |     No     |  Automática
Licencia Maternidad    |   120    |     Sí     |   Manual
Licencia Paternidad    |    15    |     Sí     |   Manual
Licencia Especial      |    10    |     Sí     |   Manual
```

### 🏢 **Configuración Organizacional**

#### **Áreas y Departamentos**
1. **Gestionar Áreas**:
   - Crear/editar áreas
   - Asignar supervisores
   - Configurar cobertura mínima
   - Establecer jerarquías

2. **Estructura Organizacional**:
   ```
   Ministerio Público de la Defensa
   ├── Defensoría General
   │   ├── Defensoría Civil
   │   ├── Defensoría Penal
   │   └── Defensoría de Menores
   ├── Administración
   │   ├── Recursos Humanos
   │   ├── Sistemas
   │   └── Contaduría
   └── Secretarías
       ├── Secretaría Técnica
       └── Secretaría Administrativa
   ```

### 📅 **Configuración de Calendario**

#### **Períodos Especiales**
1. **Feria Judicial**:
   - Fechas de inicio y fin
   - Restricciones de licencias
   - Personal de guardia mínimo

2. **Recesos Administrativos**:
   - Períodos de receso
   - Áreas afectadas
   - Excepciones por área

#### **Reglas de Conflictos**
- **Cobertura mínima**: Por área y tipo de empleado
- **Conflictos automáticos**: Detección de solapamientos
- **Alertas preventivas**: Notificaciones de riesgo
- **Excepciones**: Casos especiales autorizados

### 🔔 **Configuración de Notificaciones**

#### **Tipos de Notificaciones**
1. **Email Notifications**:
   - Nuevas solicitudes
   - Cambios de estado
   - Recordatorios de vencimiento
   - Alertas de sistema

2. **WhatsApp Business**:
   - Configuración de API
   - Plantillas de mensajes
   - Horarios de envío
   - Grupos de destinatarios

3. **Push Notifications**:
   - Configuración de PWA
   - Tipos de alertas
   - Frecuencia de envío
   - Personalización por usuario

## 📊 **Monitoreo y Analytics**

### 📈 **Dashboard Administrativo**

#### **Métricas Clave**
- **Solicitudes activas**: Pendientes, en proceso
- **Performance del sistema**: Tiempos de respuesta
- **Uso por área**: Distribución de licencias
- **Tendencias**: Patrones estacionales
- **Alertas**: Problemas detectados

#### **KPIs del Sistema**
```
MÉTRICA                 | OBJETIVO | ACTUAL | ESTADO
---------------------- |----------|--------|--------
Tiempo Promedio Aprob. |   2 días |  1.8d  |   ✅
Tasa de Aprobación     |    85%   |  92%   |   ✅
Solicitudes Automáticas|    60%   |  73%   |   ✅
Satisfacción Usuario   |   4.5/5  | 4.7/5  |   ✅
Uptime del Sistema     |   99.5%  | 99.8%  |   ✅
```

### 🔍 **Auditoría y Logs**

#### **Logs del Sistema**
1. **Application Logs**:
   - Errores de aplicación
   - Performance issues
   - Security events
   - User actions

2. **Database Logs**:
   - Queries lentas
   - Cambios de datos
   - Backup status
   - Integrity checks

3. **API Logs**:
   - Request/response times
   - Error rates
   - Usage patterns
   - Rate limiting

#### **Reportes de Auditoría**
- **Cambios de configuración**: Quién, cuándo, qué
- **Acciones de usuarios**: Historial completo
- **Accesos al sistema**: Logs de autenticación
- **Modificaciones de datos**: Trazabilidad completa

## 🤖 **Administración de IA**

### 🧠 **Configuración de IA**

#### **Genkit Integration**
1. **Configuración de Conexión**:
   - URL del servicio Genkit
   - API Keys y autenticación
   - Timeouts y reintentos
   - Fallback configuration

2. **Modelos de IA**:
   - Modelo de extracción de datos
   - Modelo de análisis predictivo
   - Modelo de procesamiento de lenguaje
   - Configuración de confianza

#### **Filtros de Email**
1. **Reglas de Procesamiento**:
   - Patrones de detección
   - Acciones automáticas
   - Priorización de emails
   - Filtros de spam

2. **Configuración Avanzada**:
   - Umbrales de confianza
   - Validación manual requerida
   - Notificaciones de procesamiento
   - Backup de emails procesados

### 📊 **Monitoreo de IA**
- **Precisión de modelos**: Métricas de accuracy
- **Tiempo de procesamiento**: Performance de IA
- **Uso de recursos**: CPU, memoria, GPU
- **Errores y excepciones**: Logs específicos de IA

## 📱 **Administración de WhatsApp**

### 🔧 **Configuración de WhatsApp Business**

#### **API Configuration**
1. **Conexión con WhatsApp**:
   - Business Account ID
   - Access Token
   - Webhook configuration
   - Phone number verification

2. **Plantillas de Mensajes**:
   - Mensajes predefinidos
   - Variables dinámicas
   - Aprobación de Facebook
   - Idiomas soportados

#### **Gestión de Conversaciones**
- **Asignación automática**: Por área o tipo
- **Escalamiento**: Reglas de derivación
- **Horarios de atención**: Respuestas automáticas
- **Métricas de calidad**: SLA y satisfacción

### 📊 **Analytics de WhatsApp**
- **Volumen de mensajes**: Diarios, semanales, mensuales
- **Tiempo de respuesta**: Promedio y distribución
- **Tasa de resolución**: Conversaciones completadas
- **Satisfacción**: Ratings de usuarios

## 🔧 **Mantenimiento del Sistema**

### 🗄️ **Gestión de Base de Datos**

#### **Backups**
1. **Backup Automático**:
   - Frecuencia: Diario, semanal, mensual
   - Retención: 30 días diarios, 12 semanas, 7 años
   - Verificación: Integridad automática
   - Almacenamiento: Local y cloud

2. **Restore Procedures**:
   - Point-in-time recovery
   - Partial restore por tabla
   - Testing de backups
   - Documentación de procedimientos

#### **Optimización**
- **Index Optimization**: Análisis y mejora
- **Query Performance**: Identificación de queries lentas
- **Storage Management**: Limpieza de datos antiguos
- **Statistics Update**: Mantenimiento de estadísticas

### 🔄 **Actualizaciones del Sistema**

#### **Deployment Process**
1. **Staging Environment**:
   - Testing completo
   - Validación de datos
   - Performance testing
   - User acceptance testing

2. **Production Deployment**:
   - Blue-green deployment
   - Rollback procedures
   - Health checks
   - Monitoring post-deployment

#### **Version Control**
- **Release Notes**: Documentación de cambios
- **Feature Flags**: Control de funcionalidades
- **Hotfix Process**: Correcciones urgentes
- **Rollback Strategy**: Procedimientos de reversión

## 🚨 **Gestión de Incidentes**

### 🔍 **Monitoreo Proactivo**

#### **Health Checks**
- **Application Health**: Status de servicios
- **Database Health**: Conexiones y performance
- **External APIs**: Disponibilidad de servicios
- **Infrastructure**: CPU, memoria, disco

#### **Alertas Automáticas**
```
TIPO DE ALERTA         | UMBRAL    | ACCIÓN
--------------------- |-----------|------------------
CPU Usage             |    >80%   | Email + SMS
Memory Usage          |    >85%   | Email + SMS
Disk Space            |    >90%   | Email + SMS + Escalate
Database Connections  |    >100   | Email + Auto-scale
API Response Time     |    >2s    | Email + Investigation
Error Rate            |    >5%    | Email + SMS + Escalate
```

### 🛠️ **Resolución de Problemas**

#### **Procedimientos Estándar**
1. **Incident Response**:
   - Clasificación de severidad
   - Asignación de responsables
   - Comunicación a usuarios
   - Resolución y seguimiento

2. **Escalation Matrix**:
   - Nivel 1: Soporte técnico (0-2h)
   - Nivel 2: Administrador sistema (2-4h)
   - Nivel 3: Desarrollador senior (4-8h)
   - Nivel 4: Arquitecto/CTO (8h+)

## 📋 **Checklist de Administración**

### 🔄 **Tareas Diarias**
- [ ] Verificar estado del sistema
- [ ] Revisar logs de errores
- [ ] Monitorear performance
- [ ] Verificar backups
- [ ] Revisar solicitudes pendientes
- [ ] Verificar alertas de seguridad

### 📅 **Tareas Semanales**
- [ ] Análisis de métricas
- [ ] Revisión de usuarios activos
- [ ] Limpieza de logs antiguos
- [ ] Testing de backups
- [ ] Revisión de configuraciones
- [ ] Actualización de documentación

### 📊 **Tareas Mensuales**
- [ ] Reporte de performance
- [ ] Análisis de tendencias
- [ ] Revisión de seguridad
- [ ] Optimización de base de datos
- [ ] Planificación de capacidad
- [ ] Training de usuarios

## 📞 **Contactos de Emergencia**

### 🆘 **Escalation Contacts**
- **Administrador Principal**: admin@mpd.gov.ar
- **Soporte Técnico**: soporte@mpd.gov.ar
- **Desarrollador Senior**: dev@mpd.gov.ar
- **Proveedor de Hosting**: hosting@provider.com
- **Proveedor de Base de Datos**: db@provider.com

### 📱 **Números de Emergencia**
- **Soporte 24/7**: +54 261 123-4567
- **Administrador**: +54 261 987-6543
- **CTO**: +54 261 456-7890

**Este manual proporciona las herramientas necesarias para administrar eficientemente el Sistema de Gestión de Licencias. Mantén este documento actualizado y accesible para todo el equipo administrativo.** 🔧✨🚀
