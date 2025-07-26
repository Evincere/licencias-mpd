/**
 * Servicio de monitoreo de WhatsApp Business API
 */

export interface EstadoWhatsApp {
  conectado: boolean
  ultimaActividad: Date
  numeroTelefono: string
  estadoAPI: 'activo' | 'inactivo' | 'error' | 'mantenimiento'
  limitesAPI: {
    mensajesPorMinuto: number
    mensajesUsados: number
    resetTime: Date
  }
}

export interface MensajeWhatsApp {
  id: string
  timestamp: Date
  tipo: 'enviado' | 'recibido'
  de: string
  para: string
  contenido: string
  estado: 'entregado' | 'leido' | 'pendiente' | 'error'
  tipoMensaje: 'texto' | 'imagen' | 'documento' | 'audio'
  relacionadoConLicencia: boolean
  empleadoId?: string
}

export interface ConversacionWhatsApp {
  id: string
  empleado: {
    nombre: string
    telefono: string
    area: string
  }
  ultimoMensaje: Date
  totalMensajes: number
  estado: 'activa' | 'completada' | 'abandonada'
  tipoConsulta: 'licencia' | 'consulta' | 'soporte' | 'otro'
  satisfaccion?: number
  tiempoRespuesta: number // en minutos
}

export interface MetricasWhatsApp {
  mensajesHoy: number
  conversacionesActivas: number
  tasaRespuesta: number
  tiempoPromedioRespuesta: number
  satisfaccionPromedio: number
  mensajesPorHora: { hora: string, cantidad: number }[]
  tiposConsulta: { tipo: string, cantidad: number, porcentaje: number }[]
  estadisticasPorEmpleado: {
    empleado: string
    mensajes: number
    conversaciones: number
    satisfaccion: number
  }[]
}

export interface AlertaWhatsApp {
  id: string
  tipo: 'error_api' | 'limite_alcanzado' | 'tiempo_respuesta_alto' | 'conexion_perdida'
  mensaje: string
  timestamp: Date
  severidad: 'baja' | 'media' | 'alta' | 'critica'
  resuelto: boolean
}

/**
 * Servicio principal de monitoreo de WhatsApp
 */
export class WhatsAppMonitoringService {
  
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  /**
   * Obtener estado actual de WhatsApp
   */
  static async obtenerEstado(): Promise<EstadoWhatsApp> {
    try {
      const response = await fetch(`${this.API_BASE}/whatsapp/status`)
      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo estado WhatsApp:', error)
      // Fallback con datos simulados
      return this.obtenerEstadoSimulado()
    }
  }
  
  /**
   * Obtener métricas de WhatsApp
   */
  static async obtenerMetricas(): Promise<MetricasWhatsApp> {
    try {
      const response = await fetch(`${this.API_BASE}/whatsapp/metrics`)
      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo métricas WhatsApp:', error)
      return this.obtenerMetricasSimuladas()
    }
  }
  
  /**
   * Obtener mensajes recientes
   */
  static async obtenerMensajes(limite: number = 50): Promise<MensajeWhatsApp[]> {
    try {
      const response = await fetch(`${this.API_BASE}/whatsapp/messages?limit=${limite}`)
      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo mensajes WhatsApp:', error)
      return this.obtenerMensajesSimulados()
    }
  }
  
  /**
   * Obtener conversaciones activas
   */
  static async obtenerConversaciones(): Promise<ConversacionWhatsApp[]> {
    try {
      const response = await fetch(`${this.API_BASE}/whatsapp/conversations`)
      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo conversaciones WhatsApp:', error)
      return this.obtenerConversacionesSimuladas()
    }
  }
  
  /**
   * Obtener alertas activas
   */
  static async obtenerAlertas(): Promise<AlertaWhatsApp[]> {
    try {
      const response = await fetch(`${this.API_BASE}/whatsapp/alerts`)
      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo alertas WhatsApp:', error)
      return this.obtenerAlertasSimuladas()
    }
  }
  
