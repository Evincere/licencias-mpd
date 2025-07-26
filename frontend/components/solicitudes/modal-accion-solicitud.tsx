'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  X
} from 'lucide-react'
import { SolicitudesService } from '@/lib/api/solicitudes'
import type { Solicitud, EstadoSolicitud } from '@/lib/types/solicitudes'
import { ESTADOS_SOLICITUD, COLORES_ESTADO } from '@/lib/types/solicitudes'

interface ModalAccionSolicitudProps {
  isOpen: boolean
  onClose: () => void
  solicitud: Solicitud | null
  accion: 'aprobar' | 'rechazar' | 'revision'
  onSuccess?: () => void
}

const CONFIGURACION_ACCIONES = {
  aprobar: {
    titulo: 'Aprobar Solicitud',
    descripcion: 'Esta acción aprobará la solicitud de licencia',
    color: 'text-green-400',
    icon: CheckCircle,
    buttonClass: 'bg-green-600 hover:bg-green-700',
    buttonText: 'Aprobar Solicitud'
  },
  rechazar: {
    titulo: 'Rechazar Solicitud',
    descripcion: 'Esta acción rechazará la solicitud de licencia',
    color: 'text-red-400',
    icon: XCircle,
    buttonClass: 'bg-red-600 hover:bg-red-700',
    buttonText: 'Rechazar Solicitud'
  },
  revision: {
    titulo: 'Poner en Revisión',
    descripcion: 'Esta acción marcará la solicitud para revisión adicional',
    color: 'text-blue-400',
    icon: AlertCircle,
    buttonClass: 'bg-blue-600 hover:bg-blue-700',
    buttonText: 'Poner en Revisión'
  }
}

export function ModalAccionSolicitud({
  isOpen,
  onClose,
  solicitud,
  accion,
  onSuccess
}: ModalAccionSolicitudProps) {
  const [comentario, setComentario] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const config = CONFIGURACION_ACCIONES[accion]
  const IconoAccion = config.icon

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
    return (
      <Badge className={`${COLORES_ESTADO[estado]} flex items-center gap-1`}>
        {ESTADOS_SOLICITUD[estado]}
      </Badge>
    )
  }

  // Ejecutar acción
  const ejecutarAccion = async () => {
    if (!solicitud) return

    try {
      setProcesando(true)
      setError(null)

      switch (accion) {
        case 'aprobar':
          await SolicitudesService.aprobarSolicitud(solicitud.id, comentario.trim() || undefined)
          break
        case 'rechazar':
          await SolicitudesService.rechazarSolicitud(solicitud.id, comentario.trim() || undefined)
          break
        case 'revision':
          await SolicitudesService.ponerEnRevision(solicitud.id, comentario.trim() || undefined)
          break
      }

      // Limpiar formulario
      setComentario('')
      
      // Notificar éxito
      if (onSuccess) {
        onSuccess()
      }
      
      // Cerrar modal
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la acción')
      console.error('Error ejecutando acción:', err)
    } finally {
      setProcesando(false)
    }
  }

  // Limpiar estado al cerrar
  const handleClose = () => {
    setComentario('')
    setError(null)
    onClose()
  }

  if (!isOpen || !solicitud) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card className="relative glass-card w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-xl font-bold ${config.color} flex items-center gap-2`}>
              <IconoAccion className="w-6 h-6" />
              {config.titulo}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {config.descripcion}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center text-red-400">
                <XCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Información de la solicitud */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Información de la Solicitud</h3>
              {renderEstado(solicitud.estado)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Empleado:</span>
                <div className="text-white font-medium">
                  {solicitud.empleado?.nombre} {solicitud.empleado?.apellido}
                </div>
                <div className="text-gray-400 text-xs">
                  {solicitud.empleado?.legajo} • {solicitud.empleado?.area}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Tipo de Licencia:</span>
                <div className="text-white font-medium">
                  {solicitud.tipoLicencia?.nombre}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Período:</span>
                <div className="text-white">
                  {formatearFecha(solicitud.fechaInicio)} - {formatearFecha(solicitud.fechaFin)}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Días Solicitados:</span>
                <div className="text-white font-medium">
                  {solicitud.diasSolicitados} días
                </div>
              </div>
            </div>

            {/* Motivo */}
            <div>
              <span className="text-gray-400 text-sm">Motivo:</span>
              <div className="text-white bg-gray-900/50 p-2 rounded mt-1 text-sm">
                {solicitud.motivo}
              </div>
            </div>

            {/* Observaciones del empleado */}
            {solicitud.observaciones && (
              <div>
                <span className="text-gray-400 text-sm">Observaciones del empleado:</span>
                <div className="text-white bg-gray-900/50 p-2 rounded mt-1 text-sm">
                  {solicitud.observaciones}
                </div>
              </div>
            )}
          </div>

          {/* Campo de comentario */}
          <div>
            <Label htmlFor="comentario" className="text-gray-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comentario {accion === 'rechazar' ? '(Requerido)' : '(Opcional)'}
            </Label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder={
                accion === 'aprobar' 
                  ? 'Agregue un comentario sobre la aprobación...'
                  : accion === 'rechazar'
                  ? 'Explique el motivo del rechazo...'
                  : 'Indique qué aspectos requieren revisión...'
              }
              rows={4}
              className="w-full mt-2 p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <div className="text-xs text-gray-400 mt-1">
              {comentario.length}/500 caracteres
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={procesando}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={ejecutarAccion}
              disabled={procesando || (accion === 'rechazar' && !comentario.trim())}
              className={`flex-1 ${config.buttonClass} text-white`}
            >
              <IconoAccion className="w-4 h-4 mr-2" />
              {procesando ? 'Procesando...' : config.buttonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
