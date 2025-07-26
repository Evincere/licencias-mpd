/**
 * Script de prueba para verificar el frontend
 */

console.log('🔍 Verificando frontend...')

// Verificar si Next.js está corriendo
async function checkFrontend() {
  try {
    console.log('📡 Probando conexión a http://localhost:3000...')
    
    const response = await fetch('http://localhost:3000')
    
    if (response.ok) {
      console.log('✅ Frontend está corriendo correctamente')
      console.log(`Status: ${response.status}`)
      console.log(`Content-Type: ${response.headers.get('content-type')}`)
    } else {
      console.log(`❌ Frontend respondió con error: ${response.status}`)
    }
  } catch (error) {
    console.log('❌ Error conectando al frontend:', error.message)
    console.log('💡 Posibles causas:')
    console.log('   - Next.js no está corriendo')
    console.log('   - Puerto 3000 ocupado')
    console.log('   - Error de compilación')
  }
}

// Verificar API
async function checkAPI() {
  try {
    console.log('📡 Probando conexión a API http://localhost:3001...')
    
    const response = await fetch('http://localhost:3001/health')
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ API está funcionando correctamente')
      console.log('Respuesta:', data)
    } else {
      console.log(`❌ API respondió con error: ${response.status}`)
    }
  } catch (error) {
    console.log('❌ Error conectando a la API:', error.message)
  }
}

async function runChecks() {
  await checkFrontend()
  console.log('')
  await checkAPI()
}

runChecks()
