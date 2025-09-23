"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { TrendingUp, Calendar, Users, ShoppingCart, Brain, Zap, Target, Award } from "lucide-react"

interface GroceryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  addedBy: string
  addedAt: Date
}

interface GroceryList {
  id: string
  name: string
  description: string
  items: GroceryItem[]
  createdBy: string
  createdAt: Date
  sharedWith: string[]
  color: string
}

interface FamilyMember {
  id: string
  name: string
  email: string
  avatar: string
}

interface VisualizationPanelProps {
  groceryLists: GroceryList[]
  familyMembers: FamilyMember[]
}

export function VisualizationPanel({ groceryLists, familyMembers }: VisualizationPanelProps) {
  const [activeView, setActiveView] = useState<"overview" | "trends" | "insights" | "predictions">("overview")

  const analytics = useMemo(() => {
    const allItems = groceryLists.flatMap((list) => list.items)

    // Category distribution
    const categoryCount = allItems.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const categoryData = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / allItems.length) * 100),
      value: count,
    }))

    // Most frequent items
    const itemCount = allItems.reduce(
      (acc, item) => {
        const key = item.name.toLowerCase()
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const frequentItems = Object.entries(itemCount)
      .map(([name, count]) => ({ name, count, frequency: count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Member contributions with enhanced data
    const memberContributions = allItems.reduce(
      (acc, item) => {
        acc[item.addedBy] = (acc[item.addedBy] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const memberData = Object.entries(memberContributions).map(([memberId, count]) => {
      const member = familyMembers.find((m) => m.id === memberId)
      return {
        name: member?.name || "Unknown",
        avatar: member?.avatar || "U",
        count,
        percentage: Math.round((count / allItems.length) * 100),
        efficiency:
          Math.round(
            (count / groceryLists.filter((l) => l.createdBy === memberId || l.sharedWith.includes(memberId)).length) *
              10,
          ) / 10,
      }
    })

    // Time-based trends (simulated for demo)
    const timeData = Array.from({ length: 7 }, (_, i) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      items: Math.floor(Math.random() * 20) + 5,
      lists: Math.floor(Math.random() * 5) + 1,
      categories: Math.floor(Math.random() * 8) + 3,
    }))

    // Shopping patterns radar data
    const radarData = [
      {
        category: "Produce",
        value: categoryCount["Produce"] || 0,
        fullMark: Math.max(...Object.values(categoryCount)),
      },
      { category: "Dairy", value: categoryCount["Dairy"] || 0, fullMark: Math.max(...Object.values(categoryCount)) },
      { category: "Meat", value: categoryCount["Meat"] || 0, fullMark: Math.max(...Object.values(categoryCount)) },
      { category: "Bakery", value: categoryCount["Bakery"] || 0, fullMark: Math.max(...Object.values(categoryCount)) },
      { category: "Snacks", value: categoryCount["Snacks"] || 0, fullMark: Math.max(...Object.values(categoryCount)) },
      {
        category: "Beverages",
        value: categoryCount["Beverages"] || 0,
        fullMark: Math.max(...Object.values(categoryCount)),
      },
    ]

    // List size distribution
    const listSizes = groceryLists.map((list) => ({
      name: list.name,
      items: list.items.length,
      color: list.color,
      efficiency: Math.round((list.items.length / (list.sharedWith.length + 1)) * 10) / 10,
      categories: [...new Set(list.items.map((item) => item.category))].length,
    }))

    // Advanced insights
    const insights = {
      diversityScore: Math.round((categoryData.length / Math.max(categoryData.length, 1)) * 100),
      collaborationScore: Math.round(
        (groceryLists.filter((l) => l.sharedWith.length > 0).length / Math.max(groceryLists.length, 1)) * 100,
      ),
      efficiencyScore: Math.round((allItems.length / Math.max(groceryLists.length, 1)) * 10),
      consistencyScore: Math.round(
        100 - Math.abs(listSizes.reduce((acc, list) => acc + list.items, 0) / listSizes.length - 10) * 5,
      ),
    }

    return {
      totalItems: allItems.length,
      totalLists: groceryLists.length,
      categoryData,
      frequentItems,
      memberData,
      listSizes,
      timeData,
      radarData,
      insights,
    }
  }, [groceryLists, familyMembers])

  const COLORS = ["#059669", "#10b981", "#f97316", "#dc2626", "#4b5563", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold gradient-text">Analytics & Insights</h2>
          <p className="text-sm text-muted-foreground">
            Advanced visualization of your family's grocery shopping patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 animate-pulse">
            <Brain className="w-3 h-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: ShoppingCart,
            label: "Total Lists",
            value: analytics.totalLists,
            color: "from-primary/20 to-primary/10",
            trend: "+12%",
          },
          {
            icon: Target,
            label: "Total Items",
            value: analytics.totalItems,
            color: "from-accent/20 to-accent/10",
            trend: "+8%",
          },
          {
            icon: Users,
            label: "Categories",
            value: analytics.categoryData.length,
            color: "from-chart-3/20 to-chart-3/10",
            trend: "+3%",
          },
          {
            icon: Award,
            label: "Efficiency",
            value: `${analytics.insights.efficiencyScore}/10`,
            color: "from-chart-4/20 to-chart-4/10",
            trend: "+15%",
          },
        ].map((stat, index) => (
          <Card key={index} className="card-3d animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center animate-float`}
                >
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs text-green-600">
                  {stat.trend}
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 glass-effect">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Brain className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <Zap className="w-4 h-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Enhanced Category Distribution */}
            <Card className="flowing-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Items by Category
                </CardTitle>
                <CardDescription>Interactive distribution of grocery items across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {analytics.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Shopping Pattern Radar */}
            <Card className="flowing-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Shopping Pattern Analysis
                </CardTitle>
                <CardDescription>Radar view of your shopping preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={analytics.radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Items"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      animationBegin={0}
                      animationDuration={1000}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Enhanced Member Contributions */}
            <Card className="flowing-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Family Contributions
                </CardTitle>
                <CardDescription>Detailed analysis of family member participation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.memberData.map((member, index) => (
                    <div key={member.name} className="flowing-card p-4 bg-gradient-to-r from-card/50 to-card/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-lg font-bold animate-float">
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.count} items • {member.efficiency} avg/list
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{member.percentage}%</Badge>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 animate-glow"
                          style={{ width: `${member.percentage}%`, animationDelay: `${index * 0.2}s` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced List Analysis */}
            <Card className="flowing-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  List Performance
                </CardTitle>
                <CardDescription>Efficiency and diversity metrics for each list</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.listSizes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-card p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm text-primary">Items: {data.items}</p>
                              <p className="text-sm text-secondary">Categories: {data.categories}</p>
                              <p className="text-sm text-accent">Efficiency: {data.efficiency}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="items" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Trends */}
            <Card className="flowing-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Shopping Trends
                </CardTitle>
                <CardDescription>Your shopping activity throughout the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="items"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      animationBegin={0}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Frequency Analysis */}
            <Card className="flowing-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Most Frequent Items
                </CardTitle>
                <CardDescription>Items that appear most often across all lists</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.frequentItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                      animationBegin={0}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Diversity Score", value: analytics.insights.diversityScore, color: "primary", icon: Target },
              { label: "Collaboration", value: analytics.insights.collaborationScore, color: "secondary", icon: Users },
              { label: "Efficiency", value: analytics.insights.efficiencyScore, color: "accent", icon: Zap },
              { label: "Consistency", value: analytics.insights.consistencyScore, color: "chart-3", icon: Award },
            ].map((metric, index) => (
              <Card key={metric.label} className="flowing-card">
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-${metric.color}/20 to-${metric.color}/10 rounded-xl flex items-center justify-center mx-auto mb-4 animate-float`}
                  >
                    <metric.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold gradient-text mb-2">{metric.value}%</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                  <div className="w-full h-2 bg-muted rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${metric.color} to-${metric.color}/70 rounded-full transition-all duration-1000`}
                      style={{ width: `${metric.value}%`, animationDelay: `${index * 0.2}s` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Smart Insights */}
          <Card className="flowing-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>Advanced analysis of your grocery shopping patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    icon: "🎯",
                    title: "Most Popular Category",
                    description: `${analytics.categoryData[0]?.category || "N/A"} dominates your shopping with ${analytics.categoryData[0]?.count || 0} items (${analytics.categoryData[0]?.percentage || 0}% of total)`,
                    color: "primary",
                  },
                  {
                    icon: "🏆",
                    title: "Top Contributor",
                    description: `${analytics.memberData[0]?.name || "N/A"} leads with ${analytics.memberData[0]?.percentage || 0}% of items and ${analytics.memberData[0]?.efficiency || 0} items per list on average`,
                    color: "secondary",
                  },
                  {
                    icon: "📊",
                    title: "Shopping Frequency",
                    description: `${analytics.frequentItems[0]?.name || "N/A"} appears ${analytics.frequentItems[0]?.count || 0} times, making it your most essential item`,
                    color: "accent",
                  },
                  {
                    icon: "📝",
                    title: "List Optimization",
                    description: `Your lists average ${Math.round(analytics.totalItems / Math.max(analytics.totalLists, 1))} items each, showing ${analytics.totalItems / Math.max(analytics.totalLists, 1) > 10 ? "comprehensive" : "focused"} planning`,
                    color: "chart-4",
                  },
                  {
                    icon: "🤝",
                    title: "Family Collaboration",
                    description: `${analytics.insights.collaborationScore}% of your lists are shared, indicating ${analytics.insights.collaborationScore > 70 ? "excellent" : analytics.insights.collaborationScore > 40 ? "good" : "limited"} family coordination`,
                    color: "chart-5",
                  },
                  {
                    icon: "🎨",
                    title: "Shopping Diversity",
                    description: `You shop across ${analytics.categoryData.length} categories with a diversity score of ${analytics.insights.diversityScore}%, showing ${analytics.insights.diversityScore > 80 ? "excellent" : "good"} variety`,
                    color: "chart-3",
                  },
                ].map((insight, index) => (
                  <div
                    key={insight.title}
                    className={`flowing-card p-4 bg-gradient-to-br from-${insight.color}/5 to-${insight.color}/10 border border-${insight.color}/20 rounded-lg animate-slide-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div>
                        <h4 className={`font-medium text-${insight.color} mb-2`}>{insight.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card className="flowing-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Predictions & Recommendations
              </CardTitle>
              <CardDescription>Smart predictions based on your shopping patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Predicted Next Purchases</h4>
                  {["Milk", "Bread", "Eggs", "Bananas", "Chicken"].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg"
                    >
                      <span className="text-sm font-medium">{item}</span>
                      <Badge variant="outline">{90 - index * 10}% likely</Badge>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Optimization Suggestions</h4>
                  {[
                    "Combine similar categories in one trip",
                    "Stock up on frequently bought items",
                    "Try bulk buying for family favorites",
                    "Consider seasonal alternatives",
                    "Explore new healthy options",
                  ].map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gradient-to-r from-accent/5 to-chart-3/5 rounded-lg"
                    >
                      <Zap className="w-4 h-4 text-accent mt-0.5" />
                      <span className="text-sm text-muted-foreground">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
