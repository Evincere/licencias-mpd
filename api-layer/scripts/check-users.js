/**
 * Script para verificar usuarios en la base de datos
 */

import { query } from '../src/config/database.js'

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n')

    // Verificar si la tabla existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        AND table_name = 'usuarios'
      );
    `)
    
    console.log('📋 Tabla auth.usuarios existe:', tableExists.rows[0].exists)

    if (tableExists.rows[0].exists) {
      // Contar usuarios
      const count = await query('SELECT COUNT(*) as total FROM auth.usuarios')
      console.log('👥 Total de usuarios:', count.rows[0].total)

      // Listar usuarios
      const users = await query('SELECT id, email, nombre, apellido, rol, activo FROM auth.usuarios')
      
      if (users.rows.length > 0) {
        console.log('\n📋 Usuarios encontrados:')
        users.rows.forEach(user => {
          console.log(`   - ${user.email} (${user.nombre} ${user.apellido}) - Rol: ${user.rol} - Activo: ${user.activo}`)
        })
      } else {
        console.log('\n❌ No hay usuarios en la base de datos')
      }

      // Verificar usuario admin específico
      const admin = await query('SELECT * FROM auth.usuarios WHERE email = $1', ['admin@mpd.gov.ar'])
      
      if (admin.rows.length > 0) {
        console.log('\n✅ Usuario admin encontrado:', {
          id: admin.rows[0].id,
          email: admin.rows[0].email,
          nombre: admin.rows[0].nombre,
          apellido: admin.rows[0].apellido,
          rol: admin.rows[0].rol,
          activo: admin.rows[0].activo
        })
      } else {
        console.log('\n❌ Usuario admin NO encontrado')
      }
    }

  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message)
  }
}

checkUsers()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Error:', error)
    process.exit(1)
  })
