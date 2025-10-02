"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface OperationBarGraphProps {
  sets: {
    id: string
    name: string
    items: any[]
  }[]
  operationResults: {
    union: any[]
    intersection: any[]
    difference: any[]
    symmetric: any[]
    complement?: any[]
    cartesian?: any[]
  }
}

export function OperationBarGraph({ sets, operationResults }: OperationBarGraphProps) {
  const chartData = useMemo(() => {
    if (!sets.length || !operationResults) return []

    const data = [
      {
        name: 'Union',
        count: operationResults.union?.length || 0,
        fill: '#4f46e5'
      },
      {
        name: 'Intersection',
        count: operationResults.intersection?.length || 0,
        fill: '#10b981'
      },
      {
        name: 'Difference',
        count: operationResults.difference?.length || 0,
        fill: '#ef4444'
      },
      {
        name: 'Symmetric',
        count: operationResults.symmetric?.length || 0,
        fill: '#f59e0b'
      }
    ]

    if (operationResults.complement) {
      data.push({
        name: 'Complement',
        count: operationResults.complement.length,
        fill: '#8b5cf6'
      })
    }

    if (operationResults.cartesian) {
      data.push({
        name: 'Cartesian',
        count: operationResults.cartesian.length,
        fill: '#ec4899'
      })
    }

    return data
  }, [sets, operationResults])

  if (!sets.length || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Operation Results Comparison</CardTitle>
          <CardDescription>Select sets to compare operation results</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] bg-muted/20">
          <p className="text-muted-foreground">No data available for visualization</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operation Results Comparison</CardTitle>
        <CardDescription>Compare the size of results from different set operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} items`, 'Count']}
                labelFormatter={(label) => `${label} Operation`}
              />
              <Legend />
              <Bar dataKey="count" name="Items Count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}