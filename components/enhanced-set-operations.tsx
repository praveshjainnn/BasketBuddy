"use client"

import { useState, useMemo, useEffect } from "react"
import { SetOperationsPanel } from "./set-operations-panel"
import { OperationBarGraph } from "./operation-bar-graph"
import { SaveSetForm } from "./save-set-form"
import { LoadSavedSets } from "./load-saved-sets"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EnhancedSetOperationsProps {
  initialGroceryLists: any[]
  familyMembers: any[]
  userId: string
}

export function EnhancedSetOperations({ initialGroceryLists, familyMembers, userId }: EnhancedSetOperationsProps) {
  const [groceryLists, setGroceryLists] = useState(initialGroceryLists)
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [activeOperation, setActiveOperation] = useState<
    "union" | "intersection" | "difference" | "symmetric" | "complement" | "cartesian"
  >("union")
  const [activeTab, setActiveTab] = useState("operations")
  
  // Calculate all operation results for visualization
  const allOperationResults = useMemo(() => {
    const selectedListsData = groceryLists.filter((list) => selectedLists.includes(list.id))
    
    if (selectedListsData.length < 2 && activeOperation !== "complement") return {
      union: [],
      intersection: [],
      difference: [],
      symmetric: [],
      complement: [],
      cartesian: []
    }

    const allItems = selectedListsData.flatMap((list) =>
      list.items.map((item) => ({ ...item, listId: list.id, listName: list.name })),
    )

    // Union operation
    const unionMap = new Map()
    allItems.forEach((item) => {
      const key = item.name.toLowerCase()
      if (!unionMap.has(key)) {
        unionMap.set(key, { ...item, sources: [item.listName], totalQuantity: item.quantity })
      } else {
        const existing = unionMap.get(key)
        existing.sources.push(item.listName)
        existing.totalQuantity += item.quantity
      }
    })
    const unionResult = Array.from(unionMap.values())

    // Intersection operation
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
    const intersectionResult = Array.from(itemCounts.values())
      .filter(({ count }) => count === selectedListsData.length)
      .map(({ item }) => ({ ...item, sources: selectedListsData.map((l) => l.name) }))

    // Difference operation
    let differenceResult: any[] = []
    if (selectedListsData.length >= 2) {
      const firstList = selectedListsData[0]
      const otherItems = selectedListsData
        .slice(1)
        .flatMap((list) => list.items.map((item) => item.name.toLowerCase()))
      const otherItemsSet = new Set(otherItems)

      differenceResult = firstList.items
        .filter((item) => !otherItemsSet.has(item.name.toLowerCase()))
        .map((item) => ({ ...item, sources: [firstList.name] }))
    }

    // Symmetric difference operation
    let symmetricResult: any[] = []
    if (selectedListsData.length === 2) {
      const list1Items = new Set(selectedListsData[0].items.map((item) => item.name.toLowerCase()))
      const list2Items = new Set(selectedListsData[1].items.map((item) => item.name.toLowerCase()))

      // Items in list1 but not in list2
      selectedListsData[0].items.forEach((item) => {
        if (!list2Items.has(item.name.toLowerCase())) {
          symmetricResult.push({ ...item, sources: [selectedListsData[0].name], inList: 1 })
        }
      })

      // Items in list2 but not in list1
      selectedListsData[1].items.forEach((item) => {
        if (!list1Items.has(item.name.toLowerCase())) {
          symmetricResult.push({ ...item, sources: [selectedListsData[1].name], inList: 2 })
        }
      })
    }

    // Complement operation
    let complementResult: any[] = []
    if (selectedListsData.length === 1) {
      const selectedItems = new Set(selectedListsData[0].items.map((item) => item.name.toLowerCase()))
      const allPossibleItems = groceryLists.flatMap((list) => list.items)

      complementResult = allPossibleItems
        .filter((item) => !selectedItems.has(item.name.toLowerCase()))
        .map((item) => {
          const sourceList = groceryLists.find((list) => list.items.some((i) => i.id === item.id))
          return { ...item, sources: [sourceList?.name || "Unknown"] }
        })
    }

    // Cartesian product operation
    let cartesianResult: any[] = []
    if (selectedListsData.length === 2) {
      selectedListsData[0].items.forEach((item1) => {
        selectedListsData[1].items.forEach((item2) => {
          cartesianResult.push({
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
      cartesianResult = cartesianResult.slice(0, 50) // Limit to prevent UI overload
    }

    return {
      union: unionResult,
      intersection: intersectionResult,
      difference: differenceResult,
      symmetric: symmetricResult,
      complement: complementResult,
      cartesian: cartesianResult
    }
  }, [groceryLists, selectedLists])

  // Current operation results
  const currentOperationResults = useMemo(() => {
    return allOperationResults[activeOperation] || []
  }, [allOperationResults, activeOperation])

  const handleToggleSelection = (listId: string) => {
    setSelectedLists((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    )
  }

  const handleSetSelected = (set: any) => {
    // Check if the set is already in the grocery lists
    const existingIndex = groceryLists.findIndex(list => list.id === set.id)
    
    if (existingIndex === -1) {
      // Add the set to grocery lists
      const newList = {
        id: set.id,
        name: set.name,
        description: set.description,
        color: set.color,
        items: set.set_items,
        createdBy: userId,
        createdAt: new Date(set.created_at),
        sharedWith: []
      }
      
      setGroceryLists(prev => [...prev, newList])
      
      // Auto-select the newly added list
      setSelectedLists(prev => [...prev, set.id])
    } else {
      // If already exists, just select it
      if (!selectedLists.includes(set.id)) {
        setSelectedLists(prev => [...prev, set.id])
      }
    }
  }

  // Save operation result to database
  const handleSaveOperation = async () => {
    if (!userId || currentOperationResults.length === 0) return
    
    try {
      await fetch('/api/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          operationType: activeOperation,
          setIds: selectedLists,
          result: currentOperationResults
        })
      })
    } catch (error) {
      console.error('Failed to save operation:', error)
    }
  }

  // Save operation when results change
  useEffect(() => {
    if (currentOperationResults.length > 0) {
      handleSaveOperation()
    }
  }, [currentOperationResults])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SetOperationsPanel
            groceryLists={groceryLists}
            familyMembers={familyMembers}
            selectedLists={selectedLists}
            onToggleSelection={handleToggleSelection}
          />
        </div>
        
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="saved">Saved Sets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="operations" className="space-y-4 mt-4">
              {selectedLists.length >= 1 && (
                <SaveSetForm 
                  operationResults={currentOperationResults}
                  operationType={activeOperation}
                  userId={userId}
                />
              )}
            </TabsContent>
            
            <TabsContent value="saved" className="space-y-4 mt-4">
              <LoadSavedSets 
                userId={userId}
                onSetSelected={handleSetSelected}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Visualizations */}
      {selectedLists.length >= 1 && (
        <div className="grid grid-cols-1 gap-6">
          {/* Bar Graph */}
          <OperationBarGraph 
            sets={groceryLists.filter(list => selectedLists.includes(list.id))}
            operationResults={allOperationResults}
          />
        </div>
      )}
    </div>
  )
}