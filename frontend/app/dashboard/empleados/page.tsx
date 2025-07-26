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
  Edit,
  UserCheck,
  UserX,
  Users,
  ChevronLeft,
  ChevronRight,
  Upload
} from 'lucide-react'
import { EmpleadosService } from '@/lib/api/empleados'
import type { 
  EmpleadoCompleto, 
  FiltrosEmpleados, 
  RespuestaEmpleados,
  Jerarquia,
  EstadoEmpleado
} from '@/lib/types/empleados'
import {
  JERARQUIAS,
  ESTADOS_EMPLEADO,
  COLORES_ESTADO_EMPLEADO,
  COLORES_JERARQUIA
} from '@/lib/types/empleados'
import { ModalConfirmacionEmpleado, useModalConfirmacionEmpleado } from '@/components/empleados/modal-confirmacion-empleado'

export default function EmpleadosPage() {
  const router = useRouter()
  const [empleados, setEmpleados] = useState<EmpleadoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { modal, abrirModal, cerrarModal } = useModalConfirmacionEmpleado()
  const [filtros, setFiltros] = useState<FiltrosEmpleados>({
    page: 1,
    limit: 20
  })
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [areas, setAreas] = useState<string[]>([])

  // Cargar empleados
  const cargarEmpleados = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: RespuestaEmpleados = await EmpleadosService.obtenerEmpleados(filtros)
      
      setEmpleados(response.empleados)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empleados')
      console.error('Error cargando empleados:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar áreas disponibles
  const cargarAreas = async () => {
    try {
      const areasDisponibles = await EmpleadosService.obtenerAreas()
      setAreas(areasDisponibles)
    } catch (err) {
      console.error('Error cargando áreas:', err)
    }
  }

  // Efecto para cargar empleados cuando cambian los filtros
  useEffect(() => {
    cargarEmpleados()
  }, [filtros])

  // Cargar áreas al montar el componente
  useEffect(() => {
    cargarAreas()
  }, [])

  // Manejar búsqueda
  const handleBusqueda = (termino: string) => {
    setBusqueda(termino)
    setFiltros(prev => ({
      ...prev,
      page: 1,
      search: termino || undefined
    }))
  }

  // Manejar cambio de página
  const handleCambioPagina = (nuevaPagina: number) => {
    setFiltros(prev => ({
      ...prev,
      page: nuevaPagina
    }))
  }

  // Manejar filtro por jerarquía
  const handleFiltroJerarquia = (jerarquia: Jerarquia | '') => {
    setFiltros(prev => ({
      ...prev,
      page: 1,
      jerarquia: jerarquia || undefined
    }))
  }

  // Manejar filtro por área
  const handleFiltroArea = (area: string) => {
    setFiltros(prev => ({
      ...prev,
      page: 1,
      area: area || undefined
    }))
  }

  // Manejar filtro por estado activo
  const handleFiltroActivo = (activo: boolean | null) => {
    setFiltros(prev => ({
      ...prev,
      page: 1,
      activo: activo === null ? undefined : activo
    }))
  }

  // Exportar empleados
  const handleExportar = async () => {
    try {
      const blob = await EmpleadosService.exportarEmpleados(filtros)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `empleados_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando:', err)
    }
  }

  // Navegar a perfil
  const verPerfil = (id: string) => {
    router.push(`/dashboard/empleados/${id}`)
  }

  // Navegar a editar
  const editarEmpleado = (id: string) => {
    router.push(`/dashboard/empleados/${id}/editar`)
  }

  // Navegar a nuevo empleado
  const nuevoEmpleado = () => {
    router.push('/dashboard/empleados/nuevo')
  }

  // Navegar a importar
  const importarEmpleados = () => {
    router.push('/dashboard/empleados/importar')
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
  const renderEstado = (activo: boolean, estado?: EstadoEmpleado) => {
    if (!activo) {
      return (
        <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 flex items-center gap-1">
          <UserX className="w-3 h-3" />
          Inactivo
        </Badge>
      )
    }

    const estadoFinal = estado || 'ACTIVO'
    return (
      <Badge className={`${COLORES_ESTADO_EMPLEADO[estadoFinal]} flex items-center gap-1`}>
        <UserCheck className="w-3 h-3" />
        {ESTADOS_EMPLEADO[estadoFinal]}
      </Badge>
    )
  }

  // Renderizar badge de jerarquía
  const renderJerarquia = (jerarquia: Jerarquia) => {
    return (
      <Badge className={`${COLORES_JERARQUIA[jerarquia]} text-xs`}>
        {JERARQUIAS[jerarquia]}
      </Badge>
    )
  }

  if (loading && empleados.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Gestión de Empleados</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              <span className="ml-3 text-gray-300">Cargando empleados...</span>
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
          <h1 className="text-3xl font-bold text-white">Gestión de Empleados</h1>
          <p className="text-gray-400 mt-1">
            {total} empleados encontrados
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={importarEmpleados}
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button 
            onClick={nuevoEmpleado}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Empleado
          </Button>
        </div>
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
                  placeholder="Buscar por nombre, legajo o email..."
                  value={busqueda}
                  onChange={(e) => handleBusqueda(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filtros.activo === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltroActivo(null)}
                className="text-xs"
              >
                Todos
              </Button>
              <Button
                variant={filtros.activo === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltroActivo(true)}
                className="text-xs"
              >
                Activos
              </Button>
              <Button
                variant={filtros.activo === false ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltroActivo(false)}
                className="text-xs"
              >
                Inactivos
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

          {/* Filtros avanzados */}
          {mostrarFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por jerarquía */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Jerarquía</label>
                  <select
                    value={filtros.jerarquia || ''}
                    onChange={(e) => handleFiltroJerarquia(e.target.value as Jerarquia | '')}
                    className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm"
                  >
                    <option value="">Todas las jerarquías</option>
                    {Object.entries(JERARQUIAS).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por área */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Área</label>
                  <select
                    value={filtros.area || ''}
                    onChange={(e) => handleFiltroArea(e.target.value)}
                    className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm"
                  >
                    <option value="">Todas las áreas</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <Users className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de empleados */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Lista de Empleados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {empleados.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No se encontraron empleados con los filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr className="text-left">
                    <th className="p-4 text-gray-300 font-medium">Empleado</th>
                    <th className="p-4 text-gray-300 font-medium">Cargo</th>
                    <th className="p-4 text-gray-300 font-medium">Jerarquía</th>
                    <th className="p-4 text-gray-300 font-medium">Área</th>
                    <th className="p-4 text-gray-300 font-medium">Estado</th>
                    <th className="p-4 text-gray-300 font-medium">Ingreso</th>
                    <th className="p-4 text-gray-300 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map((empleado) => (
                    <tr 
                      key={empleado.id} 
                      className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <div className="text-white font-medium">
                            {empleado.nombre} {empleado.apellido}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {empleado.legajo} • {empleado.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white">
                          {empleado.cargo}
                        </div>
                      </td>
                      <td className="p-4">
                        {renderJerarquia(empleado.jerarquia)}
                      </td>
                      <td className="p-4">
                        <div className="text-white">
                          {empleado.area}
                        </div>
                      </td>
                      <td className="p-4">
                        {renderEstado(empleado.activo, empleado.estado)}
                      </td>
                      <td className="p-4">
                        <div className="text-gray-400 text-sm">
                          {formatearFecha(empleado.fechaIngreso)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => verPerfil(empleado.id)}
                            title="Ver perfil"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editarEmpleado(empleado.id)}
                            title="Editar empleado"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {empleado.activo ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirModal({
                                id: empleado.id,
                                legajo: empleado.legajo,
                                nombre: empleado.nombre,
                                apellido: empleado.apellido,
                                email: empleado.email,
                                area: empleado.area,
                                jerarquia: empleado.jerarquia,
                                activo: empleado.activo
                              }, 'desactivar')}
                              title="Desactivar empleado"
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirModal({
                                id: empleado.id,
                                legajo: empleado.legajo,
                                nombre: empleado.nombre,
                                apellido: empleado.apellido,
                                email: empleado.email,
                                area: empleado.area,
                                jerarquia: empleado.jerarquia,
                                activo: empleado.activo
                              }, 'activar')}
                              title="Activar empleado"
                              className="text-green-400 hover:text-green-300"
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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
                Página {filtros.page} de {totalPages} • {total} empleados total
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

      {/* Modal de confirmación */}
      <ModalConfirmacionEmpleado
        isOpen={modal.isOpen}
        onClose={cerrarModal}
        empleado={modal.empleado}
        accion={modal.accion}
        onSuccess={cargarEmpleados}
      />
    </div>
  )
}
