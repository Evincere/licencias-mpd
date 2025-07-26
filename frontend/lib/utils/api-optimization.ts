/**
 * Optimizaciones para APIs y consultas de base de datos
 * Implementa batching, debouncing, prefetching y otras técnicas de optimización
 */

import { cacheManager } from './cache-manager'

// Configuración de optimización por endpoint
interface OptimizationConfig {
  cache: boolean
  cacheTTL?: number
  debounce?: number
  batch?: boolean
  prefetch?: boolean
  retry?: {
    attempts: number
    delay: number
    backoff: number
  }
}

// Configuraciones predefinidas por endpoint
export const API_OPTIMIZATIONS: Record<string, OptimizationConfig> = {
  // Solicitudes - cache agresivo, batching para múltiples requests
  '/api/solicitudes': {
    cache: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutos
    batch: true,
    prefetch: true,
    retry: { attempts: 3, delay: 1000, backoff: 2 }
  },
  
  // Empleados - cache largo, prefetch para navegación
  '/api/empleados': {
    cache: true,
    cacheTTL: 15 * 60 * 1000, // 15 minutos
    batch: true,
    prefetch: true,
    retry: { attempts: 2, delay: 500, backoff: 1.5 }
  },
  
  // Búsquedas - debounce para evitar requests excesivos
  '/api/search': {
    cache: true,
    cacheTTL: 2 * 60 * 1000, // 2 minutos
    debounce: 300,
    retry: { attempts: 1, delay: 0, backoff: 1 }
  },
  
  // Analytics - cache muy largo, no crítico
  '/api/analytics': {
    cache: true,
    cacheTTL: 30 * 60 * 1000, // 30 minutos
    prefetch: false,
    retry: { attempts: 2, delay: 2000, backoff: 2 }
  },
  
  // Reportes - sin cache (datos dinámicos), retry agresivo
  '/api/reportes': {
    cache: false,
    batch: false,
    retry: { attempts: 5, delay: 1000, backoff: 1.5 }
  },
  
  // IA - cache corto, sin retry (fallback disponible)
  '/api/ia': {
    cache: true,
    cacheTTL: 1 * 60 * 1000, // 1 minuto
    retry: { attempts: 1, delay: 0, backoff: 1 }
  }
}

// Request batcher para agrupar múltiples requests
class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{
      resolve: (value: any) => void
      reject: (error: any) => void
      params: any
    }>
    timer: NodeJS.Timeout
  }>()

  private batchDelay = 50 // ms

  add<T>(endpoint: string, params: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchKey = this.getBatchKey(endpoint, params)
      
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, {
          requests: [],
          timer: setTimeout(() => this.executeBatch(batchKey), this.batchDelay)
        })
      }

      const batch = this.batches.get(batchKey)!
      batch.requests.push({ resolve, reject, params })
    })
  }

  private getBatchKey(endpoint: string, params: any): string {
    // Agrupar requests similares (mismo endpoint, parámetros compatibles)
    const sortedParams = Object.keys(params || {}).sort().reduce((result, key) => {
      result[key] = params[key]
      return result
    }, {} as any)
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`
  }

  private async executeBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey)
    if (!batch) return

    this.batches.delete(batchKey)

    try {
      // Ejecutar request batch
      const [endpoint] = batchKey.split(':')
      const allParams = batch.requests.map(req => req.params)
      
      // Combinar parámetros para request batch
      const batchParams = this.combineBatchParams(allParams)
      
      const response = await this.executeBatchRequest(endpoint, batchParams)
      
      // Distribuir respuestas a cada request individual
      batch.requests.forEach((req, index) => {
        const individualResponse = this.extractIndividualResponse(response, req.params, index)
        req.resolve(individualResponse)
      })
      
    } catch (error) {
      // Si falla el batch, ejecutar requests individuales
      batch.requests.forEach(async (req) => {
        try {
          const response = await this.executeIndividualRequest(batchKey.split(':')[0], req.params)
          req.resolve(response)
        } catch (individualError) {
          req.reject(individualError)
        }
      })
    }
  }

  private combineBatchParams(allParams: any[]): any {
    // Combinar parámetros para request eficiente
    const combined = {
      batch: true,
      requests: allParams
    }
    
    // Optimizar filtros comunes
    const commonFilters = this.extractCommonFilters(allParams)
    if (Object.keys(commonFilters).length > 0) {
      combined.commonFilters = commonFilters
    }
    
    return combined
  }

  private extractCommonFilters(allParams: any[]): any {
    if (allParams.length === 0) return {}
    
    const firstParams = allParams[0]
    const common: any = {}
    
    Object.keys(firstParams).forEach(key => {
      const value = firstParams[key]
      if (allParams.every(params => params[key] === value)) {
        common[key] = value
      }
    })
    
    return common
  }

  private async executeBatchRequest(endpoint: string, params: any): Promise<any> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    
    if (!response.ok) {
      throw new Error(`Batch request failed: ${response.status}`)
    }
    
    return response.json()
  }

  private async executeIndividualRequest(endpoint: string, params: any): Promise<any> {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Individual request failed: ${response.status}`)
    }
    
    return response.json()
  }

  private extractIndividualResponse(batchResponse: any, originalParams: any, index: number): any {
    // Extraer respuesta individual del batch response
    if (batchResponse.results && Array.isArray(batchResponse.results)) {
      return batchResponse.results[index]
    }
    
    // Si no hay estructura batch, devolver respuesta completa
    return batchResponse
  }
}

