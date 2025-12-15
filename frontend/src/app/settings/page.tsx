"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Trash2,
  Download,
  Moon,
  Sun,
  Smartphone,
  Mail,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/lib/store/auth";

// AlertDialog components inline since we haven't created them
const AlertDialogComponent = ({
  trigger,
  title,
  description,
  confirmText,
  onConfirm,
  destructive,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  destructive?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState({
    medications: true,
    exercises: true,
    hydration: true,
    meals: false,
    dailySummary: true,
    weeklySummary: true,
  });
  const [privacy, setPrivacy] = useState({
    dataProcessing: true,
    analytics: false,
    familySharing: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  const handleDeleteAccount = () => {
    // In real app, this would call an API to delete the account
    logout();
    window.location.href = "/";
  };

  const handleExportData = () => {
    // In real app, this would trigger a data export
    const data = {
      user,
      exportedAt: new Date().toISOString(),
      message: "This is a demo export. In production, all your data would be included.",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-health-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account, notifications, and privacy settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Reminder Notifications
              </CardTitle>
              <CardDescription>
                Choose which reminders you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "medications", label: "Medication Reminders", desc: "Reminders to take your medications" },
                { key: "exercises", label: "Exercise Reminders", desc: "Reminders for scheduled exercises" },
                { key: "hydration", label: "Hydration Reminders", desc: "Reminders to drink water" },
                { key: "meals", label: "Meal Reminders", desc: "Reminders for meal times" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor={item.key}>{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.key}
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [item.key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary Reports</CardTitle>
              <CardDescription>Receive progress summaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="dailySummary">Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily progress report
                  </p>
                </div>
                <Switch
                  id="dailySummary"
                  checked={notifications.dailySummary}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, dailySummary: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="weeklySummary">Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly progress report
                  </p>
                </div>
                <Switch
                  id="weeklySummary"
                  checked={notifications.weeklySummary}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklySummary: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Manage your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="dataProcessing">Data Processing Consent</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow processing of health data for recovery tracking
                  </p>
                </div>
                <Switch
                  id="dataProcessing"
                  checked={privacy.dataProcessing}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, dataProcessing: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="analytics">Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve QR-Health with anonymous usage data
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={privacy.analytics}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, analytics: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="familySharing">Family Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing progress with approved family members
                  </p>
                </div>
                <Switch
                  id="familySharing"
                  checked={privacy.familySharing}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, familySharing: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Data</CardTitle>
              <CardDescription>
                Export or delete your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in JSON format
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <AlertDialogComponent
                  trigger={
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  }
                  title="Delete Account?"
                  description="This action cannot be undone. All your data will be permanently deleted including your recovery history, medications, exercises, and all personal information."
                  confirmText="Yes, Delete My Account"
                  onConfirm={handleDeleteAccount}
                  destructive
                />
              </div>
            </CardContent>
          </Card>

          {/* DPDP Compliance Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Your Privacy Rights (DPDP Act)</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Under India&apos;s Digital Personal Data Protection Act, you have the right to:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Delete your data</li>
                    <li>Withdraw consent at any time</li>
                    <li>Lodge grievances about data handling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
