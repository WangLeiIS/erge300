'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { fetchChapters } from '@/app/action'
import { SheetClose } from '@/components/ui/sheet'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Chapter {
  chapter_id: number
  book_code: string
  chapter_name: string
  chapter_num: number
  subchapters: Chapter[]
}

interface ChapterListProps {
  bookId: number
  onChapterSelect?: (chapterId: number, chapterName: string) => void
  onInitialChapter?: (chapterId: number, chapterName: string) => void
  onChaptersLoad?: (chapters: Chapter[]) => void
}

const ChapterItem = ({ chapter, level = 0, onSelect }: {
  chapter: Chapter
  level?: number
  onSelect?: (chapterId: number, chapterName: string) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasSubchapters = chapter.subchapters?.length > 0

  return (
    <div className="w-full">
      <div className="flex items-center hover:bg-accent cursor-pointer">
        {hasSubchapters && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-1 hover:bg-accent/50 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        <SheetClose asChild>
          <div 
            className="flex-1 py-2 px-2"
            style={{ paddingLeft: hasSubchapters ? '0.5rem' : `${level * 1.5 + 1}rem` }}
            onClick={() => onSelect?.(chapter.chapter_id, chapter.chapter_name)}
          >
            <span className="text-sm">{chapter.chapter_name}</span>
          </div>
        </SheetClose>
      </div>
      {hasSubchapters && isExpanded && (
        <div className="w-full">
          {chapter.subchapters.map((subchapter) => (
            <ChapterItem
              key={subchapter.chapter_id}
              chapter={subchapter}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChapterList({ bookId, onChapterSelect, onInitialChapter, onChaptersLoad }: ChapterListProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function getChapters() {
      try {
        const result = await fetchChapters(bookId)
        if (result.error) {
          throw new Error(result.error)
        }
        if (!result.chapters) {
          throw new Error('No chapters data received')
        }
        setChapters(result.chapters)
        onChaptersLoad?.(result.chapters)
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch chapters',
          variant: 'destructive',
        })
      }
    }

    if (bookId) {
      getChapters()
    }
  }, [bookId, toast, onChaptersLoad])

  return (
    <div className="w-full border rounded-lg overflow-y-auto scrollbar-hide">
      {chapters.map((chapter) => (
        <ChapterItem
          key={chapter.chapter_id}
          chapter={chapter}
          onSelect={onChapterSelect}
        />
      ))}
    </div>
  )
}