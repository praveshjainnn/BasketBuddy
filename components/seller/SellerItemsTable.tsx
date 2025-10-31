import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { SellerPerishableItem } from './SellerDashboard'
import SellerItemDialog from './SellerItemDialog'

const API_BASE_URL = 'http://localhost:5000/api/seller'

interface SellerItemsTableProps {
  items: SellerPerishableItem[]
  loading: boolean
  onRefresh: () => void
  sellerName: string
}

export default function SellerItemsTable({ items, loading, onRefresh, sellerName }: SellerItemsTableProps) {
  const { toast } = useToast()
  const [editItem, setEditItem] = useState<SellerPerishableItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const openEditDialog = (item: SellerPerishableItem) => {
    setEditItem(item)
    setIsEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setEditItem(null)
    setIsEditDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE'
      })
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

  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}/toggle-active`, {
        method: 'PATCH'
      })
      const data = await response.json()
      
      if (data.success) {
        toast({ title: "Success", description: data.message })
        onRefresh()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to toggle status", variant: "destructive" })
    }
  }

  const getStatusBadge = (item: SellerPerishableItem) => {
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
              <TableHead>Qty</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Discounted</TableHead>
              <TableHead>Discount %</TableHead>
              <TableHead>Shelf Life</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.item_name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.cost_price.toFixed(2)}</TableCell>
                <TableCell>${item.base_price.toFixed(2)}</TableCell>
                <TableCell className="text-green-600 font-semibold">${item.discounted_price.toFixed(2)}</TableCell>
                <TableCell className="text-orange-600 font-semibold">{item.discount_percentage.toFixed(1)}%</TableCell>
                <TableCell>{item.shelf_life} days</TableCell>
                <TableCell>{item.days_to_expiry} days</TableCell>
                <TableCell>{getStatusBadge(item)}</TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleToggleActive(item.id)}
                  >
                    {item.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </TableCell>
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

      {/* Edit Dialog */}
      <SellerItemDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) closeEditDialog()
        }}
        onSuccess={() => {
          closeEditDialog()
          onRefresh()
        }}
        editItem={editItem}
        sellerName={sellerName}
      />
    </>
  )
}
