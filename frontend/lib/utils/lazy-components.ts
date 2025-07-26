/**
 * Lazy loading de componentes para optimización de performance
 * Implementa code splitting automático para reducir el bundle inicial
 */

import { lazy, ComponentType } from 'react'
import { Loader2 } from 'lucide-react'

// Componente de loading personalizado
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    <span className="ml-2 text-gray-400">Cargando...</span>
  </div>
)

// Componente de error personalizado
export const ErrorFallback = ({ error, retry }: { error: Error; retry?: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-400 mb-4">
      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-white font-medium mb-2">Error al cargar componente</h3>
    <p className="text-gray-400 text-sm mb-4">{error.message}</p>
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Reintentar
      </button>
    )}
  </div>
)

// Función helper para crear lazy components con fallbacks
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ComponentType = LoadingSpinner
) => {
  return lazy(importFn)
}

// Lazy components para páginas principales
export const LazyDashboard = createLazyComponent(
  () => import('@/app/dashboard/page')
)

export const LazySolicitudes = createLazyComponent(
  () => import('@/app/dashboard/solicitudes/page')
)

export const LazyEmpleados = createLazyComponent(
  () => import('@/app/dashboard/empleados/page')
)

export const LazyReportes = createLazyComponent(
  () => import('@/app/dashboard/reportes/page')
)

export const LazyCalendario = createLazyComponent(
  () => import('@/app/dashboard/calendario/page')
)

export const LazyIA = createLazyComponent(
  () => import('@/app/dashboard/ia/page')
)

export const LazyWhatsApp = createLazyComponent(
  () => import('@/app/dashboard/whatsapp/page')
)

// Lazy components para componentes pesados
export const LazyAnalisisPredictivo = createLazyComponent(
  () => import('@/components/ia/analisis-predictivo')
)

export const LazyDashboardWhatsApp = createLazyComponent(
  () => import('@/components/whatsapp/dashboard-whatsapp')
)

export const LazyCalendarioCompleto = createLazyComponent(
  () => import('@/components/calendario/calendario-completo')
)

export const LazyReportesAvanzados = createLazyComponent(
  () => import('@/components/reportes/reportes-avanzados')
)

export const LazyExportacionCompartir = createLazyComponent(
  () => import('@/components/reportes/exportacion-compartir')
)

// Lazy components para gráficos (Recharts)
export const LazyGraficoTendencias = createLazyComponent(
  () => import('@/components/analytics/grafico-tendencias')
)

export const LazyGraficoDistribucion = createLazyComponent(
  () => import('@/components/analytics/grafico-distribucion')
)

export const LazyHeatmapCalendario = createLazyComponent(
  () => import('@/components/calendario/heatmap-calendario')
)

// Lazy components para formularios complejos
export const LazyFormularioSolicitud = createLazyComponent(
  () => import('@/components/solicitudes/formulario-solicitud')
)

export const LazyFormularioEmpleado = createLazyComponent(
  () => import('@/components/empleados/formulario-empleado')
)

// Lazy components para modales pesados
export const LazyModalDetallesSolicitud = createLazyComponent(
  () => import('@/components/solicitudes/modal-detalles-solicitud')
)

export const LazyModalPerfilEmpleado = createLazyComponent(
  () => import('@/components/empleados/modal-perfil-empleado')
)

// Preload functions para componentes críticos
export const preloadCriticalComponents = () => {
  // Precargar componentes que se usan frecuentemente
  import('@/components/solicitudes/formulario-solicitud')
  import('@/components/analytics/grafico-tendencias')
  import('@/app/dashboard/solicitudes/page')
}

// Preload functions para componentes por ruta
export const preloadComponentsForRoute = (route: string) => {
  switch (route) {
    case '/dashboard/solicitudes':
      import('@/components/solicitudes/formulario-solicitud')
      import('@/components/solicitudes/modal-detalles-solicitud')
      break
    case '/dashboard/empleados':
      import('@/components/empleados/formulario-empleado')
      import('@/components/empleados/modal-perfil-empleado')
      break
    case '/dashboard/reportes':
      import('@/components/reportes/reportes-avanzados')
      import('@/components/reportes/exportacion-compartir')
      import('@/components/analytics/grafico-tendencias')
      import('@/components/analytics/grafico-distribucion')
      break
    case '/dashboard/calendario':
      import('@/components/calendario/calendario-completo')
      import('@/components/calendario/heatmap-calendario')
      break
    case '/dashboard/ia':
      import('@/components/ia/analisis-predictivo')
      break
    case '/dashboard/whatsapp':
      import('@/components/whatsapp/dashboard-whatsapp')
      break
  }
}

// Hook para preload inteligente basado en hover
export const useIntelligentPreload = () => {
  const preloadOnHover = (route: string) => {
    return {
      onMouseEnter: () => {
        // Precargar después de un pequeño delay para evitar preloads innecesarios
        setTimeout(() => {
          preloadComponentsForRoute(route)
        }, 100)
      }
    }
  }

  return { preloadOnHover }
}

// Configuración de chunks por prioridad
export const CHUNK_PRIORITIES = {
  // Críticos - cargar inmediatamente
  critical: [
    'dashboard',
    'solicitudes-list',
    'navigation'
  ],
  
  // Importantes - cargar con prioridad alta
  important: [
    'formulario-solicitud',
    'empleados-list',
    'analytics-basic'
  ],
  
  // Normales - cargar bajo demanda
  normal: [
    'reportes-avanzados',
    'calendario-completo',
    'ia-procesamiento'
  ],
  
  // Opcionales - cargar solo cuando se necesiten
  optional: [
    'whatsapp-dashboard',
    'exportacion-avanzada',
    'configuracion-sistema'
  ]
}

// Función para optimizar imports dinámicos
export const optimizedImport = async <T>(
  importFn: () => Promise<T>,
  priority: keyof typeof CHUNK_PRIORITIES = 'normal'
): Promise<T> => {
  // Agregar delay para componentes de baja prioridad
  if (priority === 'optional') {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  try {
    return await importFn()
  } catch (error) {
    console.error('Error loading component:', error)
    throw error
  }
}

// Configuración de Service Worker para cache de chunks
export const SW_CACHE_CONFIG = {
  // Cache de chunks críticos
  criticalChunks: {
    strategy: 'CacheFirst',
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  },
  
  // Cache de chunks normales
  normalChunks: {
    strategy: 'StaleWhileRevalidate',
    maxAge: 60 * 60 * 24 * 3, // 3 días
  },
  
  // Cache de chunks opcionales
  optionalChunks: {
    strategy: 'NetworkFirst',
    maxAge: 60 * 60 * 24, // 1 día
  }
}

// Métricas de performance para lazy loading
export const trackLazyLoadingMetrics = (componentName: string, loadTime: number) => {
  // En producción, enviar métricas a servicio de analytics
  if (process.env.NODE_ENV === 'production') {
    // Analytics tracking
    console.log(`Lazy component ${componentName} loaded in ${loadTime}ms`)
  }
}

// Función para medir performance de lazy loading
export const measureLazyLoad = async <T>(
  componentName: string,
  importFn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now()
  
  try {
    const component = await importFn()
    const loadTime = performance.now() - startTime
    
    trackLazyLoadingMetrics(componentName, loadTime)
    
    return component
  } catch (error) {
    const loadTime = performance.now() - startTime
    console.error(`Failed to load ${componentName} after ${loadTime}ms:`, error)
    throw error
  }
}