// Debouncer para búsquedas y filtros
class Debouncer {
  private timers = new Map<string, NodeJS.Timeout>()

  debounce<T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve, reject) => {
        // Cancelar timer anterior
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key)!)
        }

        // Crear nuevo timer
        const timer = setTimeout(async () => {
          try {
            const result = await fn(...args)
            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            this.timers.delete(key)
          }
        }, delay)

        this.timers.set(key, timer)
      })
    }
  }

  cancel(key: string): void {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!)
      this.timers.delete(key)
    }
  }

  cancelAll(): void {
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }
}

// Retry handler con backoff exponencial
class RetryHandler {
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: OptimizationConfig['retry']
  ): Promise<T> {
    if (!config) {
      return fn()
    }

    let lastError: Error
    
    for (let attempt = 0; attempt <= config.attempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === config.attempts) {
          throw lastError
        }
        
        // Calcular delay con backoff exponencial
        const delay = config.delay * Math.pow(config.backoff, attempt)
        await this.sleep(delay)
      }
    }
    
    throw lastError!
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Prefetcher para cargar datos anticipadamente
class Prefetcher {
  private prefetchedData = new Map<string, Promise<any>>()

  prefetch(endpoint: string, params: any = {}): Promise<any> {
    const key = `${endpoint}:${JSON.stringify(params)}`
    
    if (this.prefetchedData.has(key)) {
      return this.prefetchedData.get(key)!
    }

    const promise = this.executePrefetch(endpoint, params)
    this.prefetchedData.set(key, promise)
    
    // Limpiar después de un tiempo
    setTimeout(() => {
      this.prefetchedData.delete(key)
    }, 5 * 60 * 1000) // 5 minutos
    
    return promise
  }

