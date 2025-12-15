"use client";

import { useState } from "react";
import { AlertTriangle, Phone, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SafetyWarningProps {
  isOpen: boolean;
  onClose: () => void;
  type: "pain" | "emergency" | "medication";
  message?: string;
}

const warningContent = {
  pain: {
    title: "⚠️ Medical Attention Recommended",
    description: "Severe pain should be evaluated by your healthcare provider.",
    actions: [
      "Contact your doctor's office immediately",
      "If unable to reach them, go to urgent care",
      "For emergencies, call emergency services",
    ],
    tips: [
      "Rest in a comfortable position",
      "Apply ice if appropriate for your recovery",
      "Take prescribed pain medication as directed",
    ],
  },
  emergency: {
    title: "🚨 Emergency Warning",
    description: "Based on what you've described, you may need immediate medical attention.",
    actions: [
      "Call emergency services (112/108) if symptoms are severe",
      "Go to the nearest emergency room",
      "Contact your doctor immediately",
    ],
    tips: [
      "Do not delay seeking medical attention",
      "Have someone stay with you if possible",
      "Keep your medical records handy",
    ],
  },
  medication: {
    title: "💊 Medication Safety",
    description: "I cannot provide advice about changing your medications.",
    actions: [
      "Contact your prescribing doctor for medication questions",
      "Speak to a pharmacist about drug interactions",
      "Never stop or change medications without medical advice",
    ],
    tips: [
      "Keep a list of all your medications",
      "Note any side effects to discuss with your doctor",
      "Store medications as directed",
    ],
  },
};

export function SafetyWarning({ isOpen, onClose, type, message }: SafetyWarningProps) {
  const [notifyContact, setNotifyContact] = useState(false);
  const content = warningContent[type];

  const handleNotifyContact = () => {
    // In production, this would send a notification to the user's trusted contact
    setNotifyContact(true);
    setTimeout(() => setNotifyContact(false), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            {content.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Main Warning */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-amber-800">{content.description}</p>
            {message && (
              <p className="text-sm text-amber-700 mt-2 italic">
                Your concern: &quot;{message}&quot;
              </p>
            )}
          </div>

          {/* What to do */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-red-500" />
              What You Should Do
            </h4>
            <ul className="space-y-2">
              {content.actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-red-500">{index + 1}.</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* In the meantime */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              In the Meantime
            </h4>
            <ul className="space-y-2">
              {content.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span>•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleNotifyContact}
              disabled={notifyContact}
            >
              <Users className="h-4 w-4 mr-2" />
              {notifyContact ? "Notification Sent ✓" : "Notify Trusted Contact (Optional)"}
            </Button>
            <Button onClick={onClose} className="w-full">
              I Understand
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground">
            QR-Health is a recovery companion and cannot provide medical diagnoses.
            Always consult your healthcare provider for medical decisions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to trigger safety warning based on AI response
export function useSafetyWarning() {
  const [isOpen, setIsOpen] = useState(false);
  const [warningType, setWarningType] = useState<"pain" | "emergency" | "medication">("pain");
  const [warningMessage, setWarningMessage] = useState("");

  const showWarning = (type: "pain" | "emergency" | "medication", message?: string) => {
    setWarningType(type);
    setWarningMessage(message || "");
    setIsOpen(true);
  };

  const closeWarning = () => {
    setIsOpen(false);
    setWarningMessage("");
  };

  return {
    isOpen,
    warningType,
    warningMessage,
    showWarning,
    closeWarning,
  };
}
