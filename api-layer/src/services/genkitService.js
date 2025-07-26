/**
 * Servicio para integración con Genkit Flows
 */

import { logger } from '../utils/logger.js'

/**
 * Configuración base para Genkit
 */
const GENKIT_BASE_URL = process.env.GENKIT_BASE_URL || 'http://localhost:3400'

/**
 * Cliente HTTP para comunicación con Genkit
 */
class GenkitClient {
  constructor() {
    this.baseURL = GENKIT_BASE_URL
    this.timeout = 30000 // 30 segundos
  }

  /**
   * Ejecuta un flow de Genkit
   */
  async runFlow(flowName, data = {}, options = {}) {
    try {
      logger.info(`Ejecutando flow de Genkit: ${flowName}`, { data })

      const url = `${this.baseURL}/${flowName}`
      const requestBody = {
        data: data
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(options.timeout || this.timeout)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Flow ${flowName} falló: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      logger.info(`Flow ${flowName} ejecutado exitosamente`, {
        success: result.result?.success,
        duration: result.result?.timestamp
      })

      return result.result || result
    } catch (error) {
      logger.error(`Error ejecutando flow ${flowName}:`, {
        error: error.message,
        data
      })
      throw error
    }
  }

  /**
   * Verifica el estado de Genkit
   */
  async healthCheck() {
    try {
      const result = await this.runFlow('status', {}, { timeout: 5000 })
      return {
        healthy: true,
        ...result
      }
    } catch (error) {
      logger.error('Genkit health check falló:', error.message)
      return {
        healthy: false,
        error: error.message
      }
    }
  }
}

/**
 * Instancia singleton del cliente Genkit
 */
export const genkitClient = new GenkitClient()

/**
 * Servicios específicos para diferentes dominios
 */

/**
 * Servicio para procesamiento de emails
 */
export class EmailProcessingService {
  /**
   * Procesa un email individual
   */
  async processEmail(emailData) {
    return await genkitClient.runFlow('processEmail', emailData)
  }

  /**
   * Procesa múltiples emails
   */
  async processEmailBatch(emailsData) {
    return await genkitClient.runFlow('processEmailBatch', emailsData)
  }

  /**
   * Reintenta el procesamiento de un email
   */
  async retryProcessing(emailId) {
    return await genkitClient.runFlow('retryProcessing', { emailId })
  }

  /**
   * Obtiene el estado del procesamiento
   */
  async getProcessingStatus(emailId) {
    return await genkitClient.runFlow('getProcessingStatus', { emailId })
  }
}

/**
 * Servicio para monitoreo de emails
 */
export class EmailMonitoringService {
  /**
   * Inicia el monitoreo de emails
   */
  async startMonitoring(config = {}) {
    return await genkitClient.runFlow('monitorEmails', {
      action: 'start',
      config
    })
  }

  /**
   * Detiene el monitoreo de emails
   */
  async stopMonitoring() {
    return await genkitClient.runFlow('monitorEmails', {
      action: 'stop'
    })
  }

  /**
   * Obtiene métricas de monitoreo
   */
  async getMonitoringMetrics() {
    return await genkitClient.runFlow('getMonitoringMetrics', {})
  }

  /**
   * Obtiene el estado del monitoreo
   */
  async getMonitoringStatus() {
    return await genkitClient.runFlow('monitorEmails', {
      action: 'status'
    })
  }
}

/**
 * Servicio para configuración de reglas
 */
export class RulesConfigurationService {
  /**
   * Configura reglas de procesamiento
   */
  async configureRules(rules) {
    return await genkitClient.runFlow('configureRules', { rules })
  }

  /**
   * Configura múltiples reglas
   */
  async configureRulesBatch(rulesData) {
    return await genkitClient.runFlow('configureRulesBatch', rulesData)
  }

  /**
   * Valida reglas de configuración
   */
  async validateRules(rules) {
    return await genkitClient.runFlow('validateRules', { rules })
  }
}

/**
 * Instancias de servicios
 */
export const emailProcessingService = new EmailProcessingService()
export const emailMonitoringService = new EmailMonitoringService()
export const rulesConfigurationService = new RulesConfigurationService()

/**
 * Función helper para verificar conectividad con Genkit
 */
export async function checkGenkitConnectivity() {
  try {
    const health = await genkitClient.healthCheck()
    logger.info('Conectividad con Genkit verificada:', health)
    return health
  } catch (error) {
    logger.error('Error de conectividad con Genkit:', error.message)
    throw error
  }
}

export default genkitClient
