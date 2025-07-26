'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password })
      toast.success('¡Bienvenido al sistema!')
      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>
      
      {/* Login Card */}
      <Card className="glass-card w-full max-w-md relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Sistema de Licencias
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Ministerio Público de la Defensa - Mendoza
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="glass-card border-red-500/20 bg-red-500/10">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@mpd.gov.ar"
                required
                disabled={isLoading}
                className="glass-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="glass-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full glass-button bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Problemas para acceder?{' '}
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                Contactar soporte
              </button>
            </p>
          </div>
          
          {/* Demo Credentials */}
          <div className="mt-6 p-4 glass-card bg-blue-500/10 border-blue-500/20">
            <p className="text-xs text-blue-300 font-medium mb-2">Credenciales de prueba:</p>
            <div className="text-xs text-blue-200 space-y-1">
              <p>Email: admin@mpd.gov.ar</p>
              <p>Contraseña: admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
