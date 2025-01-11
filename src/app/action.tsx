'use server'

const API_URL = process.env.API_URL

interface BookResponse {
  book_id: number
  book_code: string
  book_name: string
  author: string
  publisher: string
  publish_date: string
  tag: string
  book_status: string
  book_description: string
  cover_url: string
  card_table: string
}

interface Chapter {
  chapter_id: number
  book_code: string
  chapter_name: string
  chapter_num: number
  subchapters: Chapter[]
}

interface Card {
  card_id: number
  book_id: number
  chapter_id: number
  card_context: string
  card_num: number
  type: string
  version: string
  origin_card_id: number | null
}

export async function fetchCard(bookId: number, chapterId: number, num: number) {
  try {
    const response = await fetch(`${API_URL}/api/v1/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        book_id: bookId,
        chapter_id: chapterId
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch card')
    }

    const data: Card[] = await response.json()
    // 根据 card_num 找到对应的卡片
    const card = data.find(c => c.card_num === num)
    
    if (card) {
      return { 
        card,
        totalCards: data.length
      }
    } else {
      return { error: 'No card found' }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export async function fetchBooks() {
  try {
    console.log('Fetching books from:', `${API_URL}/api/v1/books`)
    const response = await fetch(`${API_URL}/api/v1/books`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`)
    }
    
    const data: BookResponse[] = await response.json()
    return { books: data }
  } catch (error) {
    console.error('Fetch error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export async function fetchChapters(bookId: number) {
  try {
    const response = await fetch(`${API_URL}/api/v1/chapters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ book_id: bookId }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`Failed to fetch chapters: ${response.status} ${response.statusText}`)
    }

    const data: Chapter[] = await response.json()
    return { chapters: data }
  } catch (error) {
    console.error('Fetch error:', error)
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}