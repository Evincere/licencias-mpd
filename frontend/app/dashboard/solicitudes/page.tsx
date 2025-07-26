'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { SolicitudesService } from '@/lib/api/solicitudes'
import type { 
  Solicitud, 
  FiltrosSolicitudes, 
  EstadoSolicitud,
  RespuestaSolicitudes 
} from '@/lib/types/solicitudes'
import { ESTADOS_SOLICITUD, COLORES_ESTADO } from '@/lib/types/solicitudes'

const ICONOS_ESTADO = {
  pendiente: Clock,
  aprobada: CheckCircle,
  rechazada: XCircle,
  en_revision: AlertCircle
}

export default function SolicitudesPage() {
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosSolicitudes>({
    page: 1,
    limit: 20
  })
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Cargar solicitudes
  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: RespuestaSolicitudes = await SolicitudesService.obtenerSolicitudes(filtros)
      
      setSolicitudes(response.solicitudes)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes')
      console.error('Error cargando solicitudes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar solicitudes cuando cambian los filtros
  useEffect(() => {
    cargarSolicitudes()
  }, [filtros])

  // Manejar búsqueda
  const handleBusqueda = (termino: string) => {
    setBusqueda(termino)
    setFiltros(prev => ({
      ...prev,
      page: 1,
      busqueda: termino || undefined
    }))
  }

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina: number) => {
    setFiltros(prev => ({
      ...prev,
      page: nuevaPagina
    }))
  }

  // Manejar filtro por estado
  const handleFiltroEstado = (estado: EstadoSolicitud | '') => {
    setFiltros(prev => ({
      ...prev,
      page: 1,
      estado: estado || undefined
    }))
  }

  // Exportar solicitudes
  const handleExportar = async () => {
    try {
      const blob = await SolicitudesService.exportarSolicitudes(filtros)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `solicitudes_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando:', err)
    }
  }

  // Navegar a detalle
  const verDetalle = (id: string) => {
    router.push(`/dashboard/solicitudes/${id}`)
  }

  // Navegar a nueva solicitud
  const nuevaSolicitud = () => {
    router.push('/dashboard/solicitudes/nueva')
  }

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Renderizar badge de estado
  const renderEstado = (estado: EstadoSolicitud) => {
    const IconoEstado = ICONOS_ESTADO[estado]
    return (
      <Badge className={`${COLORES_ESTADO[estado]} flex items-center gap-1`}>
        <IconoEstado className="w-3 h-3" />
        {ESTADOS_SOLICITUD[estado]}
      </Badge>
    )
  }

  if (loading && solicitudes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Solicitudes de Licencias</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              <span className="ml-3 text-gray-300">Cargando solicitudes...</span>
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
          <h1 className="text-3xl font-bold text-white">Solicitudes de Licencias</h1>
          <p className="text-gray-400 mt-1">
            {total} solicitudes encontradas
          </p>
        </div>
        <Button 
          onClick={nuevaSolicitud}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por empleado, legajo o motivo..."
                  value={busqueda}
                  onChange={(e) => handleBusqueda(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!filtros.estado ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltroEstado('')}
                className="text-xs"
              >
                Todas
              </Button>
              <Button
                variant={filtros.estado === 'pendiente' ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltroEstado('pendiente')}
                className="text-xs"
              >
                Pendientes
              </Button>
              <Button
                variant={filtros.estado === 'aprobada' ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltroEstado('aprobada')}
                className="text-xs"
              >
                Aprobadas
              </Button>
              <Button
                variant={filtros.estado === 'rechazada' ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltroEstado('rechazada')}
                className="text-xs"
              >
                Rechazadas
              </Button>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportar}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <XCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de solicitudes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Lista de Solicitudes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {solicitudes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No se encontraron solicitudes con los filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr className="text-left">
                    <th className="p-4 text-gray-300 font-medium">Empleado</th>
                    <th className="p-4 text-gray-300 font-medium">Tipo</th>
                    <th className="p-4 text-gray-300 font-medium">Fechas</th>
                    <th className="p-4 text-gray-300 font-medium">Días</th>
                    <th className="p-4 text-gray-300 font-medium">Estado</th>
                    <th className="p-4 text-gray-300 font-medium">Solicitud</th>
                    <th className="p-4 text-gray-300 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((solicitud) => (
                    <tr 
                      key={solicitud.id} 
                      className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <div className="text-white font-medium">
                            {solicitud.empleado?.nombre} {solicitud.empleado?.apellido}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {solicitud.empleado?.legajo} • {solicitud.empleado?.area}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white">
                          {solicitud.tipoLicencia?.nombre}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm">
                          {formatearFecha(solicitud.fechaInicio)} - {formatearFecha(solicitud.fechaFin)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">
                          {solicitud.diasSolicitados}
                        </div>
                      </td>
                      <td className="p-4">
                        {renderEstado(solicitud.estado)}
                      </td>
                      <td className="p-4">
                        <div className="text-gray-400 text-sm">
                          {formatearFecha(solicitud.fechaSolicitud)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verDetalle(solicitud.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                Página {filtros.page} de {totalPages} • {total} solicitudes total
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCambioPagina(filtros.page! - 1)}
                  disabled={filtros.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCambioPagina(filtros.page! + 1)}
                  disabled={filtros.page === totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
