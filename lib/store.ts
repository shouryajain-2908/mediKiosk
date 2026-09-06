import { create } from 'zustand';
import type { Language, UserRole, ChatMessage, ConsentData, TimelineEvent } from '@/lib/types';

interface PatientState {
  // Navigation step
  step: 'home' | 'auth' | 'language' | 'consent' | 'chat' | 'upload' | 'summary' | 'history3d';
  setStep: (step: PatientState['step']) => void;

  // Patient identity
  patientName: string | null;
  patientId: string | null;
  authMethod: 'otp' | 'abha' | 'walkin' | null;
  setPatient: (name: string, id: string, method: 'otp' | 'abha' | 'walkin') => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // AYUSH mode
  ayushMode: boolean;
  setAyushMode: (on: boolean) => void;

  // Consent
  consent: ConsentData | null;
  setConsent: (c: ConsentData) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  clearMessages: () => void;

  // Session
  sessionId: string | null;
  setSessionId: (id: string) => void;

  // Uploaded docs
  uploadedDocs: string[];
  addUploadedDoc: (name: string) => void;

  // Red flag
  redFlagTriggered: boolean;
  setRedFlagTriggered: (v: boolean) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  step: 'home',
  setStep: (step) => set({ step }),

  patientName: null,
  patientId: null,
  authMethod: null,
  setPatient: (patientName, patientId, authMethod) => set({ patientName, patientId, authMethod }),

  language: 'en',
  setLanguage: (language) => set({ language }),

  ayushMode: false,
  setAyushMode: (ayushMode) => set({ ayushMode }),

  consent: null,
  setConsent: (consent) => set({ consent }),

  messages: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clearMessages: () => set({ messages: [] }),

  sessionId: null,
  setSessionId: (sessionId) => set({ sessionId }),

  uploadedDocs: [],
  addUploadedDoc: (name) => set((s) => ({ uploadedDocs: [...s.uploadedDocs, name] })),

  redFlagTriggered: false,
  setRedFlagTriggered: (redFlagTriggered) => set({ redFlagTriggered }),
}));

// Staff auth store
interface StaffState {
  role: UserRole | null;
  email: string | null;
  name: string | null;
  setStaff: (role: UserRole, email: string, name: string) => void;
  logout: () => void;
}

export const useStaffStore = create<StaffState>((set) => ({
  role: null,
  email: null,
  name: null,
  setStaff: (role, email, name) => set({ role, email, name }),
  logout: () => set({ role: null, email: null, name: null }),
}));
