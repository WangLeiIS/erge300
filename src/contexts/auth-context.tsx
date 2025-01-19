'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getUsername } from '@/lib/auth'

interface AuthContextType {
  username: string | null
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType>({
  username: null,
  refreshAuth: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)

  const refreshAuth = () => {
    const currentUsername = getUsername()
    setUsername(currentUsername)
  }

  useEffect(() => {
    refreshAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ username, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 