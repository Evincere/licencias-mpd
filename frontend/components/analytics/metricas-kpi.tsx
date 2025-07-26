'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  CheckCircle,
  Clock,
  Users,
  Target,
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import type { MetricasAnalytics } from '@/lib/types/reportes'
import { MiniGraficoTendencia } from './graficos-analytics'

interface MetricasKPIProps {
  metricas: MetricasAnalytics
  periodoComparacion: 'mes' | 'año'
  onCambioPeriodo: (periodo: 'mes' | 'año') => void
}

export function MetricasKPI({ metricas, periodoComparacion, onCambioPeriodo }: MetricasKPIProps) {
  
  // Obtener datos de comparación según el período
  const obtenerComparacion = (metrica: keyof typeof metricas.comparativas.mesAnterior) => {
    const actual = metricas.kpis[metrica as keyof typeof metricas.kpis] as number
    const anterior = periodoComparacion === 'mes' 
      ? metricas.comparativas.mesAnterior[metrica]
      : metricas.comparativas.añoAnterior[metrica]
    
    const cambio = ((actual - anterior) / anterior) * 100
    
    return {
      actual,
      anterior,
      cambio,
      esPositivo: cambio > 0
    }
  }

  // Formatear número con separadores de miles
  const formatearNumero = (numero: number): string => {
    return numero.toLocaleString('es-AR')
  }

  // Obtener color según el valor y tipo de métrica
  const obtenerColorMetrica = (valor: number, tipo: string): string => {
    switch (tipo) {
      case 'tasaAprobacion':
        return valor >= 90 ? 'text-green-400' : valor >= 80 ? 'text-yellow-400' : 'text-red-400'
      case 'tiempoResolucion':
        return valor <= 2 ? 'text-green-400' : valor <= 3 ? 'text-yellow-400' : 'text-red-400'
      case 'satisfaccion':
        return valor >= 95 ? 'text-green-400' : valor >= 85 ? 'text-yellow-400' : 'text-red-400'
      case 'eficiencia':
        return valor >= 90 ? 'text-green-400' : valor >= 80 ? 'text-yellow-400' : 'text-red-400'
      case 'cumplimiento':
        return valor >= 95 ? 'text-green-400' : valor >= 90 ? 'text-yellow-400' : 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  // Datos para mini gráficos de tendencia
  const tendenciaSolicitudes = metricas.tendencias.solicitudesMensuales.map(item => item.valor)
  const tendenciaAprobaciones = metricas.tendencias.aprobacionesMensuales.map(item => item.valor)
  const tendenciaTiempos = metricas.tendencias.tiemposResolucion.map(item => item.valor)

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Comparar con:</span>
        <Button
          variant={periodoComparacion === 'mes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCambioPeriodo('mes')}
        >
          Mes Anterior
        </Button>
        <Button
          variant={periodoComparacion === 'año' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCambioPeriodo('año')}
        >
          Año Anterior
        </Button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Total Solicitudes */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-lg">
                  {formatearNumero(metricas.kpis.totalSolicitudes)}
                </div>
                <div className="text-gray-400 text-xs">Total Solicitudes</div>
                
                {/* Comparación */}
                {(() => {
                  const comp = obtenerComparacion('solicitudes')
                  return (
                    <div className={`flex items-center gap-1 text-xs ${
                      comp.esPositivo ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {comp.esPositivo ? 
                        <TrendingUp className="w-3 h-3" /> : 
                        <TrendingDown className="w-3 h-3" />
                      }
                      <span>{Math.abs(comp.cambio).toFixed(1)}%</span>
                    </div>
                  )
                })()}
              </div>
            </div>
            
            {/* Mini gráfico de tendencia */}
            <div className="mt-2">
              <MiniGraficoTendencia datos={tendenciaSolicitudes} color="#3b82f6" />
            </div>
          </CardContent>
        </Card>

        {/* Tasa de Aprobación */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <div className={`font-bold text-lg ${obtenerColorMetrica(metricas.kpis.tasaAprobacion, 'tasaAprobacion')}`}>
                  {metricas.kpis.tasaAprobacion.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs">Tasa Aprobación</div>
                
                {/* Indicador de objetivo */}
                <Badge className={`text-xs ${
                  metricas.kpis.tasaAprobacion >= 85 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  Objetivo: 85%
                </Badge>
              </div>
            </div>
            
            <div className="mt-2">
              <MiniGraficoTendencia datos={tendenciaAprobaciones} color="#10b981" />
            </div>
          </CardContent>
        </Card>

        {/* Tiempo Promedio de Resolución */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className={`font-bold text-lg ${obtenerColorMetrica(metricas.kpis.tiempoPromedioResolucion, 'tiempoResolucion')}`}>
                  {metricas.kpis.tiempoPromedioResolucion.toFixed(1)}d
                </div>
                <div className="text-gray-400 text-xs">Tiempo Resolución</div>
                
                <Badge className={`text-xs ${
                  metricas.kpis.tiempoPromedioResolucion <= 3 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  Objetivo: ≤3d
                </Badge>
              </div>
            </div>
            
            <div className="mt-2">
              <MiniGraficoTendencia datos={tendenciaTiempos} color="#f59e0b" />
            </div>
          </CardContent>
        </Card>

        {/* Satisfacción del Usuario */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className={`font-bold text-lg ${obtenerColorMetrica(metricas.kpis.satisfaccionUsuario, 'satisfaccion')}`}>
                  {metricas.kpis.satisfaccionUsuario.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs">Satisfacción</div>
                
                <Badge className={`text-xs ${
                  metricas.kpis.satisfaccionUsuario >= 90 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  Objetivo: 90%
                </Badge>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${metricas.kpis.satisfaccionUsuario}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eficiencia Operativa */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className={`font-bold text-lg ${obtenerColorMetrica(metricas.kpis.eficienciaOperativa, 'eficiencia')}`}>
                  {metricas.kpis.eficienciaOperativa.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs">Eficiencia</div>
                
                <Badge className={`text-xs ${
                  metricas.kpis.eficienciaOperativa >= 90 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  Objetivo: 90%
                </Badge>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${metricas.kpis.eficienciaOperativa}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cumplimiento Normativo */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className={`font-bold text-lg ${obtenerColorMetrica(metricas.kpis.cumplimientoNormativo, 'cumplimiento')}`}>
                  {metricas.kpis.cumplimientoNormativo.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs">Cumplimiento</div>
                
                <Badge className={`text-xs ${
                  metricas.kpis.cumplimientoNormativo >= 95 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  Objetivo: 95%
                </Badge>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${metricas.kpis.cumplimientoNormativo}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
