import Link from "next/link";
import {
  Heart,
  Shield,
  Bell,
  Activity,
  Users,
  Bot,
  CheckCircle,
  ArrowRight,
  Pill,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: Activity,
    title: "Recovery Progress Tracking",
    description:
      "Track your daily progress with pain scores, medication adherence, and exercise consistency. See your recovery trend over time.",
  },
  {
    icon: Pill,
    title: "Medication Reminders",
    description:
      "Never miss a dose with smart medication reminders. Track your medicine schedule and adherence rates.",
  },
  {
    icon: Dumbbell,
    title: "Exercise Guidance",
    description:
      "Follow your prescribed exercises with clear instructions and track your completion. Stay active in your recovery.",
  },
  {
    icon: Bot,
    title: "AI Recovery Assistant",
    description:
      "Get answers to your recovery questions, emotional support, and helpful tips from our safe AI assistant.",
  },
  {
    icon: Users,
    title: "Family Progress Updates",
    description:
      "Keep your loved ones informed with controlled progress updates. You decide what they see.",
  },
  {
    icon: Shield,
    title: "Privacy-First Design",
    description:
      "Your health data is encrypted and protected. We follow DPDP Act principles with explicit consent management.",
  },
];

const benefits = [
  "Track medicine, exercise, hydration, and meals",
  "Get timely reminders to stay on schedule",
  "Share progress with family & friends",
  "Safe AI assistant for recovery questions",
  "Visual progress tracking and milestones",
  "Privacy-compliant data handling",
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Heart className="h-4 w-4" />
                  Recovery Companion
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Your Recovery,{" "}
                  <span className="text-primary">Supported</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  QR-Health helps you track your post-surgery recovery with medication
                  reminders, exercise guidance, progress tracking, and family updates.
                  Recover with confidence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/auth/signup">
                      Start Your Recovery
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Free to use • No credit card required • Privacy-first
                </p>
              </div>
              
              {/* Hero Image/Card */}
              <div className="relative">
                <Card className="shadow-2xl">
                  <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Today&apos;s Progress
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Day 14 of Recovery
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Medications</span>
                        <span className="text-sm text-green-600 font-medium">3/3 ✓</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-full bg-green-500 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Exercises</span>
                        <span className="text-sm text-amber-600 font-medium">1/2</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-amber-500 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pain Level</span>
                        <span className="text-sm text-primary font-medium">3/10 (Mild)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[30%] bg-primary rounded-full" />
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Recovery On Track! 🎉</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Everything You Need for Recovery
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                QR-Health provides comprehensive tools to support your post-surgery
                recovery journey. Education, reminders, tracking, and emotional support
                - all in one place.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Why Choose QR-Health?
                </h2>
                <p className="text-muted-foreground mb-8">
                  We designed QR-Health as a &quot;Recovery Companion&quot; - not a medical
                  decision engine. We focus on education, reminders, progress tracking,
                  warnings, and emotional support while keeping your data safe and private.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <Card className="shadow-xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Bell className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">Medication Reminder</p>
                          <p className="text-xs text-muted-foreground">
                            Time to take Paracetamol 500mg
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Dumbbell className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">Exercise Reminder</p>
                          <p className="text-xs text-muted-foreground">
                            Gentle ankle rotation exercises in 30 min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Users className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-sm">Family Update Sent</p>
                          <p className="text-xs text-muted-foreground">
                            Daily progress shared with Jane (Mom)
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Start Your Recovery Journey Today
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of patients who are recovering smarter with QR-Health.
              Free to use, privacy-first, and designed with care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
