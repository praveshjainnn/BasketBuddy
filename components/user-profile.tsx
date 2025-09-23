"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Save,
  Edit,
  Camera,
  Heart,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react"

interface FamilyMember {
  id: string
  name: string
  email: string
  avatar: string
}

interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  currency: string
  notifications: {
    email: boolean
    push: boolean
    listUpdates: boolean
    aiRecommendations: boolean
    weeklyReports: boolean
  }
  privacy: {
    shareAnalytics: boolean
    publicProfile: boolean
    showOnlineStatus: boolean
  }
  shopping: {
    defaultStore: string
    preferredBrands: string[]
    dietaryRestrictions: string[]
    budgetAlerts: boolean
    priceTracking: boolean
  }
}

interface UserProfile extends FamilyMember {
  bio?: string
  phone?: string
  location?: string
  joinedAt: Date
  preferences: UserPreferences
  stats: {
    listsCreated: number
    itemsAdded: number
    collaborations: number
    streakDays: number
  }
}

interface UserProfileProps {
  currentUser?: FamilyMember // Made currentUser optional
  onUpdateUser: (updates: Partial<FamilyMember>) => void
}

const defaultPreferences: UserPreferences = {
  theme: "system",
  language: "en",
  currency: "USD",
  notifications: {
    email: true,
    push: true,
    listUpdates: true,
    aiRecommendations: true,
    weeklyReports: false,
  },
  privacy: {
    shareAnalytics: true,
    publicProfile: false,
    showOnlineStatus: true,
  },
  shopping: {
    defaultStore: "",
    preferredBrands: [],
    dietaryRestrictions: [],
    budgetAlerts: true,
    priceTracking: true,
  },
}

export function UserProfile({ currentUser, onUpdateUser }: UserProfileProps) {
  const defaultUser: FamilyMember = {
    id: "default",
    name: "Guest User",
    email: "guest@example.com",
    avatar: "👤",
  }

  const user = currentUser || defaultUser

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user.name, // Use user instead of currentUser
    email: user.email, // Use user instead of currentUser
    bio: "",
    phone: "",
    location: "",
  })
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [activeTab, setActiveTab] = useState("profile")

  // Mock user profile data
  const userProfile: UserProfile = {
    ...user, // Use user instead of currentUser
    bio: "Family grocery coordinator and meal planning enthusiast",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinedAt: new Date("2024-01-15"),
    preferences,
    stats: {
      listsCreated: 24,
      itemsAdded: 156,
      collaborations: 8,
      streakDays: 12,
    },
  }

  const handleSaveProfile = () => {
    onUpdateUser({
      name: editForm.name,
      email: editForm.email,
    })
    setIsEditing(false)
  }

  const handlePreferenceChange = (category: keyof UserPreferences, key: string, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const avatarOptions = ["👤", "👨", "👩", "🧑", "👨‍💼", "👩‍💼", "👨‍🍳", "👩‍🍳", "🧑‍🍳", "👨‍🌾", "👩‍🌾", "🧑‍🌾"]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="card-3d-advanced animate-morph-in">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-4xl animate-bounce-gentle">
                {user.avatar} {/* Use user instead of currentUser */}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-primary to-secondary"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Choose Avatar</DialogTitle>
                    <DialogDescription>Select an avatar for your profile</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-6 gap-3">
                    {avatarOptions.map((avatar, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-12 h-12 text-2xl p-0 hover:scale-110 transition-transform bg-transparent"
                        onClick={() => onUpdateUser({ avatar })}
                      >
                        {avatar}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold gradient-text">{user.name}</h2>{" "}
                  {/* Use user instead of currentUser */}
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email} {/* Use user instead of currentUser */}
                  </p>
                  {userProfile.bio && <p className="text-sm text-muted-foreground mt-2">{userProfile.bio}</p>}
                </div>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 hover:bg-primary/10">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {userProfile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {userProfile.phone}
                  </div>
                )}
                {userProfile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {userProfile.location}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {userProfile.joinedAt.toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-4">
                {[
                  { icon: ShoppingCart, label: "Lists Created", value: userProfile.stats.listsCreated },
                  { icon: Heart, label: "Items Added", value: userProfile.stats.itemsAdded },
                  { icon: TrendingUp, label: "Collaborations", value: userProfile.stats.collaborations },
                  { icon: Sparkles, label: "Day Streak", value: userProfile.stats.streakDays },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/10 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 glass-effect">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="card-3d animate-slide-up"> 
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="glass-effect"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="glass-effect"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="glass-effect"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editForm.location}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    className="glass-effect"
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  className="glass-effect"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-primary to-secondary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-3d animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize your app appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => handlePreferenceChange("theme", "theme", value)}
                  >
                    <SelectTrigger className="glass-effect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => handlePreferenceChange("language", "language", value)}
                  >
                    <SelectTrigger className="glass-effect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) => handlePreferenceChange("currency", "currency", value)}
                  >
                    <SelectTrigger className="glass-effect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Preferences
                </CardTitle>
                <CardDescription>Configure your shopping settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Store</Label>
                  <Input
                    value={preferences.shopping.defaultStore}
                    onChange={(e) => handlePreferenceChange("shopping", "defaultStore", e.target.value)}
                    className="glass-effect"
                    placeholder="e.g., Whole Foods, Target"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
                  </div>
                  <Switch
                    checked={preferences.shopping.budgetAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange("shopping", "budgetAlerts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Price Tracking</Label>
                    <p className="text-sm text-muted-foreground">Track price changes for your items</p>
                  </div>
                  <Switch
                    checked={preferences.shopping.priceTracking}
                    onCheckedChange={(checked) => handlePreferenceChange("shopping", "priceTracking", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="card-3d animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => handlePreferenceChange("notifications", "email", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => handlePreferenceChange("notifications", "push", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>List Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified when family members update lists</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.listUpdates}
                    onCheckedChange={(checked) => handlePreferenceChange("notifications", "listUpdates", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Recommendations</Label>
                    <p className="text-sm text-muted-foreground">Receive AI-powered shopping suggestions</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.aiRecommendations}
                    onCheckedChange={(checked) => handlePreferenceChange("notifications", "aiRecommendations", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Get weekly shopping insights and analytics</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.weeklyReports}
                    onCheckedChange={(checked) => handlePreferenceChange("notifications", "weeklyReports", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="card-3d animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={preferences.privacy.shareAnalytics}
                    onCheckedChange={(checked) => handlePreferenceChange("privacy", "shareAnalytics", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.publicProfile}
                    onCheckedChange={(checked) => handlePreferenceChange("privacy", "publicProfile", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">Let family members see when you're online</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => handlePreferenceChange("privacy", "showOnlineStatus", checked)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/30">
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Account Actions</h4>
                  <div className="flex gap-3">
                    <Button variant="outline" className="hover:bg-primary/10 bg-transparent">
                      Change Password
                    </Button>
                    <Button variant="outline" className="hover:bg-primary/10 bg-transparent">
                      Download Data
                    </Button>
                    <Button variant="destructive" className="hover:bg-destructive/90">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-2xl glass-effect">
          <DialogHeader>
            <DialogTitle className="gradient-text">Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="glass-effect"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="glass-effect"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveProfile} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
