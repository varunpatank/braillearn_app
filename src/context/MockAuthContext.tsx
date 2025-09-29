import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface MockUser {
  id: string
  username: string
  email: string
  total_points: number
  level: number
}

interface MockAuthContextType {
  user: MockUser | null
  session: any | null
  signIn: (username: string, password: string) => Promise<{ error?: any }>
  signUp: (username: string, password: string, email: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<MockUser>) => Promise<void>
  loading: boolean
}

const MockAuthContext = createContext<MockAuthContextType>({
  user: null,
  session: null,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  updateProfile: async () => {},
  loading: false
})

export const useMockAuth = () => useContext(MockAuthContext)

export const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setSession({ user: parsedUser })
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('mockUser')
      }
    }
  }, [])

  const signIn = async (username: string, password: string) => {
    setLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simple validation - in a real app, this would be server-side
    if (!username || !password) {
      setLoading(false)
      return { error: { message: 'Username and password are required' } }
    }

    // Create mock user (in real app, this would come from server)
    const mockUser: MockUser = {
      id: crypto.randomUUID(),
      username: username,
      email: `${username}@example.com`,
      total_points: Math.floor(Math.random() * 1000),
      level: Math.floor(Math.random() * 10) + 1
    }

    setUser(mockUser)
    setSession({ user: mockUser })
    
    // Save to localStorage
    localStorage.setItem('mockUser', JSON.stringify(mockUser))
    
    setLoading(false)
    return {}
  }

  const signUp = async (username: string, password: string, email: string) => {
    setLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simple validation
    if (!username || !password || !email) {
      setLoading(false)
      return { error: { message: 'All fields are required' } }
    }

    // Create mock user
    const mockUser: MockUser = {
      id: crypto.randomUUID(),
      username: username,
      email: email,
      total_points: 0,
      level: 1
    }

    setUser(mockUser)
    setSession({ user: mockUser })
    
    // Save to localStorage
    localStorage.setItem('mockUser', JSON.stringify(mockUser))
    
    setLoading(false)
    return {}
  }

  const signOut = async () => {
    setUser(null)
    setSession(null)
    localStorage.removeItem('mockUser')
  }

  const updateProfile = async (updates: Partial<MockUser>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    setSession({ user: updatedUser })
    localStorage.setItem('mockUser', JSON.stringify(updatedUser))
  }

  const updatePoints = async (points: number) => {
    if (!user) return

    const newTotalPoints = user.total_points + points
    const newLevel = Math.floor(newTotalPoints / 1000) + 1

    await updateProfile({
      total_points: newTotalPoints,
      level: newLevel
    })
  }

  return (
    <MockAuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
      updateProfile,
      loading
    }}>
      {children}
    </MockAuthContext.Provider>
  )
}