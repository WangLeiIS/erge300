'use client'

import { useState } from 'react'
import CardViewer from '@/components/CardViewer'

interface Book {
  book_code: string
  book_name: string
}

interface CardPageClientProps {
  bookCode: string
  initialBook?: Book
}

export default function CardPageClient({ bookCode, initialBook }: CardPageClientProps) {
  const [bookName] = useState(initialBook?.book_name ?? '')

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{bookName}</h1>
      <CardViewer initialBookCode={bookCode} />
    </main>
  )
}