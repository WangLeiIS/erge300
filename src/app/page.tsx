import BookList from '@/components/BookList'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto">
        <BookList />
      </div>
    </main>
  )
}

