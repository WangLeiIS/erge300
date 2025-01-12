'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Library, Book, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useCallback } from 'react'
import { getUsername } from '@/lib/auth'

type NavButtonVariant = "default" | "ghost"

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [username, setUsername] = useState<string | null>(null)

  // 统一的路径判断逻辑
  const isHomePage = pathname === '/'
  const isCardPage = pathname.includes('/card/')
  const isProfilePage = pathname === '/profile'
  const bookCode = isCardPage ? pathname.split('/').pop() : null

  // 优化用户状态管理
  useEffect(() => {
    const currentUsername = getUsername()
    if (username !== currentUsername) {
      setUsername(currentUsername)
    }
  }, [username])

  // 统一的按钮样式逻辑
  const getButtonVariant = useCallback((isActive: boolean): NavButtonVariant => {
    return isActive ? "default" : "ghost"
  }, [])

  // 优化书籍按钮点击逻辑
  const handleBookClick = useCallback(() => {
    if (isCardPage && bookCode) {
      // 如果当前在阅读页面，刷新当前页面
      router.push(`/card/${bookCode}`)
    } else {
      // 获取最后阅读的书籍信息
      const lastReadBook = localStorage.getItem('last_read_book')
      if (lastReadBook) {
        const { bookCode } = JSON.parse(lastReadBook)
        router.push(`/card/${bookCode}`)
      } else {
        // 如果没有阅读记录，跳转到首页
        router.push('/')
      }
    }
  }, [isCardPage, bookCode, router])

  // 优化用户按钮点击逻辑
  const handleProfileClick = useCallback(() => {
    router.push(username ? '/profile' : '/auth')
  }, [router, username])

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around p-4 bg-background border-t">
      <Button 
        variant={getButtonVariant(isHomePage)}
        className="flex flex-col items-center gap-1"
        onClick={() => router.push('/')}
      >
        <Library className="h-6 w-6" />
      </Button>
      <Button 
        variant={getButtonVariant(isCardPage)}
        className="flex flex-col items-center gap-1"
        onClick={handleBookClick}
      >
        <Book className="h-6 w-6" />
      </Button>
      <Button
        variant={getButtonVariant(isProfilePage)}
        className="flex flex-col items-center gap-1"
        onClick={handleProfileClick}
      >
        <User className="h-6 w-6" />
      </Button>
    </nav>
  )
}