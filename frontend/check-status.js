/**
 * Script simple para verificar el estado del frontend
 */

const http = require('http')

function checkPort(port, host = 'localhost') {
  return new Promise((resolve) => {
    const req = http.request({
      host,
      port,
      method: 'GET',
      path: '/',
      timeout: 5000
    }, (res) => {
      resolve({
        port,
        status: res.statusCode,
        running: true
      })
    })

    req.on('error', () => {
      resolve({
        port,
        running: false
      })
    })

    req.on('timeout', () => {
      resolve({
        port,
        running: false,
        error: 'timeout'
      })
    })

    req.end()
  })
}

async function checkServices() {
  console.log('🔍 Verificando servicios...\n')

  const frontend = await checkPort(3000)
  const api = await checkPort(3001)

  console.log('📱 Frontend (Next.js):')
  if (frontend.running) {
    console.log(`   ✅ Corriendo en puerto 3000 (Status: ${frontend.status})`)
  } else {
    console.log('   ❌ No está corriendo en puerto 3000')
  }

  console.log('\n🌐 API Layer (Express):')
  if (api.running) {
    console.log(`   ✅ Corriendo en puerto 3001 (Status: ${api.status})`)
  } else {
    console.log('   ❌ No está corriendo en puerto 3001')
  }

  console.log('\n📊 Resumen:')
  console.log(`   Frontend: ${frontend.running ? '✅' : '❌'}`)
  console.log(`   API: ${api.running ? '✅' : '❌'}`)

  if (frontend.running && api.running) {
    console.log('\n🎉 ¡Ambos servicios están funcionando!')
    console.log('   Frontend: http://localhost:3000')
    console.log('   API: http://localhost:3001')
  }
}

checkServices()
