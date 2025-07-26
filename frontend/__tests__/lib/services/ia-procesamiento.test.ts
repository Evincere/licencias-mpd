import { IAProcesamientoService } from '@/lib/services/ia-procesamiento'

// Mock fetch global
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('IAProcesamientoService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    mockFetch.mockReset()
  })

  describe('extraerDatosSolicitud', () => {
    const contenidoEmailEjemplo = `
      Estimados,
      Por la presente solicito licencia anual desde el 15/03/2024 hasta el 22/03/2024.
      Motivo: Vacaciones familiares programadas.
      Saludos cordiales,
      María García
    `
    const remitenteEjemplo = 'maria.garcia@jus.mendoza.gov.ar'

    it('extrae datos correctamente con Genkit disponible', async () => {
      // Mock respuesta exitosa de Genkit
      const mockRespuestaGenkit = {
        empleado: {
          nombre: 'María García',
          email: 'maria.garcia@jus.mendoza.gov.ar',
          area: 'Defensoría Civil',
          jerarquia: 'FUNCIONARIO'
        },
        licencia: {
          tipo: 'Licencia Anual',
          fechaInicio: new Date('2024-03-15'),
          fechaFin: new Date('2024-03-22'),
          dias: 8,
          motivo: 'Vacaciones familiares programadas'
        },
        confianza: 0.95,
        requiereRevision: false
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRespuestaGenkit
      })

      const resultado = await IAProcesamientoService.extraerDatosSolicitud(
        contenidoEmailEjemplo,
        remitenteEjemplo
      )

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4001/flows/extractLicenseData',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailContent: contenidoEmailEjemplo,
            senderEmail: remitenteEjemplo
          })
        })
      )

      expect(resultado).toEqual(mockRespuestaGenkit)
    })

    it('usa fallback cuando Genkit no está disponible', async () => {
      // Mock error de Genkit
      mockFetch.mockRejectedValueOnce(new Error('Genkit no disponible'))

      const resultado = await IAProcesamientoService.extraerDatosSolicitud(
        contenidoEmailEjemplo,
        remitenteEjemplo
      )

      // Verificar que se use el fallback
      expect(resultado.empleado.nombre).toBe('María García')
      expect(resultado.empleado.email).toBe(remitenteEjemplo)
      expect(resultado.licencia.tipo).toBe('Licencia Anual')
      expect(resultado.licencia.motivo).toContain('Vacaciones familiares')
      expect(resultado.confianza).toBeGreaterThan(0)
    })

    it('extrae fechas correctamente con diferentes formatos', async () => {
      const contenidoConFechas = `
        Solicito licencia del 01/04/2024 al 05/04/2024.
      `
      
      mockFetch.mockRejectedValueOnce(new Error('Usar fallback'))

      const resultado = await IAProcesamientoService.extraerDatosSolicitud(
        contenidoConFechas,
        remitenteEjemplo
      )

      expect(resultado.licencia.fechaInicio.getDate()).toBe(1)
      expect(resultado.licencia.fechaInicio.getMonth()).toBe(3) // Abril (0-indexed)
      expect(resultado.licencia.fechaFin.getDate()).toBe(5)
      expect(resultado.licencia.dias).toBe(5)
    })

    it('detecta diferentes tipos de licencia', async () => {
      const testCases = [
        { contenido: 'solicito licencia por enfermedad', tipoEsperado: 'Licencia por Enfermedad' },
        { contenido: 'necesito licencia compensatoria', tipoEsperado: 'Licencia Compensatoria' },
        { contenido: 'solicito franco compensatorio', tipoEsperado: 'Franco Compensatorio' },
        { contenido: 'licencia de maternidad', tipoEsperado: 'Licencia de Maternidad' }
      ]

      for (const testCase of testCases) {
        mockFetch.mockRejectedValueOnce(new Error('Usar fallback'))
        
        const resultado = await IAProcesamientoService.extraerDatosSolicitud(
          testCase.contenido,
          remitenteEjemplo
        )

        expect(resultado.licencia.tipo).toBe(testCase.tipoEsperado)
      }
    })

    it('determina correctamente el área del empleado', async () => {
      const testCases = [
        { email: 'test@defensoria.gov.ar', areaEsperada: 'Defensoría' },
        { email: 'test@civil.gov.ar', areaEsperada: 'Defensoría Civil' },
        { email: 'test@penal.gov.ar', areaEsperada: 'Defensoría Penal' },
        { email: 'test@rrhh.gov.ar', areaEsperada: 'Recursos Humanos' },
        { email: 'test@admin.gov.ar', areaEsperada: 'Administración' }
      ]

      for (const testCase of testCases) {
        mockFetch.mockRejectedValueOnce(new Error('Usar fallback'))
        
        const resultado = await IAProcesamientoService.extraerDatosSolicitud(
          'solicito licencia',
          testCase.email
        )

        expect(resultado.empleado.area).toBe(testCase.areaEsperada)
      }
    })

    it('marca como requiere revisión cuando hay baja confianza', async () => {
      const contenidoAmbiguo = 'necesito tiempo libre'
      
      mockFetch.mockRejectedValueOnce(new Error('Usar fallback'))

      const resultado = await IAProcesamientoService.extraerDatosSolicitud(
        contenidoAmbiguo,
        remitenteEjemplo
      )

      expect(resultado.requiereRevision).toBe(true)
      expect(resultado.confianza).toBeLessThan(0.8)
    })
  })

  describe('analizarSolicitud', () => {
    const solicitudEjemplo = {
      empleado: {
        nombre: 'Juan Pérez',
        email: 'juan.perez@jus.mendoza.gov.ar',
        area: 'Defensoría Civil',
        jerarquia: 'FUNCIONARIO' as const
      },
      licencia: {
        tipo: 'Licencia Anual',
        fechaInicio: new Date('2024-03-15'),
        fechaFin: new Date('2024-03-20'),
        dias: 6,
        motivo: 'Vacaciones familiares'
      },
      confianza: 0.9,
      requiereRevision: false
    }

    it('analiza solicitud con Genkit disponible', async () => {
      const mockAnalisisGenkit = {
        probabilidadAprobacion: 92,
        factoresRiesgo: [],
        recomendaciones: ['Aprobación automática recomendada'],
        tiempoEstimadoResolucion: 1,
        precedentesEncontrados: 5
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalisisGenkit
      })

      const resultado = await IAProcesamientoService.analizarSolicitud(solicitudEjemplo)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4001/flows/analyzeLicenseRequest',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(solicitudEjemplo)
        })
      )

      expect(resultado).toEqual(mockAnalisisGenkit)
    })

    it('usa fallback para análisis cuando Genkit no está disponible', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Genkit no disponible'))

      const resultado = await IAProcesamientoService.analizarSolicitud(solicitudEjemplo)

      expect(resultado.probabilidadAprobacion).toBeGreaterThan(0)
      expect(resultado.probabilidadAprobacion).toBeLessThanOrEqual(100)
      expect(resultado.tiempoEstimadoResolucion).toBeGreaterThan(0)
      expect(Array.isArray(resultado.factoresRiesgo)).toBe(true)
      expect(Array.isArray(resultado.recomendaciones)).toBe(true)
    })

    it('reduce probabilidad por factores de riesgo', async () => {
      const solicitudRiesgosa = {
        ...solicitudEjemplo,
        licencia: {
          ...solicitudEjemplo.licencia,
          dias: 20, // Más de 15 días
          tipo: 'Licencia General' // Tipo no específico
        },
        confianza: 0.6 // Baja confianza
      }

      mockFetch.mockRejectedValueOnce(new Error('Usar fallback'))

      const resultado = await IAProcesamientoService.analizarSolicitud(solicitudRiesgosa)

      expect(resultado.probabilidadAprobacion).toBeLessThan(85) // Base del 85%
      expect(resultado.factoresRiesgo.length).toBeGreaterThan(0)
      expect(resultado.factoresRiesgo).toContain('Solicitud de más de 15 días')
      expect(resultado.factoresRiesgo).toContain('Datos extraídos con baja confianza')
      expect(resultado.factoresRiesgo).toContain('Tipo de licencia no específico')
    })

    it('aumenta probabilidad para magistrados', async () => {
      const solicitudMagistrado = {
        ...solicitudEjemplo,
        empleado: {
          ...solicitudEjemplo.empleado,
          jerarquia: 'MAGISTRADO' as const
        }
      }

      mockFetch.mockRejectedValueOnce(new Error('Usar fallback'))

      const resultado = await IAProcesamientoService.analizarSolicitud(solicitudMagistrado)

      expect(resultado.probabilidadAprobacion).toBeGreaterThan(85) // Base + bonus magistrado
    })

    it('calcula tiempo de resolución basado en factores', async () => {
      const solicitudCompleja = {
        ...solicitudEjemplo,
        empleado: {
          ...solicitudEjemplo.empleado,
          jerarquia: 'EMPLEADO' as const
        },
        licencia: {
          ...solicitudEjemplo.licencia,
          dias: 20
        },
        requiereRevision: true
      }

      mockFetch.mockRejectedValueOnce(new Error('Usar fallback'))

      const resultado = await IAProcesamientoService.analizarSolicitud(solicitudCompleja)

      expect(resultado.tiempoEstimadoResolucion).toBeGreaterThan(3) // Base + factores
    })
  })

  describe('procesarConsultaAsistente', () => {
    it('procesa consulta con Genkit disponible', async () => {
      const mockRespuestaGenkit = {
        respuesta: 'Para solicitar una licencia, debes...',
        accionesSugeridas: ['Ver formulario', 'Consultar días'],
        documentosRelacionados: ['Manual del usuario'],
        confianza: 0.9
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRespuestaGenkit
      })

      const resultado = await IAProcesamientoService.procesarConsultaAsistente(
        'Como solicitar una licencia',
        { historial: [] }
      )

      expect(resultado).toEqual(mockRespuestaGenkit)
    })

    it('responde consultas frecuentes con fallback', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Usar fallback'))

      const testCases = [
        { consulta: 'como solicitar licencia', respuestaContiene: 'solicitar una licencia' },
        { consulta: 'días disponibles', respuestaContiene: 'días disponibles' },
        { consulta: 'estado solicitud', respuestaContiene: 'estado de tu solicitud' }
      ]

      for (const testCase of testCases) {
        const resultado = await IAProcesamientoService.procesarConsultaAsistente(
          testCase.consulta,
          {}
        )

        expect(resultado.respuesta.toLowerCase()).toContain(testCase.respuestaContiene)
        expect(resultado.accionesSugeridas.length).toBeGreaterThan(0)
        expect(resultado.confianza).toBeGreaterThan(0.5)
      }
    })

    it('proporciona respuesta genérica para consultas no reconocidas', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Usar fallback'))

      const resultado = await IAProcesamientoService.procesarConsultaAsistente(
        'consulta muy específica y rara',
        {}
      )

      expect(resultado.respuesta).toContain('no tengo información específica')
      expect(resultado.confianza).toBeLessThan(0.5)
      expect(resultado.accionesSugeridas).toContain('Contactar RRHH')
    })
  })
})
