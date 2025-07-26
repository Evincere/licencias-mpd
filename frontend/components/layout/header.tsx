'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function Header() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Sesión cerrada exitosamente')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <header className="glass-header h-16 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empleados, solicitudes..."
            className="pl-10 glass-input bg-glass-bg/50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-glass-hover"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-glass-hover"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user?.nombre.charAt(0)}{user?.apellido.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.rol}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 glass-card border-glass-border"
          >
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-glass-hover">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-glass-hover">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="hover:bg-glass-hover text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
