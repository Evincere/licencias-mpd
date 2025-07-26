/**
 * Middleware de autenticación JWT
 */

import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger.js'
import { query } from '../config/database.js'

/**
 * Middleware para verificar JWT token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      logger.warn('Token JWT inválido:', { error: err.message, token: token.substring(0, 20) + '...' })
      return res.status(403).json({
        success: false,
        message: 'Token inválido o expirado'
      })
    }

    try {
      // Verificar que el usuario existe y está activo
      const userResult = await query(
        'SELECT id, email, nombre, apellido, rol, activo FROM auth.usuarios WHERE id = $1 AND activo = true',
        [decoded.userId]
      )

      if (userResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Usuario no encontrado o inactivo'
        })
      }

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        rol: decoded.rol,
        ...userResult.rows[0]
      }

      next()
    } catch (error) {
      logger.error('Error al verificar usuario en token:', error)
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  })
}

/**
 * Middleware para verificar roles específicos
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      })
    }

    if (!allowedRoles.includes(req.user.rol)) {
      logger.warn('Acceso denegado por rol:', {
        userId: req.user.id,
        userRole: req.user.rol,
        requiredRoles: allowedRoles,
        endpoint: req.originalUrl
      })

      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      })
    }

    next()
  }
}

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      req.user = null
      return next()
    }

    try {
      const userResult = await query(
        'SELECT id, email, nombre, apellido, rol, activo FROM auth.usuarios WHERE id = $1 AND activo = true',
        [decoded.userId]
      )

      req.user = userResult.rows.length > 0 ? {
        id: decoded.userId,
        email: decoded.email,
        rol: decoded.rol,
        ...userResult.rows[0]
      } : null

      next()
    } catch (error) {
      logger.error('Error en autenticación opcional:', error)
      req.user = null
      next()
    }
  })
}

/**
 * Generar JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  })
}

/**
 * Generar refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  })
}

/**
 * Verificar refresh token
 */
export function verifyRefreshToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}
