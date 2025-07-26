/**
 * Rutas de health check y estado del sistema
 */

import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { testConnection } from '../config/database.js'
import { checkGenkitConnectivity } from '../services/genkitService.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * Health check básico
 */
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
}))

/**
 * Health check detallado
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const checks = {}
  let overallHealth = true

  // Check base de datos
  try {
    await testConnection()
    checks.database = {
      status: 'healthy',
      message: 'Conexión a PostgreSQL exitosa'
    }
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      message: error.message
    }
    overallHealth = false
  }

  // Check Genkit
  try {
    const genkitHealth = await checkGenkitConnectivity()
    checks.genkit = {
      status: genkitHealth.healthy ? 'healthy' : 'unhealthy',
      message: genkitHealth.healthy ? 'Genkit disponible' : 'Genkit no disponible',
      details: genkitHealth
    }
  } catch (error) {
    checks.genkit = {
      status: 'unhealthy',
      message: error.message
    }
    overallHealth = false
  }

  // Información del sistema
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  }

  res.status(overallHealth ? 200 : 503).json({
    success: overallHealth,
    message: overallHealth ? 'Todos los servicios funcionando' : 'Algunos servicios no disponibles',
    timestamp: new Date().toISOString(),
    checks,
    system: systemInfo
  })
}))

/**
 * Check específico de base de datos
 */
router.get('/database', asyncHandler(async (req, res) => {
  try {
    await testConnection()
    res.json({
      success: true,
      message: 'Base de datos disponible',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Database health check failed:', error)
    res.status(503).json({
      success: false,
      message: 'Base de datos no disponible',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}))

/**
 * Check específico de Genkit
 */
router.get('/genkit', asyncHandler(async (req, res) => {
  try {
    const health = await checkGenkitConnectivity()
    res.status(health.healthy ? 200 : 503).json({
      success: health.healthy,
      message: health.healthy ? 'Genkit disponible' : 'Genkit no disponible',
      details: health,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Genkit health check failed:', error)
    res.status(503).json({
      success: false,
      message: 'Genkit no disponible',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}))

/**
 * Información de la API
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    api: {
      name: 'Sistema de Licencias MPD - API',
      version: '1.0.0',
      description: 'API REST para gestión de licencias del Ministerio Público de la Defensa',
      environment: process.env.NODE_ENV || 'development'
    },
    endpoints: {
      auth: '/auth',
      empleados: '/api/empleados',
      solicitudes: '/api/solicitudes',
      health: '/health'
    },
    features: [
      'Autenticación JWT',
      'Integración con Genkit Flows',
      'Gestión de empleados',
      'Gestión de solicitudes',
      'WhatsApp Business API (próximamente)'
    ],
    timestamp: new Date().toISOString()
  })
})

export default router
