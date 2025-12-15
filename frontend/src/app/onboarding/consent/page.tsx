"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, AlertTriangle, Lock, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ConsentItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
}

const consentItems: ConsentItem[] = [
  {
    id: "not-medical-advice",
    label: "I understand this is not medical advice",
    description: "QR-Health is a recovery companion tool, not a medical diagnosis or treatment service. Always consult your healthcare provider for medical decisions.",
    required: true,
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  },
  {
    id: "data-storage",
    label: "I consent to store my recovery data",
    description: "Your recovery data (progress, medications, exercises) will be stored securely to help track your journey. Data is encrypted and protected.",
    required: true,
    icon: <Lock className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "data-deletion",
    label: "I can delete my data anytime",
    description: "You have full control over your data. You can export or permanently delete all your data at any time from the Settings page.",
    required: true,
    icon: <Trash2 className="h-5 w-5 text-red-500" />,
  },
  {
    id: "analytics",
    label: "Allow anonymized analytics (optional)",
    description: "Help us improve QR-Health by sharing anonymized usage data. No personal or health information is shared.",
    required: false,
    icon: <Shield className="h-5 w-5 text-green-500" />,
  },
];

export default function ConsentPage() {
  const router = useRouter();
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConsentChange = (id: string, checked: boolean) => {
    setConsents((prev) => ({ ...prev, [id]: checked }));
  };

  const allRequiredConsented = consentItems
    .filter((item) => item.required)
    .every((item) => consents[item.id]);

  const handleContinue = async () => {
    if (!allRequiredConsented) return;

    setIsSubmitting(true);
    
    // Save consent to localStorage/backend
    const consentData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      consents: consents,
    };
    localStorage.setItem("qr-health-consent", JSON.stringify(consentData));
    
    // Navigate to recovery setup
    router.push("/onboarding/recovery-setup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Consent & Disclaimer</CardTitle>
          <CardDescription className="text-base">
            Before we begin, please review and accept the following terms to use QR-Health safely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Important Notice */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">Important Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  QR-Health is designed to support your recovery journey with reminders, tracking, and educational content. 
                  It is <strong>not</strong> a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Items */}
          <div className="space-y-4">
            {consentItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border p-4 transition-colors ${
                  consents[item.id] ? "bg-primary/5 border-primary/30" : "bg-background"
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    id={item.id}
                    checked={consents[item.id] || false}
                    onCheckedChange={(checked) => handleConsentChange(item.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={item.id}
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      {item.icon}
                      {item.label}
                      {item.required && (
                        <span className="text-xs text-red-500 font-normal">(Required)</span>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DPDP Compliance Notice */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">DPDP Act Compliance</h4>
                <p className="text-sm text-blue-700 mt-1">
                  QR-Health follows Digital Personal Data Protection Act principles. Your data is encrypted, 
                  you have full control, and we never share your personal health information without explicit consent.
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!allRequiredConsented || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Processing..." : "Accept & Continue"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
