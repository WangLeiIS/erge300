'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { fetchCard } from '@/app/action'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [totalCards, setTotalCards] = useState(0)
  const [card, setCard] = useState<{ card_context: string } | null>(null)
  const { toast } = useToast()

  const handleFetchCard = useCallback(async (direction: 'current' | 'next' | 'previous', num?: number) => {
    try {
      let newNum = num ?? cardNumber
      if (direction === 'next') {
        if (cardNumber >= totalCards) {
          onNextChapter?.()
          return
        }
        newNum++
      }
      if (direction === 'previous') {
        if (cardNumber <= 1) {
          onPreviousChapter?.()
          return
        }
        newNum = Math.max(1, newNum - 1)
      }

      const result = await fetchCard(bookId, chapterId, newNum)
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.card) {
        setCard(result.card)
        setCardNumber(newNum)
        setTotalCards(result.totalCards)
        localStorage.setItem(`book_progress_${initialBookCode}`, JSON.stringify({
          chapterId,
          cardNum: newNum
        }))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch card',
        variant: 'destructive',
      })
    }
  }, [bookId, chapterId, cardNumber, totalCards, initialBookCode, toast, onNextChapter, onPreviousChapter])

  useEffect(() => {
    if (bookId && chapterId) {
      const savedProgress = localStorage.getItem(`book_progress_${initialBookCode}`)
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        if (progress.chapterId === chapterId) {
          setCardNumber(progress.cardNum)
          handleFetchCard('current', progress.cardNum)
        } else {
          handleFetchCard('current', 1)
        }
      } else {
        handleFetchCard('current', 1)
      }
    }
  }, [bookId, chapterId, initialBookCode, handleFetchCard])

  return (
    <div className="space-y-4">
      <Card className="min-h-[60vh] p-6 flex items-center justify-center">
        <p className="text-center text-lg whitespace-pre-wrap">
          {card?.card_context || '暂无内容'}
        </p>
      </Card>
      
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => handleFetchCard('previous')}
          disabled={isBookFirstPage?.(cardNumber) || (cardNumber <= 1 && isFirstChapter)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          上一页
        </Button>
        <span className="text-sm text-muted-foreground">
          第 {cardNumber} / {totalCards} 页
        </span>
        <Button
          variant="outline"
          onClick={() => handleFetchCard('next')}
          disabled={isBookLastPage?.(cardNumber, totalCards) || (cardNumber >= totalCards && isLastChapter)}
        >
          下一页
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

