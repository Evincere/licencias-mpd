'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  AlertTriangle,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { CalendarioService } from '@/lib/api/calendario'
import type { 
  HeatmapData, 
  AnalisisPatrones, 
  EstadisticasCalendario 
} from '@/lib/types/calendario'

export default function CalendarioAnalyticsPage() {
  const router = useRouter()
  
  // Estados principales
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [patrones, setPatrones] = useState<AnalisisPatrones | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasCalendario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear())

  // Cargar datos de analytics
  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [heatmap, analisis, stats] = await Promise.all([
        CalendarioService.obtenerHeatmap(añoSeleccionado),
        CalendarioService.obtenerAnalisisPatrones(),
        CalendarioService.obtenerEstadisticas()
      ])
      
      setHeatmapData(heatmap)
      setPatrones(analisis)
      setEstadisticas(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar analytics')
      console.error('Error cargando analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [añoSeleccionado])

  // Generar heatmap visual
  const generarHeatmap = () => {
    const meses = Array.from({ length: 12 }, (_, i) => i)
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Heatmap de Licencias {añoSeleccionado}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAñoSeleccionado(añoSeleccionado - 1)}
            >
              {añoSeleccionado - 1}
            </Button>
            <span className="text-white font-medium">{añoSeleccionado}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAñoSeleccionado(añoSeleccionado + 1)}
              disabled={añoSeleccionado >= new Date().getFullYear()}
            >
              {añoSeleccionado + 1}
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-lg overflow-x-auto">
          <div className="grid grid-cols-53 gap-1 min-w-[800px]">
            {/* Generar cuadrícula del heatmap */}
            {Array.from({ length: 53 * 7 }, (_, index) => {
              const fecha = new Date(añoSeleccionado, 0, 1)
              fecha.setDate(fecha.getDate() + index)
              
              const dataPoint = heatmapData.find(d => 
                d.fecha.toDateString() === fecha.toDateString()
              )
              
              const intensidad = dataPoint?.valor || 0
              const tipo = dataPoint?.tipo || 'bajo'
              
              const getColor = () => {
                switch (tipo) {
                  case 'bajo': return 'bg-gray-700'
                  case 'medio': return 'bg-blue-500/40'
                  case 'alto': return 'bg-blue-500/70'
                  case 'critico': return 'bg-red-500/70'
                  default: return 'bg-gray-700'
                }
              }
              
              return (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-sm ${getColor()} cursor-pointer hover:opacity-80`}
                  title={`${fecha.toLocaleDateString('es-AR')}: ${intensidad.toFixed(1)} eventos`}
                />
              )
            })}
          </div>
          
          {/* Leyenda */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
            <span>Menos</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-500/40 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-500/70 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-500/70 rounded-sm"></div>
            </div>
            <span>Más</span>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-white">Analytics del Calendario</h1>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics del Calendario</h1>
            <p className="text-gray-400 mt-1">Análisis de patrones y tendencias de licencias</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={cargarDatos} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

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

      {/* Métricas principales */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-white font-bold text-2xl">{estadisticas.totalEventos}</div>
                  <div className="text-gray-400 text-sm">Total Eventos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-white font-bold text-2xl">{estadisticas.coberturaPromedio.toFixed(1)}%</div>
                  <div className="text-gray-400 text-sm">Cobertura Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-white font-bold text-2xl">
                    {estadisticas.tendencias.cambioMensual > 0 ? '+' : ''}
                    {estadisticas.tendencias.cambioMensual.toFixed(1)}%
                  </div>
                  <div className="text-gray-400 text-sm">Cambio Mensual</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <div className="text-white font-bold text-2xl">{estadisticas.conflictosActivos}</div>
                  <div className="text-gray-400 text-sm">Conflictos Activos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Heatmap */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Heatmap de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generarHeatmap()}
        </CardContent>
      </Card>

      {/* Patrones estacionales */}
      {patrones && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Patrones Estacionales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patrones.patronesEstacionales.map((patron) => (
                  <div key={patron.mes} className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">
                          {new Date(2024, patron.mes - 1).toLocaleDateString('es-AR', { month: 'long' })}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Promedio: {patron.promedio} • Pico: {patron.pico}
                        </div>
                      </div>
                      <Badge className={`${
                        patron.tendencia === 'ascendente' ? 'bg-green-500/20 text-green-300' :
                        patron.tendencia === 'descendente' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {patron.tendencia}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Recomendaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patrones.recomendaciones.map((rec, index) => (
                  <div key={index} className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge className={`${
                        rec.prioridad === 'alta' ? 'bg-red-500/20 text-red-300' :
                        rec.prioridad === 'media' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {rec.prioridad}
                      </Badge>
                      <div>
                        <div className="text-white font-medium text-sm">{rec.tipo}</div>
                        <div className="text-gray-400 text-sm">{rec.descripcion}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Días críticos */}
      {patrones && patrones.diasCriticos.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Días Críticos Identificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patrones.diasCriticos.map((dia, index) => (
                <div key={index} className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        {dia.fecha.toLocaleDateString('es-AR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                      <div className="text-gray-400 text-sm">{dia.motivo}</div>
                    </div>
                    <div className="text-red-400 font-bold">
                      Impacto: {dia.impacto.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
