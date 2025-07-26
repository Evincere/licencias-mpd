// Tipos para el sistema de calendario general de licencias

export interface EventoCalendario {
  id: string
  titulo: string
  descripcion?: string
  fechaInicio: Date
  fechaFin: Date
  tipo: TipoEventoCalendario
  estado?: EstadoEventoCalendario
  color: string
  empleado?: {
    id: string
    nombre: string
    apellido: string
    legajo: string
    area: string
    jerarquia: string
  }
  tipoLicencia?: {
    id: string
    nombre: string
    codigo: string
    color: string
  }
  metadata?: Record<string, any>
  editable: boolean
  conflictos?: ConflictoCalendario[]
}

export type TipoEventoCalendario = 
  | 'licencia' 
  | 'feria_judicial' 
  | 'receso' 
  | 'feriado' 
  | 'capacitacion'
  | 'reunion'
  | 'evento_especial'

export type EstadoEventoCalendario = 
  | 'pendiente' 
  | 'aprobada' 
  | 'rechazada' 
  | 'en_revision'
  | 'confirmada'
  | 'cancelada'

export type VistaCalendario = 'mes' | 'semana' | 'dia' | 'agenda'

export interface FiltrosCalendario {
  fechaInicio?: Date
  fechaFin?: Date
  areas?: string[]
  empleados?: string[]
  tiposLicencia?: string[]
  estados?: EstadoEventoCalendario[]
  tipos?: TipoEventoCalendario[]
  jerarquias?: string[]
  soloConflictos?: boolean
  busqueda?: string
}

export interface ConfiguracionCalendario {
  vistaDefecto: VistaCalendario
  horaInicio: number
  horaFin: number
  diasSemana: number[]
  coloresPorTipo: Record<TipoEventoCalendario, string>
  coloresPorEstado: Record<EstadoEventoCalendario, string>
  mostrarFinDeSemana: boolean
  alertas: AlertaCalendario[]
  reglasConflicto: ReglaConflicto[]
}

export interface AlertaCalendario {
  id: string
  nombre: string
  tipo: 'cobertura_minima' | 'conflicto_licencias' | 'vencimiento_dias' | 'periodo_critico'
  condicion: Record<string, any>
  activa: boolean
  destinatarios: string[]
}

export interface ReglaConflicto {
  id: string
  nombre: string
  descripcion: string
  tipo: 'area_cobertura' | 'jerarquia_simultanea' | 'periodo_bloqueado' | 'limite_diario'
  parametros: Record<string, any>
  activa: boolean
  severidad: 'info' | 'warning' | 'error'
}

export interface ConflictoCalendario {
  id: string
  tipo: string
  descripcion: string
  severidad: 'info' | 'warning' | 'error'
  eventosAfectados: string[]
  sugerencias?: string[]
}

export interface PeriodoEspecial {
  id: string
  nombre: string
  descripcion?: string
  fechaInicio: Date
  fechaFin: Date
  tipo: 'feria_judicial' | 'receso' | 'capacitacion' | 'evento_institucional'
  areas?: string[]
  color: string
  reglas?: {
    bloquearLicencias?: boolean
    limitarSolicitudes?: boolean
    requiereAprobacionEspecial?: boolean
  }
}

export interface EstadisticasCalendario {
  totalEventos: number
  eventosPorTipo: Record<TipoEventoCalendario, number>
  eventosPorEstado: Record<EstadoEventoCalendario, number>
  coberturaPromedio: number
  conflictosActivos: number
  proximasLicencias: EventoCalendario[]
  periodosConflictivos: Array<{
    fecha: Date
    conflictos: number
    descripcion: string
  }>
  tendencias: {
    mesAnterior: number
    cambioMensual: number
    proyeccionMes: number
  }
}

export interface HeatmapData {
  fecha: Date
  valor: number
  eventos: number
  tipo: 'bajo' | 'medio' | 'alto' | 'critico'
  detalles: {
    licencias: number
    empleadosAfectados: number
    areasAfectadas: string[]
  }
}

