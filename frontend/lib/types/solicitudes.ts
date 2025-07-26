// Tipos para el sistema de solicitudes de licencias

export interface Empleado {
  id: string
  legajo: string
  nombre: string
  apellido: string
  email: string
  cargo?: string
  jerarquia: string
  area: string
  jefaturaDirectaId?: string
  fechaIngreso: string
  estado: string
  activo: boolean
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface TipoLicencia {
  id: string
  nombre: string
  codigo: string
  diasMaximos: number
  requiereDocumentacion: boolean
  activo: boolean
  descripcion?: string
}

export interface Solicitud {
  id: string
  empleadoId: string
  tipoLicenciaId: string
  fechaInicio: string
  fechaFin: string
  diasSolicitados: number
  motivo: string
  observaciones?: string
  estado: EstadoSolicitud
  fechaSolicitud: string
  fechaAprobacion?: string
  aprobadoPor?: string
  observacionesAprobacion?: string
  documentosAdjuntos: string[]
  emailOriginal?: Record<string, any>
  prediccionMl?: Record<string, any>
  confianzaPrediccion?: number
  tiempoProcesamiento?: number
  metadata?: Record<string, any>
  
  // Datos relacionados (joins)
  empleado?: {
    legajo: string
    nombre: string
    apellido: string
    email: string
    area: string
  }
  tipoLicencia?: {
    nombre: string
    codigo: string
    diasMaximos: number
    requiereDocumentacion: boolean
  }
  aprobadoPorUsuario?: {
    nombre: string
    apellido: string
  }
}

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada' | 'en_revision'

export interface SolicitudDetalle extends Solicitud {
  empleado: Empleado
  tipoLicencia: TipoLicencia
  historialCambios?: HistorialCambio[]
}

export interface HistorialCambio {
  id: string
  solicitudId: string
  estadoAnterior: EstadoSolicitud
  estadoNuevo: EstadoSolicitud
  comentario?: string
  fechaCambio: string
  cambiadoPor: string
  usuario?: {
    nombre: string
    apellido: string
  }
}

export interface NuevaSolicitud {
  empleadoId: string
  tipoLicenciaId: string
  fechaInicio: string
  fechaFin: string
  motivo: string
  observaciones?: string
  documentosAdjuntos?: string[]
}

export interface ActualizarEstadoSolicitud {
  estado: EstadoSolicitud
  observacionesAprobacion?: string
  fechaAprobacion?: string
  aprobadoPor?: string
}

export interface FiltrosSolicitudes {
  page?: number
  limit?: number
  empleadoId?: string
  estado?: EstadoSolicitud
  tipoLicencia?: string
  fechaDesde?: string
  fechaHasta?: string
  area?: string
  busqueda?: string
}

export interface RespuestaSolicitudes {
  solicitudes: Solicitud[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface EstadisticasSolicitudes {
  totalSolicitudes: number
  pendientes: number
  aprobadas: number
  rechazadas: number
  enRevision: number
  ultimoMes: number
  tiempoPromedioAprobacion: number
  tasaAprobacion: number
  solicitudesPorMes: Array<{
    mes: string
    total: number
    aprobadas: number
    rechazadas: number
  }>
  solicitudesPorTipo: Array<{
    tipo: string
    total: number
    porcentaje: number
  }>
  solicitudesPorArea: Array<{
    area: string
    total: number
    porcentaje: number
  }>
}

// Tipos para formularios
export interface FormularioNuevaSolicitud {
  empleadoId: string
  tipoLicenciaId: string
  fechaInicio: Date | null
  fechaFin: Date | null
  motivo: string
  observaciones: string
  documentosAdjuntos: File[]
}

export interface FormularioFiltros {
  empleado: string
  estado: EstadoSolicitud | ''
  tipoLicencia: string
  fechaDesde: Date | null
  fechaHasta: Date | null
  area: string
  busqueda: string
}

// Tipos para acciones
export interface AccionSolicitud {
  tipo: 'aprobar' | 'rechazar' | 'solicitar_info' | 'modificar'
  comentario?: string
  solicitudId: string
}

export interface ModalAprobacion {
  isOpen: boolean
  solicitud: Solicitud | null
  tipo: 'aprobar' | 'rechazar'
}

// Constantes
export const ESTADOS_SOLICITUD: Record<EstadoSolicitud, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  en_revision: 'En Revisión'
}

export const COLORES_ESTADO: Record<EstadoSolicitud, string> = {
  pendiente: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  aprobada: 'bg-green-500/20 text-green-300 border-green-500/30',
  rechazada: 'bg-red-500/20 text-red-300 border-red-500/30',
  en_revision: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
}

export const ICONOS_ESTADO: Record<EstadoSolicitud, string> = {
  pendiente: 'Clock',
  aprobada: 'CheckCircle',
  rechazada: 'XCircle',
  en_revision: 'AlertCircle'
}
