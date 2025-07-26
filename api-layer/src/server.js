/**
 * Servidor principal de la API REST
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { logger, logRequest } from './utils/logger.js'
import { testConnection } from './config/database.js'
import { checkGenkitConnectivity } from './services/genkitService.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

// Importar rutas
import authRoutes from './routes/auth.js'
import empleadosRoutes from './routes/empleados.js'
import solicitudesRoutes from './routes/solicitudes.js'
import whatsappRoutes from './routes/whatsapp.js'
import healthRoutes from './routes/health.js'

// Cargar variables de entorno
dotenv.config()

/**
 * Configuración de la aplicación Express
 */
const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * Configuración de rate limiting
 */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de requests por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Configuración de CORS
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001'
    ]
    
    // Permitir requests sin origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

/**
 * Middleware global
 */
app.use(helmet()) // Seguridad básica
app.use(compression()) // Compresión de respuestas
app.use(cors(corsOptions)) // CORS
app.use(express.json({ limit: '10mb' })) // Parser JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })) // Parser URL encoded
app.use(logRequest) // Logging de requests

// Rate limiting solo en producción
if (NODE_ENV === 'production') {
  app.use(limiter)
}

// Morgan para logging HTTP en desarrollo
if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

/**
 * Rutas principales
 */
app.use('/health', healthRoutes)
app.use('/auth', authRoutes)
app.use('/api/empleados', empleadosRoutes)
app.use('/api/solicitudes', solicitudesRoutes)
app.use('/whatsapp', whatsappRoutes)

/**
 * Ruta raíz
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Sistema de Licencias MPD',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

/**
 * Middleware de manejo de errores
 */
app.use(notFoundHandler)
app.use(errorHandler)

/**
 * Función para inicializar el servidor
 */
async function startServer() {
  try {
    logger.info('Iniciando servidor API...')

    // Verificar conexión a base de datos
    try {
      await testConnection()
      logger.info('✅ Conexión a PostgreSQL establecida')
    } catch (error) {
      logger.warn('⚠️ PostgreSQL no disponible:', error.message)
    }

    // Verificar conectividad con Genkit
    try {
      await checkGenkitConnectivity()
      logger.info('✅ Conectividad con Genkit verificada')
    } catch (error) {
      logger.warn('⚠️ Genkit no disponible, algunas funcionalidades pueden estar limitadas')
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor API iniciado en puerto ${PORT}`)
      logger.info(`📍 Entorno: ${NODE_ENV}`)
      logger.info(`🌐 URL: http://localhost:${PORT}`)
    })

    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      logger.info('SIGTERM recibido, cerrando servidor...')
      server.close(() => {
        logger.info('Servidor cerrado')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT recibido, cerrando servidor...')
      server.close(() => {
        logger.info('Servidor cerrado')
        process.exit(0)
      })
    })

    return server
  } catch (error) {
    logger.error('Error al iniciar servidor:', error)
    process.exit(1)
  }
}

/**
 * Iniciar servidor
 */
startServer()

export default app
