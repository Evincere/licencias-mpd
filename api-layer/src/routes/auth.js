/**
 * Rutas de autenticación
 */

import express from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { asyncHandler, validateSchema } from '../middleware/errorHandler.js'
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authenticateToken 
} from '../middleware/auth.js'
import { query } from '../config/database.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * Esquemas de validación
 */
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
})

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  rol: z.enum(['admin', 'supervisor', 'empleado', 'rrhh']).default('empleado')
})

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido')
})

/**
 * POST /auth/login
 * Autenticación de usuario
 */
router.post('/login', validateSchema(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Buscar usuario por email
  const userResult = await query(
    'SELECT id, email, password, nombre, apellido, rol, activo FROM auth.usuarios WHERE email = $1',
    [email.toLowerCase()]
  )

  if (userResult.rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    })
  }

  const user = userResult.rows[0]

  // Verificar si el usuario está activo
  if (!user.activo) {
    return res.status(401).json({
      success: false,
      message: 'Usuario inactivo'
    })
  }

  // Verificar contraseña
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    })
  }

  // Generar tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    rol: user.rol
  }

  const accessToken = generateToken(tokenPayload)
  const refreshToken = generateRefreshToken(tokenPayload)

  // Guardar refresh token en base de datos
  await query(
    'UPDATE auth.usuarios SET refresh_token = $1, ultimo_acceso = NOW() WHERE id = $2',
    [refreshToken, user.id]
  )

  logger.info('Usuario autenticado exitosamente:', {
    userId: user.id,
    email: user.email,
    rol: user.rol
  })

  res.json({
    success: true,
    message: 'Autenticación exitosa',
    data: {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      },
      accessToken,
      refreshToken
    }
  })
}))

/**
 * POST /auth/register
 * Registro de nuevo usuario
 */
router.post('/register', validateSchema(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, nombre, apellido, rol } = req.body

  // Verificar si el email ya existe
  const existingUser = await query(
    'SELECT id FROM auth.usuarios WHERE email = $1',
    [email.toLowerCase()]
  )

  if (existingUser.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'El email ya está registrado'
    })
  }

  // Hash de la contraseña
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Crear usuario
  const newUserResult = await query(
    `INSERT INTO auth.usuarios (email, password, nombre, apellido, rol, activo, fecha_creacion)
     VALUES ($1, $2, $3, $4, $5, true, NOW())
     RETURNING id, email, nombre, apellido, rol`,
    [email.toLowerCase(), hashedPassword, nombre, apellido, rol]
  )

  const newUser = newUserResult.rows[0]

  logger.info('Usuario registrado exitosamente:', {
    userId: newUser.id,
    email: newUser.email,
    rol: newUser.rol
  })

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        rol: newUser.rol
      }
    }
  })
}))

/**
 * POST /auth/refresh
 * Renovar access token usando refresh token
 */
router.post('/refresh', validateSchema(refreshTokenSchema), asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  try {
    // Verificar refresh token
    const decoded = await verifyRefreshToken(refreshToken)

    // Verificar que el refresh token existe en la base de datos
    const userResult = await query(
      'SELECT id, email, nombre, apellido, rol, activo FROM auth.usuarios WHERE id = $1 AND refresh_token = $2',
      [decoded.userId, refreshToken]
    )

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      })
    }

    const user = userResult.rows[0]

    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      })
    }

    // Generar nuevo access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      rol: user.rol
    }

    const newAccessToken = generateToken(tokenPayload)

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        accessToken: newAccessToken
      }
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token inválido o expirado'
    })
  }
}))

/**
 * POST /auth/logout
 * Cerrar sesión
 */
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Invalidar refresh token
  await query(
    'UPDATE auth.usuarios SET refresh_token = NULL WHERE id = $1',
    [req.user.id]
  )

  logger.info('Usuario cerró sesión:', {
    userId: req.user.id,
    email: req.user.email
  })

  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  })
}))

/**
 * GET /auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const userResult = await query(
    'SELECT id, email, nombre, apellido, rol, fecha_creacion, ultimo_acceso FROM auth.usuarios WHERE id = $1',
    [req.user.id]
  )

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    })
  }

  const user = userResult.rows[0]

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        fechaCreacion: user.fecha_creacion,
        ultimoAcceso: user.ultimo_acceso
      }
    }
  })
}))

export default router
