import { Metadata } from 'next'
import CardPageClient from './CardPageClient'
import { fetchBooks } from '@/app/action'

export const metadata: Metadata = {
  title: 'Card View',
}

interface PageParams {
  params: Promise<{ bookCode: string }>
}

export default async function CardPage({ params }: PageParams) {
  // 等待解析动态路由参数
  const { bookCode } = await params
  
  // 预加载书籍数据并等待结果
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