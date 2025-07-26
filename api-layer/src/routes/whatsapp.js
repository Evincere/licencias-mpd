/**
 * Rutas para integración con WhatsApp Business API
 */

import express from 'express'
import { z } from 'zod'
import { asyncHandler, validateSchema } from '../middleware/errorHandler.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { query } from '../config/database.js'
import { logger } from '../utils/logger.js'
import { WhatsAppService } from '../services/whatsappService.js'

const router = express.Router()

/**
 * Esquemas de validación
 */
const webhookVerificationSchema = z.object({
  'hub.mode': z.string(),
  'hub.verify_token': z.string(),
  'hub.challenge': z.string()
})

const sendMessageSchema = z.object({
  to: z.string().min(1, 'Número de teléfono requerido'),
  message: z.string().min(1, 'Mensaje requerido'),
  template: z.string().optional()
})

/**
 * GET /whatsapp/webhook
 * Verificación del webhook de WhatsApp
 */
router.get('/webhook', asyncHandler(async (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  // Verificar que el token coincide
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    logger.info('Webhook de WhatsApp verificado exitosamente')
    res.status(200).send(challenge)
  } else {
    logger.warn('Intento de verificación de webhook fallido:', { mode, token })
    res.status(403).json({
      success: false,
      message: 'Token de verificación inválido'
    })
  }
}))

/**
 * POST /whatsapp/webhook
 * Recibir mensajes de WhatsApp
 */
router.post('/webhook', asyncHandler(async (req, res) => {
  const body = req.body

  logger.info('Webhook de WhatsApp recibido:', { body })

  // Verificar que es un mensaje de WhatsApp
  if (body.object === 'whatsapp_business_account') {
    // Procesar cada entrada
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          const value = change.value

          // Procesar mensajes recibidos
          if (value.messages) {
            for (const message of value.messages) {
              await processIncomingMessage(message, value.metadata)
            }
          }

          // Procesar estados de mensajes
          if (value.statuses) {
            for (const status of value.statuses) {
              await processMessageStatus(status)
            }
          }
        }
      }
    }
  }

  res.status(200).json({ success: true })
}))

/**
 * POST /whatsapp/send
 * Enviar mensaje por WhatsApp
 */
router.post('/send', 
  authenticateToken, 
  requireRole('admin', 'supervisor', 'rrhh'), 
  validateSchema(sendMessageSchema), 
  asyncHandler(async (req, res) => {
    const { to, message, template } = req.body

    try {
      const whatsappService = new WhatsAppService()
      const result = await whatsappService.sendMessage(to, message, template)

      logger.info('Mensaje de WhatsApp enviado:', {
        to,
        messageId: result.messageId,
        sentBy: req.user.id
      })

      res.json({
        success: true,
        message: 'Mensaje enviado exitosamente',
        data: result
      })
    } catch (error) {
      logger.error('Error enviando mensaje de WhatsApp:', error)
      res.status(500).json({
        success: false,
        message: 'Error enviando mensaje',
        error: error.message
      })
    }
  })
)

/**
 * GET /whatsapp/conversations
 * Obtener conversaciones activas
 */
router.get('/conversations', 
  authenticateToken, 
  requireRole('admin', 'supervisor', 'rrhh'), 
  asyncHandler(async (req, res) => {
    const conversationsResult = await query(`
      SELECT 
        phone_number,
        empleado_id,
        estado,
        ultimo_mensaje,
        fecha_ultimo_mensaje,
        COUNT(*) as total_mensajes
      FROM whatsapp.conversaciones
      WHERE activa = true
      GROUP BY phone_number, empleado_id, estado, ultimo_mensaje, fecha_ultimo_mensaje
      ORDER BY fecha_ultimo_mensaje DESC
    `)

    res.json({
      success: true,
      data: {
        conversations: conversationsResult.rows
      }
    })
  })
)

/**
 * GET /whatsapp/messages/:phoneNumber
 * Obtener historial de mensajes de un número
 */
router.get('/messages/:phoneNumber', 
  authenticateToken, 
  requireRole('admin', 'supervisor', 'rrhh'), 
  asyncHandler(async (req, res) => {
    const { phoneNumber } = req.params
    const { limit = 50, offset = 0 } = req.query

    const messagesResult = await query(`
      SELECT *
      FROM whatsapp.mensajes
      WHERE phone_number = $1
      ORDER BY fecha_mensaje DESC
      LIMIT $2 OFFSET $3
    `, [phoneNumber, limit, offset])

    res.json({
      success: true,
      data: {
        messages: messagesResult.rows
      }
    })
  })
)

