"use client"

/**
 * Set Operations with Venn Diagram Visualization
 * Implements discrete mathematics set operations between user lists and seller items
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface GroceryItem {
  id: string
  name: string
  category: string
  quantity: number
  price?: number
}

interface SellerItem {
  id: number
  item_name: string
  category: string
  quantity: number
  discounted_price: number
  discount_percentage: number
  seller_name: string
}

interface SetOperationsVennProps {
  userItems: GroceryItem[]
  sellerItems: SellerItem[]
}

export default function SetOperationsVenn({ userItems, sellerItems }: SetOperationsVennProps) {
  const [intersection, setIntersection] = useState<any[]>([])
  const [union, setUnion] = useState<any[]>([])
  const [userOnly, setUserOnly] = useState<GroceryItem[]>([])
  const [sellerOnly, setSellerOnly] = useState<SellerItem[]>([])

  useEffect(() => {
    calculateSetOperations()
  }, [userItems, sellerItems])

  const calculateSetOperations = () => {
    // Normalize names for comparison (lowercase, trim)
    const normalizeItem = (name: string) => name.toLowerCase().trim()

    // Create maps for quick lookup
    const userItemsMap = new Map(
      userItems.map(item => [normalizeItem(item.name), item])
    )
    const sellerItemsMap = new Map(
      sellerItems.map(item => [normalizeItem(item.item_name), item])
    )

    // Intersection: Items in both user list and seller inventory
    const intersectionResult: any[] = []
    userItems.forEach(userItem => {
      const normalized = normalizeItem(userItem.name)
      const sellerItem = sellerItemsMap.get(normalized)
      if (sellerItem) {
        intersectionResult.push({
          name: userItem.name,
          category: userItem.category,
          userQuantity: userItem.quantity,
          sellerQuantity: sellerItem.quantity,
          userPrice: userItem.price || 0,
          sellerPrice: sellerItem.discounted_price,
          discount: sellerItem.discount_percentage,
          seller: sellerItem.seller_name,
          savings: (userItem.price || sellerItem.discounted_price) - sellerItem.discounted_price
        })
      }
    })
    setIntersection(intersectionResult)

    // User Only: Items in user list but not available from sellers
    const userOnlyResult = userItems.filter(
      userItem => !sellerItemsMap.has(normalizeItem(userItem.name))
    )
    setUserOnly(userOnlyResult)

    // Seller Only: Items available from sellers but not in user list
    const sellerOnlyResult = sellerItems.filter(
      sellerItem => !userItemsMap.has(normalizeItem(sellerItem.item_name))
    )
    setSellerOnly(sellerOnlyResult)

    // Union: All unique items from both sets
    const unionResult = [
      ...userItems.map(item => ({ ...item, source: 'user' })),
      ...sellerItems
        .filter(item => !userItemsMap.has(normalizeItem(item.item_name)))
        .map(item => ({ 
          id: item.id.toString(), 
          name: item.item_name, 
          category: item.category,
          quantity: item.quantity,
          price: item.discounted_price,
          source: 'seller' 
        }))
    ]
    setUnion(unionResult)
  }

  const VennDiagram = () => (
    <div className="relative w-full h-96 flex items-center justify-center">
      <svg viewBox="0 0 600 400" className="w-full h-full">
        {/* Left Circle (User List) */}
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="rgba(59, 130, 246, 0.3)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="3"
        />
        <text x="140" y="120" fill="currentColor" fontSize="16" fontWeight="bold">
          User List
        </text>
        <text x="140" y="145" fill="currentColor" fontSize="14">
          ({userItems.length} items)
        </text>

        {/* Right Circle (Seller Items) */}
        <circle
          cx="400"
          cy="200"
          r="120"
          fill="rgba(34, 197, 94, 0.3)"
          stroke="rgb(34, 197, 94)"
          strokeWidth="3"
        />
        <text x="380" y="120" fill="currentColor" fontSize="16" fontWeight="bold">
          Seller Items
        </text>
        <text x="380" y="145" fill="currentColor" fontSize="14">
          ({sellerItems.length} items)
        </text>

        {/* Intersection Label */}
        <text x="270" y="195" fill="currentColor" fontSize="14" fontWeight="bold" textAnchor="middle">
          Intersection
        </text>
        <text x="270" y="215" fill="currentColor" fontSize="18" fontWeight="bold" textAnchor="middle">
          {intersection.length}
        </text>

        {/* User Only Count */}
        <text x="140" y="205" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">
          {userOnly.length}
        </text>

        {/* Seller Only Count */}
        <text x="460" y="205" fill="currentColor" fontSize="16" fontWeight="bold" textAnchor="middle">
          {sellerOnly.length}
        </text>

        {/* Legend */}
        <text x="50" y="350" fill="currentColor" fontSize="12">
          <tspan fontWeight="bold">Set Operations:</tspan>
        </text>
        <text x="50" y="370" fill="currentColor" fontSize="11">
          U ∩ S = {intersection.length} | U - S = {userOnly.length} | S - U = {sellerOnly.length} | U ∪ S = {union.length}
        </text>
      </svg>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Operations Visualization</CardTitle>
          <CardDescription>
            Discrete mathematics operations between your grocery list (U) and seller items (S)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VennDiagram />
        </CardContent>
      </Card>

      <Tabs defaultValue="intersection" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="intersection">
            Intersection ({intersection.length})
          </TabsTrigger>
          <TabsTrigger value="user-only">
            User Only ({userOnly.length})
          </TabsTrigger>
          <TabsTrigger value="seller-only">
            Seller Only ({sellerOnly.length})
          </TabsTrigger>
          <TabsTrigger value="union">
            Union ({union.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intersection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>U ∩ S: Items in Both Sets</CardTitle>
              <CardDescription>
                Items you need that are available from sellers with discounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {intersection.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No matching items found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Your Qty</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Seller Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Potential Savings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {intersection.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.userQuantity}</TableCell>
                        <TableCell>{item.sellerQuantity}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ${item.sellerPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-orange-500">
                            {item.discount.toFixed(0)}% OFF
                          </Badge>
                        </TableCell>
                        <TableCell>{item.seller}</TableCell>
                        <TableCell className="text-green-600 font-bold">
                          ${Math.max(0, item.savings).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-only" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>U - S: Items Not Available from Sellers</CardTitle>
              <CardDescription>
                Items on your list that sellers don't currently have
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userOnly.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  All your items are available from sellers!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOnly.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Not Available</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seller-only" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>S - U: Additional Seller Items</CardTitle>
              <CardDescription>
                Discounted items from sellers you might be interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sellerOnly.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No additional items available
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Seller</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellerOnly.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ${item.discounted_price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-orange-500">
                            {item.discount_percentage.toFixed(0)}% OFF
                          </Badge>
                        </TableCell>
                        <TableCell>{item.seller_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="union" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>U ∪ S: All Unique Items</CardTitle>
              <CardDescription>
                Complete set of all items from both your list and sellers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {union.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={item.source === 'user' ? 'default' : 'secondary'}>
                          {item.source === 'user' ? 'Your List' : 'Seller'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mathematical Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Set Theory Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong className="text-blue-500">Universal Set U (Your List):</strong> |U| = {userItems.length} items</p>
          <p><strong className="text-green-500">Seller Set S:</strong> |S| = {sellerItems.length} items</p>
          <p><strong className="text-purple-500">Intersection (U ∩ S):</strong> {intersection.length} items available with discounts</p>
          <p><strong className="text-orange-500">Difference (U - S):</strong> {userOnly.length} items not available</p>
          <p><strong className="text-pink-500">Difference (S - U):</strong> {sellerOnly.length} additional items</p>
          <p><strong className="text-indigo-500">Union (U ∪ S):</strong> {union.length} total unique items</p>
          {intersection.length > 0 && (
            <p className="text-green-600 font-bold mt-4">
              💰 Total Potential Savings: ${intersection.reduce((sum, item) => sum + Math.max(0, item.savings), 0).toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
