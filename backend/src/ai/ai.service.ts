import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase';
import { PatientProfile, AIIntentType, AIRiskLevel } from '../types';

export type SafetyFlag =
  | 'safe'
  | 'redirect_to_doctor'
  | 'pain_warning'
  | 'blocked_request';
export type AIProvider =
  | 'gemini'
  | 'groq'
  | 'sarvam'
  | 'openai'
  | 'anthropic'
  | 'local';

export interface AIResponse {
  message: string;
  safetyFlag: SafetyFlag;
  provider?: AIProvider;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private currentProvider: AIProvider;

  constructor(private supabase: SupabaseService) {
    this.currentProvider = (process.env.AI_PROVIDER as AIProvider) || 'local';
    this.logger.log(
      `AI Service initialized with provider: ${this.currentProvider}`,
    );
  }

  // Safety rule patterns
  private blockedPatterns = [
    'what medicine should i take',
    'should i stop taking',
    'change my prescription',
    'diagnose me',
    'what disease do i have',
    'am i sick',
    'prescribe me',
    'what is my diagnosis',
    'do i have cancer',
    'is this serious',
  ];

  private painPatterns = [
    'severe pain',
    'extreme pain',
    'unbearable pain',
    "can't bear",
    'worst pain',
    'pain is 10',
    'pain is 9',
    'excruciating',
  ];

  private doctorPatterns = [
    'infection',
    'fever',
    'bleeding heavily',
    'stitches open',
    'wound looks bad',
    'pus',
    'swelling getting worse',
    'red and hot',
    'dizzy',
    'fainting',
  ];

  async chat(userId: string, message: string): Promise<AIResponse> {
    const startTime = Date.now();

    // Check safety rules first
    const safetyCheck = this.checkSafetyRules(message);
    if (safetyCheck.flag !== 'safe') {
      // Log blocked interaction
      await this.logInteraction(userId, message, safetyCheck.response!, {
        safetyFlag: safetyCheck.flag,
        provider: this.currentProvider,
        wasBlocked: true,
        responseTimeMs: Date.now() - startTime,
      });

      return {
        message: safetyCheck.response!,
        safetyFlag: safetyCheck.flag,
        provider: this.currentProvider,
      };
    }

    // Try to get AI response from configured provider
    try {
      const aiResponse = await this.getAIResponse(message, userId);

      // Log successful interaction
      await this.logInteraction(userId, message, aiResponse, {
        safetyFlag: 'safe',
        provider: this.currentProvider,
        wasBlocked: false,
        responseTimeMs: Date.now() - startTime,
      });

      return {
        message: aiResponse,
        safetyFlag: 'safe',
        provider: this.currentProvider,
      };
    } catch (error) {
      this.logger.warn(
        `AI provider ${this.currentProvider} failed, using fallback`,
      );
      // Fallback to local response generation
      const fallbackResponse = this.generateLocalResponse(message);

      // Log fallback interaction
      await this.logInteraction(userId, message, fallbackResponse, {
        safetyFlag: 'safe',
        provider: 'local',
        wasBlocked: false,
        responseTimeMs: Date.now() - startTime,
      });

      return {
        message: fallbackResponse,
        safetyFlag: 'safe',
        provider: 'local',
      };
    }
  }

  private async getAIResponse(
    message: string,
    userId: string,
  ): Promise<string> {
    const systemPrompt = this.getSystemPrompt();

    switch (this.currentProvider) {
      case 'gemini':
        return await this.callGemini(systemPrompt, message);
      case 'groq':
        return await this.callGroq(systemPrompt, message);
      case 'sarvam':
        return await this.callSarvam(systemPrompt, message);
      case 'openai':
        return await this.callOpenAI(systemPrompt, message);
      case 'anthropic':
        return await this.callAnthropic(systemPrompt, message);
      case 'local':
      default:
        return this.generateLocalResponse(message);
    }
  }

