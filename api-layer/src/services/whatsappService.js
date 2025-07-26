/**
 * Servicio para integración con WhatsApp Business API
 */

import { logger } from '../utils/logger.js'
import { query } from '../config/database.js'

/**
 * Servicio principal de WhatsApp
 */
export class WhatsAppService {
  constructor() {
    this.token = process.env.WHATSAPP_TOKEN
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    this.baseURL = 'https://graph.facebook.com/v18.0'
  }

  /**
   * Enviar mensaje de texto
   */
  async sendMessage(to, message, template = null) {
    try {
      const url = `${this.baseURL}/${this.phoneNumberId}/messages`
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      
      // Guardar mensaje enviado en base de datos
      await this.saveOutgoingMessage(to, message, result.messages[0].id)

      logger.info('Mensaje de WhatsApp enviado exitosamente:', {
        to,
        messageId: result.messages[0].id
      })

      return {
        success: true,
        messageId: result.messages[0].id,
        whatsappId: result.messages[0].wamid
      }
    } catch (error) {
      logger.error('Error enviando mensaje de WhatsApp:', error)
      throw error
    }
  }

  /**
   * Enviar mensaje con template
   */
  async sendTemplate(to, templateName, parameters = []) {
    try {
      const url = `${this.baseURL}/${this.phoneNumberId}/messages`
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'es'
          },
          components: parameters.length > 0 ? [{
            type: 'body',
            parameters: parameters.map(param => ({
              type: 'text',
              text: param
            }))
          }] : []
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      
      // Guardar mensaje enviado
      await this.saveOutgoingMessage(to, `Template: ${templateName}`, result.messages[0].id)

      return {
        success: true,
        messageId: result.messages[0].id,
        whatsappId: result.messages[0].wamid
      }
    } catch (error) {
      logger.error('Error enviando template de WhatsApp:', error)
      throw error
    }
  }

  /**
   * Enviar mensaje interactivo con botones
   */
  async sendInteractiveMessage(to, text, buttons) {
    try {
      const url = `${this.baseURL}/${this.phoneNumberId}/messages`
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: text
          },
          action: {
            buttons: buttons.map((button, index) => ({
              type: 'reply',
              reply: {
                id: `btn_${index}`,
                title: button.title
              }
            }))
          }
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      
      await this.saveOutgoingMessage(to, `Interactive: ${text}`, result.messages[0].id)

      return {
        success: true,
        messageId: result.messages[0].id,
        whatsappId: result.messages[0].wamid
      }
    } catch (error) {
      logger.error('Error enviando mensaje interactivo:', error)
      throw error
    }
  }

  /**
   * Guardar mensaje saliente en base de datos
   */
  async saveOutgoingMessage(to, content, messageId) {
    try {
      await query(`
        INSERT INTO whatsapp.mensajes (
          phone_number, message_id, tipo, contenido, 
          estado, fecha_mensaje
        ) VALUES ($1, $2, 'outgoing', $3, 'sent', NOW())
      `, [to, messageId, content])
    } catch (error) {
      logger.error('Error guardando mensaje saliente:', error)
    }
  }

  /**
   * Verificar estado del webhook
   */
  async verifyWebhook() {
    try {
      // Verificar que las variables de entorno estén configuradas
      if (!this.token || !this.phoneNumberId) {
        throw new Error('Variables de entorno de WhatsApp no configuradas')
      }

      return {
        configured: true,
        phoneNumberId: this.phoneNumberId,
        webhookToken: !!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
      }
    } catch (error) {
      logger.error('Error verificando configuración de WhatsApp:', error)
      return {
        configured: false,
        error: error.message
      }
    }
  }

  /**
   * Obtener información del número de teléfono
   */
  async getPhoneNumberInfo() {
    try {
      const url = `${this.baseURL}/${this.phoneNumberId}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error obteniendo info del número: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      logger.error('Error obteniendo información del número:', error)
      throw error
    }
  }
}

/**
 * Bot conversacional para solicitudes de licencia
 */
export class WhatsAppBot {
  constructor() {
    this.whatsappService = new WhatsAppService()
    this.conversationStates = new Map() // En producción usar Redis
  }

  /**
   * Procesar mensaje entrante
   */
  async processMessage(phoneNumber, message, messageType) {
    try {
      const state = this.getConversationState(phoneNumber)
      
      switch (state.step) {
        case 'initial':
          return await this.handleInitialMessage(phoneNumber, message)
        case 'menu':
          return await this.handleMenuSelection(phoneNumber, message)
        case 'solicitud_tipo':
          return await this.handleTipoLicencia(phoneNumber, message)
        case 'solicitud_fechas':
          return await this.handleFechas(phoneNumber, message)
        case 'solicitud_motivo':
          return await this.handleMotivo(phoneNumber, message)
        default:
          return await this.handleInitialMessage(phoneNumber, message)
      }
    } catch (error) {
      logger.error('Error procesando mensaje del bot:', error)
      await this.whatsappService.sendMessage(
        phoneNumber, 
        'Lo siento, ocurrió un error. Por favor intenta de nuevo o contacta a RRHH.'
      )
    }
  }

  /**
   * Manejar mensaje inicial
   */
  async handleInitialMessage(phoneNumber, message) {
    const buttons = [
      { title: '📝 Solicitar licencia' },
      { title: '📋 Consultar estado' },
      { title: '📞 Contactar RRHH' }
    ]

    await this.whatsappService.sendInteractiveMessage(
      phoneNumber,
      '¡Hola! Soy el asistente virtual del MPD. ¿En qué puedo ayudarte?',
      buttons
    )

    this.setConversationState(phoneNumber, { step: 'menu' })
  }

  /**
   * Obtener estado de conversación
   */
  getConversationState(phoneNumber) {
    return this.conversationStates.get(phoneNumber) || { step: 'initial' }
  }

  /**
   * Establecer estado de conversación
   */
  setConversationState(phoneNumber, state) {
    this.conversationStates.set(phoneNumber, state)
  }

  /**
   * Limpiar estado de conversación
   */
  clearConversationState(phoneNumber) {
    this.conversationStates.delete(phoneNumber)
  }
}

// Instancia singleton del bot
export const whatsappBot = new WhatsAppBot()

export default WhatsAppService
