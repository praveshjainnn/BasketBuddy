"use client"

/**
 * Admin Portal - Separate from User App
 * Complete Admin Dashboard with Authentication
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Shield, LogOut } from 'lucide-react'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { useToast } from '@/components/ui/use-toast'

// Simple admin credentials (in production, use proper auth)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
}

export default function AdminPage() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Check if already logged in (session storage)
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      toast({
        title: "Login Successful",
        description: "Welcome to Admin Portal"
      })
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive"
      })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
    setUsername('')
    setPassword('')
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    })
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Admin Portal</CardTitle>
            <CardDescription className="text-center">
              Basket Buddy 2.0 - Administrative Access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Login to Admin Portal
              </Button>
              <div className="text-sm text-muted-foreground text-center mt-4">
                <p>Demo Credentials:</p>
                <p className="font-mono">Username: admin</p>
                <p className="font-mono">Password: admin123</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin Portal Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-gray-400 mt-2">Basket Buddy 2.0 - Administrative Dashboard</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Admin Dashboard - All Features */}
        <AdminDashboard />
      </div>
    </div>
  )
}
