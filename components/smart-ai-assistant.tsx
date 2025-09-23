"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, Sparkles, TrendingUp, Lightbulb, Zap, Target, Star, MessageCircle, Send } from "lucide-react"

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

interface SmartRecommendation {
  id: string
  type: "missing_item" | "price_alert" | "nutrition" | "seasonal" | "bulk_buy" | "recipe"
  title: string
  description: string
  confidence: number
  action?: string
  items?: string[]
}

interface SmartAIAssistantProps {
  groceryLists: GroceryList[]
  familyMembers: FamilyMember[]
  onAddRecommendation: (listId: string, items: string[]) => void
}

export function SmartAIAssistant({ groceryLists, familyMembers, onAddRecommendation }: SmartAIAssistantProps) {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI grocery assistant. I can help you optimize your shopping lists, suggest recipes, and find the best deals. What would you like to know?",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    generateSmartRecommendations()
  }, [groceryLists])

  const generateSmartRecommendations = () => {
    const newRecommendations: SmartRecommendation[] = []

    // Analyze shopping patterns
    const allItems = groceryLists.flatMap((list) => list.items)
    const itemFrequency = allItems.reduce(
      (acc, item) => {
        acc[item.name.toLowerCase()] = (acc[item.name.toLowerCase()] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Missing essentials recommendation
    const essentials = ["milk", "bread", "eggs", "butter", "rice", "pasta", "chicken", "onions", "garlic", "salt"]
    const missingEssentials = essentials.filter((item) => !Object.keys(itemFrequency).includes(item))

    if (missingEssentials.length > 0) {
      newRecommendations.push({
        id: "1",
        type: "missing_item",
        title: "Missing Kitchen Essentials",
        description: `You might want to add these common ingredients: ${missingEssentials.slice(0, 3).join(", ")}`,
        confidence: 85,
        action: "Add to list",
        items: missingEssentials.slice(0, 3),
      })
    }

    // Seasonal recommendations
    const currentMonth = new Date().getMonth()
    const seasonalItems =
      currentMonth < 3 || currentMonth > 10
        ? ["oranges", "winter squash", "sweet potatoes", "hot chocolate"]
        : currentMonth < 6
          ? ["strawberries", "asparagus", "spring onions", "fresh herbs"]
          : currentMonth < 9
            ? ["tomatoes", "corn", "berries", "watermelon"]
            : ["apples", "pumpkin", "cranberries", "cinnamon"]

    newRecommendations.push({
      id: "2",
      type: "seasonal",
      title: "Seasonal Favorites",
      description: `These seasonal items are at their peak right now: ${seasonalItems.slice(0, 2).join(", ")}`,
      confidence: 78,
      action: "Explore seasonal",
      items: seasonalItems.slice(0, 2),
    })

    // Bulk buying opportunity
    const frequentItems = Object.entries(itemFrequency)
      .filter(([_, count]) => count >= 2)
      .map(([item, _]) => item)

    if (frequentItems.length > 0) {
      newRecommendations.push({
        id: "3",
        type: "bulk_buy",
        title: "Bulk Buying Opportunity",
        description: `Consider buying ${frequentItems[0]} in bulk - you use it frequently!`,
        confidence: 72,
        action: "Save money",
      })
    }

    // Recipe suggestions
    const proteins = allItems.filter((item) =>
      ["chicken", "beef", "fish", "tofu", "eggs"].includes(item.name.toLowerCase()),
    )
    const vegetables = allItems.filter((item) =>
      ["onions", "carrots", "celery", "tomatoes", "peppers"].includes(item.name.toLowerCase()),
    )

    if (proteins.length > 0 && vegetables.length > 0) {
      newRecommendations.push({
        id: "4",
        type: "recipe",
        title: "Recipe Suggestion",
        description: `With your ${proteins[0].name} and ${vegetables[0].name}, you could make a delicious stir-fry!`,
        confidence: 88,
        action: "Get recipe",
      })
    }

    // Nutrition balance
    const categories = allItems.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const produceCount = categories["Produce"] || 0
    const totalItems = allItems.length

    if (totalItems > 0 && produceCount / totalItems < 0.3) {
      newRecommendations.push({
        id: "5",
        type: "nutrition",
        title: "Nutrition Balance",
        description: "Consider adding more fruits and vegetables for a balanced diet",
        confidence: 65,
        action: "Add produce",
        items: ["spinach", "bananas", "carrots", "apples"],
      })
    }

    setRecommendations(newRecommendations)
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsTyping(true)

    // Analyze the user's message to generate a more specific response
    const generateResponse = (message: string) => {
      const lowerMessage = message.toLowerCase();
      
      // Check for specific topics in the user's message
      if (lowerMessage.includes("recipe") || lowerMessage.includes("cook") || lowerMessage.includes("meal")) {
        // Recipe-related responses
        if (lowerMessage.includes("pasta") || lowerMessage.includes("noodle")) {
          return "For a quick pasta dish, try combining pasta with olive oil, garlic, cherry tomatoes, and spinach. Top with parmesan cheese. Based on your current lists, you already have most of these ingredients!";
        } else if (lowerMessage.includes("chicken") || lowerMessage.includes("meat")) {
          return "Here's a simple chicken recipe: Season chicken breasts with salt, pepper, and herbs. Bake at 375°F for 25 minutes. Serve with roasted vegetables. Your shopping list already has chicken and several vegetables that would work well!";
        } else if (lowerMessage.includes("vegetarian") || lowerMessage.includes("vegan")) {
          return "For a delicious vegetarian meal, try a chickpea curry with coconut milk, spinach, and spices. Serve with rice or naan bread. Would you like me to add these ingredients to your shopping list?";
        } else {
          return "I can suggest recipes based on what you already have! Looking at your lists, you could make pasta dishes, stir-fries, or salads. Would you like a specific recipe using particular ingredients?";
        }
      } else if (lowerMessage.includes("budget") || lowerMessage.includes("save") || lowerMessage.includes("cost") || lowerMessage.includes("cheap")) {
        // Budget-related responses
        if (lowerMessage.includes("meat") || lowerMessage.includes("protein")) {
          return "To save on proteins: 1) Buy whole chickens instead of parts, 2) Try plant-based proteins like beans and lentils, 3) Look for sales on frozen meats, 4) Consider eggs as an affordable protein source.";
        } else if (lowerMessage.includes("produce") || lowerMessage.includes("vegetable") || lowerMessage.includes("fruit")) {
          return "For cheaper produce: 1) Buy what's in season, 2) Check local farmers' markets, 3) Consider frozen vegetables which are often cheaper and last longer, 4) Look for 'ugly' produce discounts at some stores.";
        } else {
          return "Here are my top money-saving tips: 1) Buy seasonal produce, 2) Use store brands for staples, 3) Plan meals around weekly sales, 4) Buy non-perishables in bulk when on sale, 5) Reduce food waste by planning leftovers. Would you like more specific tips?";
        }
      } else if (lowerMessage.includes("healthy") || lowerMessage.includes("nutrition") || lowerMessage.includes("diet")) {
        // Nutrition-related responses
        if (lowerMessage.includes("protein")) {
          return "For balanced protein sources, consider adding more fish, legumes, and lean poultry to your lists. I notice you already have chicken, but adding items like salmon, beans, or tofu would provide different nutrients.";
        } else if (lowerMessage.includes("carb") || lowerMessage.includes("sugar")) {
          return "To reduce refined carbs, replace white bread and pasta with whole grain versions. Also consider adding more vegetables as alternatives - cauliflower rice or zucchini noodles are great substitutes!";
        } else {
          return "Looking at your current lists, I'd suggest adding more colorful vegetables and fruits for better nutrition. Bell peppers, berries, and leafy greens would add important vitamins. Also, consider whole grains like quinoa or brown rice instead of refined grains.";
        }
      } else if (lowerMessage.includes("meal plan") || lowerMessage.includes("schedule") || lowerMessage.includes("weekly")) {
        // Meal planning responses
        return "Here's a simple meal plan based on your current lists:\n\nMonday: Pasta with vegetables and chicken\nTuesday: Stir-fry with seasonal vegetables\nWednesday: Salad with protein of choice\nThursday: Grain bowl with roasted vegetables\nFriday: Homemade pizza night\n\nWould you like me to adjust this plan or add the missing ingredients to your shopping list?";
      } else if (lowerMessage.includes("compare") || lowerMessage.includes("difference") || lowerMessage.includes("versus") || lowerMessage.includes("vs")) {
        // List comparison responses
        return "I can help compare your lists! I see you have multiple shopping lists. The 'Weekly Groceries' and 'Party Supplies' lists have some overlap in items like apples. Would you like me to show a detailed comparison or help merge these lists?";
      } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
        // Greeting responses
        return "Hello! I'm your AI grocery assistant. I can help with recipes, budget tips, nutrition advice, meal planning, and shopping optimization. What can I help you with today?";
      } else {
        // Default response for unrecognized queries
        return "I'd be happy to help with your grocery planning! I can suggest recipes, offer budget tips, provide nutrition advice, create meal plans, or help optimize your shopping. Could you tell me more specifically what you're looking for?";
      }
    };

    // Simulate AI response with a delay
    setTimeout(() => {
      const response = generateResponse(userMessage);
      setChatMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1000);
  }

  const applyRecommendation = (recommendation: SmartRecommendation) => {
    if (recommendation.items && groceryLists.length > 0) {
      onAddRecommendation(groceryLists[0].id, recommendation.items)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "from-green-500 to-emerald-500"
    if (confidence >= 60) return "from-yellow-500 to-orange-500"
    return "from-orange-500 to-red-500"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "missing_item":
        return <Target className="w-4 h-4" />
      case "seasonal":
        return <Star className="w-4 h-4" />
      case "bulk_buy":
        return <TrendingUp className="w-4 h-4" />
      case "recipe":
        return <Lightbulb className="w-4 h-4" />
      case "nutrition":
        return <Zap className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold gradient-text flex items-center justify-center gap-3 animate-slide-up">
          <Brain className="w-8 h-8" />
          Smart AI Assistant
        </h2>
        <p className="text-muted-foreground animate-slide-up">
          Get personalized recommendations and chat with your AI grocery assistant
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Smart Recommendations */}
        <Card className="card-3d animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>AI-powered suggestions based on your shopping patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="p-4 rounded-lg bg-gradient-to-r from-card/50 to-transparent border border-border/30 hover:border-primary/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-lg flex items-center justify-center">
                      {getTypeIcon(rec.type)}
                    </div>
                    <h4 className="font-semibold text-foreground">{rec.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getConfidenceColor(rec.confidence)}`} />
                    <span className="text-xs text-muted-foreground">{rec.confidence}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{rec.description}</p>
                {rec.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyRecommendation(rec)}
                    className="bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-all duration-300"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {rec.action}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Chat Assistant */}
        <Card className="card-3d animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-secondary" />
              AI Chat Assistant
            </CardTitle>
            <CardDescription>Ask questions about recipes, nutrition, budgeting, and more</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-80 overflow-y-auto custom-scrollbar space-y-3 p-3 bg-gradient-to-b from-card/30 to-transparent rounded-lg border border-border/30">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary to-secondary text-white"
                        : "bg-gradient-to-r from-card to-muted border border-border/30"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-card to-muted border border-border/30 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything about grocery shopping..."
                className="glass-effect border-border/50 focus:border-primary/50"
                onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
              />
              <Button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isTyping}
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-3d animate-scale-in" style={{ animationDelay: "0.4s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Quick AI Actions
          </CardTitle>
          <CardDescription>One-click AI-powered grocery list enhancements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🥗", title: "Add Healthy Items", desc: "Boost nutrition" },
              { icon: "💰", title: "Find Deals", desc: "Save money" },
              { icon: "🍳", title: "Recipe Match", desc: "Get cooking ideas" },
              { icon: "📅", title: "Meal Plan", desc: "Plan your week" },
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 bg-gradient-to-br from-card/50 to-transparent hover:from-primary/10 hover:to-secondary/10 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-2xl">{action.icon}</span>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
