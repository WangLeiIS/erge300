import BookList from '@/components/BookList'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">书籍列表</h1>
      <div className="max-w-6xl mx-auto">
        <BookList />
      </div>
    </main>
  )
}

