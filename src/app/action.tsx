'use server'

const API_URL = `${process.env.API_URL}/bocker`

interface BookResponse {
  book_code: string;
  org_code: string;
  book_name: string;
}

export async function fetchCard(bookCode: string, num: number) {
  try {
    const response = await fetch(`${API_URL}/getcard/${bookCode}?num=${num}`)
    if (!response.ok) {
      throw new Error('Failed to fetch card')
    }
    const data = await response.json()
    if (data.length > 0) {
      return { card: data[0] }
    } else {
      return { error: 'No card found' }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export async function fetchBooks() {
  try {
    const response = await fetch(`${API_URL}/getbooks`)
    if (!response.ok) {
      throw new Error('Failed to fetch books')
    }
    const data: BookResponse[] = await response.json()
    return { books: data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

