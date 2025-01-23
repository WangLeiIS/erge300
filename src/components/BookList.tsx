'use client'

import { Card } from "@/components/ui/card"
import Image from 'next/image'
import { books } from '@/data/books'

export default function BookList() {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 p-4">
      {books.map((book) => (
        <div 
          key={book.book_id}
          className="mb-4 break-inside-avoid"
        >
          <a href={book.link}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={book.cover_url}
                  alt={book.book_name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Card>
          </a>
        </div>
      ))}
    </div>
  )
} 