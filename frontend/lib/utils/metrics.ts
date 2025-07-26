/**
 * Sistema de Métricas y Alertas
 * Sistema de Licencias MPD
 */

import { logger } from './logger'

// Tipos de métricas
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer'
}

// Interfaz para métricas
export interface Metric {
  name: string
  type: MetricType
  value: number
  timestamp: number
  labels?: Record<string, string>
  unit?: string
}

// Interfaz para alertas
export interface Alert {
  id: string
  name: string
  condition: string
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: number
  resolved: boolean
  metadata?: Record<string, any>
}

// Configuración de métricas
interface MetricsConfig {
  enabled: boolean
  collectInterval: number
  retentionPeriod: number
  maxMetrics: number
  remoteEndpoint?: string
  alertsEnabled: boolean
}

const DEFAULT_METRICS_CONFIG: MetricsConfig = {
  enabled: true,
  collectInterval: 30000, // 30 segundos
  retentionPeriod: 24 * 60 * 60 * 1000, // 24 horas
  maxMetrics: 10000,
  remoteEndpoint: '/api/metrics',
  alertsEnabled: true
}

// Clase principal de métricas
class MetricsCollector {
  private config: MetricsConfig
  private metrics: Map<string, Metric[]> = new Map()
  private alerts: Alert[] = []
  private collectTimer?: NodeJS.Timeout
  private alertRules: Map<string, AlertRule> = new Map()

  constructor(config: Partial<MetricsConfig> = {}) {
    this.config = { ...DEFAULT_METRICS_CONFIG, ...config }
    
    if (this.config.enabled) {
      this.startCollection()
      this.setupDefaultAlerts()
    }
  }

  private startCollection(): void {
    this.collectTimer = setInterval(() => {
      this.collectSystemMetrics()
      this.checkAlerts()
      this.cleanup()
    }, this.config.collectInterval)
  }

  private collectSystemMetrics(): void {
    if (typeof window === 'undefined') return

    // Métricas de performance
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.recordGauge('page_load_time', navigation.loadEventEnd - navigation.navigationStart, { page: window.location.pathname })
        this.recordGauge('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.navigationStart, { page: window.location.pathname })
        this.recordGauge('first_paint', navigation.responseStart - navigation.requestStart, { page: window.location.pathname })
      }
    }

