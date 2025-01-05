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
  await fetchBooks()
  
  return <CardPageClient bookCode={params.bookCode} />
}