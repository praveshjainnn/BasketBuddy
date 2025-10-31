"use client"

/**
 * Admin Dashboard Component for Basket Buddy 2.0
 * Perishable Item Management with Data Visualization
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw, Upload, Download, Package, AlertCircle, Calendar, TrendingDown, TrendingUp } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import ItemsTable from './ItemsTable'
import ItemDialog from './ItemDialog'
import ChartsSection from './ChartsSection'
import StatsCards from './StatsCards'

const API_BASE_URL = 'http://localhost:5000/api'

export interface PerishableItem {
  id: number
  item_name: string
  category: string
  quantity: number
  base_price: number
  expiry_date: string
  discounted_price: number
  discount_percentage: number
  days_to_expiry: number
  status_color: string
  is_expired: boolean
  is_near_expiry: boolean
  seller_name?: string
}

export interface CategoryStat {
  category: string
  item_count: number
  total_quantity: number
  avg_price: number
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [items, setItems] = useState<PerishableItem[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/perishables`)
      const data = await response.json()
      if (data.success) {
        setItems(data.data)
      } else {
        toast({ title: "Error", description: data.error || "Failed to fetch items", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/categories`)
      const data = await response.json()
      if (data.success) setCategoryStats(data.data)
    } catch (error) {
      console.error('Failed to fetch category stats:', error)
    }
  }

  const handleUpdateDiscounts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/perishables/update_discounts`, { method: 'PATCH' })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: data.message })
        fetchItems()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update discounts", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch(`${API_BASE_URL}/import/csv`, { method: 'POST', body: formData })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: `Imported ${data.inserted_count} items` })
        fetchItems()
        fetchCategoryStats()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to import CSV", variant: "destructive" })
    }
  }

  const handleCSVExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/export/csv`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'perishable_items.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({ title: "Success", description: "CSV exported successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to export CSV", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchItems()
    fetchCategoryStats()
  }, [])

  return (
    <div className="w-full space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Basket Buddy 2.0
            </h1>
            <p className="text-muted-foreground mt-2">Admin Dashboard - Perishable Item Management</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleUpdateDiscounts} disabled={loading} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Discounts
            </Button>
            <Button variant="outline" asChild>
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </label>
            </Button>
            <input id="csv-upload" type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
            <Button onClick={handleCSVExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatsCards items={items} />

        {/* Financial Board */}
        <Card className="bg-gradient-to-br from-green-500/5 to-blue-500/5 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="h-6 w-6 text-green-500" />
              Financial Overview
            </CardTitle>
            <CardDescription>Complete financial summary of inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">Revenue Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Inventory Value</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{items.reduce((sum, item) => sum + (item.base_price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Discounted Value</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{items.reduce((sum, item) => sum + (item.discounted_price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Discount Given</span>
                    <span className="text-2xl font-bold text-red-600">
                      ₹{items.reduce((sum, item) => sum + ((item.base_price - item.discounted_price) * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold">Average Discount Rate</span>
                    <span className="text-xl font-bold text-purple-600">
                      {items.length > 0 ? (items.reduce((sum, item) => sum + item.discount_percentage, 0) / items.length).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Inventory Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">Inventory Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Units</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Categories</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {categoryStats.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold">Avg Price per Item</span>
                    <span className="text-xl font-bold text-purple-600">
                      ₹{items.length > 0 ? (items.reduce((sum, item) => sum + item.base_price, 0) / items.length).toFixed(2) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Fresh Items (4+ days)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {items.filter(item => item.days_to_expiry >= 4).length}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Moderate (3 days)</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {items.filter(item => item.days_to_expiry === 3).length}
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Near Expiry (≤2 days)</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {items.filter(item => item.is_near_expiry && !item.is_expired).length}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-red-600">
                    {items.filter(item => item.is_expired).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>
                  <strong>Note:</strong> All prices are in Indian Rupees (₹). Financial metrics update automatically as items are added, edited, or discounts change.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <ChartsSection items={items} categoryStats={categoryStats} />

        {/* Items Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Perishable Items</CardTitle>
                <CardDescription>Manage your inventory with dynamic discounting</CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ItemsTable items={items} loading={loading} onRefresh={() => { fetchItems(); fetchCategoryStats(); }} />
          </CardContent>
        </Card>

        {/* Add Item Dialog */}
        <ItemDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={() => { fetchItems(); fetchCategoryStats(); }} />

        {/* Mathematical Foundation */}
        <Card>
          <CardHeader>
            <CardTitle>Mathematical Foundation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong className="text-blue-500">Discount Function:</strong> f(x) = ((4 - x) / 4) × 100, where x = days_to_expiry</p>
            <p><strong className="text-blue-500">Domain:</strong> x ∈ [0, 4] days</p>
            <p><strong className="text-blue-500">Range:</strong> f(x) ∈ [0, 100]%</p>
            <p><strong className="text-blue-500">Set Theory:</strong> Items form set S = {'{'}i₁, i₂, ..., iₙ{'}'} for future set operations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
