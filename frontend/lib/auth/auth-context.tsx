'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from './auth-api'
import type { User, LoginCredentials, RegisterData } from './types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const userData = await authApi.getMe()
          setUser(userData)
        }
      } catch (error) {
        // Token might be expired, try to refresh
        try {
          await refreshToken()
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      const response = await authApi.login(credentials)
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      // Set user
      setUser(response.user)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)
      await authApi.register(data)
      // After successful registration, user needs to login
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await authApi.logout()
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error)
    } finally {
      // Clear local state
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      setIsLoading(false)
      router.push('/login')
    }
  }

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (!refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await authApi.refreshToken(refreshTokenValue)
      
      // Update access token
      localStorage.setItem('accessToken', response.accessToken)
      
      // Get updated user data
      const userData = await authApi.getMe()
      setUser(userData)
    } catch (error) {
      // Refresh failed, clear tokens and redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      router.push('/login')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
