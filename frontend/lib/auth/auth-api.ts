import { apiClient } from '@/lib/api/client'
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  RefreshTokenResponse, 
  User 
} from './types'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  async register(data: RegisterData): Promise<void> {
    await apiClient.post('/auth/register', data)
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me')
    return response.data.user
  },
}
