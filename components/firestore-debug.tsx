"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "./firebase-auth"

export function FirestoreDebug() {
  const { user } = useAuth()
  const [status, setStatus] = useState({
    firestoreInitialized: false,
    userSignedIn: false,
    canWrite: false,
    canRead: false,
    testDocCreated: false,
    error: null as string | null,
  })
  const [testing, setTesting] = useState(false)

  const checkFirestoreStatus = async () => {
    setTesting(true)
    const newStatus = { ...status, error: null }

    try {
      // Check if user is signed in
      newStatus.userSignedIn = !!user
      
      if (!user) {
        newStatus.error = "Please sign in first"
        setStatus(newStatus)
        setTesting(false)
        return
      }

      // Check if Firestore is initialized
      const { firestore } = await import("@/lib/firebase")
      newStatus.firestoreInitialized = !!firestore
      
      if (!firestore) {
        newStatus.error = "Firestore not initialized"
        setStatus(newStatus)
        setTesting(false)
        return
      }

      // Test write permission
      try {
        const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")
        const testDoc = await addDoc(collection(firestore, "test_connection"), {
          message: "Test from BasketBuddy",
          userId: user.uid,
          timestamp: serverTimestamp(),
        })
        newStatus.canWrite = true
        newStatus.testDocCreated = !!testDoc.id
      } catch (writeError: any) {
        newStatus.canWrite = false
        newStatus.error = `Write failed: ${writeError.message}`
      }

      // Test read permission
      try {
        const { collection, getDocs, query, limit } = await import("firebase/firestore")
        const q = query(collection(firestore, "groceryLists"), limit(1))
        await getDocs(q)
        newStatus.canRead = true
      } catch (readError: any) {
        newStatus.canRead = false
        if (!newStatus.error) {
          newStatus.error = `Read failed: ${readError.message}`
        }
      }

    } catch (error: any) {
      newStatus.error = error.message
    }

    setStatus(newStatus)
    setTesting(false)
  }

  const testCreateGroceryList = async () => {
    if (!user) {
      alert("Please sign in first")
      return
    }

    try {
      const { firestore } = await import("@/lib/firebase")
      const { collection, addDoc } = await import("firebase/firestore")
      
      if (!firestore) {
        alert("Firestore not initialized")
        return
      }

      const testList = {
        name: "Test List",
        description: "Created from debug panel",
        userId: user.uid,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        sharedWith: [],
        color: "bg-blue-100",
        items: [
          {
            id: "test-1",
            name: "Test Item",
            category: "Test",
            quantity: 1,
            unit: "piece",
            price: 0,
            addedBy: user.uid,
            addedAt: new Date().toISOString(),
          }
        ]
      }

      const docRef = await addDoc(collection(firestore, "groceryLists"), testList)
      alert(`✅ Success! List created with ID: ${docRef.id}\n\nCheck Firebase Console → Firestore Database → groceryLists collection`)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}\n\nCheck browser console for details`)
      console.error("Error creating test list:", error)
    }
  }

  useEffect(() => {
    if (user) {
      checkFirestoreStatus()
    }
  }, [user])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Firestore Connection Debug
        </CardTitle>
        <CardDescription>
          Check if Firestore is properly connected and working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <StatusItem 
            label="User Signed In" 
            status={status.userSignedIn}
            info={user ? `Signed in as: ${user.email}` : "Please sign in"}
          />
          <StatusItem 
            label="Firestore Initialized" 
            status={status.firestoreInitialized}
            info={status.firestoreInitialized ? "Firestore is ready" : "Firestore not initialized"}
          />
          <StatusItem 
            label="Can Write to Firestore" 
            status={status.canWrite}
            info={status.canWrite ? "Write permission OK" : "Cannot write to Firestore"}
          />
          <StatusItem 
            label="Can Read from Firestore" 
            status={status.canRead}
            info={status.canRead ? "Read permission OK" : "Cannot read from Firestore"}
          />
        </div>

        {status.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground mt-1">{status.error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={checkFirestoreStatus} 
            disabled={testing || !user}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            {testing ? "Testing..." : "Test Connection"}
          </Button>
          <Button 
            onClick={testCreateGroceryList}
            disabled={!user || !status.canWrite}
            variant="outline"
            className="flex-1"
          >
            Create Test List
          </Button>
        </div>

        <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
          <p className="font-medium">📋 Troubleshooting Steps:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Make sure you're signed in</li>
            <li>Create Firestore database in Firebase Console</li>
            <li>Set security rules to allow authenticated users</li>
            <li>Click "Test Connection" to verify</li>
            <li>Click "Create Test List" to test writing</li>
            <li>Check Firebase Console → Firestore Database</li>
          </ol>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <a 
            href="https://console.firebase.google.com/project/basketbuddy-e05b9/firestore" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open Firebase Console →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusItem({ label, status, info }: { label: string; status: boolean; info: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{info}</p>
      </div>
      {status ? (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          OK
        </Badge>
      ) : (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      )}
    </div>
  )
}
