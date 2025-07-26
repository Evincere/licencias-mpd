'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare,
  Send,
  Bot,
  User,
  Lightbulb,
  FileText,
  Clock,
  Trash2
} from 'lucide-react'
import { IAProcesamientoService, type RespuestaAsistente } from '@/lib/services/ia-procesamiento'

interface Mensaje {
  id: string
  tipo: 'usuario' | 'asistente'
  contenido: string
  timestamp: Date
  respuesta?: RespuestaAsistente
}

export function AsistenteVirtual() {
  // Estados principales
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [consultaActual, setConsultaActual] = useState('')
  const [procesando, setProcesando] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (mensajes.length === 0) {
      const mensajeBienvenida: Mensaje = {
        id: 'bienvenida',
        tipo: 'asistente',
        contenido: '¡Hola! Soy tu asistente virtual para el sistema de licencias. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(),
        respuesta: {
          respuesta: '¡Hola! Soy tu asistente virtual para el sistema de licencias. ¿En qué puedo ayudarte hoy?',
          accionesSugeridas: [
            'Cómo solicitar una licencia',
            'Consultar días disponibles',
            'Ver estado de solicitudes',
            'Información sobre tipos de licencia'
          ],
          documentosRelacionados: [
            'Manual del Usuario',
            'Reglamento de Licencias'
          ],
          confianza: 1.0
        }
      }
      setMensajes([mensajeBienvenida])
    }
  }, [])

  // Enviar consulta
  const enviarConsulta = async () => {
    if (!consultaActual.trim() || procesando) return

    const nuevaConsulta: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: consultaActual,
      timestamp: new Date()
    }

    setMensajes(prev => [...prev, nuevaConsulta])
    setConsultaActual('')
    setProcesando(true)

    try {
      // Procesar consulta con IA
      const respuesta = await IAProcesamientoService.procesarConsultaAsistente(
        consultaActual,
        { historial: mensajes }
      )

      const respuestaAsistente: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        contenido: respuesta.respuesta,
        timestamp: new Date(),
        respuesta
      }

      setMensajes(prev => [...prev, respuestaAsistente])
    } catch (error) {
      console.error('Error procesando consulta:', error)
      
      const errorResponse: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        contenido: 'Lo siento, hubo un error procesando tu consulta. Por favor, intenta nuevamente.',
        timestamp: new Date()
      }

      setMensajes(prev => [...prev, errorResponse])
    } finally {
      setProcesando(false)
    }
  }

  // Usar acción sugerida
  const usarAccionSugerida = (accion: string) => {
    setConsultaActual(accion)
  }

  // Limpiar conversación
  const limpiarConversacion = () => {
    setMensajes([])
    setConsultaActual('')
  }

  // Manejar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarConsulta()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Asistente Virtual</h2>
            <p className="text-gray-400 text-sm">
              Consulta inteligente sobre licencias y procedimientos
            </p>
          </div>
        </div>
        <Button
          onClick={limpiarConversacion}
          variant="outline"
          size="sm"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
      </div>

      {/* Chat */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {/* Área de mensajes */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`flex gap-3 ${
                  mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'
                }`}
              >
                {mensaje.tipo === 'asistente' && (
                  <div className="p-2 bg-blue-500/20 rounded-full h-8 w-8 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md ${
                  mensaje.tipo === 'usuario' ? 'order-1' : ''
                }`}>
                  <div className={`p-3 rounded-lg ${
                    mensaje.tipo === 'usuario'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800/50 text-gray-100'
                  }`}>
                    <p className="text-sm">{mensaje.contenido}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {mensaje.timestamp.toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {mensaje.respuesta && (
                      <Badge className={`text-xs ${
                        mensaje.respuesta.confianza >= 0.8 ? 'bg-green-500/20 text-green-300' :
                        mensaje.respuesta.confianza >= 0.6 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {(mensaje.respuesta.confianza * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </div>

                  {/* Acciones sugeridas */}
                  {mensaje.respuesta?.accionesSugeridas && mensaje.respuesta.accionesSugeridas.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Acciones sugeridas:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mensaje.respuesta.accionesSugeridas.map((accion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-6"
                            onClick={() => usarAccionSugerida(accion)}
                          >
                            {accion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documentos relacionados */}
                  {mensaje.respuesta?.documentosRelacionados && mensaje.respuesta.documentosRelacionados.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Documentos relacionados:
                      </div>
                      <div className="space-y-1">
                        {mensaje.respuesta.documentosRelacionados.map((doc, index) => (
                          <div key={index} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                            📄 {doc}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {mensaje.tipo === 'usuario' && (
                  <div className="p-2 bg-primary-500/20 rounded-full h-8 w-8 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-400" />
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de escritura */}
            {procesando && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 bg-blue-500/20 rounded-full h-8 w-8 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de consulta */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Escribe tu consulta aquí..."
                value={consultaActual}
                onChange={(e) => setConsultaActual(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={procesando}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
              <Button
                onClick={enviarConsulta}
                disabled={procesando || !consultaActual.trim()}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultas frecuentes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Consultas Frecuentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              '¿Cómo solicito una licencia anual?',
              '¿Cuántos días de licencia tengo disponibles?',
              '¿Cómo verifico el estado de mi solicitud?',
              '¿Qué documentación necesito para licencia médica?',
              '¿Cuándo se aprueban las solicitudes?',
              '¿Puedo cancelar una solicitud pendiente?'
            ].map((consulta, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-2 text-xs"
                onClick={() => usarAccionSugerida(consulta)}
              >
                {consulta}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
