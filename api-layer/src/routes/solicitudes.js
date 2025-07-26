/**
 * Rutas para gestión de solicitudes de licencia
 */

import express from 'express'
import { z } from 'zod'
import { asyncHandler, validateSchema } from '../middleware/errorHandler.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { query } from '../config/database.js'
import { emailProcessingService } from '../services/genkitService.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * Esquemas de validación
 */
const solicitudSchema = z.object({
  empleadoId: z.number().int().positive('ID de empleado requerido'),
  tipoLicenciaId: z.number().int().positive('Tipo de licencia requerido'),
  fechaInicio: z.string().datetime('Fecha de inicio inválida'),
  fechaFin: z.string().datetime('Fecha de fin inválida'),
  motivo: z.string().min(1, 'Motivo requerido'),
  observaciones: z.string().optional(),
  documentosAdjuntos: z.array(z.string()).optional()
})

const updateSolicitudSchema = z.object({
  estado: z.enum(['pendiente', 'aprobada', 'rechazada', 'en_revision']).optional(),
  observacionesAprobacion: z.string().optional(),
  fechaAprobacion: z.string().datetime().optional(),
  aprobadoPor: z.number().int().optional()
})

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)).optional(),
  empleadoId: z.string().transform(val => parseInt(val)).optional(),
  estado: z.enum(['pendiente', 'aprobada', 'rechazada', 'en_revision']).optional(),
  tipoLicencia: z.string().optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  area: z.string().optional()
})

/**
 * GET /api/solicitudes
 * Obtener lista de solicitudes con filtros
 */
router.get('/', authenticateToken, validateSchema(querySchema, 'query'), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    empleadoId, 
    estado, 
    tipoLicencia, 
    fechaDesde, 
    fechaHasta, 
    area 
  } = req.query

  let whereConditions = []
  let queryParams = []
  let paramIndex = 1

  // Filtro por empleado (solo si no es admin/supervisor)
  if (req.user.rol === 'empleado') {
    // Los empleados solo ven sus propias solicitudes
    const empleadoResult = await query(
      'SELECT id FROM licencias.empleados WHERE email = $1',
      [req.user.email]
    )
    
    if (empleadoResult.rows.length > 0) {
      whereConditions.push(`s.empleado_id = $${paramIndex}`)
      queryParams.push(empleadoResult.rows[0].id)
      paramIndex++
    }
  } else if (empleadoId) {
    whereConditions.push(`s.empleado_id = $${paramIndex}`)
    queryParams.push(empleadoId)
    paramIndex++
  }

  // Filtro por estado
  if (estado) {
    whereConditions.push(`s.estado = $${paramIndex}`)
    queryParams.push(estado)
    paramIndex++
  }

  // Filtro por tipo de licencia
  if (tipoLicencia) {
    whereConditions.push(`LOWER(tl.nombre) LIKE LOWER($${paramIndex})`)
    queryParams.push(`%${tipoLicencia}%`)
    paramIndex++
  }

  // Filtro por rango de fechas
  if (fechaDesde) {
    whereConditions.push(`s.fecha_inicio >= $${paramIndex}`)
    queryParams.push(new Date(fechaDesde))
    paramIndex++
  }

  if (fechaHasta) {
    whereConditions.push(`s.fecha_fin <= $${paramIndex}`)
    queryParams.push(new Date(fechaHasta))
    paramIndex++
  }

  // Filtro por área
  if (area) {
    whereConditions.push(`LOWER(e.area) = LOWER($${paramIndex})`)
    queryParams.push(area)
    paramIndex++
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  // Query para contar total
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM licencias.solicitudes_licencia s
    JOIN licencias.empleados e ON s.empleado_id = e.id
    JOIN licencias.tipos_licencia tl ON s.tipo_licencia_id = tl.id
    ${whereClause}
  `

  // Query principal con paginación
  const offset = (page - 1) * limit
  const mainQuery = `
    SELECT 
      s.id, s.empleado_id, s.tipo_licencia_id, s.fecha_inicio, s.fecha_fin,
      s.motivo, s.observaciones, s.estado, s.fecha_solicitud,
      s.fecha_aprobacion, s.aprobado_por, s.observaciones_aprobacion,
      s.documentos_adjuntos, s.metadata,
      e.legajo, e.nombre as empleado_nombre, e.apellido as empleado_apellido, 
      e.email as empleado_email, e.area as empleado_area,
      tl.nombre as tipo_licencia_nombre, tl.codigo as tipo_licencia_codigo,
      tl.dias_maximos, tl.requiere_documentacion,
      ap.nombre as aprobado_por_nombre, ap.apellido as aprobado_por_apellido
    FROM licencias.solicitudes_licencia s
    JOIN licencias.empleados e ON s.empleado_id = e.id
    JOIN licencias.tipos_licencia tl ON s.tipo_licencia_id = tl.id
    LEFT JOIN auth.usuarios ap ON s.aprobado_por = ap.id
    ${whereClause}
    ORDER BY s.fecha_solicitud DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  queryParams.push(limit, offset)

  // Ejecutar queries
  const [countResult, solicitudesResult] = await Promise.all([
    query(countQuery, queryParams.slice(0, -2)),
    query(mainQuery, queryParams)
  ])

  const total = parseInt(countResult.rows[0].total)
  const totalPages = Math.ceil(total / limit)

  res.json({
    success: true,
    data: {
      solicitudes: solicitudesResult.rows,
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
 * GET /api/solicitudes/:id
 * Obtener solicitud por ID
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params

  const solicitudResult = await query(`
    SELECT 
      s.*,
      e.legajo, e.nombre as empleado_nombre, e.apellido as empleado_apellido, 
      e.email as empleado_email, e.area as empleado_area,
      tl.nombre as tipo_licencia_nombre, tl.codigo as tipo_licencia_codigo,
      tl.dias_maximos, tl.requiere_documentacion,
      ap.nombre as aprobado_por_nombre, ap.apellido as aprobado_por_apellido
    FROM licencias.solicitudes_licencia s
    JOIN licencias.empleados e ON s.empleado_id = e.id
    JOIN licencias.tipos_licencia tl ON s.tipo_licencia_id = tl.id
    LEFT JOIN auth.usuarios ap ON s.aprobado_por = ap.id
    WHERE s.id = $1
  `, [id])

  if (solicitudResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Solicitud no encontrada'
    })
  }

  const solicitud = solicitudResult.rows[0]

  // Verificar permisos: empleados solo pueden ver sus propias solicitudes
  if (req.user.rol === 'empleado') {
    const empleadoResult = await query(
      'SELECT id FROM licencias.empleados WHERE email = $1',
      [req.user.email]
    )
    
    if (empleadoResult.rows.length === 0 || empleadoResult.rows[0].id !== solicitud.empleado_id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta solicitud'
      })
    }
  }

  res.json({
    success: true,
    data: {
      solicitud
    }
  })
}))

