'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  FileText
} from 'lucide-react'
import { EmpleadosService } from '@/lib/api/empleados'
import type { ImportacionEmpleados, EmpleadoImportacion } from '@/lib/types/empleados'

export default function ImportarEmpleadosPage() {
  const router = useRouter()
  
  // Estados del componente
  const [archivo, setArchivo] = useState<File | null>(null)
  const [importacion, setImportacion] = useState<ImportacionEmpleados | null>(null)
  const [loading, setLoading] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paso, setPaso] = useState<'seleccion' | 'validacion' | 'confirmacion' | 'resultado'>('seleccion')

  // Manejar selección de archivo
  const handleArchivoSeleccionado = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Por favor seleccione un archivo Excel (.xlsx o .xls)')
        return
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 10MB permitido.')
        return
      }
      
      setArchivo(file)
      setError(null)
    }
  }

  // Procesar archivo para validación
  const procesarArchivo = async () => {
    if (!archivo) return

    try {
      setLoading(true)
      setError(null)
      
      const resultado = await EmpleadosService.importarEmpleados(archivo)
      setImportacion(resultado)
      setPaso('validacion')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo')
      console.error('Error procesando archivo:', err)
    } finally {
      setLoading(false)
    }
  }

  // Confirmar importación
  const confirmarImportacion = async () => {
    if (!importacion) return

    try {
      setProcesando(true)
      setError(null)
      
      // Aquí iría la lógica para confirmar la importación
      // Por ahora simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setPaso('resultado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar empleados')
      console.error('Error importando empleados:', err)
    } finally {
      setProcesando(false)
    }
  }

  // Descargar plantilla
  const descargarPlantilla = () => {
    // Crear un archivo CSV de ejemplo
    const csvContent = `legajo,nombre,apellido,email,cargo,jerarquia,area,fechaIngreso,numeroDocumento,telefono,direccion
12345,Juan,Pérez,juan.perez@mpd.gov.ar,Defensor Público,FUNCIONARIO,Defensoría Penal,2023-01-15,12345678,+54 9 11 1234-5678,Calle 123 Ciudad
12346,María,González,maria.gonzalez@mpd.gov.ar,Secretaria,EMPLEADO,Administración,2023-02-01,87654321,+54 9 11 8765-4321,Avenida 456 Ciudad`
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla_empleados.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reiniciar proceso
  const reiniciar = () => {
    setArchivo(null)
    setImportacion(null)
    setError(null)
    setPaso('seleccion')
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
          <h1 className="text-3xl font-bold text-white">Importar Empleados</h1>
          <p className="text-gray-400 mt-1">Carga masiva de empleados desde archivo Excel</p>
        </div>
      </div>

      {/* Progreso */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {[
              { key: 'seleccion', label: 'Seleccionar Archivo', icon: FileSpreadsheet },
              { key: 'validacion', label: 'Validar Datos', icon: CheckCircle },
              { key: 'confirmacion', label: 'Confirmar Importación', icon: Upload },
              { key: 'resultado', label: 'Resultado', icon: Users }
            ].map(({ key, label, icon: Icon }, index) => (
              <div key={key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  paso === key 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : index < ['seleccion', 'validacion', 'confirmacion', 'resultado'].indexOf(paso)
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-600 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm ${
                  paso === key ? 'text-primary-400' : 'text-gray-400'
                }`}>
                  {label}
                </span>
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    index < ['seleccion', 'validacion', 'confirmacion', 'resultado'].indexOf(paso)
                      ? 'bg-green-600'
                      : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <XCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 1: Selección de archivo */}
      {paso === 'seleccion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Seleccionar Archivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-white font-medium">
                    Arrastra tu archivo Excel aquí o haz click para seleccionar
                  </p>
                  <p className="text-gray-400 text-sm">
                    Formatos soportados: .xlsx, .xls (máximo 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleArchivoSeleccionado}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              
              {archivo && (
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-400" />
                    <div>
                      <div className="text-white font-medium">{archivo.name}</div>
                      <div className="text-gray-400 text-sm">
                        {(archivo.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                onClick={procesarArchivo}
                disabled={!archivo || loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
              >
                {loading ? 'Procesando...' : 'Procesar Archivo'}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="w-5 h-5" />
                Plantilla de Importación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Descarga la plantilla de Excel con el formato correcto para importar empleados.
              </p>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Campos requeridos:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Legajo (único)</li>
                  <li>• Nombre y Apellido</li>
                  <li>• Email (único)</li>
                  <li>• Cargo</li>
                  <li>• Jerarquía (MAGISTRADO/FUNCIONARIO/EMPLEADO)</li>
                  <li>• Área</li>
                  <li>• Fecha de Ingreso</li>
                </ul>
              </div>
              
              <Button
                onClick={descargarPlantilla}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Paso 2: Validación */}
      {paso === 'validacion' && importacion && (
        <div className="space-y-6">
          {/* Resumen de validación */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">{importacion.validaciones.filas}</div>
                    <div className="text-gray-400 text-sm">Filas procesadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-white font-medium">
                      {importacion.preview.filter(emp => emp.valido).length}
                    </div>
                    <div className="text-gray-400 text-sm">Empleados válidos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-400" />
                  <div>
                    <div className="text-white font-medium">{importacion.validaciones.errores.length}</div>
                    <div className="text-gray-400 text-sm">Errores encontrados</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">{importacion.validaciones.duplicados.length}</div>
                    <div className="text-gray-400 text-sm">Duplicados</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview de empleados */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Preview de Empleados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-700">
                    <tr className="text-left">
                      <th className="p-4 text-gray-300 font-medium">Fila</th>
                      <th className="p-4 text-gray-300 font-medium">Legajo</th>
                      <th className="p-4 text-gray-300 font-medium">Nombre</th>
                      <th className="p-4 text-gray-300 font-medium">Email</th>
                      <th className="p-4 text-gray-300 font-medium">Cargo</th>
                      <th className="p-4 text-gray-300 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importacion.preview.slice(0, 10).map((empleado) => (
                      <tr 
                        key={empleado.fila} 
                        className={`border-b border-gray-800 ${
                          empleado.valido ? 'hover:bg-gray-800/30' : 'bg-red-500/10'
                        }`}
                      >
                        <td className="p-4 text-white">{empleado.fila}</td>
                        <td className="p-4 text-white">{empleado.legajo}</td>
                        <td className="p-4 text-white">{empleado.nombre} {empleado.apellido}</td>
                        <td className="p-4 text-white">{empleado.email}</td>
                        <td className="p-4 text-white">{empleado.cargo}</td>
                        <td className="p-4">
                          {empleado.valido ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-5 h-5 text-red-400" />
                              <span className="text-red-400 text-sm">
                                {empleado.errores.join(', ')}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-4">
            <Button
              onClick={reiniciar}
              variant="outline"
              className="flex-1"
            >
              Seleccionar Otro Archivo
            </Button>
            <Button
              onClick={() => setPaso('confirmacion')}
              disabled={importacion.preview.filter(emp => emp.valido).length === 0}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
            >
              Continuar con Importación
            </Button>
          </div>
        </div>
      )}

      {/* Paso 3: Confirmación */}
      {paso === 'confirmacion' && importacion && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Confirmar Importación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Confirmación requerida</span>
              </div>
              <p className="text-gray-300">
                Se importarán {importacion.preview.filter(emp => emp.valido).length} empleados válidos.
                Los empleados con errores serán omitidos.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setPaso('validacion')}
                variant="outline"
                className="flex-1"
              >
                Volver a Validación
              </Button>
              <Button
                onClick={confirmarImportacion}
                disabled={procesando}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {procesando ? 'Importando...' : 'Confirmar Importación'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 4: Resultado */}
      {paso === 'resultado' && (
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Importación Completada</h2>
              <p className="text-gray-300 mb-6">
                Los empleados han sido importados exitosamente al sistema.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push('/dashboard/empleados')}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Ver Lista de Empleados
                </Button>
                <Button
                  onClick={reiniciar}
                  variant="outline"
                >
                  Importar Más Empleados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
