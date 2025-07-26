/**
 * Middleware de manejo de errores global
 */

import { logger, logError } from '../utils/logger.js'

/**
 * Tipos de errores personalizados
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400)
    this.details = details
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403)
  }
}

/**
 * Middleware para manejar errores de validación de Zod
 */
export function handleZodError(error) {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }))

  return new ValidationError('Errores de validación', errors)
}

/**
 * Middleware para manejar errores de base de datos
 */
export function handleDatabaseError(error) {
  // Error de violación de constraint único
  if (error.code === '23505') {
    const field = error.detail?.match(/Key \((.+)\)=/)?.[1] || 'campo'
    return new ValidationError(`El ${field} ya existe`)
  }

  // Error de violación de foreign key
  if (error.code === '23503') {
    return new ValidationError('Referencia inválida a recurso relacionado')
  }

  // Error de violación de not null
  if (error.code === '23502') {
    const field = error.column || 'campo requerido'
    return new ValidationError(`El campo ${field} es requerido`)
  }

  // Error de conexión
  if (error.code === 'ECONNREFUSED') {
    return new AppError('Error de conexión a la base de datos', 503)
  }

  // Error genérico de base de datos
  return new AppError('Error en la base de datos', 500)
}

/**
 * Middleware principal de manejo de errores
 */
export function errorHandler(error, req, res, next) {
  let err = error

  // Log del error
  logError(err, req)

  // Manejar errores de Zod
  if (err.name === 'ZodError') {
    err = handleZodError(err)
  }

  // Manejar errores de base de datos
  if (err.code && err.code.startsWith('23')) {
    err = handleDatabaseError(err)
  }

  // Manejar errores de JWT
  if (err.name === 'JsonWebTokenError') {
    err = new UnauthorizedError('Token inválido')
  }

  if (err.name === 'TokenExpiredError') {
    err = new UnauthorizedError('Token expirado')
  }

  // Manejar errores de sintaxis JSON
  if (err.type === 'entity.parse.failed') {
    err = new ValidationError('JSON inválido en el cuerpo de la petición')
  }

  // Respuesta de error
  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Error interno del servidor'

  const errorResponse = {
    success: false,
    message,
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  }

  res.status(statusCode).json(errorResponse)
}

/**
 * Middleware para manejar rutas no encontradas
 */
export function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Ruta ${req.originalUrl}`)
  next(error)
}

/**
 * Wrapper para funciones async que maneja errores automáticamente
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Middleware para validar esquemas con Zod
 */
export function validateSchema(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = req[source]
      const validatedData = schema.parse(data)
      req[source] = validatedData
      next()
    } catch (error) {
      next(error)
    }
  }
}
