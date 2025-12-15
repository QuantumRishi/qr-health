"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Heart, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const recoveryTypes = [
  { id: "bone", label: "Bone Fracture", emoji: "🦴", description: "Bone fracture or orthopedic surgery recovery" },
  { id: "surgery", label: "General Surgery", emoji: "🏥", description: "Post-surgical recovery and healing" },
  { id: "joint", label: "Joint Replacement", emoji: "🦵", description: "Hip, knee, or other joint replacement" },
  { id: "cardiac", label: "Cardiac Procedure", emoji: "❤️", description: "Heart surgery or cardiac intervention" },
  { id: "injury", label: "Sports Injury", emoji: "⚽", description: "Sports-related injury recovery" },
  { id: "other", label: "Other", emoji: "📋", description: "Other type of recovery" },
];

export default function RecoverySetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    recoveryStartDate: new Date().toISOString().split("T")[0],
    recoveryType: "",
    doctorInstructions: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (typeId: string) => {
    setFormData((prev) => ({ ...prev, recoveryType: typeId }));
  };

  const handleContinue = async () => {
    if (!formData.recoveryType || !formData.recoveryStartDate) return;

    setIsSubmitting(true);
    
    // Save recovery profile to localStorage/backend
    const recoveryProfile = {
      startDate: formData.recoveryStartDate,
      type: formData.recoveryType,
      doctorInstructions: formData.doctorInstructions,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("qr-health-recovery-profile", JSON.stringify(recoveryProfile));
    
    // Navigate to reminder preferences
    router.push("/onboarding/reminder-preferences");
  };

  const isFormValid = formData.recoveryType && formData.recoveryStartDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Recovery Setup</CardTitle>
          <CardDescription className="text-base">
            Tell us about your recovery so we can personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recovery Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Recovery Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.recoveryStartDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, recoveryStartDate: e.target.value }))
              }
              max={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              When did your recovery begin? (Surgery date, injury date, etc.)
            </p>
          </div>

          {/* Recovery Type */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Recovery Type
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {recoveryTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
                    formData.recoveryType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="text-2xl mb-2">{type.emoji}</div>
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Instructions (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="instructions" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Doctor Instructions (Optional)
            </Label>
            <Textarea
              id="instructions"
              placeholder="Enter any specific instructions from your doctor..."
              value={formData.doctorInstructions}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, doctorInstructions: e.target.value }))
              }
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              You can add any notes or instructions your healthcare provider gave you.
            </p>
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
              onClick={handleContinue}
              disabled={!isFormValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2">
            <div className="h-2 w-8 rounded-full bg-primary" />
            <div className="h-2 w-8 rounded-full bg-primary" />
            <div className="h-2 w-8 rounded-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
