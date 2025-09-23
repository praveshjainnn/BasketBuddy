"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Plus, Trash2, Mail, User, Edit } from "lucide-react"

interface FamilyMember {
  id: string
  name: string
  email: string
  avatar: string
}

interface MemberManagementProps {
  familyMembers: FamilyMember[]
  onAddMember: (member: Omit<FamilyMember, "id">) => void
  onUpdateMember: (id: string, updates: Partial<FamilyMember>) => void
  onDeleteMember: (id: string) => void
}

export function MemberManagement({
  familyMembers,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}: MemberManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [newMember, setNewMember] = useState({ name: "", email: "" })

  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.email.trim()) {
      const avatar = newMember.name.charAt(0).toUpperCase()
      onAddMember({
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        avatar,
      })
      setNewMember({ name: "", email: "" })
      setShowAddDialog(false)
    }
  }

  const handleUpdateMember = () => {
    if (editingMember && editingMember.name.trim() && editingMember.email.trim()) {
      const avatar = editingMember.name.charAt(0).toUpperCase()
      onUpdateMember(editingMember.id, {
        name: editingMember.name.trim(),
        email: editingMember.email.trim(),
        avatar,
      })
      setEditingMember(null)
    }
  }

  const handleDeleteMember = (id: string) => {
    if (familyMembers.length > 1) {
      onDeleteMember(id)
    }
  }

  return (
    <Card className="card-3d-advanced animate-morph-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Family Members
            </CardTitle>
            <CardDescription>Manage your family members and their access to grocery lists</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
                <DialogDescription>Add a new member to your family grocery sharing group.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter member name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddMember} className="flex-1">
                    <User className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-lg font-bold text-primary animate-bounce-gentle">
                  {member.avatar}
                </div>
                <div>
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="animate-morph-in">
                  Active
                </Badge>
                <Dialog open={editingMember?.id === member.id} onOpenChange={(open) => !open && setEditingMember(null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMember(member)}
                      className="hover:bg-primary/10 micro-hover"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Member</DialogTitle>
                      <DialogDescription>Update member information.</DialogDescription>
                    </DialogHeader>
                    {editingMember && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={editingMember.name}
                            onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={editingMember.email}
                            onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleUpdateMember} className="flex-1">
                            Update Member
                          </Button>
                          <Button variant="outline" onClick={() => setEditingMember(null)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                {familyMembers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    className="hover:bg-destructive/10 text-destructive micro-hover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {familyMembers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No family members added yet.</p>
            <p className="text-sm">Click "Add Member" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
