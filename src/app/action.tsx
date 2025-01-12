'use server'

import { getAuthToken, getUserId } from '@/lib/auth'
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

export interface Card {
  card_id: number
  book_id: number
  chapter_id: number
  card_context: string
  card_num: number
  type: string
  version: string
  origin_card_id: number | null
}

export interface MarkedCard {
  card_id: number
  chapter_id: number
  chapter_name: string
  card_context: string
  book_name: string
  book_code: string
  mark_time: string
  card_num: number
}

export interface MarkedCardsResponse {
  items: MarkedCard[]
  total: number
  page: number
  page_size: number
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
    const response = await fetch(`${API_URL}/api/v1/books/chapters`, {
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

export type ToggleCardMarkFn = (cardId: number, token: string, userId: number, isMarked: boolean) => Promise<{ error?: string; success?: boolean }>
export const toggleCardMark: ToggleCardMarkFn = async (cardId, token, userId, isMarked) => {
  try {
    if (!token || !userId) {
      return { error: 'No auth data' }
    }
    
    const endpoint = isMarked ? 'unmark' : 'mark'
    const response = await fetch(`${API_URL}/api/v1/marks/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        card_id: cardId,
        user_id: userId
      }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'Invalid token' }
      }
      throw new Error(`Failed to ${endpoint} card`)
    }

    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export type CheckCardMarkFn = (cardId: number, token: string, userId: number) => Promise<{ error?: string; isMarked?: boolean }>
export const checkCardMark: CheckCardMarkFn = async (cardId, token, userId) => {
  try {
    if (!token || !userId) {
      return { error: 'No auth data' }
    }
    
    const response = await fetch(`${API_URL}/api/v1/marks/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        card_id: cardId,
        user_id: userId
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'Invalid token' }
      }
      throw new Error('Failed to check mark status')
    }

    const data = await response.json()
    return { isMarked: data.is_marked }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export async function fetchMarkedCards(token: string, userId: number, page: number = 1, pageSize: number = 10) {
  try {
    if (!token || !userId) {
      return { error: 'No auth data' }
    }

    const response = await fetch(`${API_URL}/api/v1/marks/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        page,
        page_size: pageSize
      }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'Invalid token' }
      }
      throw new Error('Failed to fetch marked cards')
    }

    const data: MarkedCardsResponse = await response.json()
    return { data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}