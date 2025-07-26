import { apiClient } from './client'
import type { 
  EmpleadoCompleto,
  EmpleadoBasico,
  NuevoEmpleado,
  ActualizarEmpleado,
  FiltrosEmpleados,
  RespuestaEmpleados,
  EstadisticasLicenciasEmpleado,
  HistorialLicenciasEmpleado,
  CalendarioEmpleado,
  EstadisticasGeneralesEmpleados,
  ImportacionEmpleados
} from '@/lib/types/empleados'
import type { ApiResponse } from '@/lib/auth/types'

/**
 * Servicio para gestión completa de empleados
 */
export class EmpleadosService {
  
  /**
   * Obtener lista de empleados con filtros
   */
  static async obtenerEmpleados(filtros: FiltrosEmpleados = {}): Promise<RespuestaEmpleados> {
    const params = new URLSearchParams()
    
    // Agregar parámetros de filtro
    if (filtros.page) params.append('page', filtros.page.toString())
    if (filtros.limit) params.append('limit', filtros.limit.toString())
    if (filtros.search) params.append('search', filtros.search)
    if (filtros.area) params.append('area', filtros.area)
    if (filtros.jerarquia) params.append('jerarquia', filtros.jerarquia)
    if (filtros.estado) params.append('estado', filtros.estado)
    if (filtros.activo !== undefined) params.append('activo', filtros.activo.toString())
    if (filtros.jefaturaDirectaId) params.append('jefaturaDirectaId', filtros.jefaturaDirectaId)
    
    const queryString = params.toString()
    const endpoint = `/api/empleados${queryString ? `?${queryString}` : ''}`
    
    const response: ApiResponse<RespuestaEmpleados> = await apiClient.get(endpoint)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al obtener empleados')
    }
    
