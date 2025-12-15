"use client";

import { 
  Activity, 
  Pill, 
  Dumbbell, 
  Droplet, 
  UtensilsCrossed, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Bot,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth";
import Link from "next/link";

// Demo data
const dashboardData = {
  daysSinceSurgery: 14,
  recoveryScore: 78,
  recoveryTrend: "improving" as const,
  todayProgress: {
    medications: { completed: 2, total: 3 },
    exercises: { completed: 1, total: 2 },
    hydration: { completed: 6, target: 8 },
    meals: { completed: 2, total: 3 },
  },
  weeklyProgress: {
    medicineAdherence: 92,
    exerciseConsistency: 75,
    averagePainScore: 3.2,
  },
  upcomingReminders: [
    { id: "1", type: "medication", title: "Paracetamol 500mg", time: "2:00 PM", icon: Pill },
    { id: "2", type: "exercise", title: "Ankle Rotation", time: "4:00 PM", icon: Dumbbell },
    { id: "3", type: "hydration", title: "Drink Water", time: "3:00 PM", icon: Droplet },
  ],
  recentActivity: [
    { id: "1", action: "Took medication", item: "Ibuprofen 400mg", time: "10:00 AM", status: "completed" },
    { id: "2", action: "Completed exercise", item: "Leg Raises", time: "9:00 AM", status: "completed" },
    { id: "3", action: "Missed medication", item: "Vitamin D", time: "8:00 AM", status: "missed" },
  ],
};

function TrendIcon({ trend }: { trend: "improving" | "stable" | "warning" }) {
  if (trend === "improving") {
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  }
  if (trend === "warning") {
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  }
  return <Minus className="h-4 w-4 text-yellow-500" />;
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0] || "Patient"}!
          </h1>
          <p className="text-muted-foreground">
            Day {dashboardData.daysSinceSurgery} of your recovery journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/ai-assistant">
              <Bot className="h-4 w-4 mr-2" />
              Ask AI Assistant
            </Link>
          </Button>
          <Button asChild>
            <Link href="/recovery">
              <Activity className="h-4 w-4 mr-2" />
              Log Progress
            </Link>
          </Button>
        </div>
      </div>

      {/* Recovery Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">Recovery Score</h2>
                <TrendIcon trend={dashboardData.recoveryTrend} />
                <Badge variant={dashboardData.recoveryTrend === "improving" ? "success" : dashboardData.recoveryTrend === "warning" ? "destructive" : "secondary"}>
                  {dashboardData.recoveryTrend}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary">{dashboardData.recoveryScore}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                You&apos;re doing great! Keep following your recovery plan.
              </p>
            </div>
            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Medicine Adherence</span>
                    <span className="font-medium">{dashboardData.weeklyProgress.medicineAdherence}%</span>
                  </div>
                  <Progress value={dashboardData.weeklyProgress.medicineAdherence} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Exercise Consistency</span>
                    <span className="font-medium">{dashboardData.weeklyProgress.exerciseConsistency}%</span>
                  </div>
                  <Progress value={dashboardData.weeklyProgress.exerciseConsistency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Average Pain Level</span>
                    <span className="font-medium">{dashboardData.weeklyProgress.averagePainScore}/10</span>
                  </div>
                  <Progress value={dashboardData.weeklyProgress.averagePainScore * 10} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Pill className="h-4 w-4 text-blue-500" />
              Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.todayProgress.medications.completed}/{dashboardData.todayProgress.medications.total}
            </div>
            <Progress 
              value={(dashboardData.todayProgress.medications.completed / dashboardData.todayProgress.medications.total) * 100} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-green-500" />
              Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.todayProgress.exercises.completed}/{dashboardData.todayProgress.exercises.total}
            </div>
            <Progress 
              value={(dashboardData.todayProgress.exercises.completed / dashboardData.todayProgress.exercises.total) * 100} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplet className="h-4 w-4 text-cyan-500" />
              Hydration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.todayProgress.hydration.completed}/{dashboardData.todayProgress.hydration.target}
            </div>
            <Progress 
              value={(dashboardData.todayProgress.hydration.completed / dashboardData.todayProgress.hydration.target) * 100} 
              className="h-2 mt-2"
            />
            <span className="text-xs text-muted-foreground">glasses</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-orange-500" />
              Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.todayProgress.meals.completed}/{dashboardData.todayProgress.meals.total}
            </div>
            <Progress 
              value={(dashboardData.todayProgress.meals.completed / dashboardData.todayProgress.meals.total) * 100} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reminders & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Upcoming Reminders
            </CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcomingReminders.map((reminder) => {
                const Icon = reminder.icon;
                return (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {reminder.time}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Done
                    </Button>
                  </div>
                );
              })}
            </div>
            <Button variant="link" className="w-full mt-4" asChild>
              <Link href="/medications">View All Reminders →</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your activity history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    activity.status === "completed" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {activity.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.item} • {activity.time}
                    </p>
                  </div>
                  <Badge variant={activity.status === "completed" ? "success" : "destructive"}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4" asChild>
              <Link href="/recovery">View Full History →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/medications">
                <Pill className="h-6 w-6" />
                <span>Log Medication</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/exercises">
                <Dumbbell className="h-6 w-6" />
                <span>Log Exercise</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/recovery">
                <Activity className="h-6 w-6" />
                <span>Update Pain Level</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/ai-assistant">
                <Bot className="h-6 w-6" />
                <span>Ask AI</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
