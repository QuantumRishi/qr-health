"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Pill, 
  Dumbbell, 
  Droplet, 
  UtensilsCrossed, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Demo task data
const demoTasks: Record<string, {
  id: string;
  type: "medication" | "exercise" | "hydration" | "meal";
  title: string;
  description: string;
  instructions: string;
  time: string;
  icon: React.ReactNode;
}> = {
  "med-1": {
    id: "med-1",
    type: "medication",
    title: "Paracetamol 500mg",
    description: "Pain relief medication",
    instructions: "Take 1 tablet with water after food. Do not exceed 4 tablets in 24 hours.",
    time: "2:00 PM",
    icon: <Pill className="h-6 w-6 text-blue-500" />,
  },
  "ex-1": {
    id: "ex-1",
    type: "exercise",
    title: "Ankle Rotation",
    description: "Gentle mobility exercise",
    instructions: "Rotate your ankle slowly in circles. Do 10 rotations clockwise, then 10 counterclockwise. Stop if you feel sharp pain.",
    time: "4:00 PM",
    icon: <Dumbbell className="h-6 w-6 text-green-500" />,
  },
  "hyd-1": {
    id: "hyd-1",
    type: "hydration",
    title: "Drink Water",
    description: "Stay hydrated",
    instructions: "Drink at least one full glass (250ml) of water. Staying hydrated helps with recovery and medication absorption.",
    time: "3:00 PM",
    icon: <Droplet className="h-6 w-6 text-cyan-500" />,
  },
  "meal-1": {
    id: "meal-1",
    type: "meal",
    title: "Lunch",
    description: "Nutritious meal",
    instructions: "Have a balanced meal with protein (chicken, fish, or legumes), vegetables, and whole grains for optimal recovery.",
    time: "1:00 PM",
    icon: <UtensilsCrossed className="h-6 w-6 text-orange-500" />,
  },
};

const skipReasons = [
  "Forgot",
  "Felt unwell",
  "Ran out of supplies",
  "Doctor advised to skip",
  "Other reason",
];

function TaskDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id") || "med-1";
  
  const task = demoTasks[taskId] || demoTasks["med-1"];
  
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wasSkipped, setWasSkipped] = useState(false);

  const handleMarkDone = async () => {
    setIsCompleting(true);
    
    // Save completion to localStorage
    const completionLog = JSON.parse(localStorage.getItem("qr-health-task-log") || "[]");
    completionLog.push({
      taskId: task.id,
      taskTitle: task.title,
      type: task.type,
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem("qr-health-task-log", JSON.stringify(completionLog));
    
    setIsCompleting(false);
    setIsCompleted(true);
  };

  const handleSkip = async () => {
    const reason = skipReason === "Other reason" ? customReason : skipReason;
    if (!reason) return;
    
    // Save skip to localStorage
    const completionLog = JSON.parse(localStorage.getItem("qr-health-task-log") || "[]");
    completionLog.push({
      taskId: task.id,
      taskTitle: task.title,
      type: task.type,
      status: "skipped",
      skipReason: reason,
      skippedAt: new Date().toISOString(),
    });
    localStorage.setItem("qr-health-task-log", JSON.stringify(completionLog));
    
    setShowSkipDialog(false);
    setWasSkipped(true);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Task Completed! ✅</h2>
            <p className="text-muted-foreground mb-2">
              Great job completing <strong>{task.title}</strong>!
            </p>
            <p className="text-sm text-green-600 mb-6">
              Keep up the excellent work with your recovery!
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
              <Button className="flex-1" onClick={() => router.push("/medications")}>
                View All Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (wasSkipped) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Task Skipped</h2>
            <p className="text-muted-foreground mb-2">
              <strong>{task.title}</strong> has been marked as skipped.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              No worries! Try to complete it if possible, or talk to your healthcare provider if you have concerns.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
              <Button className="flex-1" onClick={() => { setWasSkipped(false); setSkipReason(""); }}>
                Mark as Done Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              {task.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{task.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4" />
                Scheduled for {task.time}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
            <p className="text-sm">{task.description}</p>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <h4 className="font-medium mb-2">Instructions</h4>
            <p className="text-sm text-muted-foreground">{task.instructions}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowSkipDialog(true)}
            >
              <X className="h-4 w-4 mr-2" />
              Skip
            </Button>
            <Button
              className="flex-1"
              onClick={handleMarkDone}
              disabled={isCompleting}
            >
              {isCompleting ? "Saving..." : "Mark Done"}
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Helpful Tip */}
          {task.type === "medication" && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> Taking medications at the same time each day helps maintain consistent levels in your body.
              </p>
            </div>
          )}
          {task.type === "exercise" && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-green-700">
                💡 <strong>Tip:</strong> Gentle movement helps with recovery. Stop immediately if you experience sharp pain.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skip Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Skip Task
            </DialogTitle>
            <DialogDescription>
              Please tell us why you&apos;re skipping this task. This helps us understand your recovery journey.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              {skipReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSkipReason(reason)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    skipReason === reason
                      ? "bg-primary/10 border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {skipReason === "Other reason" && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Please specify:</Label>
                <Textarea
                  id="customReason"
                  placeholder="Enter your reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSkipDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleSkip}
                disabled={!skipReason || (skipReason === "Other reason" && !customReason)}
              >
                Confirm Skip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TaskDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <TaskDetailContent />
    </Suspense>
  );
}
