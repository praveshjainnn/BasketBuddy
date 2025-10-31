import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PerishableItem, CategoryStat } from './AdminDashboard'

interface ChartsSectionProps {
  items: PerishableItem[]
  categoryStats: CategoryStat[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D']

export default function ChartsSection({ items, categoryStats }: ChartsSectionProps) {
  const expiryChartData = items.reduce((acc: any[], item) => {
    const existing = acc.find(d => d.days === item.days_to_expiry)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ days: item.days_to_expiry, count: 1 })
    }
    return acc
  }, []).sort((a, b) => a.days - b.days)

  const categoryChartData = categoryStats.map(stat => ({
    name: stat.category,
    value: stat.item_count
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Items by Days to Expiry</CardTitle>
          <CardDescription>Distribution of items based on expiration timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expiryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="days" label={{ value: 'Days to Expiry', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>Perishable items by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
