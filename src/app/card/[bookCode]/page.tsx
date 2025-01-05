import { Metadata } from 'next'
import CardPageClient from './CardPageClient'

interface PageProps {
  params: {
    bookCode: string
  }
  searchParams: Record<string, string | string[] | undefined>
}

export const metadata: Metadata = {
  title: 'Card View',
}

const CardPage = ({ params }: PageProps) => {
  return <CardPageClient bookCode={params.bookCode} />
}

export default CardPage