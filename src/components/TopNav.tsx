'use client'

import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/contexts/auth-context'

export default function TopNav() {
  const router = useRouter()
  const { username, isAuthenticated } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-background border-b">
      <div className="container mx-auto max-w-6xl flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Read.Yoga</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthenticated ? (
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  个人信息
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => router.push('/auth')}>
                  登录
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
} 