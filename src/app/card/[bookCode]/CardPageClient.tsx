'use client'

import { useEffect, useState, useCallback } from 'react'
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

interface Book {
  book_id: number
  book_code: string
  book_name: string
}

interface Chapter {
  chapter_id: number
  chapter_name: string
  subchapters?: Chapter[]
}

interface CardPageClientProps {
  bookCode: string
  initialBook: Book
}

export default function CardPageClient({ bookCode, initialBook }: CardPageClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [currentChapter, setCurrentChapter] = useState<number | null>(null)
  const [chapterName, setChapterName] = useState<string>('')
  const [chapters, setChapters] = useState<Chapter[]>([])

  // 扁平化章节树的辅助函数
  const flattenChapters = (chapters: Chapter[]): Chapter[] => {
    return chapters.reduce((flat: Chapter[], chapter) => {
      return flat.concat([chapter], chapter.subchapters ? flattenChapters(chapter.subchapters) : [])
    }, [])
  }

  const findNextChapter = useCallback((chapters: Chapter[], currentChapterId: number): Chapter | null => {
    const flatChapters = flattenChapters(chapters)
    const currentIndex = flatChapters.findIndex(c => c.chapter_id === currentChapterId)
    
    if (currentIndex !== -1 && currentIndex < flatChapters.length - 1) {
      return flatChapters[currentIndex + 1]
    }
    return null
  }, [])

  const findPreviousChapter = useCallback((chapters: Chapter[], currentChapterId: number): Chapter | null => {
    const flatChapters = flattenChapters(chapters)
    const currentIndex = flatChapters.findIndex(c => c.chapter_id === currentChapterId)
    
    if (currentIndex > 0) {
      return flatChapters[currentIndex - 1]
    }
    return null
  }, [])

  const isFirstChapter = useCallback((chapterId: number) => {
    const flatChapters = flattenChapters(chapters)
    return flatChapters[0]?.chapter_id === chapterId
  }, [chapters])

  const isLastChapter = useCallback((chapterId: number) => {
    const flatChapters = flattenChapters(chapters)
    return flatChapters[flatChapters.length - 1]?.chapter_id === chapterId
  }, [chapters])

  const isBookFirstPage = useCallback((chapterId: number, cardNum: number) => {
    return isFirstChapter(chapterId) && cardNum <= 1
  }, [isFirstChapter])

  const isBookLastPage = useCallback((chapterId: number, cardNum: number, totalCards: number) => {
    return isLastChapter(chapterId) && cardNum >= totalCards
  }, [isLastChapter])

  // 修改 handleChapterSelect 函数，添加 cardNum 参数
  const handleChapterSelect = useCallback((chapterId: number, name: string, cardNum: number = 1) => {
    setCurrentChapter(chapterId)
    setChapterName(name)
    
    // 保存阅读进度，使用传入的 cardNum
    localStorage.setItem(`book_progress_${bookCode}`, JSON.stringify({
      chapterId,
      chapterName: name,
      cardNum  // 使用传入的 cardNum，而不是固定为 1
    }))
  }, [bookCode])

  // 修改恢复进度的部分
  useEffect(() => {
    if (book?.book_id) {
      const loadChapters = async () => {
        try {
          const result = await fetchChapters(book.book_id)
          if (result.error) {
            throw new Error(result.error)
          }
          if (!result.chapters) {
            throw new Error('No chapters data received')
          }
          setChapters(result.chapters)
          
          // 尝试恢复上次阅读进度
          const savedProgress = localStorage.getItem(`book_progress_${bookCode}`)
          if (savedProgress) {
            try {
              const progress = JSON.parse(savedProgress)
              console.log('Restoring progress:', progress)
              // 传入保存的 cardNum
              handleChapterSelect(progress.chapterId, progress.chapterName, progress.cardNum)
            } catch (error) {
              console.error('Failed to parse saved progress:', error)
            }
          } else if (result.chapters.length > 0) {
            // 如果没有保存的进度，从第一章第一页开始
            const firstChapter = result.chapters[0]
            handleChapterSelect(firstChapter.chapter_id, firstChapter.chapter_name, 1)
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
  }, [book?.book_id, bookCode, handleChapterSelect, toast])

  useEffect(() => {
    console.log('CardPageClient: Setting book data')
    setBook(initialBook)
    localStorage.setItem('last_read_book', JSON.stringify({
      bookCode,
      bookName: initialBook.book_name,
      timestamp: Date.now()
    }))
  }, [initialBook, bookCode])

  // 修改其他调用 handleChapterSelect 的地方
  const handleNextChapter = useCallback(() => {
    if (!currentChapter) return
    
    const nextChapter = findNextChapter(chapters, currentChapter)
    if (nextChapter) {
      handleChapterSelect(nextChapter.chapter_id, nextChapter.chapter_name, 1) // 新章节从第一页开始
    }
  }, [chapters, currentChapter, findNextChapter, handleChapterSelect])

  const handlePreviousChapter = useCallback(() => {
    if (!currentChapter) return
    
    const prevChapter = findPreviousChapter(chapters, currentChapter)
    if (prevChapter) {
      handleChapterSelect(prevChapter.chapter_id, prevChapter.chapter_name, 1) // 新章节从第一页开始
    }
  }, [chapters, currentChapter, findPreviousChapter, handleChapterSelect])

  if (!book) {
    return null
  }

  return (
    <main className="container mx-auto max-w-6xl p-4">
      <div className="flex items-center mb-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[340px] overflow-hidden flex flex-col">
            <SheetHeader>
              <SheetTitle>{book.book_name}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex-1 overflow-y-auto scrollbar-hide">
              <ChapterList 
                bookId={book.book_id} 
                onChapterSelect={handleChapterSelect}
                onInitialChapter={(chapterId, name) => {
                  if (!currentChapter) {
                    handleChapterSelect(chapterId, name)
                  }
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1 text-center flex items-center justify-center">
          <h1 className="text-sm font-medium text-foreground/80">
            {book.book_name}
            {chapterName && (
              <>
                <span className="mx-2 text-foreground/30">|</span>
                <span className="text-foreground/60">{chapterName}</span>
              </>
            )}
          </h1>
        </div>
      </div>
      <div className="w-full">
        {currentChapter && (
          <CardViewer 
            bookId={book.book_id}
            chapterId={currentChapter}
            chapterName={chapterName}
            initialBookCode={bookCode}
            onNextChapter={handleNextChapter}
            onPreviousChapter={handlePreviousChapter}
            isFirstChapter={isFirstChapter(currentChapter)}
            isLastChapter={isLastChapter(currentChapter)}
            isBookFirstPage={(cardNum) => isBookFirstPage(currentChapter, cardNum)}
            isBookLastPage={(cardNum, totalCards) => isBookLastPage(currentChapter, cardNum, totalCards)}
          />
        )}
      </div>
    </main>
  )
}