/**
 * POST /whatsapp/templates
 * Gestionar templates de mensajes
 */
router.post('/templates', 
  authenticateToken, 
  requireRole('admin'), 
  asyncHandler(async (req, res) => {
    const { name, content, variables } = req.body

    const templateResult = await query(`
      INSERT INTO whatsapp.templates (name, content, variables, activo, fecha_creacion)
      VALUES ($1, $2, $3, true, NOW())
      RETURNING *
    `, [name, content, JSON.stringify(variables || [])])

    res.status(201).json({
      success: true,
      message: 'Template creado exitosamente',
      data: {
        template: templateResult.rows[0]
      }
    })
  })
)

/**
 * GET /whatsapp/stats
 * Estadísticas de WhatsApp
 */
router.get('/stats', 
  authenticateToken, 
  requireRole('admin', 'supervisor', 'rrhh'), 
  asyncHandler(async (req, res) => {
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT phone_number) as conversaciones_activas,
        COUNT(*) as total_mensajes,
        COUNT(CASE WHEN tipo = 'incoming' THEN 1 END) as mensajes_recibidos,
        COUNT(CASE WHEN tipo = 'outgoing' THEN 1 END) as mensajes_enviados,
        COUNT(CASE WHEN fecha_mensaje >= CURRENT_DATE THEN 1 END) as mensajes_hoy
      FROM whatsapp.mensajes
      WHERE fecha_mensaje >= CURRENT_DATE - INTERVAL '30 days'
    `

    const solicitudesQuery = `
      SELECT 
        COUNT(*) as solicitudes_por_whatsapp,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as solicitudes_completadas
      FROM whatsapp.conversaciones
      WHERE tipo = 'solicitud_licencia'
    `

    const [statsResult, solicitudesResult] = await Promise.all([
      query(statsQuery),
      query(solicitudesQuery)
    ])

    res.json({
      success: true,
      data: {
        mensajes: statsResult.rows[0],
        solicitudes: solicitudesResult.rows[0]
      }
    })
  })
)

/**
 * Procesar mensaje entrante
 */
async function processIncomingMessage(message, metadata) {
  try {
    const phoneNumber = message.from
    const messageText = message.text?.body || ''
    const messageType = message.type

    logger.info('Procesando mensaje entrante:', {
      from: phoneNumber,
      type: messageType,
      text: messageText.substring(0, 100)
    })

    // Guardar mensaje en base de datos
    await query(`
      INSERT INTO whatsapp.mensajes (
        phone_number, message_id, tipo, contenido, 
        metadata, fecha_mensaje
      ) VALUES ($1, $2, 'incoming', $3, $4, NOW())
    `, [
      phoneNumber,
      message.id,
      messageText,
      JSON.stringify({ type: messageType, ...message })
    ])

    // Procesar según el tipo de mensaje
    if (messageType === 'text') {
      await processTextMessage(phoneNumber, messageText, message)
    }

  } catch (error) {
    logger.error('Error procesando mensaje entrante:', error)
  }
}

/**
 * Procesar estado de mensaje
 */
async function processMessageStatus(status) {
  try {
    logger.info('Estado de mensaje actualizado:', status)

    await query(`
      UPDATE whatsapp.mensajes 
      SET estado = $1, fecha_actualizacion = NOW()
      WHERE message_id = $2
    `, [status.status, status.id])

  } catch (error) {
    logger.error('Error procesando estado de mensaje:', error)
  }
}

/**
 * Procesar mensaje de texto
 */
async function processTextMessage(phoneNumber, text, message) {
  try {
    // Aquí iría la lógica del bot conversacional
    // Por ahora, respuesta simple
    const whatsappService = new WhatsAppService()
    
    if (text.toLowerCase().includes('hola') || text.toLowerCase().includes('inicio')) {
      await whatsappService.sendMessage(phoneNumber, 
        '¡Hola! Soy el asistente virtual del MPD. ¿En qué puedo ayudarte?\n\n' +
        '1️⃣ Solicitar licencia\n' +
        '2️⃣ Consultar estado de solicitud\n' +
        '3️⃣ Información sobre tipos de licencia\n' +
        '4️⃣ Hablar con un humano'
      )
    }

  } catch (error) {
    logger.error('Error procesando mensaje de texto:', error)
  }
}

export default router
