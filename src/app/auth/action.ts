'use server'

import { getAuthToken } from '@/lib/auth'

const API_URL = process.env.API_URL

export async function register(username: string, password: string, inviteCode: string) {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        invite_code: inviteCode
      }),
    })

    if (!response.ok) {
      throw new Error('Registration failed')
    }

    return await response.json()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Registration failed' }
  }
}

export async function login(username: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      }),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    return await response.json()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Login failed' }
  }
}

export async function logout() {
  try {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Logout failed')
    }

    return await response.json()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Logout failed' }
  }
} 