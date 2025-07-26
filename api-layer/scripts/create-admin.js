/**
 * Script para crear usuario administrador
 */

import bcrypt from 'bcryptjs'
import { query } from '../src/config/database.js'
import { logger } from '../src/utils/logger.js'

async function createAdmin() {
  try {
    console.log('👤 Creando usuario administrador...')
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Insertar usuario admin
    await query(`
      INSERT INTO auth.usuarios (email, password, nombre, apellido, rol, activo)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        nombre = EXCLUDED.nombre,
        apellido = EXCLUDED.apellido,
        rol = EXCLUDED.rol,
        activo = EXCLUDED.activo
    `, [
      'admin@mpd.gov.ar',
      hashedPassword,
      'Administrador',
      'Sistema',
      'admin',
      true
    ])
    
    console.log('✅ Usuario administrador creado exitosamente')
    console.log('📧 Email: admin@mpd.gov.ar')
    console.log('🔑 Password: admin123')
    
    // Verificar que se creó correctamente
    const result = await query(
      'SELECT id, email, nombre, apellido, rol FROM auth.usuarios WHERE email = $1',
      ['admin@mpd.gov.ar']
    )
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación exitosa:', result.rows[0])
    }
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error.message)
    throw error
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdmin()
    .then(() => {
      console.log('🎉 Proceso completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error:', error)
      process.exit(1)
    })
}

export { createAdmin }
