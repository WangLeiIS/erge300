'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getAuthToken, getUserId, clearAuth } from '@/lib/auth'
import { fetchMarkedCards, toggleCardMark, type MarkedCard } from '@/app/action'
import { Heart } from 'lucide-react'

export default function MarkedCardsPage() {
  const [markedCards, setMarkedCards] = useState<MarkedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [overflowingCards, setOverflowingCards] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  
  const router = useRouter()
  const { toast } = useToast()

  const loadMarkedCards = useCallback(async (pageNum: number, isLoadingMore = false) => {
    const token = getAuthToken()
    const userId = getUserId()
    
    if (!token || !userId) {
      return
    }

    try {
      if (!isLoadingMore) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const result = await fetchMarkedCards(token, Number(userId), pageNum)
      
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

      setMarkedCards(prev => 
        isLoadingMore ? [...prev, ...result.data.items] : result.data.items
      )
      setHasMore(result.data.items.length === 10)
      
      if (result.data.items.length < 10) {
        setPage(pageNum)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load marked cards',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [router, toast])

  useEffect(() => {
    const token = getAuthToken()
    const userId = getUserId()
    
    if (!token || !userId) {
      router.push('/auth')
      return
    }
  }, [router])

  useEffect(() => {
    loadMarkedCards(1)
  }, [loadMarkedCards])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1
          loadMarkedCards(nextPage, true)
          setPage(nextPage)
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, loadMarkedCards, page])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const checkTextOverflow = (element: HTMLElement) => {
    return element.scrollHeight > element.clientHeight
  }

  useEffect(() => {
    const checkOverflow = () => {
      const newOverflowingCards = new Set<number>()
      document.querySelectorAll('[data-card-text]').forEach((element) => {
        const cardId = Number(element.getAttribute('data-card-id'))
        if (checkTextOverflow(element as HTMLElement)) {
          newOverflowingCards.add(cardId)
        }
      })
      setOverflowingCards(newOverflowingCards)
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [markedCards])

  const toggleExpand = (cardId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const handleImageLoad = useCallback((imageSrc: string) => {
    setLoadedImages(prev => new Set(prev).add(imageSrc))
  }, [])

  const processHtmlContent = useCallback((html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src')
      if (src) {
        img.classList.add('mx-auto', 'max-h-[40vh]', 'object-contain', 'rounded-lg')
        img.setAttribute('loading', 'lazy')
        
        if (!loadedImages.has(src)) {
          img.classList.add('opacity-0', 'transition-opacity', 'duration-300')
        } else {
          img.classList.add('opacity-100')
        }
        
        img.setAttribute('onload', `this.classList.add('opacity-100')`)
      }
    })
    
    return doc.body.innerHTML
  }, [loadedImages])

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto divide-y">
        {markedCards.length === 0 && !loading ? (
          <div className="py-6 text-center text-muted-foreground">
            暂无标记内容
          </div>
        ) : (
          <>
            {markedCards.map((card, index) => {
              const isExpanded = expandedCards.has(card.card_id)
              const hasOverflow = overflowingCards.has(card.card_id)
              return (
                <div 
                  key={`${card.card_id}-${card.mark_time}-${index}`} 
                  className="py-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
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
                  
                  <div 
                    className={`text-sm mb-2 prose prose-sm max-w-none ${isExpanded ? '' : 'line-clamp-4'}`}
                    data-card-text
                    data-card-id={card.card_id}
                    dangerouslySetInnerHTML={{ __html: processHtmlContent(card.card_context) }}
                  />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm hover:bg-accent px-2 h-8"
                        onClick={() => router.push(`/card/${card.book_code}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                      </Button>
                      {hasOverflow && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm hover:bg-accent px-2 h-8"
                          onClick={() => toggleExpand(card.card_id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          )}
                          {isExpanded ? '收起' : '展开'}
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
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
                </div>
              )
            })}
            
            <div 
              ref={observerTarget} 
              className="py-4 text-center"
            >
              {loadingMore && <div>加载更多...</div>}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 