export interface User {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'admin' | 'supervisor' | 'empleado' | 'rrhh'
  fechaCreacion?: string
  ultimoAcceso?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  nombre: string
  apellido: string
  rol?: 'admin' | 'supervisor' | 'empleado' | 'rrhh'
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface ApiError {
  success: false
  message: string
  details?: any
  status?: number
}
