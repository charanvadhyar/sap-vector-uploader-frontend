"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getCurrentUser } from "./api"
import { jwtDecode } from "jwt-decode"

export interface User {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  is_active: boolean
}

export interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  user: User | null
  login: (token: string) => Promise<User | null>
  logout: () => void
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | null>(null)

// Function to check if token is valid format
const isValidToken = (token: string): boolean => {
  try {
    const decodedToken = jwtDecode(token)
    const currentTime = Date.now() / 1000
    
    if (!decodedToken || !decodedToken.exp) {
      console.log('Auth token validation - missing expiration')
      return false
    }

    const isValid = decodedToken.exp > currentTime
    console.log('Auth token validation - valid:', isValid, 'expires:', new Date(decodedToken.exp * 1000).toLocaleString())
    return isValid
  } catch (error) {
    console.error('Auth token validation failed:', error)
    return false
  }
}

// Provider component to wrap the app with
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  
  // This is our primary authentication check on initial load
  useEffect(() => {
    const initAuth = async () => {
      console.log('Auth initialization started')
      // Check for stored token on mount
      const storedToken = localStorage.getItem("token")
      console.log('Auth init - stored token exists:', !!storedToken)
      
      if (!storedToken || !isValidToken(storedToken)) {
        console.log('No valid token found, remaining unauthenticated')
        // Clear any potentially invalid tokens
        localStorage.removeItem("token")
        setIsAuthenticated(false)
        setToken(null)
        setUser(null)
        setIsLoading(false)
        return
      }
      
      // We have a token that looks valid, let's try to use it
      setToken(storedToken)
      
      try {
        console.log('Fetching user data with existing token')
        const userData = await getCurrentUser(storedToken)
        if (userData) {
          console.log('User data successfully retrieved:', userData.email)
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Failed to fetch user data on init:', error)
        localStorage.removeItem("token")
        setToken(null)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    initAuth()
  }, [])
  
  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return
    
    const isAuthPage = pathname === "/login" || pathname === "/register"
    
    console.log('Auth navigation check:', { 
      isAuthenticated, 
      pathname, 
      isAuthPage,
      isLoading
    })
    
    if (!isAuthenticated && !isAuthPage) {
      console.log('Redirecting unauthenticated user to login')
      router.replace("/login")
    }
  }, [isAuthenticated, pathname, isLoading, router])

  // Login function - does not handle navigation
  const login = async (newToken: string): Promise<User | null> => {
    if (!newToken || newToken.trim() === "") {
      console.error("Attempted to login with empty token")
      return null
    }
    
    console.log('Processing login with token')
    localStorage.setItem("token", newToken)
    setToken(newToken)
    
    try {
      console.log('Fetching user data with new token')
      const userData = await getCurrentUser(newToken)
      console.log('User data retrieved for login:', userData?.email)
      
      // Update auth state
      setUser(userData)
      setIsAuthenticated(true)
      
      return userData
    } catch (error) {
      console.error('Failed to fetch user data during login:', error)
      localStorage.removeItem("token")
      setToken(null)
      setIsAuthenticated(false)
      setUser(null)
      return null
    }
  }

  const logout = () => {
    console.log('Logging out user')
    localStorage.removeItem("token")
    setToken(null)
    setIsAuthenticated(false)
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, user, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null || context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
