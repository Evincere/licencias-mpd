/**
 * Configuración de base de datos PostgreSQL
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

/**
 * Configuración del pool de conexiones PostgreSQL
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'licencias_mpd',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}

/**
 * Pool de conexiones global
 */
export const pool = new Pool(dbConfig)

/**
 * Configurar eventos del pool
 */
pool.on('connect', (client) => {
  logger.info('Nueva conexión establecida con PostgreSQL')
})

pool.on('error', (err, client) => {
  logger.error('Error inesperado en cliente PostgreSQL:', err)
})

/**
 * Función para verificar la conexión
 */
export async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW() as current_time, version() as version')
    client.release()
    
    logger.info('Conexión a PostgreSQL exitosa:', {
      time: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0]
    })
    
    return true
  } catch (error) {
    logger.error('Error al conectar con PostgreSQL:', error.message)
    throw error
  }
}

/**
 * Función para cerrar el pool de conexiones
 */
export async function closePool() {
  try {
    await pool.end()
    logger.info('Pool de conexiones PostgreSQL cerrado')
  } catch (error) {
    logger.error('Error al cerrar pool de conexiones:', error.message)
    throw error
  }
}

/**
 * Función helper para ejecutar queries
 */
export async function query(text, params) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    
    logger.debug('Query ejecutada:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      rows: result.rowCount
    })
    
    return result
  } catch (error) {
    logger.error('Error en query:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      error: error.message
    })
    throw error
  }
}

export default pool
