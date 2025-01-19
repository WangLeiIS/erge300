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
  initialBookCode, 
  onNextChapter,
  onPreviousChapter,
  isFirstChapter,
  isLastChapter,
  isBookFirstPage,
  isBookLastPage
}: CardViewerProps) {
  const [currentCardNum, setCurrentCardNum] = useState(1)
  const [cards, setCards] = useState<Record<number, CardInterface>>({})
  const [maxCardNum, setMaxCardNum] = useState(1)
  const [currentChapterId, setCurrentChapterId] = useState(chapterId)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [isMarked, setIsMarked] = useState(false)
  const router = useRouter()
  const { refreshAuth } = useAuth()
  
  // 使用 ref 来缓存章节内容
  const chaptersCache = useRef<Record<number, CardInterface[]>>({})

  const fetchChapterCards = useCallback(async (targetChapterId: number) => {
    try {
      const result = await fetchCard(bookId, targetChapterId)
      if (result.error) {
        throw new Error(result.error)
      }

      if (result.cards) {
        // 将卡片数组转换为以 card_num 为 key 的对象
        const cardsMap: Record<number, CardInterface> = {}
        let maxNum = 1
        
        result.cards.forEach(card => {
          cardsMap[card.card_num] = card
          maxNum = Math.max(maxNum, card.card_num)
        })
        
        return { cardsMap, maxNum }
      }
      return { error: 'No cards found' }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }, [bookId])

  const handleChapterChange = useCallback(async (newChapterId: number) => {
    setIsLoading(true)
    try {
      const result = await fetchChapterCards(newChapterId)
      if ('error' in result) {
        throw new Error(result.error)
      }

      setCards(result.cardsMap)
      setMaxCardNum(result.maxNum)
      setCurrentChapterId(newChapterId)
      setCurrentCardNum(1) // 新章节从第一张卡片开始

      localStorage.setItem(`book_progress_${initialBookCode}`, JSON.stringify({
        chapterId: newChapterId,
        cardNum: 1
      }))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load chapter',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [fetchChapterCards, initialBookCode, toast])

  const handleCardChange = useCallback((direction: 'next' | 'previous') => {
    if (direction === 'next') {
      if (currentCardNum >= maxCardNum) {
        if (!isLastChapter) {
          onNextChapter?.()
        }
        return
      }
      setCurrentCardNum(prev => prev + 1)
    } else {
      if (currentCardNum <= 1) {
        if (!isFirstChapter) {
          onPreviousChapter?.()
        }
        return
      }
      setCurrentCardNum(prev => Math.max(1, prev - 1))
    }
    
    localStorage.setItem(`book_progress_${initialBookCode}`, JSON.stringify({
      chapterId: currentChapterId,
      cardNum: direction === 'next' ? currentCardNum + 1 : currentCardNum - 1
    }))
  }, [currentCardNum, maxCardNum, currentChapterId, initialBookCode, isFirstChapter, isLastChapter, onNextChapter, onPreviousChapter])

  // 监听章节ID的变化
  useEffect(() => {
    if (chapterId !== currentChapterId) {
      handleChapterChange(chapterId)
    }
  }, [chapterId, currentChapterId, handleChapterChange])

  // 初始加载
  useEffect(() => {
    if (bookId && currentChapterId) {
      const savedProgress = localStorage.getItem(`book_progress_${initialBookCode}`)
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        if (progress.chapterId === currentChapterId) {
          setCurrentCardNum(progress.cardNum)
        }
      }
      
      handleChapterChange(currentChapterId)
    }
  }, [bookId, currentChapterId, initialBookCode, handleChapterChange])

  const handleMarkToggle = async () => {
    const token = getAuthToken()
    const userId = getUserId()
    if (!token || !userId || !cards[currentCardNum]) {
      toast({
        title: 'Error',
        description: 'Please login to bookmark cards',
        variant: 'destructive',
      })
      router.push('/auth')
      return
    }
    
    try {
      const result = await toggleCardMark(cards[currentCardNum].card_id, token, userId, isMarked)
      if (result.error) {
        if (result.error === 'Invalid token') {
          console.log('CardViewer: Clearing auth due to invalid token')
          localStorage.setItem('redirect_after_login', window.location.pathname)
          clearAuth()
          refreshAuth()
          router.push('/auth')
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
    if (cards[currentCardNum]?.card_id) {
      const token = getAuthToken()
      const userId = getUserId()
      
      if (!token || !userId) {
        setIsMarked(false)
        return
      }

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
  }, [cards[currentCardNum]?.card_id])

  const currentCard = cards[currentCardNum]

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
                disabled={isBookFirstPage?.(currentCardNum) || (currentCardNum <= 1 && isFirstChapter)}
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
              onClick={() => !isBookLastPage?.(currentCardNum, maxCardNum) && handleCardChange('next')}
            >
              <div 
                className="text-center text-lg prose prose-sm max-w-none prose-img:mx-auto prose-img:max-h-[40vh] prose-img:object-contain prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ 
                  __html: cards[currentCardNum]?.card_context || '暂无内容'
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
              value={[currentCardNum]}
              min={1}
              max={maxCardNum}
              step={1}
              onValueChange={(value) => {
                setCurrentCardNum(value[0])
                localStorage.setItem(`book_progress_${initialBookCode}`, JSON.stringify({
                  chapterId: currentChapterId,
                  cardNum: value[0]
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

