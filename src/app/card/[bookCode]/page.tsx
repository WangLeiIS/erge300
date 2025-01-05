import CardPageClient from './CardPageClient'

type PageProps = {
  params: {
    bookCode: string
  }
}

export default function CardPage({ params }: PageProps) {
  return <CardPageClient bookCode={params.bookCode} />
}