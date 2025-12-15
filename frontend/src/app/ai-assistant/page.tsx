"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  AlertTriangle,
  Info,
  Stethoscope,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  safetyFlag?: "safe" | "redirect_to_doctor" | "pain_warning" | "blocked_request";
}

// AI Safety layer - filters and redirects unsafe requests
const checkSafetyRules = (message: string): { flag: Message["safetyFlag"]; response?: string } => {
  const lowerMessage = message.toLowerCase();
  
  // Blocked requests - diagnosis/prescription changes
  const blockedPatterns = [
    "what medicine should i take",
    "should i stop taking",
    "change my prescription",
    "diagnose me",
    "what disease do i have",
    "am i sick",
    "prescribe me",
  ];
  
  for (const pattern of blockedPatterns) {
    if (lowerMessage.includes(pattern)) {
      return {
        flag: "blocked_request",
        response: "I cannot provide medical diagnoses or recommend changes to your medications. Please consult your doctor for any medical decisions. I'm here to help with recovery education, reminders, and emotional support."
      };
    }
  }
  
  // Pain warnings
  const painPatterns = ["severe pain", "extreme pain", "unbearable pain", "can't bear", "worst pain"];
  for (const pattern of painPatterns) {
    if (lowerMessage.includes(pattern)) {
      return {
        flag: "pain_warning",
        response: "⚠️ I'm concerned about your pain level. Severe pain should be evaluated by your healthcare provider. Please consider contacting your doctor or going to urgent care if:\n\n• Pain is sudden and severe\n• You have fever with the pain\n• The pain is different from your usual post-surgery discomfort\n• Pain is not relieved by your prescribed medications\n\nIn the meantime, I can suggest some general comfort measures. Would you like some tips for managing discomfort?"
      };
    }
  }
  
  // Redirect to doctor
  const doctorPatterns = ["infection", "fever", "bleeding heavily", "stitches open", "wound looks bad"];
  for (const pattern of doctorPatterns) {
    if (lowerMessage.includes(pattern)) {
      return {
        flag: "redirect_to_doctor",
        response: "🏥 Based on what you're describing, I strongly recommend contacting your healthcare provider as soon as possible. Signs of infection, fever, or wound complications need professional medical evaluation.\n\nPlease don't delay seeking medical attention. If you're unable to reach your doctor, consider going to an urgent care center."
      };
    }
  }
  
  return { flag: "safe" };
};

// Demo AI responses
const getAIResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("why") && lowerMessage.includes("medicine")) {
    return "Great question! Your medications work together to support your recovery:\n\n• **Pain relievers** (like Paracetamol) help manage discomfort so you can rest and move properly\n• **Anti-inflammatory drugs** (like Ibuprofen) reduce swelling which speeds healing\n• **Vitamins and supplements** support your body's natural healing processes\n\nTaking them as prescribed ensures the right amount is in your system at all times. Skipping doses can let pain build up and slow recovery. Is there a specific medication you'd like to know more about?";
  }
  
  if (lowerMessage.includes("exercise") || lowerMessage.includes("movement")) {
    return "Movement and exercises are crucial for your recovery! Here's why:\n\n• **Prevents stiffness** - Gentle movement keeps your joints flexible\n• **Improves blood flow** - Better circulation speeds healing\n• **Reduces swelling** - Movement helps drain excess fluid\n• **Builds strength** - Prepares your body for normal activities\n\n**Tips for safe exercising:**\n1. Start slow and gentle\n2. Stop if you feel sharp pain\n3. Follow your prescribed exercises\n4. Stay consistent - a little daily is better than a lot occasionally\n\nWould you like me to explain any specific exercise from your routine?";
  }
  
  if (lowerMessage.includes("anxious") || lowerMessage.includes("worried") || lowerMessage.includes("scared")) {
    return "It's completely normal to feel anxious during recovery. Many patients share these feelings. Here are some things that might help:\n\n**Remember:**\n• Your body knows how to heal\n• You're following your recovery plan\n• Each day you're getting stronger\n\n**Calming techniques:**\n• Deep breathing - try 4-7-8 breathing\n• Focus on small daily improvements\n• Talk to someone about how you feel\n• Gentle movement can reduce anxiety\n\n**Track your progress:**\nLooking back at how far you've come can be reassuring. Your recovery score shows you're making progress!\n\nIs there something specific that's worrying you? I'm here to help.";
  }
  
  if (lowerMessage.includes("sleep") || lowerMessage.includes("can't sleep")) {
    return "Sleep is essential for healing. Here are some tips for better rest during recovery:\n\n**Before bed:**\n• Take pain medication if prescribed for nighttime\n• Avoid screens for 1 hour before sleep\n• Keep a consistent sleep schedule\n• Try deep breathing or relaxation exercises\n\n**Positioning:**\n• Use pillows to support the surgical area\n• Find a comfortable position before settling\n• Have what you need within reach\n\n**Environment:**\n• Keep the room cool and dark\n• Use white noise if needed\n• Have a glass of water nearby\n\nIf sleep problems persist, mention it to your healthcare team. Good rest is important for your recovery!";
  }
  
  if (lowerMessage.includes("eat") || lowerMessage.includes("food") || lowerMessage.includes("diet")) {
    return "Nutrition plays a vital role in your recovery! Here's what can help:\n\n**Recovery-boosting foods:**\n• **Protein** - chicken, fish, eggs, beans for tissue repair\n• **Vitamin C** - citrus, berries, peppers for wound healing\n• **Zinc** - nuts, seeds, whole grains for immune function\n• **Fiber** - vegetables, fruits to prevent constipation (common with pain meds)\n\n**Tips:**\n• Stay hydrated - aim for 8 glasses of water daily\n• Eat smaller, frequent meals if appetite is low\n• Avoid alcohol as it can interfere with medications\n• Take medications with food as instructed\n\nWould you like more specific suggestions based on your situation?";
  }
  
  // Default response
  return "I'm here to help with your recovery journey! I can assist with:\n\n• **Understanding your medications** - why and when to take them\n• **Exercise guidance** - safe ways to stay active\n• **Recovery tips** - sleep, nutrition, comfort measures\n• **Emotional support** - managing anxiety or concerns\n• **Progress tracking** - understanding your recovery score\n\nWhat would you like to know more about?";
};

