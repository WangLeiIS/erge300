export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    try {
      console.log('Setting auth token:', token.slice(0, 10) + '...')
      localStorage.setItem('auth_token', token)
      const storedToken = localStorage.getItem('auth_token')
      if (storedToken !== token) {
        console.error('Token storage verification failed')
        return false
      }
      console.log('Token stored successfully')
      return true
    } catch (error) {
      console.error('Failed to store auth token:', error)
      return false
    }
  }
  return false
}

export const setUsername = (username: string) => {
  if (typeof window !== 'undefined') {
    console.log('Setting username:', username)
    localStorage.setItem('user_name', username)
  }
}

export const getUsername = () => {
  if (typeof window !== 'undefined') {
    const username = localStorage.getItem('user_name')
    console.log('Getting username:', username)
    return username
  }
  return null
}

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    console.log('Getting auth token:', token ? `${token.slice(0, 10)}...` : 'null')
    return token
  }
  return null
}

export const setUserId = (userId: number) => {
  if (typeof window !== 'undefined') {
    console.log('Setting user id:', userId)
    localStorage.setItem('user_id', userId.toString())
  }
}

export const getUserId = () => {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('user_id')
    console.log('Getting user id:', userId)
    return userId ? parseInt(userId, 10) : null
  }
  return null
}

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    console.log('Clearing auth data')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_id')
  }
} 