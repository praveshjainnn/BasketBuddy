import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { PerishableItem } from './AdminDashboard'
import ItemDialog from './ItemDialog'

const API_BASE_URL = 'http://localhost:5000/api'

interface ItemsTableProps {
  items: PerishableItem[]
  loading: boolean
  onRefresh: () => void
}

export default function ItemsTable({ items, loading, onRefresh }: ItemsTableProps) {
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PerishableItem | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/perishables/${id}`, { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        toast({ title: "Success", description: "Item deleted successfully" })
        onRefresh()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" })
    }
  }

  const openEditDialog = (item: PerishableItem) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (item: PerishableItem) => {
    if (item.is_expired) {
      return <Badge variant="destructive">Expired</Badge>
    } else if (item.is_near_expiry) {
      return <Badge variant="destructive" className="bg-orange-500">Near Expiry</Badge>
    } else if (item.days_to_expiry === 3) {
      return <Badge variant="secondary" className="bg-yellow-500">Moderate</Badge>
    } else {
      return <Badge variant="default" className="bg-green-500">Fresh</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>
  }

  if (items.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No items found. Add your first item!</div>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Discounted Price</TableHead>
              <TableHead>Discount %</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.item_name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Badge variant={item.seller_name === 'Admin' ? 'default' : 'secondary'} className={item.seller_name === 'Admin' ? 'bg-blue-500' : 'bg-green-500'}>
                    {item.seller_name || 'Admin'}
                  </Badge>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>₹{item.base_price.toFixed(2)}</TableCell>
                <TableCell className="text-green-600 font-semibold">₹{item.discounted_price.toFixed(2)}</TableCell>
                <TableCell className="text-orange-600 font-semibold">{item.discount_percentage.toFixed(1)}%</TableCell>
                <TableCell>{item.expiry_date}</TableCell>
                <TableCell>{item.days_to_expiry} days</TableCell>
                <TableCell>{getStatusBadge(item)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingItem && (
        <ItemDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          onSuccess={onRefresh}
          editItem={editingItem}
        />
      )}
    </>
  )
}
