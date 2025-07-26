'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Save, 
  Search, 
  Calendar,
  User,
  FileText,
  AlertCircle
} from 'lucide-react'
import { SolicitudesService, EmpleadosService, TiposLicenciaService } from '@/lib/api/solicitudes'
import type { 
  NuevaSolicitud, 
  Empleado, 
  TipoLicencia,
  FormularioNuevaSolicitud 
} from '@/lib/types/solicitudes'

export default function NuevaSolicitudPage() {
  const router = useRouter()
  
  // Estados del formulario
  const [formulario, setFormulario] = useState<FormularioNuevaSolicitud>({
    empleadoId: '',
    tipoLicenciaId: '',
    fechaInicio: null,
    fechaFin: null,
    motivo: '',
    observaciones: '',
    documentosAdjuntos: []
  })
  
  // Estados de datos
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoLicencia | null>(null)
  
  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('')
  const [mostrarEmpleados, setMostrarEmpleados] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    cargarTiposLicencia()
  }, [])

  // Cargar tipos de licencia
  const cargarTiposLicencia = async () => {
    try {
      const tipos = await TiposLicenciaService.obtenerTiposLicencia()
      setTiposLicencia(tipos)
    } catch (err) {
      console.error('Error cargando tipos de licencia:', err)
    }
  }

  // Buscar empleados
  const buscarEmpleados = async (termino: string) => {
    if (termino.length < 2) {
      setEmpleados([])
      return
    }
    
    try {
      const resultados = await EmpleadosService.buscarEmpleados(termino)
      setEmpleados(resultados)
    } catch (err) {
      console.error('Error buscando empleados:', err)
    }
  }

  // Manejar búsqueda de empleado
  const handleBusquedaEmpleado = (termino: string) => {
    setBusquedaEmpleado(termino)
    setMostrarEmpleados(true)
    buscarEmpleados(termino)
  }

  // Seleccionar empleado
  const seleccionarEmpleado = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado)
    setFormulario(prev => ({ ...prev, empleadoId: empleado.id }))
    setBusquedaEmpleado(`${empleado.nombre} ${empleado.apellido} (${empleado.legajo})`)
    setMostrarEmpleados(false)
  }

  // Seleccionar tipo de licencia
  const seleccionarTipoLicencia = (tipoId: string) => {
    const tipo = tiposLicencia.find(t => t.id === tipoId)
    setTipoSeleccionado(tipo || null)
    setFormulario(prev => ({ ...prev, tipoLicenciaId: tipoId }))
  }

  // Calcular días entre fechas
  const calcularDias = (inicio: Date, fin: Date): number => {
    const diffTime = Math.abs(fin.getTime() - inicio.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Incluir ambos días
  }

  // Manejar cambio de fecha de inicio
  const handleFechaInicio = (fecha: string) => {
    const fechaInicio = new Date(fecha)
    setFormulario(prev => ({ 
      ...prev, 
      fechaInicio: fechaInicio,
      // Si ya hay fecha fin, recalcular
      fechaFin: prev.fechaFin && fechaInicio > prev.fechaFin ? fechaInicio : prev.fechaFin
    }))
  }

  // Manejar cambio de fecha de fin
  const handleFechaFin = (fecha: string) => {
    const fechaFin = new Date(fecha)
    setFormulario(prev => ({ ...prev, fechaFin: fechaFin }))
  }

  // Validar formulario
  const validarFormulario = (): string | null => {
    if (!formulario.empleadoId) return 'Debe seleccionar un empleado'
    if (!formulario.tipoLicenciaId) return 'Debe seleccionar un tipo de licencia'
    if (!formulario.fechaInicio) return 'Debe especificar la fecha de inicio'
    if (!formulario.fechaFin) return 'Debe especificar la fecha de fin'
    if (formulario.fechaInicio > formulario.fechaFin) return 'La fecha de inicio no puede ser posterior a la fecha de fin'
    if (!formulario.motivo.trim()) return 'Debe especificar el motivo de la licencia'
    
    // Validar días máximos
    if (tipoSeleccionado && tipoSeleccionado.diasMaximos) {
      const diasSolicitados = calcularDias(formulario.fechaInicio, formulario.fechaFin)
      if (diasSolicitados > tipoSeleccionado.diasMaximos) {
        return `El tipo de licencia seleccionado permite máximo ${tipoSeleccionado.diasMaximos} días`
      }
    }
    
    return null
  }

  // Guardar solicitud
  const guardarSolicitud = async () => {
    const errorValidacion = validarFormulario()
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    try {
      setGuardando(true)
      setError(null)

      const nuevaSolicitud: NuevaSolicitud = {
        empleadoId: formulario.empleadoId,
        tipoLicenciaId: formulario.tipoLicenciaId,
        fechaInicio: formulario.fechaInicio!.toISOString(),
        fechaFin: formulario.fechaFin!.toISOString(),
        motivo: formulario.motivo.trim(),
        observaciones: formulario.observaciones.trim() || undefined,
        documentosAdjuntos: formulario.documentosAdjuntos.map(f => f.name)
      }

      const solicitudCreada = await SolicitudesService.crearSolicitud(nuevaSolicitud)
      
      // Redirigir al detalle de la solicitud creada
      router.push(`/dashboard/solicitudes/${solicitudCreada.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la solicitud')
      console.error('Error creando solicitud:', err)
    } finally {
      setGuardando(false)
    }
  }

  // Formatear fecha para input
  const formatearFechaInput = (fecha: Date | null): string => {
    if (!fecha) return ''
    return fecha.toISOString().split('T')[0]
  }

  // Calcular días solicitados
  const diasSolicitados = formulario.fechaInicio && formulario.fechaFin 
    ? calcularDias(formulario.fechaInicio, formulario.fechaFin)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Nueva Solicitud de Licencia</h1>
          <p className="text-gray-400 mt-1">Complete los datos para crear una nueva solicitud</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selección de empleado */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Seleccionar Empleado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label htmlFor="empleado" className="text-gray-300">
                  Buscar empleado por nombre o legajo
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="empleado"
                    placeholder="Escriba el nombre o legajo del empleado..."
                    value={busquedaEmpleado}
                    onChange={(e) => handleBusquedaEmpleado(e.target.value)}
                    onFocus={() => setMostrarEmpleados(true)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                
                {/* Lista de empleados */}
                {mostrarEmpleados && empleados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {empleados.map((empleado) => (
                      <div
                        key={empleado.id}
                        onClick={() => seleccionarEmpleado(empleado)}
                        className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                      >
                        <div className="text-white font-medium">
                          {empleado.nombre} {empleado.apellido}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {empleado.legajo} • {empleado.area}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Empleado seleccionado */}
              {empleadoSeleccionado && (
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-white font-medium">
                    {empleadoSeleccionado.nombre} {empleadoSeleccionado.apellido}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {empleadoSeleccionado.legajo} • {empleadoSeleccionado.area} • {empleadoSeleccionado.email}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datos de la licencia */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Datos de la Licencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de licencia */}
              <div>
                <Label htmlFor="tipoLicencia" className="text-gray-300">
                  Tipo de Licencia
                </Label>
                <select
                  id="tipoLicencia"
                  value={formulario.tipoLicenciaId}
                  onChange={(e) => seleccionarTipoLicencia(e.target.value)}
                  className="w-full mt-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Seleccione un tipo de licencia</option>
                  {tiposLicencia.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre} {tipo.diasMaximos ? `(máx. ${tipo.diasMaximos} días)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaInicio" className="text-gray-300">
                    Fecha de Inicio
                  </Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formatearFechaInput(formulario.fechaInicio)}
                    onChange={(e) => handleFechaInicio(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
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
                    value={formatearFechaInput(formulario.fechaFin)}
                    onChange={(e) => handleFechaFin(e.target.value)}
                    min={formatearFechaInput(formulario.fechaInicio)}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <Label htmlFor="motivo" className="text-gray-300">
                  Motivo de la Licencia
                </Label>
                <textarea
                  id="motivo"
                  value={formulario.motivo}
                  onChange={(e) => setFormulario(prev => ({ ...prev, motivo: e.target.value }))}
                  placeholder="Describa el motivo de la licencia..."
                  rows={3}
                  className="w-full mt-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                />
              </div>

              {/* Observaciones */}
              <div>
                <Label htmlFor="observaciones" className="text-gray-300">
                  Observaciones (Opcional)
                </Label>
                <textarea
                  id="observaciones"
                  value={formulario.observaciones}
                  onChange={(e) => setFormulario(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones adicionales..."
                  rows={2}
                  className="w-full mt-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Resumen */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-gray-400 text-sm">Empleado</div>
                <div className="text-white">
                  {empleadoSeleccionado 
                    ? `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido}`
                    : 'No seleccionado'
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Tipo de Licencia</div>
                <div className="text-white">
                  {tipoSeleccionado ? tipoSeleccionado.nombre : 'No seleccionado'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Período</div>
                <div className="text-white">
                  {formulario.fechaInicio && formulario.fechaFin
                    ? `${formulario.fechaInicio.toLocaleDateString('es-AR')} - ${formulario.fechaFin.toLocaleDateString('es-AR')}`
                    : 'No especificado'
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Días Solicitados</div>
                <div className="text-white font-medium">
                  {diasSolicitados > 0 ? `${diasSolicitados} días` : '-'}
                </div>
              </div>
              {tipoSeleccionado?.diasMaximos && (
                <div>
                  <div className="text-gray-400 text-sm">Días Máximos Permitidos</div>
                  <div className="text-white">
                    {tipoSeleccionado.diasMaximos} días
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del tipo de licencia */}
          {tipoSeleccionado && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tipoSeleccionado.descripcion && (
                  <div>
                    <div className="text-gray-400 text-sm">Descripción</div>
                    <div className="text-white text-sm">
                      {tipoSeleccionado.descripcion}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-gray-400 text-sm">Requiere Documentación</div>
                  <div className="text-white text-sm">
                    {tipoSeleccionado.requiereDocumentacion ? 'Sí' : 'No'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              onClick={guardarSolicitud}
              disabled={guardando || !validarFormulario() === null}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {guardando ? 'Guardando...' : 'Crear Solicitud'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
