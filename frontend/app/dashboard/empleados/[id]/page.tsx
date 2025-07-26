'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  User,
  Calendar,
  FileText,
  BarChart3,
  Edit,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react'
import { EmpleadosService } from '@/lib/api/empleados'
import type { 
  EmpleadoCompleto, 
  EstadisticasLicenciasEmpleado,
  HistorialLicenciasEmpleado 
} from '@/lib/types/empleados'
import {
  JERARQUIAS,
  ESTADOS_EMPLEADO,
  COLORES_ESTADO_EMPLEADO,
  COLORES_JERARQUIA
} from '@/lib/types/empleados'
import { CalendarioEmpleado } from '@/components/empleados/calendario-empleado'

export default function PerfilEmpleadoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [empleado, setEmpleado] = useState<EmpleadoCompleto | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasLicenciasEmpleado | null>(null)
  const [historial, setHistorial] = useState<HistorialLicenciasEmpleado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabActiva, setTabActiva] = useState<'perfil' | 'estadisticas' | 'historial' | 'calendario'>('perfil')

  // Cargar datos del empleado
  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [empleadoData, estadisticasData, historialData] = await Promise.all([
        EmpleadosService.obtenerEmpleadoPorId(id),
        EmpleadosService.obtenerEstadisticasLicencias(id),
        EmpleadosService.obtenerHistorialLicencias(id)
      ])
      
      setEmpleado(empleadoData)
      setEstadisticas(estadisticasData)
      setHistorial(historialData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos del empleado')
      console.error('Error cargando empleado:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      cargarDatos()
    }
  }, [id])

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Calcular antigüedad
  const calcularAntiguedad = (fechaIngreso: string) => {
    const ingreso = new Date(fechaIngreso)
    const hoy = new Date()
    const años = hoy.getFullYear() - ingreso.getFullYear()
    const meses = hoy.getMonth() - ingreso.getMonth()
    
    if (meses < 0 || (meses === 0 && hoy.getDate() < ingreso.getDate())) {
      return años - 1
    }
    return años
  }

  // Renderizar badge de estado
  const renderEstado = (activo: boolean, estado?: string) => {
    if (!activo) {
      return (
        <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
          Inactivo
        </Badge>
      )
    }

    const estadoFinal = (estado as keyof typeof ESTADOS_EMPLEADO) || 'ACTIVO'
    return (
      <Badge className={COLORES_ESTADO_EMPLEADO[estadoFinal]}>
        {ESTADOS_EMPLEADO[estadoFinal]}
      </Badge>
    )
  }

  // Renderizar badge de jerarquía
  const renderJerarquia = (jerarquia: string) => {
    const jerarquiaKey = jerarquia as keyof typeof JERARQUIAS
    return (
      <Badge className={COLORES_JERARQUIA[jerarquiaKey]}>
        {JERARQUIAS[jerarquiaKey]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-white">Perfil de Empleado</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              <span className="ml-3 text-gray-300">Cargando perfil...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !empleado) {
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
              <User className="w-5 h-5 mr-2" />
              {error || 'Empleado no encontrado'}
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
            <h1 className="text-3xl font-bold text-white">
              {empleado.nombre} {empleado.apellido}
            </h1>
            <p className="text-gray-400 mt-1">
              {empleado.legajo} • {empleado.cargo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {renderEstado(empleado.activo, empleado.estado)}
          {renderJerarquia(empleado.jerarquia)}
          <Button
            onClick={() => router.push(`/dashboard/empleados/${empleado.id}/editar`)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Tabs de navegación */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="flex border-b border-gray-700">
            {[
              { key: 'perfil', label: 'Información Personal', icon: User },
              { key: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
              { key: 'historial', label: 'Historial de Licencias', icon: FileText },
              { key: 'calendario', label: 'Calendario', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTabActiva(key as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  tabActiva === key
                    ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenido de las tabs */}
      {tabActiva === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información básica */}
          <div className="lg:col-span-2 space-y-6">
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
                    <label className="text-gray-400 text-sm">Nombre Completo</label>
                    <div className="text-white font-medium">
                      {empleado.nombre} {empleado.apellido}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Legajo</label>
                    <div className="text-white font-medium">{empleado.legajo}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <div className="text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {empleado.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Cargo</label>
                    <div className="text-white">{empleado.cargo}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Área</label>
                    <div className="text-white">{empleado.area}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Jerarquía</label>
                    <div>{renderJerarquia(empleado.jerarquia)}</div>
                  </div>
                </div>

                {/* Información de contacto */}
                {empleado.metadata && (
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="text-white font-medium mb-3">Información de Contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {empleado.metadata.telefono && (
                        <div>
                          <label className="text-gray-400 text-sm">Teléfono</label>
                          <div className="text-white flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {empleado.metadata.telefono}
                          </div>
                        </div>
                      )}
                      {empleado.metadata.direccion && (
                        <div>
                          <label className="text-gray-400 text-sm">Dirección</label>
                          <div className="text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {empleado.metadata.direccion}
                          </div>
                        </div>
                      )}
                      {empleado.metadata.numeroDocumento && (
                        <div>
                          <label className="text-gray-400 text-sm">Documento</label>
                          <div className="text-white">{empleado.metadata.numeroDocumento}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Observaciones */}
                {empleado.metadata?.observaciones && (
                  <div className="pt-4 border-t border-gray-700">
                    <label className="text-gray-400 text-sm">Observaciones</label>
                    <div className="text-white bg-gray-800/50 p-3 rounded-lg mt-1">
                      {empleado.metadata.observaciones}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información laboral */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Información Laboral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Fecha de Ingreso</label>
                  <div className="text-white">{formatearFecha(empleado.fechaIngreso)}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Antigüedad</label>
                  <div className="text-white font-medium">
                    {calcularAntiguedad(empleado.fechaIngreso)} años
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Estado</label>
                  <div className="mt-1">{renderEstado(empleado.activo, empleado.estado)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Saldos de licencias */}
            {empleado.saldos && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Saldos de Licencias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Compensatorios</span>
                    <span className="text-white font-medium">{empleado.saldos.compensatorios} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estudio</span>
                    <span className="text-white font-medium">{empleado.saldos.estudio} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Enfermedad</span>
                    <span className="text-white font-medium">{empleado.saldos.enfermedad} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Particulares</span>
                    <span className="text-white font-medium">{empleado.saldos.particulares} días</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estadísticas rápidas */}
            {estadisticas && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Resumen de Licencias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Solicitudes</span>
                    <span className="text-white font-medium">{estadisticas.totalSolicitudes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Aprobadas</span>
                    <span className="text-green-400 font-medium">{estadisticas.solicitudesAprobadas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pendientes</span>
                    <span className="text-yellow-400 font-medium">{estadisticas.solicitudesPendientes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Días Tomados</span>
                    <span className="text-white font-medium">{estadisticas.diasTomados} días</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Otras tabs se implementarán en siguientes archivos */}
      {tabActiva === 'estadisticas' && (
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="text-center text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4" />
              <p>Estadísticas detalladas - En desarrollo</p>
            </div>
          </CardContent>
        </Card>
      )}

      {tabActiva === 'historial' && (
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>Historial de licencias - En desarrollo</p>
            </div>
          </CardContent>
        </Card>
      )}

      {tabActiva === 'calendario' && (
        <CalendarioEmpleado empleadoId={empleado.id} />
      )}
    </div>
  )
}
