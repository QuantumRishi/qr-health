"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Smile, Meh, Frown, Activity, Droplets, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/store/auth";

type Mood = "good" | "okay" | "pain";

interface MoodOption {
  value: Mood;
  label: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const moodOptions: MoodOption[] = [
  { value: "good", label: "Good", emoji: "😊", icon: Smile, color: "text-green-500 bg-green-100 border-green-300" },
  { value: "okay", label: "Okay", emoji: "😐", icon: Meh, color: "text-yellow-500 bg-yellow-100 border-yellow-300" },
  { value: "pain", label: "Pain", emoji: "😞", icon: Frown, color: "text-red-500 bg-red-100 border-red-300" },
];

export default function DailyCheckinPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    mood: "" as Mood | "",
    painScore: 5,
    hasSwelling: null as boolean | null,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    setFormData((prev) => ({ ...prev, mood }));
  };

  const handlePainChange = (score: number) => {
    setFormData((prev) => ({ ...prev, painScore: score }));
  };

  const handleSwellingChange = (hasSwelling: boolean) => {
    setFormData((prev) => ({ ...prev, hasSwelling }));
  };

  const handleSubmit = async () => {
    if (formData.mood === "" || formData.hasSwelling === null) return;

    setIsSubmitting(true);
    
    // Save check-in data
    const checkinData = {
      date: new Date().toISOString().split("T")[0],
      mood: formData.mood,
      painScore: formData.painScore,
      hasSwelling: formData.hasSwelling,
      notes: formData.notes,
      submittedAt: new Date().toISOString(),
    };
    
    // Store in localStorage (would be sent to backend in production)
    const existingCheckins = JSON.parse(localStorage.getItem("qr-health-checkins") || "[]");
    existingCheckins.push(checkinData);
    localStorage.setItem("qr-health-checkins", JSON.stringify(existingCheckins));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const getPainColor = (score: number) => {
    if (score <= 3) return "bg-green-500";
    if (score <= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const isFormValid = formData.mood !== "" && formData.hasSwelling !== null;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check-in Complete! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              Great job keeping track of your recovery. Your data has been saved.
            </p>
            
            {/* AI Encouragement Response (Screen 9) */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-left mb-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Recovery Assistant</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.mood === "good" && "That's wonderful to hear! You're making great progress. Keep up the excellent work with your recovery routine! 💪"}
                    {formData.mood === "okay" && "Thank you for checking in. Recovery has its ups and downs - that's completely normal. Remember, each day is a step forward. 🌟"}
                    {formData.mood === "pain" && "I'm sorry you're experiencing discomfort. Remember to take your medications as prescribed and rest when needed. If the pain persists or worsens, please contact your healthcare provider. 💙"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button className="flex-1" onClick={() => router.push("/ai-assistant")}>
                Talk to AI Assistant
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
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Daily Check-in</CardTitle>
          <CardDescription className="text-base">
            Hi {user?.name?.split(" ")[0] || "there"}! How are you feeling today?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div className="space-y-3">
            <Label>How is your mood today?</Label>
            <div className="grid grid-cols-3 gap-3">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMoodSelect(option.value)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    formData.mood === option.value
                      ? option.color + " border-current"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-medium text-sm">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pain Scale */}
          <div className="space-y-3">
            <Label>Pain level (1-10)</Label>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">No pain</span>
                <span className="text-2xl font-bold">{formData.painScore}</span>
                <span className="text-sm text-muted-foreground">Severe</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.painScore}
                  onChange={(e) => handlePainChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <span key={n} className="text-xs text-muted-foreground">{n}</span>
                  ))}
                </div>
              </div>
              <div className={`h-2 rounded-full ${getPainColor(formData.painScore)} mt-2`} style={{ width: `${formData.painScore * 10}%` }} />
            </div>
          </div>

          {/* Swelling */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-primary" />
              Any swelling today?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSwellingChange(true)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.hasSwelling === true
                    ? "bg-amber-100 border-amber-400 text-amber-700"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className="font-medium">Yes</span>
              </button>
              <button
                onClick={() => handleSwellingChange(false)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.hasSwelling === false
                    ? "bg-green-100 border-green-400 text-green-700"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className="font-medium">No</span>
              </button>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Anything else you want to note about today..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Check-in"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
