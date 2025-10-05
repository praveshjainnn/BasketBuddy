"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle2, XCircle, Loader2, Cloud } from "lucide-react"
import { useAuth } from "./firebase-auth"

interface GroceryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  price: number
  addedBy: string
  addedAt: Date
}

interface GroceryList {
  id: string
  name: string
  description: string
  items: GroceryItem[]
  createdBy: string
  createdAt: Date
  sharedWith: string[]
  color: string
}

interface UploadToFirestoreProps {
  groceryLists: GroceryList[]
}

export function UploadToFirestore({ groceryLists }: UploadToFirestoreProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({})
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleToggleList = (listId: string) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLists.length === groceryLists.length) {
      setSelectedLists([])
    } else {
      setSelectedLists(groceryLists.map(list => list.id))
    }
  }

  const handleUpload = async () => {
    if (!user) {
      alert("Please sign in first")
      return
    }

    if (selectedLists.length === 0) {
      alert("Please select at least one list")
      return
    }

    setUploading(true)
    setErrorMessage("")
    const status: Record<string, 'pending' | 'success' | 'error'> = {}
    
    // Initialize status
    selectedLists.forEach(listId => {
      status[listId] = 'pending'
    })
    setUploadStatus(status)

    try {
      const { firestore } = await import("@/lib/firebase")
      const { collection, addDoc } = await import("firebase/firestore")
      
      if (!firestore) {
        alert("Firestore not initialized. Please create Firestore database in Firebase Console.")
        setUploading(false)
        return
      }

      // Upload each selected list
      for (const listId of selectedLists) {
        const list = groceryLists.find(l => l.id === listId)
        if (!list) continue

        try {
          await addDoc(collection(firestore, "groceryLists"), {
            ...list,
            userId: user.uid,
            createdAt: list.createdAt instanceof Date ? list.createdAt.toISOString() : list.createdAt,
            items: list.items.map(item => ({
              ...item,
              addedAt: item.addedAt instanceof Date ? item.addedAt.toISOString() : item.addedAt
            }))
          })
          
          status[listId] = 'success'
          setUploadStatus({ ...status })
        } catch (error: any) {
          console.error(`Error uploading list ${list.name}:`, error)
          console.error('Full error:', JSON.stringify(error, null, 2))
          status[listId] = 'error'
          setUploadStatus({ ...status })
          
          // Set error message
          if (error.code === 'permission-denied') {
            setErrorMessage(`Permission denied! Go to Firebase Console → Firestore → Rules and publish the security rules.`)
          } else if (error.code === 'not-found') {
            setErrorMessage(`Firestore not found! Create database in Firebase Console first.`)
          } else {
            setErrorMessage(`Error: ${error.message || error.code || 'Unknown error'}`)
          }
        }
      }

      // Check if all succeeded
      const allSuccess = Object.values(status).every(s => s === 'success')
      if (allSuccess) {
        setTimeout(() => {
          setOpen(false)
          setSelectedLists([])
          setUploadStatus({})
        }, 2000)
      }
    } catch (error: any) {
      console.error("Error uploading to Firestore:", error)
      alert(`Error: ${error.message}\n\nMake sure Firestore database is created in Firebase Console.`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Cloud className="w-4 h-4" />
          Upload to Firebase
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Lists to Firebase
          </DialogTitle>
          <DialogDescription>
            Select the lists you want to upload to Firestore database
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!user ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
              <p className="text-destructive font-medium">Please sign in to upload lists</p>
            </div>
          ) : groceryLists.length === 0 ? (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-muted-foreground">No lists available to upload</p>
              <p className="text-sm text-muted-foreground mt-2">Create or import a list first</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedLists.length === groceryLists.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="font-medium">Select All ({groceryLists.length} lists)</span>
                </Label>
                <span className="text-sm text-muted-foreground">
                  {selectedLists.length} selected
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {groceryLists.map((list) => (
                  <div
                    key={list.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      selectedLists.includes(list.id) ? 'bg-primary/5 border-primary/20' : 'bg-card'
                    }`}
                  >
                    <Label
                      htmlFor={`list-${list.id}`}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <Checkbox
                        id={`list-${list.id}`}
                        checked={selectedLists.includes(list.id)}
                        onCheckedChange={() => handleToggleList(list.id)}
                        disabled={uploading}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{list.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {list.items.length} items • {list.description}
                        </p>
                      </div>
                    </Label>
                    
                    {uploadStatus[list.id] && (
                      <div className="ml-2">
                        {uploadStatus[list.id] === 'pending' && (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        )}
                        {uploadStatus[list.id] === 'success' && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {uploadStatus[list.id] === 'error' && (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || selectedLists.length === 0 || !user}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {selectedLists.length} List{selectedLists.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    setSelectedLists([])
                    setUploadStatus({})
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">{errorMessage}</p>
                </div>
              )}

              {Object.keys(uploadStatus).length > 0 && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Upload Status:</p>
                  <p className="text-muted-foreground">
                    {Object.values(uploadStatus).filter(s => s === 'success').length} succeeded,{' '}
                    {Object.values(uploadStatus).filter(s => s === 'error').length} failed
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
