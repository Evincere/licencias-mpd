/**
 * Sistema de cache optimizado para performance
 * Implementa múltiples estrategias de cache para diferentes tipos de datos
 */

// Tipos de cache disponibles
export type CacheStrategy = 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'

// Configuración de cache por tipo de dato
export interface CacheConfig {
  strategy: CacheStrategy
  ttl: number // Time to live en milisegundos
  maxSize?: number // Tamaño máximo del cache
  compression?: boolean // Comprimir datos grandes
}

// Configuraciones predefinidas
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Datos de usuario - cache en memoria para acceso rápido
  user: {
    strategy: 'memory',
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 10
  },
  
  // Solicitudes - localStorage para persistencia
  solicitudes: {
    strategy: 'localStorage',
    ttl: 10 * 60 * 1000, // 10 minutos
    maxSize: 100,
    compression: true
  },
  
  // Empleados - localStorage con TTL largo
  empleados: {
    strategy: 'localStorage',
    ttl: 30 * 60 * 1000, // 30 minutos
    maxSize: 500,
    compression: true
  },
  
  // Analytics - sessionStorage para sesión actual
  analytics: {
    strategy: 'sessionStorage',
    ttl: 60 * 60 * 1000, // 1 hora
    maxSize: 50
  },
  
  // Reportes grandes - IndexedDB para datos pesados
  reportes: {
    strategy: 'indexedDB',
    ttl: 2 * 60 * 60 * 1000, // 2 horas
    maxSize: 20,
    compression: true
  },
  
  // Configuración del sistema - localStorage persistente
  config: {
    strategy: 'localStorage',
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    maxSize: 20
  },
  
  // Datos de IA - memoria para acceso rápido
  ia: {
    strategy: 'memory',
    ttl: 15 * 60 * 1000, // 15 minutos
    maxSize: 30
  }
}

// Interfaz para entradas de cache
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  compressed?: boolean
}

// Cache en memoria
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Verificar si expiró
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    
    // Eliminar entradas expiradas
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    })
    
    // Si aún está lleno, eliminar las más antiguas
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      
      const toDelete = sortedEntries.slice(0, Math.floor(this.maxSize * 0.2))
      toDelete.forEach(([key]) => this.cache.delete(key))
    }
  }
}

// Cache para localStorage/sessionStorage
class WebStorageCache {
  private storage: Storage
  private prefix: string

  constructor(storage: Storage, prefix: string = 'app_cache_') {
    this.storage = storage
    this.prefix = prefix
  }

  set<T>(key: string, data: T, ttl: number, compress: boolean = false): void {
    try {
      let serializedData = JSON.stringify(data)
      
      // Comprimir si es necesario
      if (compress && serializedData.length > 1000) {
        // Implementación básica de compresión (en producción usar LZ-string)
        serializedData = this.compress(serializedData)
      }

      const entry: CacheEntry<string> = {
        data: serializedData,
        timestamp: Date.now(),
        ttl,
        compressed: compress
      }

      this.storage.setItem(this.prefix + key, JSON.stringify(entry))
    } catch (error) {
      console.warn('Error setting cache:', error)
      // Si falla por espacio, limpiar cache antiguo
      this.cleanup()
      try {
        this.storage.setItem(this.prefix + key, JSON.stringify({
          data: JSON.stringify(data),
          timestamp: Date.now(),
          ttl
        }))
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError)
      }
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key)
      if (!item) return null

      const entry: CacheEntry<string> = JSON.parse(item)
      
      // Verificar si expiró
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.storage.removeItem(this.prefix + key)
        return null
      }

      let data = entry.data
      
      // Descomprimir si es necesario
      if (entry.compressed) {
        data = this.decompress(data)
      }

      return JSON.parse(data)
    } catch (error) {
      console.warn('Error getting cache:', error)
      this.storage.removeItem(this.prefix + key)
      return null
    }
  }

  delete(key: string): void {
    this.storage.removeItem(this.prefix + key)
  }

  clear(): void {
    const keys = Object.keys(this.storage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key)
      }
    })
  }

  private cleanup(): void {
    const now = Date.now()
    const keys = Object.keys(this.storage)
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = this.storage.getItem(key)
          if (item) {
            const entry = JSON.parse(item)
            if (now - entry.timestamp > entry.ttl) {
              this.storage.removeItem(key)
            }
          }
        } catch (error) {
          // Eliminar entradas corruptas
          this.storage.removeItem(key)
        }
      }
    })
  }

  private compress(data: string): string {
    // Implementación básica - en producción usar LZ-string
    return btoa(data)
  }

  private decompress(data: string): string {
    // Implementación básica - en producción usar LZ-string
    return atob(data)
  }
}

