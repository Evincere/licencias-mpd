import { apiClient } from './client'
import type { 
  Solicitud, 
  SolicitudDetalle, 
  NuevaSolicitud, 
  ActualizarEstadoSolicitud,
  FiltrosSolicitudes,
  RespuestaSolicitudes,
  EstadisticasSolicitudes,
  Empleado,
  TipoLicencia
} from '@/lib/types/solicitudes'
import type { ApiResponse } from '@/lib/auth/types'

/**
 * Servicio para gestión de solicitudes de licencias
 */
export class SolicitudesService {
  
  /**
   * Obtener lista de solicitudes con filtros
   */
  static async obtenerSolicitudes(filtros: FiltrosSolicitudes = {}): Promise<RespuestaSolicitudes> {
    const params = new URLSearchParams()
    
    // Agregar parámetros de filtro
    if (filtros.page) params.append('page', filtros.page.toString())
    if (filtros.limit) params.append('limit', filtros.limit.toString())
    if (filtros.empleadoId) params.append('empleadoId', filtros.empleadoId)
    if (filtros.estado) params.append('estado', filtros.estado)
    if (filtros.tipoLicencia) params.append('tipoLicencia', filtros.tipoLicencia)
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde)
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta)
    if (filtros.area) params.append('area', filtros.area)
    
    const queryString = params.toString()
    const endpoint = `/api/solicitudes${queryString ? `?${queryString}` : ''}`
    
    const response: ApiResponse<RespuestaSolicitudes> = await apiClient.get(endpoint)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al obtener solicitudes')
    }
    
    return response.data
  }

  /**
   * Obtener solicitud por ID
   */
  static async obtenerSolicitudPorId(id: string): Promise<SolicitudDetalle> {
    const response: ApiResponse<{ solicitud: SolicitudDetalle }> = await apiClient.get(`/api/solicitudes/${id}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al obtener solicitud')
    }
    
    return response.data.solicitud
  }

  /**
   * Crear nueva solicitud
   */
  static async crearSolicitud(solicitud: NuevaSolicitud): Promise<Solicitud> {
    const response: ApiResponse<{ solicitud: Solicitud }> = await apiClient.post('/api/solicitudes', solicitud)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al crear solicitud')
    }
    
    return response.data.solicitud
  }

  /**
   * Actualizar estado de solicitud
   */
  static async actualizarEstado(id: string, datos: ActualizarEstadoSolicitud): Promise<Solicitud> {
    const response: ApiResponse<{ solicitud: Solicitud }> = await apiClient.patch(`/api/solicitudes/${id}/estado`, datos)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar estado')
    }
    
    return response.data.solicitud
  }

  /**
   * Aprobar solicitud
   */
  static async aprobarSolicitud(id: string, comentario?: string): Promise<Solicitud> {
    return this.actualizarEstado(id, {
      estado: 'aprobada',
      observacionesAprobacion: comentario,
      fechaAprobacion: new Date().toISOString()
    })
  }

  /**
   * Rechazar solicitud
   */
  static async rechazarSolicitud(id: string, comentario?: string): Promise<Solicitud> {
    return this.actualizarEstado(id, {
      estado: 'rechazada',
      observacionesAprobacion: comentario,
      fechaAprobacion: new Date().toISOString()
    })
  }

  /**
   * Poner solicitud en revisión
   */
  static async ponerEnRevision(id: string, comentario?: string): Promise<Solicitud> {
    return this.actualizarEstado(id, {
      estado: 'en_revision',
      observacionesAprobacion: comentario
    })
  }

  /**
   * Obtener estadísticas de solicitudes
   */
  static async obtenerEstadisticas(): Promise<EstadisticasSolicitudes> {
    const response: ApiResponse<EstadisticasSolicitudes> = await apiClient.get('/api/solicitudes/estadisticas')
    
    if (!response.success) {
      throw new Error(response.message || 'Error al obtener estadísticas')
    }
    
    return response.data
  }

  /**
   * Buscar solicitudes por texto libre
   */
  static async buscarSolicitudes(termino: string, filtros: Omit<FiltrosSolicitudes, 'busqueda'> = {}): Promise<RespuestaSolicitudes> {
    return this.obtenerSolicitudes({
      ...filtros,
      busqueda: termino
    })
  }

  /**
   * Exportar solicitudes a Excel
   */
  static async exportarSolicitudes(filtros: FiltrosSolicitudes = {}): Promise<Blob> {
    const params = new URLSearchParams()
    
    // Agregar parámetros de filtro
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const queryString = params.toString()
    const endpoint = `/api/solicitudes/export${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Error al exportar solicitudes')
    }
    
    return response.blob()
  }
}

