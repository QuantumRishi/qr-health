"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Mail,
  Bell,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  CheckCircle,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Demo family members
const familyMembers = [
  {
    id: "1",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    relationship: "Mother",
    permissions: {
      canViewProgress: true,
      canViewMedications: true,
      canViewExercises: true,
      canViewMood: true,
      notificationFrequency: "daily",
    },
    addedAt: "2024-12-01",
    lastViewed: "2024-12-15",
  },
  {
    id: "2",
    name: "Michael Smith",
    email: "michael.smith@email.com",
    relationship: "Spouse",
    permissions: {
      canViewProgress: true,
      canViewMedications: true,
      canViewExercises: false,
      canViewMood: true,
      notificationFrequency: "milestone",
    },
    addedAt: "2024-12-05",
    lastViewed: "2024-12-14",
  },
];

const notificationHistory = [
  {
    id: "1",
    recipient: "Jane Smith",
    type: "daily_summary",
    title: "Daily Recovery Update",
    sentAt: "2024-12-15 08:00",
    status: "delivered",
  },
  {
    id: "2",
    recipient: "Michael Smith",
    type: "milestone_reached",
    title: "Milestone: 2 Week Mark!",
    sentAt: "2024-12-14 10:30",
    status: "read",
  },
  {
    id: "3",
    recipient: "Jane Smith",
    type: "missed_medication",
    title: "Missed Medication Alert",
    sentAt: "2024-12-13 14:00",
    status: "delivered",
  },
];

export default function FamilySharingPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<typeof familyMembers[0] | null>(null);
  const [members, setMembers] = useState(familyMembers);

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    relationship: "",
  });

  const handleAddMember = () => {
    // In real app, this would send an invitation
    const member = {
      id: Date.now().toString(),
      ...newMember,
      permissions: {
        canViewProgress: true,
        canViewMedications: false,
        canViewExercises: false,
        canViewMood: true,
        notificationFrequency: "daily" as const,
      },
      addedAt: new Date().toISOString().split("T")[0],
      lastViewed: "-",
    };
    setMembers([...members, member]);
    setNewMember({ name: "", email: "", relationship: "" });
    setAddDialogOpen(false);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleUpdatePermission = (
    memberId: string,
    permission: keyof typeof familyMembers[0]["permissions"],
    value: boolean | string
  ) => {
    setMembers(
      members.map((m) =>
        m.id === memberId
          ? { ...m, permissions: { ...m.permissions, [permission]: value } }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Family Sharing
          </h1>
          <p className="text-muted-foreground">
            Control who can see your recovery progress
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Family Member</DialogTitle>
              <DialogDescription>
                Send an invitation to a family member to view your recovery progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">Name</Label>
                <Input
                  id="member-name"
                  placeholder="e.g., Mom"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="email@example.com"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-relationship">Relationship</Label>
                <Input
                  id="member-relationship"
                  placeholder="e.g., Mother, Spouse, Friend"
                  value={newMember.relationship}
                  onChange={(e) =>
                    setNewMember({ ...newMember, relationship: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!newMember.name || !newMember.email}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Privacy Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Your Privacy is Protected</p>
            <p className="text-sm text-muted-foreground">
              You control exactly what information family members can see. They will only
              see what you allow, and you can change permissions or remove access at any time.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Family Members</TabsTrigger>
          <TabsTrigger value="notifications">Notification History</TabsTrigger>
        </TabsList>

        {/* Family Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {members.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Family Members Added</h3>
                <p className="text-muted-foreground mb-4">
                  Add family members to let them follow your recovery progress
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Family Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {member.name}
                          <Badge variant="secondary">{member.relationship}</Badge>
                        </CardTitle>
                        <CardDescription>{member.email}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Added: {member.addedAt} • Last viewed: {member.lastViewed}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            What they can see
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${member.id}-progress`} className="flex items-center gap-2 cursor-pointer">
                                Recovery Progress
                              </Label>
                              <Switch
                                id={`${member.id}-progress`}
                                checked={member.permissions.canViewProgress}
                                onCheckedChange={(checked) =>
                                  handleUpdatePermission(member.id, "canViewProgress", checked)
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${member.id}-meds`} className="flex items-center gap-2 cursor-pointer">
                                Medication Status
                              </Label>
                              <Switch
                                id={`${member.id}-meds`}
                                checked={member.permissions.canViewMedications}
                                onCheckedChange={(checked) =>
                                  handleUpdatePermission(member.id, "canViewMedications", checked)
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${member.id}-exercises`} className="flex items-center gap-2 cursor-pointer">
                                Exercise Status
                              </Label>
                              <Switch
                                id={`${member.id}-exercises`}
                                checked={member.permissions.canViewExercises}
                                onCheckedChange={(checked) =>
                                  handleUpdatePermission(member.id, "canViewExercises", checked)
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${member.id}-mood`} className="flex items-center gap-2 cursor-pointer">
                                Mood Status
                              </Label>
                              <Switch
                                id={`${member.id}-mood`}
                                checked={member.permissions.canViewMood}
                                onCheckedChange={(checked) =>
                                  handleUpdatePermission(member.id, "canViewMood", checked)
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notification Frequency
                          </h4>
                          <div className="space-y-2">
                            {["daily", "weekly", "milestone", "none"].map((freq) => (
                              <div
                                key={freq}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                  member.permissions.notificationFrequency === freq
                                    ? "border-primary bg-primary/10"
                                    : "hover:bg-muted/50"
                                }`}
                                onClick={() =>
                                  handleUpdatePermission(member.id, "notificationFrequency", freq)
                                }
                              >
                                <div className="flex items-center gap-2">
                                  {member.permissions.notificationFrequency === freq && (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  )}
                                  <span className="font-medium capitalize">{freq}</span>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">
                                  {freq === "daily" && "Daily progress summary"}
                                  {freq === "weekly" && "Weekly summary report"}
                                  {freq === "milestone" && "Only milestone achievements"}
                                  {freq === "none" && "No notifications"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notification History Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Notifications sent to your family members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationHistory.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {notification.recipient} • {notification.sentAt}
                      </p>
                    </div>
                    <Badge
                      variant={notification.status === "read" ? "success" : "secondary"}
                    >
                      {notification.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
