"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, User, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore, DEMO_USERS } from "@/lib/store/auth";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState<"details" | "otp" | "consent">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otp: "",
    consentDataProcessing: false,
    consentNotifications: false,
  });

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStep("otp");
    setIsLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStep("consent");
    setIsLoading(false);
  };

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.consentDataProcessing) {
      setError("You must agree to data processing to continue");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create user with demo data but use form name and email
    const newUser = {
      ...DEMO_USERS.patient,
      name: formData.name,
      email: formData.email,
      consentGiven: true,
      consentDate: new Date().toISOString(),
    };

    setUser(newUser);
    
    // Redirect to consent page first for proper DPDP compliance flow
    router.push("/onboarding/consent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Heart className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">QR-Health</span>
          </Link>
          <p className="text-muted-foreground mt-2">Start your recovery journey</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {["Details", "Verify", "Consent"].map((label, index) => {
            const stepIndex = ["details", "otp", "consent"].indexOf(step);
            const isCompleted = index < stepIndex;
            const isCurrent = index === stepIndex;
            return (
              <div key={label} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    isCurrent ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {index < 2 && (
                  <div className="w-8 h-px bg-border mx-3" />
                )}
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === "details" && "Create Account"}
              {step === "otp" && "Verify Email"}
              {step === "consent" && "Privacy Consent"}
            </CardTitle>
            <CardDescription>
              {step === "details" && "Enter your details to get started"}
              {step === "otp" && "Enter the OTP sent to your email"}
              {step === "consent" && "Review and accept our privacy terms"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "details" && (
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData({ ...formData, otp: e.target.value })
                    }
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    OTP sent to {formData.email}
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("details")}
                >
                  Change email
                </Button>
              </form>
            )}

            {step === "consent" && (
              <form onSubmit={handleConsentSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="consent-data"
                      checked={formData.consentDataProcessing}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          consentDataProcessing: checked as boolean,
                        })
                      }
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="consent-data"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Data Processing Consent *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        I agree to the processing of my health data for recovery
                        tracking purposes. My data will be encrypted and I can
                        request deletion at any time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="consent-notifications"
                      checked={formData.consentNotifications}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          consentNotifications: checked as boolean,
                        })
                      }
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="consent-notifications"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Notification Consent (Optional)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        I agree to receive reminders for medications, exercises,
                        and other recovery activities via push notifications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Your Rights</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>✓ Access and download your data anytime</li>
                    <li>✓ Request deletion of all your data</li>
                    <li>✓ Withdraw consent at any time</li>
                    <li>✓ Control who sees your progress</li>
                  </ul>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Privacy Notice */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
