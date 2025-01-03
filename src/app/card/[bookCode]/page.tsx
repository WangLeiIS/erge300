'use client'

import { useEffect, useState, use } from 'react'
import CardViewer from '@/components/CardViewer'
import { fetchBooks } from '@/app/action'
import { useToast } from '@/hooks/use-toast'

export default function CardPage({ params }: { params: Promise<{ bookCode: string }> }) {
  const resolvedParams = use(params)
  const [bookName, setBookName] = useState('')
  const { toast } = useToast()

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
        const book = result.books.find(b => b.book_code === resolvedParams.bookCode)
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
  }, [resolvedParams.bookCode, toast])

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{bookName}</h1>
      <CardViewer initialBookCode={resolvedParams.bookCode} />
    </main>
  )
}