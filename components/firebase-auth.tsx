"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { User } from "firebase/auth"
import { 
  auth, 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  onAuthStateChanged 
} from "../lib/firebase"
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { AuthDialog } from "./auth-dialog"

// Create auth context
export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email?: string, password?: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {}
})

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignIn = async (email?: string, password?: string) => {
    try {
      if (email && password) {
        await signInWithEmail(email, password)
      } else {
        setShowAuthDialog(true)
      }
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    try {
      await signUpWithEmail(email, password, displayName)
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Error with Google sign in:", error)
      throw error
    }
  }

  const handleAuthSuccess = (userData: any) => {
    setShowAuthDialog(false)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn: handleSignIn, 
      signUp: handleSignUp,
      signOut: handleSignOut,
      signInWithGoogle: handleGoogleSignIn
    }}>
      {children}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        onAuthSuccess={handleAuthSuccess} 
      />
    </AuthContext.Provider>
  )
}

// Custom hook to use auth
export const useAuth = () => useContext(AuthContext)

// Firebase Auth UI component
export function FirebaseAuth() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {user.displayName || user.email?.split('@')[0]}
          </span>
          <Avatar className="h-8 w-8 border border-border">
            {user.photoURL ? (
              <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />
            ) : (
              <AvatarFallback>{(user.displayName || user.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={signOut} 
          className="text-xs"
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => signIn()} 
        className="text-xs"
      >
        Sign In / Sign Up
      </Button>
    </div>
  )
}