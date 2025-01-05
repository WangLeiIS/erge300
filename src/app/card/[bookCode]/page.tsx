import CardPageClient from './CardPageClient'

export default function CardPage({ params }: { params: { bookCode: string } }) {
  return <CardPageClient bookCode={params.bookCode} />
}