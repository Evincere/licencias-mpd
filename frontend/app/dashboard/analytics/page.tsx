'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  AlertTriangle,
  Target,
  Activity
} from 'lucide-react'
import { ReportesService } from '@/lib/api/reportes'
import type { MetricasAnalytics, FiltrosReporte } from '@/lib/types/reportes'
import { GraficosAnalytics } from '@/components/analytics/graficos-analytics'
import { MetricasKPI } from '@/components/analytics/metricas-kpi'
import { FiltrosAnalytics } from '@/components/analytics/filtros-analytics'
import { ExportacionCompartir } from '@/components/reportes/exportacion-compartir'

export default function AnalyticsPage() {
  // Estados principales
  const [metricas, setMetricas] = useState<MetricasAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    fechaInicio: new Date(new Date().getFullYear(), 0, 1), // Inicio del año
    fechaFin: new Date()
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [mostrarExportacion, setMostrarExportacion] = useState(false)
  const [periodoComparacion, setPeriodoComparacion] = useState<'mes' | 'año'>('mes')

  // Cargar métricas de analytics
  const cargarMetricas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const datos = await ReportesService.obtenerMetricasAnalytics(filtros)
      setMetricas(datos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar analytics')
      console.error('Error cargando analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarMetricas()
  }, [filtros])

  // Exportar dashboard
  const exportarDashboard = async () => {
    try {
      setMostrarExportacion(true)
    } catch (err) {
      console.error('Error exportando dashboard:', err)
    }
  }

  // Calcular cambio porcentual
  const calcularCambio = (actual: number, anterior: number): { valor: number, esPositivo: boolean } => {
    // Validaciones defensivas
    if (!actual || !anterior || anterior === 0) {
      return { valor: 0, esPositivo: true }
    }

    const cambio = ((actual - anterior) / anterior) * 100
    return {
      valor: Math.abs(cambio),
      esPositivo: cambio > 0
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              <span className="ml-3 text-gray-300">Cargando analytics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">
            Dashboard interactivo con métricas y análisis avanzados
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            variant="outline"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button 
            onClick={cargarMetricas}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button 
            onClick={exportarDashboard}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <FiltrosAnalytics
          filtros={filtros}
          onChange={setFiltros}
          onClose={() => setMostrarFiltros(false)}
        />
      )}

      {/* Error */}
      {error && (
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs Principales */}
      {metricas && (
        <>
          <MetricasKPI 
            metricas={metricas} 
            periodoComparacion={periodoComparacion}
            onCambioPeriodo={setPeriodoComparacion}
          />

          {/* Gráficos Principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencias Mensuales */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendencias Mensuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GraficosAnalytics 
                  tipo="tendencias"
                  datos={metricas.tendencias}
                />
              </CardContent>
            </Card>

            {/* Distribución por Tipo */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Distribución por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GraficosAnalytics 
                  tipo="distribucion"
                  datos={metricas.distribucion.porTipoLicencia}
                />
              </CardContent>
            </Card>
          </div>

          {/* Métricas Detalladas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Distribución por Área */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Por Área
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metricas.distribucion.porArea.map((area, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">{area.area}</div>
                        <div className="text-gray-400 text-xs">{area.cantidad} solicitudes</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{area.porcentaje.toFixed(1)}%</div>
                        <div className="w-16 bg-gray-700 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-primary-500 h-1.5 rounded-full"
                            style={{ width: `${area.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribución por Estado */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metricas.distribucion.porEstado.map((estado, index) => {
                    const getColorEstado = (estado: string) => {
                      switch (estado.toLowerCase()) {
                        case 'aprobada': return 'bg-green-500'
                        case 'pendiente': return 'bg-yellow-500'
                        case 'rechazada': return 'bg-red-500'
                        default: return 'bg-gray-500'
                      }
                    }

                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getColorEstado(estado.estado)}`}></div>
                          <div>
                            <div className="text-white text-sm font-medium">{estado.estado}</div>
                            <div className="text-gray-400 text-xs">{estado.cantidad} solicitudes</div>
                          </div>
                        </div>
                        <div className="text-white font-bold">{estado.porcentaje.toFixed(1)}%</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Comparativas */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Comparativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">vs Mes Anterior</div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Solicitudes</span>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const cambio = calcularCambio(
                            metricas.kpis.totalSolicitudes, 
                            metricas.comparativas.mesAnterior.solicitudes
                          )
                          return (
                            <>
                              <span className={`text-sm font-medium ${
                                cambio.esPositivo ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {cambio.esPositivo ? '+' : '-'}{cambio.valor.toFixed(1)}%
                              </span>
                              {cambio.esPositivo ? 
                                <TrendingUp className="w-3 h-3 text-green-400" /> : 
                                <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
                              }
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">vs Año Anterior</div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Eficiencia</span>
                      <div className="flex items-center gap-1">
                        <span className="text-green-400 text-sm font-medium">
                          +{(metricas.comparativas.cambios.eficiencia || 0).toFixed(1)}%
                        </span>
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Tiempo Resolución</div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Mejora</span>
                      <div className="flex items-center gap-1">
                        <span className="text-green-400 text-sm font-medium">
                          {Math.abs(metricas.comparativas.cambios.tiempo || 0).toFixed(1)}%
                        </span>
                        <TrendingUp className="w-3 h-3 text-green-400 rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendencias Detallado */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Análisis de Tendencias Detallado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GraficosAnalytics 
                tipo="tendencias_detallado"
                datos={{
                  solicitudes: metricas.tendencias.solicitudesMensuales,
                  aprobaciones: metricas.tendencias.aprobacionesMensuales,
                  tiempos: metricas.tendencias.tiemposResolucion
                }}
              />
            </CardContent>
          </Card>

          {/* Alertas y Recomendaciones */}
          <Card className="glass-card border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Alertas y Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Alertas automáticas basadas en métricas */}
                {metricas.kpis.tasaAprobacion < 85 && (
                  <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-medium">Tasa de Aprobación Baja</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                      La tasa de aprobación ({metricas.kpis.tasaAprobacion.toFixed(1)}%) está por debajo del objetivo del 85%.
                    </p>
                  </div>
                )}

                {metricas.kpis.tiempoPromedioResolucion > 3 && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Tiempo de Resolución Alto</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                      El tiempo promedio de resolución ({metricas.kpis.tiempoPromedioResolucion.toFixed(1)} días) supera el objetivo de 3 días.
                    </p>
                  </div>
                )}

                {metricas.kpis.eficienciaOperativa > 90 && (
                  <div className="bg-green-500/20 border border-green-500/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">Excelente Eficiencia</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                      La eficiencia operativa ({metricas.kpis.eficienciaOperativa.toFixed(1)}%) supera el objetivo del 90%.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Modal de exportación */}
          {mostrarExportacion && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="max-w-2xl w-full mx-4">
                <ExportacionCompartir
                  metricas={metricas}
                  tipo="dashboard"
                  onClose={() => setMostrarExportacion(false)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