// Cache manager principal
class CacheManager {
  private memoryCache: MemoryCache
  private localStorageCache: WebStorageCache
  private sessionStorageCache: WebStorageCache

  constructor() {
    this.memoryCache = new MemoryCache(200)
    this.localStorageCache = new WebStorageCache(localStorage, 'app_local_')
    this.sessionStorageCache = new WebStorageCache(sessionStorage, 'app_session_')
  }

  set<T>(namespace: string, key: string, data: T): void {
    const config = CACHE_CONFIGS[namespace] || CACHE_CONFIGS.user
    const fullKey = `${namespace}:${key}`

    switch (config.strategy) {
      case 'memory':
        this.memoryCache.set(fullKey, data, config.ttl)
        break
      case 'localStorage':
        this.localStorageCache.set(fullKey, data, config.ttl, config.compression)
        break
      case 'sessionStorage':
        this.sessionStorageCache.set(fullKey, data, config.ttl, config.compression)
        break
      case 'indexedDB':
        // TODO: Implementar IndexedDB cache
        console.warn('IndexedDB cache not implemented yet')
        break
    }
  }

  get<T>(namespace: string, key: string): T | null {
    const config = CACHE_CONFIGS[namespace] || CACHE_CONFIGS.user
    const fullKey = `${namespace}:${key}`

    switch (config.strategy) {
      case 'memory':
        return this.memoryCache.get<T>(fullKey)
      case 'localStorage':
        return this.localStorageCache.get<T>(fullKey)
      case 'sessionStorage':
        return this.sessionStorageCache.get<T>(fullKey)
      case 'indexedDB':
        // TODO: Implementar IndexedDB cache
        console.warn('IndexedDB cache not implemented yet')
        return null
      default:
        return null
    }
  }

  delete(namespace: string, key: string): void {
    const config = CACHE_CONFIGS[namespace] || CACHE_CONFIGS.user
    const fullKey = `${namespace}:${key}`

    switch (config.strategy) {
      case 'memory':
        this.memoryCache.delete(fullKey)
        break
      case 'localStorage':
        this.localStorageCache.delete(fullKey)
        break
      case 'sessionStorage':
        this.sessionStorageCache.delete(fullKey)
        break
    }
  }

  clear(namespace?: string): void {
    if (namespace) {
      const config = CACHE_CONFIGS[namespace]
      if (config) {
        switch (config.strategy) {
          case 'memory':
            // Limpiar solo entradas del namespace
            break
          case 'localStorage':
            this.localStorageCache.clear()
            break
          case 'sessionStorage':
            this.sessionStorageCache.clear()
            break
        }
      }
    } else {
      this.memoryCache.clear()
      this.localStorageCache.clear()
      this.sessionStorageCache.clear()
    }
  }

  // Método para invalidar cache basado en patrones
  invalidatePattern(pattern: RegExp): void {
    // Implementar invalidación por patrones
    console.log('Invalidating cache pattern:', pattern)
  }

  // Método para obtener estadísticas de cache
  getStats(): Record<string, any> {
    return {
      memory: {
        size: this.memoryCache['cache'].size,
        maxSize: this.memoryCache['maxSize']
      },
      localStorage: {
        used: this.getStorageUsage(localStorage),
        available: this.getStorageQuota(localStorage)
      },
      sessionStorage: {
        used: this.getStorageUsage(sessionStorage),
        available: this.getStorageQuota(sessionStorage)
      }
    }
  }

  private getStorageUsage(storage: Storage): number {
    let total = 0
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        total += storage[key].length + key.length
      }
    }
    return total
  }

  private getStorageQuota(storage: Storage): number {
    // Estimación aproximada del límite de storage
    return 5 * 1024 * 1024 // 5MB aproximado
  }
}

// Instancia singleton del cache manager
export const cacheManager = new CacheManager()

// Hooks de React para usar el cache
export const useCache = <T>(namespace: string, key: string, fetcher: () => Promise<T>) => {
  const getCachedData = (): T | null => {
    return cacheManager.get<T>(namespace, key)
  }

  const setCachedData = (data: T): void => {
    cacheManager.set(namespace, key, data)
  }

  const invalidateCache = (): void => {
    cacheManager.delete(namespace, key)
  }

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    fetcher
  }
}

// Decorador para funciones con cache automático
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  namespace: string,
  keyGenerator: (...args: Parameters<T>) => string,
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    
    // Intentar obtener del cache
    const cached = cacheManager.get(namespace, key)
    if (cached !== null) {
      return cached
    }
    
    // Ejecutar función y cachear resultado
    const result = await fn(...args)
    cacheManager.set(namespace, key, result)
    
    return result
  }) as T
}
