import CardPageClient from './CardPageClient'

interface PageProps {
  params: {
    bookCode: string
  }
}

export default async function CardPage({ params }: PageProps) {
  return <CardPageClient bookCode={params.bookCode} />
}