'use client'

import { useEffect, useState } from 'react'
import CardViewer from '@/components/CardViewer'
import { fetchBooks } from '@/app/action'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Library, Book } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CardPageClient({ bookCode }: { bookCode: string }) {
  const [bookName, setBookName] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function getBookName() {
      try {
        const result = await fetchBooks()
        if (result.error) {
          throw new Error(result.error)
        }
        if (!result.books) {
          throw new Error('No books data received')
        }
        const book = result.books.find(b => b.book_code === bookCode)
        if (book) {
          setBookName(book.book_name)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch book name',
          variant: 'destructive',
        })
      }
    }

    getBookName()
  }, [bookCode, toast])

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 pb-20">
        <h1 className="text-3xl font-bold mb-2">{bookName}</h1>
        <CardViewer initialBookCode={bookCode} />
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 flex justify-around p-4 bg-background border-t">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center gap-1"
          onClick={() => router.push('/')}
        >
          <Library className="h-6 w-6" />
          <span className="text-sm">书架</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center gap-1"
          onClick={() => router.push(`/card/${bookCode}`)}
        >
          <Book className="h-6 w-6" />
          <span className="text-sm">阅读</span>
        </Button>
      </div>
    </div>
  )
}