'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from '@/contexts/auth-context'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { username, isAuthenticated, logout: authLogout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('redirect_after_login', '/profile')
      router.push('/auth')
    }
  }, [isAuthenticated, router])

  const handleLogout = async () => {
    try {
      authLogout()
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Logout failed',
        variant: 'destructive',
      })
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center">
      <Card className="backdrop-blur-sm bg-card/50">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl text-center">个人信息</CardTitle>
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-medium text-primary">
              {username?.charAt(0).toUpperCase()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <span className="text-xl font-medium">{username}</span>
          </div>
          <div className="space-y-3 pt-4">
            <Button 
              variant="outline" 
              className="w-full bg-primary/5 hover:bg-primary/10"
              onClick={() => router.push('/profile/marks')}
            >
              我的标记
            </Button>
            <Button 
              variant="outline"
              className="w-full bg-destructive/5 hover:bg-destructive/10 text-destructive"
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 