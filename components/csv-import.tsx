"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Download, AlertCircle, CheckCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface CSVImportProps {
  familyMembers: FamilyMember[]
  onImportList: (list: Omit<GroceryList, "id" | "createdAt">) => void
}

interface ParsedItem {
  name: string
  category: string
  quantity: number
  unit: string
  price: number
  isValid: boolean
  error?: string
}

export function CSVImport({ familyMembers, onImportList }: CSVImportProps) {
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [csvContent, setCsvContent] = useState("")
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([])
  const [listName, setListName] = useState("")
  const [listDescription, setListDescription] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState(familyMembers[0]?.id || "")
  const [importStatus, setImportStatus] = useState<"idle" | "parsing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("File selected:", file.name, file.type);
      // Accept any file type but check content format during parsing
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          console.log("File content loaded, length:", content.length);
          setCsvContent(content)
          parseCSV(content)
        } catch (error) {
          console.error("Error reading file:", error);
          setErrorMessage("Error reading file. Please try again.")
          setImportStatus("error")
        }
      }
      reader.onerror = () => {
        console.error("FileReader error:", reader.error);
        setErrorMessage("Error reading file. Please try again.")
        setImportStatus("error")
      }
      reader.readAsText(file)
    } else {
      setErrorMessage("Please select a file")
      setImportStatus("error")
    }
  }

  const parseCSV = (content: string) => {
    setImportStatus("parsing")
    try {
      // Detect delimiter (comma or tab)
      const firstLine = content.trim().split("\n")[0];
      let delimiter = ",";
      if (firstLine.includes("\t")) {
        delimiter = "\t";
      } else if (firstLine.includes(";")) {
        delimiter = ";";
      }
      
      const lines = content.trim().split("\n");
      
      // Handle quoted values and different delimiters
      const parseRow = (row: string) => {
        const result = [];
        let inQuotes = false;
        let currentValue = "";
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            result.push(currentValue.trim());
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        
        result.push(currentValue.trim());
        return result;
      };
      
      const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/"/g, ""));
      
      // Try to identify headers even if they don't match exactly
      const findHeaderIndex = (possibleNames: string[]) => {
        return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
      };
      
      // Look for headers with flexible matching
      const nameIndex = findHeaderIndex(["name", "item", "product"]);
      const categoryIndex = findHeaderIndex(["category", "type", "group"]);
      const quantityIndex = findHeaderIndex(["quantity", "qty", "amount", "count"]);
      const unitIndex = findHeaderIndex(["unit", "measure", "uom"]);
      const priceIndex = findHeaderIndex(["price", "cost", "value"]);
      
      if (nameIndex === -1) {
        setErrorMessage("Could not find a column for item names. Please include a column with 'name', 'item', or 'product' in the header.");
        setImportStatus("error");
        return;
      }
      
      const items: ParsedItem[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = parseRow(lines[i]);
        
        if (values.length < 2) continue; // Need at least name and one other value
        
        const name = values[nameIndex]?.replace(/"/g, "") || "";
        const category = categoryIndex >= 0 ? values[categoryIndex]?.replace(/"/g, "") || "Uncategorized" : "Uncategorized";
        const quantityStr = quantityIndex >= 0 ? values[quantityIndex]?.replace(/"/g, "") || "1" : "1";
        const unit = unitIndex >= 0 ? values[unitIndex]?.replace(/"/g, "") || "piece" : "piece";
        const priceStr = priceIndex >= 0 ? values[priceIndex]?.replace(/"/g, "") || "0" : "0";
        
        // Handle different number formats (1,000.00 or 1.000,00)
        const normalizedQuantity = quantityStr.replace(/\s/g, "").replace(/,(?=\d{3})/g, "");
        const quantity = Number.parseFloat(normalizedQuantity);
        
        // Handle price parsing
        const normalizedPrice = priceStr.replace(/\s/g, "").replace(/,(?=\d{3})/g, "");
        const price = Number.parseFloat(normalizedPrice);
        
        const item: ParsedItem = {
          name,
          category,
          quantity: isNaN(quantity) ? 1 : quantity,
          unit,
          price: isNaN(price) ? 0 : price,
          isValid: name.length > 0,
          error: name.length === 0 ? "Name is required" : undefined,
        };
        
        items.push(item);
      }
      
      if (items.length === 0) {
        setErrorMessage("No valid items found in the file. Please check the format.");
        setImportStatus("error");
        return;
      }
      
      setParsedItems(items);
      setImportStatus("success");
    } catch (error) {
      console.error("Parse error:", error);
      setErrorMessage("Failed to parse file. Please check the format and try again.");
      setImportStatus("error");
    }
  }

  const handleImport = () => {
    try {
      if (!listName.trim()) {
        console.error("Import error: Missing list name");
        setErrorMessage("Please enter a list name")
        return
      }
  
      const validItems = parsedItems.filter((item) => item.isValid)
      if (validItems.length === 0) {
        console.error("Import error: No valid items to import");
        setErrorMessage("No valid items to import")
        return
      }
  
      console.log("Importing list with valid items:", validItems.length);
  
      // Create items with proper IDs to ensure uniqueness
      const groceryItems: GroceryItem[] = validItems.map((item, index) => {
        const timestamp = Date.now();
        const uniqueId = `imported-${timestamp}-${index}-${Math.floor(Math.random() * 1000)}`;
        
        return {
          id: uniqueId,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          addedBy: currentUser,
          addedAt: new Date(),
        };
      });
  
      // Use a random color from a predefined list
      const colors = [
        "bg-gradient-to-br from-primary/20 to-secondary/10",
        "bg-gradient-to-br from-emerald-400/20 to-teal-400/10",
        "bg-gradient-to-br from-orange-400/20 to-red-400/10",
        "bg-gradient-to-br from-purple-400/20 to-pink-400/10",
        "bg-gradient-to-br from-blue-400/20 to-indigo-400/10"
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
      // Create a properly structured list object
      const newList: Omit<GroceryList, "id" | "createdAt"> = {
        name: listName.trim(),
        description: listDescription.trim() || `Imported from CSV with ${groceryItems.length} items`,
        items: groceryItems,
        createdBy: currentUser,
        sharedWith: selectedMembers,
        color: randomColor,
      }
  
      console.log("Creating new list from import:", newList);
      onImportList(newList)
  
      // Reset form
      setCsvContent("")
      setParsedItems([])
      setListName("")
      setListDescription("")
      setSelectedMembers([])
      setImportStatus("idle")
      setShowImportDialog(false)
  
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error importing list:", error);
      setErrorMessage("Error creating list. Please try again.")
      setImportStatus("error")
    }
  }

  const downloadTemplate = () => {
    const template =
      "name,category,quantity,unit,price\nMilk,Dairy,2,liters,3.99\nBread,Bakery,1,loaf,2.49\nApples,Produce,6,pieces,4.99\nChicken,Meat,1,kg,7.99"
    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "grocery-list-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const validItemsCount = parsedItems.filter((item) => item.isValid).length
  const invalidItemsCount = parsedItems.length - validItemsCount

  return (
    <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hover:bg-primary/10 transition-all duration-300 bg-transparent pointer-events-auto"
          onClick={() => setShowImportDialog(true)}
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Grocery List from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import grocery items. Download our template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Need a template?</p>
              <p className="text-sm text-muted-foreground">Download our CSV template to get started</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">Expected columns: name, category, quantity, unit, price</p>
          </div>

          {/* Manual CSV Input */}
          <div className="space-y-2">
            <Label htmlFor="csv-content">Or paste CSV content</Label>
            <Textarea
              id="csv-content"
              placeholder="name,category,quantity,unit,price&#10;Milk,Dairy,2,liters,3.99&#10;Bread,Bakery,1,loaf,2.49"
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value)
                if (e.target.value.trim()) {
                  parseCSV(e.target.value)
                } else {
                  setParsedItems([])
                  setImportStatus("idle")
                }
              }}
              rows={4}
            />
          </div>

          {/* Status Messages */}
          {importStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {importStatus === "success" && parsedItems.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Parsed {parsedItems.length} items ({validItemsCount} valid, {invalidItemsCount} invalid)
              </AlertDescription>
            </Alert>
          )}

          {/* Parsed Items Preview */}
          {parsedItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Preview Items</h4>
                <div className="flex gap-2">
                  <Badge variant="secondary">{validItemsCount} valid</Badge>
                  {invalidItemsCount > 0 && <Badge variant="destructive">{invalidItemsCount} invalid</Badge>}
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto border rounded-lg">
                <div className="grid grid-cols-6 gap-2 p-2 bg-muted/50 text-sm font-medium border-b">
                  <div>Name</div>
                  <div>Category</div>
                  <div>Quantity</div>
                  <div>Unit</div>
                  <div>Price</div>
                  <div>Status</div>
                </div>
                {parsedItems.slice(0, 10).map((item, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-6 gap-2 p-2 text-sm border-b ${!item.isValid ? "bg-destructive/10" : ""}`}
                  >
                    <div className="truncate">{item.name || "Missing"}</div>
                    <div className="truncate">{item.category}</div>
                    <div>{item.quantity}</div>
                    <div className="truncate">{item.unit}</div>
                    <div>${item.price.toFixed(2)}</div>
                    <div>
                      {item.isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
                {parsedItems.length > 10 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    ... and {parsedItems.length - 10} more items
                  </div>
                )}
              </div>
            </div>
          )}

          {/* List Configuration */}
          {validItemsCount > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">List Configuration</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="list-name">List Name *</Label>
                  <Input
                    id="list-name"
                    placeholder="Enter list name"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="created-by">Created By</Label>
                  <Select value={currentUser} onValueChange={setCurrentUser}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {familyMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="list-description">Description</Label>
                <Input
                  id="list-description"
                  placeholder="Optional description"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Share with Family Members</Label>
                <div className="flex flex-wrap gap-2">
                  {familyMembers
                    .filter((m) => m.id !== currentUser)
                    .map((member) => (
                      <Button
                        key={member.id}
                        variant={selectedMembers.includes(member.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedMembers((prev) =>
                            prev.includes(member.id) ? prev.filter((id) => id !== member.id) : [...prev, member.id],
                          )
                        }}
                      >
                        {member.avatar} {member.name}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleImport} disabled={validItemsCount === 0 || !listName.trim()} className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Import {validItemsCount} Items
            </Button>
            <Button variant="outline" onClick={() => setShowImportDialog(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
