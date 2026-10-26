import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('store-token')))
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('store-token')
    if (!token) return

    apiRequest('/auth/me')
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((error) => {
        localStorage.removeItem('store-token')
        setSessionError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const signIn = useCallback(async (email, password) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('store-token', result.token)
    setUser(result.user)
    setSessionError('')
    return result.user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    localStorage.setItem('store-token', result.token)
    setUser(result.user)
    setSessionError('')
    return result.user
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('store-token')
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user, loading, sessionError, signIn, register, signOut,
  }), [user, loading, sessionError, signIn, register, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
