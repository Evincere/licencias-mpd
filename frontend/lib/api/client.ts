import type { ApiResponse, ApiError } from '@/lib/auth/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get token from localStorage
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') 
      : null

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle different response types
      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        const error: ApiError = {
          success: false,
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          details: data,
        }
        
        // Handle 401 errors (token expired)
        if (response.status === 401 && typeof window !== 'undefined') {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              })
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json()
                localStorage.setItem('accessToken', refreshData.data.accessToken)
                
                // Retry original request with new token
                const retryConfig = {
                  ...config,
                  headers: {
                    ...config.headers,
                    Authorization: `Bearer ${refreshData.data.accessToken}`,
                  },
                }
                
                const retryResponse = await fetch(url, retryConfig)
                const retryData = retryResponse.ok 
                  ? await retryResponse.json() 
                  : await retryResponse.text()
                
                if (retryResponse.ok) {
                  return retryData
                }
              }
            } catch (refreshError) {
              // Refresh failed, clear tokens
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              window.location.href = '/login'
            }
          } else {
            // No refresh token, redirect to login
            window.location.href = '/login'
          }
        }
        
        throw error
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw {
          success: false,
          message: error.message,
        } as ApiError
      }
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
