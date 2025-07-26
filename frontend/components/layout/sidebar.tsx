'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  BarChart3,
  Calendar,
  PieChart,
  Brain,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'supervisor', 'empleado', 'rrhh'],
  },
  {
    name: 'Empleados',
    href: '/dashboard/empleados',
    icon: Users,
    roles: ['admin', 'supervisor', 'rrhh'],
  },
  {
    name: 'Solicitudes',
    href: '/dashboard/solicitudes',
    icon: FileText,
    roles: ['admin', 'supervisor', 'empleado', 'rrhh'],
  },
  {
    name: 'Calendario',
    href: '/dashboard/calendario',
    icon: Calendar,
    roles: ['admin', 'supervisor', 'empleado', 'rrhh'],
  },
  {
    name: 'Reportes',
    href: '/dashboard/reportes',
    icon: PieChart,
    roles: ['admin', 'supervisor', 'rrhh'],
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['admin', 'supervisor', 'rrhh'],
  },
  {
    name: 'Inteligencia IA',
    href: '/dashboard/ia',
    icon: Brain,
    roles: ['admin', 'supervisor', 'rrhh'],
  },
  {
    name: 'WhatsApp',
    href: '/dashboard/whatsapp',
    icon: MessageSquare,
    roles: ['admin', 'supervisor', 'rrhh'],
  },
  {
    name: 'Configuración',
    href: '/dashboard/configuracion',
    icon: Settings,
    roles: ['admin'],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavigation = navigation.filter(item =>
    user?.rol && item.roles.includes(user.rol)
  )

  return (
    <div
      className={cn(
        'glass-sidebar h-full transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-glass-border">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Sistema MPD
                </h2>
                <p className="text-xs text-muted-foreground">Licencias</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 hover:bg-glass-hover"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'hover:bg-glass-hover hover:scale-105',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-muted-foreground hover:text-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        {!collapsed && user && (
          <div className="p-4 border-t border-glass-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.rol}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
