/**
 * Script de prueba para verificar endpoints principales
 */

const BASE_URL = 'http://localhost:3001'

async function testEndpoint(method, endpoint, data = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const result = await response.json()

    console.log(`\n${method} ${endpoint}`)
    console.log(`Status: ${response.status}`)
    console.log(`Response:`, JSON.stringify(result, null, 2))

    return { status: response.status, data: result }
  } catch (error) {
    console.error(`Error en ${method} ${endpoint}:`, error.message)
    return { error: error.message }
  }
}

async function runTests() {
  console.log('🧪 Iniciando pruebas de endpoints...\n')

  // 1. Health checks
  console.log('=== HEALTH CHECKS ===')
  await testEndpoint('GET', '/')
  await testEndpoint('GET', '/health')
  await testEndpoint('GET', '/health/detailed')

  // 2. Autenticación
  console.log('\n=== AUTENTICACIÓN ===')
  
  // Intentar login con usuario admin por defecto
  const loginResult = await testEndpoint('POST', '/auth/login', {
    email: 'admin@mpd.gov.ar',
    password: 'admin123'
  })

  let token = null
  if (loginResult.status === 200 && loginResult.data.data?.accessToken) {
    token = loginResult.data.data.accessToken
    console.log('✅ Login exitoso, token obtenido')

    // Probar endpoint protegido
    await testEndpoint('GET', '/auth/me', null, token)
  } else {
    console.log('❌ Login falló, no se pueden probar endpoints protegidos')
  }

  // 3. Empleados (si tenemos token)
  if (token) {
    console.log('\n=== EMPLEADOS ===')
    await testEndpoint('GET', '/api/empleados?limit=5', null, token)
  }

  // 4. Solicitudes (si tenemos token)
  if (token) {
    console.log('\n=== SOLICITUDES ===')
    await testEndpoint('GET', '/api/solicitudes?limit=5', null, token)
    await testEndpoint('GET', '/api/solicitudes/estadisticas', null, token)
  }

  // 5. WhatsApp
  console.log('\n=== WHATSAPP ===')
  await testEndpoint('GET', '/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test&hub.challenge=test123')

  console.log('\n🎉 Pruebas completadas!')
}

// Ejecutar pruebas
runTests().catch(console.error)
