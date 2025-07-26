'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  UserX, 
  UserCheck, 
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react'
import { EmpleadosService } from '@/lib/api/empleados'
import type { EmpleadoBasico } from '@/lib/types/empleados'

interface ModalConfirmacionEmpleadoProps {
  isOpen: boolean
  onClose: () => void
  empleado: EmpleadoBasico | null
  accion: 'activar' | 'desactivar' | 'eliminar'
  onSuccess?: () => void
}

const CONFIGURACION_ACCIONES = {
  activar: {
    titulo: 'Activar Empleado',
    descripcion: 'Esta acción activará al empleado en el sistema',
    color: 'text-green-400',
    icon: UserCheck,
    buttonClass: 'bg-green-600 hover:bg-green-700',
    buttonText: 'Activar Empleado',
    confirmText: 'El empleado podrá acceder al sistema y realizar solicitudes.'
  },
  desactivar: {
    titulo: 'Desactivar Empleado',
    descripcion: 'Esta acción desactivará al empleado del sistema',
    color: 'text-yellow-400',
    icon: UserX,
    buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
    buttonText: 'Desactivar Empleado',
    confirmText: 'El empleado no podrá acceder al sistema pero sus datos se conservarán.'
  },
  eliminar: {
    titulo: 'Eliminar Empleado',
    descripcion: 'Esta acción eliminará permanentemente al empleado',
    color: 'text-red-400',
    icon: Trash2,
    buttonClass: 'bg-red-600 hover:bg-red-700',
    buttonText: 'Eliminar Empleado',
    confirmText: 'ADVERTENCIA: Esta acción no se puede deshacer. Se eliminarán todos los datos del empleado.'
  }
}

export function ModalConfirmacionEmpleado({
  isOpen,
  onClose,
  empleado,
  accion,
  onSuccess
}: ModalConfirmacionEmpleadoProps) {
  const [comentario, setComentario] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmacionTexto, setConfirmacionTexto] = useState('')

  const config = CONFIGURACION_ACCIONES[accion]
  const IconoAccion = config.icon

  // Ejecutar acción
  const ejecutarAccion = async () => {
    if (!empleado) return

    // Validar confirmación para eliminación
    if (accion === 'eliminar' && confirmacionTexto !== 'ELIMINAR') {
      setError('Debe escribir "ELIMINAR" para confirmar la acción')
      return
    }

    try {
      setProcesando(true)
      setError(null)

      switch (accion) {
        case 'activar':
          await EmpleadosService.activarEmpleado(empleado.id)
          break
        case 'desactivar':
          await EmpleadosService.desactivarEmpleado(empleado.id)
          break
        case 'eliminar':
          // Para eliminación, usamos desactivar (soft delete)
          await EmpleadosService.desactivarEmpleado(empleado.id)
          break
      }

      // Limpiar formulario
      setComentario('')
      setConfirmacionTexto('')
      
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
    setConfirmacionTexto('')
    setError(null)
    onClose()
  }

  if (!isOpen || !empleado) {
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
      <Card className="relative glass-card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
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
                <AlertTriangle className="w-4 h-4 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Información del empleado */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Información del Empleado</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Nombre:</span>
                <div className="text-white font-medium">
                  {empleado.nombre} {empleado.apellido}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Legajo:</span>
                <div className="text-white">
                  {empleado.legajo}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Email:</span>
                <div className="text-white">
                  {empleado.email}
                </div>
              </div>
              
              <div>
                <span className="text-gray-400">Área:</span>
                <div className="text-white">
                  {empleado.area}
                </div>
              </div>
            </div>
          </div>

          {/* Confirmación especial para eliminación */}
          {accion === 'eliminar' && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Confirmación requerida</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                {config.confirmText}
              </p>
              <Label htmlFor="confirmacion" className="text-gray-300 text-sm">
                Escriba "ELIMINAR" para confirmar:
              </Label>
              <input
                id="confirmacion"
                type="text"
                value={confirmacionTexto}
                onChange={(e) => setConfirmacionTexto(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full mt-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          )}

          {/* Información de la acción */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              {config.confirmText}
            </p>
          </div>

          {/* Campo de comentario opcional */}
          <div>
            <Label htmlFor="comentario" className="text-gray-300 text-sm">
              Comentario (Opcional)
            </Label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Agregue un comentario sobre esta acción..."
              rows={3}
              className="w-full mt-2 p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
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
              disabled={
                procesando || 
                (accion === 'eliminar' && confirmacionTexto !== 'ELIMINAR')
              }
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

// Hook para usar el modal
export function useModalConfirmacionEmpleado() {
  const [modal, setModal] = useState<{
    isOpen: boolean
    empleado: EmpleadoBasico | null
    accion: 'activar' | 'desactivar' | 'eliminar'
  }>({
    isOpen: false,
    empleado: null,
    accion: 'desactivar'
  })

  const abrirModal = (empleado: EmpleadoBasico, accion: 'activar' | 'desactivar' | 'eliminar') => {
    setModal({
      isOpen: true,
      empleado,
      accion
    })
  }

  const cerrarModal = () => {
    setModal({
      isOpen: false,
      empleado: null,
      accion: 'desactivar'
    })
  }

  return {
    modal,
    abrirModal,
    cerrarModal
  }
}
