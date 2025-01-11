import { Metadata } from 'next'
import CardPageClient from './CardPageClient'
import { fetchBooks } from '@/app/action'

export const metadata: Metadata = {
  title: 'Card View',
}

interface PageProps {
  params: {
    bookCode: string
  }
}

export default async function CardPage({ params }: PageProps) {
  const { bookCode } = params
  const result = await fetchBooks()
  const book = result.books?.find(b => b.book_code === bookCode)
  
  if (!book) {
    throw new Error(`Book not found for code: ${bookCode}`)
  }
  
  return (
    <CardPageClient 
      bookCode={bookCode}
      initialBook={book}
    />
  )
}