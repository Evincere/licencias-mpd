'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Filter,
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  BarChart3,
  Settings,
  Users,
  AlertTriangle
} from 'lucide-react'
import { CalendarioService } from '@/lib/api/calendario'
import type { 
  EventoCalendario,
  FiltrosCalendario,
  RespuestaCalendario,
  VistaCalendario,
  EstadisticasCalendario
} from '@/lib/types/calendario'
import { 
  TIPOS_EVENTO, 
  ESTADOS_EVENTO, 
  VISTAS_CALENDARIO,
  COLORES_TIPO_DEFECTO,
  COLORES_ESTADO_DEFECTO
} from '@/lib/types/calendario'
// import { CalendarioAvanzado } from '@/components/calendario/calendario-avanzado'
// import { FiltrosCalendarioComponent } from '@/components/calendario/filtros-calendario'
// import { EstadisticasCalendarioComponent } from '@/components/calendario/estadisticas-calendario'

export default function CalendarioPage() {
  // Estados principales
  const [datos, setDatos] = useState<RespuestaCalendario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados de vista y filtros
  const [vista, setVista] = useState<VistaCalendario>('mes')
  const [fechaActual, setFechaActual] = useState(new Date())
  const [filtros, setFiltros] = useState<FiltrosCalendario>({})
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false)

  // Cargar datos del calendario
  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Calcular rango de fechas según la vista
      const { fechaInicio, fechaFin } = calcularRangoFechas(fechaActual, vista)
      
      const filtrosCompletos: FiltrosCalendario = {
        ...filtros,
        fechaInicio,
        fechaFin,
        busqueda: busqueda || undefined
      }
      
      const response = await CalendarioService.obtenerEventos(filtrosCompletos)
      setDatos(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar calendario')
      console.error('Error cargando calendario:', err)
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar datos cuando cambian los filtros
  useEffect(() => {
    cargarDatos()
  }, [fechaActual, vista, filtros, busqueda])

  // Calcular rango de fechas según la vista
  const calcularRangoFechas = (fecha: Date, vista: VistaCalendario) => {
    const fechaInicio = new Date(fecha)
    const fechaFin = new Date(fecha)
    
    switch (vista) {
      case 'mes':
        fechaInicio.setDate(1)
        fechaFin.setMonth(fechaFin.getMonth() + 1, 0)
        break
      case 'semana':
        const diaActual = fecha.getDay()
        fechaInicio.setDate(fecha.getDate() - diaActual)
        fechaFin.setDate(fechaInicio.getDate() + 6)
        break
      case 'dia':
        // Mismo día
        break
      case 'agenda':
        // Próximos 30 días
        fechaFin.setDate(fechaFin.getDate() + 30)
        break
    }
    
    return { fechaInicio, fechaFin }
  }

  // Navegar en el tiempo
  const navegarTiempo = (direccion: 'anterior' | 'siguiente') => {
    const nuevaFecha = new Date(fechaActual)
    
    switch (vista) {
      case 'mes':
        nuevaFecha.setMonth(nuevaFecha.getMonth() + (direccion === 'siguiente' ? 1 : -1))
        break
      case 'semana':
        nuevaFecha.setDate(nuevaFecha.getDate() + (direccion === 'siguiente' ? 7 : -7))
        break
      case 'dia':
        nuevaFecha.setDate(nuevaFecha.getDate() + (direccion === 'siguiente' ? 1 : -1))
        break
      case 'agenda':
        nuevaFecha.setDate(nuevaFecha.getDate() + (direccion === 'siguiente' ? 30 : -30))
        break
    }
    
    setFechaActual(nuevaFecha)
  }

  // Ir a hoy
  const irAHoy = () => {
    setFechaActual(new Date())
  }

  // Manejar cambio de filtros
  const handleFiltrosChange = (nuevosFiltros: FiltrosCalendario) => {
    setFiltros(nuevosFiltros)
  }

  // Exportar calendario
  const exportarCalendario = async () => {
    try {
      const { fechaInicio, fechaFin } = calcularRangoFechas(fechaActual, vista)
      
      const blob = await CalendarioService.exportarCalendario({
        formato: 'excel',
        filtros,
        incluirDetalles: true,
        incluirEstadisticas: true,
        fechaInicio,
        fechaFin
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `calendario_${fechaActual.toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando calendario:', err)
    }
  }

  // Formatear título de fecha
  const formatearTituloFecha = () => {
    const opciones: Intl.DateTimeFormatOptions = {}
    
    switch (vista) {
      case 'mes':
        opciones.month = 'long'
        opciones.year = 'numeric'
        break
      case 'semana':
        const inicioSemana = new Date(fechaActual)
        inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay())
        const finSemana = new Date(inicioSemana)
        finSemana.setDate(inicioSemana.getDate() + 6)
        
        return `${inicioSemana.toLocaleDateString('es-AR')} - ${finSemana.toLocaleDateString('es-AR')}`
      case 'dia':
        opciones.weekday = 'long'
        opciones.day = 'numeric'
        opciones.month = 'long'
        opciones.year = 'numeric'
        break
      case 'agenda':
        return 'Próximos eventos'
    }
    
    return fechaActual.toLocaleDateString('es-AR', opciones)
  }

  if (loading && !datos) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Calendario de Licencias</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              <span className="ml-3 text-gray-300">Cargando calendario...</span>
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
          <h1 className="text-3xl font-bold text-white">Calendario de Licencias</h1>
          <p className="text-gray-400 mt-1">
            Vista general de todas las licencias y eventos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
            variant="outline"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Estadísticas
          </Button>
          <Button 
            onClick={exportarCalendario}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Controles de navegación */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Navegación temporal */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navegarTiempo('anterior')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={irAHoy}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navegarTiempo('siguiente')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-white font-medium text-lg">
                {formatearTituloFecha()}
              </div>
            </div>

            {/* Controles de vista */}
            <div className="flex items-center gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar eventos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 w-64 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Filtros */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>

              {/* Selector de vista */}
              <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                {Object.entries(VISTAS_CALENDARIO).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={vista === key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setVista(key as VistaCalendario)}
                    className="rounded-none border-0"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros expandidos */}
      {mostrarFiltros && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-center text-gray-400">
              <Filter className="w-12 h-12 mx-auto mb-4" />
              <p>Filtros avanzados - En desarrollo</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      {mostrarEstadisticas && datos && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4" />
              <p>Estadísticas del calendario - En desarrollo</p>
            </div>
          </CardContent>
        </Card>
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

      {/* Calendario principal */}
      {datos && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendario - Vista {VISTAS_CALENDARIO[vista]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Resumen de eventos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-white font-medium">{datos.eventos.length}</div>
                  <div className="text-gray-400 text-sm">Eventos totales</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-green-400 font-medium">
                    {datos.eventos.filter(e => e.estado === 'aprobada').length}
                  </div>
                  <div className="text-gray-400 text-sm">Aprobadas</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-yellow-400 font-medium">
                    {datos.eventos.filter(e => e.estado === 'pendiente').length}
                  </div>
                  <div className="text-gray-400 text-sm">Pendientes</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-red-400 font-medium">{datos.conflictos.length}</div>
                  <div className="text-gray-400 text-sm">Conflictos</div>
                </div>
              </div>

              {/* Lista de eventos */}
              <div className="space-y-2">
                <h3 className="text-white font-medium">Eventos en el período</h3>
                {datos.eventos.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No hay eventos en el período seleccionado
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {datos.eventos.map((evento) => (
                      <div key={evento.id} className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{evento.titulo}</div>
                            <div className="text-gray-400 text-sm">
                              {evento.fechaInicio.toLocaleDateString('es-AR')} - {evento.fechaFin.toLocaleDateString('es-AR')}
                            </div>
                            {evento.empleado && (
                              <div className="text-gray-400 text-sm">
                                {evento.empleado.nombre} {evento.empleado.apellido} • {evento.empleado.area}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className="text-xs"
                              style={{ backgroundColor: evento.color + '40', color: evento.color }}
                            >
                              {TIPOS_EVENTO[evento.tipo]}
                            </Badge>
                            {evento.estado && (
                              <Badge
                                className={`text-xs ${
                                  evento.estado === 'aprobada' ? 'bg-green-500/20 text-green-300' :
                                  evento.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-300' :
                                  evento.estado === 'rechazada' ? 'bg-red-500/20 text-red-300' :
                                  'bg-gray-500/20 text-gray-300'
                                }`}
                              >
                                {ESTADOS_EVENTO[evento.estado]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de conflictos */}
      {datos && datos.conflictos.length > 0 && (
        <Card className="glass-card border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Conflictos Detectados ({datos.conflictos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {datos.conflictos.slice(0, 3).map((conflicto) => (
                <div key={conflicto.id} className="flex items-center gap-2 text-sm">
                  <Badge className={`${
                    conflicto.severidad === 'error' ? 'bg-red-500/20 text-red-300' :
                    conflicto.severidad === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {conflicto.severidad}
                  </Badge>
                  <span className="text-gray-300">{conflicto.descripcion}</span>
                </div>
              ))}
              {datos.conflictos.length > 3 && (
                <div className="text-gray-400 text-sm">
                  Y {datos.conflictos.length - 3} conflictos más...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
