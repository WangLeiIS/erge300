import BookList from '@/components/BookList'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Book List</h1>
      <div className="max-w-2xl mx-auto">
        <BookList />
      </div>
    </main>
  )
}