/**
 * Servicio para gestión de empleados (para selección en formularios)
 */
export class EmpleadosService {
  
  /**
   * Obtener lista de empleados activos
   */
  static async obtenerEmpleados(filtros: { busqueda?: string, area?: string } = {}): Promise<Empleado[]> {
    const params = new URLSearchParams()
    
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda)
    if (filtros.area) params.append('area', filtros.area)
    params.append('activo', 'true')
    
    const queryString = params.toString()
    const endpoint = `/api/empleados${queryString ? `?${queryString}` : ''}`
    
    const response: ApiResponse<{ empleados: Empleado[] }> = await apiClient.get(endpoint)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al obtener empleados')
    }
    
    return response.data.empleados
  }

  /**
   * Buscar empleados por nombre/legajo
   */
  static async buscarEmpleados(termino: string): Promise<Empleado[]> {
    return this.obtenerEmpleados({ busqueda: termino })
  }

  /**
   * Obtener empleado por ID
   */
  static async obtenerEmpleadoPorId(id: string): Promise<Empleado> {
    const response: ApiResponse<{ empleado: Empleado }> = await apiClient.get(`/api/empleados/${id}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al obtener empleado')
    }
    
    return response.data.empleado
  }
}

/**
 * Servicio para tipos de licencia
 */
export class TiposLicenciaService {

  /**
   * Obtener tipos de licencia activos
   * Nota: Por ahora usamos datos mock hasta que se implemente la API
   */
  static async obtenerTiposLicencia(): Promise<TipoLicencia[]> {
    // TODO: Implementar API real para tipos de licencia
    // Por ahora retornamos datos mock basados en la BD
    return Promise.resolve([
      {
        id: '1',
        nombre: 'Licencia por Matrimonio',
        codigo: 'MATRIMONIO',
        diasMaximos: 10,
        requiereDocumentacion: true,
        activo: true,
        descripcion: 'Licencia por matrimonio civil o religioso'
      },
      {
        id: '2',
        nombre: 'Licencia por Enfermedad (hasta 3 días)',
        codigo: 'ENFERMEDAD_CORTA',
        diasMaximos: 3,
        requiereDocumentacion: true,
        activo: true,
        descripcion: 'Licencia por enfermedad de corta duración'
      },
      {
        id: '3',
        nombre: 'Licencia Compensatoria',
        codigo: 'COMPENSATORIA',
        diasMaximos: 30,
        requiereDocumentacion: false,
        activo: true,
        descripcion: 'Licencia compensatoria por trabajo en feria judicial'
      },
      {
        id: '4',
        nombre: 'Licencia por Nacimiento',
        codigo: 'NACIMIENTO',
        diasMaximos: 15,
        requiereDocumentacion: true,
        activo: true,
        descripcion: 'Licencia por nacimiento de hijo'
      },
      {
        id: '5',
        nombre: 'Licencia Anual',
        codigo: 'ANUAL',
        diasMaximos: 30,
        requiereDocumentacion: false,
        activo: true,
        descripcion: 'Licencia anual ordinaria'
      }
    ])
  }
}

// Hooks personalizados para React Query (opcional)
export const solicitudesQueryKeys = {
  all: ['solicitudes'] as const,
  lists: () => [...solicitudesQueryKeys.all, 'list'] as const,
  list: (filtros: FiltrosSolicitudes) => [...solicitudesQueryKeys.lists(), filtros] as const,
  details: () => [...solicitudesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...solicitudesQueryKeys.details(), id] as const,
  estadisticas: () => [...solicitudesQueryKeys.all, 'estadisticas'] as const,
}

export const empleadosQueryKeys = {
  all: ['empleados'] as const,
  lists: () => [...empleadosQueryKeys.all, 'list'] as const,
  list: (filtros: any) => [...empleadosQueryKeys.lists(), filtros] as const,
}

export const tiposLicenciaQueryKeys = {
  all: ['tipos-licencia'] as const,
  list: () => [...tiposLicenciaQueryKeys.all, 'list'] as const,
}
