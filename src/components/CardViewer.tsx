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
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFetchCard = async (direction: 'current' | 'next' | 'previous') => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
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
        <Button onClick={() => handleFetchCard('current')} disabled={isLoading}>
          Get Card
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => handleFetchCard('previous')} disabled={isLoading}>
          Previous Card
        </Button>
      </div>
      {isLoading ? (
        <Card className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </Card>
      ) : card ? (
        <Card className="p-4">
          <p>{card.card_context}</p>
        </Card>
      ) : null}
        <Button onClick={() => handleFetchCard('next')} disabled={isLoading}>
          Next Card
        </Button>
    </div>
  )
}

