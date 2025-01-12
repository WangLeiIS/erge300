'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getAuthToken, getUserId, clearAuth } from '@/lib/auth'
import { fetchMarkedCards, toggleCardMark, type MarkedCard } from '@/app/action'
import { Heart } from 'lucide-react'

export default function MarkedCardsPage() {
  const [markedCards, setMarkedCards] = useState<MarkedCard[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = getAuthToken()
    const userId = getUserId()

    if (!token || !userId) {
      router.push('/auth')
      return
    }

    async function loadMarkedCards() {
      try {
        const result = await fetchMarkedCards(token as string, Number(userId))
        if (result.error) {
          if (result.error === 'Invalid token') {
            clearAuth()
            router.push('/auth')
            return
          }
          throw new Error(result.error)
        }
        if (!result.data) {
          throw new Error('No data received')
        }
        setMarkedCards(result.data.items)
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load marked cards',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadMarkedCards()
  }, [router, toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex items-center mb-6 sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">我的标记</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
        {markedCards.length === 0 ? (
          <div className="col-span-full p-6 text-center text-muted-foreground">
            暂无标记内容
          </div>
        ) : (
          markedCards.map((card) => (
            <Card key={card.card_id} className="relative">
              <CardContent className="p-4 h-[200px] flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-lg">
                      {card.book_name}
                      <span className="text-sm text-muted-foreground ml-2">
                        {card.chapter_name} · {card.card_num}
                      </span>
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(card.mark_time)}
                  </span>
                </div>
                
                <p className="text-sm mb-2 line-clamp-3">{card.card_context}</p>
                
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm hover:bg-accent"
                    onClick={() => router.push(`/card/${card.book_code}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const token = getAuthToken();
                      const userId = getUserId();
                      if (!token || !userId) return;
                      
                      try {
                        const result = await toggleCardMark(card.card_id, token, Number(userId), true);
                        if (result.error) throw new Error(result.error);
                        
                        setMarkedCards(prev => prev.filter(c => c.card_id !== card.card_id));
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "取消标记失败",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Heart className="h-4 w-4 fill-current text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 