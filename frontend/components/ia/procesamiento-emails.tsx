'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Mail,
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  FileText,
  Zap,
  Eye,
  Edit,
  Save
} from 'lucide-react'
import { IAProcesamientoService, type DatosExtraidos, type AnalisisPredictivo } from '@/lib/services/ia-procesamiento'

interface ProcesamientoEmailsProps {
  onSolicitudCreada?: (solicitud: DatosExtraidos) => void
}

export function ProcesamientoEmails({ onSolicitudCreada }: ProcesamientoEmailsProps) {
  // Estados principales
  const [contenidoEmail, setContenidoEmail] = useState('')
  const [remitenteEmail, setRemitenteEmail] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [datosExtraidos, setDatosExtraidos] = useState<DatosExtraidos | null>(null)
  const [analisisPredictivo, setAnalisisPredictivo] = useState<AnalisisPredictivo | null>(null)
  const [modoEdicion, setModoEdicion] = useState(false)

  // Procesar email con IA
  const procesarEmail = async () => {
    if (!contenidoEmail.trim() || !remitenteEmail.trim()) {
      return
    }

    try {
      setProcesando(true)
      
      // Extraer datos del email
      const datos = await IAProcesamientoService.extraerDatosSolicitud(
        contenidoEmail,
        remitenteEmail
      )
      
      setDatosExtraidos(datos)
      
      // Realizar análisis predictivo
      const analisis = await IAProcesamientoService.analizarSolicitud(datos)
      setAnalisisPredictivo(analisis)
      
    } catch (error) {
      console.error('Error procesando email:', error)
    } finally {
      setProcesando(false)
    }
  }

  // Crear solicitud desde datos extraídos
  const crearSolicitud = () => {
    if (datosExtraidos && onSolicitudCreada) {
      onSolicitudCreada(datosExtraidos)
    }
  }

  // Cargar email de ejemplo
  const cargarEjemplo = () => {
    setRemitenteEmail('maria.garcia@jus.mendoza.gov.ar')
    setContenidoEmail(`Estimados,

Por la presente solicito licencia anual desde el 15/03/2024 hasta el 22/03/2024.

Motivo: Vacaciones familiares programadas.

Adjunto la documentación correspondiente.

Saludos cordiales,
María García
Defensoría Civil - Funcionario`)
  }

  // Obtener color de confianza
  const obtenerColorConfianza = (confianza: number): string => {
    if (confianza >= 0.8) return 'text-green-400'
    if (confianza >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Obtener color de probabilidad
  const obtenerColorProbabilidad = (probabilidad: number): string => {
    if (probabilidad >= 80) return 'text-green-400'
    if (probabilidad >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Procesamiento Inteligente de Emails</h2>
          <p className="text-gray-400 text-sm">
            Extrae automáticamente datos de solicitudes de licencia desde emails
          </p>
        </div>
      </div>

      {/* Entrada de datos */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Datos del Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="remitente" className="text-gray-300">
              Email del Remitente
            </Label>
            <Input
              id="remitente"
              type="email"
              placeholder="empleado@jus.mendoza.gov.ar"
              value={remitenteEmail}
              onChange={(e) => setRemitenteEmail(e.target.value)}
              className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="contenido" className="text-gray-300">
              Contenido del Email
            </Label>
            <Textarea
              id="contenido"
              placeholder="Pega aquí el contenido del email con la solicitud de licencia..."
              value={contenidoEmail}
              onChange={(e) => setContenidoEmail(e.target.value)}
              rows={8}
              className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={procesarEmail}
              disabled={procesando || !contenidoEmail.trim() || !remitenteEmail.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {procesando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Procesar con IA
                </>
              )}
            </Button>
            
            <Button
              onClick={cargarEjemplo}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Cargar Ejemplo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de extracción */}
      {datosExtraidos && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Datos Extraídos
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${obtenerColorConfianza(datosExtraidos.confianza)}`}>
                  Confianza: {(datosExtraidos.confianza * 100).toFixed(0)}%
                </Badge>
                {datosExtraidos.requiereRevision && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Requiere Revisión
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Información del empleado */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Empleado
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-sm">Nombre</Label>
                  <div className="text-white">{datosExtraidos.empleado.nombre}</div>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Email</Label>
                  <div className="text-white">{datosExtraidos.empleado.email}</div>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Área</Label>
                  <div className="text-white">{datosExtraidos.empleado.area}</div>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Jerarquía</Label>
                  <Badge className="bg-blue-500/20 text-blue-300">
                    {datosExtraidos.empleado.jerarquia}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Información de la licencia */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Detalles de la Licencia
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-sm">Tipo</Label>
                  <div className="text-white">{datosExtraidos.licencia.tipo}</div>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Días Solicitados</Label>
                  <div className="text-white font-bold">{datosExtraidos.licencia.dias} días</div>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Fecha de Inicio</Label>
                  <div className="text-white">
                    {datosExtraidos.licencia.fechaInicio.toLocaleDateString('es-AR')}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Fecha de Fin</Label>
                  <div className="text-white">
                    {datosExtraidos.licencia.fechaFin.toLocaleDateString('es-AR')}
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-400 text-sm">Motivo</Label>
                  <div className="text-white">{datosExtraidos.licencia.motivo}</div>
                </div>
                {datosExtraidos.licencia.observaciones && (
                  <div className="col-span-2">
                    <Label className="text-gray-400 text-sm">Observaciones</Label>
                    <div className="text-white">{datosExtraidos.licencia.observaciones}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button
                onClick={crearSolicitud}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Crear Solicitud
              </Button>
              
              <Button
                onClick={() => setModoEdicion(!modoEdicion)}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                {modoEdicion ? 'Cancelar Edición' : 'Editar Datos'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análisis predictivo */}
      {analisisPredictivo && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Análisis Predictivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/30 p-4 rounded-lg text-center">
                <div className={`text-2xl font-bold ${obtenerColorProbabilidad(analisisPredictivo.probabilidadAprobacion)}`}>
                  {analisisPredictivo.probabilidadAprobacion.toFixed(0)}%
                </div>
                <div className="text-gray-400 text-sm">Probabilidad de Aprobación</div>
              </div>
              
              <div className="bg-gray-800/30 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {analisisPredictivo.tiempoEstimadoResolucion}
                </div>
                <div className="text-gray-400 text-sm">Días Estimados</div>
              </div>
              
              <div className="bg-gray-800/30 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {analisisPredictivo.precedentesEncontrados}
                </div>
                <div className="text-gray-400 text-sm">Precedentes</div>
              </div>
            </div>

            {/* Factores de riesgo */}
            {analisisPredictivo.factoresRiesgo.length > 0 && (
              <div>
                <Label className="text-gray-300 mb-2 block">Factores de Riesgo</Label>
                <div className="space-y-2">
                  {analisisPredictivo.factoresRiesgo.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2 text-yellow-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {analisisPredictivo.recomendaciones.length > 0 && (
              <div>
                <Label className="text-gray-300 mb-2 block">Recomendaciones</Label>
                <div className="space-y-2">
                  {analisisPredictivo.recomendaciones.map((recomendacion, index) => (
                    <div key={index} className="flex items-center gap-2 text-blue-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{recomendacion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
