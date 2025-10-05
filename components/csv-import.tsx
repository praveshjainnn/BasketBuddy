"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useAuth } from "./firebase-auth";

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  addedBy: string;
  addedAt: Date;
}

interface GroceryList {
  id: string;
  name: string;
  description: string;
  items: GroceryItem[];
  createdBy: string;
  createdAt: Date;
  sharedWith: string[];
  color: string;
}

interface CSVImportProps {
  onImportList: (list: Omit<GroceryList, "id" | "createdAt">) => void;
}

export function CSVImport({ onImportList }: CSVImportProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      parseCSV(e.target.files[0]);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n");
      const headers = rows[0].split(",");
      
      const parsedData = rows.slice(1).map(row => {
        const values = row.split(",");
        const obj: Record<string, string> = {};
        headers.forEach((header, i) => {
          obj[header.trim()] = values[i]?.trim() || "";
        });
        return obj;
      }).filter(row => Object.values(row).some(val => val));
      
      setData(parsedData);
    };
    reader.readAsText(file);
  };

  // Import CSV as grocery list
  const handleImport = () => {
    if (!user) {
      alert("Please sign in to import lists");
      return;
    }
    
    if (!listName.trim()) {
      alert("Please enter a list name");
      return;
    }
    
    if (data.length === 0) {
      alert("No data to import");
      return;
    }
    
    setLoading(true);
    try {
      // Convert CSV data to grocery items with all required fields
      const items: GroceryItem[] = data.map((row, index) => ({
        id: `${Date.now()}-${index}`,
        name: row.name || row.NAME || row.item || row.ITEM || `Item ${index + 1}`,
        category: row.category || row.CATEGORY || "Uncategorized",
        quantity: parseFloat(row.quantity || row.QUANTITY || "1"),
        unit: row.unit || row.UNIT || "piece",
        price: parseFloat(row.price || row.PRICE || "0"),
        addedBy: user.uid,
        addedAt: new Date(),
      })).filter(item => item.name.trim() !== "");
      
      // Create the grocery list
      const newList: Omit<GroceryList, "id" | "createdAt"> = {
        name: listName,
        description: listDescription || `Imported from ${file?.name}`,
        items: items,
        createdBy: user.uid,
        sharedWith: [],
        color: "bg-purple-100",
      };
      
      onImportList(newList);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        setFile(null);
        setData([]);
        setListName("");
        setListDescription("");
      }, 2000);
    } catch (error) {
      console.error("Error importing CSV:", error);
      alert("Import failed. Please check your CSV format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Grocery List from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: name, category, quantity, unit, price
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Select CSV File</Label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground mt-2
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90 cursor-pointer"
            />
          </div>
          
          {data.length > 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="list-name">List Name *</Label>
                <Input
                  id="list-name"
                  placeholder="e.g., Weekly Groceries"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="list-description">Description (Optional)</Label>
                <Input
                  id="list-description"
                  placeholder="e.g., Shopping list for this week"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                />
              </div>
              
              <div className="border rounded-lg p-3 bg-muted/50">
                <p className="text-sm font-medium mb-2">Preview: {data.length} items found</p>
                <div className="overflow-auto max-h-48 border rounded bg-card">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        {Object.keys(data[0]).map((header) => (
                          <th key={header} className="px-3 py-2 text-left text-xs font-medium uppercase">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.slice(0, 10).map((row, i) => (
                        <tr key={i} className="hover:bg-muted/50">
                          {Object.values(row).map((value, j) => (
                            <td key={j} className="px-3 py-2 whitespace-nowrap">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Showing first 10 of {data.length} items
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={loading || !listName.trim()}
                  className="flex-1"
                >
                  {loading ? "Importing..." : "Import List"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setData([]);
                    setListName("");
                    setListDescription("");
                  }}
                >
                  Clear
                </Button>
              </div>
              
              {success && (
                <p className="text-green-600 dark:text-green-400 text-sm text-center font-medium">
                  ✓ List imported successfully!
                </p>
              )}
            </>
          )}
          
          {file && data.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Processing CSV file...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
