'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { fetchBooks } from '@/app/action'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface Book {
  book_id: number
  book_code: string
  book_name: string
  author: string
  publisher: string
  publish_date: string
  tag: string
  book_status: string
  book_description: string
  cover_url: string
  card_table: string
}

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function getBooks() {
      try {
        const result = await fetchBooks()
        if (result.error) {
          throw new Error(result.error)
        }
        if (!result.books) {
          throw new Error('No books data received')
        }
        setBooks(result.books)
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch books',
          variant: 'destructive',
        })
      }
    }

    getBooks()
  }, [toast])

  const handleBookClick = (bookCode: string) => {
    router.push(`/card/${bookCode}`)
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {books.map((book) => (
        <Card 
          key={book.book_id}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
          onClick={() => handleBookClick(book.book_code)}
        >
          <div className="aspect-[3/4] relative overflow-hidden rounded-t-xl">
            <Image
              src={book.cover_url}
              alt={book.book_name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 12.5vw"
            />
          </div>
          <div className="p-2 flex flex-col flex-grow">
            <h3 className="font-medium text-sm line-clamp-2">{book.book_name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
          </div>
        </Card>
      ))}
    </div>
  )
} 