/**
 * POST /api/solicitudes
 * Crear nueva solicitud
 */
router.post('/', 
  authenticateToken, 
  validateSchema(solicitudSchema), 
  asyncHandler(async (req, res) => {
    const { 
      empleadoId, 
      tipoLicenciaId, 
      fechaInicio, 
      fechaFin, 
      motivo, 
      observaciones, 
      documentosAdjuntos 
    } = req.body

    // Verificar que el empleado existe
    const empleadoResult = await query(
      'SELECT * FROM licencias.empleados WHERE id = $1 AND activo = true',
      [empleadoId]
    )

    if (empleadoResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Empleado no encontrado o inactivo'
      })
    }

    // Verificar que el tipo de licencia existe
    const tipoLicenciaResult = await query(
      'SELECT * FROM licencias.tipos_licencia WHERE id = $1 AND activo = true',
      [tipoLicenciaId]
    )

    if (tipoLicenciaResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de licencia no encontrado o inactivo'
      })
    }

    // Validar fechas
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (fin <= inicio) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      })
    }

    // Calcular días solicitados
    const diasSolicitados = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1

    // Verificar límite de días si aplica
    const tipoLicencia = tipoLicenciaResult.rows[0]
    if (tipoLicencia.dias_maximos && diasSolicitados > tipoLicencia.dias_maximos) {
      return res.status(400).json({
        success: false,
        message: `El tipo de licencia ${tipoLicencia.nombre} permite máximo ${tipoLicencia.dias_maximos} días`
      })
    }

    // Crear solicitud
    const newSolicitudResult = await query(`
      INSERT INTO licencias.solicitudes_licencia (
        empleado_id, tipo_licencia_id, fecha_inicio, fecha_fin,
        motivo, observaciones, documentos_adjuntos, estado,
        fecha_solicitud, dias_solicitados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', NOW(), $8)
      RETURNING *
    `, [
      empleadoId,
      tipoLicenciaId,
      inicio,
      fin,
      motivo,
      observaciones || null,
      JSON.stringify(documentosAdjuntos || []),
      diasSolicitados
    ])

    const newSolicitud = newSolicitudResult.rows[0]

    logger.info('Solicitud creada:', {
      solicitudId: newSolicitud.id,
      empleadoId,
      tipoLicenciaId,
      createdBy: req.user.id
    })

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: {
        solicitud: newSolicitud
      }
    })
  })
)

