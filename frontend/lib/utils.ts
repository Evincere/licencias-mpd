import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount)
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function getInitials(name: string, lastName?: string) {
  if (lastName) {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
