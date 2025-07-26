'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  BarChart3,
  Users,
  Building,
  TrendingUp,
  Shield,
  Clock,
  RefreshCw,
  Settings
} from 'lucide-react'
import { ReportesService } from '@/lib/api/reportes'
import type { 
  TipoReporte, 
  FiltrosReporte, 
  ConfiguracionReporte,
  RespuestaGeneracionReporte
} from '@/lib/types/reportes'
import { TIPOS_REPORTE } from '@/lib/types/reportes'
import { ExportacionCompartir } from '@/components/reportes/exportacion-compartir'

export default function ReportesPage() {
  // Estados principales
  const [reportesDisponibles, setReportesDisponibles] = useState<ConfiguracionReporte[]>([])
  const [reporteGenerado, setReporteGenerado] = useState<RespuestaGeneracionReporte | null>(null)
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    fechaFin: new Date()
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [mostrarExportacion, setMostrarExportacion] = useState(false)

  // Cargar reportes disponibles
  const cargarReportesDisponibles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const reportes = await ReportesService.obtenerReportesDisponibles()
      setReportesDisponibles(reportes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reportes')
      console.error('Error cargando reportes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarReportesDisponibles()
  }, [])

  // Generar reporte
  const generarReporte = async (tipo: TipoReporte) => {
    try {
      setGenerando(tipo)
      setError(null)
      
      const respuesta = await ReportesService.generarReporte(tipo, filtros)
      setReporteGenerado(respuesta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar reporte')
      console.error('Error generando reporte:', err)
    } finally {
      setGenerando(null)
    }
  }

  // Descargar reporte
  const descargarReporte = async (reporteId: string, formato: 'pdf' | 'excel') => {
    try {
      const blob = await ReportesService.exportarReporte(reporteId, {
        formato,
        incluirGraficos: true,
        incluirDatos: true,
        incluirMetadatos: true
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_${reporteId}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error descargando reporte:', err)
    }
  }

  // Obtener icono por tipo de reporte
  const getIconoReporte = (tipo: TipoReporte) => {
    switch (tipo) {
      case 'ejecutivo_mensual': return BarChart3
      case 'cumplimiento_normativo': return Shield
      case 'area_departamento': return Building
      case 'empleado_individual': return Users
      case 'tendencias_anuales': return TrendingUp
      default: return FileText
    }
  }

  // Obtener color por tipo de reporte
  const getColorReporte = (tipo: TipoReporte) => {
    switch (tipo) {
      case 'ejecutivo_mensual': return 'text-blue-400'
      case 'cumplimiento_normativo': return 'text-green-400'
      case 'area_departamento': return 'text-purple-400'
      case 'empleado_individual': return 'text-yellow-400'
      case 'tendencias_anuales': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Reportes</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              <span className="ml-3 text-gray-300">Cargando reportes...</span>
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
          <h1 className="text-3xl font-bold text-white">Reportes</h1>
          <p className="text-gray-400 mt-1">
            Genera reportes detallados y análisis de datos
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
            onClick={cargarReportesDisponibles}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaInicio" className="text-gray-300">
                  Fecha de Inicio
                </Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={filtros.fechaInicio.toISOString().split('T')[0]}
                  onChange={(e) => setFiltros(prev => ({
                    ...prev,
                    fechaInicio: new Date(e.target.value)
                  }))}
                  className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="fechaFin" className="text-gray-300">
                  Fecha de Fin
                </Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={filtros.fechaFin.toISOString().split('T')[0]}
                  onChange={(e) => setFiltros(prev => ({
                    ...prev,
                    fechaFin: new Date(e.target.value)
                  }))}
                  className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <FileText className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reporte generado */}
      {reporteGenerado && (
        <Card className="glass-card border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Reporte Generado Exitosamente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{reporteGenerado.reporte.nombre}</div>
                  <div className="text-gray-400 text-sm">
                    Generado: {reporteGenerado.reporte.fechaGeneracion.toLocaleString('es-AR')}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Tiempo: {(reporteGenerado.tiempoGeneracion / 1000).toFixed(1)}s • 
                    Registros: {reporteGenerado.reporte.metadatos.totalRegistros}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => descargarReporte(reporteGenerado.reporte.id, 'pdf')}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => descargarReporte(reporteGenerado.reporte.id, 'excel')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={() => setMostrarExportacion(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Más Opciones
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de exportación */}
      {mostrarExportacion && reporteGenerado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full mx-4">
            <ExportacionCompartir
              reporte={reporteGenerado.reporte}
              tipo="reporte"
              onClose={() => setMostrarExportacion(false)}
            />
          </div>
        </div>
      )}

      {/* Lista de reportes disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(TIPOS_REPORTE).map(([tipo, nombre]) => {
          const IconoReporte = getIconoReporte(tipo as TipoReporte)
          const colorReporte = getColorReporte(tipo as TipoReporte)
          const estaGenerando = generando === tipo
          
          return (
            <Card key={tipo} className="glass-card hover:bg-gray-800/30 transition-colors">
              <CardHeader>
                <CardTitle className={`text-white flex items-center gap-2 ${colorReporte}`}>
                  <IconoReporte className="w-6 h-6" />
                  {nombre}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-gray-300 text-sm">
                  {tipo === 'ejecutivo_mensual' && 'Resumen ejecutivo con métricas clave y comparativas del período seleccionado.'}
                  {tipo === 'cumplimiento_normativo' && 'Análisis de cumplimiento de normativas y regulaciones vigentes.'}
                  {tipo === 'area_departamento' && 'Estadísticas detalladas por área o departamento específico.'}
                  {tipo === 'empleado_individual' && 'Reporte personalizado de actividad y licencias de un empleado.'}
                  {tipo === 'tendencias_anuales' && 'Análisis de tendencias históricas y proyecciones futuras.'}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Tiempo estimado: 2-4 segundos</span>
                </div>
                
                <Button
                  onClick={() => generarReporte(tipo as TipoReporte)}
                  disabled={estaGenerando}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {estaGenerando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generar Reporte
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Información adicional */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Información de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">5</div>
              <div className="text-gray-400 text-sm">Tipos de Reportes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">PDF + Excel</div>
              <div className="text-gray-400 text-sm">Formatos de Exportación</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">2-4s</div>
              <div className="text-gray-400 text-sm">Tiempo de Generación</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
