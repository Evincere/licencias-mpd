import React from 'react'
import { cn } from '@/lib/utils'

// ===== TIPOS BASE =====
type SemanticVariant = 'success' | 'danger' | 'warning' | 'info' | 'analytics' | 'neutral'
type Size = 'sm' | 'md' | 'lg' | 'xl'

// ===== BOTÓN SEMÁNTICO =====
interface SemanticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: SemanticVariant | 'ghost'
  size?: Size
  children: React.ReactNode
}

export function SemanticButton({ 
  variant, 
  size = 'md', 
  className, 
  children, 
  ...props 
}: SemanticButtonProps) {
  const baseClass = variant === 'ghost' ? 'btn-ghost' : `btn-${variant}`
  
  return (
    <button 
      className={cn(baseClass, className)} 
      {...props}
    >
      {children}
    </button>
  )
}

// ===== CARD SEMÁNTICA =====
interface SemanticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SemanticVariant | 'base'
  children: React.ReactNode
}

export function SemanticCard({ 
  variant = 'base', 
  className, 
  children, 
  ...props 
}: SemanticCardProps) {
  const cardClass = variant === 'base' ? 'card-base' : `card-${variant}`
  
  return (
    <div 
      className={cn(cardClass, className)} 
      {...props}
    >
      {children}
    </div>
  )
}

// ===== BADGE SEMÁNTICO =====
interface SemanticBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: SemanticVariant
  children: React.ReactNode
}

export function SemanticBadge({ 
  variant, 
  className, 
  children, 
  ...props 
}: SemanticBadgeProps) {
  return (
    <span 
      className={cn(`badge-${variant}`, className)} 
      {...props}
    >
      {children}
    </span>
  )
}

// ===== ALERTA SEMÁNTICA =====
interface SemanticAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: SemanticVariant
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}

export function SemanticAlert({ 
  variant, 
  title, 
  children, 
  dismissible, 
  onDismiss, 
  className, 
  ...props 
}: SemanticAlertProps) {
  return (
    <div 
      className={cn(`alert-${variant}`, className)} 
      {...props}
    >
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Cerrar alerta"
        >
          ✕
        </button>
      )}
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div>{children}</div>
    </div>
  )
}

// ===== CARD DE MÉTRICA =====
interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: SemanticVariant
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
}

export function MetricCard({ 
  variant, 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  className, 
  ...props 
}: MetricCardProps) {
  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '➡️'
  }

  const trendColors = {
    up: 'text-success',
    down: 'text-danger',
    stable: 'text-neutral'
  }

  return (
    <div 
      className={cn(`metric-card ${variant}`, className)} 
      {...props}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium text-${variant}-muted`}>{title}</h3>
        {icon && <div className={`text-${variant}`}>{icon}</div>}
      </div>
      
      <div className={`text-2xl font-bold text-${variant}`}>{value}</div>
      
      {subtitle && (
        <p className={`text-xs text-${variant}-muted mt-1`}>{subtitle}</p>
      )}
      
      {trend && trendValue && (
        <div className={cn("flex items-center gap-1 text-xs mt-2", trendColors[trend])}>
          <span>{trendIcons[trend]}</span>
          {trendValue}
        </div>
      )}
    </div>
  )
}

// ===== ACCIÓN RÁPIDA =====
interface QuickActionProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: SemanticVariant
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick?: () => void
}

export function QuickAction({ 
  variant, 
  title, 
  subtitle, 
  icon, 
  onClick, 
  className, 
  ...props 
}: QuickActionProps) {
  return (
    <div 
      className={cn(`quick-action-button ${variant}-action group`, className)} 
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center space-x-3">
        <div className="quick-action-icon">
          {icon}
        </div>
        <div>
          <p className="quick-action-title">{title}</p>
          <p className="quick-action-subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

// ===== INPUT SEMÁNTICO =====
interface SemanticInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: SemanticVariant | 'base'
  label?: string
  error?: string
  helper?: string
}

export function SemanticInput({ 
  variant = 'base', 
  label, 
  error, 
  helper, 
  className, 
  ...props 
}: SemanticInputProps) {
  const inputClass = variant === 'base' ? 'input-base' : `input-${variant}`
  const finalVariant = error ? 'danger' : variant
  
  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium text-${finalVariant}`}>
          {label}
        </label>
      )}
      
      <input 
        className={cn(
          finalVariant === 'base' ? 'input-base' : `input-${finalVariant}`, 
          className
        )} 
        {...props}
      />
      
      {error && (
        <p className="text-danger text-xs">{error}</p>
      )}
      
      {helper && !error && (
        <p className="text-neutral-muted text-xs">{helper}</p>
      )}
    </div>
  )
}

// ===== TEXTO SEMÁNTICO =====
interface SemanticTextProps extends React.HTMLAttributes<HTMLElement> {
  variant: SemanticVariant
  muted?: boolean
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: React.ReactNode
}

export function SemanticText({ 
  variant, 
  muted = false, 
  as: Component = 'p', 
  className, 
  children, 
  ...props 
}: SemanticTextProps) {
  const textClass = muted ? `text-${variant}-muted` : `text-${variant}`
  
  return (
    <Component 
      className={cn(textClass, className)} 
      {...props}
    >
      {children}
    </Component>
  )
}