  /**
   * Resolver alerta
   */
  static async resolverAlerta(alertaId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/whatsapp/alerts/${alertaId}/resolve`, {
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`)
      }
    } catch (error) {
      console.error('Error resolviendo alerta WhatsApp:', error)
    }
  }
  
  // Métodos de datos simulados para desarrollo
  private static obtenerEstadoSimulado(): EstadoWhatsApp {
    return {
      conectado: true,
      ultimaActividad: new Date(Date.now() - 2 * 60 * 1000), // 2 minutos atrás
      numeroTelefono: '+54 261 123-4567',
      estadoAPI: 'activo',
      limitesAPI: {
        mensajesPorMinuto: 100,
        mensajesUsados: 23,
        resetTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutos
      }
    }
  }
  
  private static obtenerMetricasSimuladas(): MetricasWhatsApp {
    return {
      mensajesHoy: 147,
      conversacionesActivas: 8,
      tasaRespuesta: 94.2,
      tiempoPromedioRespuesta: 3.5,
      satisfaccionPromedio: 4.6,
      mensajesPorHora: [
        { hora: '08:00', cantidad: 12 },
        { hora: '09:00', cantidad: 18 },
        { hora: '10:00', cantidad: 25 },
        { hora: '11:00', cantidad: 22 },
        { hora: '12:00', cantidad: 15 },
        { hora: '13:00', cantidad: 8 },
        { hora: '14:00', cantidad: 19 },
        { hora: '15:00', cantidad: 28 }
      ],
      tiposConsulta: [
        { tipo: 'Licencias', cantidad: 89, porcentaje: 60.5 },
        { tipo: 'Consultas Generales', cantidad: 35, porcentaje: 23.8 },
        { tipo: 'Soporte Técnico', cantidad: 15, porcentaje: 10.2 },
        { tipo: 'Otros', cantidad: 8, porcentaje: 5.5 }
      ],
      estadisticasPorEmpleado: [
        { empleado: 'María García', mensajes: 23, conversaciones: 5, satisfaccion: 4.8 },
        { empleado: 'Carlos López', mensajes: 18, conversaciones: 3, satisfaccion: 4.5 },
        { empleado: 'Ana Rodríguez', mensajes: 15, conversaciones: 4, satisfaccion: 4.7 }
      ]
    }
  }
  
  private static obtenerMensajesSimulados(): MensajeWhatsApp[] {
    return [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        tipo: 'recibido',
        de: '+54 261 987-6543',
        para: '+54 261 123-4567',
        contenido: 'Hola, necesito solicitar una licencia por enfermedad',
        estado: 'leido',
        tipoMensaje: 'texto',
        relacionadoConLicencia: true,
        empleadoId: 'emp_001'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3 * 60 * 1000),
        tipo: 'enviado',
        de: '+54 261 123-4567',
        para: '+54 261 987-6543',
        contenido: 'Hola María, por favor envíame el certificado médico para procesar tu solicitud.',
        estado: 'entregado',
        tipoMensaje: 'texto',
        relacionadoConLicencia: true,
        empleadoId: 'emp_001'
      }
    ]
  }
  
  private static obtenerConversacionesSimuladas(): ConversacionWhatsApp[] {
    return [
      {
        id: '1',
        empleado: {
          nombre: 'María García',
          telefono: '+54 261 987-6543',
          area: 'Defensoría Civil'
        },
        ultimoMensaje: new Date(Date.now() - 3 * 60 * 1000),
        totalMensajes: 8,
        estado: 'activa',
        tipoConsulta: 'licencia',
        satisfaccion: 5,
        tiempoRespuesta: 2.5
      },
      {
        id: '2',
        empleado: {
          nombre: 'Carlos López',
          telefono: '+54 261 876-5432',
          area: 'Defensoría Penal'
        },
        ultimoMensaje: new Date(Date.now() - 15 * 60 * 1000),
        totalMensajes: 5,
        estado: 'completada',
        tipoConsulta: 'consulta',
        satisfaccion: 4,
        tiempoRespuesta: 5.2
      }
    ]
  }
  
  private static obtenerAlertasSimuladas(): AlertaWhatsApp[] {
    return [
      {
        id: '1',
        tipo: 'tiempo_respuesta_alto',
        mensaje: 'Tiempo de respuesta promedio superior a 5 minutos en la última hora',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        severidad: 'media',
        resuelto: false
      },
      {
        id: '2',
        tipo: 'limite_alcanzado',
        mensaje: 'Se alcanzó el 80% del límite de mensajes por minuto',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        severidad: 'alta',
        resuelto: false
      }
    ]
  }
}
