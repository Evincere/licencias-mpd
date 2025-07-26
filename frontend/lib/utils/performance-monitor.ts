/**
 * Sistema de monitoreo de performance en tiempo real
 * Recolecta métricas de Core Web Vitals, API calls, y performance general
 */

// Tipos de métricas
export interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  
  // Métricas de navegación
  navigationStart?: number
  domContentLoaded?: number
  loadComplete?: number
  
  // Métricas de API
  apiCalls: APICallMetric[]
  
  // Métricas de memoria
  memoryUsage?: MemoryInfo
  
  // Métricas de red
  connectionType?: string
  effectiveType?: string
  
  // Métricas de usuario
  userInteractions: UserInteractionMetric[]
}

export interface APICallMetric {
  endpoint: string
  method: string
  duration: number
  status: number
  size?: number
  cached: boolean
  timestamp: number
}

export interface UserInteractionMetric {
  type: 'click' | 'scroll' | 'input' | 'navigation'
  target: string
  duration?: number
  timestamp: number
}

export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

// Configuración de monitoreo
export interface MonitorConfig {
  enabled: boolean
  sampleRate: number // 0-1, porcentaje de sesiones a monitorear
  reportInterval: number // ms entre reportes
  maxMetrics: number // máximo número de métricas a mantener
  endpoints: {
    report: string // endpoint para enviar métricas
    realtime?: string // endpoint para métricas en tiempo real
  }
}

// Configuración por defecto
const DEFAULT_CONFIG: MonitorConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: 0.1, // 10% de las sesiones
  reportInterval: 30000, // 30 segundos
  maxMetrics: 1000,
  endpoints: {
    report: '/api/metrics/performance'
  }
}

// Monitor principal de performance
class PerformanceMonitor {
  private config: MonitorConfig
  private metrics: PerformanceMetrics
  private observers: Map<string, PerformanceObserver> = new Map()
  private reportTimer?: NodeJS.Timeout
  private sessionId: string
  private isMonitoring: boolean = false

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    this.metrics = {
      apiCalls: [],
      userInteractions: []
    }