const suggestedQuestions = [
  "Why do I need to take all my medicines?",
  "How can I sleep better during recovery?",
  "I'm feeling anxious about my recovery",
  "What foods help with healing?",
  "Why are the exercises important?",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! 👋 I'm your QR-Health Recovery Assistant. I'm here to help you understand your recovery journey, answer questions about your schedule, provide emotional support, and give helpful tips.\n\n**I can help with:**\n• Explaining your medications and exercises\n• Recovery tips and guidance\n• Answering your \"why\" questions\n• Calming anxiety and concerns\n\n**Please note:** I cannot provide medical diagnoses or recommend medication changes. Always consult your doctor for medical decisions.\n\nHow can I help you today?",
      timestamp: new Date(),
      safetyFlag: "safe",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Check safety rules
    const safetyCheck = checkSafetyRules(userMessage.content);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: safetyCheck.response || getAIResponse(userMessage.content),
      timestamp: new Date(),
      safetyFlag: safetyCheck.flag,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep welcome message
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            AI Recovery Assistant
          </h1>
          <p className="text-muted-foreground">
            Get answers, support, and guidance for your recovery
          </p>
        </div>
        <Button variant="outline" onClick={clearChat}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                message.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4 text-primary" />
                )}
              </div>
              <div
                className={cn(
                  "flex flex-col max-w-[80%] space-y-1",
                  message.role === "user" ? "items-end" : ""
                )}
              >
                {message.safetyFlag && message.safetyFlag !== "safe" && (
                  <Badge
                    variant={
                      message.safetyFlag === "blocked_request"
                        ? "destructive"
                        : message.safetyFlag === "pain_warning"
                        ? "warning"
                        : "secondary"
                    }
                    className="mb-1"
                  >
                    {message.safetyFlag === "blocked_request" && (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {message.safetyFlag === "pain_warning" && (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {message.safetyFlag === "redirect_to_doctor" && (
                      <Stethoscope className="h-3 w-3 mr-1" />
                    )}
                    {message.safetyFlag === "blocked_request" && "Medical Advice Request"}
                    {message.safetyFlag === "pain_warning" && "Pain Warning"}
                    {message.safetyFlag === "redirect_to_doctor" && "Consult Doctor"}
                  </Badge>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Questions */}
        {messages.length < 3 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your recovery..."
              className="resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button type="submit" size="icon" className="h-auto" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Info className="h-3 w-3" />
            AI responses are for educational purposes only. Always consult your doctor for medical decisions.
          </p>
        </div>
      </Card>
    </div>
  );
}