    return response.data
  }

  /**
   * Obtener empleado por ID con información completa
   */
  static async obtenerEmpleadoPorId(id: string): Promise<EmpleadoCompleto> {
    const response: ApiResponse<{ empleado: EmpleadoCompleto }> = await apiClient.get(`/api/empleados/${id}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al obtener empleado')
    }
    
    return response.data.empleado
  }

  /**
   * Crear nuevo empleado
   */
  static async crearEmpleado(empleado: NuevoEmpleado): Promise<EmpleadoCompleto> {
    const response: ApiResponse<{ empleado: EmpleadoCompleto }> = await apiClient.post('/api/empleados', empleado)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al crear empleado')
    }
    
    return response.data.empleado
  }

  /**
   * Actualizar empleado existente
   */
  static async actualizarEmpleado(id: string, datos: ActualizarEmpleado): Promise<EmpleadoCompleto> {
    const response: ApiResponse<{ empleado: EmpleadoCompleto }> = await apiClient.put(`/api/empleados/${id}`, datos)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar empleado')
    }
    
    return response.data.empleado
  }

  /**
   * Desactivar empleado (soft delete)
   */
  static async desactivarEmpleado(id: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.delete(`/api/empleados/${id}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al desactivar empleado')
    }
  }

  /**
   * Activar empleado
   */
  static async activarEmpleado(id: string): Promise<EmpleadoCompleto> {
    return this.actualizarEmpleado(id, { activo: true } as ActualizarEmpleado)
  }

  /**
   * Buscar empleados por término (para autocompletado)
   */
  static async buscarEmpleados(termino: string): Promise<EmpleadoBasico[]> {
    const response = await this.obtenerEmpleados({ 
      search: termino, 
      limit: 10,
      activo: true 
    })
    
    return response.empleados.map(emp => ({
      id: emp.id,
      legajo: emp.legajo,
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email,
      area: emp.area,
      jerarquia: emp.jerarquia,
      activo: emp.activo
    }))
  }

  /**
   * Obtener estadísticas de licencias de un empleado
   */
  static async obtenerEstadisticasLicencias(empleadoId: string): Promise<EstadisticasLicenciasEmpleado> {
    // TODO: Implementar endpoint específico en el backend
    // Por ahora retornamos datos mock
    return Promise.resolve({
      totalSolicitudes: 12,
      solicitudesAprobadas: 10,
      solicitudesRechazadas: 1,
      solicitudesPendientes: 1,
      diasTomados: 25,
      diasDisponibles: 15,
      ultimaSolicitud: {
        id: '1',
        tipo: 'Licencia Anual',
        fechaInicio: '2024-12-01',
        fechaFin: '2024-12-05',
        estado: 'aprobada'
      },
      proximasLicencias: [
        {
          id: '2',
          tipo: 'Licencia Compensatoria',
          fechaInicio: '2025-01-15',
          fechaFin: '2025-01-17',
          diasSolicitados: 3
        }
      ]
    })
  }

  /**
   * Obtener historial completo de licencias de un empleado
   */
  static async obtenerHistorialLicencias(empleadoId: string, año?: number): Promise<HistorialLicenciasEmpleado> {
    // TODO: Implementar endpoint específico en el backend
    // Por ahora retornamos datos mock
    return Promise.resolve({
      solicitudes: [
        {
          id: '1',
          tipoLicencia: 'Licencia Anual',
          fechaInicio: '2024-12-01',
          fechaFin: '2024-12-05',
          diasSolicitados: 5,
          estado: 'aprobada',
          fechaSolicitud: '2024-11-15',
          fechaAprobacion: '2024-11-16',
          motivo: 'Vacaciones familiares',
          observaciones: 'Aprobada sin observaciones'
        }
      ],
      resumenAnual: {
        año: año || new Date().getFullYear(),
        totalDias: 25,
        diasPorTipo: {
          'Licencia Anual': 20,
          'Licencia Compensatoria': 5
        },
        solicitudesPorMes: [
          { mes: 1, cantidad: 1, dias: 5 },
          { mes: 6, cantidad: 2, dias: 10 },
          { mes: 12, cantidad: 1, dias: 10 }
        ]
      }
    })
  }

  /**
   * Obtener calendario personal del empleado
   */
  static async obtenerCalendarioEmpleado(empleadoId: string): Promise<CalendarioEmpleado> {
    // TODO: Implementar endpoint específico en el backend
    // Por ahora retornamos datos mock
    return Promise.resolve({
      licenciasHistoricas: [
        {
          id: '1',
          tipo: 'Licencia Anual',
          fechaInicio: '2024-12-01',
          fechaFin: '2024-12-05',
          estado: 'aprobada',
          color: '#10b981'
        }
      ],
      licenciasFuturas: [
        {
          id: '2',
          tipo: 'Licencia Compensatoria',
          fechaInicio: '2025-01-15',
          fechaFin: '2025-01-17',
          estado: 'pendiente',
          color: '#f59e0b'
        }
      ],
      periodosEspeciales: [
        {
          nombre: 'Feria Judicial',
          fechaInicio: '2025-01-01',
          fechaFin: '2025-01-31',
          tipo: 'feria_judicial',
          color: '#6366f1'
        }
      ]
    })
  }

  /**
   * Obtener estadísticas generales de empleados
   */
  static async obtenerEstadisticasGenerales(): Promise<EstadisticasGeneralesEmpleados> {
    // TODO: Implementar endpoint específico en el backend
    // Por ahora retornamos datos mock
    return Promise.resolve({
      totalEmpleados: 150,
      empleadosActivos: 145,
      empleadosInactivos: 5,
      empleadosPorJerarquia: [
        { jerarquia: 'MAGISTRADO', cantidad: 15, porcentaje: 10 },
        { jerarquia: 'FUNCIONARIO', cantidad: 45, porcentaje: 30 },
        { jerarquia: 'EMPLEADO', cantidad: 90, porcentaje: 60 }
      ],
      empleadosPorArea: [
        { area: 'Defensoría Penal', cantidad: 60, porcentaje: 40 },
        { area: 'Defensoría Civil', cantidad: 45, porcentaje: 30 },
        { area: 'Administración', cantidad: 30, porcentaje: 20 },
        { area: 'Sistemas', cantidad: 15, porcentaje: 10 }
      ],
      promedioAntiguedad: 8.5,
      empleadosRecientes: []
    })
  }

  /**
   * Exportar empleados a Excel
   */
  static async exportarEmpleados(filtros: FiltrosEmpleados = {}): Promise<Blob> {
    const params = new URLSearchParams()
    
    // Agregar parámetros de filtro
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const queryString = params.toString()
    const endpoint = `/api/empleados/export${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Error al exportar empleados')
    }
    
    return response.blob()
  }

  /**
   * Importar empleados desde Excel
   */
  static async importarEmpleados(archivo: File): Promise<ImportacionEmpleados> {
    const formData = new FormData()
    formData.append('archivo', archivo)
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/empleados/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Error al importar empleados')
    }
    
    const data = await response.json()
    return data.data
  }

  /**
   * Obtener áreas disponibles
   */
  static async obtenerAreas(): Promise<string[]> {
    // TODO: Implementar endpoint específico en el backend
    // Por ahora retornamos datos mock
    return Promise.resolve([
      'Defensoría Penal',
      'Defensoría Civil',
      'Defensoría de Menores',
      'Administración',
      'Recursos Humanos',
      'Sistemas',
      'Contaduría',
      'Mesa de Entradas',
      'Archivo',
      'Biblioteca'
    ])
  }

  /**
   * Obtener empleados que pueden ser jefes (para jerarquía)
   */
  static async obtenerPosiblesJefes(jerarquiaEmpleado: string): Promise<EmpleadoBasico[]> {
    // Filtrar empleados con jerarquía superior
    const jerarquias = ['EMPLEADO', 'FUNCIONARIO', 'MAGISTRADO']
    const indexActual = jerarquias.indexOf(jerarquiaEmpleado)
    
    if (indexActual === -1 || indexActual === jerarquias.length - 1) {
      return []
    }
    
    const jerarquiasSuperiores = jerarquias.slice(indexActual + 1)
    const empleados = await this.obtenerEmpleados({ 
      activo: true,
      limit: 100
    })
    
    return empleados.empleados
      .filter(emp => jerarquiasSuperiores.includes(emp.jerarquia))
      .map(emp => ({
        id: emp.id,
        legajo: emp.legajo,
        nombre: emp.nombre,
        apellido: emp.apellido,
        email: emp.email,
        area: emp.area,
        jerarquia: emp.jerarquia,
        activo: emp.activo
      }))
  }
}

// Hooks personalizados para React Query
export const empleadosQueryKeys = {
  all: ['empleados'] as const,
  lists: () => [...empleadosQueryKeys.all, 'list'] as const,
  list: (filtros: FiltrosEmpleados) => [...empleadosQueryKeys.lists(), filtros] as const,
  details: () => [...empleadosQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...empleadosQueryKeys.details(), id] as const,
  estadisticas: () => [...empleadosQueryKeys.all, 'estadisticas'] as const,
  historial: (id: string, año?: number) => [...empleadosQueryKeys.all, 'historial', id, año] as const,
  calendario: (id: string) => [...empleadosQueryKeys.all, 'calendario', id] as const,
  areas: () => [...empleadosQueryKeys.all, 'areas'] as const,
  jefes: (jerarquia: string) => [...empleadosQueryKeys.all, 'jefes', jerarquia] as const,
}
