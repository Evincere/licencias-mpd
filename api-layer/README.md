# 🌐 API Layer - Sistema de Licencias MPD

API REST que actúa como capa de presentación para el Sistema de Licencias del Ministerio Público de la Defensa.

## 🏗️ Arquitectura

```
Frontend → API Layer (Express.js) → Genkit Flows → Backend (Node.js + PostgreSQL)
```

## 🚀 Características

- ✅ **API REST** con Express.js y TypeScript
- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Integración con Genkit Flows** existentes
- ✅ **Validación con Zod** en todos los endpoints
- ✅ **Logging avanzado** con Winston
- ✅ **Manejo de errores** centralizado
- ✅ **Rate limiting** y seguridad con Helmet
- ✅ **CORS configurado** para desarrollo
- ✅ **Migraciones de BD** automatizadas

## 📁 Estructura del Proyecto

```
api-layer/
├── src/
│   ├── config/          # Configuración de BD y servicios
│   ├── middleware/      # Autenticación, errores, validación
│   ├── routes/          # Definición de endpoints REST
│   ├── services/        # Integración con Genkit
│   └── utils/           # Utilidades y logging
├── migrations/          # Scripts de migración de BD
├── scripts/             # Scripts de utilidad
└── logs/               # Archivos de log (producción)
```

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias
```bash
cd api-layer
pnpm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Ejecutar migraciones
```bash
pnpm run migrate
```

### 4. Iniciar en desarrollo
```bash
pnpm dev
```

## 🔧 Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor API | `3001` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `JWT_SECRET` | Clave secreta para JWT | - |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_NAME` | Nombre de la base de datos | `licencias_mpd` |
| `GENKIT_BASE_URL` | URL del backend Genkit | `http://localhost:3400` |

## 📚 Endpoints Disponibles

### 🔐 Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Información del usuario

### 👥 Empleados
- `GET /api/empleados` - Lista de empleados (con filtros)
- `GET /api/empleados/:id` - Detalle de empleado
- `POST /api/empleados` - Crear empleado
- `PUT /api/empleados/:id` - Actualizar empleado
- `DELETE /api/empleados/:id` - Eliminar empleado

### 📝 Solicitudes
- `GET /api/solicitudes` - Lista de solicitudes (con filtros)
- `GET /api/solicitudes/:id` - Detalle de solicitud
- `POST /api/solicitudes` - Crear solicitud
- `PATCH /api/solicitudes/:id/estado` - Cambiar estado

### 🏥 Health Check
- `GET /health` - Estado básico
- `GET /health/detailed` - Estado detallado
- `GET /health/database` - Estado de BD
- `GET /health/genkit` - Estado de Genkit

## 🔑 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación:

```javascript
// Headers requeridos
{
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}
```

### Roles disponibles:
- `admin` - Acceso completo
- `supervisor` - Gestión de solicitudes
- `rrhh` - Gestión de empleados
- `empleado` - Solo sus propias solicitudes

## 📊 Integración con Genkit

La API actúa como wrapper de los flows de Genkit existentes:

```javascript
// Ejemplo de uso del servicio
import { emailProcessingService } from './services/genkitService.js'

const result = await emailProcessingService.processEmail(emailData)
```

### Flows disponibles:
- `processEmail` - Procesar email individual
- `processEmailBatch` - Procesar múltiples emails
- `monitorEmails` - Control de monitoreo
- `getMonitoringMetrics` - Métricas del sistema

## 🗄️ Base de Datos

### Esquemas utilizados:
- `auth.*` - Tablas de autenticación (creadas por API)
- `licencias.*` - Tablas del dominio (existentes en backend)

### Migraciones:
```bash
# Ejecutar migraciones pendientes
pnpm run migrate

# Crear nueva migración
pnpm run migrate:create "nombre_de_la_migracion"
```

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Tests en modo watch
pnpm run test:watch

# Coverage
pnpm run test:coverage
```

## 📝 Logging

El sistema utiliza Winston para logging estructurado:

- **Desarrollo**: Logs en consola con colores
- **Producción**: Logs en archivos rotativos

### Niveles de log:
- `error` - Errores críticos
- `warn` - Advertencias
- `info` - Información general
- `debug` - Información de depuración

## 🚀 Deployment

### Desarrollo
```bash
pnpm dev
```

### Producción
```bash
pnpm build
pnpm start
```

### Docker (próximamente)
```bash
docker-compose up api-layer
```

## 🔒 Seguridad

- ✅ Helmet para headers de seguridad
- ✅ Rate limiting configurable
- ✅ CORS configurado
- ✅ Validación de entrada con Zod
- ✅ Sanitización de queries SQL
- ✅ JWT con refresh tokens
- ✅ Logging de accesos y errores

## 📈 Monitoreo

### Health Checks
- `/health` - Estado básico de la API
- `/health/detailed` - Estado completo del sistema
- `/health/database` - Conectividad con PostgreSQL
- `/health/genkit` - Conectividad con backend

### Métricas disponibles:
- Tiempo de respuesta
- Memoria utilizada
- Conexiones de BD activas
- Estado de servicios externos

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es parte del Sistema de Licencias del Ministerio Público de la Defensa de Mendoza.

---

**Estado**: 🚧 En desarrollo - Fase 1 completada
**Versión**: 1.0.0
**Última actualización**: 23 de Julio, 2025
