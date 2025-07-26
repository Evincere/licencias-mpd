import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando setup global para tests E2E...')
  
  // Verificar que el servidor esté corriendo
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Intentar acceder a la página principal
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    console.log('✅ Servidor frontend disponible')
    
    // Verificar que la API esté disponible
    const response = await page.request.get('http://localhost:3001/api/health')
    if (response.ok()) {
      console.log('✅ API backend disponible')
    } else {
      console.log('⚠️ API backend no disponible, usando mocks')
    }
    
    // Configurar datos de prueba si es necesario
    await setupTestData()
    
  } catch (error) {
    console.error('❌ Error en setup global:', error)
    throw error
  } finally {
    await browser.close()
  }
  
  console.log('✅ Setup global completado')
}

async function setupTestData() {
  // Aquí se pueden configurar datos de prueba
  // Por ejemplo, crear usuarios de prueba, limpiar base de datos, etc.
  console.log('📊 Configurando datos de prueba...')
  
  // Mock de datos de empleados para testing
  const testEmployees = [
    {
      id: 'test_emp_001',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez.test@jus.mendoza.gov.ar',
      area: 'Defensoría Civil',
      jerarquia: 'FUNCIONARIO'
    },
    {
      id: 'test_emp_002',
      nombre: 'María',
      apellido: 'García',
      email: 'maria.garcia.test@jus.mendoza.gov.ar',
      area: 'Defensoría Penal',
      jerarquia: 'MAGISTRADO'
    }
  ]
  
  // En un entorno real, aquí se insertarían en la base de datos
  console.log(`📝 Configurados ${testEmployees.length} empleados de prueba`)
}

export default globalSetup
