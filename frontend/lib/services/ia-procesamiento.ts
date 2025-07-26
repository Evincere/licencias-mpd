/**
 * Servicio de IA para procesamiento inteligente de licencias
 * Integra con Genkit y proporciona fallbacks para desarrollo
 */

export interface DatosExtraidos {
  empleado: {
    nombre: string
    email: string
    area: string
    jerarquia: 'MAGISTRADO' | 'FUNCIONARIO' | 'EMPLEADO'
  }
  licencia: {
    tipo: string
    fechaInicio: Date
    fechaFin: Date
    dias: number
    motivo: string
    observaciones?: string
  }
  confianza: number
  requiereRevision: boolean
}

export interface AnalisisPredictivo {
  probabilidadAprobacion: number
  factoresRiesgo: string[]
  recomendaciones: string[]
  tiempoEstimadoResolucion: number
  precedentesEncontrados: number
}

export interface RespuestaAsistente {
  respuesta: string
  accionesSugeridas: string[]
  documentosRelacionados: string[]
  confianza: number
}

/**
 * Servicio principal de IA
 */
export class IAProcesamientoService {
  
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  private static readonly GENKIT_BASE = process.env.NEXT_PUBLIC_GENKIT_URL || 'http://localhost:4001'
  
  /**
   * Extrae datos de solicitud de licencia desde texto de email
   */
  static async extraerDatosSolicitud(
    contenidoEmail: string,
    remitenteEmail: string
  ): Promise<DatosExtraidos> {
    try {
      // Intentar con Genkit primero
      const resultadoGenkit = await this.extraerConGenkit(contenidoEmail, remitenteEmail)
      if (resultadoGenkit) {
        return resultadoGenkit
      }
    } catch (error) {
      console.warn('Genkit no disponible, usando fallback:', error)
    }
    
    // Fallback con procesamiento local
    return this.extraerConFallback(contenidoEmail, remitenteEmail)
  }
  
  /**
   * Realiza análisis predictivo de una solicitud
   */
  static async analizarSolicitud(solicitud: DatosExtraidos): Promise<AnalisisPredictivo> {
    try {
      // Intentar con Genkit
      const resultadoGenkit = await this.analizarConGenkit(solicitud)
      if (resultadoGenkit) {
        return resultadoGenkit
      }
    } catch (error) {
      console.warn('Genkit no disponible para análisis, usando fallback:', error)
    }
    
    // Fallback con reglas locales
    return this.analizarConFallback(solicitud)
  }
  
  /**
   * Procesa consulta del asistente virtual
   */
  static async procesarConsultaAsistente(
    consulta: string,
    contexto?: any
  ): Promise<RespuestaAsistente> {
    try {
      // Intentar con Genkit
      const resultadoGenkit = await this.consultarConGenkit(consulta, contexto)
      if (resultadoGenkit) {
        return resultadoGenkit
      }
    } catch (error) {
      console.warn('Genkit no disponible para consulta, usando fallback:', error)
    }
    
    // Fallback con respuestas predefinidas
    return this.consultarConFallback(consulta, contexto)
  }
  
