import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './use-toast'
import { getAuthToken, getUserId, getUsername } from '@/lib/auth'

interface UseAuthOptions {
  redirectTo?: string
  requireAuth?: boolean
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter()
  const { toast } = useToast()
  const token = getAuthToken()
  const userId = getUserId()
  const username = getUsername()
  const isAuthenticated = Boolean(token && userId)

  useEffect(() => {
    if (options.requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname
      if (currentPath !== '/auth' && options.redirectTo) {
        localStorage.setItem('redirect_after_login', options.redirectTo)
        
        toast({
          title: 'Authentication Required',
          description: 'Please login to continue',
          variant: 'destructive',
        })
        router.push('/auth')
      }
    }
  }, [isAuthenticated, options.requireAuth, options.redirectTo, router, toast])

  return {
    token,
    userId,
    username,
    isAuthenticated
  }
} 