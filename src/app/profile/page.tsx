'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getUsername, clearAuth } from '@/lib/auth'
import { logout } from '@/app/auth/action'
import { useToast } from '@/hooks/use-toast'
import { ThemeToggle } from "@/components/ThemeToggle"

export default function ProfilePage() {
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const currentUsername = getUsername()
    if (!currentUsername) {
      router.push('/auth')
      return
    }
    setUsername(currentUsername)
  }, [router])

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.error) {
        throw new Error(result.error)
      }
      clearAuth()
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      })
      router.push('/auth')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Logout failed',
        variant: 'destructive',
      })
    }
  }

  if (!username) {
    return null
  }

  return (
    <div className="container max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center">
      <Card className="backdrop-blur-sm bg-card/50">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl text-center">个人信息</CardTitle>
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-medium text-primary">
              {username.charAt(0).toUpperCase()}
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