import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { SellerPerishableItem } from './SellerDashboard'

const API_BASE_URL = 'http://localhost:5000/api/seller'
const CATEGORIES = ['Dairy', 'Fruit', 'Vegetable', 'Meat', 'Bakery', 'Seafood', 'Beverage', 'Other']

interface SellerItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: SellerPerishableItem | null
  sellerName: string
}

export default function SellerItemDialog({ open, onOpenChange, onSuccess, editItem, sellerName }: SellerItemDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: '',
    base_price: '',
    cost_price: '',
    shelf_life: ''
  })

  useEffect(() => {
    if (editItem) {
      setFormData({
        item_name: editItem.item_name,
        category: editItem.category,
        quantity: editItem.quantity.toString(),
        base_price: editItem.base_price.toString(),
        cost_price: editItem.cost_price.toString(),
        shelf_life: editItem.shelf_life.toString()
      })
    } else {
      resetForm()
    }
  }, [editItem, open])

  const resetForm = () => {
    setFormData({
      item_name: '',
      category: '',
      quantity: '',
      base_price: '',
      cost_price: '',
      shelf_life: ''
    })
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.item_name || !formData.category || !formData.quantity || 
        !formData.base_price || !formData.cost_price || !formData.shelf_life) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Validate numeric fields
    if (isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be a positive number",
        variant: "destructive"
      })
      return
    }

    if (isNaN(parseFloat(formData.base_price)) || parseFloat(formData.base_price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Selling price must be a positive number",
        variant: "destructive"
      })
      return
    }

    if (isNaN(parseFloat(formData.cost_price)) || parseFloat(formData.cost_price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Cost price must be a positive number",
        variant: "destructive"
      })
      return
    }

    if (isNaN(parseInt(formData.shelf_life)) || parseInt(formData.shelf_life) <= 0) {
      toast({
        title: "Validation Error",
        description: "Shelf life must be a positive number",
        variant: "destructive"
      })
      return
    }

    const url = editItem 
      ? `${API_BASE_URL}/items/${editItem.id}` 
      : `${API_BASE_URL}/items`
    const method = editItem ? 'PUT' : 'POST'

    console.log('Submitting to:', url)
    console.log('Method:', method)
    console.log('Data:', {
      ...formData,
      quantity: parseInt(formData.quantity),
      base_price: parseFloat(formData.base_price),
      cost_price: parseFloat(formData.cost_price),
      shelf_life: parseInt(formData.shelf_life),
      seller_name: sellerName
    })

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          base_price: parseFloat(formData.base_price),
          cost_price: parseFloat(formData.cost_price),
          shelf_life: parseInt(formData.shelf_life),
          seller_name: sellerName
        })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        toast({
          title: "Success",
          description: editItem ? "Item updated successfully" : "Item created successfully"
        })
        onOpenChange(false)
        resetForm()
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save item",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: "Error",
        description: `Failed to ${editItem ? 'update' : 'create'} item. Check console for details.`,
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {editItem ? 'Update the details of your item' : 'Add a new perishable item to your inventory'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="item_name">Item Name</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="e.g., Fresh Milk"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                console.log('Category selected:', value)
                setFormData({ ...formData, category: value })
              }}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shelf_life">Shelf Life (days)</Label>
              <Input
                id="shelf_life"
                type="number"
                value={formData.shelf_life}
                onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })}
                placeholder="7"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cost_price">Cost Price ($)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                placeholder="4.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="base_price">Selling Price ($)</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                placeholder="5.99"
              />
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
            <p className="text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Expiry date will be auto-calculated from shelf life. 
              Discounts will automatically adjust as the item approaches expiry.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => {
              console.log('Button clicked!')
              console.log('Form data:', formData)
              handleSubmit()
            }}
            type="button"
          >
            {editItem ? 'Update Item' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
