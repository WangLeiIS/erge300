'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Library, Book } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const bookCode = pathname.split('/').pop()
  const isCardPage = pathname.includes('/card/')

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around p-4 bg-background border-t">
      <Button 
        variant={!isCardPage ? "default" : "ghost"}
        className="flex flex-col items-center gap-1"
        onClick={() => router.push('/')}
      >
        <Library className="h-6 w-6" />
      </Button>
      <Button 
        variant={isCardPage ? "default" : "ghost"}
        className="flex flex-col items-center gap-1"
        onClick={() => {
          if (isCardPage && bookCode) {
            // 刷新当前阅读页面
            router.refresh()
          } else {
            // 返回上一个阅读页面或书架
            router.back()
          }
        }}
      >
        <Book className="h-6 w-6" />
      </Button>
    </div>
  )
}