import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Eye, EyeOff, AlertCircle, TrendingDown, DollarSign, TrendingUp, Percent } from 'lucide-react'
import { SellerStats } from './SellerDashboard'

interface SellerStatsCardsProps {
  stats: SellerStats
}

export default function SellerStatsCards({ stats }: SellerStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
          <Package className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total_items}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.active_items} active, {stats.inactive_items} inactive
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Near Expiry</CardTitle>
          <AlertCircle className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.near_expiry}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.expired} expired
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Discount</CardTitle>
          <TrendingDown className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.avg_discount.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all items
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
          <Percent className="h-5 w-5 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.profit_margin.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Revenue: ${stats.total_revenue.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
