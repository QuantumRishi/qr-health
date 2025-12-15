"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  X, 
  Pill, 
  Dumbbell, 
  Droplet,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Demo notification data
const demoNotifications: Record<string, {
  id: string;
  type: "medication" | "exercise" | "hydration" | "missed";
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}> = {
  "reminder-1": {
    id: "reminder-1",
    type: "medication",
    title: "Paracetamol 500mg",
    description: "Time to take your pain medication",
    time: "2:00 PM",
    icon: <Pill className="h-6 w-6" />,
    color: "bg-blue-100 text-blue-600",
  },
  "reminder-2": {
    id: "reminder-2",
    type: "exercise",
    title: "Ankle Rotation",
    description: "Gentle mobility exercise scheduled",
    time: "4:00 PM",
    icon: <Dumbbell className="h-6 w-6" />,
    color: "bg-green-100 text-green-600",
  },
  "reminder-3": {
    id: "reminder-3",
    type: "hydration",
    title: "Drink Water",
    description: "Stay hydrated for better recovery",
    time: "3:00 PM",
    icon: <Droplet className="h-6 w-6" />,
    color: "bg-cyan-100 text-cyan-600",
  },
  "missed-1": {
    id: "missed-1",
    type: "missed",
    title: "Vitamin D (Missed)",
    description: "You missed this medication earlier",
    time: "8:00 AM",
    icon: <AlertCircle className="h-6 w-6" />,
    color: "bg-red-100 text-red-600",
  },
};

function QuickActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notificationId = searchParams.get("id") || "reminder-1";
  
  const notification = demoNotifications[notificationId] || demoNotifications["reminder-1"];
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<"done" | "skip" | "snooze" | null>(null);

  const handleAction = async (actionType: "done" | "skip" | "snooze") => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Save action to localStorage
    const actionLog = JSON.parse(localStorage.getItem("qr-health-quick-actions") || "[]");
    actionLog.push({
      notificationId: notification.id,
      notificationTitle: notification.title,
      action: actionType,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("qr-health-quick-actions", JSON.stringify(actionLog));
    
    setAction(actionType);
    setIsProcessing(false);
  };

  if (action) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6">
            <div className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${
              action === "done" ? "bg-green-100" : action === "snooze" ? "bg-amber-100" : "bg-gray-100"
            }`}>
              {action === "done" && <CheckCircle className="h-8 w-8 text-green-600" />}
              {action === "snooze" && <Clock className="h-8 w-8 text-amber-600" />}
              {action === "skip" && <X className="h-8 w-8 text-gray-600" />}
            </div>
            <h2 className="text-xl font-bold mb-2">
              {action === "done" && "Marked as Done! ✅"}
              {action === "snooze" && "Snoozed for 15 min ⏰"}
              {action === "skip" && "Skipped"}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {notification.title}
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-2">
            <Bell className="h-4 w-4" />
            {notification.type === "missed" ? "Missed Task" : "Reminder"}
          </div>
          <div className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${notification.color}`}>
            {notification.icon}
          </div>
          <CardTitle className="text-xl">{notification.title}</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">{notification.description}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2">
            <Clock className="h-3 w-3" />
            Scheduled for {notification.time}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick Actions */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => handleAction("done")}
            disabled={isProcessing}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Done
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleAction("snooze")}
              disabled={isProcessing}
            >
              <Clock className="h-4 w-4 mr-2" />
              Snooze
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAction("skip")}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              Skip
            </Button>
          </div>

          {/* View Details Link */}
          <Button 
            variant="link" 
            className="w-full text-sm"
            onClick={() => router.push(`/task?id=${notification.id}`)}
          >
            View Details →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function QuickActionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <QuickActionContent />
    </Suspense>
  );
}
