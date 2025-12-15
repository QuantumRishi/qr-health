"use client";

import { useState } from "react";
import {
  Pill,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  SkipForward,
  Bell,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Demo medications data
const medications = [
  {
    id: "1",
    name: "Paracetamol",
    dosage: "500mg",
    frequency: "twice_daily",
    times: ["08:00", "20:00"],
    instructions: "Take with food",
    isActive: true,
  },
  {
    id: "2",
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "three_times_daily",
    times: ["08:00", "14:00", "20:00"],
    instructions: "Take after meals",
    isActive: true,
  },
  {
    id: "3",
    name: "Vitamin D3",
    dosage: "1000 IU",
    frequency: "once_daily",
    times: ["09:00"],
    instructions: "Take with breakfast",
    isActive: true,
  },
  {
    id: "4",
    name: "Calcium",
    dosage: "500mg",
    frequency: "twice_daily",
    times: ["09:00", "21:00"],
    instructions: "Do not take with iron supplements",
    isActive: true,
  },
];

const todaySchedule = [
  { id: "1", medicationId: "1", medication: "Paracetamol 500mg", time: "08:00", status: "taken" },
  { id: "2", medicationId: "2", medication: "Ibuprofen 400mg", time: "08:00", status: "taken" },
  { id: "3", medicationId: "3", medication: "Vitamin D3 1000 IU", time: "09:00", status: "taken" },
  { id: "4", medicationId: "4", medication: "Calcium 500mg", time: "09:00", status: "missed" },
  { id: "5", medicationId: "2", medication: "Ibuprofen 400mg", time: "14:00", status: "pending" },
  { id: "6", medicationId: "1", medication: "Paracetamol 500mg", time: "20:00", status: "pending" },
  { id: "7", medicationId: "2", medication: "Ibuprofen 400mg", time: "20:00", status: "pending" },
  { id: "8", medicationId: "4", medication: "Calcium 500mg", time: "21:00", status: "pending" },
];

const frequencyLabels: Record<string, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_times_daily: "Three times daily",
  four_times_daily: "Four times daily",
  as_needed: "As needed",
  weekly: "Weekly",
};

export default function MedicationsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schedule, setSchedule] = useState(todaySchedule);

  const takenCount = schedule.filter((s) => s.status === "taken").length;
  const totalCount = schedule.length;
  const adherenceRate = Math.round((takenCount / totalCount) * 100);

  const handleStatusChange = (id: string, newStatus: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Pill className="h-8 w-8 text-primary" />
            Medications
          </h1>
          <p className="text-muted-foreground">
            Manage your medications and track adherence
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
              <DialogDescription>
                Add a new medication to your schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="med-name">Medication Name</Label>
                <Input id="med-name" placeholder="e.g., Paracetamol" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-dosage">Dosage</Label>
                <Input id="med-dosage" placeholder="e.g., 500mg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-time">Time</Label>
                <Input id="med-time" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-instructions">Instructions (Optional)</Label>
                <Input id="med-instructions" placeholder="e.g., Take with food" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Add Medication</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {takenCount}/{totalCount}
            </div>
            <Progress value={adherenceRate} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {adherenceRate}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <Progress value={92} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Great consistency!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold">2:00 PM</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ibuprofen 400mg
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today&apos;s Schedule</TabsTrigger>
          <TabsTrigger value="medications">All Medications</TabsTrigger>
        </TabsList>

        {/* Today's Schedule */}
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Schedule
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      item.status === "taken"
                        ? "bg-green-50/50 border-green-200"
                        : item.status === "missed"
                        ? "bg-red-50/50 border-red-200"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <Pill className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.medication}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(item.id, "taken")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Taken
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(item.id, "skipped")}
                          >
                            <SkipForward className="h-4 w-4 mr-1" />
                            Skip
                          </Button>
                        </>
                      ) : (
                        <Badge
                          variant={
                            item.status === "taken"
                              ? "success"
                              : item.status === "missed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {item.status === "taken" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {item.status === "missed" && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {item.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Medications */}
        <TabsContent value="medications" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {medications.map((med) => (
              <Card key={med.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{med.name}</CardTitle>
                      <CardDescription>{med.dosage}</CardDescription>
                    </div>
                    <Badge variant={med.isActive ? "success" : "secondary"}>
                      {med.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Frequency</span>
                      <span className="font-medium">
                        {frequencyLabels[med.frequency]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Times</span>
                      <span className="font-medium">
                        {med.times.join(", ")}
                      </span>
                    </div>
                    {med.instructions && (
                      <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                        📝 {med.instructions}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