/**
 * PATCH /api/solicitudes/:id/estado
 * Cambiar estado de solicitud
 */
router.patch('/:id/estado',
  authenticateToken,
  requireRole('admin', 'supervisor', 'rrhh'),
  validateSchema(updateSolicitudSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { estado, observacionesAprobacion } = req.body

    // Verificar que la solicitud existe
    const solicitudResult = await query(
      'SELECT * FROM licencias.solicitudes_licencia WHERE id = $1',
      [id]
    )

    if (solicitudResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      })
    }

    const solicitud = solicitudResult.rows[0]

    // Validar transición de estado
    const estadosValidos = {
      'pendiente': ['aprobada', 'rechazada', 'en_revision'],
      'en_revision': ['aprobada', 'rechazada', 'pendiente'],
      'aprobada': ['rechazada'], // Solo admin puede cambiar de aprobada a rechazada
      'rechazada': ['pendiente', 'en_revision'] // Permitir reabrir
    }

    if (!estadosValidos[solicitud.estado]?.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de estado ${solicitud.estado} a ${estado}`
      })
    }

    // Actualizar solicitud
    const updateQuery = `
      UPDATE licencias.solicitudes_licencia
      SET estado = $1,
          observaciones_aprobacion = $2,
          fecha_aprobacion = $3,
          aprobado_por = $4,
          fecha_actualizacion = NOW()
      WHERE id = $5
      RETURNING *
    `

    const fechaAprobacion = ['aprobada', 'rechazada'].includes(estado) ? new Date() : null
    const aprobadoPor = ['aprobada', 'rechazada'].includes(estado) ? req.user.id : null

    const updatedSolicitudResult = await query(updateQuery, [
      estado,
      observacionesAprobacion || null,
      fechaAprobacion,
      aprobadoPor,
      id
    ])

    const updatedSolicitud = updatedSolicitudResult.rows[0]

    logger.info('Estado de solicitud actualizado:', {
      solicitudId: id,
      estadoAnterior: solicitud.estado,
      estadoNuevo: estado,
      updatedBy: req.user.id
    })

    res.json({
      success: true,
      message: `Solicitud ${estado} exitosamente`,
      data: {
        solicitud: updatedSolicitud
      }
    })
  })
)

/**
 * GET /api/solicitudes/estadisticas
 * Obtener estadísticas de solicitudes
 */
router.get('/estadisticas',
  authenticateToken,
  requireRole('admin', 'supervisor', 'rrhh'),
  asyncHandler(async (req, res) => {
    const estadisticasQuery = `
      SELECT
        COUNT(*) as total_solicitudes,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as aprobadas,
        COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as rechazadas,
        COUNT(CASE WHEN estado = 'en_revision' THEN 1 END) as en_revision,
        COUNT(CASE WHEN fecha_solicitud >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as ultimo_mes,
        AVG(CASE WHEN fecha_aprobacion IS NOT NULL THEN
          EXTRACT(EPOCH FROM (fecha_aprobacion - fecha_solicitud))/86400
        END) as tiempo_promedio_aprobacion_dias
      FROM licencias.solicitudes_licencia
    `

    const tiposQuery = `
      SELECT
        tl.nombre as tipo_licencia,
        COUNT(*) as cantidad,
        COUNT(CASE WHEN s.estado = 'aprobada' THEN 1 END) as aprobadas
      FROM licencias.solicitudes_licencia s
      JOIN licencias.tipos_licencia tl ON s.tipo_licencia_id = tl.id
      GROUP BY tl.id, tl.nombre
      ORDER BY cantidad DESC
    `

    const areasQuery = `
      SELECT
        e.area,
        COUNT(*) as cantidad,
        COUNT(CASE WHEN s.estado = 'pendiente' THEN 1 END) as pendientes
      FROM licencias.solicitudes_licencia s
      JOIN licencias.empleados e ON s.empleado_id = e.id
      GROUP BY e.area
      ORDER BY cantidad DESC
    `

    const [estadisticasResult, tiposResult, areasResult] = await Promise.all([
      query(estadisticasQuery),
      query(tiposQuery),
      query(areasQuery)
    ])

    res.json({
      success: true,
      data: {
        resumen: estadisticasResult.rows[0],
        porTipo: tiposResult.rows,
        porArea: areasResult.rows
      }
    })
  })
)

export default router
