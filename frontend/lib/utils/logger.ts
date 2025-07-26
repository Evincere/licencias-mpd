/**
 * Sistema de Logging Avanzado
 * Sistema de Licencias MPD
 */

// Niveles de log
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

// Tipos de log
export enum LogCategory {
  SYSTEM = 'system',
  USER = 'user',
  API = 'api',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  BUSINESS = 'business',
  ERROR = 'error'
}

// Interfaz para entradas de log
export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
  data?: any
  userId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  stack?: string
  context?: Record<string, any>
}

// Configuración del logger
interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  enableStorage: boolean
  remoteEndpoint?: string
  maxStorageEntries: number
  bufferSize: number
  flushInterval: number
}

// Configuración por defecto
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: process.env.NODE_ENV !== 'production',
  enableRemote: process.env.NODE_ENV === 'production',
  enableStorage: true,
  remoteEndpoint: '/api/logs',
  maxStorageEntries: 1000,
  bufferSize: 50,
  flushInterval: 30000 // 30 segundos
}

// Clase principal del Logger
class Logger {
  private config: LoggerConfig
  private buffer: LogEntry[] = []
  private storage: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout
  private sessionId: string
  private requestId: number = 0

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    
    if (this.config.enableRemote) {
      this.startFlushTimer()
    }

    // Capturar errores no manejados
    this.setupErrorHandlers()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateRequestId(): string {
    return `req_${++this.requestId}_${Date.now()}`
  }

  private setupErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Errores de JavaScript
      window.addEventListener('error', (event) => {
        this.error('Unhandled JavaScript Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        })
      })

      // Promesas rechazadas
      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled Promise Rejection', {
          reason: event.reason,
          stack: event.reason?.stack
        })
      })
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    context?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      sessionId: this.sessionId,
      requestId: this.generateRequestId(),
      ...(data && { data }),
      ...(context && { context })
    }

    // Agregar información del navegador si está disponible
    if (typeof window !== 'undefined') {
      entry.userAgent = navigator.userAgent
      entry.userId = this.getCurrentUserId()
    }

    return entry
  }

  private getCurrentUserId(): string | undefined {
    // Obtener ID del usuario actual desde el contexto de la aplicación
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.id
      }
    } catch (error) {
      // Ignorar errores de parsing
    }
    return undefined
  }

  private processLogEntry(entry: LogEntry): void {
    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // Storage local
    if (this.config.enableStorage) {
      this.addToStorage(entry)
    }

    // Buffer para envío remoto
    if (this.config.enableRemote) {
      this.addToBuffer(entry)
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, category, message, data } = entry
    const prefix = `[${timestamp}] [${LogLevel[level]}] [${category}]`
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data)
        break
      case LogLevel.INFO:
        console.info(prefix, message, data)
        break
      case LogLevel.WARN:
        console.warn(prefix, message, data)
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, message, data)
        break
    }
  }

  private addToStorage(entry: LogEntry): void {
    this.storage.push(entry)
    
    // Mantener solo las entradas más recientes
    if (this.storage.length > this.config.maxStorageEntries) {
      this.storage = this.storage.slice(-this.config.maxStorageEntries)
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry)
    
    // Flush automático si el buffer está lleno
    if (this.buffer.length >= this.config.bufferSize) {
      this.flush()
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush()
      }
    }, this.config.flushInterval)
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const entries = [...this.buffer]
    this.buffer = []

    try {
      if (this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ logs: entries })
        })
      }
    } catch (error) {
      console.error('Failed to send logs to remote endpoint:', error)
      // Volver a agregar al buffer para reintento
      this.buffer.unshift(...entries)
    }
  }

  // Métodos públicos de logging
  public debug(message: string, data?: any, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    const entry = this.createLogEntry(LogLevel.DEBUG, LogCategory.SYSTEM, message, data, context)
    this.processLogEntry(entry)
  }

  public info(message: string, data?: any, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.SYSTEM, message, data, context)
    this.processLogEntry(entry)
  }

  public warn(message: string, data?: any, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    const entry = this.createLogEntry(LogLevel.WARN, LogCategory.SYSTEM, message, data, context)
    this.processLogEntry(entry)
  }

  public error(message: string, data?: any, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    const entry = this.createLogEntry(LogLevel.ERROR, LogCategory.ERROR, message, data, context)
    this.processLogEntry(entry)
  }

  public fatal(message: string, data?: any, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.FATAL, LogCategory.ERROR, message, data, context)
    this.processLogEntry(entry)
    // Flush inmediato para errores fatales
    this.flush()
  }

  // Métodos especializados por categoría
  public logUser(action: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.USER, `User action: ${action}`, data)
    this.processLogEntry(entry)
  }

  public logAPI(method: string, url: string, status: number, duration: number, data?: any): void {
    const entry = this.createLogEntry(
      status >= 400 ? LogLevel.ERROR : LogLevel.INFO,
      LogCategory.API,
      `API ${method} ${url} - ${status} (${duration}ms)`,
      { method, url, status, duration, ...data }
    )
    this.processLogEntry(entry)
  }

  public logSecurity(event: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, LogCategory.SECURITY, `Security event: ${event}`, data)
    this.processLogEntry(entry)
  }

  public logPerformance(metric: string, value: number, data?: any): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      LogCategory.PERFORMANCE,
      `Performance metric: ${metric} = ${value}`,
      { metric, value, ...data }
    )
    this.processLogEntry(entry)
  }

  public logBusiness(event: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, LogCategory.BUSINESS, `Business event: ${event}`, data)
    this.processLogEntry(entry)
  }

  // Métodos de utilidad
  public getStoredLogs(): LogEntry[] {
    return [...this.storage]
  }

  public clearStoredLogs(): void {
    this.storage = []
  }

  public getLogStats(): {
    totalLogs: number
    logsByLevel: Record<string, number>
    logsByCategory: Record<string, number>
  } {
    const stats = {
      totalLogs: this.storage.length,
      logsByLevel: {} as Record<string, number>,
      logsByCategory: {} as Record<string, number>
    }

    this.storage.forEach(entry => {
      const levelName = LogLevel[entry.level]
      stats.logsByLevel[levelName] = (stats.logsByLevel[levelName] || 0) + 1
      stats.logsByCategory[entry.category] = (stats.logsByCategory[entry.category] || 0) + 1
    })

    return stats
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush() // Flush final
  }
}

