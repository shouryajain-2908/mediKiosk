/*
# Create appointments table

1. New Tables
- `appointments`
  - `id` (uuid, primary key)
  - `patient_name` (text, not null) — patient's full name
  - `patient_phone` (text, nullable) — contact number
  - `patient_age` (integer, nullable) — patient age
  - `patient_gender` (text, nullable) — male/female/other
  - `department` (text, not null) — e.g. Cardiology, General Medicine, Orthopedics
  - `doctor_name` (text, not null) — doctor's full name
  - `appointment_date` (date, not null) — date of appointment
  - `appointment_time` (text, not null) — time slot like "10:00 AM"
  - `reason` (text, nullable) — chief complaint or reason for visit
  - `language` (text, default 'en') — preferred language
  - `status` (text, default 'pending') — pending / confirmed / completed / cancelled
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `appointments`.
- Allow anon + authenticated CRUD because the kiosk is a walk-in system without login.
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_phone text,
  patient_age integer,
  patient_gender text,
  department text NOT NULL,
  doctor_name text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  reason text,
  language text DEFAULT 'en',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_appointments" ON appointments;
CREATE POLICY "anon_select_appointments" ON appointments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
CREATE POLICY "anon_insert_appointments" ON appointments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_appointments" ON appointments;
CREATE POLICY "anon_update_appointments" ON appointments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_appointments" ON appointments;
CREATE POLICY "anon_delete_appointments" ON appointments FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
