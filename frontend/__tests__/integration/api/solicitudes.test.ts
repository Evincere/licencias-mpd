import { SolicitudesService } from '@/lib/api/solicitudes'
import type { NuevaSolicitud } from '@/lib/types/solicitudes'

// Mock fetch para tests de integración
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('SolicitudesService - Integration Tests', () => {
  const API_BASE = 'http://localhost:3001'
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('obtenerSolicitudes', () => {
    it('obtiene solicitudes exitosamente', async () => {
      const mockSolicitudes = [
        {
          id: 'sol_001',
          empleadoId: 'emp_001',
          tipo: 'Licencia Anual',
          fechaInicio: '2024-03-15',
          fechaFin: '2024-03-20',
          diasSolicitados: 6,
          estado: 'PENDIENTE',
          motivo: 'Vacaciones familiares',
          fechaSolicitud: '2024-03-01T10:00:00Z'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ solicitudes: mockSolicitudes, total: 1 })
      })

      const resultado = await SolicitudesService.obtenerSolicitudes()

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/api/solicitudes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(resultado.solicitudes).toHaveLength(1)
      expect(resultado.solicitudes[0].id).toBe('sol_001')
      expect(resultado.total).toBe(1)
    })

    it('maneja errores de red correctamente', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(SolicitudesService.obtenerSolicitudes()).rejects.toThrow('Network error')
    })

    it('maneja respuestas de error HTTP', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(SolicitudesService.obtenerSolicitudes()).rejects.toThrow('Error HTTP: 500')
    })

    it('aplica filtros correctamente', async () => {
      const filtros = {
        estado: 'PENDIENTE' as const,
        empleadoId: 'emp_001',
        fechaDesde: new Date('2024-03-01'),
        fechaHasta: new Date('2024-03-31')
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ solicitudes: [], total: 0 })
      })

      await SolicitudesService.obtenerSolicitudes(filtros)

      const expectedUrl = new URL(`${API_BASE}/api/solicitudes`)
      expectedUrl.searchParams.set('estado', 'PENDIENTE')
      expectedUrl.searchParams.set('empleadoId', 'emp_001')
      expectedUrl.searchParams.set('fechaDesde', '2024-03-01T00:00:00.000Z')
      expectedUrl.searchParams.set('fechaHasta', '2024-03-31T00:00:00.000Z')

      expect(mockFetch).toHaveBeenCalledWith(expectedUrl.toString(), expect.any(Object))
    })
  })

  describe('crearSolicitud', () => {
    const nuevaSolicitud: NuevaSolicitud = {
      empleadoId: 'emp_001',
      tipo: 'Licencia Anual',
      fechaInicio: new Date('2024-03-15'),
      fechaFin: new Date('2024-03-20'),
      diasSolicitados: 6,
      motivo: 'Vacaciones familiares',
      observaciones: 'Solicitud urgente',
      documentosAdjuntos: []
    }

    it('crea solicitud exitosamente', async () => {
      const mockSolicitudCreada = {
        id: 'sol_002',
        ...nuevaSolicitud,
        estado: 'PENDIENTE',
        fechaSolicitud: '2024-03-01T10:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSolicitudCreada
      })

      const resultado = await SolicitudesService.crearSolicitud(nuevaSolicitud)

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/api/solicitudes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaSolicitud)
      })

      expect(resultado.id).toBe('sol_002')
      expect(resultado.estado).toBe('PENDIENTE')
    })

    it('valida datos de entrada', async () => {
      const solicitudInvalida = {
        ...nuevaSolicitud,
        empleadoId: '', // ID vacío
        diasSolicitados: 0 // Días inválidos
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Datos de solicitud inválidos',
          detalles: ['empleadoId es requerido', 'diasSolicitados debe ser mayor a 0']
        })
      })

      await expect(SolicitudesService.crearSolicitud(solicitudInvalida)).rejects.toThrow()
    })

    it('maneja conflictos de fechas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: 'Conflicto de fechas',
          mensaje: 'Ya existe una solicitud para este período'
        })
      })

      await expect(SolicitudesService.crearSolicitud(nuevaSolicitud)).rejects.toThrow()
    })
  })

  describe('actualizarEstadoSolicitud', () => {
    it('actualiza estado exitosamente', async () => {
      const mockSolicitudActualizada = {
        id: 'sol_001',
        estado: 'APROBADA',
        fechaAprobacion: '2024-03-02T14:30:00Z',
        aprobadoPor: 'sup_001'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSolicitudActualizada
      })

      const resultado = await SolicitudesService.actualizarEstadoSolicitud(
        'sol_001',
        'APROBADA',
        'Aprobada por supervisor',
        'sup_001'
      )

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/api/solicitudes/sol_001/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: 'APROBADA',
          comentario: 'Aprobada por supervisor',
          aprobadoPor: 'sup_001'
        })
      })

      expect(resultado.estado).toBe('APROBADA')
      expect(resultado.aprobadoPor).toBe('sup_001')
    })

    it('requiere autorización para cambios de estado', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'No autorizado',
          mensaje: 'No tienes permisos para aprobar solicitudes'
        })
      })

      await expect(
        SolicitudesService.actualizarEstadoSolicitud('sol_001', 'APROBADA')
      ).rejects.toThrow()
    })

    it('valida transiciones de estado válidas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Transición inválida',
          mensaje: 'No se puede cambiar de APROBADA a PENDIENTE'
        })
      })

      await expect(
        SolicitudesService.actualizarEstadoSolicitud('sol_001', 'PENDIENTE')
      ).rejects.toThrow()
    })
  })

  describe('obtenerSolicitudPorId', () => {
    it('obtiene solicitud específica exitosamente', async () => {
      const mockSolicitud = {
        id: 'sol_001',
        empleadoId: 'emp_001',
        tipo: 'Licencia Anual',
        estado: 'PENDIENTE',
        historial: [
          {
            fecha: '2024-03-01T10:00:00Z',
            accion: 'CREADA',
            usuario: 'emp_001',
            comentario: 'Solicitud creada'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSolicitud
      })

      const resultado = await SolicitudesService.obtenerSolicitudPorId('sol_001')

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/api/solicitudes/sol_001`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(resultado.id).toBe('sol_001')
      expect(resultado.historial).toHaveLength(1)
    })

    it('maneja solicitud no encontrada', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Solicitud no encontrada',
          mensaje: 'La solicitud sol_999 no existe'
        })
      })

      await expect(SolicitudesService.obtenerSolicitudPorId('sol_999')).rejects.toThrow()
    })
  })

  describe('eliminarSolicitud', () => {
    it('elimina solicitud exitosamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ mensaje: 'Solicitud eliminada exitosamente' })
      })

      await SolicitudesService.eliminarSolicitud('sol_001')

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/api/solicitudes/sol_001`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    it('no permite eliminar solicitudes aprobadas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Operación no permitida',
          mensaje: 'No se pueden eliminar solicitudes aprobadas'
        })
      })

      await expect(SolicitudesService.eliminarSolicitud('sol_001')).rejects.toThrow()
    })
  })

  describe('obtenerEstadisticas', () => {
    it('obtiene estadísticas exitosamente', async () => {
      const mockEstadisticas = {
        totalSolicitudes: 150,
        solicitudesPendientes: 12,
        solicitudesAprobadas: 128,
        solicitudesRechazadas: 10,
        promedioTiempoAprobacion: 2.5,
        distribucionPorTipo: {
          'Licencia Anual': 80,
          'Licencia por Enfermedad': 45,
          'Licencia Compensatoria': 25
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEstadisticas
      })

      const resultado = await SolicitudesService.obtenerEstadisticas()

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/api/solicitudes/estadisticas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(resultado.totalSolicitudes).toBe(150)
      expect(resultado.promedioTiempoAprobacion).toBe(2.5)
      expect(resultado.distribucionPorTipo).toBeDefined()
    })
  })
})
