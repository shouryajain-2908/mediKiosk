export type UserRole = 'patient' | 'physician' | 'nurse' | 'admin';

export type SessionStatus = 'in_progress' | 'history_captured' | 'flagged' | 'confirmed' | 'rejected';

export type TimelineEventType = 'visit' | 'lab' | 'prescription' | 'procedure' | 'document';

export type Severity = 'normal' | 'abnormal' | 'critical';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr';

export interface TimelineEvent {
  id: string;
  patient_id: string;
  event_type: TimelineEventType;
  title: string;
  description: string | null;
  event_date: string;
  category: string;
  severity: Severity;
  metadata: Record<string, unknown> | null;
}

export interface PatientProfile {
  id: string;
  user_id: string | null;
  abha_id: string | null;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  blood_group: string | null;
  emergency_contact: string | null;
  preferred_language: Language;
}

export interface ConsultationSession {
  id: string;
  patient_id: string;
  status: SessionStatus;
  language: Language;
  ayush_mode: boolean;
  consent_data: ConsentData | null;
  created_at: string;
  updated_at: string;
}

export interface ConsentData {
  data_capture: boolean;
  share_with_his: boolean;
  share_with_abha: boolean;
  consent_text: string;
  consented_at: string;
}

export interface HistoryRecord {
  id: string;
  session_id: string;
  chief_complaint: string | null;
  hpi: HistorySection | null;
  past_medical: HistorySection | null;
  past_surgical: HistorySection | null;
  drug_allergy: HistorySection | null;
  family_history: HistorySection | null;
  personal_history: HistorySection | null;
  review_of_systems: HistorySection | null;
  prior_investigations: HistorySection | null;
  ayush_data: AyushData | null;
  transcript: ChatMessage[] | null;
}

export type HistorySection = Record<string, string | string[] | null>;

export interface AyushData {
  prakriti: string | null;
  vikriti: string | null;
  sara: string | null;
  samhanana: string | null;
  pramana: string | null;
  satmya: string | null;
  sattva: string | null;
  ahara_shakti: string | null;
  vyayama_shakti: string | null;
  vaya: string | null;
  ahara_vihara: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  quickReplies?: string[];
  source?: 'socrates' | 'ayush' | 'general';
}

export interface UploadedDocument {
  id: string;
  patient_id: string;
  session_id: string | null;
  file_name: string;
  file_type: string | null;
  file_url: string | null;
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed';
  ocr_extracted_data: OcrExtractedData | null;
  ocr_confidence: number;
  created_at: string;
}

export interface OcrExtractedData {
  diagnosis?: string[];
  medications?: string[];
  labValues?: { name: string; value: string; unit: string; referenceRange: string; confidence: number }[];
  patientName?: string;
  date?: string;
  hospital?: string;
}

export interface LabResult {
  id: string;
  patient_id: string;
  test_name: string;
  value: number | null;
  unit: string | null;
  reference_range: string | null;
  flagged: boolean;
  category: string | null;
  test_date: string | null;
}

export interface RedFlagAlert {
  id: string;
  session_id: string | null;
  patient_id: string | null;
  patient_name: string | null;
  complaint: string | null;
  trigger_keyword: string | null;
  severity: 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}
