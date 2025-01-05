'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Library, Book } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const bookCode = pathname.split('/').pop()

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around p-4 bg-background border-t">
      <Button 
        variant="ghost" 
        className="flex flex-col items-center gap-1"
        onClick={() => router.push('/')}
      >
        <Library className="h-6 w-6" />
        <span className="text-sm">书架</span>
      </Button>
      <Button 
        variant="ghost" 
        className="flex flex-col items-center gap-1"
        onClick={() => {
          if (pathname.includes('/card/')) {
            router.push(`/card/${bookCode}`)
          } else {
            router.back()
          }
        }}
      >
        <Book className="h-6 w-6" />
        <span className="text-sm">阅读</span>
      </Button>
    </div>
  )
} 