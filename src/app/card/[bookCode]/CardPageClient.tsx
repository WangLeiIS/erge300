'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import CardViewer from '@/components/CardViewer'
import ChapterList from '@/components/ChapterList'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle 
} from '@/components/ui/sheet'
import { useToast } from "@/hooks/use-toast"
import { fetchChapters } from '@/app/action'
import { useRouter } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'
import type { BookState, Book, Chapter } from '@/types/book'
import { useAuth } from '@/hooks/useAuth'

interface CardPageClientProps {
  bookCode: string
  initialBook: Book
}

const findNextChapter = (chapters: Chapter[], currentChapterId: number) => {
  const flatChapters = chapters.reduce((flat: Chapter[], chapter) => {
    return flat.concat([chapter], chapter.subchapters || [])
  }, [])
  const currentIndex = flatChapters.findIndex(c => c.chapter_id === currentChapterId)
  return flatChapters[currentIndex + 1]
}

const flattenChapters = (chapters: Chapter[]) => {
  return chapters.reduce((flat: Chapter[], chapter) => {
    return flat.concat([chapter], chapter.subchapters || [])
  }, [])
}

const findPreviousChapter = (chapters: Chapter[], currentChapterId: number) => {
  const flatChapters = flattenChapters(chapters)
  const currentIndex = flatChapters.findIndex(c => c.chapter_id === currentChapterId)
  return flatChapters[currentIndex - 1]
}

export default function CardPageClient({ bookCode, initialBook }: CardPageClientProps) {
  const { isAuthenticated } = useAuth({
    redirectTo: `/card/${bookCode}`,
    requireAuth: true
  })

  if (!isAuthenticated) return null

  const { toast } = useToast()
  const router = useRouter()
  const [bookState, setBookState] = useState<BookState>({
    book: null,
    currentChapter: null,
    chapters: []
  })

  const handleChapterSelect = useCallback((chapterId: number, name: string) => {
    setBookState(prev => ({
      ...prev,
      currentChapter: {
        id: chapterId,
        name
      }
    }))
    
    localStorage.setItem(`reading_progress_${bookCode}`, JSON.stringify({
      chapterId,
      chapterName: name
    }))
  }, [bookCode])

  useEffect(() => {
    if (bookState.book?.book_id) {
      const loadChapters = async () => {
        try {
          const result = await fetchChapters(bookState.book!.book_id)
          if (result.error) throw new Error(result.error)
          if (!result.chapters) throw new Error('No chapters data received')
          
          setBookState(prev => ({
            ...prev,
            chapters: result.chapters
          }))
          
          if (!bookState.currentChapter && result.chapters.length > 0) {
            const firstChapter = result.chapters[0]
            handleChapterSelect(firstChapter.chapter_id, firstChapter.chapter_name)
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to fetch chapters',
            variant: 'destructive',
          })
        }
      }
      loadChapters()
    }
  }, [bookState.book?.book_id, bookState.currentChapter])

  useEffect(() => {
    console.log('CardPageClient: Checking auth token')
    const token = getAuthToken()
    console.log('CardPageClient: Token exists:', !!token)
    
    if (!token) {
      // 检查当前是否已经在登录页面，避免重复重定向
      const currentPath = window.location.pathname
      console.log('CardPageClient: Current path:', currentPath)
      
      if (currentPath !== '/auth') {
        const redirectPath = `/card/${bookCode}`
        console.log('CardPageClient: Setting redirect path:', redirectPath)
        localStorage.setItem('redirect_after_login', redirectPath)
        
        toast({
          title: 'Authentication Required',
          description: 'Please login to read books',
          variant: 'destructive',
        })
        router.push('/auth')
      }
      return
    }
    
    console.log('CardPageClient: Setting book data')
    setBookState(prev => ({
      ...prev,
      book: initialBook
    }))
    localStorage.setItem('last_read_book', JSON.stringify({
      bookCode,
      bookName: initialBook.book_name,
      timestamp: Date.now()
    }))
  }, [initialBook, bookCode, router, toast])

  const handleNextChapter = useCallback(() => {
    const { currentChapter } = bookState
    if (!currentChapter) return
    
    const nextChapter = findNextChapter(bookState.chapters, currentChapter.id)
    if (nextChapter) {
      handleChapterSelect(nextChapter.chapter_id, nextChapter.chapter_name)
    }
  }, [bookState, handleChapterSelect])

  const handlePreviousChapter = useCallback(() => {
    const { currentChapter } = bookState
    if (!currentChapter) return
    
    const prevChapter = findPreviousChapter(bookState.chapters, currentChapter.id)
    if (prevChapter) {
      handleChapterSelect(prevChapter.chapter_id, prevChapter.chapter_name)
    }
  }, [bookState, handleChapterSelect])

  const flattenedChapters = useMemo(() => {
    return bookState.chapters.reduce((flat: Chapter[], chapter) => {
      return flat.concat([chapter], chapter.subchapters ? flattenChapters(chapter.subchapters) : [])
    }, [])
  }, [bookState.chapters])

  const isFirstChapter = useCallback((chapterId: number) => {
    return flattenedChapters[0]?.chapter_id === chapterId
  }, [flattenedChapters])

  const isLastChapter = useCallback((chapterId: number) => {
    return flattenedChapters[flattenedChapters.length - 1]?.chapter_id === chapterId
  }, [flattenedChapters])

  const isBookFirstPage = useCallback((chapterId: number, cardNum: number) => {
    return isFirstChapter(chapterId) && cardNum === 1
  }, [isFirstChapter])

  const isBookLastPage = useCallback((chapterId: number, cardNum: number, totalCards: number) => {
    return isLastChapter(chapterId) && cardNum === totalCards
  }, [isLastChapter])

  if (!bookState.book) {
    return null
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center mb-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute left-4">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[340px] overflow-hidden flex flex-col">
            <SheetHeader>
              <SheetTitle>{bookState.book.book_name}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex-1 overflow-y-auto scrollbar-hide">
              <ChapterList 
                bookId={bookState.book.book_id} 
                onChapterSelect={handleChapterSelect}
                onInitialChapter={(chapterId, name) => {
                  if (!bookState.currentChapter) {
                    handleChapterSelect(chapterId, name)
                  }
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1 text-center flex items-center justify-center">
          <h1 className="text-sm font-medium text-foreground/80">
            {bookState.book.book_name}
            {bookState.currentChapter?.name && (
              <>
                <span className="mx-2 text-foreground/30">|</span>
                <span className="text-foreground/60">{bookState.currentChapter.name}</span>
              </>
            )}
          </h1>
        </div>
      </div>
      <div className="w-full">
        {bookState.currentChapter && (
          <CardViewer 
            bookId={bookState.book.book_id}
            chapterId={bookState.currentChapter.id}
            initialBookCode={bookCode}
            onNextChapter={handleNextChapter}
            onPreviousChapter={handlePreviousChapter}
            isFirstChapter={isFirstChapter(bookState.currentChapter.id)}
            isLastChapter={isLastChapter(bookState.currentChapter.id)}
            isBookFirstPage={(cardNum) => {
              if (!bookState.currentChapter) return false
              return isBookFirstPage(bookState.currentChapter.id, cardNum)
            }}
            isBookLastPage={(cardNum, totalCards) => {
              if (!bookState.currentChapter) return false
              return isBookLastPage(bookState.currentChapter.id, cardNum, totalCards)
            }}
          />
        )}
      </div>
    </main>
  )
}