export interface AnalisisPatrones {
  patronesEstacionales: Array<{
    mes: number
    promedio: number
    pico: number
    tendencia: 'ascendente' | 'descendente' | 'estable'
  }>
  diasCriticos: Array<{
    fecha: Date
    motivo: string
    impacto: number
  }>
  recomendaciones: Array<{
    tipo: string
    descripcion: string
    prioridad: 'alta' | 'media' | 'baja'
  }>
}

export interface RespuestaCalendario {
  eventos: EventoCalendario[]
  periodosEspeciales: PeriodoEspecial[]
  conflictos: ConflictoCalendario[]
  estadisticas: EstadisticasCalendario
  configuracion: ConfiguracionCalendario
}

export interface CalendarioCompacto {
  proximasLicencias: Array<{
    id: string
    empleado: string
    tipo: string
    fechaInicio: Date
    dias: number
    estado: EstadoEventoCalendario
  }>
  alertas: Array<{
    tipo: string
    mensaje: string
    severidad: 'info' | 'warning' | 'error'
    fecha?: Date
  }>
  coberturaPorArea: Array<{
    area: string
    cobertura: number
    empleadosPresentes: number
    empleadosTotal: number
    estado: 'optima' | 'aceptable' | 'critica'
  }>
  eventosHoy: EventoCalendario[]
}

// Tipos para formularios
export interface FormularioEventoCalendario {
  titulo: string
  descripcion: string
  fechaInicio: Date | null
  fechaFin: Date | null
  tipo: TipoEventoCalendario | ''
  empleadoId: string
  tipoLicenciaId: string
  observaciones: string
}

export interface FormularioPeriodoEspecial {
  nombre: string
  descripcion: string
  fechaInicio: Date | null
  fechaFin: Date | null
  tipo: string
  areas: string[]
  bloquearLicencias: boolean
  limitarSolicitudes: boolean
  requiereAprobacionEspecial: boolean
}

// Constantes
export const TIPOS_EVENTO: Record<TipoEventoCalendario, string> = {
  licencia: 'Licencia',
  feria_judicial: 'Feria Judicial',
  receso: 'Receso',
  feriado: 'Feriado',
  capacitacion: 'Capacitación',
  reunion: 'Reunión',
  evento_especial: 'Evento Especial'
}

export const ESTADOS_EVENTO: Record<EstadoEventoCalendario, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  en_revision: 'En Revisión',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada'
}

export const COLORES_TIPO_DEFECTO: Record<TipoEventoCalendario, string> = {
  licencia: '#10b981',
  feria_judicial: '#6366f1',
  receso: '#8b5cf6',
  feriado: '#ef4444',
  capacitacion: '#f59e0b',
  reunion: '#06b6d4',
  evento_especial: '#ec4899'
}

export const COLORES_ESTADO_DEFECTO: Record<EstadoEventoCalendario, string> = {
  pendiente: '#f59e0b',
  aprobada: '#10b981',
  rechazada: '#ef4444',
  en_revision: '#06b6d4',
  confirmada: '#22c55e',
  cancelada: '#6b7280'
}

export const VISTAS_CALENDARIO: Record<VistaCalendario, string> = {
  mes: 'Vista Mensual',
  semana: 'Vista Semanal',
  dia: 'Vista Diaria',
  agenda: 'Vista Agenda'
}

// Tipos para drag & drop
export interface EventoDragDrop {
  evento: EventoCalendario
  fechaOriginal: Date
  fechaNueva: Date
  valido: boolean
  conflictos: ConflictoCalendario[]
}

// Tipos para exportación
export interface ExportacionCalendario {
  formato: 'pdf' | 'excel' | 'ical' | 'csv'
  filtros: FiltrosCalendario
  incluirDetalles: boolean
  incluirEstadisticas: boolean
  fechaInicio: Date
  fechaFin: Date
}