  /**
   * Extracción con Genkit
   */
  private static async extraerConGenkit(
    contenido: string, 
    remitente: string
  ): Promise<DatosExtraidos | null> {
    try {
      const response = await fetch(`${this.GENKIT_BASE}/flows/extractLicenseData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailContent: contenido,
          senderEmail: remitente
        })
      })
      
      if (!response.ok) {
        throw new Error(`Genkit error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error con Genkit:', error)
      return null
    }
  }
  
  /**
   * Extracción con fallback (reglas y patrones)
   */
  private static extraerConFallback(
    contenido: string, 
    remitente: string
  ): DatosExtraidos {
    // Patrones de extracción
    const patronesFecha = [
      /desde\s+(?:el\s+)?(\d{1,2}\/\d{1,2}\/\d{4})\s+hasta\s+(?:el\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /del\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+al\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/i
    ]
    
    const patronesTipo = [
      { patron: /licencia\s+anual/i, tipo: 'Licencia Anual' },
      { patron: /licencia\s+por\s+enfermedad/i, tipo: 'Licencia por Enfermedad' },
      { patron: /licencia\s+compensatoria/i, tipo: 'Licencia Compensatoria' },
      { patron: /franco\s+compensatorio/i, tipo: 'Franco Compensatorio' },
      { patron: /licencia\s+especial/i, tipo: 'Licencia Especial' },
      { patron: /licencia\s+de\s+maternidad/i, tipo: 'Licencia de Maternidad' },
      { patron: /licencia\s+de\s+paternidad/i, tipo: 'Licencia de Paternidad' }
    ]
    
    // Extraer fechas
    let fechaInicio: Date | null = null
    let fechaFin: Date | null = null
    
    for (const patron of patronesFecha) {
      const match = contenido.match(patron)
      if (match) {
        fechaInicio = this.parsearFecha(match[1])
        fechaFin = this.parsearFecha(match[2])
        break
      }
    }
    
    // Extraer tipo de licencia
    let tipoLicencia = 'Licencia General'
    for (const { patron, tipo } of patronesTipo) {
      if (patron.test(contenido)) {
        tipoLicencia = tipo
        break
      }
    }
    
    // Extraer motivo
    const motivoMatch = contenido.match(/motivo[:\s]+([^.\n]+)/i)
    const motivo = motivoMatch ? motivoMatch[1].trim() : 'No especificado'
    
    // Calcular días
    const dias = fechaInicio && fechaFin 
      ? Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 1
    
    // Determinar empleado (simplificado)
    const nombreMatch = remitente.match(/([^@]+)@/)
    const nombre = nombreMatch ? this.formatearNombre(nombreMatch[1]) : 'Empleado Desconocido'
    
    return {
      empleado: {
        nombre,
        email: remitente,
        area: this.determinarArea(remitente),
        jerarquia: this.determinarJerarquia(remitente)
      },
      licencia: {
        tipo: tipoLicencia,
        fechaInicio: fechaInicio || new Date(),
        fechaFin: fechaFin || new Date(),
        dias,
        motivo,
        observaciones: this.extraerObservaciones(contenido)
      },
      confianza: this.calcularConfianza(fechaInicio, fechaFin, tipoLicencia),
      requiereRevision: !fechaInicio || !fechaFin || tipoLicencia === 'Licencia General'
    }
  }
  
  /**
   * Análisis predictivo con Genkit
   */
  private static async analizarConGenkit(solicitud: DatosExtraidos): Promise<AnalisisPredictivo | null> {
    try {
      const response = await fetch(`${this.GENKIT_BASE}/flows/analyzeLicenseRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solicitud)
      })
      
      if (!response.ok) {
        throw new Error(`Genkit error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error con análisis Genkit:', error)
      return null
    }
  }
  
  /**
   * Análisis predictivo con fallback
   */
  private static analizarConFallback(solicitud: DatosExtraidos): AnalisisPredictivo {
    const factoresRiesgo: string[] = []
    let probabilidad = 85 // Base del 85%
    
    // Factores que afectan la probabilidad
    if (solicitud.licencia.dias > 15) {
      factoresRiesgo.push('Solicitud de más de 15 días')
      probabilidad -= 15
    }
    
    if (solicitud.confianza < 0.8) {
      factoresRiesgo.push('Datos extraídos con baja confianza')
      probabilidad -= 10
    }
    
    if (solicitud.licencia.tipo === 'Licencia General') {
      factoresRiesgo.push('Tipo de licencia no específico')
      probabilidad -= 20
    }
    
    // Factores positivos
    if (solicitud.empleado.jerarquia === 'MAGISTRADO') {
      probabilidad += 10
    }
    
    if (solicitud.licencia.motivo !== 'No especificado') {
      probabilidad += 5
    }
    
    probabilidad = Math.max(10, Math.min(95, probabilidad))
    
    const recomendaciones: string[] = []
    if (factoresRiesgo.length > 0) {
      recomendaciones.push('Revisar documentación adicional')
    }
    if (solicitud.licencia.dias > 10) {
      recomendaciones.push('Verificar disponibilidad de días de licencia')
    }
    
    return {
      probabilidadAprobacion: probabilidad,
      factoresRiesgo,
      recomendaciones,
      tiempoEstimadoResolucion: this.calcularTiempoResolucion(solicitud),
      precedentesEncontrados: Math.floor(Math.random() * 10) + 1
    }
  }
  
  /**
   * Consulta con Genkit
   */
  private static async consultarConGenkit(
    consulta: string, 
    contexto?: any
  ): Promise<RespuestaAsistente | null> {
    try {
      const response = await fetch(`${this.GENKIT_BASE}/flows/assistantQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: consulta,
          context: contexto
        })
      })
      
      if (!response.ok) {
        throw new Error(`Genkit error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error con consulta Genkit:', error)
      return null
    }
  }
  
  /**
   * Consulta con fallback
   */
  private static consultarConFallback(
    consulta: string, 
    contexto?: any
  ): RespuestaAsistente {
    const consultaLower = consulta.toLowerCase()
    
    // Respuestas predefinidas
    if (consultaLower.includes('como solicitar') || consultaLower.includes('cómo solicitar')) {
      return {
        respuesta: 'Para solicitar una licencia, envía un email a licencias@mpd.mendoza.gov.ar con los siguientes datos: tipo de licencia, fechas de inicio y fin, motivo, y cualquier documentación de respaldo.',
        accionesSugeridas: [
          'Ver formulario de solicitud',
          'Consultar días disponibles',
          'Revisar normativa'
        ],
        documentosRelacionados: [
          'Reglamento de Licencias',
          'Formulario de Solicitud'
        ],
        confianza: 0.9
      }
    }
    
    if (consultaLower.includes('días disponibles') || consultaLower.includes('saldo')) {
      return {
        respuesta: 'Puedes consultar tus días disponibles en la sección "Mi Perfil" del sistema o contactando a Recursos Humanos.',
        accionesSugeridas: [
          'Ver mi perfil',
          'Contactar RRHH',
          'Historial de licencias'
        ],
        documentosRelacionados: [
          'Resumen de Licencias Personal'
        ],
        confianza: 0.85
      }
    }
    
    if (consultaLower.includes('estado') || consultaLower.includes('seguimiento')) {
      return {
        respuesta: 'Puedes verificar el estado de tu solicitud en la sección "Mis Solicitudes" del dashboard o recibirás una notificación por email cuando haya actualizaciones.',
        accionesSugeridas: [
          'Ver mis solicitudes',
          'Configurar notificaciones',
          'Contactar supervisor'
        ],
        documentosRelacionados: [
          'Guía de Seguimiento'
        ],
        confianza: 0.8
      }
    }
    
    // Respuesta genérica
    return {
      respuesta: 'Lo siento, no tengo información específica sobre esa consulta. Te recomiendo contactar a Recursos Humanos o revisar la documentación del sistema.',
      accionesSugeridas: [
        'Contactar RRHH',
        'Ver documentación',
        'Reformular consulta'
      ],
      documentosRelacionados: [
        'Manual del Usuario',
        'FAQ del Sistema'
      ],
      confianza: 0.3
    }
  }
  
  // Métodos auxiliares
  private static parsearFecha(fechaStr: string): Date | null {
    try {
      const [dia, mes, año] = fechaStr.split('/')
      return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia))
    } catch {
      return null
    }
  }
  
  private static formatearNombre(username: string): string {
    return username
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
  }
  
  private static determinarArea(email: string): string {
    if (email.includes('defensoria')) return 'Defensoría'
    if (email.includes('civil')) return 'Defensoría Civil'
    if (email.includes('penal')) return 'Defensoría Penal'
    if (email.includes('rrhh')) return 'Recursos Humanos'
    return 'Administración'
  }
  
  private static determinarJerarquia(email: string): 'MAGISTRADO' | 'FUNCIONARIO' | 'EMPLEADO' {
    if (email.includes('magistrado') || email.includes('defensor')) return 'MAGISTRADO'
    if (email.includes('funcionario') || email.includes('secretario')) return 'FUNCIONARIO'
    return 'EMPLEADO'
  }
  
  private static extraerObservaciones(contenido: string): string | undefined {
    const obsMatch = contenido.match(/observacion(?:es)?[:\s]+([^.\n]+)/i)
    return obsMatch ? obsMatch[1].trim() : undefined
  }
  
  private static calcularConfianza(
    fechaInicio: Date | null, 
    fechaFin: Date | null, 
    tipo: string
  ): number {
    let confianza = 0.5
    
    if (fechaInicio && fechaFin) confianza += 0.3
    if (tipo !== 'Licencia General') confianza += 0.2
    
    return Math.min(1, confianza)
  }
  
  private static calcularTiempoResolucion(solicitud: DatosExtraidos): number {
    let dias = 3 // Base
    
    if (solicitud.empleado.jerarquia === 'MAGISTRADO') dias -= 1
    if (solicitud.licencia.dias > 15) dias += 2
    if (solicitud.requiereRevision) dias += 1
    
    return Math.max(1, dias)
  }
}
