'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { fetchCard, checkCardMark, toggleCardMark } from '@/app/action'
import { Card as UICard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, CornerDownLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAuthToken, clearAuth, getUserId } from '@/lib/auth'
import { Card as CardInterface } from '@/app/action'
import { Slider } from "@/components/ui/slider"
import { useAuth } from '@/contexts/auth-context'

interface CardViewerProps {
  bookId: number
  chapterId: number
  chapterName: string
  initialBookCode: string
  onNextChapter?: () => void
  onPreviousChapter?: () => void
  isFirstChapter?: boolean
  isLastChapter?: boolean
  isBookFirstPage?: (cardNum: number) => boolean
  isBookLastPage?: (cardNum: number, totalCards: number) => boolean
}

export default function CardViewer({ 
  bookId, 
  chapterId, 
  chapterName,
  initialBookCode, 
  onNextChapter,
  onPreviousChapter,
  isFirstChapter,
  isLastChapter,
  isBookFirstPage,
  isBookLastPage
}: CardViewerProps) {
  const [currentCardNum, setCurrentCardNum] = useState<number | null>(null)
  const [cards, setCards] = useState<Record<number, CardInterface>>({})
  const [maxCardNum, setMaxCardNum] = useState(1)
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [isMarked, setIsMarked] = useState(false)
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  
  // 使用 ref 来缓存章节内容
  const chaptersCache = useRef<Record<number, CardInterface[]>>({})
  const isInitialMount = useRef(true)

  // 加载章节内容的函数
  const loadChapterContent = useCallback(async (targetChapterId: number, savedCardNum?: number) => {
    console.log('Loading chapter content:', { targetChapterId, savedCardNum })
    if (currentChapterId === targetChapterId && currentCardNum === savedCardNum) {
      console.log('Skip loading: same chapter and card number')
      return
    }

    setIsLoading(true)
    try {
      const result = await fetchCard(bookId, targetChapterId)
      if (result.error) {
        throw new Error(result.error)
      }

      if (result.cards) {
        const cardsMap: Record<number, CardInterface> = {}
        let maxNum = 1
        
        result.cards.forEach(card => {
          cardsMap[card.card_num] = card
          maxNum = Math.max(maxNum, card.card_num)
        })

        // 设置卡片编号，确保使用保存的进度
        const validCardNum = savedCardNum ? Math.min(Math.max(1, savedCardNum), maxNum) : 1
        console.log('Setting card number:', { savedCardNum, validCardNum, maxNum })

        setCards(cardsMap)
        setMaxCardNum(maxNum)
        setCurrentChapterId(targetChapterId)
        setCurrentCardNum(validCardNum)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load chapter',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [bookId, toast, currentChapterId, currentCardNum])

  // 统一的加载逻辑
  useEffect(() => {
    if (!bookId || !chapterId) return

    const loadContent = async () => {
      // 尝试获取保存的进度
      let targetCardNum = 1
      try {
        const savedProgress = localStorage.getItem(`book_progress_${initialBookCode}`)
        if (savedProgress) {
          const progress = JSON.parse(savedProgress)
          console.log('Found saved progress:', progress)
          if (progress.chapterId === chapterId) {
            targetCardNum = progress.cardNum
            console.log('Using saved card number:', targetCardNum)
          }
        }
      } catch (error) {
        console.error('Failed to parse saved progress:', error)
      }

      // 只在以下情况加载内容：
      // 1. 首次加载
      // 2. 章节改变
      // 3. 强制重新加载
      if (isInitialMount.current || chapterId !== currentChapterId) {
        console.log('Loading content:', { chapterId, targetCardNum, isInitial: isInitialMount.current })
        await loadChapterContent(chapterId, targetCardNum)
        isInitialMount.current = false
      }
    }

    loadContent()
  }, [bookId, chapterId, initialBookCode, loadChapterContent, currentChapterId])

  // 处理卡片切换
  const handleCardChange = useCallback((direction: 'next' | 'previous') => {
    if (currentCardNum === null) return
    
    let newCardNum: number
    
    if (direction === 'next') {
      if (currentCardNum >= maxCardNum) {
        if (!isLastChapter) {
          onNextChapter?.()
        }
        return
      }
      newCardNum = currentCardNum + 1
    } else {
      if (currentCardNum <= 1) {
        if (!isFirstChapter) {
          onPreviousChapter?.()
        }
        return
      }
      newCardNum = Math.max(1, currentCardNum - 1)
    }
    
    setCurrentCardNum(newCardNum)
    
    // 更新阅读进度
    const savedProgress = JSON.parse(localStorage.getItem(`book_progress_${initialBookCode}`) || '{}')
    localStorage.setItem(`book_progress_${initialBookCode}`, JSON.stringify({
      ...savedProgress,
      chapterId: currentChapterId,
      cardNum: newCardNum,
      chapterName // 保持章节名称
    }))
  }, [currentCardNum, maxCardNum, currentChapterId, initialBookCode, chapterName, isFirstChapter, isLastChapter, onNextChapter, onPreviousChapter])

  const handleMarkToggle = async () => {
    if (currentCardNum === null) return
    
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please login to bookmark cards',
        variant: 'destructive',
      })
      localStorage.setItem('redirect_after_login', window.location.pathname)
      router.push('/auth')
      return
    }
    
    try {
      const token = localStorage.getItem('auth_token')
      const userId = localStorage.getItem('user_id')
      const result = await toggleCardMark(
        cards[currentCardNum].card_id, 
        token!, 
        parseInt(userId!), 
        isMarked
      )
      
      if (result.error) {
        if (result.error === 'Invalid token') {
          console.log('CardViewer: Invalid token detected')
          localStorage.setItem('redirect_after_login', window.location.pathname)
          logout()
          return
        }
        throw new Error(result.error)
      }
      setIsMarked(!isMarked)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle bookmark',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    if (currentCardNum === null) return
    if (cards[currentCardNum]?.card_id) {
      const token = getAuthToken()
      const userId = getUserId()
      
      // 如果没有登录，直接设置为未收藏状态，不进行查询
      if (!token || !userId) {
        setIsMarked(false)
        return
      }

      // 只有在用户已登录的情况下才检查收藏状态
      const checkMark = async () => {
        try {
          const result = await checkCardMark(cards[currentCardNum].card_id, token, userId)
          console.log('CardViewer: Check mark result:', result)
          
          if (result.error) {
            console.error('Mark check error:', result.error)
            if (result.error === 'Invalid token') {
              console.log('CardViewer: Clearing auth due to invalid token')
              clearAuth()
              setIsMarked(false)
              return
            }
            setIsMarked(false)
            return
          }
          setIsMarked(result.isMarked ?? false)
        } catch (error) {
          console.error('Failed to check mark status:', error)
          setIsMarked(false)
        }
      }
      checkMark()
    }
  }, [currentCardNum, cards])

  const currentCard = currentCardNum !== null ? cards[currentCardNum] : null

  return (
    <div className="space-y-4">
      {!isLoading && Object.keys(cards).length > 0 ? (
        <>
          <UICard className="min-h-[60vh] p-6 relative">
            <div className="flex justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCardChange('previous')}
                disabled={currentCardNum === null || isBookFirstPage?.(currentCardNum) || (currentCardNum <= 1 && isFirstChapter)}
                className="hover:bg-accent"
              >
                <CornerDownLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMarkToggle}
                className="hover:bg-accent"
              >
                <Heart 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isMarked ? "fill-current text-red-500" : "text-muted-foreground"
                  )} 
                />
              </Button>
            </div>
            
            <div 
              className="flex-1 flex items-center justify-center cursor-pointer min-h-[40vh]"
              onClick={() => currentCardNum !== null && !isBookLastPage?.(currentCardNum, maxCardNum) && handleCardChange('next')}
            >
              <div 
                className="text-center text-lg prose prose-sm max-w-none prose-img:mx-auto prose-img:max-h-[40vh] prose-img:object-contain prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ 
                  __html: currentCard?.card_context || '暂无内容'
                }}
              />
            </div>

            <div className="absolute bottom-4 right-6">
              <span className="text-sm text-muted-foreground">
                {currentCardNum} / {maxCardNum}
              </span>
            </div>
          </UICard>
          
          <div className="px-2">
            <Slider
              value={currentCardNum !== null ? [currentCardNum] : [1]}
              min={1}
              max={maxCardNum}
              step={1}
              onValueChange={(value) => {
                setCurrentCardNum(value[0])
                const savedProgress = JSON.parse(localStorage.getItem(`book_progress_${initialBookCode}`) || '{}')
                localStorage.setItem(`book_progress_${initialBookCode}`, JSON.stringify({
                  ...savedProgress,
                  chapterId: currentChapterId,
                  cardNum: value[0],
                  chapterName
                }))
              }}
              className="w-full"
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )}
    </div>
  )
}

