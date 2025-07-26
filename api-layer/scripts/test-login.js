/**
 * Script para probar login directamente
 */

import bcrypt from 'bcryptjs'
import { query } from '../src/config/database.js'

async function testLogin() {
  try {
    console.log('🔐 Probando login directo...\n')

    const email = 'admin@mpd.gov.ar'
    const password = 'admin123'

    // Obtener usuario de la base de datos
    const userResult = await query(
      'SELECT id, email, password, nombre, apellido, rol, activo FROM auth.usuarios WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      console.log('❌ Usuario no encontrado')
      return
    }

    const user = userResult.rows[0]
    console.log('👤 Usuario encontrado:', {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      activo: user.activo
    })

    // Verificar contraseña
    console.log('\n🔑 Verificando contraseña...')
    console.log('Password ingresada:', password)
    console.log('Hash en BD:', user.password.substring(0, 20) + '...')

    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('¿Contraseña válida?:', isValidPassword)

    if (isValidPassword) {
      console.log('✅ Login exitoso!')
    } else {
      console.log('❌ Contraseña incorrecta')
      
      // Crear nuevo hash para comparar
      console.log('\n🔧 Creando nuevo hash para verificar...')
      const newHash = await bcrypt.hash(password, 12)
      console.log('Nuevo hash:', newHash.substring(0, 20) + '...')
      
      const testNewHash = await bcrypt.compare(password, newHash)
      console.log('¿Nuevo hash funciona?:', testNewHash)
    }

  } catch (error) {
    console.error('❌ Error en test de login:', error.message)
  }
}

testLogin()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Error:', error)
    process.exit(1)
  })
