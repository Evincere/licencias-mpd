/**
 * Endpoint de Métricas para Prometheus
 * Sistema de Licencias MPD
 */

import { NextRequest, NextResponse } from 'next/server'

// Simulación de métricas del sistema (en producción vendrían de una base de datos o servicio)
interface SystemMetrics {
  http_requests_total: number
  http_request_duration_seconds: number
  active_users: number
  database_connections: number
  memory_usage_bytes: number
  cpu_usage_percent: number
  solicitudes_created_total: number
  solicitudes_approved_total: number
  solicitudes_rejected_total: number
  empleados_total: number
  errors_total: number
}

// Función para obtener métricas del sistema
function getSystemMetrics(): SystemMetrics {
  // En producción, estas métricas vendrían de:
  // - Base de datos
  // - Redis
  // - Servicios de monitoreo
  // - Logs de aplicación
  
  return {
    http_requests_total: Math.floor(Math.random() * 10000) + 50000,
    http_request_duration_seconds: Math.random() * 2 + 0.1,
    active_users: Math.floor(Math.random() * 50) + 10,
    database_connections: Math.floor(Math.random() * 20) + 5,
    memory_usage_bytes: Math.floor(Math.random() * 500000000) + 100000000, // 100-600MB
    cpu_usage_percent: Math.random() * 80 + 10, // 10-90%
    solicitudes_created_total: Math.floor(Math.random() * 1000) + 5000,
    solicitudes_approved_total: Math.floor(Math.random() * 800) + 4000,
    solicitudes_rejected_total: Math.floor(Math.random() * 200) + 100,
    empleados_total: Math.floor(Math.random() * 50) + 200,
    errors_total: Math.floor(Math.random() * 10) + 1
  }
}

// Función para formatear métricas en formato Prometheus
function formatPrometheusMetrics(metrics: SystemMetrics): string {
  const timestamp = Date.now()
  
  return `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{service="licencias-frontend",environment="production"} ${metrics.http_requests_total} ${timestamp}

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds{service="licencias-frontend",environment="production"} ${metrics.http_request_duration_seconds} ${timestamp}

# HELP active_users Number of active users
# TYPE active_users gauge
active_users{service="licencias-frontend",environment="production"} ${metrics.active_users} ${timestamp}

# HELP database_connections Number of active database connections
# TYPE database_connections gauge
database_connections{service="licencias-frontend",environment="production"} ${metrics.database_connections} ${timestamp}

# HELP memory_usage_bytes Memory usage in bytes
# TYPE memory_usage_bytes gauge
memory_usage_bytes{service="licencias-frontend",environment="production"} ${metrics.memory_usage_bytes} ${timestamp}

# HELP cpu_usage_percent CPU usage percentage
# TYPE cpu_usage_percent gauge
cpu_usage_percent{service="licencias-frontend",environment="production"} ${metrics.cpu_usage_percent} ${timestamp}

# HELP solicitudes_created_total Total number of solicitudes created
# TYPE solicitudes_created_total counter
solicitudes_created_total{service="licencias-frontend",environment="production"} ${metrics.solicitudes_created_total} ${timestamp}

# HELP solicitudes_approved_total Total number of solicitudes approved
# TYPE solicitudes_approved_total counter
solicitudes_approved_total{service="licencias-frontend",environment="production"} ${metrics.solicitudes_approved_total} ${timestamp}

# HELP solicitudes_rejected_total Total number of solicitudes rejected
# TYPE solicitudes_rejected_total counter
solicitudes_rejected_total{service="licencias-frontend",environment="production"} ${metrics.solicitudes_rejected_total} ${timestamp}

# HELP empleados_total Total number of employees
# TYPE empleados_total gauge
empleados_total{service="licencias-frontend",environment="production"} ${metrics.empleados_total} ${timestamp}

# HELP errors_total Total number of errors
# TYPE errors_total counter
errors_total{service="licencias-frontend",environment="production"} ${metrics.errors_total} ${timestamp}

# HELP nodejs_version Node.js version info
# TYPE nodejs_version gauge
nodejs_version{version="${process.version}",service="licencias-frontend"} 1 ${timestamp}

# HELP app_info Application information
# TYPE app_info gauge
app_info{version="${process.env.NEXT_PUBLIC_APP_VERSION || '1.7.0'}",service="licencias-frontend",environment="production"} 1 ${timestamp}
`.trim()
}

// GET /api/metrics - Endpoint para Prometheus
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación (opcional)
    const authHeader = request.headers.get('authorization')
    if (process.env.METRICS_AUTH_TOKEN && authHeader !== `Bearer ${process.env.METRICS_AUTH_TOKEN}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Obtener métricas del sistema
    const metrics = getSystemMetrics()
    
    // Formatear en formato Prometheus
    const prometheusMetrics = formatPrometheusMetrics(metrics)
    
    return new NextResponse(prometheusMetrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error generating metrics:', error)
    
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}

// POST /api/metrics - Endpoint para recibir métricas del cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar estructura de datos
    if (!body.logs || !Array.isArray(body.logs)) {
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 400 })
    }

    // Procesar logs/métricas recibidas
    const processedMetrics = body.logs.map((log: any) => ({
      timestamp: log.timestamp || new Date().toISOString(),
      level: log.level || 'info',
      category: log.category || 'system',
      message: log.message || '',
      data: log.data || {},
      sessionId: log.sessionId,
      userId: log.userId,
      userAgent: log.userAgent
    }))

    // En producción, aquí se guardarían en base de datos o se enviarían a un servicio de logging
    console.log(`Received ${processedMetrics.length} metrics from client`)
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 10))

    return NextResponse.json({
      success: true,
      processed: processedMetrics.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing client metrics:', error)
    
    return NextResponse.json({
      error: 'Failed to process metrics',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// PUT /api/metrics/alerts - Endpoint para recibir alertas
export async function PUT(request: NextRequest) {
  try {
    const alert = await request.json()
    
    // Validar estructura de alerta
    if (!alert.id || !alert.message || !alert.severity) {
      return NextResponse.json({ error: 'Invalid alert structure' }, { status: 400 })
    }

    // Procesar alerta
    const processedAlert = {
      id: alert.id,
      name: alert.name || 'Unknown Alert',
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.timestamp || new Date().toISOString(),
      resolved: alert.resolved || false,
      metadata: alert.metadata || {}
    }

    // En producción, aquí se:
    // - Guardaría en base de datos
    // - Enviaría notificaciones (email, Slack, etc.)
    // - Activaría webhooks
    // - Registraría en sistema de alertas
    
    console.log(`Alert received: ${processedAlert.severity} - ${processedAlert.message}`)

    // Simular notificación
    if (processedAlert.severity === 'critical') {
      console.log('🚨 CRITICAL ALERT - Immediate attention required!')
    }

    return NextResponse.json({
      success: true,
      alertId: processedAlert.id,
      processed: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing alert:', error)
    
    return NextResponse.json({
      error: 'Failed to process alert',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
