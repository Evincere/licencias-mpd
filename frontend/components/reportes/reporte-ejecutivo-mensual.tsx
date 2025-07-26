'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import type { ReporteEjecutivoMensual } from '@/lib/types/reportes'

interface ReporteEjecutivoMensualProps {
  reporte: ReporteEjecutivoMensual
}

export function ReporteEjecutivoMensualComponent({ reporte }: ReporteEjecutivoMensualProps) {
  const { datos } = reporte

  // Formatear porcentaje de cambio
  const formatearCambio = (cambio: number) => {
    const esPositivo = cambio > 0
    const Icon = esPositivo ? TrendingUp : TrendingDown
    const color = esPositivo ? 'text-green-400' : 'text-red-400'
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-4 h-4" />
        <span>{Math.abs(cambio).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del reporte */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            {reporte.nombre}
          </CardTitle>
          <div className="text-gray-400 text-sm">
            Período: {reporte.parametros.fechaInicio.toLocaleDateString('es-AR')} - {reporte.parametros.fechaFin.toLocaleDateString('es-AR')}
          </div>
        </CardHeader>
      </Card>

      {/* Resumen General */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Resumen General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-2xl">
                    {datos.resumenGeneral.totalSolicitudes}
                  </div>
                  <div className="text-gray-400 text-sm">Total Solicitudes</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-2xl">
                    {datos.resumenGeneral.tasaAprobacion.toFixed(1)}%
                  </div>
                  <div className="text-gray-400 text-sm">Tasa de Aprobación</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-2xl">
                    {datos.resumenGeneral.tiempoPromedioResolucion.toFixed(1)}d
                  </div>
                  <div className="text-gray-400 text-sm">Tiempo Promedio</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-2xl">
                    {datos.resumenGeneral.solicitudesRechazadas}
                  </div>
                  <div className="text-gray-400 text-sm">Rechazadas</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparativa con mes anterior */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Comparativa con Mes Anterior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Solicitudes</div>
                  <div className="text-white font-bold text-xl">
                    {datos.comparativaMesAnterior.solicitudes.actual}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Anterior: {datos.comparativaMesAnterior.solicitudes.anterior}
                  </div>
                </div>
                {formatearCambio(datos.comparativaMesAnterior.solicitudes.cambio)}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Aprobaciones</div>
                  <div className="text-white font-bold text-xl">
                    {datos.comparativaMesAnterior.aprobaciones.actual}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Anterior: {datos.comparativaMesAnterior.aprobaciones.anterior}
                  </div>
                </div>
                {formatearCambio(datos.comparativaMesAnterior.aprobaciones.cambio)}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Tiempo Resolución</div>
                  <div className="text-white font-bold text-xl">
                    {datos.comparativaMesAnterior.tiempoResolucion.actual.toFixed(1)}d
                  </div>
                  <div className="text-gray-400 text-xs">
                    Anterior: {datos.comparativaMesAnterior.tiempoResolucion.anterior.toFixed(1)}d
                  </div>
                </div>
                {formatearCambio(datos.comparativaMesAnterior.tiempoResolucion.cambio)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas por Tipo de Licencia */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Métricas por Tipo de Licencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datos.metricasPorTipo.map((metrica, index) => (
              <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{metrica.tipoLicencia}</div>
                    <div className="text-gray-400 text-sm">
                      {metrica.cantidad} solicitudes • {metrica.diasPromedio.toFixed(1)} días promedio
                    </div>
                  </div>
                  <Badge className={`${
                    metrica.tendencia === 'ascendente' ? 'bg-green-500/20 text-green-300' :
                    metrica.tendencia === 'descendente' ? 'bg-red-500/20 text-red-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {metrica.tendencia}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas por Área */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Métricas por Área</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datos.metricasPorArea.map((area, index) => (
              <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-medium">{area.area}</div>
                    <div className="text-gray-400 text-sm">
                      {area.totalSolicitudes} solicitudes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      Eficiencia: {area.eficiencia.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Barra de cobertura */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Cobertura</span>
                    <span className="text-white">{area.cobertura.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        area.cobertura >= 90 ? 'bg-green-500' :
                        area.cobertura >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${area.cobertura}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {datos.alertas.length > 0 && (
        <Card className="glass-card border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Alertas y Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {datos.alertas.map((alerta, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alerta.severidad === 'alta' ? 'bg-red-500/20 border-red-500/30' :
                  alerta.severidad === 'media' ? 'bg-yellow-500/20 border-yellow-500/30' :
                  'bg-blue-500/20 border-blue-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      alerta.severidad === 'alta' ? 'text-red-400' :
                      alerta.severidad === 'media' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                    <div>
                      <div className="text-white font-medium">{alerta.tipo}</div>
                      <div className="text-gray-300 text-sm">{alerta.descripcion}</div>
                    </div>
                    <Badge className={`ml-auto ${
                      alerta.severidad === 'alta' ? 'bg-red-500/20 text-red-300' :
                      alerta.severidad === 'media' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {alerta.severidad}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadatos del reporte */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              Generado: {reporte.fechaGeneracion.toLocaleString('es-AR')}
            </div>
            <div>
              {reporte.metadatos.totalRegistros} registros procesados en {(reporte.metadatos.tiempoGeneracion / 1000).toFixed(1)}s
            </div>
            <div>
              Versión: {reporte.metadatos.version}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
