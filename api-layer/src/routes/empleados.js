/**
 * Rutas para gestión de empleados
 */

import express from 'express'
import { z } from 'zod'
import { asyncHandler, validateSchema } from '../middleware/errorHandler.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { query } from '../config/database.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * Esquemas de validación
 */
const empleadoSchema = z.object({
  legajo: z.string().min(1, 'Legajo requerido'),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  area: z.string().min(1, 'Área requerida'),
  jerarquia: z.string().optional(),
  fechaIngreso: z.string().datetime().optional(),
  metadata: z.object({}).optional()
})

const updateEmpleadoSchema = empleadoSchema.partial()

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)).optional(),
  search: z.string().optional(),
  area: z.string().optional(),
  activo: z.string().transform(val => val === 'true').optional()
})

/**
 * GET /api/empleados
 * Obtener lista de empleados con filtros
 */
router.get('/', authenticateToken, validateSchema(querySchema, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, area, activo } = req.query

  let whereConditions = []
  let queryParams = []
  let paramIndex = 1

  // Filtro por búsqueda (nombre, apellido, email, legajo)
  if (search) {
    whereConditions.push(`(
      LOWER(nombre) LIKE LOWER($${paramIndex}) OR 
      LOWER(apellido) LIKE LOWER($${paramIndex}) OR 
      LOWER(email) LIKE LOWER($${paramIndex}) OR 
      legajo LIKE $${paramIndex}
    )`)
    queryParams.push(`%${search}%`)
    paramIndex++
  }

  // Filtro por área
  if (area) {
    whereConditions.push(`LOWER(area) = LOWER($${paramIndex})`)
    queryParams.push(area)
    paramIndex++
  }

  // Filtro por estado activo
  if (activo !== undefined) {
    whereConditions.push(`activo = $${paramIndex}`)
    queryParams.push(activo)
    paramIndex++
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  // Query para contar total
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM licencias.empleados 
    ${whereClause}
  `

  // Query principal con paginación
  const offset = (page - 1) * limit
  const mainQuery = `
    SELECT 
      id, legajo, nombre, apellido, email, area, jerarquia,
      fecha_ingreso, activo, fecha_creacion, fecha_actualizacion,
      metadata
    FROM licencias.empleados 
    ${whereClause}
    ORDER BY apellido, nombre
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  queryParams.push(limit, offset)

  // Ejecutar queries
  const [countResult, empleadosResult] = await Promise.all([
    query(countQuery, queryParams.slice(0, -2)),
    query(mainQuery, queryParams)
  ])

  const total = parseInt(countResult.rows[0].total)
  const totalPages = Math.ceil(total / limit)

  res.json({
    success: true,
    data: {
      empleados: empleadosResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  })
}))

/**
 * GET /api/empleados/:id
 * Obtener empleado por ID
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params

  const empleadoResult = await query(
    'SELECT * FROM licencias.empleados WHERE id = $1',
    [id]
  )

  if (empleadoResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Empleado no encontrado'
    })
  }

  res.json({
    success: true,
    data: {
      empleado: empleadoResult.rows[0]
    }
  })
}))

/**
 * POST /api/empleados
 * Crear nuevo empleado
 */
router.post('/', 
  authenticateToken, 
  requireRole('admin', 'rrhh'), 
  validateSchema(empleadoSchema), 
  asyncHandler(async (req, res) => {
    const { legajo, nombre, apellido, email, area, jerarquia, fechaIngreso, metadata } = req.body

    // Verificar que el legajo no exista
    const existingLegajo = await query(
      'SELECT id FROM licencias.empleados WHERE legajo = $1',
      [legajo]
    )

    if (existingLegajo.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El legajo ya existe'
      })
    }

    // Verificar que el email no exista
    const existingEmail = await query(
      'SELECT id FROM licencias.empleados WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya existe'
      })
    }

    // Crear empleado
    const newEmpleadoResult = await query(
      `INSERT INTO licencias.empleados (
        legajo, nombre, apellido, email, area, jerarquia, 
        fecha_ingreso, metadata, activo, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())
      RETURNING *`,
      [
        legajo,
        nombre,
        apellido,
        email.toLowerCase(),
        area,
        jerarquia || null,
        fechaIngreso ? new Date(fechaIngreso) : new Date(),
        JSON.stringify(metadata || {})
      ]
    )

    const newEmpleado = newEmpleadoResult.rows[0]

    logger.info('Empleado creado:', {
      empleadoId: newEmpleado.id,
      legajo: newEmpleado.legajo,
      createdBy: req.user.id
    })

    res.status(201).json({
      success: true,
      message: 'Empleado creado exitosamente',
      data: {
        empleado: newEmpleado
      }
    })
  })
)

/**
 * PUT /api/empleados/:id
 * Actualizar empleado
 */
router.put('/:id', 
  authenticateToken, 
  requireRole('admin', 'rrhh'), 
  validateSchema(updateEmpleadoSchema), 
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const updates = req.body

    // Verificar que el empleado existe
    const existingEmpleado = await query(
      'SELECT * FROM licencias.empleados WHERE id = $1',
      [id]
    )

    if (existingEmpleado.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      })
    }

    // Construir query de actualización dinámicamente
    const updateFields = []
    const updateValues = []
    let paramIndex = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'email') {
          updateFields.push(`${key} = $${paramIndex}`)
          updateValues.push(value.toLowerCase())
        } else if (key === 'metadata') {
          updateFields.push(`${key} = $${paramIndex}`)
          updateValues.push(JSON.stringify(value))
        } else if (key === 'fechaIngreso') {
          updateFields.push(`fecha_ingreso = $${paramIndex}`)
          updateValues.push(new Date(value))
        } else {
          updateFields.push(`${key} = $${paramIndex}`)
          updateValues.push(value)
        }
        paramIndex++
      }
    })

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      })
    }

    updateFields.push(`fecha_actualizacion = NOW()`)
    updateValues.push(id)

    const updateQuery = `
      UPDATE licencias.empleados 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const updatedEmpleadoResult = await query(updateQuery, updateValues)
    const updatedEmpleado = updatedEmpleadoResult.rows[0]

    logger.info('Empleado actualizado:', {
      empleadoId: id,
      updatedBy: req.user.id,
      fields: Object.keys(updates)
    })

    res.json({
      success: true,
      message: 'Empleado actualizado exitosamente',
      data: {
        empleado: updatedEmpleado
      }
    })
  })
)

/**
 * DELETE /api/empleados/:id
 * Eliminar empleado (soft delete)
 */
router.delete('/:id', 
  authenticateToken, 
  requireRole('admin'), 
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const result = await query(
      'UPDATE licencias.empleados SET activo = false, fecha_actualizacion = NOW() WHERE id = $1 RETURNING id, legajo',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      })
    }

    logger.info('Empleado desactivado:', {
      empleadoId: id,
      legajo: result.rows[0].legajo,
      deletedBy: req.user.id
    })

    res.json({
      success: true,
      message: 'Empleado desactivado exitosamente'
    })
  })
)

export default router
