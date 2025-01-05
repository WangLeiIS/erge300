'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { fetchCard } from '@/app/action'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CardViewerProps {
  initialBookCode: string
}

export default function CardViewer({ initialBookCode }: CardViewerProps) {
  const [bookCode] = useState(initialBookCode)
  const [cardNumber, setCardNumber] = useState(1)
  const [card, setCard] = useState<{ card_context: string } | null>(null)
  const { toast } = useToast()

  const handleFetchCard = useCallback(async (direction: 'current' | 'next' | 'previous', num?: number) => {
    try {
      let newNum = num ?? cardNumber
      if (direction === 'next') newNum++
      if (direction === 'previous') newNum = Math.max(1, newNum - 1)

      const result = await fetchCard(bookCode, newNum)
      if (result.error) {
        throw new Error(result.error)
      }
      setCard(result.card)
      setCardNumber(newNum)
      localStorage.setItem(`book_progress_${bookCode}`, newNum.toString())
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch card',
        variant: 'destructive',
      })
    }
  }, [bookCode, cardNumber, toast])

  useEffect(() => {
    if (bookCode) {
      const savedProgress = localStorage.getItem(`book_progress_${bookCode}`)
      if (savedProgress) {
        const progress = parseInt(savedProgress)
        setCardNumber(progress)
        handleFetchCard('current', progress)
      } else {
        handleFetchCard('current', 1)
      }
    }
  }, [bookCode, handleFetchCard])

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
          disabled={cardNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          上一页
        </Button>
        <span className="text-sm text-muted-foreground">第 {cardNumber} 页</span>
        <Button
          variant="outline"
          onClick={() => handleFetchCard('next')}
        >
          下一页
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

