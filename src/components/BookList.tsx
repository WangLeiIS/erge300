'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchBooks } from '@/app/action'
import { useToast } from '@/hooks/use-toast'

interface Book {
  book_code: string;
  org_code: string;
  book_name: string;
}

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function getBooks() {
      try {
        const result = await fetchBooks();
        if (result.error) {
          throw new Error(result.error);
        }
        if (!result.books) {
          throw new Error('No books data received');
        }
        setBooks(result.books);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch books',
          variant: 'destructive',
        });
      }
    }

    getBooks();
  }, [toast]);

  const handleBookClick = (bookCode: string) => {
    router.push(`/card/${bookCode}`);
  };

  return (
    <Card className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book, index) => (
            <TableRow 
              key={index}
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleBookClick(book.book_code)}
            >
              <TableCell>{book.book_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 