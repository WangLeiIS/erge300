export interface Book {
  book_id: number
  book_code: string
  book_name: string
  author: string
  cover_url: string
}

export interface Chapter {
  chapter_id: number
  chapter_name: string
  subchapters?: Chapter[]
}

export interface BookState {
  book: Book | null
  currentChapter: {
    id: number
    name: string
  } | null
  chapters: Chapter[]
} 