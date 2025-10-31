import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { PerishableItem } from './AdminDashboard'

const API_BASE_URL = 'http://localhost:5000/api'
const CATEGORIES = ['Dairy', 'Fruit', 'Vegetable', 'Meat', 'Bakery', 'Seafood', 'Beverage', 'Other']

interface ItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: PerishableItem | null
}

export default function ItemDialog({ open, onOpenChange, onSuccess, editItem }: ItemDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: '',
    base_price: '',
    expiry_date: ''
  })

  useEffect(() => {
    if (editItem) {
      setFormData({
        item_name: editItem.item_name,
        category: editItem.category,
        quantity: editItem.quantity.toString(),
        base_price: editItem.base_price.toString(),
        expiry_date: editItem.expiry_date
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
      expiry_date: ''
    })
  }

  const handleSubmit = async () => {
    const url = editItem 
      ? `${API_BASE_URL}/perishables/${editItem.id}` 
      : `${API_BASE_URL}/perishables`
    const method = editItem ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          base_price: parseFloat(formData.base_price)
        })
      })
      const data = await response.json()
      
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
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: editItem ? "Failed to update item" : "Failed to create item",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {editItem ? 'Update the details of the perishable item' : 'Enter the details of the perishable item'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="item_name">Item Name</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="base_price">Base Price ($)</Label>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>
            {editItem ? 'Update Item' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
