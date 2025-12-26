/**
 * QR-Health API Client
 * 
 * Centralized API client for communicating with the backend services.
 * Handles authentication, error handling, and type safety.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Get auth token from local storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('qr-health-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || `HTTP error ${response.status}`,
      };
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  /**
   * Send OTP to email
   */
  sendOtp: async (email: string) => {
    return apiRequest<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  /**
   * Verify OTP and get access token
   */
  verifyOtp: async (email: string, otp: string) => {
    return apiRequest<{ accessToken: string; user: unknown }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },
  
  /**
   * Register new user
   */
  register: async (data: {
    email: string;
    name: string;
    consentDataProcessing: boolean;
    consentNotifications?: boolean;
  }) => {
    return apiRequest<{ accessToken: string; user: unknown }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================
// RECOVERY API
// ============================================================

export const recoveryApi = {
  /**
   * Get recovery progress history
   */
  getProgress: async () => {
    return apiRequest<unknown[]>('/recovery');
  },
  
  /**
   * Get latest recovery progress
   */
  getLatest: async () => {
    return apiRequest<unknown>('/recovery/latest');
  },
  
  /**
   * Get dashboard statistics
   */
  getDashboard: async () => {
    return apiRequest<{
      daysSinceSurgery: number;
      recoveryScore: number;
      recoveryTrend: 'improving' | 'stable' | 'warning';
      weeklyProgress: {
        medicineAdherence: number;
        exerciseConsistency: number;
        averagePainScore: number;
      };
    }>('/recovery/dashboard');
  },
  
  /**
   * Log daily recovery progress
   */
  logProgress: async (data: {
    painScore?: number;
    swellingStatus?: 'none' | 'mild' | 'moderate' | 'severe';
    mood?: 'great' | 'good' | 'ok' | 'low' | 'struggling';
    medicineAdherence?: number;
    exerciseConsistency?: number;
    notes?: string;
  }) => {
    return apiRequest<unknown>('/recovery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================
// MEDICATIONS API
// ============================================================

export const medicationsApi = {
  /**
   * Get all medications
   */
  getAll: async () => {
    return apiRequest<unknown[]>('/medications');
  },
  
  /**
   * Get medication by ID
   */
  getById: async (id: string) => {
    return apiRequest<unknown>(`/medications/${id}`);
  },
  
  /**
   * Create new medication
   */
  create: async (data: {
    name: string;
    dosage: string;
    frequency?: string;
    times?: string[];
    instructions?: string;
  }) => {
    return apiRequest<unknown>('/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Update medication
   */
  update: async (id: string, data: Partial<{
    name: string;
    dosage: string;
    frequency: string;
    times: string[];
    instructions: string;
    isActive: boolean;
  }>) => {
    return apiRequest<unknown>(`/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Delete medication
   */
  delete: async (id: string) => {
    return apiRequest<void>(`/medications/${id}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Log medication intake
   */
  log: async (id: string, status: 'taken' | 'missed' | 'skipped') => {
    return apiRequest<unknown>(`/medications/${id}/log`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
  
  /**
   * Get today's schedule
   */
  getTodaySchedule: async () => {
    return apiRequest<unknown[]>('/medications/schedule/today');
  },
};

// ============================================================
// EXERCISES API
// ============================================================

export const exercisesApi = {
  /**
   * Get all exercises
   */
  getAll: async () => {
    return apiRequest<unknown[]>('/exercises');
  },
  
  /**
   * Get exercise by ID
   */
  getById: async (id: string) => {
    return apiRequest<unknown>(`/exercises/${id}`);
  },
  
  /**
   * Create new exercise
   */
  create: async (data: {
    name: string;
    description?: string;
    duration?: number;
    frequency?: string;
    scheduledDays?: number[];
    instructions?: string[];
  }) => {
    return apiRequest<unknown>('/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Update exercise
   */
  update: async (id: string, data: Partial<{
    name: string;
    description: string;
    duration: number;
    scheduledDays: number[];
    instructions: string[];
    isActive: boolean;
  }>) => {
    return apiRequest<unknown>(`/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Delete exercise
   */
  delete: async (id: string) => {
    return apiRequest<void>(`/exercises/${id}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Log exercise completion
   */
  log: async (id: string, data: {
    status: 'completed' | 'skipped' | 'partial';
    painLevel?: number;
    notes?: string;
  }) => {
    return apiRequest<unknown>(`/exercises/${id}/log`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Get today's schedule
   */
  getTodaySchedule: async () => {
    return apiRequest<unknown[]>('/exercises/schedule/today');
  },
};

// ============================================================
// REMINDERS API
// ============================================================

export const remindersApi = {
  /**
   * Get all reminders
   */
  getAll: async () => {
    return apiRequest<unknown[]>('/reminders');
  },
  
  /**
   * Get upcoming reminders
   */
  getUpcoming: async () => {
    return apiRequest<unknown[]>('/reminders/upcoming');
  },
  
  /**
   * Create new reminder
   */
  create: async (data: {
    type: 'medication' | 'exercise' | 'meal' | 'hydration' | 'custom';
    title: string;
    message?: string;
    scheduledTime: string;
    recurring?: boolean;
  }) => {
    return apiRequest<unknown>('/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Delete reminder
   */
  delete: async (id: string) => {
    return apiRequest<void>(`/reminders/${id}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Toggle reminder active status
   */
  toggle: async (id: string) => {
    return apiRequest<unknown>(`/reminders/${id}/toggle`, {
      method: 'POST',
    });
  },
};

// ============================================================
// FAMILY API
// ============================================================

export const familyApi = {
  /**
   * Get all family members
   */
  getMembers: async () => {
    return apiRequest<unknown[]>('/family');
  },
  
  /**
   * Add family member
   */
  addMember: async (data: {
    name: string;
    email: string;
    relationship: string;
    permissions?: {
      canViewProgress?: boolean;
      canViewMedications?: boolean;
      canViewExercises?: boolean;
      canViewMood?: boolean;
      notificationFrequency?: 'daily' | 'weekly' | 'milestone' | 'none';
    };
  }) => {
    return apiRequest<unknown>('/family', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Update member permissions
   */
  updatePermissions: async (memberId: string, permissions: {
    canViewProgress?: boolean;
    canViewMedications?: boolean;
    canViewExercises?: boolean;
    canViewMood?: boolean;
    notificationFrequency?: 'daily' | 'weekly' | 'milestone' | 'none';
  }) => {
    return apiRequest<unknown>(`/family/${memberId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissions),
    });
  },
  
  /**
   * Remove family member
   */
  removeMember: async (memberId: string) => {
    return apiRequest<void>(`/family/${memberId}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Get patient progress (for family viewer)
   */
  getPatientProgress: async (patientId: string, memberId: string) => {
    return apiRequest<unknown>(`/family/patient/${patientId}/${memberId}`);
  },
};

// ============================================================
// AI ASSISTANT API
// ============================================================

export const aiApi = {
  /**
   * Send message to AI assistant
   */
  chat: async (message: string) => {
    return apiRequest<{
      message: string;
      safetyFlag: 'safe' | 'redirect_to_doctor' | 'pain_warning' | 'blocked_request';
      provider?: string;
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};

// ============================================================
// USERS API
// ============================================================

export const usersApi = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    return apiRequest<unknown>('/users/me');
  },
  
  /**
   * Update user profile
   */
  updateProfile: async (data: {
    name?: string;
    phone?: string;
  }) => {
    return apiRequest<unknown>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Get patient profile
   */
  getPatientProfile: async () => {
    return apiRequest<unknown>('/users/me/patient-profile');
  },
  
  /**
   * Update patient profile
   */
  updatePatientProfile: async (data: {
    displayName?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    recoveryStartDate?: string;
    recoveryType?: string;
    recoveryDescription?: string;
    expectedRecoveryDays?: number;
  }) => {
    return apiRequest<unknown>('/users/me/patient-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Update consent
   */
  updateConsent: async (consentGiven: boolean, consentType?: string) => {
    return apiRequest<unknown>('/users/me/consent', {
      method: 'PUT',
      body: JSON.stringify({ consentGiven, consentType }),
    });
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  recovery: recoveryApi,
  medications: medicationsApi,
  exercises: exercisesApi,
  reminders: remindersApi,
  family: familyApi,
  ai: aiApi,
  users: usersApi,
};

export default api;
