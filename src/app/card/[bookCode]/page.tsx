import { Metadata } from 'next'
import CardPageClient from './CardPageClient'
import { fetchBooks } from '@/app/action'

export const metadata: Metadata = {
  title: 'Card View',
}

export default async function CardPage({
  params,
}: {
  params: { bookCode: string }
}) {
  // 预加载书籍数据
  const result = await fetchBooks()
  const book = result.books?.find(b => b.book_code === params.bookCode)
  
  return <CardPageClient 
    bookCode={params.bookCode}
    initialBook={book}
  />
}