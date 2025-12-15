"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Pill, Dumbbell, UtensilsCrossed, Droplet, Clock, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReminderCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultEnabled: boolean;
  defaultFrequency: string;
  defaultTime: string;
}

const reminderCategories: ReminderCategory[] = [
  {
    id: "medicines",
    label: "Medicine Reminders",
    description: "Get notified when it's time to take your medications",
    icon: <Pill className="h-5 w-5 text-blue-500" />,
    defaultEnabled: true,
    defaultFrequency: "as-scheduled",
    defaultTime: "08:00",
  },
  {
    id: "exercises",
    label: "Exercise Reminders",
    description: "Stay on track with your prescribed exercises",
    icon: <Dumbbell className="h-5 w-5 text-green-500" />,
    defaultEnabled: true,
    defaultFrequency: "daily",
    defaultTime: "10:00",
  },
  {
    id: "meals",
    label: "Meal Reminders",
    description: "Remember to eat nutritious meals for recovery",
    icon: <UtensilsCrossed className="h-5 w-5 text-orange-500" />,
    defaultEnabled: true,
    defaultFrequency: "3x-daily",
    defaultTime: "12:00",
  },
  {
    id: "hydration",
    label: "Hydration Reminders",
    description: "Stay hydrated throughout the day",
    icon: <Droplet className="h-5 w-5 text-cyan-500" />,
    defaultEnabled: true,
    defaultFrequency: "every-2-hours",
    defaultTime: "09:00",
  },
];

const frequencyOptions: Record<string, { label: string; value: string }[]> = {
  medicines: [
    { label: "As Scheduled", value: "as-scheduled" },
    { label: "Every 4 hours", value: "4-hours" },
    { label: "Every 6 hours", value: "6-hours" },
    { label: "Every 8 hours", value: "8-hours" },
  ],
  exercises: [
    { label: "Once Daily", value: "daily" },
    { label: "Twice Daily", value: "2x-daily" },
    { label: "Three Times Daily", value: "3x-daily" },
  ],
  meals: [
    { label: "3 Times Daily", value: "3x-daily" },
    { label: "5 Small Meals", value: "5x-daily" },
  ],
  hydration: [
    { label: "Every Hour", value: "every-hour" },
    { label: "Every 2 Hours", value: "every-2-hours" },
    { label: "Every 3 Hours", value: "every-3-hours" },
  ],
};

export default function ReminderPreferencesPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Record<string, { enabled: boolean; frequency: string; time: string }>>(
    reminderCategories.reduce(
      (acc, cat) => ({
        ...acc,
        [cat.id]: {
          enabled: cat.defaultEnabled,
          frequency: cat.defaultFrequency,
          time: cat.defaultTime,
        },
      }),
      {}
    )
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = (id: string, enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled },
    }));
  };

  const handleFrequencyChange = (id: string, frequency: string) => {
    setPreferences((prev) => ({
      ...prev,
      [id]: { ...prev[id], frequency },
    }));
  };

  const handleTimeChange = (id: string, time: string) => {
    setPreferences((prev) => ({
      ...prev,
      [id]: { ...prev[id], time },
    }));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    // Save preferences to localStorage/backend
    const reminderData = {
      preferences,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("qr-health-reminder-preferences", JSON.stringify(reminderData));
    
    // Mark onboarding as complete
    localStorage.setItem("qr-health-onboarding-complete", "true");
    
    // Navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Reminder Preferences</CardTitle>
          <CardDescription className="text-base">
            Choose what reminders you would like to receive to stay on track with your recovery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reminder Categories */}
          <div className="space-y-4">
            {reminderCategories.map((category) => (
              <div
                key={category.id}
                className={`rounded-lg border p-4 transition-colors ${
                  preferences[category.id]?.enabled ? "bg-primary/5 border-primary/30" : "bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{category.icon}</div>
                    <div>
                      <Label className="font-medium">{category.label}</Label>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[category.id]?.enabled || false}
                    onCheckedChange={(checked) => handleToggle(category.id, checked)}
                  />
                </div>

                {/* Expanded Settings when enabled */}
                {preferences[category.id]?.enabled && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Frequency
                      </Label>
                      <select
                        value={preferences[category.id]?.frequency}
                        onChange={(e) => handleFrequencyChange(category.id, e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {frequencyOptions[category.id]?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Start Time
                      </Label>
                      <Input
                        type="time"
                        value={preferences[category.id]?.time}
                        onChange={(e) => handleTimeChange(category.id, e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notification Permission Notice */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Enable Notifications</h4>
                <p className="text-sm text-blue-700 mt-1">
                  To receive reminders, please allow notifications when prompted. You can change this anytime in Settings.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Setting up..." : "Finish Setup"}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2">
            <div className="h-2 w-8 rounded-full bg-primary" />
            <div className="h-2 w-8 rounded-full bg-primary" />
            <div className="h-2 w-8 rounded-full bg-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
