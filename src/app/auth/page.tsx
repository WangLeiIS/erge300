'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { register, login } from './action'
import { setAuthToken, setUsername, setUserId } from '@/lib/auth'
import { useAuth } from '@/contexts/auth-context'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsernameState] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const { toast } = useToast()
  const router = useRouter()
  const { login: authLogin } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isLogin) {
        console.log('Auth: Attempting login for user:', username)
        const result = await login(username, password)
        if (result.error) {
          throw new Error(result.error)
        }
        
        authLogin(result.access_token, username, result.user_id)
        
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        })
        
        const redirectPath = localStorage.getItem('redirect_after_login') || '/'
        localStorage.removeItem('redirect_after_login')
        router.push(redirectPath)
      } else {
        const result = await register(username, password, inviteCode)
        if (result.error) {
          throw new Error(result.error)
        }
        toast({
          title: 'Success',
          description: 'Registered successfully. Please login.',
        })
        setIsLogin(true)
      }
    } catch (error) {
      console.error('Auth: Error during authentication:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container max-w-md mx-auto p-4 h-screen flex items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsernameState(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && (
              <Input
                placeholder="Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            )}
            <Button type="submit" className="w-full">
              {isLogin ? 'Login' : 'Register'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Need an account?' : 'Already have an account?'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 