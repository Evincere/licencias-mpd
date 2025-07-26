/**
 * Configuración de logging con Winston
 */

import winston from 'winston'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Configuración de formatos de logging
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

/**
 * Configuración de formatos para consola
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`
    }
    
    return msg
  })
)

/**
 * Configuración de transports
 */
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat
  })
]

// File transports solo en producción o si se especifica LOG_FILE
if (process.env.NODE_ENV === 'production' || process.env.LOG_FILE) {
  const logDir = path.join(__dirname, '../../logs')
  
  transports.push(
    // Error log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  )
}

/**
 * Logger principal
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
})

/**
 * Función para logging de requests HTTP
 */
export function logRequest(req, res, next) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData)
    } else {
      logger.info('HTTP Request', logData)
    }
  })
  
  next()
}

/**
 * Función para logging de errores
 */
export function logError(error, req = null) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    ...(req && {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    })
  }
  
  logger.error('Application Error', errorData)
}

export default logger
