"use client";

import {
  Activity,
  Heart,
  Pill,
  Dumbbell,
  Smile,
  TrendingUp,
  Calendar,
  Bell,
  Trophy,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/lib/store/auth";

// Demo data for family view
const patientData = {
  patientName: "John Smith",
  relationship: "Son",
  daysSinceSurgery: 14,
  todayCompletion: 75,
  medicinesTaken: true,
  exercisesDone: false,
  currentMood: "good" as const,
  lastUpdated: "2 hours ago",
  recoveryScore: 78,
  recoveryTrend: "improving",
  milestones: [
    { id: "1", title: "2 Week Mark", achievedAt: "Today", type: "recovery" },
    { id: "2", title: "Pain Below 5", achievedAt: "Yesterday", type: "recovery" },
    { id: "3", title: "90% Med Adherence", achievedAt: "3 days ago", type: "adherence" },
    { id: "4", title: "5-Day Streak", achievedAt: "5 days ago", type: "streak" },
  ],
  weeklyProgress: [
    { day: "Mon", score: 65 },
    { day: "Tue", score: 70 },
    { day: "Wed", score: 68 },
    { day: "Thu", score: 75 },
    { day: "Fri", score: 72 },
    { day: "Sat", score: 78 },
    { day: "Sun", score: 78 },
  ],
};

const moodEmoji = {
  great: "😊",
  good: "🙂",
  ok: "😐",
  pain: "😣",
  struggling: "😔",
};

const moodColors = {
  great: "text-green-500",
  good: "text-green-400",
  ok: "text-yellow-500",
  pain: "text-orange-500",
  struggling: "text-red-500",
};

export default function FamilyDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            {patientData.patientName}&apos;s Recovery
          </h1>
          <p className="text-muted-foreground">
            Day {patientData.daysSinceSurgery} of recovery • Last updated: {patientData.lastUpdated}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Eye className="h-4 w-4 mr-2" />
          View Only Access
        </Badge>
      </div>

      {/* Recovery Overview Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">Recovery Score</h2>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <Badge variant="success">Improving</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary">{patientData.recoveryScore}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {patientData.patientName} is making great progress! 🎉
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Day
                </div>
                <div className="text-2xl font-bold">{patientData.daysSinceSurgery}</div>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Activity className="h-4 w-4" />
                  Today
                </div>
                <div className="text-2xl font-bold">{patientData.todayCompletion}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                patientData.medicinesTaken ? "bg-green-100" : "bg-yellow-100"
              }`}>
                <Pill className={`h-6 w-6 ${
                  patientData.medicinesTaken ? "text-green-600" : "text-yellow-600"
                }`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medications</p>
                <p className="font-semibold">
                  {patientData.medicinesTaken ? "On Track ✓" : "Pending"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                patientData.exercisesDone ? "bg-green-100" : "bg-yellow-100"
              }`}>
                <Dumbbell className={`h-6 w-6 ${
                  patientData.exercisesDone ? "text-green-600" : "text-yellow-600"
                }`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exercises</p>
                <p className="font-semibold">
                  {patientData.exercisesDone ? "Done ✓" : "In Progress"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Smile className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mood</p>
                <p className={`font-semibold flex items-center gap-1 ${moodColors[patientData.currentMood]}`}>
                  {moodEmoji[patientData.currentMood]} {patientData.currentMood.charAt(0).toUpperCase() + patientData.currentMood.slice(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <p className="font-semibold text-green-600">Improving!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress & Milestones */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              This Week&apos;s Progress
            </CardTitle>
            <CardDescription>Daily recovery completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patientData.weeklyProgress.map((day, index) => (
                <div key={day.day} className="flex items-center gap-3">
                  <span className="w-10 text-sm text-muted-foreground">{day.day}</span>
                  <Progress value={day.score} className="flex-1 h-3" />
                  <span className="w-10 text-sm font-medium text-right">{day.score}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Milestones
            </CardTitle>
            <CardDescription>Achievements in recovery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patientData.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">{milestone.achievedAt}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {milestone.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Note */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">About This View</p>
              <p className="text-sm text-muted-foreground">
                This is a read-only view of {patientData.patientName}&apos;s recovery progress.
                You can see their daily completion, mood, and milestones based on the permissions
                they&apos;ve granted you. For any concerns about their health, please contact them
                or their healthcare provider directly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
