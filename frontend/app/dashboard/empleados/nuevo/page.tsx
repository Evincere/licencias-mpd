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
  User,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react'
import { EmpleadosService } from '@/lib/api/empleados'
import type { 
  NuevoEmpleado, 
  FormularioNuevoEmpleado,
  Jerarquia,
  EmpleadoBasico
} from '@/lib/types/empleados'
import { JERARQUIAS } from '@/lib/types/empleados'
import { validarNuevoEmpleado, formatearErrores } from '@/lib/validations/empleados'

export default function NuevoEmpleadoPage() {
  const router = useRouter()
  
  // Estados del formulario
  const [formulario, setFormulario] = useState<FormularioNuevoEmpleado>({
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
    observaciones: ''
  })
  
  // Estados de datos
  const [areas, setAreas] = useState<string[]>([])
  const [posiblesJefes, setPosiblesJefes] = useState<EmpleadoBasico[]>([])
  
  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    cargarAreas()
  }, [])

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
      setPosiblesJefes(jefes)
    } catch (err) {
      console.error('Error cargando posibles jefes:', err)
    }
  }

  // Manejar cambios en el formulario
  const handleChange = (campo: keyof FormularioNuevoEmpleado, valor: any) => {
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
    const datosValidacion = {
      legajo: formulario.legajo,
      nombre: formulario.nombre,
      apellido: formulario.apellido,
      email: formulario.email,
      cargo: formulario.cargo,
      jerarquia: formulario.jerarquia as Jerarquia,
      area: formulario.area,
      fechaIngreso: formulario.fechaIngreso?.toISOString(),
      metadata: {
        numeroDocumento: formulario.numeroDocumento,
        telefono: formulario.telefono,
        direccion: formulario.direccion,
        observaciones: formulario.observaciones
      }
    }

    const resultado = validarNuevoEmpleado(datosValidacion)

    if (!resultado.valido) {
      const errores = formatearErrores(resultado)
      return errores[0]?.replace('❌ ', '') || 'Hay errores en el formulario'
    }

    return null
  }

  // Guardar empleado
  const guardarEmpleado = async () => {
    const errorValidacion = validarFormulario()
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    try {
      setGuardando(true)
      setError(null)

      const nuevoEmpleado: NuevoEmpleado = {
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

      const empleadoCreado = await EmpleadosService.crearEmpleado(nuevoEmpleado)
      
      // Redirigir al perfil del empleado creado
      router.push(`/dashboard/empleados/${empleadoCreado.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el empleado')
      console.error('Error creando empleado:', err)
    } finally {
      setGuardando(false)
    }
  }

  // Formatear fecha para input
  const formatearFechaInput = (fecha: Date | null): string => {
    if (!fecha) return ''
    return fecha.toISOString().split('T')[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Nuevo Empleado</h1>
          <p className="text-gray-400 mt-1">Complete los datos para crear un nuevo empleado</p>
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
                    placeholder="Ej: 12345"
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
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
                    placeholder="empleado@mpd.gov.ar"
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
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
                    placeholder="Juan"
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
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
                    placeholder="Pérez"
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
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
                    placeholder="12345678"
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
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
                    placeholder="+54 9 11 1234-5678"
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
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
                  placeholder="Calle 123, Ciudad, Provincia"
                  className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
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
                    placeholder="Ej: Defensor Público"
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
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
                  placeholder="Observaciones adicionales..."
                  rows={3}
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
                <div className="text-gray-400 text-sm">Nombre Completo</div>
                <div className="text-white">
                  {formulario.nombre && formulario.apellido
                    ? `${formulario.nombre} ${formulario.apellido}`
                    : 'No especificado'
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Legajo</div>
                <div className="text-white">
                  {formulario.legajo || 'No especificado'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Cargo</div>
                <div className="text-white">
                  {formulario.cargo || 'No especificado'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Área</div>
                <div className="text-white">
                  {formulario.area || 'No especificado'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Jerarquía</div>
                <div className="text-white">
                  {formulario.jerarquia ? JERARQUIAS[formulario.jerarquia as Jerarquia] : 'No especificado'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              onClick={guardarEmpleado}
              disabled={guardando || !!validarFormulario()}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {guardando ? 'Guardando...' : 'Crear Empleado'}
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
