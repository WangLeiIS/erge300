import { Metadata } from 'next'
import CardPageClient from './CardPageClient'

type Props = {
  params: {
    bookCode: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
  title: 'Card View',
}

export default function CardPage({ params }: Props) {
  return <CardPageClient bookCode={params.bookCode} />
}