"use client"

/**
 * Seller Dashboard Component for Basket Buddy 2.0
 * Allows sellers to manage their perishable inventory
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, RefreshCw, Upload, Download, Package, AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import SellerItemsTable from './SellerItemsTable'
import SellerItemDialog from './SellerItemDialog'
import SellerStatsCards from './SellerStatsCards'

const API_BASE_URL = 'http://localhost:5000/api/seller'

export interface SellerPerishableItem {
  id: number
  item_name: string
  category: string
  quantity: number
  base_price: number
  cost_price: number
  shelf_life: number
  expiry_date: string
  discounted_price: number
  discount_percentage: number
  seller_name: string
  is_active: boolean
  days_to_expiry: number
  status_color: string
  is_expired: boolean
  is_near_expiry: boolean
}

export interface SellerStats {
  total_items: number
  active_items: number
  inactive_items: number
  near_expiry: number
  expired: number
  avg_discount: number
  total_revenue: number
  total_cost: number
  profit_margin: number
}

export default function SellerDashboard() {
  const { toast } = useToast()
  const [items, setItems] = useState<SellerPerishableItem[]>([])
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sellerName, setSellerName] = useState('DefaultSeller')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/items?seller_name=${sellerName}`)
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

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats?seller_name=${sellerName}`)
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  useEffect(() => {
    if (sellerName) {
      fetchItems()
      fetchStats()
    }
  }, [sellerName])

  const handleRefresh = () => {
    fetchItems()
    fetchStats()
  }

  return (
    <div className="w-full space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Manage your perishable inventory</p>
          </div>
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Seller Name"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleRefresh} disabled={loading} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && <SellerStatsCards stats={stats} />}
        
        {/* Empty State Message */}
        {stats && stats.total_items === 0 && (
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <Package className="h-16 w-16 mx-auto text-blue-500 opacity-50" />
                <div>
                  <h3 className="text-xl font-bold">No Items Yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Click "Add Item" below to create your first perishable item.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once you add items, your financial summary will update automatically!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Inventory</CardTitle>
                <CardDescription>Manage your perishable items with dynamic pricing</CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SellerItemsTable 
              items={items} 
              loading={loading} 
              onRefresh={handleRefresh}
              sellerName={sellerName}
            />
          </CardContent>
        </Card>

        {/* Add Item Dialog */}
        <SellerItemDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
          onSuccess={handleRefresh}
          sellerName={sellerName}
        />

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-blue-500">📦 Shelf Life</p>
                <p className="text-sm text-muted-foreground">Enter the number of days the item stays fresh. Expiry date is auto-calculated from today.</p>
              </div>
              <div>
                <p className="font-semibold text-green-500">💰 Dynamic Pricing</p>
                <p className="text-sm text-muted-foreground">Discounts automatically increase as items approach expiry. Formula: ((4 - days_left) / 4) × 100%</p>
              </div>
              <div>
                <p className="font-semibold text-purple-500">👁️ Active Status</p>
                <p className="text-sm text-muted-foreground">Toggle visibility to users. Inactive items won't appear in public listings or deals tab.</p>
              </div>
              <div>
                <p className="font-semibold text-orange-500">📊 Cost Tracking</p>
                <p className="text-sm text-muted-foreground">Track your costs and profit margins automatically. Profit = (Selling Price - Cost Price) / Selling Price × 100%</p>
              </div>
            </CardContent>
          </Card>

          {/* Profit Details */}
          {stats && (
            <Card className="bg-gradient-to-br from-green-500/5 to-blue-500/5 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <DollarSign className="h-6 w-6 text-green-500" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-base text-muted-foreground">Total Revenue (Potential)</span>
                    <span className="text-2xl font-bold text-green-600">${stats.total_revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-base text-muted-foreground">Total Cost</span>
                    <span className="text-2xl font-bold text-red-600">${stats.total_cost.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border my-2"></div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-lg font-semibold">Potential Profit</span>
                    <span className="text-2xl font-bold text-blue-600">${(stats.total_revenue - stats.total_cost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-lg font-semibold">Profit Margin</span>
                    <span className="text-2xl font-bold text-purple-600">{stats.profit_margin.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                      <strong>Note:</strong> These are potential earnings based on current inventory. 
                      Actual profit depends on sales volume and discount rates at time of purchase.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Discount Tiers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Discount Tiers
            </CardTitle>
            <CardDescription>Automatic discount calculation based on days to expiry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-500">
                <div className="text-2xl font-bold text-green-600">0%</div>
                <p className="text-sm font-medium mt-1">4+ Days</p>
                <p className="text-xs text-muted-foreground mt-1">Fresh & Full Price</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-2 border-yellow-500">
                <div className="text-2xl font-bold text-yellow-600">25%</div>
                <p className="text-sm font-medium mt-1">3 Days</p>
                <p className="text-xs text-muted-foreground mt-1">Good Deal</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-500">
                <div className="text-2xl font-bold text-orange-600">50%</div>
                <p className="text-sm font-medium mt-1">2 Days</p>
                <p className="text-xs text-muted-foreground mt-1">Great Deal</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 border-red-500">
                <div className="text-2xl font-bold text-red-600">75%</div>
                <p className="text-sm font-medium mt-1">1 Day</p>
                <p className="text-xs text-muted-foreground mt-1">Urgent Sale</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border-2 border-gray-500">
                <div className="text-2xl font-bold text-gray-600">100%</div>
                <p className="text-sm font-medium mt-1">0 Days</p>
                <p className="text-xs text-muted-foreground mt-1">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Quick Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-semibold text-green-600">✅ Best Practices</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Update inventory daily for accurate stock levels</li>
                  <li>Set realistic shelf life to avoid early expiry</li>
                  <li>Keep cost prices updated for accurate profit tracking</li>
                  <li>Monitor near-expiry items and promote them</li>
                  <li>Use active/inactive toggle to manage visibility</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-orange-600">⚠️ Common Mistakes</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Setting shelf life too long (items expire early)</li>
                  <li>Forgetting to deactivate sold-out items</li>
                  <li>Not updating quantities after sales</li>
                  <li>Ignoring near-expiry alerts</li>
                  <li>Setting selling price below cost price</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
