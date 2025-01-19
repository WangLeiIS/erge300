'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Library, Book, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

type NavButtonVariant = "default" | "ghost"

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { username } = useAuth()

  const isHomePage = pathname === '/'
  const isCardPage = pathname.includes('/card/')
  const isMarksPage = pathname === '/profile/marks'
  const bookCode = isCardPage ? pathname.split('/').pop() : null

  // 统一的按钮样式逻辑
  const getButtonVariant = useCallback((isActive: boolean): NavButtonVariant => {
    return isActive ? "default" : "ghost"
  }, [])

  // 优化书籍按钮点击逻辑
  const handleBookClick = useCallback(() => {
    if (isCardPage && bookCode) {
      router.push(`/card/${bookCode}`)
    } else {
      const lastReadBook = localStorage.getItem('last_read_book')
      if (lastReadBook) {
        const { bookCode } = JSON.parse(lastReadBook)
        router.push(`/card/${bookCode}`)
      } else {
        router.push('/')
      }
    }
  }, [isCardPage, bookCode, router])

  // 处理标记按钮点击
  const handleMarksClick = useCallback(() => {
    if (!username) {
      router.push('/auth')
      return
    }
    router.push('/profile/marks')
  }, [router, username])

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="container mx-auto max-w-6xl flex justify-around p-4">
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
          variant={getButtonVariant(isMarksPage)}
          className="flex flex-col items-center gap-1"
          onClick={handleMarksClick}
        >
          <Bookmark className="h-6 w-6" />
        </Button>
      </div>
    </nav>
  )
}