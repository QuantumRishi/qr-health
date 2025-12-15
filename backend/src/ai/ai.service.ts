import { Injectable } from '@nestjs/common';

export type SafetyFlag = 'safe' | 'redirect_to_doctor' | 'pain_warning' | 'blocked_request';

export interface AIResponse {
  message: string;
  safetyFlag: SafetyFlag;
}

@Injectable()
export class AiService {
  // Safety rule patterns
  private blockedPatterns = [
    'what medicine should i take',
    'should i stop taking',
    'change my prescription',
    'diagnose me',
    'what disease do i have',
    'am i sick',
    'prescribe me',
  ];

  private painPatterns = [
    'severe pain',
    'extreme pain',
    'unbearable pain',
    "can't bear",
    'worst pain',
  ];

  private doctorPatterns = [
    'infection',
    'fever',
    'bleeding heavily',
    'stitches open',
    'wound looks bad',
  ];

  async chat(userId: string, message: string): Promise<AIResponse> {
    // Check safety rules first
    const safetyCheck = this.checkSafetyRules(message);
    if (safetyCheck.flag !== 'safe') {
      return {
        message: safetyCheck.response!,
        safetyFlag: safetyCheck.flag,
      };
    }

    // Generate response
    const response = this.generateResponse(message);
    return {
      message: response,
      safetyFlag: 'safe',
    };
  }

  private checkSafetyRules(message: string): { flag: SafetyFlag; response?: string } {
    const lowerMessage = message.toLowerCase();

    // Check blocked patterns
    for (const pattern of this.blockedPatterns) {
      if (lowerMessage.includes(pattern)) {
        return {
          flag: 'blocked_request',
          response:
            'I cannot provide medical diagnoses or recommend changes to your medications. Please consult your doctor for any medical decisions. I am here to help with recovery education, reminders, and emotional support.',
        };
      }
    }

    // Check pain patterns
    for (const pattern of this.painPatterns) {
      if (lowerMessage.includes(pattern)) {
        return {
          flag: 'pain_warning',
          response:
            '⚠️ I am concerned about your pain level. Severe pain should be evaluated by your healthcare provider. Please consider contacting your doctor or going to urgent care if:\n\n• Pain is sudden and severe\n• You have fever with the pain\n• The pain is different from your usual post-surgery discomfort\n• Pain is not relieved by your prescribed medications\n\nIn the meantime, I can suggest some general comfort measures. Would you like some tips for managing discomfort?',
        };
      }
    }

    // Check doctor referral patterns
    for (const pattern of this.doctorPatterns) {
      if (lowerMessage.includes(pattern)) {
        return {
          flag: 'redirect_to_doctor',
          response:
            '🏥 Based on what you are describing, I strongly recommend contacting your healthcare provider as soon as possible. Signs of infection, fever, or wound complications need professional medical evaluation.\n\nPlease do not delay seeking medical attention. If you are unable to reach your doctor, consider going to an urgent care center.',
        };
      }
    }

    return { flag: 'safe' };
  }

  private generateResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('why') && lowerMessage.includes('medicine')) {
      return 'Great question! Your medications work together to support your recovery:\n\n• **Pain relievers** (like Paracetamol) help manage discomfort so you can rest and move properly\n• **Anti-inflammatory drugs** (like Ibuprofen) reduce swelling which speeds healing\n• **Vitamins and supplements** support your body\'s natural healing processes\n\nTaking them as prescribed ensures the right amount is in your system at all times. Skipping doses can let pain build up and slow recovery. Is there a specific medication you\'d like to know more about?';
    }

    if (lowerMessage.includes('exercise') || lowerMessage.includes('movement')) {
      return 'Movement and exercises are crucial for your recovery! Here\'s why:\n\n• **Prevents stiffness** - Gentle movement keeps your joints flexible\n• **Improves blood flow** - Better circulation speeds healing\n• **Reduces swelling** - Movement helps drain excess fluid\n• **Builds strength** - Prepares your body for normal activities\n\n**Tips for safe exercising:**\n1. Start slow and gentle\n2. Stop if you feel sharp pain\n3. Follow your prescribed exercises\n4. Stay consistent - a little daily is better than a lot occasionally\n\nWould you like me to explain any specific exercise from your routine?';
    }

    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('scared')) {
      return 'It\'s completely normal to feel anxious during recovery. Many patients share these feelings. Here are some things that might help:\n\n**Remember:**\n• Your body knows how to heal\n• You\'re following your recovery plan\n• Each day you\'re getting stronger\n\n**Calming techniques:**\n• Deep breathing - try 4-7-8 breathing\n• Focus on small daily improvements\n• Talk to someone about how you feel\n• Gentle movement can reduce anxiety\n\n**Track your progress:**\nLooking back at how far you\'ve come can be reassuring. Your recovery score shows you\'re making progress!\n\nIs there something specific that\'s worrying you? I\'m here to help.';
    }

    if (lowerMessage.includes('sleep') || lowerMessage.includes("can't sleep")) {
      return 'Sleep is essential for healing. Here are some tips for better rest during recovery:\n\n**Before bed:**\n• Take pain medication if prescribed for nighttime\n• Avoid screens for 1 hour before sleep\n• Keep a consistent sleep schedule\n• Try deep breathing or relaxation exercises\n\n**Positioning:**\n• Use pillows to support the surgical area\n• Find a comfortable position before settling\n• Have what you need within reach\n\n**Environment:**\n• Keep the room cool and dark\n• Use white noise if needed\n• Have a glass of water nearby\n\nIf sleep problems persist, mention it to your healthcare team. Good rest is important for your recovery!';
    }

    if (lowerMessage.includes('eat') || lowerMessage.includes('food') || lowerMessage.includes('diet')) {
      return 'Nutrition plays a vital role in your recovery! Here\'s what can help:\n\n**Recovery-boosting foods:**\n• **Protein** - chicken, fish, eggs, beans for tissue repair\n• **Vitamin C** - citrus, berries, peppers for wound healing\n• **Zinc** - nuts, seeds, whole grains for immune function\n• **Fiber** - vegetables, fruits to prevent constipation (common with pain meds)\n\n**Tips:**\n• Stay hydrated - aim for 8 glasses of water daily\n• Eat smaller, frequent meals if appetite is low\n• Avoid alcohol as it can interfere with medications\n• Take medications with food as instructed\n\nWould you like more specific suggestions based on your situation?';
    }

    // Default response
    return 'I\'m here to help with your recovery journey! I can assist with:\n\n• **Understanding your medications** - why and when to take them\n• **Exercise guidance** - safe ways to stay active\n• **Recovery tips** - sleep, nutrition, comfort measures\n• **Emotional support** - managing anxiety or concerns\n• **Progress tracking** - understanding your recovery score\n\nWhat would you like to know more about?';
  }
}
