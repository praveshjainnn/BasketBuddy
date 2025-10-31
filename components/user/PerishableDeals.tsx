"use client"

/**
 * Perishable Deals Component - User Side
 * Displays discounted perishable items added by admin
 * Shows daily updated discounts based on expiry dates
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  TrendingDown, 
  Calendar, 
  Package, 
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PerishableItem {
  id: number
  item_name: string
  category: string
  quantity: number
  base_price: number
  discounted_price: number
  discount_percentage: number
  expiry_date: string
  days_to_expiry: number
  is_expired: boolean
}

interface PerishableDealsProps {
  onAddToCart?: (item: PerishableItem) => void
}

export default function PerishableDeals({ onAddToCart }: PerishableDealsProps) {
  const { toast } = useToast()
  const [items, setItems] = useState<PerishableItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PerishableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('discount')
  const [categories, setCategories] = useState<string[]>([])

  // Fetch items from backend
  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/perishables')
      const data = await response.json()
      
      if (data.success) {
        // Filter out expired items
        const activeItems = data.data.filter((item: PerishableItem) => !item.is_expired)
        setItems(activeItems)
        setFilteredItems(activeItems)
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(activeItems.map((item: PerishableItem) => item.category)))
        setCategories(uniqueCategories as string[])
        
        toast({
          title: "Items Loaded",
          description: `Found ${activeItems.length} fresh deals!`
        })
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      toast({
        title: "Error",
        description: "Failed to load items. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchItems, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Filter and sort items
  useEffect(() => {
    let filtered = items

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          return b.discount_percentage - a.discount_percentage
        case 'price':
          return a.discounted_price - b.discounted_price
        case 'expiry':
          return a.days_to_expiry - b.days_to_expiry
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }, [items, searchQuery, selectedCategory, sortBy])

  const getDiscountColor = (discount: number) => {
    if (discount >= 75) return 'bg-red-500'
    if (discount >= 50) return 'bg-orange-500'
    if (discount >= 25) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getDaysColor = (days: number) => {
    if (days <= 1) return 'text-red-500'
    if (days <= 2) return 'text-orange-500'
    if (days <= 3) return 'text-yellow-500'
    return 'text-green-500'
  }

  const handleAddToCart = (item: PerishableItem) => {
    // Call parent callback if provided
    if (onAddToCart) {
      onAddToCart(item)
    }
    // Also emit a global event so the page can capture it as a fallback
    try {
      const detail = {
        id: item.id,
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        discounted_price: item.discounted_price,
      }
      window.dispatchEvent(new CustomEvent('bb:addDealItem', { detail }))
    } catch (e) {}
    toast({
      title: "Added to Cart",
      description: `${item.item_name} added successfully!`
    })
  }

  const stats = {
    total: filteredItems.length,
    highDiscount: filteredItems.filter(item => item.discount_percentage >= 50).length,
    expiringSoon: filteredItems.filter(item => item.days_to_expiry <= 2).length,
    totalSavings: filteredItems.reduce((sum, item) => sum + (item.base_price - item.discounted_price), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading fresh deals...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 pointer-events-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            🛒 Perishable Deals
          </h2>
          <p className="text-muted-foreground mt-1">
            Fresh items with daily updated discounts
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            console.log('[Deals] Refresh clicked')
            fetchItems()
          }}
          variant="outline"
          size="sm"
          className="pointer-events-auto relative z-10"
          aria-label="Refresh deals"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Deals
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Discounts</p>
                <p className="text-2xl font-bold text-orange-500">{stats.highDiscount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-red-500">{stats.expiringSoon}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold text-green-500">₹{stats.totalSavings.toFixed(2)}</p>
              </div>
              <Sparkles className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 pointer-events-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pointer-events-auto">
            <div className="relative">
              <label className="text-xs text-muted-foreground block mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 rounded-md border bg-background px-3 text-sm pointer-events-auto relative z-10"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 rounded-md border bg-background px-3 text-sm pointer-events-auto relative z-10"
              >
                <option value="discount">Highest Discount</option>
                <option value="price">Lowest Price</option>
                <option value="expiry">Expiring Soon</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full pointer-events-auto relative z-10"
                onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSortBy('discount')
                  console.log('[Deals] Clear Filters clicked')
                }}
                aria-label="Clear filters"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No items found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or check back later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.item_name}</CardTitle>
                    <CardDescription>{item.category}</CardDescription>
                  </div>
                  <Badge className={getDiscountColor(item.discount_percentage)}>
                    {item.discount_percentage.toFixed(0)}% OFF
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-600">
                      ₹{item.discounted_price.toFixed(2)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{item.base_price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    Save ₹{(item.base_price - item.discounted_price).toFixed(2)}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">{item.quantity} units</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expires in:</span>
                    <span className={`font-medium ${getDaysColor(item.days_to_expiry)}`}>
                      {item.days_to_expiry} {item.days_to_expiry === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span className="font-medium">{new Date(item.expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  type="button"
                  className="w-full pointer-events-auto relative z-10"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('[Deals] Add to Cart clicked for', item.item_name)
                    handleAddToCart(item)
                  }}
                  disabled={item.quantity === 0}
                  aria-label={`Add ${item.item_name} to cart`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {item.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>

                {/* Urgency Indicator */}
                {item.days_to_expiry <= 2 && (
                  <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950 p-2 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span>Hurry! Expires very soon</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
