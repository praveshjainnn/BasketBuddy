"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { SunIcon as Union, Plus } from "lucide-react"
import { Inspect } from "lucide-react" // Declare the Inspect variable

interface GroceryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
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

interface SetOperationsPanelProps {
  groceryLists: GroceryList[]
  familyMembers: FamilyMember[]
  selectedLists: string[]
  onToggleSelection: (listId: string) => void
}

export function SetOperationsPanel({
  groceryLists,
  familyMembers,
  selectedLists,
  onToggleSelection,
}: SetOperationsPanelProps) {
  const [activeOperation, setActiveOperation] = useState<
    "union" | "intersection" | "difference" | "symmetric" | "complement" | "cartesian"
  >("union")

  const selectedListsData = useMemo(() => {
    return groceryLists.filter((list) => selectedLists.includes(list.id))
  }, [groceryLists, selectedLists])

  const operationResults = useMemo(() => {
    if (selectedListsData.length < 2 && activeOperation !== "complement") return []

    const allItems = selectedListsData.flatMap((list) =>
      list.items.map((item) => ({ ...item, listId: list.id, listName: list.name })),
    )

    switch (activeOperation) {
      case "union": {
        // Union: All unique items from all lists
        const itemMap = new Map()
        allItems.forEach((item) => {
          const key = item.name.toLowerCase()
          if (!itemMap.has(key)) {
            itemMap.set(key, { ...item, sources: [item.listName], totalQuantity: item.quantity })
          } else {
            const existing = itemMap.get(key)
            existing.sources.push(item.listName)
            existing.totalQuantity += item.quantity
          }
        })
        return Array.from(itemMap.values())
      }

      case "intersection": {
        // Intersection: Items that appear in ALL selected lists
        const itemCounts = new Map()
        allItems.forEach((item) => {
          const key = item.name.toLowerCase()
          if (!itemCounts.has(key)) {
            itemCounts.set(key, { item, count: 1, lists: new Set([item.listId]) })
          } else {
            const existing = itemCounts.get(key)
            existing.lists.add(item.listId)
            existing.count = existing.lists.size
          }
        })

        return Array.from(itemCounts.values())
          .filter(({ count }) => count === selectedListsData.length)
          .map(({ item }) => ({ ...item, sources: selectedListsData.map((l) => l.name) }))
      }

      case "difference": {
        // Difference: Items in first list but not in others
        if (selectedListsData.length < 2) return []

        const firstList = selectedListsData[0]
        const otherItems = selectedListsData
          .slice(1)
          .flatMap((list) => list.items.map((item) => item.name.toLowerCase()))
        const otherItemsSet = new Set(otherItems)

        return firstList.items
          .filter((item) => !otherItemsSet.has(item.name.toLowerCase()))
          .map((item) => ({ ...item, sources: [firstList.name] }))
      }

      case "symmetric": {
        // Symmetric Difference: Items that are in either list but not in both
        if (selectedListsData.length !== 2) return []

        const list1Items = new Set(selectedListsData[0].items.map((item) => item.name.toLowerCase()))
        const list2Items = new Set(selectedListsData[1].items.map((item) => item.name.toLowerCase()))

        const symmetricItems = []

        // Items in list1 but not in list2
        selectedListsData[0].items.forEach((item) => {
          if (!list2Items.has(item.name.toLowerCase())) {
            symmetricItems.push({ ...item, sources: [selectedListsData[0].name], inList: 1 })
          }
        })

        // Items in list2 but not in list1
        selectedListsData[1].items.forEach((item) => {
          if (!list1Items.has(item.name.toLowerCase())) {
            symmetricItems.push({ ...item, sources: [selectedListsData[1].name], inList: 2 })
          }
        })

        return symmetricItems
      }

      case "complement": {
        // Complement: Items NOT in the selected list (from a universal set of all items)
        if (selectedListsData.length !== 1) return []

        const selectedItems = new Set(selectedListsData[0].items.map((item) => item.name.toLowerCase()))
        const allPossibleItems = groceryLists.flatMap((list) => list.items)

        return allPossibleItems
          .filter((item) => !selectedItems.has(item.name.toLowerCase()))
          .map((item) => {
            const sourceList = groceryLists.find((list) => list.items.some((i) => i.id === item.id))
            return { ...item, sources: [sourceList?.name || "Unknown"] }
          })
      }

      case "cartesian": {
        // Cartesian Product: All possible combinations of items from selected lists
        if (selectedListsData.length !== 2) return []

        const combinations = []
        selectedListsData[0].items.forEach((item1) => {
          selectedListsData[1].items.forEach((item2) => {
            combinations.push({
              id: `${item1.id}-${item2.id}`,
              name: `${item1.name} + ${item2.name}`,
              category: `${item1.category} & ${item2.category}`,
              quantity: item1.quantity + item2.quantity,
              unit: item1.unit === item2.unit ? item1.unit : `${item1.unit}+${item2.unit}`,
              addedBy: `${item1.addedBy} & ${item2.addedBy}`,
              addedAt: new Date(),
              sources: [selectedListsData[0].name, selectedListsData[1].name],
            })
          })
        })

        return combinations.slice(0, 50) // Limit to prevent UI overload
      }

      default:
        return []
    }
  }, [selectedListsData, activeOperation, groceryLists])

  const getMemberById = (id: string) => {
    return familyMembers.find((member) => member.id === id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Compare Lists</h2>
        <p className="text-sm text-muted-foreground">Select lists to compare and analyze using set operations</p>
      </div>

      {/* Visualization Section */}
      {(selectedLists.length >= 2 || (activeOperation === "complement" && selectedLists.length === 1)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visualization</CardTitle>
            <CardDescription>Visual representation of the current set operation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {/* Bar Graph */}
              <div className="p-4 border rounded-lg bg-background/50">
                <h4 className="font-medium text-foreground mb-3">Item Distribution</h4>
                <div className="h-64 flex items-end justify-around gap-2 pt-6 relative">
                  {/* Category distribution bar chart */}
                  {(() => {
                    // Group items by category
                    const categories = {};
                    operationResults.forEach(item => {
                      if (!categories[item.category]) {
                        categories[item.category] = 0;
                      }
                      categories[item.category]++;
                    });
                    
                    // Convert to array and sort
                    const sortedCategories = Object.entries(categories)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5); // Show top 5 categories
                    
                    const maxCount = Math.max(...sortedCategories.map(c => c[1]));
                    
                    return sortedCategories.map(([category, count], index) => {
                      const height = `${(count / maxCount) * 100}%`;
                      const colors = [
                        'bg-primary', 'bg-secondary', 'bg-accent',
                        'bg-chart-3', 'bg-chart-4', 'bg-chart-5'
                      ];
                      
                      return (
                        <div key={category} className="flex flex-col items-center w-1/6">
                          <div 
                            className={`w-full ${colors[index % colors.length]} rounded-t`} 
                            style={{ height }}
                          >
                            <div className="text-xs text-white font-medium text-center pt-1">{count}</div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 truncate w-full text-center">
                            {category}
                          </div>
                        </div>
                      );
                    });
                  })()} 
                  
                  {/* Y-axis line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border"></div>
                  {/* X-axis line */}
                  <div className="absolute left-0 right-0 bottom-0 h-px bg-border"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Lists to Compare</CardTitle>
          <CardDescription>Choose 2 or more lists to perform set operations</CardDescription>
        </CardHeader>
        <CardContent className="pointer-events-auto relative z-10">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 pointer-events-auto">
            {groceryLists.map((list) => {
              const isSelected = selectedLists.includes(list.id)
              const creator = getMemberById(list.createdBy)

              return (
                <div
                  key={list.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all pointer-events-auto ${
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => onToggleSelection(list.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onToggleSelection(list.id)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} readOnly />
                    <div className="flex-1 min-w-0">
                      <div className={`w-full h-2 rounded mb-2 ${list.color}`} />
                      <h4 className="font-medium text-foreground truncate">{list.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {list.items.length} items • by {creator?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {selectedLists.length > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>{selectedLists.length}</strong> lists selected
                {selectedLists.length >= 2 && <span className="text-primary ml-2">✓ Ready to compare</span>}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operations */}
      {(selectedLists.length >= 2 || (activeOperation === "complement" && selectedLists.length === 1)) && (
        <Card className="pointer-events-auto relative z-10">
          <CardHeader>
            <CardTitle className="text-lg">Advanced Set Operations</CardTitle>
            <CardDescription>Analyze your selected lists using mathematical set operations</CardDescription>
          </CardHeader>
          <CardContent className="pointer-events-auto">
            <Tabs value={activeOperation} onValueChange={(value) => setActiveOperation(value as any)}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 pointer-events-auto relative z-10">
                <TabsTrigger value="union" className="gap-2 pointer-events-auto" type="button">
                  <Plus className="w-4 h-4" />
                  Union
                </TabsTrigger>
                <TabsTrigger value="intersection" className="gap-2 pointer-events-auto" type="button">
                  <Plus className="w-4 h-4" /> {/* Placeholder for icon */}
                  Intersection
                </TabsTrigger>
                <TabsTrigger value="difference" className="gap-2 pointer-events-auto" type="button">
                  <Plus className="w-4 h-4" /> {/* Placeholder for icon */}
                  Difference
                </TabsTrigger>
                <TabsTrigger value="symmetric" className="gap-2 pointer-events-auto" type="button">
                  <Plus className="w-4 h-4" /> {/* Placeholder for icon */}
                  Symmetric
                </TabsTrigger>
                <TabsTrigger value="complement" className="gap-2 pointer-events-auto" type="button">
                  <Inspect className="w-4 h-4" /> {/* Use Inspect icon */}
                  Complement
                </TabsTrigger>
                <TabsTrigger value="cartesian" className="gap-2 pointer-events-auto" type="button">
                  <Plus className="w-4 h-4" /> {/* Placeholder for icon */}
                  Cartesian
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="union" className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-medium text-primary mb-2">Union Operation</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows all unique items from all selected lists combined. Perfect for creating a master shopping
                      list.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="intersection" className="space-y-4">
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <h4 className="font-medium text-accent mb-2">Intersection Operation</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows items that appear in ALL selected lists. Great for finding commonly needed items.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="difference" className="space-y-4">
                  <div className="p-4 bg-chart-3/5 border border-chart-3/20 rounded-lg">
                    <h4 className="font-medium text-chart-3 mb-2">Difference Operation</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows items in the first selected list that are NOT in the other lists. Useful for finding unique
                      items.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="symmetric" className="space-y-4">
                  <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                    <h4 className="font-medium text-secondary mb-2">Symmetric Difference Operation</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows items that are in either list but not both. Perfect for finding unique items between two
                      lists.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="complement" className="space-y-4">
                  <div className="p-4 bg-chart-4/5 border border-chart-4/20 rounded-lg">
                    <h4 className="font-medium text-chart-4 mb-2">Complement Operation</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows all items NOT in the selected list. Useful for discovering what you might be missing.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="cartesian" className="space-y-4">
                  <div className="p-4 bg-chart-5/5 border border-chart-5/20 rounded-lg">
                    <h4 className="font-medium text-chart-5 mb-2">Cartesian Product Operation</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows all possible combinations of items from two lists. Great for meal planning and recipe
                      combinations.
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {(selectedLists.length >= 2 || (activeOperation === "complement" && selectedLists.length === 1)) &&
        operationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Results ({operationResults.length} items)
                <Badge variant="secondary" className="capitalize">
                  {activeOperation}
                </Badge>
              </CardTitle>
              <CardDescription>
                {activeOperation === "union" && "All unique items from selected lists"}
                {activeOperation === "intersection" && "Items common to all selected lists"}
                {activeOperation === "difference" && `Items unique to "${selectedListsData[0]?.name}"`}
                {activeOperation === "symmetric" && "Items in either list but not both"}
                {activeOperation === "complement" && `Items NOT in "${selectedListsData[0]?.name}"`}
                {activeOperation === "cartesian" && "All possible item combinations (limited to 50)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {operationResults.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        {activeOperation === "union" && item.totalQuantity && (
                          <Badge variant="secondary" className="text-xs">
                            Total: {item.totalQuantity} {item.unit}
                          </Badge>
                        )}
                        {activeOperation !== "union" && (
                          <Badge variant="secondary" className="text-xs">
                            {item.quantity} {item.unit}
                          </Badge>
                        )}
                        {activeOperation === "symmetric" && item.inList && (
                          <Badge variant={item.inList === 1 ? "default" : "secondary"} className="text-xs">
                            List {item.inList}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Found in:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.sources?.map((source, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Empty State */}
      {selectedLists.length < 2 && !(activeOperation === "complement" && selectedLists.length === 1) && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Union className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Select Lists to Compare</h3>
            <p className="text-muted-foreground">
              Choose at least 2 grocery lists to start comparing (or 1 for complement operation)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
