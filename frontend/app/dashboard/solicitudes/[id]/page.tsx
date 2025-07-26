'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Download,
  Edit
} from 'lucide-react'
import { SolicitudesService } from '@/lib/api/solicitudes'
import type { SolicitudDetalle, EstadoSolicitud } from '@/lib/types/solicitudes'
import { ESTADOS_SOLICITUD, COLORES_ESTADO } from '@/lib/types/solicitudes'
import { ModalAccionSolicitud } from '@/components/solicitudes/modal-accion-solicitud'

const ICONOS_ESTADO = {
  pendiente: Clock,
  aprobada: CheckCircle,
  rechazada: XCircle,
  en_revision: AlertCircle
}

interface DetalleSolicitudPageProps {
  params: { id: string }
}

export default function DetalleSolicitudPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalAccion, setModalAccion] = useState<{
    isOpen: boolean
    accion: 'aprobar' | 'rechazar' | 'revision'
  }>({
    isOpen: false,
    accion: 'aprobar'
  })

  // Cargar solicitud
  const cargarSolicitud = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await SolicitudesService.obtenerSolicitudPorId(id)
      setSolicitud(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitud')
      console.error('Error cargando solicitud:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      cargarSolicitud()
    }
  }, [id])

  // Abrir modal de acción
  const abrirModalAccion = (accion: 'aprobar' | 'rechazar' | 'revision') => {
    setModalAccion({
      isOpen: true,
      accion
    })
  }

  // Cerrar modal de acción
  const cerrarModalAccion = () => {
    setModalAccion({
      isOpen: false,
      accion: 'aprobar'
    })
  }

  // Manejar éxito de acción
  const handleExitoAccion = () => {
    cargarSolicitud() // Recargar datos
  }

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Formatear fecha y hora
  const formatearFechaHora = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Renderizar badge de estado
  const renderEstado = (estado: EstadoSolicitud) => {
    const IconoEstado = ICONOS_ESTADO[estado]
    return (
      <Badge className={`${COLORES_ESTADO[estado]} flex items-center gap-2 text-sm px-3 py-1`}>
        <IconoEstado className="w-4 h-4" />
        {ESTADOS_SOLICITUD[estado]}
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
          <h1 className="text-3xl font-bold text-white">Detalle de Solicitud</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              <span className="ml-3 text-gray-300">Cargando solicitud...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !solicitud) {
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
              <XCircle className="w-5 h-5 mr-2" />
              {error || 'Solicitud no encontrada'}
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
            <h1 className="text-3xl font-bold text-white">Detalle de Solicitud</h1>
            <p className="text-gray-400 mt-1">ID: {solicitud.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {renderEstado(solicitud.estado)}
          {solicitud.estado === 'pendiente' && (
            <div className="flex gap-2">
              <Button
                onClick={() => abrirModalAccion('aprobar')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobar
              </Button>
              <Button
                onClick={() => abrirModalAccion('rechazar')}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
              <Button
                onClick={() => abrirModalAccion('revision')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Revisión
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del empleado */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Información del Empleado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Nombre Completo</label>
                  <div className="text-white font-medium">
                    {solicitud.empleado.nombre} {solicitud.empleado.apellido}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Legajo</label>
                  <div className="text-white font-medium">{solicitud.empleado.legajo}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <div className="text-white">{solicitud.empleado.email}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Área</label>
                  <div className="text-white">{solicitud.empleado.area}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Cargo</label>
                  <div className="text-white">{solicitud.empleado.cargo || 'No especificado'}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Jerarquía</label>
                  <div className="text-white">{solicitud.empleado.jerarquia}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos de la licencia */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Información de la Licencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Tipo de Licencia</label>
                  <div className="text-white font-medium">{solicitud.tipoLicencia.nombre}</div>
                  <div className="text-gray-400 text-sm">{solicitud.tipoLicencia.codigo}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Días Solicitados</label>
                  <div className="text-white font-medium">{solicitud.diasSolicitados} días</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Fecha de Inicio</label>
                  <div className="text-white">{formatearFecha(solicitud.fechaInicio)}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Fecha de Fin</label>
                  <div className="text-white">{formatearFecha(solicitud.fechaFin)}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-gray-400 text-sm">Motivo</label>
                  <div className="text-white bg-gray-800/50 p-3 rounded-lg mt-1">
                    {solicitud.motivo}
                  </div>
                </div>
                {solicitud.observaciones && (
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-sm">Observaciones</label>
                    <div className="text-white bg-gray-800/50 p-3 rounded-lg mt-1">
                      {solicitud.observaciones}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documentos adjuntos */}
          {solicitud.documentosAdjuntos && solicitud.documentosAdjuntos.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentos Adjuntos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {solicitud.documentosAdjuntos.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{doc}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Estado y fechas */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Estado y Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Estado Actual</label>
                <div className="mt-1">{renderEstado(solicitud.estado)}</div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Fecha de Solicitud</label>
                <div className="text-white">{formatearFechaHora(solicitud.fechaSolicitud)}</div>
              </div>
              {solicitud.fechaAprobacion && (
                <div>
                  <label className="text-gray-400 text-sm">Fecha de Aprobación</label>
                  <div className="text-white">{formatearFechaHora(solicitud.fechaAprobacion)}</div>
                </div>
              )}
              {solicitud.aprobadoPorUsuario && (
                <div>
                  <label className="text-gray-400 text-sm">Aprobado por</label>
                  <div className="text-white">
                    {solicitud.aprobadoPorUsuario.nombre} {solicitud.aprobadoPorUsuario.apellido}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comentarios de aprobación */}
          {solicitud.observacionesAprobacion && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comentarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white bg-gray-800/50 p-3 rounded-lg">
                  {solicitud.observacionesAprobacion}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información técnica */}
          {(solicitud.prediccionMl || solicitud.confianzaPrediccion) && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white text-sm">Información Técnica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {solicitud.confianzaPrediccion && (
                  <div>
                    <label className="text-gray-400 text-xs">Confianza IA</label>
                    <div className="text-white text-sm">
                      {(solicitud.confianzaPrediccion * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
                {solicitud.tiempoProcesamiento && (
                  <div>
                    <label className="text-gray-400 text-xs">Tiempo de Procesamiento</label>
                    <div className="text-white text-sm">
                      {solicitud.tiempoProcesamiento}ms
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de acciones */}
      <ModalAccionSolicitud
        isOpen={modalAccion.isOpen}
        onClose={cerrarModalAccion}
        solicitud={solicitud}
        accion={modalAccion.accion}
        onSuccess={handleExitoAccion}
      />
    </div>
  )
}
