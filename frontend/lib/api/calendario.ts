import { apiClient } from './client'
import type { 
  EventoCalendario,
  FiltrosCalendario,
  RespuestaCalendario,
  EstadisticasCalendario,
  HeatmapData,
  AnalisisPatrones,
  CalendarioCompacto,
  PeriodoEspecial,
  ConfiguracionCalendario,
  ConflictoCalendario,
  ExportacionCalendario
} from '@/lib/types/calendario'
import type { ApiResponse } from '@/lib/auth/types'

/**
 * Servicio para gestión del calendario general de licencias
 */
export class CalendarioService {
  
  /**
   * Obtener eventos del calendario con filtros
   */
  static async obtenerEventos(filtros: FiltrosCalendario = {}): Promise<RespuestaCalendario> {
    const params = new URLSearchParams()
    
    // Agregar parámetros de filtro
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio.toISOString())
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin.toISOString())
    if (filtros.areas?.length) params.append('areas', filtros.areas.join(','))
    if (filtros.empleados?.length) params.append('empleados', filtros.empleados.join(','))
    if (filtros.tiposLicencia?.length) params.append('tiposLicencia', filtros.tiposLicencia.join(','))
    if (filtros.estados?.length) params.append('estados', filtros.estados.join(','))
    if (filtros.tipos?.length) params.append('tipos', filtros.tipos.join(','))
    if (filtros.jerarquias?.length) params.append('jerarquias', filtros.jerarquias.join(','))
    if (filtros.soloConflictos) params.append('soloConflictos', 'true')
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda)
    
    const queryString = params.toString()
    const endpoint = `/api/calendario${queryString ? `?${queryString}` : ''}`
    
    // TODO: Implementar endpoint real en el backend
    // Por ahora retornamos datos mock
    return Promise.resolve(this.generarDatosMockCalendario(filtros))
  }

  /**
   * Obtener estadísticas del calendario
   */
  static async obtenerEstadisticas(filtros: FiltrosCalendario = {}): Promise<EstadisticasCalendario> {
    // TODO: Implementar endpoint específico en el backend
    return Promise.resolve({
      totalEventos: 156,
      eventosPorTipo: {
        licencia: 120,
        feria_judicial: 12,
        receso: 8,
        feriado: 10,
        capacitacion: 4,
        reunion: 2,
        evento_especial: 0
      },
      eventosPorEstado: {
        pendiente: 25,
        aprobada: 98,
        rechazada: 8,
        en_revision: 15,
        confirmada: 10,
        cancelada: 0
      },
      coberturaPromedio: 78.5,
      conflictosActivos: 3,
      proximasLicencias: [],
      periodosConflictivos: [
        {
          fecha: new Date('2025-12-20'),
          conflictos: 5,
          descripcion: 'Período navideño con alta demanda'
        }
      ],
      tendencias: {
        mesAnterior: 142,
        cambioMensual: 9.8,
        proyeccionMes: 165
      }
    })
  }

  /**
   * Obtener datos para heatmap
   */
  static async obtenerHeatmap(año: number): Promise<HeatmapData[]> {
    // TODO: Implementar endpoint específico en el backend
    const datos: HeatmapData[] = []
    const inicioAño = new Date(año, 0, 1)
    const finAño = new Date(año, 11, 31)
    
    for (let fecha = new Date(inicioAño); fecha <= finAño; fecha.setDate(fecha.getDate() + 1)) {
      const valor = Math.random() * 10
      datos.push({
        fecha: new Date(fecha),
        valor,
        eventos: Math.floor(valor),
        tipo: valor < 2 ? 'bajo' : valor < 5 ? 'medio' : valor < 8 ? 'alto' : 'critico',
        detalles: {
          licencias: Math.floor(valor * 0.8),
          empleadosAfectados: Math.floor(valor * 1.2),
          areasAfectadas: ['Defensoría Penal', 'Administración'].slice(0, Math.floor(valor / 3) + 1)
        }
      })
    }
    
    return Promise.resolve(datos)
  }

  /**
   * Obtener análisis de patrones
   */
  static async obtenerAnalisisPatrones(): Promise<AnalisisPatrones> {
    // TODO: Implementar endpoint específico en el backend
    return Promise.resolve({
      patronesEstacionales: [
        { mes: 1, promedio: 8.5, pico: 15, tendencia: 'ascendente' },
        { mes: 2, promedio: 6.2, pico: 12, tendencia: 'estable' },
        { mes: 3, promedio: 7.8, pico: 14, tendencia: 'ascendente' },
        { mes: 12, promedio: 12.5, pico: 25, tendencia: 'ascendente' }
      ],
      diasCriticos: [
        {
          fecha: new Date('2025-12-24'),
          motivo: 'Nochebuena - Alta demanda de licencias',
          impacto: 9.2
        }
      ],
      recomendaciones: [
        {
          tipo: 'planificacion',
          descripcion: 'Considerar restricciones en diciembre para mantener cobertura mínima',
          prioridad: 'alta'
        }
      ]
    })
  }

  /**
   * Obtener calendario compacto para dashboard
   */
  static async obtenerCalendarioCompacto(): Promise<CalendarioCompacto> {
    // TODO: Implementar endpoint específico en el backend
    return Promise.resolve({
      proximasLicencias: [
        {
          id: '1',
          empleado: 'Juan Pérez',
          tipo: 'Licencia Anual',
          fechaInicio: new Date('2025-08-15'),
          dias: 5,
          estado: 'aprobada'
        },
        {
          id: '2',
          empleado: 'María González',
          tipo: 'Licencia Compensatoria',
          fechaInicio: new Date('2025-08-20'),
          dias: 3,
          estado: 'pendiente'
        }
      ],
      alertas: [
        {
          tipo: 'cobertura_critica',
          mensaje: 'Cobertura crítica en Defensoría Penal para el 25/08',
          severidad: 'warning',
          fecha: new Date('2025-08-25')
        }
      ],
      coberturaPorArea: [
        {
          area: 'Defensoría Penal',
          cobertura: 85,
          empleadosPresentes: 17,
          empleadosTotal: 20,
          estado: 'aceptable'
        },
        {
          area: 'Defensoría Civil',
          cobertura: 92,
          empleadosPresentes: 23,
          empleadosTotal: 25,
          estado: 'optima'
        }
      ],
      eventosHoy: []
    })
  }

  /**
   * Crear nuevo evento en el calendario
   */
  static async crearEvento(evento: Partial<EventoCalendario>): Promise<EventoCalendario> {
    const response: ApiResponse<{ evento: EventoCalendario }> = await apiClient.post('/api/calendario/eventos', evento)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al crear evento')
    }
    
    return response.data.evento
  }

  /**
   * Actualizar evento existente
   */
  static async actualizarEvento(id: string, datos: Partial<EventoCalendario>): Promise<EventoCalendario> {
    const response: ApiResponse<{ evento: EventoCalendario }> = await apiClient.put(`/api/calendario/eventos/${id}`, datos)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar evento')
    }
    
    return response.data.evento
  }

  /**
   * Eliminar evento
   */
  static async eliminarEvento(id: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.delete(`/api/calendario/eventos/${id}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar evento')
    }
  }

  /**
   * Mover evento (drag & drop)
   */
  static async moverEvento(id: string, nuevaFecha: Date): Promise<EventoCalendario> {
    const response: ApiResponse<{ evento: EventoCalendario }> = await apiClient.patch(`/api/calendario/eventos/${id}/mover`, {
      fechaInicio: nuevaFecha.toISOString()
    })
    
    if (!response.success) {
      throw new Error(response.message || 'Error al mover evento')
    }
    
    return response.data.evento
  }

  /**
   * Detectar conflictos para un evento
   */
  static async detectarConflictos(evento: Partial<EventoCalendario>): Promise<ConflictoCalendario[]> {
    // TODO: Implementar endpoint específico en el backend
    return Promise.resolve([])
  }

  /**
   * Obtener períodos especiales
   */
  static async obtenerPeriodosEspeciales(): Promise<PeriodoEspecial[]> {
    // TODO: Implementar endpoint específico en el backend
    return Promise.resolve([
      {
        id: '1',
        nombre: 'Feria Judicial de Enero',
        descripcion: 'Período de feria judicial',
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-01-31'),
        tipo: 'feria_judicial',
        color: '#6366f1',
        reglas: {
          bloquearLicencias: false,
          limitarSolicitudes: true,
          requiereAprobacionEspecial: true
        }
      }
    ])
  }

  /**
   * Obtener configuración del calendario
   */
  static async obtenerConfiguracion(): Promise<ConfiguracionCalendario> {
    // TODO: Implementar endpoint específico en el backend
    return Promise.resolve({
      vistaDefecto: 'mes',
      horaInicio: 8,
      horaFin: 18,
      diasSemana: [1, 2, 3, 4, 5],
      coloresPorTipo: {
        licencia: '#10b981',
        feria_judicial: '#6366f1',
        receso: '#8b5cf6',
        feriado: '#ef4444',
        capacitacion: '#f59e0b',
        reunion: '#06b6d4',
        evento_especial: '#ec4899'
      },
      coloresPorEstado: {
        pendiente: '#f59e0b',
        aprobada: '#10b981',
        rechazada: '#ef4444',
        en_revision: '#06b6d4',
        confirmada: '#22c55e',
        cancelada: '#6b7280'
      },
      mostrarFinDeSemana: false,
      alertas: [],
      reglasConflicto: []
    })
  }

  /**
   * Exportar calendario
   */
  static async exportarCalendario(configuracion: ExportacionCalendario): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('formato', configuracion.formato)
    params.append('fechaInicio', configuracion.fechaInicio.toISOString())
    params.append('fechaFin', configuracion.fechaFin.toISOString())
    params.append('incluirDetalles', configuracion.incluirDetalles.toString())
    params.append('incluirEstadisticas', configuracion.incluirEstadisticas.toString())
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/calendario/export?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Error al exportar calendario')
    }
    
    return response.blob()
  }

  /**
   * Generar datos mock para desarrollo
   */
  private static generarDatosMockCalendario(filtros: FiltrosCalendario): RespuestaCalendario {
    const eventos: EventoCalendario[] = [
      {
        id: '1',
        titulo: 'Licencia Anual - Juan Pérez',
        fechaInicio: new Date('2025-08-15'),
        fechaFin: new Date('2025-08-19'),
        tipo: 'licencia',
        estado: 'aprobada',
        color: '#10b981',
        empleado: {
          id: '1',
          nombre: 'Juan',
          apellido: 'Pérez',
          legajo: '12345',
          area: 'Defensoría Penal',
          jerarquia: 'FUNCIONARIO'
        },
        tipoLicencia: {
          id: '1',
          nombre: 'Licencia Anual',
          codigo: 'ANUAL',
          color: '#10b981'
        },
        editable: true
      },
      {
        id: '2',
        titulo: 'Feria Judicial',
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-01-31'),
        tipo: 'feria_judicial',
        color: '#6366f1',
        editable: false
      }
    ]

    return {
      eventos,
      periodosEspeciales: [],
      conflictos: [],
      estadisticas: {
        totalEventos: eventos.length,
        eventosPorTipo: {
          licencia: 1,
          feria_judicial: 1,
          receso: 0,
          feriado: 0,
          capacitacion: 0,
          reunion: 0,
          evento_especial: 0
        },
        eventosPorEstado: {
          pendiente: 0,
          aprobada: 1,
          rechazada: 0,
          en_revision: 0,
          confirmada: 1,
          cancelada: 0
        },
        coberturaPromedio: 85,
        conflictosActivos: 0,
        proximasLicencias: [],
        periodosConflictivos: [],
        tendencias: {
          mesAnterior: 45,
          cambioMensual: 5.2,
          proyeccionMes: 52
        }
      },
      configuracion: {
        vistaDefecto: 'mes',
        horaInicio: 8,
        horaFin: 18,
        diasSemana: [1, 2, 3, 4, 5],
        coloresPorTipo: {
          licencia: '#10b981',
          feria_judicial: '#6366f1',
          receso: '#8b5cf6',
          feriado: '#ef4444',
          capacitacion: '#f59e0b',
          reunion: '#06b6d4',
          evento_especial: '#ec4899'
        },
        coloresPorEstado: {
          pendiente: '#f59e0b',
          aprobada: '#10b981',
          rechazada: '#ef4444',
          en_revision: '#06b6d4',
          confirmada: '#22c55e',
          cancelada: '#6b7280'
        },
        mostrarFinDeSemana: false,
        alertas: [],
        reglasConflicto: []
      }
    }
  }
}

// Hooks personalizados para React Query
export const calendarioQueryKeys = {
  all: ['calendario'] as const,
  eventos: (filtros: FiltrosCalendario) => [...calendarioQueryKeys.all, 'eventos', filtros] as const,
  estadisticas: (filtros: FiltrosCalendario) => [...calendarioQueryKeys.all, 'estadisticas', filtros] as const,
  heatmap: (año: number) => [...calendarioQueryKeys.all, 'heatmap', año] as const,
  patrones: () => [...calendarioQueryKeys.all, 'patrones'] as const,
  compacto: () => [...calendarioQueryKeys.all, 'compacto'] as const,
  configuracion: () => [...calendarioQueryKeys.all, 'configuracion'] as const,
}
