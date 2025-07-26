/**
 * Script para ejecutar migraciones de base de datos
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { pool, query } from '../src/config/database.js'
import { logger } from '../src/utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar variables de entorno
dotenv.config()

/**
 * Crear tabla de migraciones si no existe
 */
async function createMigrationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  await query(createTableQuery)
  logger.info('Tabla de migraciones verificada')
}

/**
 * Obtener migraciones ya ejecutadas
 */
async function getExecutedMigrations() {
  const result = await query('SELECT filename FROM migrations ORDER BY id')
  return result.rows.map(row => row.filename)
}

/**
 * Marcar migración como ejecutada
 */
async function markMigrationAsExecuted(filename) {
  await query('INSERT INTO migrations (filename) VALUES ($1)', [filename])
}

/**
 * Obtener archivos de migración pendientes
 */
function getPendingMigrations(executedMigrations) {
  const migrationsDir = path.join(__dirname, '../migrations')
  
  if (!fs.existsSync(migrationsDir)) {
    logger.warn('Directorio de migraciones no encontrado')
    return []
  }
  
  const allMigrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
  
  const pendingMigrations = allMigrations.filter(
    migration => !executedMigrations.includes(migration)
  )
  
  return pendingMigrations.map(filename => ({
    filename,
    path: path.join(migrationsDir, filename)
  }))
}

/**
 * Ejecutar una migración
 */
async function executeMigration(migration) {
  try {
    logger.info(`Ejecutando migración: ${migration.filename}`)
    
    const sql = fs.readFileSync(migration.path, 'utf8')
    
    // Ejecutar la migración en una transacción
    await query('BEGIN')
    
    try {
      await query(sql)
      await markMigrationAsExecuted(migration.filename)
      await query('COMMIT')
      
      logger.info(`✅ Migración ${migration.filename} ejecutada exitosamente`)
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  } catch (error) {
    logger.error(`❌ Error ejecutando migración ${migration.filename}:`, error.message)
    throw error
  }
}

/**
 * Ejecutar todas las migraciones pendientes
 */
async function runMigrations() {
  try {
    logger.info('Iniciando proceso de migraciones...')
    
    // Crear tabla de migraciones
    await createMigrationsTable()
    
    // Obtener migraciones ejecutadas
    const executedMigrations = await getExecutedMigrations()
    logger.info(`Migraciones ya ejecutadas: ${executedMigrations.length}`)
    
    // Obtener migraciones pendientes
    const pendingMigrations = getPendingMigrations(executedMigrations)
    
    if (pendingMigrations.length === 0) {
      logger.info('✅ No hay migraciones pendientes')
      return
    }
    
    logger.info(`Migraciones pendientes: ${pendingMigrations.length}`)
    
    // Ejecutar migraciones pendientes
    for (const migration of pendingMigrations) {
      await executeMigration(migration)
    }
    
    logger.info('🎉 Todas las migraciones ejecutadas exitosamente')
  } catch (error) {
    logger.error('💥 Error en proceso de migraciones:', error)
    throw error
  }
}

/**
 * Función para crear una nueva migración
 */
function createMigration(name) {
  if (!name) {
    logger.error('Nombre de migración requerido')
    process.exit(1)
  }
  
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
  const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`
  const migrationsDir = path.join(__dirname, '../migrations')
  const filepath = path.join(migrationsDir, filename)
  
  // Crear directorio si no existe
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true })
  }
  
  // Template de migración
  const template = `-- Migración: ${name}
-- Fecha: ${new Date().toISOString().split('T')[0]}
-- Descripción: ${name}

-- Escribir aquí los comandos SQL para la migración

-- Ejemplo:
-- CREATE TABLE IF NOT EXISTS ejemplo (
--     id SERIAL PRIMARY KEY,
--     nombre VARCHAR(255) NOT NULL,
--     fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
`
  
  fs.writeFileSync(filepath, template)
  logger.info(`Nueva migración creada: ${filename}`)
  logger.info(`Ruta: ${filepath}`)
}

/**
 * Función principal
 */
async function main() {
  const command = process.argv[2]
  
  try {
    switch (command) {
      case 'run':
        await runMigrations()
        break
      case 'create':
        const name = process.argv.slice(3).join(' ')
        createMigration(name)
        break
      default:
        logger.info('Comandos disponibles:')
        logger.info('  node scripts/migrate.js run     - Ejecutar migraciones pendientes')
        logger.info('  node scripts/migrate.js create <nombre> - Crear nueva migración')
        break
    }
  } catch (error) {
    logger.error('Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { runMigrations, createMigration }