  private async executePrefetch(endpoint: string, params: any): Promise<any> {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `${endpoint}?${queryString}` : endpoint
      
      const response = await fetch(url, {
        priority: 'low' // Baja prioridad para prefetch
      } as any)
      
      if (!response.ok) {
        throw new Error(`Prefetch failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Cachear datos prefetched
      const cacheKey = this.getCacheKey(endpoint, params)
      cacheManager.set('prefetch', cacheKey, data)
      
      return data
    } catch (error) {
      console.warn('Prefetch failed:', error)
      throw error
    }
  }

  private getCacheKey(endpoint: string, params: any): string {
    return `${endpoint}:${JSON.stringify(params)}`
  }
}

// API optimizado principal
class OptimizedAPI {
  private batcher = new RequestBatcher()
  private debouncer = new Debouncer()
  private retryHandler = new RetryHandler()
  private prefetcher = new Prefetcher()

  async request<T>(endpoint: string, params: any = {}): Promise<T> {
    const config = API_OPTIMIZATIONS[endpoint] || {}
    
    // Verificar cache primero
    if (config.cache) {
      const cacheKey = `${endpoint}:${JSON.stringify(params)}`
      const cached = cacheManager.get<T>('api', cacheKey)
      if (cached !== null) {
        return cached
      }
    }

    // Función de request
    const requestFn = async (): Promise<T> => {
      if (config.batch) {
        return this.batcher.add<T>(endpoint, params)
      } else {
        return this.executeDirectRequest<T>(endpoint, params)
      }
    }

    // Aplicar debounce si está configurado
    const finalRequestFn = config.debounce 
      ? this.debouncer.debounce(`${endpoint}:${JSON.stringify(params)}`, requestFn, config.debounce)
      : requestFn

    // Ejecutar con retry
    const result = await this.retryHandler.executeWithRetry(finalRequestFn, config.retry)

    // Cachear resultado
    if (config.cache) {
      const cacheKey = `${endpoint}:${JSON.stringify(params)}`
      cacheManager.set('api', cacheKey, result)
    }

    return result
  }

  private async executeDirectRequest<T>(endpoint: string, params: any): Promise<T> {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    
    return response.json()
  }

  // Prefetch para navegación anticipada
  prefetch(endpoint: string, params: any = {}): void {
    const config = API_OPTIMIZATIONS[endpoint]
    if (config?.prefetch) {
      this.prefetcher.prefetch(endpoint, params).catch(() => {
        // Ignorar errores de prefetch
      })
    }
  }

  // Invalidar cache específico
  invalidateCache(endpoint: string, params?: any): void {
    if (params) {
      const cacheKey = `${endpoint}:${JSON.stringify(params)}`
      cacheManager.delete('api', cacheKey)
    } else {
      // Invalidar todo el cache del endpoint
      cacheManager.invalidatePattern(new RegExp(`^api:${endpoint}`))
    }
  }

  // Obtener estadísticas de performance
  getPerformanceStats(): any {
    return {
      cache: cacheManager.getStats(),
      batcher: {
        activeBatches: this.batcher['batches'].size
      },
      debouncer: {
        activeTimers: this.debouncer['timers'].size
      }
    }
  }
}

// Instancia singleton del API optimizado
export const optimizedAPI = new OptimizedAPI()

// Hook de React para usar API optimizada
export const useOptimizedAPI = <T>(endpoint: string, params: any = {}, enabled: boolean = true) => {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await optimizedAPI.request<T>(endpoint, params)
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint, JSON.stringify(params), enabled])

  const refetch = React.useCallback(() => {
    optimizedAPI.invalidateCache(endpoint, params)
    return optimizedAPI.request<T>(endpoint, params)
  }, [endpoint, params])

  return { data, loading, error, refetch }
}

// Utilidades para prefetch en navegación
export const prefetchForRoute = (route: string): void => {
  switch (route) {
    case '/dashboard/solicitudes':
      optimizedAPI.prefetch('/api/solicitudes', { limit: 20 })
      optimizedAPI.prefetch('/api/empleados', { active: true })
      break
    case '/dashboard/empleados':
      optimizedAPI.prefetch('/api/empleados')
      optimizedAPI.prefetch('/api/areas')
      break
    case '/dashboard/reportes':
      optimizedAPI.prefetch('/api/analytics/summary')
      break
    case '/dashboard/calendario':
      optimizedAPI.prefetch('/api/solicitudes', { 
        fechaDesde: new Date().toISOString(),
        fechaHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      break
  }
}
