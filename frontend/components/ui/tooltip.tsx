"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-lg border border-white/10 bg-neutral-900/95 backdrop-blur-md px-3 py-1.5 text-sm text-white shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Tooltip semántico con variantes de color
interface SemanticTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'analytics'
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
}

const SemanticTooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  SemanticTooltipProps
>(({ children, content, variant = 'default', side = 'top', delayDuration = 300 }, ref) => {
  const variantClasses = {
    default: "bg-neutral-900/95 border-white/10 text-white",
    success: "bg-success-900/95 border-success-500/20 text-success-100",
    danger: "bg-danger-900/95 border-danger-500/20 text-danger-100",
    warning: "bg-warning-900/95 border-warning-500/20 text-warning-100",
    info: "bg-info-900/95 border-info-500/20 text-info-100",
    analytics: "bg-analytics-900/95 border-analytics-500/20 text-analytics-100"
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          ref={ref}
          side={side}
          className={cn(
            "z-50 overflow-hidden rounded-lg backdrop-blur-md px-3 py-1.5 text-sm shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            variantClasses[variant]
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
SemanticTooltip.displayName = "SemanticTooltip"

// Tooltip informativo con icono
interface InfoTooltipProps {
  children: React.ReactNode
  title?: string
  description: string
  variant?: 'info' | 'warning' | 'success'
}

function InfoTooltip({ children, title, description, variant = 'info' }: InfoTooltipProps) {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅'
  }

  return (
    <SemanticTooltip
      variant={variant}
      content={
        <div className="max-w-xs">
          {title && (
            <div className="flex items-center gap-2 font-semibold mb-1">
              <span>{icons[variant]}</span>
              {title}
            </div>
          )}
          <p className="text-xs opacity-90">{description}</p>
        </div>
      }
    >
      {children}
    </SemanticTooltip>
  )
}

// Tooltip para métricas con detalles
interface MetricTooltipProps {
  children: React.ReactNode
  metric: string
  value: number | string
  description?: string
  trend?: 'up' | 'down' | 'stable'
  comparison?: string
}

function MetricTooltip({ 
  children, 
  metric, 
  value, 
  description, 
  trend, 
  comparison 
}: MetricTooltipProps) {
  const trendIcons = {
    up: '📈',
    down: '📉',
    stable: '➡️'
  }

  const trendColors = {
    up: 'text-success-300',
    down: 'text-danger-300',
    stable: 'text-neutral-300'
  }

  return (
    <SemanticTooltip
      variant="info"
      content={
        <div className="max-w-sm">
          <div className="font-semibold text-info-100 mb-2">
            {metric}: <span className="text-white">{value}</span>
          </div>
          {description && (
            <p className="text-xs text-info-200 mb-2">{description}</p>
          )}
          {trend && comparison && (
            <div className={cn("flex items-center gap-1 text-xs", trendColors[trend])}>
              <span>{trendIcons[trend]}</span>
              {comparison}
            </div>
          )}
        </div>
      }
    >
      {children}
    </SemanticTooltip>
  )
}

export { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  SemanticTooltip,
  InfoTooltip,
  MetricTooltip
}