    // Métricas de memoria
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.recordGauge('memory_used', memory.usedJSHeapSize, { unit: 'bytes' })
      this.recordGauge('memory_total', memory.totalJSHeapSize, { unit: 'bytes' })
      this.recordGauge('memory_limit', memory.jsHeapSizeLimit, { unit: 'bytes' })
    }

    // Métricas de conexión
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.recordGauge('connection_downlink', connection.downlink, { unit: 'mbps' })
      this.recordGauge('connection_rtt', connection.rtt, { unit: 'ms' })
    }

    // Métricas de viewport
    this.recordGauge('viewport_width', window.innerWidth, { unit: 'px' })
    this.recordGauge('viewport_height', window.innerHeight, { unit: 'px' })

    // Métricas de errores
    const errorCount = this.getErrorCount()
    this.recordCounter('javascript_errors', errorCount)
  }

  private getErrorCount(): number {
    // Obtener conteo de errores desde el logger
    const logStats = logger.getLogStats()
    return logStats.logsByLevel['ERROR'] || 0
  }

  private setupDefaultAlerts(): void {
    // Alerta de memoria alta
    this.addAlertRule('high_memory_usage', {
      metric: 'memory_used',
      condition: 'greater_than',
      threshold: 100 * 1024 * 1024, // 100MB
      severity: 'medium',
      message: 'Uso de memoria alto detectado'
    })

    // Alerta de tiempo de carga lento
    this.addAlertRule('slow_page_load', {
      metric: 'page_load_time',
      condition: 'greater_than',
      threshold: 3000, // 3 segundos
      severity: 'medium',
      message: 'Tiempo de carga de página lento'
    })

    // Alerta de errores frecuentes
    this.addAlertRule('frequent_errors', {
      metric: 'javascript_errors',
      condition: 'greater_than',
      threshold: 5,
      severity: 'high',
      message: 'Errores de JavaScript frecuentes detectados'
    })
  }

  // Métodos públicos para registrar métricas
  public recordCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    this.recordMetric(name, MetricType.COUNTER, value, labels)
  }

  public recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric(name, MetricType.GAUGE, value, labels)
  }

  public recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric(name, MetricType.HISTOGRAM, value, labels)
  }

  public startTimer(name: string, labels?: Record<string, string>): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(name, MetricType.TIMER, duration, labels)
    }
  }

  private recordMetric(name: string, type: MetricType, value: number, labels?: Record<string, string>): void {
    const metric: Metric = {
      name,
      type,
      value,
      timestamp: Date.now(),
      labels
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metricArray = this.metrics.get(name)!
    metricArray.push(metric)

    // Mantener solo métricas recientes
    const cutoff = Date.now() - this.config.retentionPeriod
    this.metrics.set(name, metricArray.filter(m => m.timestamp > cutoff))

    logger.logPerformance(name, value, { type, labels })
  }

  // Sistema de alertas
  public addAlertRule(id: string, rule: AlertRule): void {
    this.alertRules.set(id, rule)
  }

  public removeAlertRule(id: string): void {
    this.alertRules.delete(id)
  }

  private checkAlerts(): void {
    if (!this.config.alertsEnabled) return

    this.alertRules.forEach((rule, id) => {
      const metrics = this.metrics.get(rule.metric)
      if (!metrics || metrics.length === 0) return

      const latestMetric = metrics[metrics.length - 1]
      const shouldAlert = this.evaluateCondition(latestMetric.value, rule.condition, rule.threshold)

      if (shouldAlert) {
        this.triggerAlert(id, rule, latestMetric)
      }
    })
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'greater_than':
        return value > threshold
      case 'less_than':
        return value < threshold
      case 'equals':
        return value === threshold
      case 'not_equals':
        return value !== threshold
      default:
        return false
    }
  }

  private triggerAlert(id: string, rule: AlertRule, metric: Metric): void {
    // Verificar si ya existe una alerta activa para esta regla
    const existingAlert = this.alerts.find(a => a.id === id && !a.resolved)
    if (existingAlert) return

    const alert: Alert = {
      id,
      name: rule.metric,
      condition: `${rule.condition} ${rule.threshold}`,
      threshold: rule.threshold,
      severity: rule.severity,
      message: rule.message,
      timestamp: Date.now(),
      resolved: false,
      metadata: {
        currentValue: metric.value,
        labels: metric.labels
      }
    }

    this.alerts.push(alert)
    this.notifyAlert(alert)
    
    logger.warn(`Alert triggered: ${alert.message}`, {
      alertId: id,
      currentValue: metric.value,
      threshold: rule.threshold
    })
  }

  private notifyAlert(alert: Alert): void {
    // Notificación en consola
    console.warn(`🚨 ALERT: ${alert.message}`, alert)

    // Notificación visual (toast)
    if (typeof window !== 'undefined') {
      this.showAlertNotification(alert)
    }

    // Envío a endpoint remoto
    if (this.config.remoteEndpoint) {
      this.sendAlertToRemote(alert)
    }
  }

  private showAlertNotification(alert: Alert): void {
    // Crear notificación visual
    const notification = document.createElement('div')
    notification.className = `alert alert-${alert.severity}`
    notification.innerHTML = `
      <div class="alert-content">
        <strong>⚠️ ${alert.severity.toUpperCase()}</strong>
        <p>${alert.message}</p>
        <small>${new Date(alert.timestamp).toLocaleString()}</small>
      </div>
    `
    
    // Agregar estilos
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getAlertColor(alert.severity)};
      color: white;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `

    document.body.appendChild(notification)

    // Auto-remove después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)
  }

  private getAlertColor(severity: string): string {
    switch (severity) {
      case 'low': return '#28a745'
      case 'medium': return '#ffc107'
      case 'high': return '#fd7e14'
      case 'critical': return '#dc3545'
      default: return '#6c757d'
    }
  }

  private async sendAlertToRemote(alert: Alert): Promise<void> {
    try {
      await fetch(`${this.config.remoteEndpoint}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      })
    } catch (error) {
      console.error('Failed to send alert to remote endpoint:', error)
    }
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.config.retentionPeriod

    // Limpiar métricas antiguas
    this.metrics.forEach((metricArray, name) => {
      const filtered = metricArray.filter(m => m.timestamp > cutoff)
      if (filtered.length === 0) {
        this.metrics.delete(name)
      } else {
        this.metrics.set(name, filtered)
      }
    })

    // Limpiar alertas resueltas antiguas
    this.alerts = this.alerts.filter(a => !a.resolved || (Date.now() - a.timestamp) < this.config.retentionPeriod)
  }

  // Métodos de consulta
  public getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.get(name) || []
    }
    
    const allMetrics: Metric[] = []
    this.metrics.forEach(metricArray => {
      allMetrics.push(...metricArray)
    })
    return allMetrics.sort((a, b) => b.timestamp - a.timestamp)
  }

  public getAlerts(resolved?: boolean): Alert[] {
    if (resolved !== undefined) {
      return this.alerts.filter(a => a.resolved === resolved)
    }
    return [...this.alerts]
  }

  public resolveAlert(id: string): void {
    const alert = this.alerts.find(a => a.id === id && !a.resolved)
    if (alert) {
      alert.resolved = true
      logger.info(`Alert resolved: ${alert.message}`, { alertId: id })
    }
  }

  public getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {}
    
    this.metrics.forEach((metricArray, name) => {
      if (metricArray.length === 0) return
      
      const values = metricArray.map(m => m.value)
      summary[name] = {
        count: values.length,
        latest: values[values.length - 1],
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length
      }
    })
    
    return summary
  }

  public destroy(): void {
    if (this.collectTimer) {
      clearInterval(this.collectTimer)
    }
  }
}

