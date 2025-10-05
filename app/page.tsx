"use client"

import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BarChart3,
  LogOut,
  ShoppingCart,
  Sparkles,
  Zap,
  Brain,
  TrendingUp,
  Shield,
  Layers,
  Cpu,
  Database,
  Rocket,
} from "lucide-react"
import { GroceryListManager } from "@/components/grocery-list-manager"
import { CSVImport } from "@/components/csv-import"
import { UploadToFirestore } from "@/components/upload-to-firestore"
import { MemberManagement } from "@/components/member-management"
import { UserProfile as UserProfilePanel } from "@/components/user-profile"
import { SetOperationsPanel } from "@/components/set-operations-panel"
import { VisualizationPanel } from "@/components/visualization-panel"
import { AuthDialog } from "@/components/auth-dialog"
import { SmartAIAssistant } from "@/components/smart-ai-assistant"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthProvider, useAuth, FirebaseAuth } from "@/components/firebase-auth"
const Hero3D = dynamic(() => import("@/components/hero-3d"), { ssr: false })
const HeroParticles = dynamic(() => import("@/components/hero-particles"), { ssr: false })

interface GroceryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  price: number
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

export default function GroceryComparatorApp() {
  const { user, loading } = useAuth() // Use Firebase auth state
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: "1", name: "Mom", email: "mom@family.com", avatar: "M" },
    { id: "2", name: "Dad", email: "dad@family.com", avatar: "D" },
    { id: "3", name: "Alex", email: "alex@family.com", avatar: "A" },
  ])
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("lists")
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    const savedLists = localStorage.getItem("groceryLists")
    if (savedLists) {
      const parsed = JSON.parse(savedLists)
      setGroceryLists(
        parsed.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          items: list.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          })),
        })),
      )
    } else {
      const sampleLists: GroceryList[] = [
        {
          id: "1",
          name: "Weekly Groceries",
          description: "Regular weekly shopping list",
          createdBy: "1",
          createdAt: new Date(),
          sharedWith: ["2", "3"],
          color: "bg-emerald-100",
          items: [
            {
              id: "1",
              name: "Milk",
              price: 3.99,
              category: "Dairy",
              quantity: 2,
              unit: "liters",
              addedBy: "1",
              addedAt: new Date(),
            },
            {
              id: "2",
              name: "Bread",
              price: 2.49,
              category: "Bakery",
              quantity: 1,
              unit: "loaf",
              addedBy: "1",
              addedAt: new Date(),
            },
            {
              id: "3",
              name: "Apples",
              price: 4.99,
              category: "Produce",
              quantity: 6,
              unit: "pieces",
              addedBy: "2",
              addedAt: new Date(),
            },
            { id: "4", name: "Chicken", price: 8.99, category: "Meat", quantity: 1, unit: "kg", addedBy: "1", addedAt: new Date() },
          ],
        },
        {
          id: "2",
          name: "Party Supplies",
          description: "Items for weekend party",
          createdBy: "2",
          createdAt: new Date(),
          sharedWith: ["1"],
          color: "bg-blue-100",
          items: [
            {
              id: "5",
              name: "Chips",
              price: 3.99,
              category: "Snacks",
              quantity: 3,
              unit: "bags",
              addedBy: "2",
              addedAt: new Date(),
            },
            {
              id: "6",
              name: "Soda",
              price: 5.99,
              category: "Beverages",
              quantity: 12,
              unit: "cans",
              addedBy: "2",
              addedAt: new Date(),
            },
            {
              id: "7",
              name: "Ice Cream",
              price: 6.99,
              category: "Frozen",
              quantity: 2,
              unit: "tubs",
              addedBy: "3",
              addedAt: new Date(),
            },
            {
              id: "8",
              name: "Apples",
              price: 3.99,
              category: "Produce",
              quantity: 4,
              unit: "pieces",
              addedBy: "2",
              addedAt: new Date(),
            },
          ],
        },
      ]
      setGroceryLists(sampleLists)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("groceryLists", JSON.stringify(groceryLists))
  }, [groceryLists])

  // Firebase auth handles user state automatically
  
  // Load grocery lists from Firestore when user logs in
  useEffect(() => {
    const loadListsFromFirestore = async () => {
      if (!user) return;
      
      try {
        const { firestore } = await import("@/lib/firebase");
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        
        if (firestore) {
          const q = query(
            collection(firestore, "groceryLists"),
            where("userId", "==", user.uid)
          );
          
          const querySnapshot = await getDocs(q);
          const firestoreLists: GroceryList[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            firestoreLists.push({
              id: doc.id,
              name: data.name,
              description: data.description,
              createdBy: data.createdBy,
              createdAt: new Date(data.createdAt),
              sharedWith: data.sharedWith || [],
              color: data.color,
              items: data.items.map((item: any) => ({
                ...item,
                addedAt: new Date(item.addedAt)
              }))
            });
          });
          
          if (firestoreLists.length > 0) {
            setGroceryLists(firestoreLists);
            console.log(`Loaded ${firestoreLists.length} lists from Firestore`);
          }
        }
      } catch (error) {
        console.error("Error loading lists from Firestore:", error);
      }
    };
    
    loadListsFromFirestore();
  }, [user])

  const addGroceryList = async (newList: Omit<GroceryList, "id" | "createdAt">) => {
    try {
      // Add additional validation
      if (!newList || !newList.name || !newList.name.trim()) {
        console.error("Invalid list data - missing name");
        return;
      }

      console.log("Adding new list:", JSON.stringify(newList));
      
      // Create a deep copy to avoid reference issues
      const listData = JSON.parse(JSON.stringify(newList));
      
      const list: GroceryList = {
        ...listData,
        id: Date.now().toString() + "-" + Math.floor(Math.random() * 1000),
        createdAt: new Date(),
      }
      
      // Update state with the new list
      setGroceryLists((prev) => [...prev, list]);
      console.log("List added successfully:", JSON.stringify(list));
      
      // Save to Firestore if user is logged in
      if (user) {
        try {
          const { firestore } = await import("@/lib/firebase");
          const { collection, addDoc } = await import("firebase/firestore");
          
          if (firestore) {
            await addDoc(collection(firestore, "groceryLists"), {
              ...list,
              userId: user.uid,
              createdAt: list.createdAt.toISOString(),
              items: list.items.map(item => ({
                ...item,
                addedAt: item.addedAt.toISOString()
              }))
            });
            console.log("List saved to Firestore");
          }
        } catch (firestoreError) {
          console.error("Error saving to Firestore:", firestoreError);
          // Don't fail the whole operation if Firestore save fails
        }
      }
    } catch (error) {
      console.error("Error adding grocery list:", error);
      alert("Error adding grocery list. Please try again.");
    }
  }

  const updateGroceryList = async (id: string, updates: Partial<GroceryList>) => {
    setGroceryLists((prev) => prev.map((list) => (list.id === id ? { ...list, ...updates } : list)))
    
    // Update in Firestore if user is logged in
    if (user) {
      try {
        const { firestore } = await import("@/lib/firebase");
        const { doc, updateDoc } = await import("firebase/firestore");
        
        if (firestore) {
          const docRef = doc(firestore, "groceryLists", id);
          await updateDoc(docRef, {
            ...updates,
            items: updates.items?.map(item => ({
              ...item,
              addedAt: item.addedAt instanceof Date ? item.addedAt.toISOString() : item.addedAt
            }))
          });
          console.log("List updated in Firestore");
        }
      } catch (error) {
        console.error("Error updating list in Firestore:", error);
      }
    }
  }

  const deleteGroceryList = async (id: string) => {
    setGroceryLists((prev) => prev.filter((list) => list.id !== id))
    setSelectedLists((prev) => prev.filter((listId) => listId !== id))
    
    // Delete from Firestore if user is logged in
    if (user) {
      try {
        const { firestore } = await import("@/lib/firebase");
        const { doc, deleteDoc } = await import("firebase/firestore");
        
        if (firestore) {
          const docRef = doc(firestore, "groceryLists", id);
          await deleteDoc(docRef);
          console.log("List deleted from Firestore");
        }
      } catch (error) {
        console.error("Error deleting list from Firestore:", error);
      }
    }
  }

  // Member Management handlers with local state update (can be backed by API later)
  const addMember = (member: Omit<FamilyMember, "id">) => {
    const newMember: FamilyMember = { id: Date.now().toString(), ...member }
    setFamilyMembers((prev) => [...prev, newMember])
  }

  const updateMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }

  const deleteMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const toggleListSelection = (listId: string) => {
    setSelectedLists((prev) => (prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]))
  }

  const getTotalItems = () => {
    return groceryLists.reduce((total, list) => total + list.items.length, 0)
  }

  const getSharedListsCount = () => {
    return groceryLists.filter((list) => list.sharedWith.length > 0).length
  }

  const handleAuthSuccess = (user: FamilyMember) => {
    // Firebase auth handles user state automatically
    setShowAuthDialog(false)
  }

  const handleAddRecommendation = (listId: string, items: string[]) => {
    const list = groceryLists.find((l) => l.id === listId)
    if (list) {
      const newItems = items.map((itemName) => ({
        id: Date.now().toString() + Math.random(),
        name: itemName,
        price: 0,
        category: "AI Recommended",
        quantity: 1,
        unit: "piece",
        addedBy: "AI Assistant",
        addedAt: new Date(),
      }))
      updateGroceryList(listId, {
        items: [...list.items, ...newItems],
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect border-b sticky top-0 z-[100] animate-slide-up">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center animate-pulse-glow">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text-animated">BasketBuddy</h1>
                <p className="text-sm text-muted-foreground">Next-gen grocery comparator</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 animate-morph-in micro-hover">
                  <Users className="w-3 h-3" />
                  {familyMembers.length} members
                </Badge>
                <Badge variant="outline" className="gap-1 animate-morph-in micro-hover">
                  <Sparkles className="w-3 h-3" />
                  {groceryLists.length} lists
                </Badge>
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-border/50">
                <FirebaseAuth />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {!user ? (
        <main className="relative overflow-hidden immersive-bg">
          <section className="h-screen relative">
            <div className="absolute inset-0 z-0">
              {/* Dynamically loaded client-side 3D hero */}
              <Hero3D />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              <div className="text-center space-y-8 animate-morph-in pointer-events-auto max-w-4xl mx-auto px-4">
                <div className="space-y-6">
                  <h1 className="text-7xl font-bold gradient-text-animated animate-pulse-glow">BasketBuddy</h1>
                  <h2 className="text-4xl font-bold text-foreground animate-morph-in">
                    The Future of Grocery Shopping
                  </h2>
  
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                  <Button
                    size="lg"
                    onClick={() => setShowAuthDialog(true)}
                    className="btn-advanced bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300 text-lg px-8 py-4 micro-click"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Your Journey
                  </Button>
             
                </div>

                <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground animate-slide-up">
                  <div className="flex items-center gap-2 micro-hover">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-glow"></div>
                    Free Forever
                  </div>
                  <div className="flex items-center gap-2 micro-hover">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-glow"></div>
                    Real-time Sync
                  </div>
                  <div className="flex items-center gap-2 micro-hover">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse-glow"></div>
                    AI Powered
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-gradient-to-b from-background to-card/30 relative z-20">
            <div className="container mx-auto px-4">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-4xl font-bold gradient-text-animated animate-morph-in">Powerful Features</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up">
                  Everything you need to revolutionize your family's grocery shopping experience
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {[
                  {
                    icon: Rocket,
                    title: "3D Interface",
                    description:
                      "Navigate through your grocery lists in stunning 3D space with smooth animations and intuitive controls.",
                  },
                  {
                    icon: Cpu,
                    title: "AI Recommendations",
                    description:
                      "Get smart suggestions based on your shopping patterns, dietary preferences, and family needs.",
                  },
                  {
                    icon: Zap,
                    title: "Real-time Sync",
                    description:
                      "Changes sync instantly across all family devices with conflict resolution and offline support.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Advanced Analytics",
                    description:
                      "Visualize spending patterns, nutritional insights, and shopping trends with interactive 3D charts.",
                  },
                  {
                    icon: Shield,
                    title: "Privacy First",
                    description:
                      "Your data stays secure with end-to-end encryption and privacy-focused design principles.",
                  },
                  {
                    icon: Layers,
                    title: "Smart Comparisons",
                    description:
                      "Use advanced set theory operations including symmetric difference, complement, and cartesian product.",
                  },
                  {
                    icon: Brain,
                    title: "Predictive Shopping",
                    description:
                      "AI predicts what you'll need based on consumption patterns, seasonal trends, and family preferences.",
                  },
                  {
                    icon: Database,
                    title: "Smart Categories",
                    description:
                      "Auto-categorize items with ML, create custom categories, and get store layout optimization.",
                  },
                  {
                    icon: Sparkles,
                    title: "Recipe Integration",
                    description:
                      "Import recipes, auto-generate shopping lists, and get nutritional analysis for meal planning.",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="card-3d-advanced group particle-container micro-hover micro-click animate-morph-in bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-2xl p-8 border border-border/20 shadow-lg hover:shadow-2xl"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-flip-card transition-all duration-300">
                        <feature.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-4 gradient-text">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 relative z-20">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl font-bold gradient-text">Ready to Transform Your Shopping?</h2>
                <p className="text-xl text-muted-foreground">
                  Join thousands of families already using BasketBuddy to streamline their grocery shopping
                  experience.
                </p>
                <Button
                  size="lg"
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-2xl transition-all duration-300 text-lg px-12 py-6 animate-glow"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  Get Started for Free
                </Button>
              </div>
            </div>
          </section>

          <footer className="bg-card/50 backdrop-blur-sm border-t border-border/20 py-8 relative z-20">
            <div className="container mx-auto px-4">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Developers</h3>
                <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
                  <span className="hover:text-primary transition-colors cursor-pointer">Pravesh Jain</span>
                  <span className="hover:text-primary transition-colors cursor-pointer">Palak Thakur</span>
                  <span className="hover:text-primary transition-colors cursor-pointer">Vandith Shetty</span>
                  <span className="hover:text-primary transition-colors cursor-pointer">Gagan Agrawal</span>
                </div>
                <div className="pt-4 border-t border-border/20">
                  <p className="text-sm text-muted-foreground">
                    © 2025 BasketBuddy. Built with passion for better grocery shopping.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </main>
      ) : (
        <main className="container mx-auto px-4 py-6 relative z-10">
          <div className="fixed inset-0 z-0 pointer-events-none">
            <HeroParticles />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                icon: Database,
                label: "Total Lists",
                value: groceryLists.length,
                color: "from-primary/20 to-primary/10",
              },
              {
                icon: ShoppingCart,
                label: "Total Items",
                value: getTotalItems(),
                color: "from-accent/20 to-accent/10",
              },
              {
                icon: Users,
                label: "Shared Lists",
                value: getSharedListsCount(),
                color: "from-secondary/20 to-secondary/10",
              },
              {
                icon: Users,
                label: "Family Members",
                value: familyMembers.length,
                color: "from-chart-3/20 to-chart-3/10",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="card-3d-advanced animate-morph-in micro-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center animate-bounce-gentle`}
                    >
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold gradient-text-animated">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 glass-effect">
              <TabsTrigger
                value="lists"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary"
              >
                <Database className="w-4 h-4" /> Lists
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary"
              >
                <Brain className="w-4 h-4" /> Compare
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary"
              >
                <BarChart3 className="w-4 h-4" /> Analytics
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary"
              >
                <Brain className="w-4 h-4" /> AI Assistant
              </TabsTrigger>
              <TabsTrigger
                value="family"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary"
              >
                <Users className="w-4 h-4" /> Family
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary"
              >
                <Users className="w-4 h-4" /> Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lists" className="space-y-4">
              <div className="flex justify-end gap-2 pointer-events-auto relative z-20">
                <UploadToFirestore groceryLists={groceryLists} />
                <CSVImport onImportList={addGroceryList} />
              </div>
              <GroceryListManager
                groceryLists={groceryLists}
                familyMembers={familyMembers}
                onAddList={addGroceryList}
                onUpdateList={updateGroceryList}
                onDeleteList={deleteGroceryList}
                selectedLists={selectedLists}
                onToggleSelection={toggleListSelection}
                currentUserId={user?.uid}
              />
            </TabsContent>

            <TabsContent value="compare" className="space-y-4">
              <SetOperationsPanel
                groceryLists={groceryLists}
                familyMembers={familyMembers}
                selectedLists={selectedLists}
                onToggleSelection={toggleListSelection}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <VisualizationPanel groceryLists={groceryLists} familyMembers={familyMembers} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <SmartAIAssistant
                groceryLists={groceryLists}
                familyMembers={familyMembers}
                onAddRecommendation={handleAddRecommendation}
              />
            </TabsContent>

            <TabsContent value="family" className="space-y-4">
              <MemberManagement
                familyMembers={familyMembers}
                onAddMember={addMember}
                onUpdateMember={updateMember}
                onDeleteMember={deleteMember}
              />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <UserProfilePanel currentUser={user ? {
                id: user.uid,
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                avatar: user.photoURL || ''
              } : undefined} onUpdateUser={(u) => {
                // Profile updates handled by Firebase
                console.log('Profile update:', u)
              }} />
            </TabsContent>
          </Tabs>
        </main>
      )}

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onAuthSuccess={handleAuthSuccess} />
    </div>
  )
}
