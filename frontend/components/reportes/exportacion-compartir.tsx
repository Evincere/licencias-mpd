'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Download,
  Mail,
  Share2,
  FileText,
  Calendar,
  Settings,
  Copy,
  Check,
  Clock,
  Users,
  X
} from 'lucide-react'
import { ExportacionService, PLANTILLAS_EXPORTACION } from '@/lib/services/exportacion'
import type { 
  ReporteBase,
  ConfiguracionExportacion,
  MetricasAnalytics
} from '@/lib/types/reportes'

interface ExportacionCompartirProps {
  reporte?: ReporteBase
  metricas?: MetricasAnalytics
  tipo: 'reporte' | 'dashboard'
  onClose: () => void
}

export function ExportacionCompartir({ reporte, metricas, tipo, onClose }: ExportacionCompartirProps) {
  // Estados principales
  const [accionActiva, setAccionActiva] = useState<'exportar' | 'email' | 'compartir' | 'programar'>('exportar')
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null)
  
  // Estados de configuración
  const [configuracionExportacion, setConfiguracionExportacion] = useState<ConfiguracionExportacion>({
    formato: 'pdf',
    incluirGraficos: true,
    incluirDatos: true,
    incluirMetadatos: true,
    configuracionPDF: {
      orientacion: 'portrait',
      tamaño: 'A4',
      incluirPortada: true,
      incluirIndice: true
    }
  })

  // Estados para email
  const [destinatariosEmail, setDestinatariosEmail] = useState<string[]>([])
  const [nuevoDestinatario, setNuevoDestinatario] = useState('')

  // Estados para compartir
  const [enlaceCompartido, setEnlaceCompartido] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  // Estados para programación
  const [configuracionProgramacion, setConfiguracionProgramacion] = useState({
    frecuencia: 'mensual' as 'diaria' | 'semanal' | 'mensual' | 'trimestral',
    destinatarios: [] as string[],
    proximaEjecucion: new Date()
  })

  // Exportar archivo
  const exportarArchivo = async () => {
    try {
      setProcesando(true)
      setMensaje(null)

      let blob: Blob

      if (tipo === 'reporte' && reporte) {
        if (configuracionExportacion.formato === 'pdf') {
          blob = await ExportacionService.exportarPDF(reporte, configuracionExportacion)
        } else {
          blob = await ExportacionService.exportarExcel(reporte, configuracionExportacion)
        }
      } else if (tipo === 'dashboard' && metricas) {
        blob = await ExportacionService.exportarDashboard(metricas, configuracionExportacion)
      } else {
        throw new Error('Datos insuficientes para exportación')
      }

      // Descargar archivo
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${tipo}_${Date.now()}.${configuracionExportacion.formato === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMensaje({ tipo: 'success', texto: 'Archivo exportado exitosamente' })
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: error instanceof Error ? error.message : 'Error al exportar archivo' 
      })
    } finally {
      setProcesando(false)
    }
  }

  // Enviar por email
  const enviarPorEmail = async () => {
    if (!reporte || destinatariosEmail.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Debe agregar al menos un destinatario' })
      return
    }

    try {
      setProcesando(true)
      setMensaje(null)

      await ExportacionService.enviarPorEmail(reporte, destinatariosEmail, configuracionExportacion)
      
      setMensaje({ tipo: 'success', texto: `Reporte enviado a ${destinatariosEmail.length} destinatarios` })
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: error instanceof Error ? error.message : 'Error al enviar email' 
      })
    } finally {
      setProcesando(false)
    }
  }

  // Generar enlace para compartir
  const generarEnlaceCompartir = async () => {
    try {
      setProcesando(true)
      setMensaje(null)

      const enlace = await ExportacionService.generarEnlaceCompartir('dashboard-123', {
        expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        permisos: 'solo_lectura',
        requiereAutenticacion: false
      })

      setEnlaceCompartido(enlace)
      setMensaje({ tipo: 'success', texto: 'Enlace generado exitosamente' })
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: error instanceof Error ? error.message : 'Error al generar enlace' 
      })
    } finally {
      setProcesando(false)
    }
  }

  // Copiar enlace al portapapeles
  const copiarEnlace = async () => {
    if (enlaceCompartido) {
      try {
        await navigator.clipboard.writeText(enlaceCompartido)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      } catch (error) {
        console.error('Error copiando enlace:', error)
      }
    }
  }

  // Programar reporte
  const programarReporte = async () => {
    if (!reporte) return

    try {
      setProcesando(true)
      setMensaje(null)

      await ExportacionService.programarReporte({
        reporteId: reporte.id,
        frecuencia: configuracionProgramacion.frecuencia,
        destinatarios: configuracionProgramacion.destinatarios,
        formatoExportacion: configuracionExportacion,
        proximaEjecucion: configuracionProgramacion.proximaEjecucion
      })

      setMensaje({ tipo: 'success', texto: 'Reporte programado exitosamente' })
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: error instanceof Error ? error.message : 'Error al programar reporte' 
      })
    } finally {
      setProcesando(false)
    }
  }

  // Agregar destinatario de email
  const agregarDestinatario = () => {
    if (nuevoDestinatario && !destinatariosEmail.includes(nuevoDestinatario)) {
      setDestinatariosEmail([...destinatariosEmail, nuevoDestinatario])
      setNuevoDestinatario('')
    }
  }

  // Quitar destinatario
  const quitarDestinatario = (email: string) => {
    setDestinatariosEmail(destinatariosEmail.filter(d => d !== email))
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar y Compartir
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selector de acción */}
        <div className="flex gap-2">
          {[
            { key: 'exportar', label: 'Exportar', icon: Download },
            { key: 'email', label: 'Enviar Email', icon: Mail },
            { key: 'compartir', label: 'Compartir', icon: Share2 },
            { key: 'programar', label: 'Programar', icon: Calendar }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={accionActiva === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAccionActiva(key as any)}
              className="flex-1"
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Configuración de exportación */}
        <div className="space-y-4">
          <Label className="text-gray-300">Configuración de Exportación</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 text-sm">Formato</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={configuracionExportacion.formato === 'pdf' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setConfiguracionExportacion(prev => ({ ...prev, formato: 'pdf' }))}
                >
                  PDF
                </Button>
                <Button
                  variant={configuracionExportacion.formato === 'excel' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setConfiguracionExportacion(prev => ({ ...prev, formato: 'excel' }))}
                >
                  Excel
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Plantilla</Label>
              <div className="flex gap-2 mt-1">
                {Object.entries(PLANTILLAS_EXPORTACION).map(([key, plantilla]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => setConfiguracionExportacion(prev => ({
                      ...prev,
                      configuracionPDF: plantilla
                    }))}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={configuracionExportacion.incluirGraficos}
                onChange={(e) => setConfiguracionExportacion(prev => ({
                  ...prev,
                  incluirGraficos: e.target.checked
                }))}
              />
              Incluir Gráficos
            </label>
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={configuracionExportacion.incluirDatos}
                onChange={(e) => setConfiguracionExportacion(prev => ({
                  ...prev,
                  incluirDatos: e.target.checked
                }))}
              />
              Incluir Datos
            </label>
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={configuracionExportacion.incluirMetadatos}
                onChange={(e) => setConfiguracionExportacion(prev => ({
                  ...prev,
                  incluirMetadatos: e.target.checked
                }))}
              />
              Incluir Metadatos
            </label>
          </div>
        </div>

        {/* Contenido específico por acción */}
        {accionActiva === 'exportar' && (
          <div className="space-y-4">
            <Button
              onClick={exportarArchivo}
              disabled={procesando}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              {procesando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar {configuracionExportacion.formato.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        )}

        {accionActiva === 'email' && (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Destinatarios</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={nuevoDestinatario}
                  onChange={(e) => setNuevoDestinatario(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && agregarDestinatario()}
                />
                <Button onClick={agregarDestinatario} size="sm">
                  Agregar
                </Button>
              </div>
            </div>

            {destinatariosEmail.length > 0 && (
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Destinatarios agregados:</Label>
                <div className="flex flex-wrap gap-2">
                  {destinatariosEmail.map(email => (
                    <Badge key={email} className="flex items-center gap-1">
                      {email}
                      <button onClick={() => quitarDestinatario(email)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={enviarPorEmail}
              disabled={procesando || destinatariosEmail.length === 0}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              {procesando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por Email
                </>
              )}
            </Button>
          </div>
        )}

        {accionActiva === 'compartir' && (
          <div className="space-y-4">
            {!enlaceCompartido ? (
              <Button
                onClick={generarEnlaceCompartir}
                disabled={procesando}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
              >
                {procesando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Generar Enlace para Compartir
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <Label className="text-gray-300">Enlace generado:</Label>
                <div className="flex gap-2">
                  <Input
                    value={enlaceCompartido}
                    readOnly
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                  <Button onClick={copiarEnlace} size="sm">
                    {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-gray-400 text-xs">
                  Este enlace expira en 7 días y permite acceso de solo lectura.
                </div>
              </div>
            )}
          </div>
        )}

        {accionActiva === 'programar' && (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Frecuencia</Label>
              <div className="flex gap-2 mt-1">
                {['diaria', 'semanal', 'mensual', 'trimestral'].map(freq => (
                  <Button
                    key={freq}
                    variant={configuracionProgramacion.frecuencia === freq ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfiguracionProgramacion(prev => ({
                      ...prev,
                      frecuencia: freq as any
                    }))}
                  >
                    {freq}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Próxima Ejecución</Label>
              <Input
                type="datetime-local"
                value={configuracionProgramacion.proximaEjecucion.toISOString().slice(0, 16)}
                onChange={(e) => setConfiguracionProgramacion(prev => ({
                  ...prev,
                  proximaEjecucion: new Date(e.target.value)
                }))}
                className="mt-1 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>

            <Button
              onClick={programarReporte}
              disabled={procesando}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              {procesando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Programando...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Programar Reporte
                </>
              )}
            </Button>
          </div>
        )}

        {/* Mensaje de resultado */}
        {mensaje && (
          <div className={`p-3 rounded-lg ${
            mensaje.tipo === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border border-red-500/30 text-red-300'
          }`}>
            {mensaje.texto}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
