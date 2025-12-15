"use client";

import { useState } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Demo recovery data
const recoveryHistory = [
  { date: "2024-12-15", dayCount: 14, painScore: 3, mood: "good", recoveryScore: 78, trend: "improving" },
  { date: "2024-12-14", dayCount: 13, painScore: 4, mood: "ok", recoveryScore: 74, trend: "stable" },
  { date: "2024-12-13", dayCount: 12, painScore: 4, mood: "ok", recoveryScore: 72, trend: "stable" },
  { date: "2024-12-12", dayCount: 11, painScore: 5, mood: "pain", recoveryScore: 68, trend: "warning" },
  { date: "2024-12-11", dayCount: 10, painScore: 5, mood: "ok", recoveryScore: 65, trend: "stable" },
  { date: "2024-12-10", dayCount: 9, painScore: 6, mood: "pain", recoveryScore: 60, trend: "warning" },
  { date: "2024-12-09", dayCount: 8, painScore: 6, mood: "struggling", recoveryScore: 55, trend: "warning" },
];

const moodOptions = [
  { value: "great", label: "Great", icon: Smile, color: "text-green-500" },
  { value: "good", label: "Good", icon: Smile, color: "text-green-400" },
  { value: "ok", label: "OK", icon: Meh, color: "text-yellow-500" },
  { value: "pain", label: "In Pain", icon: Frown, color: "text-orange-500" },
  { value: "struggling", label: "Struggling", icon: Frown, color: "text-red-500" },
];

const swellingOptions = [
  { value: "none", label: "None" },
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "improving") {
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  }
  if (trend === "warning") {
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  }
  return <Minus className="h-4 w-4 text-yellow-500" />;
}

export default function RecoveryPage() {
  const [painScore, setPainScore] = useState(3);
  const [mood, setMood] = useState("good");
  const [swelling, setSwelling] = useState("mild");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Recovery Progress
          </h1>
          <p className="text-muted-foreground">
            Track your daily recovery and view your progress over time
          </p>
        </div>
      </div>

      <Tabs defaultValue="log" className="space-y-6">
        <TabsList>
          <TabsTrigger value="log">Daily Log</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Daily Log Tab */}
        <TabsContent value="log" className="space-y-6">
          {showSuccess && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Today&apos;s progress has been saved successfully!
                </span>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pain Score */}
            <Card>
              <CardHeader>
                <CardTitle>Pain Level</CardTitle>
                <CardDescription>
                  Rate your current pain level from 0 (no pain) to 10 (severe pain)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-5xl font-bold text-primary">{painScore}</span>
                    <span className="text-2xl text-muted-foreground">/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painScore}
                    onChange={(e) => setPainScore(parseInt(e.target.value))}
                    className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No Pain</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                  {painScore >= 7 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        High pain level. Please consult your doctor if this persists.
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mood */}
            <Card>
              <CardHeader>
                <CardTitle>How are you feeling?</CardTitle>
                <CardDescription>
                  Select your current emotional state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setMood(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          mood === option.value
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${option.color}`} />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Swelling Status */}
            <Card>
              <CardHeader>
                <CardTitle>Swelling Status</CardTitle>
                <CardDescription>
                  How is your swelling today?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {swellingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSwelling(option.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        swelling === option.value
                          ? "border-primary bg-primary/10"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Any additional notes about your recovery today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How was your day? Any concerns or improvements?"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? "Saving..." : "Save Today's Progress"}
            </Button>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recovery History
              </CardTitle>
              <CardDescription>Your daily recovery progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recoveryHistory.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold text-primary">
                        {day.dayCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Day</div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Pain</Label>
                        <div className="font-medium">{day.painScore}/10</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Mood</Label>
                        <div className="font-medium capitalize">{day.mood}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Score</Label>
                        <div className="font-medium">{day.recoveryScore}%</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Trend</Label>
                        <div className="flex items-center gap-1">
                          <TrendIcon trend={day.trend} />
                          <span className="text-sm capitalize">{day.trend}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Pain</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">4.7</div>
                <Progress value={47} className="h-2 mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Down from 5.2 last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recovery Trend</CardTitle>
                <CardDescription>Overall direction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <span className="text-3xl font-bold text-green-500">Improving</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your recovery is on track!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Milestones</CardTitle>
                <CardDescription>Achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="success" className="mr-2">2 Week Mark 🎉</Badge>
                  <Badge variant="secondary" className="mr-2">Pain Below 5</Badge>
                  <Badge variant="secondary">90% Adherence</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recovery Tips</CardTitle>
              <CardDescription>Personalized suggestions based on your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Great progress on medication adherence!</p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ve been consistent with your medications. Keep it up!
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Consider more gentle exercises</p>
                    <p className="text-sm text-muted-foreground">
                      Your exercise completion rate could improve. Try shorter sessions more frequently.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Pain levels are improving</p>
                    <p className="text-sm text-muted-foreground">
                      Your average pain score has decreased over the past week. You&apos;re healing well!
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
