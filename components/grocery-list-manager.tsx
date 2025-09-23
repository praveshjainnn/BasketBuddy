"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Share2, Calendar, User, Sparkles, ShoppingBag, TrendingUp } from "lucide-react"

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

interface FamilyMember {
  id: string
  name: string
  email: string
  avatar: string
}

interface GroceryListManagerProps {
  groceryLists: GroceryList[]
  familyMembers: FamilyMember[]
  onAddList: (list: Omit<GroceryList, "id" | "createdAt">) => void
  onUpdateList: (id: string, updates: Partial<GroceryList>) => void
  onDeleteList: (id: string) => void
  selectedLists: string[]
  onToggleSelection: (listId: string) => void
  currentUserId?: string
}

export function GroceryListManager({
  groceryLists,
  familyMembers,
  onAddList,
  onUpdateList,
  onDeleteList,
  selectedLists,
  onToggleSelection,
  currentUserId,
}: GroceryListManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingList, setEditingList] = useState<GroceryList | null>(null)
  const [newListForm, setNewListForm] = useState({
    name: "",
    description: "",
    createdBy: currentUserId ?? "1",
    sharedWith: [] as string[],
    color: "bg-gradient-to-br from-primary/20 to-secondary/10",
  })

  // Per-list inline item form state (name, quantity pieces, and price)
  const [itemForms, setItemForms] = useState<Record<string, { name: string; quantity: number; price: number }>>({})

  const colorOptions = [
    {
      value: "bg-gradient-to-br from-primary/20 to-secondary/10",
      label: "Ocean",
      preview: "from-cyan-500 to-violet-500",
    },
    {
      value: "bg-gradient-to-br from-emerald-400/20 to-teal-400/10",
      label: "Forest",
      preview: "from-emerald-400 to-teal-400",
    },
    {
      value: "bg-gradient-to-br from-orange-400/20 to-red-400/10",
      label: "Sunset",
      preview: "from-orange-400 to-red-400",
    },
    {
      value: "bg-gradient-to-br from-purple-400/20 to-pink-400/10",
      label: "Galaxy",
      preview: "from-purple-400 to-pink-400",
    },
    {
      value: "bg-gradient-to-br from-blue-400/20 to-indigo-400/10",
      label: "Sky",
      preview: "from-blue-400 to-indigo-400",
    },
  ]

  // Keep createdBy synced with current user if it changes or when opening dialog
  useEffect(() => {
    setNewListForm((prev) => ({ ...prev, createdBy: currentUserId ?? "1" }))
  }, [currentUserId, isCreateDialogOpen])

  const handleCreateList = () => {
    if (!newListForm.name.trim()) {
      console.error("List name is required");
      alert("Please enter a list name");
      return;
    }
    
    try {
      // Create a deep copy of the form data to avoid reference issues
      const newList = JSON.parse(JSON.stringify({
        ...newListForm,
        name: newListForm.name.trim(),
        description: newListForm.description.trim(),
        items: [],
      }));
      
      console.log("Creating new list:", JSON.stringify(newList));
      
      // Call the parent component's add list function
      onAddList(newList);
      
      // Reset the form and close dialog
      setNewListForm({
        name: "",
        description: "",
        createdBy: currentUserId ?? "1",
        sharedWith: [],
        color: "bg-gradient-to-br from-primary/20 to-secondary/10",
      });
      
      // Close the dialog
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating new list:", error);
      alert("Error creating list. Please try again.");
    }
  }

  const handleAddItem = (listId: string) => {
    const form = itemForms[listId] || { name: "", quantity: 1, price: 0 }
    const itemName = (form.name || "").trim()
    if (!itemName) return
    const list = groceryLists.find((l) => l.id === listId)
    if (!list) return
    const quantitySafe = Number.isFinite(form.quantity) && form.quantity > 0 ? Math.floor(form.quantity) : 1
    const priceSafe = Number.isFinite(form.price) && form.price >= 0 ? Number(form.price) : 0

    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: itemName,
      category: "Other",
      quantity: quantitySafe,
      unit: "pieces",
      price: priceSafe,
      addedBy: "1",
      addedAt: new Date(),
    }
    onUpdateList(listId, {
      items: [...list.items, newItem],
    })
    // reset this list's item form
    setItemForms((prev) => ({ ...prev, [listId]: { name: "", quantity: 1, price: 0 } }))
  }

  const handleRemoveItem = (listId: string, itemId: string) => {
    const list = groceryLists.find((l) => l.id === listId)
    if (list) {
      onUpdateList(listId, {
        items: list.items.filter((item) => item.id !== itemId),
      })
    }
  }

  const getMemberById = (id: string) => {
    return familyMembers.find((member) => member.id === id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pointer-events-auto relative z-20">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold gradient-text animate-slide-up">Grocery Lists</h2>
          <p className="text-muted-foreground animate-slide-up">
            Create and manage your family's grocery lists with style
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300 animate-scale-in pointer-events-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <Sparkles className="w-4 h-4" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-border/50">
            <DialogHeader>
              <DialogTitle className="gradient-text">Create New Grocery List</DialogTitle>
              <DialogDescription>Add a new grocery list for your family to collaborate on</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">List Name</Label>
                <Input
                  id="name"
                  value={newListForm.name}
                  onChange={(e) => setNewListForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Weekly Groceries"
                  className="glass-effect"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newListForm.description}
                  onChange={(e) => setNewListForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                  className="glass-effect"
                />
              </div>
              <div>
                <Label>Color Theme</Label>
                <div className="grid grid-cols-5 gap-3 mt-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewListForm((prev) => ({ ...prev, color: color.value }))}
                      className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${color.preview} border-2 transition-all duration-300 hover:scale-110 ${
                        newListForm.color === color.value ? "border-primary shadow-lg scale-110" : "border-border/30"
                      }`}
                      title={color.label}
                    >
                      {newListForm.color === color.value && (
                        <div className="absolute inset-0 rounded-xl bg-white/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Share with Family Members</Label>
                <div className="space-y-3 mt-3">
                  {familyMembers
                    .filter((m) => m.id !== newListForm.createdBy)
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/10 transition-colors"
                      >
                        <Checkbox
                          id={member.id}
                          checked={newListForm.sharedWith.includes(member.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewListForm((prev) => ({
                                ...prev,
                                sharedWith: [...prev.sharedWith, member.id],
                              }))
                            } else {
                              setNewListForm((prev) => ({
                                ...prev,
                                sharedWith: prev.sharedWith.filter((id) => id !== member.id),
                              }))
                            }
                          }}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-secondary"
                        />
                        <label htmlFor={member.id} className="flex items-center gap-3 text-sm cursor-pointer">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full flex items-center justify-center">
                            <span>{member.avatar}</span>
                          </div>
                          <span className="font-medium">{member.name}</span>
                        </label>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateList} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create List
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groceryLists.map((list, index) => {
          const creator = getMemberById(list.createdBy)
          const isSelected = selectedLists.includes(list.id)

          return (
            <Card
              key={list.id}
              className={`card-3d group relative overflow-hidden transition-all duration-500 hover:scale-105 animate-slide-up ${
                isSelected ? "ring-2 ring-primary shadow-2xl scale-105" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute top-0 left-0 right-0 h-3 ${list.color} opacity-80`} />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />

              <CardHeader className="pt-6 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection(list.id)}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-secondary"
                      />
                      <CardTitle className="text-xl gradient-text group-hover:scale-105 transition-transform">
                        {list.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-2 text-muted-foreground">
                      {list.description || "No description"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteList(list.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      Items ({list.items.length})
                    </h4>
                    {list.items.length > 0 && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-secondary/10">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {list.items.slice(0, 6).map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-card/50 to-transparent hover:from-accent/10 hover:to-primary/5 transition-all duration-300 animate-slide-up"
                        style={{ animationDelay: `${itemIndex * 0.05}s` }}
                      >
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-gradient-to-r from-secondary/10 to-accent/10">
                            {item.quantity} {item.unit}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(list.id, item.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {list.items.length > 6 && (
                      <p className="text-xs text-muted-foreground text-center py-2 bg-gradient-to-r from-transparent via-accent/5 to-transparent rounded-lg">
                        +{list.items.length - 6} more items
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Item name"
                    value={itemForms[list.id]?.name ?? ""}
                    onChange={(e) =>
                      setItemForms((prev) => ({
                        ...prev,
                        [list.id]: { name: e.target.value, quantity: prev[list.id]?.quantity ?? 1, price: prev[list.id]?.price ?? 0 },
                      }))
                    }
                    className="flex-1 glass-effect border-border/50 focus:border-primary/50 transition-all duration-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem(list.id)
                      }
                    }}
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={itemForms[list.id]?.quantity ?? 1}
                    onChange={(e) =>
                      setItemForms((prev) => ({
                        ...prev,
                        [list.id]: {
                          name: prev[list.id]?.name ?? "",
                          quantity: Number(e.target.value),
                          price: prev[list.id]?.price ?? 0,
                        },
                      }))
                    }
                    className="w-24 glass-effect border-border/50 focus:border-primary/50 transition-all duration-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem(list.id)
                      }
                    }}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Price"
                    value={itemForms[list.id]?.price ?? 0}
                    onChange={(e) =>
                      setItemForms((prev) => ({
                        ...prev,
                        [list.id]: {
                          name: prev[list.id]?.name ?? "",
                          quantity: prev[list.id]?.quantity ?? 1,
                          price: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-28 glass-effect border-border/50 focus:border-primary/50 transition-all duration-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem(list.id)
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddItem(list.id)}
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="font-medium">{creator?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{list.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>

                {list.sharedWith.length > 0 && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Share2 className="w-3 h-3" />
                      <span>Shared with:</span>
                    </div>
                    <div className="flex gap-1">
                      {list.sharedWith.map((memberId) => {
                        const member = getMemberById(memberId)
                        return member ? (
                          <div
                            key={memberId}
                            className="w-6 h-6 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full flex items-center justify-center text-xs animate-float"
                            title={member.name}
                          >
                            {member.avatar}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {groceryLists.length === 0 && (
        <Card className="text-center py-16 card-3d animate-scale-in">
          <CardContent>
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <span className="text-3xl">🛒</span>
            </div>
            <h3 className="text-2xl font-bold gradient-text mb-3">No grocery lists yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              Create your first grocery list to start organizing your family's shopping with our amazing 3D interface
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <Sparkles className="w-4 h-4" />
              Create Your First List
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