// Interfaz para reglas de alerta
interface AlertRule {
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
}

// Instancia singleton
export const metricsCollector = new MetricsCollector()

// Hook de React para métricas
export const useMetrics = () => {
  return {
    recordCounter: metricsCollector.recordCounter.bind(metricsCollector),
    recordGauge: metricsCollector.recordGauge.bind(metricsCollector),
    recordHistogram: metricsCollector.recordHistogram.bind(metricsCollector),
    startTimer: metricsCollector.startTimer.bind(metricsCollector),
    getMetrics: metricsCollector.getMetrics.bind(metricsCollector),
    getAlerts: metricsCollector.getAlerts.bind(metricsCollector),
    resolveAlert: metricsCollector.resolveAlert.bind(metricsCollector),
    getMetricsSummary: metricsCollector.getMetricsSummary.bind(metricsCollector)
  }
}

// Decorador para métricas automáticas
export const withMetrics = <T extends (...args: any[]) => any>(
  fn: T,
  metricName?: string
): T => {
  const name = metricName || fn.name || 'anonymous_function'
  
  return ((...args: Parameters<T>) => {
    const stopTimer = metricsCollector.startTimer(`function_duration_${name}`)
    metricsCollector.recordCounter(`function_calls_${name}`)
    
    try {
      const result = fn(...args)
      
      if (result instanceof Promise) {
        return result
          .then(value => {
            stopTimer()
            metricsCollector.recordCounter(`function_success_${name}`)
            return value
          })
          .catch(error => {
            stopTimer()
            metricsCollector.recordCounter(`function_error_${name}`)
            throw error
          })
      } else {
        stopTimer()
        metricsCollector.recordCounter(`function_success_${name}`)
        return result
      }
    } catch (error) {
      stopTimer()
      metricsCollector.recordCounter(`function_error_${name}`)
      throw error
    }
  }) as T
}
