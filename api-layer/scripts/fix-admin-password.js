/**
 * Script para corregir la contraseña del admin
 */

import bcrypt from 'bcryptjs'
import { query } from '../src/config/database.js'

async function fixAdminPassword() {
  try {
    console.log('🔧 Corrigiendo contraseña del admin...\n')

    const email = 'admin@mpd.gov.ar'
    const password = 'admin123'

    // Crear hash correcto
    console.log('🔑 Generando hash para password:', password)
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('✅ Hash generado:', hashedPassword.substring(0, 20) + '...')

    // Actualizar en la base de datos
    const result = await query(
      'UPDATE auth.usuarios SET password = $1 WHERE email = $2 RETURNING id, email, nombre',
      [hashedPassword, email]
    )

    if (result.rows.length > 0) {
      console.log('✅ Contraseña actualizada para:', result.rows[0])
    } else {
      console.log('❌ No se pudo actualizar la contraseña')
      return
    }

    // Verificar que funciona
    console.log('\n🧪 Verificando que la nueva contraseña funciona...')
    const testResult = await bcrypt.compare(password, hashedPassword)
    console.log('¿Contraseña válida?:', testResult)

    if (testResult) {
      console.log('\n🎉 ¡Contraseña corregida exitosamente!')
      console.log('📧 Email: admin@mpd.gov.ar')
      console.log('🔑 Password: admin123')
    }

  } catch (error) {
    console.error('❌ Error corrigiendo contraseña:', error.message)
  }
}

fixAdminPassword()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Error:', error)
    process.exit(1)
  })
