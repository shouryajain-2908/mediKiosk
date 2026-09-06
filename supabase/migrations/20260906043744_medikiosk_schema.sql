/*
# MediKiosk - Core Schema

## Overview
Creates the full data model for the MediKiosk AI-powered patient clinical history intake platform.

## Tables
1. `profiles` - Extends auth.users with role (patient/physician/nurse/admin) and demographic info
2. `patient_profiles` - Patient-specific demographic + ABHA data
3. `consultation_sessions` - Each visit/intake session
4. `history_records` - Structured JSON history per session (chief complaint, HPI, past medical, etc.)
5. `uploaded_documents` - Patient-uploaded docs with mock OCR extracted fields
6. `lab_results` - Individual lab values with reference ranges and flagged status
7. `red_flag_alerts` - Real-time red-flag alerts for triage dashboard
8. `audit_logs` - Consent + data-access audit trail
9. `timeline_events` - Aggregated historical events for 3D visualization

## Security
- RLS enabled on all tables
- Owner-scoped policies for patient data
- Staff (physician/nurse/admin) can read all patient data via role check
- Patients can only see their own data
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','physician','nurse','admin')),
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('physician','nurse','admin')));

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Patient profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  abha_id text,
  full_name text NOT NULL,
  date_of_birth date,
  gender text,
  phone text,
  address text,
  blood_group text,
  emergency_contact text,
  preferred_language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_profiles_select" ON patient_profiles;
CREATE POLICY "patient_profiles_select" ON patient_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('physician','nurse','admin')));

DROP POLICY IF EXISTS "patient_profiles_insert" ON patient_profiles;
CREATE POLICY "patient_profiles_insert" ON patient_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "patient_profiles_update" ON patient_profiles;
CREATE POLICY "patient_profiles_update" ON patient_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Consultation sessions
CREATE TABLE IF NOT EXISTS consultation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','history_captured','flagged','confirmed','rejected')),
  language text DEFAULT 'en',
  ayush_mode boolean DEFAULT false,
  consent_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultations_select" ON consultation_sessions;
CREATE POLICY "consultations_select" ON consultation_sessions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patient_profiles pp WHERE pp.id = patient_id AND pp.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('physician','nurse','admin')));

DROP POLICY IF EXISTS "consultations_insert" ON consultation_sessions;
CREATE POLICY "consultations_insert" ON consultation_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "consultations_update" ON consultation_sessions;
CREATE POLICY "consultations_update" ON consultation_sessions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- History records (structured JSON per section)
CREATE TABLE IF NOT EXISTS history_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES consultation_sessions(id) ON DELETE CASCADE,
  chief_complaint text,
  hpi jsonb,
  past_medical jsonb,
  past_surgical jsonb,
  drug_allergy jsonb,
  family_history jsonb,
  personal_history jsonb,
  review_of_systems jsonb,
  prior_investigations jsonb,
  ayush_data jsonb,
  transcript jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE history_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "history_select" ON history_records;
CREATE POLICY "history_select" ON history_records FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM consultation_sessions cs JOIN patient_profiles pp ON pp.id = cs.patient_id WHERE cs.id = session_id AND pp.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('physician','nurse','admin')));

DROP POLICY IF EXISTS "history_insert" ON history_records;
CREATE POLICY "history_insert" ON history_records FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "history_update" ON history_records;
CREATE POLICY "history_update" ON history_records FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- Uploaded documents with OCR fields
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES consultation_sessions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text,
  file_url text,
  ocr_status text DEFAULT 'pending' CHECK (ocr_status IN ('pending','processing','completed','failed')),
  ocr_extracted_data jsonb,
  ocr_confidence numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "docs_select" ON uploaded_documents;
CREATE POLICY "docs_select" ON uploaded_documents FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patient_profiles pp WHERE pp.id = patient_id AND pp.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('physician','nurse','admin')));

DROP POLICY IF EXISTS "docs_insert" ON uploaded_documents;
CREATE POLICY "docs_insert" ON uploaded_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "docs_update" ON uploaded_documents;
CREATE POLICY "docs_update" ON uploaded_documents FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "docs_delete" ON uploaded_documents;
CREATE POLICY "docs_delete" ON uploaded_documents FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Lab results
CREATE TABLE IF NOT EXISTS lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  value numeric,
  unit text,
  reference_range text,
  flagged boolean DEFAULT false,
  category text,
  test_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "labs_select" ON lab_results;
CREATE POLICY "labs_select" ON lab_results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patient_profiles pp WHERE pp.id = patient_id AND pp.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('physician','nurse','admin')));

DROP POLICY IF EXISTS "labs_insert" ON lab_results;
CREATE POLICY "labs_insert" ON lab_results FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "labs_update" ON lab_results;
CREATE POLICY "labs_update" ON lab_results FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- Red flag alerts
CREATE TABLE IF NOT EXISTS red_flag_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES consultation_sessions(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  patient_name text,
  complaint text,
  trigger_keyword text,
  severity text DEFAULT 'high' CHECK (severity IN ('medium','high','critical')),
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE red_flag_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alerts_select" ON red_flag_alerts;
CREATE POLICY "alerts_select" ON red_flag_alerts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patient_profiles pp WHERE pp.id = patient_id AND pp.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('physician','nurse','admin')));

DROP POLICY IF EXISTS "alerts_insert" ON red_flag_alerts;
CREATE POLICY "alerts_insert" ON red_flag_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "alerts_update" ON red_flag_alerts;
CREATE POLICY "alerts_update" ON red_flag_alerts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select" ON audit_logs;
CREATE POLICY "audit_select" ON audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "audit_insert" ON audit_logs;
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Timeline events for 3D visualization
CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patient_profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('visit','lab','prescription','procedure','document')),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  category text,
  severity text DEFAULT 'normal' CHECK (severity IN ('normal','abnormal','critical')),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "timeline_select" ON timeline_events;
CREATE POLICY "timeline_select" ON timeline_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM patient_profiles pp WHERE pp.id = patient_id AND pp.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('physician','nurse','admin')));

DROP POLICY IF EXISTS "timeline_insert" ON timeline_events;
CREATE POLICY "timeline_insert" ON timeline_events FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "timeline_update" ON timeline_events;
CREATE POLICY "timeline_update" ON timeline_events FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultation_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_history_session ON history_records(session_id);
CREATE INDEX IF NOT EXISTS idx_docs_patient ON uploaded_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_labs_patient ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON red_flag_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_timeline_patient ON timeline_events(patient_id);