  private getSystemPrompt(): string {
    return `You are a Recovery Companion AI for QR-Health, a post-surgery recovery support app.

STRICT RULES (NON-NEGOTIABLE):
1. You are NOT a doctor. You CANNOT provide medical diagnoses.
2. You CANNOT recommend medication changes or new medications.
3. You CANNOT interpret symptoms as diseases.
4. If asked about serious symptoms (fever, infection signs, severe pain), ALWAYS recommend contacting a healthcare provider.

YOUR ROLE:
- Explain WHY medications and exercises are important
- Provide emotional support and encouragement
- Answer questions about recovery in general terms
- Help with anxiety about recovery
- Suggest general wellness tips (hydration, rest, gentle movement)
- Celebrate recovery milestones

TONE: Warm, supportive, encouraging, informative but never medical.

Always end responses with encouragement and remind users you're here to support their recovery journey.`;
  }

  private async callGemini(
    systemPrompt: string,
    message: string,
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nUser message: ${message}` }],
            },
          ],
          safetySettings: [
            {
              category: 'HARM_CATEGORY_MEDICAL',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      this.generateLocalResponse(message)
    );
  }

  private async callGroq(
    systemPrompt: string,
    message: string,
  ): Promise<string> {
    const apiKey = process.env.QR_GROQ;
    if (!apiKey) {
      throw new Error('QR_GROQ not configured');
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content || this.generateLocalResponse(message)
    );
  }

  private async callSarvam(
    systemPrompt: string,
    message: string,
  ): Promise<string> {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      throw new Error('SARVAM_API_KEY not configured');
    }

    // Sarvam AI API integration (India-focused AI)
    // Note: Verify the actual Sarvam AI API endpoint from their documentation
    // This is a placeholder URL structure - update when integrating
    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sarvam-1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sarvam API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content || this.generateLocalResponse(message)
    );
  }

  private async callOpenAI(
    systemPrompt: string,
    message: string,
  ): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content || this.generateLocalResponse(message)
    );
  }

  private async callAnthropic(
    systemPrompt: string,
    message: string,
  ): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || this.generateLocalResponse(message);
  }

  private checkSafetyRules(message: string): {
    flag: SafetyFlag;
    response?: string;
  } {
    const lowerMessage = message.toLowerCase();

    // Check blocked patterns
    for (const pattern of this.blockedPatterns) {
      if (lowerMessage.includes(pattern)) {
        return {
          flag: 'blocked_request',
          response:
            '⚠️ I cannot provide medical diagnoses or recommend changes to your medications. Please consult your doctor for any medical decisions.\n\nI am here to help with:\n• Understanding your recovery journey\n• Explaining why medications and exercises matter\n• Emotional support and encouragement\n• General wellness tips\n\nHow else can I support your recovery today?',
        };
      }
    }

    // Check pain patterns
    for (const pattern of this.painPatterns) {
      if (lowerMessage.includes(pattern)) {
        return {
          flag: 'pain_warning',
          response:
            '⚠️ **Medical Attention Recommended**\n\nI am concerned about your pain level. Severe pain should be evaluated by your healthcare provider.\n\n**Please contact your doctor or go to urgent care if:**\n• Pain is sudden and severe\n• You have fever with the pain\n• The pain is different from your usual post-surgery discomfort\n• Pain is not relieved by your prescribed medications\n\n**In the meantime:**\n• Rest in a comfortable position\n• Apply ice if appropriate for your recovery\n• Take prescribed pain medication as directed\n\nWould you like me to help you prepare questions for your doctor?',
        };
      }
    }

    // Check doctor referral patterns
    for (const pattern of this.doctorPatterns) {
      if (lowerMessage.includes(pattern)) {
        return {
          flag: 'redirect_to_doctor',
          response:
            "🏥 **Please Seek Medical Attention**\n\nBased on what you are describing, I strongly recommend contacting your healthcare provider as soon as possible.\n\n**Signs that need professional evaluation:**\n• Fever or signs of infection\n• Unusual bleeding or wound changes\n• Dizziness or fainting\n• Sudden worsening of symptoms\n\n**What to do now:**\n1. Contact your doctor's office immediately\n2. If unable to reach them, go to urgent care\n3. For emergencies, call emergency services\n\nPlease do not delay seeking medical attention. Your safety is the priority.",
        };
      }
    }

    return { flag: 'safe' };
  }

  private generateLocalResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('why') && lowerMessage.includes('medicine')) {
      return "💊 **Great question about your medications!**\n\nYour medications work together to support your recovery:\n\n• **Pain relievers** (like Paracetamol) help manage discomfort so you can rest and move properly\n• **Anti-inflammatory drugs** (like Ibuprofen) reduce swelling which speeds healing\n• **Vitamins and supplements** support your body's natural healing processes\n\nTaking them as prescribed ensures the right amount is in your system at all times. Skipping doses can let pain build up and slow recovery.\n\nIs there a specific medication you'd like to know more about? I'm here to help! 💪";
    }

    if (
      lowerMessage.includes('exercise') ||
      lowerMessage.includes('movement')
    ) {
      return "🏃 **Movement is medicine for recovery!**\n\nHere's why exercises are crucial:\n\n• **Prevents stiffness** - Gentle movement keeps your joints flexible\n• **Improves blood flow** - Better circulation speeds healing\n• **Reduces swelling** - Movement helps drain excess fluid\n• **Builds strength** - Prepares your body for normal activities\n\n**Tips for safe exercising:**\n1. ✅ Start slow and gentle\n2. ✅ Stop if you feel sharp pain\n3. ✅ Follow your prescribed exercises\n4. ✅ Stay consistent - a little daily is better than a lot occasionally\n\nWould you like me to explain any specific exercise from your routine? You're doing great! 🌟";
    }

    if (
      lowerMessage.includes('anxious') ||
      lowerMessage.includes('worried') ||
      lowerMessage.includes('scared')
    ) {
      return "💚 **It's completely normal to feel anxious during recovery.**\n\nMany patients share these feelings - you're not alone.\n\n**Remember:**\n• Your body knows how to heal\n• You're following your recovery plan\n• Each day you're getting stronger\n\n**Calming techniques that help:**\n• 🧘 Deep breathing - try 4-7-8 breathing\n• 📝 Focus on small daily improvements\n• 💬 Talk to someone about how you feel\n• 🚶 Gentle movement can reduce anxiety\n\n**Track your progress:**\nLooking back at how far you've come can be reassuring. Your recovery score shows you're making progress!\n\nIs there something specific that's worrying you? I'm here to listen. 💙";
    }

    if (
      lowerMessage.includes('sleep') ||
      lowerMessage.includes("can't sleep")
    ) {
      return '😴 **Sleep is essential for healing!**\n\nHere are tips for better rest during recovery:\n\n**Before bed:**\n• Take pain medication if prescribed for nighttime\n• Avoid screens for 1 hour before sleep\n• Keep a consistent sleep schedule\n• Try deep breathing or relaxation exercises\n\n**Positioning:**\n• Use pillows to support the surgical area\n• Find a comfortable position before settling\n• Have what you need within reach\n\n**Environment:**\n• Keep the room cool and dark\n• Use white noise if needed\n• Have a glass of water nearby\n\nIf sleep problems persist, mention it to your healthcare team. Good rest is important for your recovery! 🌙';
    }

    if (
      lowerMessage.includes('eat') ||
      lowerMessage.includes('food') ||
      lowerMessage.includes('diet')
    ) {
      return "🥗 **Nutrition is vital for recovery!**\n\n**Recovery-boosting foods:**\n• 🥩 **Protein** - chicken, fish, eggs, beans for tissue repair\n• 🍊 **Vitamin C** - citrus, berries, peppers for wound healing\n• 🥜 **Zinc** - nuts, seeds, whole grains for immune function\n• 🥬 **Fiber** - vegetables, fruits to prevent constipation\n\n**Helpful tips:**\n• 💧 Stay hydrated - aim for 8 glasses of water daily\n• 🍽️ Eat smaller, frequent meals if appetite is low\n• 🚫 Avoid alcohol as it can interfere with medications\n• 💊 Take medications with food as instructed\n\nWould you like more specific suggestions? You're nourishing your recovery! 🌟";
    }

    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey')
    ) {
      return "👋 **Hello! Welcome to your Recovery Assistant!**\n\nI'm here to support your recovery journey. I can help with:\n\n• 💊 **Understanding your medications** - why and when to take them\n• 🏃 **Exercise guidance** - safe ways to stay active\n• 💤 **Recovery tips** - sleep, nutrition, comfort measures\n• 💚 **Emotional support** - managing anxiety or concerns\n• 📊 **Progress tracking** - understanding your recovery score\n\nWhat would you like to talk about today? I'm here for you! 😊";
    }

    // Default response
    return "🌟 **I'm here to help with your recovery journey!**\n\nI can assist with:\n\n• 💊 **Understanding your medications** - why and when to take them\n• 🏃 **Exercise guidance** - safe ways to stay active\n• 💤 **Recovery tips** - sleep, nutrition, comfort measures\n• 💚 **Emotional support** - managing anxiety or concerns\n• 📊 **Progress tracking** - understanding your recovery score\n\n**Remember:** I'm a Recovery Companion, not a doctor. For medical concerns, please contact your healthcare provider.\n\nWhat would you like to know more about? 💙";
  }

  // ======== Logging Helper Methods ========

  /**
   * Log AI interaction to Supabase for analytics and audit
   */
  private async logInteraction(
    userId: string,
    userMessage: string,
    aiResponse: string,
    metadata: {
      safetyFlag: SafetyFlag;
      provider: AIProvider;
      wasBlocked: boolean;
      responseTimeMs: number;
    },
  ): Promise<void> {
    try {
      const client = this.supabase.getAdminClient();

      // Get patient profile
      const patientProfile = await this.getPatientProfile(userId);
      if (!patientProfile) {
        this.logger.warn(`No patient profile found for user ${userId}`);
        return;
      }

      // Map safety flag to intent type
      const intentMapping: Record<SafetyFlag, AIIntentType> = {
        safe: 'education',
        redirect_to_doctor: 'warning',
        pain_warning: 'warning',
        blocked_request: 'blocked',
      };

      // Map safety flag to risk level
      const riskMapping: Record<SafetyFlag, AIRiskLevel> = {
        safe: 'low',
        redirect_to_doctor: 'high',
        pain_warning: 'high',
        blocked_request: 'medium',
      };

      await client.from('ai_interaction_logs').insert({
        patient_id: patientProfile.id,
        tenant_id: patientProfile.tenant_id,
        user_message: userMessage,
        ai_response: aiResponse,
        intent_type: intentMapping[metadata.safetyFlag],
        risk_level: riskMapping[metadata.safetyFlag],
        was_blocked: metadata.wasBlocked,
        blocked_reason: metadata.wasBlocked
          ? this.getBlockedReason(metadata.safetyFlag)
          : null,
        safety_warning_shown:
          metadata.safetyFlag !== 'safe' &&
          metadata.safetyFlag !== 'blocked_request',
        ai_provider: metadata.provider,
        response_time_ms: metadata.responseTimeMs,
      });
    } catch (error) {
      // Don't throw - logging should not break the chat flow
      this.logger.error('Failed to log AI interaction', error);
    }
  }

  /**
   * Get patient profile for the user
   */
  private async getPatientProfile(
    userId: string,
  ): Promise<PatientProfile | null> {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as PatientProfile;
  }

  /**
   * Get human-readable blocked reason
   */
  private getBlockedReason(flag: SafetyFlag): string {
    switch (flag) {
      case 'blocked_request':
        return 'User requested medical diagnosis or prescription';
      case 'pain_warning':
        return 'User reported severe pain symptoms';
      case 'redirect_to_doctor':
        return 'User reported symptoms requiring medical attention';
      default:
        return 'Unknown';
    }
  }
}
