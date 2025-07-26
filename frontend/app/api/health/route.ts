/**
 * Health Check Endpoint
 * Sistema de Licencias MPD
 */

import { NextRequest, NextResponse } from 'next/server'

// Información de la aplicación
const APP_INFO = {
  name: 'Sistema de Licencias MPD',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.7.0',
  environment: process.env.NODE_ENV || 'development',
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
}

// Función para verificar dependencias externas
async function checkExternalDependencies() {
  const checks = {
    api: false,
    genkit: false,
    whatsapp: false,
  }

  try {
    // Verificar API Backend
    if (process.env.NEXT_PUBLIC_API_URL) {
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      })
      checks.api = apiResponse.ok
    }
  } catch (error) {
    console.warn('API health check failed:', error)
  }

  try {
    // Verificar Genkit IA
    if (process.env.NEXT_PUBLIC_GENKIT_URL) {
      const genkitResponse = await fetch(`${process.env.NEXT_PUBLIC_GENKIT_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      })
      checks.genkit = genkitResponse.ok
    }
  } catch (error) {
    console.warn('Genkit health check failed:', error)
  }

  try {
    // Verificar WhatsApp API
    if (process.env.NEXT_PUBLIC_WHATSAPP_API_URL) {
      const whatsappResponse = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_API_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      })
      checks.whatsapp = whatsappResponse.ok
    }
  } catch (error) {
    console.warn('WhatsApp health check failed:', error)
  }

  return checks
}

// Función para obtener métricas del sistema
function getSystemMetrics() {
  const memoryUsage = process.memoryUsage()
  
  return {
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    },
    uptime: Math.round(process.uptime()), // seconds
    pid: process.pid,
    platform: process.platform,
    nodeVersion: process.version,
  }
}

// GET /api/health - Health check básico
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Verificar dependencias externas (solo en modo detallado)
    const detailed = request.nextUrl.searchParams.get('detailed') === 'true'
    let dependencies = {}
    
    if (detailed) {
      dependencies = await checkExternalDependencies()
    }

    // Obtener métricas del sistema
    const metrics = getSystemMetrics()
    
    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime

    // Determinar estado general
    const isHealthy = true // Frontend siempre healthy si responde
    const status = isHealthy ? 'healthy' : 'unhealthy'
    const statusCode = isHealthy ? 200 : 503

    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      application: APP_INFO,
      system: metrics,
      ...(detailed && { dependencies }),
      checks: {
        server: 'ok',
        memory: metrics.memory.heapUsed < 512 ? 'ok' : 'warning', // Warning si usa más de 512MB
        uptime: 'ok',
      }
    }

    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      application: APP_INFO,
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  }
}

// HEAD /api/health - Health check ligero para load balancers
export async function HEAD() {
  try {
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
