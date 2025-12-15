"use client";

import { useState } from "react";
import {
  Dumbbell,
  Plus,
  Clock,
  CheckCircle,
  Play,
  SkipForward,
  Calendar,
  Timer,
  AlertCircle,
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
import { Textarea } from "@/components/ui/textarea";

// Demo exercises data
const exercises = [
  {
    id: "1",
    name: "Ankle Rotations",
    description: "Gentle clockwise and counter-clockwise rotations of the ankle",
    duration: 5,
    frequency: "twice_daily",
    scheduledDays: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    instructions: [
      "Sit comfortably with your leg extended",
      "Rotate your ankle clockwise 10 times",
      "Rotate your ankle counter-clockwise 10 times",
      "Repeat with the other ankle if needed",
    ],
  },
  {
    id: "2",
    name: "Leg Raises",
    description: "Gentle leg raises while lying down",
    duration: 10,
    frequency: "daily",
    scheduledDays: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    instructions: [
      "Lie flat on your back",
      "Keep one leg flat and slowly raise the other",
      "Hold for 5 seconds at the top",
      "Lower slowly and repeat 10 times each leg",
    ],
  },
  {
    id: "3",
    name: "Quad Sets",
    description: "Tighten and release thigh muscles",
    duration: 5,
    frequency: "three_times_daily",
    scheduledDays: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    instructions: [
      "Sit or lie with your leg straight",
      "Tighten the muscle on top of your thigh",
      "Hold for 5 seconds",
      "Release and repeat 10 times",
    ],
  },
  {
    id: "4",
    name: "Deep Breathing",
    description: "Breathing exercises for relaxation and healing",
    duration: 5,
    frequency: "daily",
    scheduledDays: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    instructions: [
      "Sit comfortably or lie down",
      "Breathe in slowly through your nose for 4 counts",
      "Hold for 4 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Repeat 10 times",
    ],
  },
];

const todaySchedule = [
  { id: "1", exerciseId: "1", exercise: "Ankle Rotations", duration: 5, time: "Morning", status: "completed" },
  { id: "2", exerciseId: "2", exercise: "Leg Raises", duration: 10, time: "Morning", status: "completed" },
  { id: "3", exerciseId: "3", exercise: "Quad Sets", duration: 5, time: "Morning", status: "skipped" },
  { id: "4", exerciseId: "4", exercise: "Deep Breathing", duration: 5, time: "Afternoon", status: "pending" },
  { id: "5", exerciseId: "1", exercise: "Ankle Rotations", duration: 5, time: "Evening", status: "pending" },
  { id: "6", exerciseId: "3", exercise: "Quad Sets", duration: 5, time: "Evening", status: "pending" },
];

export default function ExercisesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schedule, setSchedule] = useState(todaySchedule);
  const [activeExercise, setActiveExercise] = useState<typeof exercises[0] | null>(null);
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);

  const completedCount = schedule.filter((s) => s.status === "completed").length;
  const totalCount = schedule.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const handleStatusChange = (id: string, newStatus: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const startExercise = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      setActiveExercise(exercise);
      setExerciseDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            Exercises
          </h1>
          <p className="text-muted-foreground">
            Follow your exercise routine for a speedy recovery
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Exercise</DialogTitle>
              <DialogDescription>
                Add a new exercise to your routine
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ex-name">Exercise Name</Label>
                <Input id="ex-name" placeholder="e.g., Ankle Rotations" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ex-duration">Duration (minutes)</Label>
                <Input id="ex-duration" type="number" placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ex-description">Description</Label>
                <Textarea id="ex-description" placeholder="Describe the exercise..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Add Exercise</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exercise Session Dialog */}
      <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {activeExercise?.name}
            </DialogTitle>
            <DialogDescription>
              {activeExercise?.description}
            </DialogDescription>
          </DialogHeader>
          {activeExercise && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center gap-4 p-6 bg-primary/10 rounded-lg">
                <Timer className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold">{activeExercise.duration} min</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Instructions:</h4>
                <ol className="space-y-2">
                  {activeExercise.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <span className="text-sm text-yellow-800">
                  Stop immediately if you experience increased pain or discomfort.
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setExerciseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Mark corresponding schedule item as completed
              const scheduleItem = schedule.find(
                (s) => s.exerciseId === activeExercise?.id && s.status === "pending"
              );
              if (scheduleItem) {
                handleStatusChange(scheduleItem.id, "completed");
              }
              setExerciseDialogOpen(false);
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCount}/{totalCount}
            </div>
            <Progress value={completionRate} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completionRate}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <Progress value={75} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Keep improving!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Time Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold">15 min</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Target: 35 min
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today&apos;s Schedule</TabsTrigger>
          <TabsTrigger value="exercises">All Exercises</TabsTrigger>
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
                      item.status === "completed"
                        ? "bg-green-50/50 border-green-200"
                        : item.status === "skipped"
                        ? "bg-gray-50/50 border-gray-200"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <Dumbbell className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.exercise}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {item.time} • {item.duration} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => startExercise(item.exerciseId)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
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
                            item.status === "completed"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {item.status === "completed" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
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

        {/* All Exercises */}
        <TabsContent value="exercises" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {exercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <CardDescription>{exercise.description}</CardDescription>
                    </div>
                    <Badge variant={exercise.isActive ? "success" : "secondary"}>
                      {exercise.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{exercise.duration} minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Frequency</span>
                      <span className="font-medium capitalize">
                        {exercise.frequency.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => startExercise(exercise.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Exercise
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
