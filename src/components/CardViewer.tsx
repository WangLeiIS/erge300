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
  const [cardNumber, setCardNumber] = useState(1)
  const [cards, setCards] = useState<CardInterface[]>([])
  const [currentChapterId, setCurrentChapterId] = useState(chapterId)
  const { toast } = useToast()
  const [isMarked, setIsMarked] = useState(false)
  const router = useRouter()
  
  // 使用 ref 来缓存章节内容
  const chaptersCache = useRef<Record<number, CardInterface[]>>({})

  const fetchChapterCards = useCallback(async (targetChapterId: number) => {
    try {
      // 如果缓存中已有该章节内容，直接返回
      if (chaptersCache.current[targetChapterId]) {
        return { cards: chaptersCache.current[targetChapterId] }
      }

      const result = await fetchCard(bookId, targetChapterId)
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.cards) {
        // 将结果存入缓存
        chaptersCache.current[targetChapterId] = result.cards
      }
      return result
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }, [bookId])

  // 预加载下一章和上一章的内容
  const preloadAdjacentChapters = useCallback(async () => {
    const nextChapterId = currentChapterId + 1
    const prevChapterId = currentChapterId - 1

    if (!isLastChapter) {
      fetchChapterCards(nextChapterId)
    }
    if (!isFirstChapter) {
      fetchChapterCards(prevChapterId)
    }
  }, [currentChapterId, fetchChapterCards, isFirstChapter, isLastChapter])

  // 处理章节切换
  const handleChapterChange = useCallback(async (newChapterId: number) => {
    // 如果缓存中有内容，立即更新UI
    if (chaptersCache.current[newChapterId]) {
      setCards(chaptersCache.current[newChapterId])
      setCurrentChapterId(newChapterId)
      setCardNumber(1)
      return
    }

    // 否则加载新内容
    setCards([]) // 显示加载状态
    const result = await fetchChapterCards(newChapterId)
    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
      return
    }

    if (result.cards) {
      setCards(result.cards)
      setCurrentChapterId(newChapterId)
      setCardNumber(1)
      localStorage.setItem(`book_progress_${initialBookCode}`, JSON.stringify({
        chapterId: newChapterId,
        cardNum: 1
      }))
    }
  }, [fetchChapterCards, initialBookCode, toast])

  // 监听章节ID的变化
  useEffect(() => {
    if (chapterId !== currentChapterId) {
      handleChapterChange(chapterId)
    }
  }, [chapterId, currentChapterId, handleChapterChange])

  // 初始加载和预加载
  useEffect(() => {
    if (bookId && currentChapterId) {
      const savedProgress = localStorage.getItem(`book_progress_${initialBookCode}`)
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        if (progress.chapterId === currentChapterId) {
          setCardNumber(progress.cardNum)
        }
      }
      
      // 初始加载当前章节
      handleChapterChange(currentChapterId)
      // 预加载相邻章节
      preloadAdjacentChapters()
    }
  }, [bookId, currentChapterId, initialBookCode, handleChapterChange, preloadAdjacentChapters])

  const handleCardChange = (direction: 'next' | 'previous') => {
    if (direction === 'next') {
      if (cardNumber >= cards.length) {
        onNextChapter?.()
        return
      }
      setCardNumber(prev => prev + 1)
    } else {
      if (cardNumber <= 1) {
        onPreviousChapter?.()
        return
      }
      setCardNumber(prev => Math.max(1, prev - 1))
    }
    
    localStorage.setItem(`book_progress_${initialBookCode}`, JSON.stringify({
      chapterId,
      cardNum: direction === 'next' ? cardNumber + 1 : cardNumber - 1
    }))
  }

  const handleMarkToggle = async () => {
    const token = getAuthToken()
    const userId = getUserId()
    if (!token || !userId || !cards[cardNumber - 1]) {
      toast({
        title: 'Error',
        description: 'Please login to bookmark cards',
        variant: 'destructive',
      })
      router.push('/auth')
      return
    }
    
    try {
      const result = await toggleCardMark(cards[cardNumber - 1].card_id, token, userId, isMarked)
      if (result.error) {
        if (result.error === 'Invalid token') {
          console.log('CardViewer: Clearing auth due to invalid token')
          localStorage.setItem('redirect_after_login', window.location.pathname)
          clearAuth()
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
    if (cards[cardNumber - 1]?.card_id) {
      const token = getAuthToken()
      const userId = getUserId()
      
      if (!token || !userId) {
        setIsMarked(false)
        return
      }

      const checkMark = async () => {
        try {
          const result = await checkCardMark(cards[cardNumber - 1].card_id, token, userId)
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
  }, [cards[cardNumber - 1]?.card_id])

  const currentCard = cards[cardNumber - 1]

  const handleSliderChange = (value: number[]) => {
    const newCardNumber = value[0]
    setCardNumber(newCardNumber)
    localStorage.setItem(`book_progress_${initialBookCode}`, JSON.stringify({
      chapterId,
      cardNum: newCardNumber
    }))
  }

  return (
    <div className="space-y-4">
      {cards.length > 0 ? (
        <>
          <UICard className="min-h-[60vh] p-6 relative">
            <div className="flex justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCardChange('previous')}
                disabled={isBookFirstPage?.(cardNumber) || (cardNumber <= 1 && isFirstChapter)}
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
              onClick={() => !isBookLastPage?.(cardNumber, cards.length) && handleCardChange('next')}
            >
              <div 
                className="text-center text-lg prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: currentCard?.card_context || '暂无内容'
                }}
              />
            </div>

            <div className="absolute bottom-4 right-6">
              <span className="text-sm text-muted-foreground">
                {cardNumber} / {cards.length}
              </span>
            </div>
          </UICard>
          
          <div className="px-2">
            <Slider
              value={[cardNumber]}
              min={1}
              max={cards.length || 1}
              step={1}
              onValueChange={handleSliderChange}
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

