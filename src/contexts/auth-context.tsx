'use client'

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  username: string | null
  isAuthenticated: boolean
  login: (token: string, username: string, userId: number) => void
  logout: () => void
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  const login = useCallback((token: string, username: string, userId: number) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('username', username)
    localStorage.setItem('user_id', userId.toString())
    setUsername(username)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('username')
    localStorage.removeItem('user_id')
    setUsername(null)
    setIsAuthenticated(false)
    router.push('/auth')
  }, [router])

  const refreshAuth = useCallback(() => {
    const currentUsername = localStorage.getItem('username')
    const token = localStorage.getItem('auth_token')
    setUsername(currentUsername)
    setIsAuthenticated(!!token && !!currentUsername)
  }, [])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  return (
    <AuthContext.Provider value={{ username, isAuthenticated, login, logout, refreshAuth }}>
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