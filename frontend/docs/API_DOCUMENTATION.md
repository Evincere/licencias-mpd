# 🔌 Documentación de APIs - Sistema de Licencias MPD

## 📋 **Información General**

### 🌐 **Base URL**
```
Desarrollo: http://localhost:3001/api
Staging: https://staging-api.licencias.mpd.gov.ar/api
Producción: https://api.licencias.mpd.gov.ar/api
```

### 🔐 **Autenticación**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 📊 **Códigos de Respuesta**
| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Error en la solicitud |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto de datos |
| 422 | Unprocessable Entity - Error de validación |
| 500 | Internal Server Error - Error del servidor |

## 👥 **Endpoints de Empleados**

### 📋 **GET /empleados**
Obtener lista de empleados con filtros opcionales.

#### **Request**
```http
GET /api/empleados?area=Defensoría Civil&activo=true&limit=20&offset=0
```

#### **Query Parameters**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `area` | string | Filtrar por área |
| `jerarquia` | string | MAGISTRADO, FUNCIONARIO, EMPLEADO |
| `activo` | boolean | Solo empleados activos |
| `search` | string | Búsqueda por nombre o email |
| `limit` | number | Límite de resultados (default: 50) |
| `offset` | number | Offset para paginación (default: 0) |

#### **Response**
```json
{
  "empleados": [
    {
      "id": "emp_001",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@jus.mendoza.gov.ar",
      "telefono": "+54 261 123-4567",
      "area": "Defensoría Civil",
      "cargo": "Defensor",
      "jerarquia": "FUNCIONARIO",
      "fechaIngreso": "2020-01-15T00:00:00Z",
      "activo": true,
      "supervisor": {
        "id": "sup_001",
        "nombre": "María García",
        "email": "maria.garcia@jus.mendoza.gov.ar"
      },
      "diasLicenciaDisponibles": {
        "anual": 25,
        "enfermedad": 30,
        "compensatoria": 10,
        "especial": 5
      }
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### 👤 **GET /empleados/{id}**
Obtener empleado específico por ID.

#### **Response**
```json
{
  "id": "emp_001",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@jus.mendoza.gov.ar",
  "telefono": "+54 261 123-4567",
  "area": "Defensoría Civil",
  "cargo": "Defensor",
  "jerarquia": "FUNCIONARIO",
  "fechaIngreso": "2020-01-15T00:00:00Z",
  "activo": true,
  "supervisor": {
    "id": "sup_001",
    "nombre": "María García",
    "email": "maria.garcia@jus.mendoza.gov.ar"
  },
  "diasLicenciaDisponibles": {
    "anual": 25,
    "enfermedad": 30,
    "compensatoria": 10,
    "especial": 5
  },
  "estadisticas": {
    "licenciasEsteAno": 8,
    "diasUsadosEsteAno": 15,
    "promedioAnual": 18,
    "ultimaLicencia": "2024-02-15T00:00:00Z"
  }
}
```

### ➕ **POST /empleados**
Crear nuevo empleado.

#### **Request Body**
```json
{
  "nombre": "Ana",
  "apellido": "Rodríguez",
  "email": "ana.rodriguez@jus.mendoza.gov.ar",
  "telefono": "+54 261 987-6543",
  "area": "Defensoría Penal",
  "cargo": "Defensora",
  "jerarquia": "FUNCIONARIO",
  "fechaIngreso": "2024-03-01",
  "supervisorId": "sup_002",
  "diasLicenciaDisponibles": {
    "anual": 25,
    "enfermedad": 30,
    "compensatoria": 10,
    "especial": 5
  }
}
```

#### **Response**
```json
{
  "id": "emp_002",
  "nombre": "Ana",
  "apellido": "Rodríguez",
  "email": "ana.rodriguez@jus.mendoza.gov.ar",
  "telefono": "+54 261 987-6543",
  "area": "Defensoría Penal",
  "cargo": "Defensora",
  "jerarquia": "FUNCIONARIO",
  "fechaIngreso": "2024-03-01T00:00:00Z",
  "activo": true,
  "supervisor": {
    "id": "sup_002",
    "nombre": "Carlos López",
    "email": "carlos.lopez@jus.mendoza.gov.ar"
  },
  "diasLicenciaDisponibles": {
    "anual": 25,
    "enfermedad": 30,
    "compensatoria": 10,
    "especial": 5
  },
  "fechaCreacion": "2024-03-01T10:30:00Z"
}
```

## 📋 **Endpoints de Solicitudes**

### 📄 **GET /solicitudes**
Obtener lista de solicitudes con filtros.

#### **Query Parameters**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `estado` | string | PENDIENTE, APROBADA, RECHAZADA, CANCELADA |
| `empleadoId` | string | ID del empleado |
| `tipo` | string | Tipo de licencia |
| `fechaDesde` | string | Fecha inicio (ISO 8601) |
| `fechaHasta` | string | Fecha fin (ISO 8601) |
| `area` | string | Área del empleado |
| `limit` | number | Límite de resultados |
| `offset` | number | Offset para paginación |

#### **Response**
```json
{
  "solicitudes": [
    {
      "id": "sol_001",
      "empleadoId": "emp_001",
      "empleado": {
        "nombre": "Juan Pérez",
        "area": "Defensoría Civil",
        "email": "juan.perez@jus.mendoza.gov.ar"
      },
      "tipo": "Licencia Anual",
      "fechaInicio": "2024-03-15T00:00:00Z",
      "fechaFin": "2024-03-20T00:00:00Z",
      "diasSolicitados": 6,
      "estado": "PENDIENTE",
      "motivo": "Vacaciones familiares programadas",
      "observaciones": "Solicitud con anticipación",
      "fechaSolicitud": "2024-03-01T10:00:00Z",
      "documentosAdjuntos": [],
      "historial": [
        {
          "fecha": "2024-03-01T10:00:00Z",
          "accion": "CREADA",
          "usuario": "emp_001",
          "comentario": "Solicitud creada"
        }
      ]
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

### ➕ **POST /solicitudes**
Crear nueva solicitud de licencia.

#### **Request Body**
```json
{
  "empleadoId": "emp_001",
  "tipo": "Licencia Anual",
  "fechaInicio": "2024-03-15",
  "fechaFin": "2024-03-20",
  "diasSolicitados": 6,
  "motivo": "Vacaciones familiares programadas",
  "observaciones": "Solicitud con anticipación",
  "documentosAdjuntos": [
    {
      "nombre": "certificado.pdf",
      "url": "https://storage.example.com/docs/cert123.pdf",
      "tipo": "application/pdf",
      "tamaño": 245760
    }
  ]
}
```

#### **Response**
```json
{
  "id": "sol_002",
  "empleadoId": "emp_001",
  "tipo": "Licencia Anual",
  "fechaInicio": "2024-03-15T00:00:00Z",
  "fechaFin": "2024-03-20T00:00:00Z",
  "diasSolicitados": 6,
  "estado": "PENDIENTE",
  "motivo": "Vacaciones familiares programadas",
  "observaciones": "Solicitud con anticipación",
  "fechaSolicitud": "2024-03-01T14:30:00Z",
  "documentosAdjuntos": [
    {
      "id": "doc_001",
      "nombre": "certificado.pdf",
      "url": "https://storage.example.com/docs/cert123.pdf",
      "tipo": "application/pdf",
      "tamaño": 245760,
      "fechaSubida": "2024-03-01T14:30:00Z"
    }
  ],
  "historial": [
    {
      "fecha": "2024-03-01T14:30:00Z",
      "accion": "CREADA",
      "usuario": "emp_001",
      "comentario": "Solicitud creada"
    }
  ]
}
```

### 🔄 **PATCH /solicitudes/{id}/estado**
Actualizar estado de solicitud.

#### **Request Body**
```json
{
  "estado": "APROBADA",
  "comentario": "Aprobada por supervisor",
  "aprobadoPor": "sup_001"
}
```

#### **Response**
```json
{
  "id": "sol_001",
  "estado": "APROBADA",
  "fechaAprobacion": "2024-03-02T09:15:00Z",
  "aprobadoPor": "sup_001",
  "comentarioAprobacion": "Aprobada por supervisor",
  "historial": [
    {
      "fecha": "2024-03-01T10:00:00Z",
      "accion": "CREADA",
      "usuario": "emp_001",
      "comentario": "Solicitud creada"
    },
    {
      "fecha": "2024-03-02T09:15:00Z",
      "accion": "APROBADA",
      "usuario": "sup_001",
      "comentario": "Aprobada por supervisor"
    }
  ]
}
```

## 📊 **Endpoints de Analytics**

### 📈 **GET /analytics/dashboard**
Obtener métricas del dashboard.

#### **Response**
```json
{
  "resumen": {
    "solicitudesPendientes": 12,
    "solicitudesEsteAno": 247,
    "empleadosEnLicencia": 8,
    "diasPromedioAprobacion": 2.3
  },
  "tendencias": {
    "solicitudesPorMes": [
      { "mes": "2024-01", "cantidad": 23 },
      { "mes": "2024-02", "cantidad": 31 },
      { "mes": "2024-03", "cantidad": 28 }
    ],
    "tiposLicencia": [
      { "tipo": "Licencia Anual", "cantidad": 89, "porcentaje": 36.1 },
      { "tipo": "Licencia por Enfermedad", "cantidad": 67, "porcentaje": 27.1 },
      { "tipo": "Licencia Compensatoria", "cantidad": 45, "porcentaje": 18.2 }
    ]
  },
  "alertas": [
    {
      "tipo": "cobertura_minima",
      "mensaje": "Defensoría Civil por debajo de cobertura mínima",
      "severidad": "alta",
      "fecha": "2024-03-15T00:00:00Z"
    }
  ]
}
```

### 📊 **GET /analytics/reportes**
Obtener datos para reportes específicos.

#### **Query Parameters**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `tipo` | string | ejecutivo, cumplimiento, area, individual |
| `fechaDesde` | string | Fecha inicio del reporte |
| `fechaHasta` | string | Fecha fin del reporte |
| `area` | string | Área específica (opcional) |
| `empleadoId` | string | Empleado específico (opcional) |

#### **Response**
```json
{
  "tipo": "ejecutivo",
  "periodo": {
    "desde": "2024-01-01T00:00:00Z",
    "hasta": "2024-03-31T00:00:00Z"
  },
  "metricas": {
    "totalSolicitudes": 247,
    "solicitudesAprobadas": 231,
    "solicitudesRechazadas": 8,
    "solicitudesPendientes": 8,
    "tasaAprobacion": 93.5,
    "tiempoPromedioAprobacion": 2.3,
    "diasTotalesTomados": 1456,
    "empleadosConLicencia": 89
  },
  "distribucionPorTipo": [
    {
      "tipo": "Licencia Anual",
      "cantidad": 89,
      "dias": 534,
      "porcentaje": 36.1
    }
  ],
  "distribucionPorArea": [
    {
      "area": "Defensoría Civil",
      "solicitudes": 67,
      "dias": 402,
      "empleados": 23
    }
  ],
  "tendenciasMensuales": [
    {
      "mes": "2024-01",
      "solicitudes": 78,
      "aprobaciones": 74,
      "rechazos": 2,
      "tiempoPromedio": 2.1
    }
  ]
}
```

## 🤖 **Endpoints de IA**

### 🧠 **POST /ia/extraer-datos**
Extraer datos de solicitud desde email.

#### **Request Body**
```json
{
  "contenidoEmail": "Estimados, solicito licencia anual del 15/03/2024 al 22/03/2024...",
  "remitenteEmail": "juan.perez@jus.mendoza.gov.ar"
}
```

#### **Response**
```json
{
  "empleado": {
    "nombre": "Juan Pérez",
    "email": "juan.perez@jus.mendoza.gov.ar",
    "area": "Defensoría Civil",
    "jerarquia": "FUNCIONARIO"
  },
  "licencia": {
    "tipo": "Licencia Anual",
    "fechaInicio": "2024-03-15T00:00:00Z",
    "fechaFin": "2024-03-22T00:00:00Z",
    "dias": 8,
    "motivo": "Vacaciones familiares programadas",
    "observaciones": ""
  },
  "confianza": 0.95,
  "requiereRevision": false,
  "factoresDetectados": [
    "fechas_explicitas",
    "tipo_licencia_claro",
    "empleado_identificado"
  ]
}
```

### 📊 **POST /ia/analizar-solicitud**
Analizar probabilidad de aprobación de solicitud.

#### **Request Body**
```json
{
  "empleado": {
    "nombre": "Juan Pérez",
    "email": "juan.perez@jus.mendoza.gov.ar",
    "area": "Defensoría Civil",
    "jerarquia": "FUNCIONARIO"
  },
  "licencia": {
    "tipo": "Licencia Anual",
    "fechaInicio": "2024-03-15T00:00:00Z",
    "fechaFin": "2024-03-22T00:00:00Z",
    "dias": 8,
    "motivo": "Vacaciones familiares programadas"
  },
  "confianza": 0.95,
  "requiereRevision": false
}
```

#### **Response**
```json
{
  "probabilidadAprobacion": 92,
  "factoresRiesgo": [],
  "recomendaciones": [
    "Aprobación automática recomendada",
    "Solicitud dentro de parámetros normales"
  ],
  "tiempoEstimadoResolucion": 1,
  "precedentesEncontrados": 5,
  "analisisDetallado": {
    "factoresPositivos": [
      "Empleado con buen historial",
      "Solicitud con anticipación adecuada",
      "Período no conflictivo"
    ],
    "factoresNeutrales": [
      "Tipo de licencia estándar"
    ],
    "factoresNegativos": []
  }
}
```

### 💬 **POST /ia/asistente**
Procesar consulta del asistente virtual.

#### **Request Body**
```json
{
  "consulta": "¿Cómo solicito una licencia por enfermedad?",
  "contexto": {
    "historial": [
      {
        "consulta": "Hola",
        "respuesta": "¡Hola! ¿En qué puedo ayudarte con el sistema de licencias?"
      }
    ],
    "usuario": {
      "id": "emp_001",
      "area": "Defensoría Civil"
    }
  }
}
```

#### **Response**
```json
{
  "respuesta": "Para solicitar una licencia por enfermedad, debes seguir estos pasos:\n\n1. Ve a la sección 'Solicitudes' en el menú principal\n2. Haz clic en 'Nueva Solicitud'\n3. Selecciona 'Licencia por Enfermedad' como tipo\n4. Completa las fechas y motivo\n5. **Importante**: Adjunta el certificado médico\n6. Envía la solicitud\n\nRecuerda que las licencias por enfermedad requieren documentación médica obligatoria.",
  "accionesSugeridas": [
    "Ir a Nueva Solicitud",
    "Ver mis días disponibles",
    "Consultar requisitos médicos"
  ],
  "documentosRelacionados": [
    "Manual de usuario - Solicitudes",
    "Normativa de licencias médicas",
    "Formulario de certificado médico"
  ],
  "confianza": 0.95
}
```

## 📱 **Endpoints de WhatsApp**

### 📊 **GET /whatsapp/status**
Obtener estado de WhatsApp Business API.

#### **Response**
```json
{
  "conectado": true,
  "ultimaActividad": "2024-03-15T14:30:00Z",
  "numeroTelefono": "+54 261 123-4567",
  "estadoAPI": "activo",
  "limitesAPI": {
    "mensajesPorMinuto": 100,
    "mensajesUsados": 23,
    "resetTime": "2024-03-15T15:00:00Z"
  }
}
```

### 📈 **GET /whatsapp/metrics**
Obtener métricas de WhatsApp.

#### **Response**
```json
{
  "mensajesHoy": 147,
  "conversacionesActivas": 8,
  "tasaRespuesta": 94.2,
  "tiempoPromedioRespuesta": 3.5,
  "satisfaccionPromedio": 4.6,
  "mensajesPorHora": [
    { "hora": "08:00", "cantidad": 12 },
    { "hora": "09:00", "cantidad": 18 }
  ],
  "tiposConsulta": [
    { "tipo": "Licencias", "cantidad": 89, "porcentaje": 60.5 },
    { "tipo": "Consultas Generales", "cantidad": 35, "porcentaje": 23.8 }
  ]
}
```

## 🔧 **Endpoints de Configuración**

### ⚙️ **GET /config/tipos-licencia**
Obtener tipos de licencia configurados.

#### **Response**
```json
{
  "tipos": [
    {
      "id": "tipo_001",
      "nombre": "Licencia Anual",
      "descripcion": "Licencia anual ordinaria",
      "diasMaximos": 30,
      "requiereDocumentacion": false,
      "aprobacionAutomatica": false,
      "color": "#3b82f6",
      "activo": true
    }
  ]
}
```

### 🏢 **GET /config/areas**
Obtener áreas organizacionales.

#### **Response**
```json
{
  "areas": [
    {
      "id": "area_001",
      "nombre": "Defensoría Civil",
      "descripcion": "Defensoría Civil y Comercial",
      "supervisor": {
        "id": "sup_001",
        "nombre": "María García"
      },
      "coberturaMinima": 3,
      "empleadosActivos": 23,
      "jerarquia": 1
    }
  ]
}
```

## 🚨 **Manejo de Errores**

### 📋 **Formato de Error Estándar**
```json
{
  "error": {
    "codigo": "VALIDATION_ERROR",
    "mensaje": "Error de validación en los datos enviados",
    "detalles": [
      {
        "campo": "fechaInicio",
        "mensaje": "La fecha de inicio no puede ser anterior a hoy"
      },
      {
        "campo": "empleadoId",
        "mensaje": "El empleado especificado no existe"
      }
    ],
    "timestamp": "2024-03-15T14:30:00Z",
    "requestId": "req_12345"
  }
}
```

### 🔍 **Códigos de Error Específicos**
| Código | Descripción |
|--------|-------------|
| `VALIDATION_ERROR` | Error de validación de datos |
| `EMPLOYEE_NOT_FOUND` | Empleado no encontrado |
| `INSUFFICIENT_DAYS` | Días insuficientes para la licencia |
| `DATE_CONFLICT` | Conflicto de fechas con otra licencia |
| `PERMISSION_DENIED` | Sin permisos para la acción |
| `DUPLICATE_REQUEST` | Solicitud duplicada |
| `INVALID_STATE_TRANSITION` | Transición de estado inválida |

## 📝 **Rate Limiting**

### 🚦 **Límites por Endpoint**
| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/auth/*` | 5 requests | 1 minuto |
| `/solicitudes` | 100 requests | 1 minuto |
| `/empleados` | 200 requests | 1 minuto |
| `/analytics/*` | 50 requests | 1 minuto |
| `/ia/*` | 20 requests | 1 minuto |

### 📊 **Headers de Rate Limiting**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1647360000
```

**Esta documentación de API proporciona toda la información necesaria para integrar y utilizar los servicios del Sistema de Gestión de Licencias. Mantén esta documentación actualizada con cada cambio en los endpoints.** 🔌✨🚀
