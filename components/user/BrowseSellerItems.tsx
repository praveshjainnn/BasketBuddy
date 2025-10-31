"use client"

/**
 * Browse Seller Items Component
 * Allows users to view and add seller items to their grocery lists
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShoppingCart, Filter, TrendingDown, Package } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const API_BASE_URL = 'http://localhost:5000/api/perishables'

interface PublicItem {
  id: number
  item_name: string
  category: string
  quantity: number
  base_price: number
  discounted_price: number
  discount_percentage: number
  seller_name: string
  days_to_expiry: number
  expiry_date: string
  status_color: string
}

interface BrowseSellerItemsProps {
  onAddToList?: (item: PublicItem) => void
}

export default function BrowseSellerItems({ onAddToList }: BrowseSellerItemsProps) {
  const { toast } = useToast()
  const [items, setItems] = useState<PublicItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PublicItem[]>([])
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sellerFilter, setSellerFilter] = useState<string>('all')
  const [minDiscount, setMinDiscount] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const [sellers, setSellers] = useState<string[]>([])

  useEffect(() => {
    fetchPublicItems()
    fetchCategories()
    fetchSellers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [items, categoryFilter, sellerFilter, minDiscount])

  const fetchPublicItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/public`)
      const data = await response.json()
      if (data.success) {
        setItems(data.data)
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch items", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/categories`)
      const data = await response.json()
      if (data.success) {
        setCategories(data.data.map((c: any) => c.category))
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/sellers`)
      const data = await response.json()
      if (data.success) {
        setSellers(data.data.map((s: any) => s.seller_name))
      }
    } catch (error) {
      console.error("Failed to fetch sellers:", error)
    }
  }

  const applyFilters = () => {
    let filtered = [...items]

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    if (sellerFilter !== 'all') {
      filtered = filtered.filter(item => item.seller_name === sellerFilter)
    }

    if (minDiscount) {
      const minDiscountValue = parseFloat(minDiscount)
      filtered = filtered.filter(item => item.discount_percentage >= minDiscountValue)
    }

    setFilteredItems(filtered)
  }

  const handleAddToList = (item: PublicItem) => {
    if (onAddToList) {
      onAddToList(item)
      toast({ title: "Success", description: `${item.item_name} added to your list` })
    } else {
      toast({ title: "Info", description: "Add to list functionality not configured" })
    }
  }

  const getDiscountBadge = (discount: number) => {
    if (discount >= 50) {
      return <Badge className="bg-red-500">-{discount.toFixed(0)}% OFF</Badge>
    } else if (discount >= 25) {
      return <Badge className="bg-orange-500">-{discount.toFixed(0)}% OFF</Badge>
    } else if (discount > 0) {
      return <Badge className="bg-yellow-500">-{discount.toFixed(0)}% OFF</Badge>
    }
    return null
  }

  if (loading) {
    return <div className="text-center py-8">Loading seller items...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Browse Seller Items</h2>
        <p className="text-muted-foreground">Discover discounted perishable items from local sellers</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Seller</label>
              <Select value={sellerFilter} onValueChange={setSellerFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sellers</SelectItem>
                  {sellers.map(seller => (
                    <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Min Discount (%)</label>
              <Input
                type="number"
                placeholder="0"
                value={minDiscount}
                onChange={(e) => setMinDiscount(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setCategoryFilter('all')
                setSellerFilter('all')
                setMinDiscount('')
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No items found matching your filters
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.item_name}</CardTitle>
                    <CardDescription>{item.category}</CardDescription>
                  </div>
                  {getDiscountBadge(item.discount_percentage)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Seller:</span>
                  <span className="font-medium">{item.seller_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Original Price:</span>
                  <span className="line-through text-muted-foreground">${item.base_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Discounted Price:</span>
                  <span className="text-2xl font-bold text-green-600">${item.discounted_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available:</span>
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {item.quantity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expires in:</span>
                  <span className={`font-medium ${item.days_to_expiry <= 2 ? 'text-red-500' : item.days_to_expiry === 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {item.days_to_expiry} days
                  </span>
                </div>
                <Button className="w-full" onClick={() => handleAddToList(item)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to My List
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Showing {filteredItems.length} of {items.length} items</span>
            <span className="text-sm text-muted-foreground">
              Average Discount: {filteredItems.length > 0 
                ? (filteredItems.reduce((sum, item) => sum + item.discount_percentage, 0) / filteredItems.length).toFixed(1)
                : 0}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
