'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { fetchCard } from '@/app/action'

interface CardViewerProps {
  initialBookCode?: string;
}

export default function CardViewer({ initialBookCode = '' }: CardViewerProps) {
  const [bookCode, setBookCode] = useState(initialBookCode)
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

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const cardHeight = rect.height
    
    if (clickY < cardHeight / 2) {
      handleFetchCard('previous')
    } else {
      handleFetchCard('next')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="number"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => {
            const newNum = parseInt(e.target.value) || 1
            setCardNumber(newNum)
            handleFetchCard('current', newNum)
          }}
          min={1}
          className="flex-grow"
        />
        <Button onClick={() => handleFetchCard('current')}>
          Get Card
        </Button>
      </div>
      {card ? (
        <Card 
          className="p-4 h-96 flex justify-center items-center cursor-pointer" 
          onClick={handleCardClick}
        >
          <p>{card.card_context}</p>
        </Card>
      ) : null}
    </div>
  )
}

