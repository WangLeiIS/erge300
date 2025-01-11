'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { fetchChapters } from '@/app/action'

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
  return (
    <div className="w-full">
      <div 
        className={`flex items-center px-4 py-2 hover:bg-accent cursor-pointer`}
        style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
        onClick={() => onSelect?.(chapter.chapter_id, chapter.chapter_name)}
      >
        <span className="text-sm">{chapter.chapter_name}</span>
      </div>
      {chapter.subchapters?.length > 0 && (
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
        
        // 如果有章节数据，调用初始化回调
        if (result.chapters.length > 0 && onInitialChapter) {
          const firstChapter = result.chapters[0]
          onInitialChapter(firstChapter.chapter_id, firstChapter.chapter_name)
        }
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
  }, [bookId, toast, onInitialChapter])

  return (
    <div className="w-full border rounded-lg overflow-hidden">
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