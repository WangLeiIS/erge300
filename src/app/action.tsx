'use server'

const API_URL = `${process.env.API_URL}/bocker/getcard/`

export async function fetchCard(bookCode: string, num: number) {
  try {
    const response = await fetch(`${API_URL}${bookCode}?num=${num}`)
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