    // Solo inicializar si está habilitado y en el sample rate
    if (this.config.enabled && Math.random() < this.config.sampleRate) {
      this.initialize()
    }
  }

  private initialize(): void {
    if (typeof window === 'undefined') return

    this.isMonitoring = true
    this.setupCoreWebVitals()
    this.setupNavigationMetrics()
    this.setupAPIMonitoring()
    this.setupUserInteractionMonitoring()
    this.setupMemoryMonitoring()
    this.setupNetworkMonitoring()
    this.startReporting()

    console.log('Performance monitoring initialized for session:', this.sessionId)
  }

  private setupCoreWebVitals(): void {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] })
    this.observers.set('fcp', fcpObserver)

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.lcp = lastEntry.startTime
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.set('lcp', lcpObserver)

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.name === 'first-input') {
          this.metrics.fid = (entry as any).processingStart - entry.startTime
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    this.observers.set('fid', fidObserver)

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      this.metrics.cls = clsValue
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    this.observers.set('cls', clsObserver)
  }

  private setupNavigationMetrics(): void {
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        const navEntry = entry as PerformanceNavigationTiming
        this.metrics.navigationStart = navEntry.navigationStart
        this.metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.navigationStart
        this.metrics.loadComplete = navEntry.loadEventEnd - navEntry.navigationStart
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart
      })
    })
    navigationObserver.observe({ entryTypes: ['navigation'] })
    this.observers.set('navigation', navigationObserver)
  }

  private setupAPIMonitoring(): void {
    // Interceptar fetch para monitorear API calls
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const url = typeof args[0] === 'string' ? args[0] : args[0].url
      const method = args[1]?.method || 'GET'

      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        
        this.recordAPICall({
          endpoint: url,
          method,
          duration: endTime - startTime,
          status: response.status,
          size: this.getResponseSize(response),
          cached: response.headers.get('x-cache') === 'HIT',
          timestamp: Date.now()
        })

        return response
      } catch (error) {
        const endTime = performance.now()
        
        this.recordAPICall({
          endpoint: url,
          method,
          duration: endTime - startTime,
          status: 0, // Error
          cached: false,
          timestamp: Date.now()
        })

        throw error
      }
    }
  }

  private setupUserInteractionMonitoring(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      this.recordUserInteraction({
        type: 'click',
        target: this.getElementSelector(event.target as Element),
        timestamp: Date.now()
      })
    })

    // Scroll tracking (throttled)
    let scrollTimeout: NodeJS.Timeout
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.recordUserInteraction({
          type: 'scroll',
          target: 'window',
          timestamp: Date.now()
        })
      }, 100)
    })

    // Input tracking
    document.addEventListener('input', (event) => {
      this.recordUserInteraction({
        type: 'input',
        target: this.getElementSelector(event.target as Element),
        timestamp: Date.now()
      })
    })
  }

  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.metrics.memoryUsage = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        }
      }, 5000) // Cada 5 segundos
    }
  }

  private setupNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.metrics.connectionType = connection.type
      this.metrics.effectiveType = connection.effectiveType

      connection.addEventListener('change', () => {
        this.metrics.connectionType = connection.type
        this.metrics.effectiveType = connection.effectiveType
      })
    }
  }

  private startReporting(): void {
    this.reportTimer = setInterval(() => {
      this.sendMetrics()
    }, this.config.reportInterval)

    // Enviar métricas al cerrar la página
    window.addEventListener('beforeunload', () => {
      this.sendMetrics(true)
    })

    // Enviar métricas cuando la página se oculta
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendMetrics(true)
      }
    })
  }

  private recordAPICall(metric: APICallMetric): void {
    this.metrics.apiCalls.push(metric)
    
    // Mantener solo las métricas más recientes
    if (this.metrics.apiCalls.length > this.config.maxMetrics) {
      this.metrics.apiCalls = this.metrics.apiCalls.slice(-this.config.maxMetrics)
    }
  }

  private recordUserInteraction(metric: UserInteractionMetric): void {
    this.metrics.userInteractions.push(metric)
    
    // Mantener solo las métricas más recientes
    if (this.metrics.userInteractions.length > this.config.maxMetrics) {
      this.metrics.userInteractions = this.metrics.userInteractions.slice(-this.config.maxMetrics)
    }
  }

  private getResponseSize(response: Response): number | undefined {
    const contentLength = response.headers.get('content-length')
    return contentLength ? parseInt(contentLength, 10) : undefined
  }

  private getElementSelector(element: Element): string {
    if (!element) return 'unknown'
    
    // Intentar obtener un selector único
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ')[0]}`
    return element.tagName.toLowerCase()
  }

  private async sendMetrics(isBeacon: boolean = false): Promise<void> {
    if (!this.isMonitoring) return

    const payload = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.metrics
    }

    try {
      if (isBeacon && 'sendBeacon' in navigator) {
        // Usar sendBeacon para envío confiable al cerrar página
        navigator.sendBeacon(
          this.config.endpoints.report,
          JSON.stringify(payload)
        )
      } else {
        // Envío normal
        await fetch(this.config.endpoints.report, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      // Limpiar métricas después del envío
      this.metrics.apiCalls = []
      this.metrics.userInteractions = []
      
    } catch (error) {
      console.warn('Failed to send performance metrics:', error)
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Métodos públicos
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public getCoreWebVitals(): {
    fcp?: number
    lcp?: number
    fid?: number
    cls?: number
  } {
    return {
      fcp: this.metrics.fcp,
      lcp: this.metrics.lcp,
      fid: this.metrics.fid,
      cls: this.metrics.cls
    }
  }

  public getAPIPerformance(): {
    averageResponseTime: number
    errorRate: number
    cacheHitRate: number
    totalCalls: number
  } {
    const calls = this.metrics.apiCalls
    if (calls.length === 0) {
      return {
        averageResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        totalCalls: 0
      }
    }

    const totalTime = calls.reduce((sum, call) => sum + call.duration, 0)
    const errors = calls.filter(call => call.status >= 400).length
    const cached = calls.filter(call => call.cached).length

    return {
      averageResponseTime: totalTime / calls.length,
      errorRate: (errors / calls.length) * 100,
      cacheHitRate: (cached / calls.length) * 100,
      totalCalls: calls.length
    }
  }

  public stop(): void {
    this.isMonitoring = false
    
    // Limpiar observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    
    // Limpiar timer
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
    }
    
    // Enviar métricas finales
    this.sendMetrics(true)
  }
}

// Instancia singleton del monitor
export const performanceMonitor = new PerformanceMonitor()

// Hook de React para acceder a métricas
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null)

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics())
    }

    // Actualizar métricas cada 5 segundos
    const interval = setInterval(updateMetrics, 5000)
    updateMetrics() // Actualización inicial

    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    coreWebVitals: performanceMonitor.getCoreWebVitals(),
    apiPerformance: performanceMonitor.getAPIPerformance()
  }
}

// Utilidades para alertas de performance
export const createPerformanceAlerts = () => {
  const checkThresholds = () => {
    const vitals = performanceMonitor.getCoreWebVitals()
    const api = performanceMonitor.getAPIPerformance()

    const alerts: string[] = []

    // Verificar Core Web Vitals
    if (vitals.fcp && vitals.fcp > 2000) {
      alerts.push(`FCP alto: ${vitals.fcp.toFixed(0)}ms (>2000ms)`)
    }
    if (vitals.lcp && vitals.lcp > 2500) {
      alerts.push(`LCP alto: ${vitals.lcp.toFixed(0)}ms (>2500ms)`)
    }
    if (vitals.fid && vitals.fid > 100) {
      alerts.push(`FID alto: ${vitals.fid.toFixed(0)}ms (>100ms)`)
    }
    if (vitals.cls && vitals.cls > 0.1) {
      alerts.push(`CLS alto: ${vitals.cls.toFixed(3)} (>0.1)`)
    }

    // Verificar API performance
    if (api.averageResponseTime > 1000) {
      alerts.push(`API lenta: ${api.averageResponseTime.toFixed(0)}ms promedio`)
    }
    if (api.errorRate > 5) {
      alerts.push(`Tasa de error alta: ${api.errorRate.toFixed(1)}%`)
    }

    return alerts
  }

  return { checkThresholds }
}
