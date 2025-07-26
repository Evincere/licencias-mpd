'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Brain,
  BarChart3,
  Users,
  Calendar,
  Zap,
  Eye
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface PrediccionSolicitud {
  id: string
  empleado: string
  tipo: string
  probabilidadAprobacion: number
  factoresRiesgo: string[]
  recomendaciones: string[]
  tiempoEstimado: number
  confianza: number
}

interface PatronDetectado {
  tipo: string
  descripcion: string
  frecuencia: number
  impacto: 'alto' | 'medio' | 'bajo'
  tendencia: 'creciente' | 'estable' | 'decreciente'
}

interface MetricasPredictivas {
  precisión: number
  solicitudesProcesadas: number
  patronesDetectados: number
  tiempoAhorrado: number
}

export function AnalisisPredictivo() {
  // Estados principales
  const [predicciones, setPredicciones] = useState<PrediccionSolicitud[]>([])
  const [patrones, setPatrones] = useState<PatronDetectado[]>([])
  const [metricas, setMetricas] = useState<MetricasPredictivas | null>(null)
  const [cargando, setCargando] = useState(true)

  // Cargar datos simulados
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true)
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Predicciones simuladas
      const prediccionesSimuladas: PrediccionSolicitud[] = [
        {
          id: '1',
          empleado: 'María García',
          tipo: 'Licencia Anual',
          probabilidadAprobacion: 92,
          factoresRiesgo: [],
          recomendaciones: ['Aprobación automática recomendada'],
          tiempoEstimado: 1,
          confianza: 0.95
        },
        {
          id: '2',
          empleado: 'Carlos López',
          tipo: 'Licencia por Enfermedad',
          probabilidadAprobacion: 78,
          factoresRiesgo: ['Falta documentación médica'],
          recomendaciones: ['Solicitar certificado médico actualizado'],
          tiempoEstimado: 3,
          confianza: 0.82
        },
        {
          id: '3',
          empleado: 'Ana Rodríguez',
          tipo: 'Licencia Especial',
          probabilidadAprobacion: 65,
          factoresRiesgo: ['Período de alta demanda', 'Solicitud de larga duración'],
          recomendaciones: ['Revisar disponibilidad del área', 'Considerar fraccionamiento'],
          tiempoEstimado: 5,
          confianza: 0.73
        }
      ]
      
      // Patrones detectados
      const patronesDetectados: PatronDetectado[] = [
        {
          tipo: 'Estacional',
          descripcion: 'Incremento de solicitudes en diciembre-enero',
          frecuencia: 85,
          impacto: 'alto',
          tendencia: 'creciente'
        },
        {
          tipo: 'Área específica',
          descripcion: 'Defensoría Civil con mayor tasa de rechazos',
          frecuencia: 23,
          impacto: 'medio',
          tendencia: 'estable'
        },
        {
          tipo: 'Temporal',
          descripción: 'Solicitudes de viernes tienen menor aprobación',
          frecuencia: 34,
          impacto: 'bajo',
          tendencia: 'decreciente'
        }
      ]
      
      // Métricas
      const metricasSimuladas: MetricasPredictivas = {
        precisión: 94.2,
        solicitudesProcesadas: 1247,
        patronesDetectados: 12,
        tiempoAhorrado: 156
      }
      
      setPredicciones(prediccionesSimuladas)
      setPatrones(patronesDetectados)
      setMetricas(metricasSimuladas)
      setCargando(false)
    }
    
    cargarDatos()
  }, [])

  // Datos para gráficos
  const datosTendencia = [
    { mes: 'Ene', aprobaciones: 89, rechazos: 11 },
    { mes: 'Feb', aprobaciones: 92, rechazos: 8 },
    { mes: 'Mar', aprobaciones: 87, rechazos: 13 },
    { mes: 'Abr', aprobaciones: 94, rechazos: 6 },
    { mes: 'May', aprobaciones: 91, rechazos: 9 },
    { mes: 'Jun', aprobaciones: 88, rechazos: 12 }
  ]

  const datosDistribucion = [
    { name: 'Aprobadas', value: 87, color: '#10b981' },
    { name: 'Pendientes', value: 8, color: '#f59e0b' },
    { name: 'Rechazadas', value: 5, color: '#ef4444' }
  ]

  // Obtener color de probabilidad
  const obtenerColorProbabilidad = (probabilidad: number): string => {
    if (probabilidad >= 85) return 'text-green-400'
    if (probabilidad >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Obtener color de impacto
  const obtenerColorImpacto = (impacto: string): string => {
    switch (impacto) {
      case 'alto': return 'bg-red-500/20 text-red-300'
      case 'medio': return 'bg-yellow-500/20 text-yellow-300'
      case 'bajo': return 'bg-green-500/20 text-green-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Análisis Predictivo</h2>
            <p className="text-gray-400 text-sm">Cargando modelos de IA...</p>
          </div>
        </div>
        
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <span className="ml-3 text-gray-300">Analizando patrones y tendencias...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Análisis Predictivo</h2>
          <p className="text-gray-400 text-sm">
            Predicciones inteligentes y detección de patrones
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {metricas.precisión}%
                  </div>
                  <div className="text-gray-400 text-xs">Precisión del Modelo</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {metricas.solicitudesProcesadas}
                  </div>
                  <div className="text-gray-400 text-xs">Solicitudes Analizadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {metricas.patronesDetectados}
                  </div>
                  <div className="text-gray-400 text-xs">Patrones Detectados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {metricas.tiempoAhorrado}h
                  </div>
                  <div className="text-gray-400 text-xs">Tiempo Ahorrado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predicciones de solicitudes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Predicciones de Solicitudes Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predicciones.map((prediccion) => (
              <div key={prediccion.id} className="bg-gray-800/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-medium">{prediccion.empleado}</div>
                    <div className="text-gray-400 text-sm">{prediccion.tipo}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${obtenerColorProbabilidad(prediccion.probabilidadAprobacion)}`}>
                      {prediccion.probabilidadAprobacion}% probabilidad
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300">
                      {prediccion.tiempoEstimado}d estimado
                    </Badge>
                  </div>
                </div>

                {prediccion.factoresRiesgo.length > 0 && (
                  <div className="mb-3">
                    <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Factores de Riesgo:
                    </div>
                    <div className="space-y-1">
                      {prediccion.factoresRiesgo.map((factor, index) => (
                        <div key={index} className="text-yellow-400 text-sm">
                          • {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-gray-300 text-sm mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Recomendaciones:
                  </div>
                  <div className="space-y-1">
                    {prediccion.recomendaciones.map((recomendacion, index) => (
                      <div key={index} className="text-green-400 text-sm">
                        • {recomendacion}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Badge className={`${
                    prediccion.confianza >= 0.9 ? 'bg-green-500/20 text-green-300' :
                    prediccion.confianza >= 0.7 ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    Confianza: {(prediccion.confianza * 100).toFixed(0)}%
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Aplicar Recomendación
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de aprobaciones */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tendencia de Aprobaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={datosTendencia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="aprobaciones" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rechazos" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución actual */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Distribución Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={datosDistribucion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosDistribucion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Patrones detectados */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Patrones Detectados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patrones.map((patron, index) => (
              <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">{patron.tipo}</div>
                  <Badge className={obtenerColorImpacto(patron.impacto)}>
                    {patron.impacto}
                  </Badge>
                </div>
                <div className="text-gray-400 text-sm mb-3">
                  {patron.descripcion}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-white text-sm">
                    Frecuencia: {patron.frecuencia}%
                  </div>
                  <div className="flex items-center gap-1">
                    {patron.tendencia === 'creciente' ? (
                      <TrendingUp className="w-4 h-4 text-red-400" />
                    ) : patron.tendencia === 'decreciente' ? (
                      <TrendingDown className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    )}
                    <span className="text-xs text-gray-400 capitalize">
                      {patron.tendencia}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