// Instancia singleton del logger
export const logger = new Logger()

// Hook de React para usar el logger
export const useLogger = () => {
  return {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    fatal: logger.fatal.bind(logger),
    logUser: logger.logUser.bind(logger),
    logAPI: logger.logAPI.bind(logger),
    logSecurity: logger.logSecurity.bind(logger),
    logPerformance: logger.logPerformance.bind(logger),
    logBusiness: logger.logBusiness.bind(logger),
    getStoredLogs: logger.getStoredLogs.bind(logger),
    getLogStats: logger.getLogStats.bind(logger)
  }
}

// Decorador para logging automático de funciones
export const withLogging = <T extends (...args: any[]) => any>(
  fn: T,
  category: LogCategory = LogCategory.SYSTEM
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now()
    const functionName = fn.name || 'anonymous'
    
    logger.debug(`Function ${functionName} started`, { args })
    
    try {
      const result = fn(...args)
      
      if (result instanceof Promise) {
        return result
          .then(value => {
            const duration = performance.now() - start
            logger.debug(`Function ${functionName} completed`, { duration, result: value })
            return value
          })
          .catch(error => {
            const duration = performance.now() - start
            logger.error(`Function ${functionName} failed`, { duration, error: error.message, stack: error.stack })
            throw error
          })
      } else {
        const duration = performance.now() - start
        logger.debug(`Function ${functionName} completed`, { duration, result })
        return result
      }
    } catch (error) {
      const duration = performance.now() - start
      logger.error(`Function ${functionName} failed`, { duration, error: (error as Error).message, stack: (error as Error).stack })
      throw error
    }
  }) as T
}
