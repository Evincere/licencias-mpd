'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Save, 
  User,
  Briefcase,
  AlertCircle,
  UserCheck,
  UserX
} from 'lucide-react'
import { EmpleadosService } from '@/lib/api/empleados'
import type { 
  EmpleadoCompleto,
  ActualizarEmpleado, 
  FormularioEditarEmpleado,
  Jerarquia,
  EmpleadoBasico
} from '@/lib/types/empleados'
import { JERARQUIAS } from '@/lib/types/empleados'

export default function EditarEmpleadoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  // Estados del formulario
  const [formulario, setFormulario] = useState<FormularioEditarEmpleado>({
    id: '',
    legajo: '',
    nombre: '',
    apellido: '',
    email: '',
    cargo: '',
    jerarquia: '',
    area: '',
    jefaturaDirectaId: '',
    fechaIngreso: null,
    numeroDocumento: '',
    telefono: '',
    direccion: '',
    observaciones: '',
    activo: true
  })
  
  // Estados de datos
  const [empleadoOriginal, setEmpleadoOriginal] = useState<EmpleadoCompleto | null>(null)
  const [areas, setAreas] = useState<string[]>([])
  const [posiblesJefes, setPosiblesJefes] = useState<EmpleadoBasico[]>([])
  
  // Estados de UI
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos del empleado
  const cargarEmpleado = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const empleado = await EmpleadosService.obtenerEmpleadoPorId(id)
      setEmpleadoOriginal(empleado)
      
      // Llenar formulario con datos existentes
      setFormulario({
        id: empleado.id,
        legajo: empleado.legajo,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        cargo: empleado.cargo,
        jerarquia: empleado.jerarquia,
        area: empleado.area,
        jefaturaDirectaId: empleado.jefaturaDirectaId || '',
        fechaIngreso: new Date(empleado.fechaIngreso),
        numeroDocumento: empleado.metadata?.numeroDocumento || '',
        telefono: empleado.metadata?.telefono || '',
        direccion: empleado.metadata?.direccion || '',
        observaciones: empleado.metadata?.observaciones || '',
        activo: empleado.activo
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empleado')
      console.error('Error cargando empleado:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (id) {
      cargarEmpleado()
      cargarAreas()
    }
  }, [id])

  // Cargar posibles jefes cuando cambia la jerarquía
  useEffect(() => {
    if (formulario.jerarquia) {
      cargarPosiblesJefes(formulario.jerarquia as Jerarquia)
    }
  }, [formulario.jerarquia])

  // Cargar áreas disponibles
  const cargarAreas = async () => {
    try {
      const areasDisponibles = await EmpleadosService.obtenerAreas()
      setAreas(areasDisponibles)
    } catch (err) {
      console.error('Error cargando áreas:', err)
    }
  }

  // Cargar posibles jefes según jerarquía
  const cargarPosiblesJefes = async (jerarquia: Jerarquia) => {
    try {
      const jefes = await EmpleadosService.obtenerPosiblesJefes(jerarquia)
      // Filtrar el empleado actual de la lista de posibles jefes
      const jefesFiltrados = jefes.filter(jefe => jefe.id !== id)
      setPosiblesJefes(jefesFiltrados)
    } catch (err) {
      console.error('Error cargando posibles jefes:', err)
    }
  }

  // Manejar cambios en el formulario
  const handleChange = (campo: keyof FormularioEditarEmpleado, valor: any) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }))
    
    // Limpiar jefe si cambia la jerarquía
    if (campo === 'jerarquia') {
      setFormulario(prev => ({
        ...prev,
        jefaturaDirectaId: ''
      }))
    }
  }

  // Validar formulario
  const validarFormulario = (): string | null => {
    if (!formulario.legajo.trim()) return 'El legajo es obligatorio'
    if (!formulario.nombre.trim()) return 'El nombre es obligatorio'
    if (!formulario.apellido.trim()) return 'El apellido es obligatorio'
    if (!formulario.email.trim()) return 'El email es obligatorio'
    if (!formulario.cargo.trim()) return 'El cargo es obligatorio'
    if (!formulario.jerarquia) return 'La jerarquía es obligatoria'
    if (!formulario.area.trim()) return 'El área es obligatoria'
    if (!formulario.fechaIngreso) return 'La fecha de ingreso es obligatoria'
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formulario.email)) {
      return 'El formato del email no es válido'
    }
    
    return null
  }

  // Detectar cambios en el formulario
  const haycambios = (): boolean => {
    if (!empleadoOriginal) return false
    
    return (
      formulario.legajo !== empleadoOriginal.legajo ||
      formulario.nombre !== empleadoOriginal.nombre ||
      formulario.apellido !== empleadoOriginal.apellido ||
      formulario.email !== empleadoOriginal.email ||
      formulario.cargo !== empleadoOriginal.cargo ||
      formulario.jerarquia !== empleadoOriginal.jerarquia ||
      formulario.area !== empleadoOriginal.area ||
      formulario.jefaturaDirectaId !== (empleadoOriginal.jefaturaDirectaId || '') ||
      formulario.fechaIngreso?.toISOString().split('T')[0] !== empleadoOriginal.fechaIngreso.split('T')[0] ||
      formulario.numeroDocumento !== (empleadoOriginal.metadata?.numeroDocumento || '') ||
      formulario.telefono !== (empleadoOriginal.metadata?.telefono || '') ||
      formulario.direccion !== (empleadoOriginal.metadata?.direccion || '') ||
      formulario.observaciones !== (empleadoOriginal.metadata?.observaciones || '') ||
      formulario.activo !== empleadoOriginal.activo
    )
  }

  // Guardar cambios
  const guardarCambios = async () => {
    const errorValidacion = validarFormulario()
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    try {
      setGuardando(true)
      setError(null)

      const datosActualizacion: ActualizarEmpleado = {
        legajo: formulario.legajo.trim(),
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        email: formulario.email.trim().toLowerCase(),
        cargo: formulario.cargo.trim(),
        jerarquia: formulario.jerarquia as Jerarquia,
        area: formulario.area.trim(),
        jefaturaDirectaId: formulario.jefaturaDirectaId || undefined,
        fechaIngreso: formulario.fechaIngreso!.toISOString(),
        metadata: {
          numeroDocumento: formulario.numeroDocumento.trim() || undefined,
          telefono: formulario.telefono.trim() || undefined,
          direccion: formulario.direccion.trim() || undefined,
          observaciones: formulario.observaciones.trim() || undefined
        }
      }

      await EmpleadosService.actualizarEmpleado(id, datosActualizacion)
      
      // Redirigir al perfil del empleado
      router.push(`/dashboard/empleados/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el empleado')
      console.error('Error actualizando empleado:', err)
    } finally {
      setGuardando(false)
    }
  }

  // Cambiar estado activo
  const cambiarEstadoActivo = async (nuevoEstado: boolean) => {
    try {
      setGuardando(true)
      
      if (nuevoEstado) {
        await EmpleadosService.activarEmpleado(id)
      } else {
        await EmpleadosService.desactivarEmpleado(id)
      }
      
      setFormulario(prev => ({ ...prev, activo: nuevoEstado }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado del empleado')
    } finally {
      setGuardando(false)
    }
  }

  // Formatear fecha para input
  const formatearFechaInput = (fecha: Date | null): string => {
    if (!fecha) return ''
    return fecha.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-white">Editar Empleado</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              <span className="ml-3 text-gray-300">Cargando empleado...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !empleadoOriginal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-white">Error</h1>
        </div>
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-8">
            <div className="flex items-center text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
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
            <h1 className="text-3xl font-bold text-white">Editar Empleado</h1>
            <p className="text-gray-400 mt-1">
              {empleadoOriginal?.nombre} {empleadoOriginal?.apellido} • {empleadoOriginal?.legajo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {formulario.activo ? (
            <Button
              onClick={() => cambiarEstadoActivo(false)}
              variant="destructive"
              disabled={guardando}
            >
              <UserX className="w-4 h-4 mr-2" />
              Desactivar
            </Button>
          ) : (
            <Button
              onClick={() => cambiarEstadoActivo(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={guardando}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Activar
            </Button>
          )}
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
          {/* Información básica */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legajo" className="text-gray-300">
                    Legajo *
                  </Label>
                  <Input
                    id="legajo"
                    value={formulario.legajo}
                    onChange={(e) => handleChange('legajo', e.target.value)}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formulario.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="nombre" className="text-gray-300">
                    Nombre *
                  </Label>
                  <Input
                    id="nombre"
                    value={formulario.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="apellido" className="text-gray-300">
                    Apellido *
                  </Label>
                  <Input
                    id="apellido"
                    value={formulario.apellido}
                    onChange={(e) => handleChange('apellido', e.target.value)}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="numeroDocumento" className="text-gray-300">
                    Número de Documento
                  </Label>
                  <Input
                    id="numeroDocumento"
                    value={formulario.numeroDocumento}
                    onChange={(e) => handleChange('numeroDocumento', e.target.value)}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="telefono" className="text-gray-300">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    value={formulario.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="direccion" className="text-gray-300">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  value={formulario.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información laboral */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Información Laboral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo" className="text-gray-300">
                    Cargo *
                  </Label>
                  <Input
                    id="cargo"
                    value={formulario.cargo}
                    onChange={(e) => handleChange('cargo', e.target.value)}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="jerarquia" className="text-gray-300">
                    Jerarquía *
                  </Label>
                  <select
                    id="jerarquia"
                    value={formulario.jerarquia}
                    onChange={(e) => handleChange('jerarquia', e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Seleccione una jerarquía</option>
                    {Object.entries(JERARQUIAS).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="area" className="text-gray-300">
                    Área *
                  </Label>
                  <select
                    id="area"
                    value={formulario.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Seleccione un área</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="fechaIngreso" className="text-gray-300">
                    Fecha de Ingreso *
                  </Label>
                  <Input
                    id="fechaIngreso"
                    type="date"
                    value={formatearFechaInput(formulario.fechaIngreso)}
                    onChange={(e) => handleChange('fechaIngreso', new Date(e.target.value))}
                    max={new Date().toISOString().split('T')[0]}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Jefatura directa */}
              {posiblesJefes.length > 0 && (
                <div>
                  <Label htmlFor="jefaturaDirecta" className="text-gray-300">
                    Jefatura Directa
                  </Label>
                  <select
                    id="jefaturaDirecta"
                    value={formulario.jefaturaDirectaId}
                    onChange={(e) => handleChange('jefaturaDirectaId', e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Sin jefatura directa</option>
                    {posiblesJefes.map((jefe) => (
                      <option key={jefe.id} value={jefe.id}>
                        {jefe.nombre} {jefe.apellido} ({jefe.legajo})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <Label htmlFor="observaciones" className="text-gray-300">
                  Observaciones
                </Label>
                <textarea
                  id="observaciones"
                  value={formulario.observaciones}
                  onChange={(e) => handleChange('observaciones', e.target.value)}
                  rows={3}
                  className="w-full mt-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Estado del empleado */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {formulario.activo ? (
                  <div className="text-green-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-medium">Empleado Activo</div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <UserX className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-medium">Empleado Inactivo</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              onClick={guardarCambios}
              disabled={guardando || !haycambios() || !!validarFormulario()}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>

          {/* Indicador de cambios */}
          {haycambios() && (
            <Card className="glass-card border-yellow-500/30">
              <CardContent className="p-3">
                <div className="text-yellow-400 text-sm text-center">
                  <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                  Hay cambios sin guardar
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
