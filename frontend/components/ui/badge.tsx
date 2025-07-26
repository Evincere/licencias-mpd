import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Variantes semánticas mejoradas
        success:
          "border-transparent bg-success-500/20 text-success-200 backdrop-blur-sm hover:bg-success-500/30 ring-success-500/20",
        danger:
          "border-transparent bg-danger-500/20 text-danger-200 backdrop-blur-sm hover:bg-danger-500/30 ring-danger-500/20",
        warning:
          "border-transparent bg-warning-500/20 text-warning-200 backdrop-blur-sm hover:bg-warning-500/30 ring-warning-500/20",
        info:
          "border-transparent bg-info-500/20 text-info-200 backdrop-blur-sm hover:bg-info-500/30 ring-info-500/20",
        analytics:
          "border-transparent bg-analytics-500/20 text-analytics-200 backdrop-blur-sm hover:bg-analytics-500/30 ring-analytics-500/20",
        neutral:
          "border-transparent bg-neutral-500/20 text-neutral-300 backdrop-blur-sm hover:bg-neutral-500/30 ring-neutral-500/20",
        // Variantes con bordes para mayor contraste
        "success-outline":
          "border-success-500/30 bg-success-500/10 text-success-300 backdrop-blur-sm hover:bg-success-500/20",
        "danger-outline":
          "border-danger-500/30 bg-danger-500/10 text-danger-300 backdrop-blur-sm hover:bg-danger-500/20",
        "warning-outline":
          "border-warning-500/30 bg-warning-500/10 text-warning-300 backdrop-blur-sm hover:bg-warning-500/20",
        "info-outline":
          "border-info-500/30 bg-info-500/10 text-info-300 backdrop-blur-sm hover:bg-info-500/20",
        // Estados específicos para solicitudes
        pendiente:
          "border-transparent bg-warning-500/20 text-warning-200 backdrop-blur-sm hover:bg-warning-500/30 ring-warning-500/20",
        aprobada:
          "border-transparent bg-success-500/20 text-success-200 backdrop-blur-sm hover:bg-success-500/30 ring-success-500/20",
        rechazada:
          "border-transparent bg-danger-500/20 text-danger-200 backdrop-blur-sm hover:bg-danger-500/30 ring-danger-500/20",
        en_revision:
          "border-transparent bg-info-500/20 text-info-200 backdrop-blur-sm hover:bg-info-500/30 ring-info-500/20",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

// Componente específico para estados de solicitudes
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'en_revision'
  showIcon?: boolean
}

function StatusBadge({ status, showIcon = true, className, ...props }: StatusBadgeProps) {
  const icons = {
    pendiente: '⏳',
    aprobada: '✅',
    rechazada: '❌',
    en_revision: '👁️'
  }

  const labels = {
    pendiente: 'Pendiente',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
    en_revision: 'En Revisión'
  }

  return (
    <Badge 
      variant={status} 
      className={cn("font-medium", className)} 
      {...props}
    >
      {showIcon && <span className="mr-1">{icons[status]}</span>}
      {labels[status]}
    </Badge>
  )
}

// Componente para métricas con iconos
interface MetricBadgeProps extends Omit<BadgeProps, 'variant'> {
  type: 'total' | 'pending' | 'approved' | 'rejected'
  value: number | string
  showIcon?: boolean
}

function MetricBadge({ type, value, showIcon = true, className, ...props }: MetricBadgeProps) {
  const config = {
    total: { variant: 'info' as const, icon: '👥', label: 'Total' },
    pending: { variant: 'warning' as const, icon: '⏳', label: 'Pendientes' },
    approved: { variant: 'success' as const, icon: '✅', label: 'Aprobadas' },
    rejected: { variant: 'danger' as const, icon: '❌', label: 'Rechazadas' }
  }

  const { variant, icon, label } = config[type]

  return (
    <Badge 
      variant={variant} 
      size="lg"
      className={cn("font-bold", className)} 
      {...props}
    >
      {showIcon && <span className="mr-1.5">{icon}</span>}
      <span className="text-lg">{value}</span>
      <span className="ml-1 text-xs opacity-80">{label}</span>
    </Badge>
  )
}

export { Badge, StatusBadge, MetricBadge, badgeVariants }
