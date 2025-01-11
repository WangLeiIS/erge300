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

  useEffect(() => {
    setBook(initialBook)
    const savedProgress = localStorage.getItem(`reading_progress_${bookCode}`)
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setCurrentChapter(progress.chapterId)
      setChapterName(progress.chapterName)
    }
  }, [initialBook, bookCode])

  const handleChapterSelect = useCallback((chapterId: number, name: string) => {
    setCurrentChapter(chapterId)
    setChapterName(name)
    localStorage.setItem(`reading_progress_${bookCode}`, JSON.stringify({
      chapterId,
      chapterName: name
    }))
  }, [bookCode])

  const handleChaptersLoad = useCallback((loadedChapters: Chapter[]) => {
    setChapters(loadedChapters)
    if (loadedChapters.length > 0 && !currentChapter) {
      const firstChapter = loadedChapters[0]
      handleChapterSelect(firstChapter.chapter_id, firstChapter.chapter_name)
    }
  }, [currentChapter, handleChapterSelect])

  const handleNextChapter = useCallback(() => {
    if (!currentChapter) return
    
    const nextChapter = findNextChapter(chapters, currentChapter)
    if (nextChapter) {
      handleChapterSelect(nextChapter.chapter_id, nextChapter.chapter_name)
    }
  }, [chapters, currentChapter, findNextChapter, handleChapterSelect])

  const handlePreviousChapter = useCallback(() => {
    if (!currentChapter) return
    
    const prevChapter = findPreviousChapter(chapters, currentChapter)
    if (prevChapter) {
      handleChapterSelect(prevChapter.chapter_id, prevChapter.chapter_name)
    }
  }, [chapters, currentChapter, findPreviousChapter, handleChapterSelect])

  if (!book) {
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
          <SheetContent side="left" className="w-[280px] sm:w-[340px]">
            <SheetHeader>
              <SheetTitle>{book.book_name}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ChapterList 
                bookId={book.book_id} 
                onChapterSelect={handleChapterSelect}
                onInitialChapter={(chapterId, name) => {
                  if (!currentChapter) {
                    handleChapterSelect(chapterId, name)
                  }
                }}
                onChaptersLoad={handleChaptersLoad}
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