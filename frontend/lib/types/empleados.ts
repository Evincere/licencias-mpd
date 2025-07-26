// Tipos para el sistema de gestión de empleados

export interface EmpleadoCompleto {
  id: string
  legajo: string
  nombre: string
  apellido: string
  email: string
  cargo: string
  jerarquia: Jerarquia
  area: string
  jefaturaDirectaId?: string
  fechaIngreso: string
  estado: EstadoEmpleado
  activo: boolean
  saldos: SaldosLicencias
  metadata: MetadataEmpleado
  fechaCreacion: string
  fechaActualizacion: string
  
  // Datos relacionados
  jefaturaDirecta?: EmpleadoBasico
  subordinados?: EmpleadoBasico[]
  estadisticasLicencias?: EstadisticasLicenciasEmpleado
}

export interface EmpleadoBasico {
  id: string
  legajo: string
  nombre: string
  apellido: string
  email: string
  area: string
  jerarquia: Jerarquia
  activo: boolean
}

export interface SaldosLicencias {
  compensatorios: number
  estudio: number
  enfermedad: number
  particulares: number
  anuales?: number
}

export interface MetadataEmpleado {
  numeroDocumento?: string
  telefono?: string
  direccion?: string
  observaciones?: string
  fechaNacimiento?: string
  estadoCivil?: string
  numeroHijos?: number
  contactoEmergencia?: ContactoEmergencia
}

export interface ContactoEmergencia {
  nombre: string
  telefono: string
  relacion: string
}

export type Jerarquia = 'MAGISTRADO' | 'FUNCIONARIO' | 'EMPLEADO'

export type EstadoEmpleado = 'ACTIVO' | 'LICENCIA' | 'SUSPENDIDO' | 'INACTIVO'

export interface NuevoEmpleado {
  legajo: string
  nombre: string
  apellido: string
  email: string
  cargo: string
  jerarquia: Jerarquia
  area: string
  jefaturaDirectaId?: string
  fechaIngreso: string
  metadata?: Partial<MetadataEmpleado>
}

export interface ActualizarEmpleado {
  legajo?: string
  nombre?: string
  apellido?: string
  email?: string
  cargo?: string
  jerarquia?: Jerarquia
  area?: string
  jefaturaDirectaId?: string
  fechaIngreso?: string
  metadata?: Partial<MetadataEmpleado>
}

export interface FiltrosEmpleados {
  page?: number
  limit?: number
  search?: string
  area?: string
  jerarquia?: Jerarquia
  estado?: EstadoEmpleado
  activo?: boolean
  jefaturaDirectaId?: string
}

export interface RespuestaEmpleados {
  empleados: EmpleadoCompleto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface EstadisticasLicenciasEmpleado {
  totalSolicitudes: number
  solicitudesAprobadas: number
  solicitudesRechazadas: number
  solicitudesPendientes: number
  diasTomados: number
  diasDisponibles: number
  ultimaSolicitud?: {
    id: string
    tipo: string
    fechaInicio: string
    fechaFin: string
    estado: string
  }
  proximasLicencias: Array<{
    id: string
    tipo: string
    fechaInicio: string
    fechaFin: string
    diasSolicitados: number
  }>
}

export interface HistorialLicenciasEmpleado {
  solicitudes: Array<{
    id: string
    tipoLicencia: string
    fechaInicio: string
    fechaFin: string
    diasSolicitados: number
    estado: string
    fechaSolicitud: string
    fechaAprobacion?: string
    motivo: string
    observaciones?: string
  }>
  resumenAnual: {
    año: number
    totalDias: number
    diasPorTipo: Record<string, number>
    solicitudesPorMes: Array<{
      mes: number
      cantidad: number
      dias: number
    }>
  }
}

export interface CalendarioEmpleado {
  licenciasHistoricas: Array<{
    id: string
    tipo: string
    fechaInicio: string
    fechaFin: string
    estado: string
    color: string
  }>
  licenciasFuturas: Array<{
    id: string
    tipo: string
    fechaInicio: string
    fechaFin: string
    estado: string
    color: string
  }>
  periodosEspeciales: Array<{
    nombre: string
    fechaInicio: string
    fechaFin: string
    tipo: 'feria_judicial' | 'receso' | 'feriado'
    color: string
  }>
}

// Tipos para formularios
export interface FormularioNuevoEmpleado {
  legajo: string
  nombre: string
  apellido: string
  email: string
  cargo: string
  jerarquia: Jerarquia | ''
  area: string
  jefaturaDirectaId: string
  fechaIngreso: Date | null
  numeroDocumento: string
  telefono: string
  direccion: string
  observaciones: string
}

export interface FormularioEditarEmpleado extends FormularioNuevoEmpleado {
  id: string
  activo: boolean
}

export interface FormularioFiltrosEmpleados {
  busqueda: string
  area: string
  jerarquia: Jerarquia | ''
  estado: EstadoEmpleado | ''
  activo: boolean | null
  jefaturaDirecta: string
}

// Tipos para importación masiva
export interface ImportacionEmpleados {
  archivo: File
  validaciones: {
    filas: number
    errores: Array<{
      fila: number
      campo: string
      error: string
    }>
    duplicados: Array<{
      fila: number
      legajo: string
      email: string
    }>
  }
  preview: EmpleadoImportacion[]
}

export interface EmpleadoImportacion {
  fila: number
  legajo: string
  nombre: string
  apellido: string
  email: string
  cargo: string
  jerarquia: string
  area: string
  fechaIngreso: string
  errores: string[]
  valido: boolean
}

// Constantes
export const JERARQUIAS: Record<Jerarquia, string> = {
  MAGISTRADO: 'Magistrado',
  FUNCIONARIO: 'Funcionario',
  EMPLEADO: 'Empleado'
}

export const ESTADOS_EMPLEADO: Record<EstadoEmpleado, string> = {
  ACTIVO: 'Activo',
  LICENCIA: 'En Licencia',
  SUSPENDIDO: 'Suspendido',
  INACTIVO: 'Inactivo'
}

export const COLORES_ESTADO_EMPLEADO: Record<EstadoEmpleado, string> = {
  ACTIVO: 'bg-green-500/20 text-green-300 border-green-500/30',
  LICENCIA: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  SUSPENDIDO: 'bg-red-500/20 text-red-300 border-red-500/30',
  INACTIVO: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
}

export const COLORES_JERARQUIA: Record<Jerarquia, string> = {
  MAGISTRADO: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  FUNCIONARIO: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  EMPLEADO: 'bg-green-500/20 text-green-300 border-green-500/30'
}

// Tipos para estadísticas generales
export interface EstadisticasGeneralesEmpleados {
  totalEmpleados: number
  empleadosActivos: number
  empleadosInactivos: number
  empleadosPorJerarquia: Array<{
    jerarquia: Jerarquia
    cantidad: number
    porcentaje: number
  }>
  empleadosPorArea: Array<{
    area: string
    cantidad: number
    porcentaje: number
  }>
  promedioAntiguedad: number
  empleadosRecientes: EmpleadoBasico[]
}

// Tipos para acciones
export interface AccionEmpleado {
  tipo: 'activar' | 'desactivar' | 'editar' | 'eliminar' | 'ver_perfil'
  empleadoId: string
  comentario?: string
}

export interface ModalConfirmacionEmpleado {
  isOpen: boolean
  empleado: EmpleadoBasico | null
  accion: 'activar' | 'desactivar' | 'eliminar'
}
