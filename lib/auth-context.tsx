"use client"

import React, { createContext, useState, useEffect, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser } from "./api"

type User = {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_admin: boolean
  created_at: string
}

type AuthContextType = {
  token: string | null
  isAuthenticated: boolean
  user: User | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  // Add a mounted state to track client-side rendering
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Validate token format
  const isValidToken = (token: string | null): boolean => {
    // Simple validation - check if token exists and has reasonable format
    return !!token && token.length > 20 && token.includes('.')
  }
  
  // Fetch user data when authenticated
  const fetchUserData = async (authToken: string) => {
    try {
      const userData = await getCurrentUser(authToken)
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      // If user fetch fails, clear authentication
      localStorage.removeItem("token")
      setToken(null)
      setIsAuthenticated(false)
      setUser(null)
      return null
    }
  }

  // Handle client-side initialization
  useEffect(() => {
    setIsMounted(true)
    // Check if we have a token in localStorage on initial load
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token")
        
        // Log token for debugging
        console.log('Auth init - stored token exists:', !!storedToken)
        
        if (storedToken && isValidToken(storedToken)) {
          console.log('Auth init - token format appears valid, fetching user data')
          setToken(storedToken)
          const userData = await fetchUserData(storedToken)
          if (userData) {
            setIsAuthenticated(true)
          }
        } else if (storedToken) {
          console.warn('Auth init - invalid token format found in storage, clearing')
          localStorage.removeItem("token")
          setToken(null)
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error)
      }
    }
    
    initializeAuth()
  }, [])
  
  // Handle redirects only after component is mounted on the client
  useEffect(() => {
    if (isMounted && !isAuthenticated && pathname !== "/login" && pathname !== "/register") {
      // If no token and not on auth pages, redirect to login
      console.log('Auth redirect - not authenticated, redirecting to login')
      router.push("/login")
    }
  }, [isMounted, isAuthenticated, pathname, router])

  const login = async (newToken: string) => {
    if (!newToken || newToken.trim() === "") {
      console.error("Attempted to login with empty token")
      return
    }
    
    console.log('Auth login - saving new token to storage')
    localStorage.setItem("token", newToken)
    setToken(newToken)
    
    // Fetch user data after setting token
    const userData = await fetchUserData(newToken)
    if (userData) {
      setIsAuthenticated(true)
    }
  }

  const logout = () => {
    console.log('Auth logout - removing token')
    localStorage.removeItem("token")
    setToken(null)
    setIsAuthenticated(false)
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, user, login, logout }}>
      {/* Render children only if we're running in the browser or don't need authentication */}
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
