/**
 * Script de debug para identificar problemas
 */

console.log('🔍 Iniciando debug...')

try {
  console.log('📦 Importando express...')
  const express = await import('express')
  console.log('✅ Express importado')

  console.log('📦 Importando dotenv...')
  const dotenv = await import('dotenv')
  console.log('✅ Dotenv importado')

  console.log('📦 Cargando variables de entorno...')
  dotenv.config()
  console.log('✅ Variables de entorno cargadas')

  console.log('📦 Importando logger...')
  const { logger } = await import('../src/utils/logger.js')
  console.log('✅ Logger importado')

  console.log('📦 Importando config de database...')
  const { testConnection } = await import('../src/config/database.js')
  console.log('✅ Database config importado')

  console.log('📦 Importando rutas...')
  const healthRoutes = await import('../src/routes/health.js')
  console.log('✅ Health routes importado')

  console.log('🎉 Todas las importaciones exitosas')

  // Probar logger
  logger.info('Test de logger funcionando')

  // Probar conexión a BD
  console.log('🔌 Probando conexión a BD...')
  try {
    await testConnection()
    console.log('✅ Conexión a BD exitosa')
  } catch (error) {
    console.log('❌ Error en BD:', error.message)
  }

} catch (error) {
  console.error('💥 Error en importaciones:', error)
  console.error('Stack:', error.stack)
}
