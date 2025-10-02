"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import VennDiagram from "./venn-diagram"

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

interface SimpleVennControlsProps {
  groceryLists: GroceryList[]
}

const COLORS = [
  "rgba(59, 130, 246, 0.5)", // blue
  "rgba(16, 185, 129, 0.5)", // green
  "rgba(249, 115, 22, 0.5)", // orange
  "rgba(236, 72, 153, 0.5)", // pink
]

export function SimpleVennControls({ groceryLists }: SimpleVennControlsProps) {
  // Simple local state - no complex parent communication
  const [selectedLists, setSelectedLists] = useState<string[]>(() => {
    return groceryLists.length >= 2 ? groceryLists.slice(0, 2).map(list => list.id) : []
  })
  
  // All operations are automatically calculated, no need to select them
  const allOperations = ["union", "intersection", "difference", "symmetric-difference"]

  console.log('SimpleVennControls - selectedLists:', selectedLists)

  // Convert to Venn diagram format
  const vennSets = selectedLists
    .map((listId, index) => {
      const list = groceryLists.find(l => l.id === listId)
      if (!list) return null
      
      const elements = new Set(list.items.map(item => item.name.toLowerCase()))
      return {
        id: listId,
        name: list.name,
        elements,
        color: COLORS[index % COLORS.length]
      }
    })
    .filter(Boolean)

  // Calculate results
  const calculateResults = (operation: string) => {
    if (vennSets.length === 0) return new Set<string>()

    let resultSet = new Set<string>()

    switch (operation) {
      case "union":
        vennSets.forEach((set) => {
          set.elements.forEach((elem) => resultSet.add(elem))
        })
        break
      case "intersection":
        if (vennSets.length >= 2) {
          resultSet = new Set(
            Array.from(vennSets[0].elements).filter((elem) => 
              vennSets.every((set) => set.elements.has(elem))
            )
          )
        }
        break
      case "difference":
        if (vennSets.length >= 2) {
          resultSet = new Set(
            Array.from(vennSets[0].elements).filter((elem) => 
              !vennSets.slice(1).some((set) => set.elements.has(elem))
            )
          )
        }
        break
      case "symmetric-difference":
        if (vennSets.length === 2) {
          const allElements = new Set([...vennSets[0].elements, ...vennSets[1].elements])
          resultSet = new Set(
            Array.from(allElements).filter(
              (elem) =>
                (vennSets[0].elements.has(elem) && !vennSets[1].elements.has(elem)) ||
                (!vennSets[0].elements.has(elem) && vennSets[1].elements.has(elem))
            )
          )
        }
        break
    }

    return resultSet
  }

  const getOperationSymbol = (op: string) => {
    switch (op) {
      case "union": return "∪"
      case "intersection": return "∩"
      case "difference": return "−"
      case "symmetric-difference": return "△"
      default: return "∪"
    }
  }

  const handleListClick = (listId: string) => {
    console.log('List clicked:', listId)
    setSelectedLists(prev => {
      const newSelection = prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
      console.log('New list selection:', newSelection)
      return newSelection
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venn Diagram Controls</CardTitle>
        <CardDescription>Simple working controls for list selection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* List Selection */}
        <div>
          <h4 className="font-medium mb-2">Select Lists:</h4>
          <div className="flex flex-wrap gap-2">
            {groceryLists.slice(0, 4).map((list, index) => {
              const isSelected = selectedLists.includes(list.id)
              return (
                <Button
                  key={list.id}
                  onClick={() => handleListClick(list.id)}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ 
                      backgroundColor: isSelected ? COLORS[index % COLORS.length] : 'transparent',
                      border: `2px solid ${COLORS[index % COLORS.length]}`
                    }} 
                  />
                  {list.name} ({list.items.length})
                </Button>
              )
            })}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Selected: {selectedLists.length} lists
          </div>
        </div>

        {/* Venn Diagram */}
        {vennSets.length >= 2 && (
          <div>
            <h4 className="font-medium mb-2">Venn Diagram:</h4>
            <VennDiagram sets={vennSets} />
            
            {/* All Operations Summary */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h5 className="font-medium mb-2 text-sm">All Set Operations:</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {allOperations.map((op) => {
                  const result = calculateResults(op)
                  const isDisabled = op === "symmetric-difference" && selectedLists.length !== 2
                  
                  return (
                    <div 
                      key={op} 
                      className={`p-2 rounded border bg-background border-border ${isDisabled ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-bold">{getOperationSymbol(op)}</span>
                        <span className="font-medium">{op.charAt(0).toUpperCase() + op.slice(1)}</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {result.size}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        {isDisabled ? 'Need 2 lists' : `${result.size} items`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Results - All Operations */}
        {vennSets.length >= 2 && (
          <div>
            <h4 className="font-medium mb-2">Results:</h4>
            <div className="space-y-2">
              {allOperations.map((op) => {
                const result = calculateResults(op)
                const isDisabled = op === "symmetric-difference" && selectedLists.length !== 2
                if (isDisabled || result.size === 0) return null
                
                return (
                  <div key={op} className="p-2 border rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {getOperationSymbol(op)} {op.charAt(0).toUpperCase() + op.slice(1)}:
                      </span>
                      <Badge variant="secondary">{result.size} items</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(result).slice(0, 10).map((item) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                      {result.size > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.size - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {vennSets.length < 2 && (
          <div className="text-center text-muted-foreground py-8">
            <p>Select at least 2 lists to see the Venn diagram</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
