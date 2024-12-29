'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { fetchCard } from '@/app/action'

export default function CardViewer() {
  const [bookCode, setBookCode] = useState('')
  const [cardNumber, setCardNumber] = useState(1)
  const [card, setCard] = useState<{ card_context: string } | null>(null)
  const { toast } = useToast()

  const handleFetchCard = async (direction: 'current' | 'next' | 'previous') => {
    try {
      let num = cardNumber
      if (direction === 'next') num++
      if (direction === 'previous') num = Math.max(1, num - 1)

      const result = await fetchCard(bookCode, num)
      if (result.error) {
        throw new Error(result.error)
      }
      setCard(result.card)
      setCardNumber(num)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch card',
        variant: 'destructive',
      })
    }
  }

  const handleInteraction = (clientX: number) => {
    const screenWidth = window.innerWidth;
    
    if (clientX < screenWidth / 2) {
      handleFetchCard('previous');
    } else {
      handleFetchCard('next');
    }
  }

  const handleTouch = (e: React.TouchEvent) => {
    handleInteraction(e.touches[0].clientX);
  }

  const handleClick = (e: React.MouseEvent) => {
    handleInteraction(e.clientX);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Book Code"
          value={bookCode}
          onChange={(e) => setBookCode(e.target.value)}
          className="flex-grow"
        />
        <Input
          type="number"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(parseInt(e.target.value) || 1)}
          min={1}
          className="flex-grow"
        />
        <Button onClick={() => handleFetchCard('current')}>
          Get Card
        </Button>
      </div>
      {card ? (
        <Card 
          className="p-4 h-64 flex justify-center items-center" 
          onTouchStart={handleTouch}
          onClick={handleClick}
        >
          <p>{card.card_context}</p>
        </Card>
      ) : null}
    </div>
  )
}

