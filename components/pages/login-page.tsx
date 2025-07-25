"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { authApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  const { login, isAuthenticated } = useAuth()
  
  // Prevent hydration issues by setting mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, router])
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Submitting login form')
      const response = await authApi.login({ email, password })
      console.log('Login API response received')
      
      // Use the auth context login function which now returns the user
      const user = await login(response.access_token)
      console.log('Auth context login complete, user:', !!user)
      
      if (user) {
        toast({
          title: "Login successful",
          description: "You have been successfully authenticated.",
          variant: "default",
        })
        
        console.log('Login successful, navigating to dashboard')
        // Navigate after successful login
        router.push("/")
      } else {
        // If login returns null, there was an issue with the user data
        console.error('Login succeeded but failed to fetch user data')
        toast({
          title: "Authentication error",
          description: "Your login succeeded but we couldn't load your user data. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Display a simple loading state during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }
  
  // Don't show login form if user is already authenticated (redirecting)
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 text-center">
          <div className="animate-pulse">Redirecting to dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">SAP FICO Uploader</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
