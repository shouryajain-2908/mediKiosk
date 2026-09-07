'use client';

import { useStaffStore, usePatientStore } from '@/lib/store';
import { mockTimelineEvents, mockLabResults, mockOcrResults, translations, redFlagRules } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  HeartPulse, LogOut, Users, AlertTriangle, FileText, Activity, Pill,
  Stethoscope, Shield, UserCog, ChevronRight, Clock, CheckCircle2,
  Volume2, Phone, MapPin, Calendar, TrendingUp, TrendingDown, FlaskConical,
  ArrowLeft
} from 'lucide-react';
import type { UserRole, Language } from '@/lib/types';

interface MockPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  language: Language;
  ayushMode: boolean;
  status: 'waiting' | 'in_progress' | 'history_captured' | 'flagged' | 'confirmed';
  checkInTime: string;
  chiefComplaint: string;
  redFlags: { keyword: string; label: string; severity: string }[];
  summary: {
    chiefComplaint: string;
    hpi: { site: string; onset: string; character: string; severity: string };
    pastMedical: string;
    pastSurgical: string;
    allergies: string;
    familyHistory: string;
    personalHistory: string;
  };
  docsUploaded: number;
  timelineEvents: typeof mockTimelineEvents;
  labResults: typeof mockLabResults;
}

const mockPatients: MockPatient[] = [
  {
    id: 'p001',
    name: 'Rajesh Kumar',
    age: 54,
    gender: 'Male',
    phone: '+91 98765 43210',
    language: 'hi',
    ayushMode: false,
    status: 'history_captured',
    checkInTime: '09:42 AM',
    chiefComplaint: 'Chest pain and shortness of breath',
    redFlags: [
      { keyword: 'chest pain', label: 'Severe chest pain', severity: 'critical' },
      { keyword: 'shortness of breath', label: 'Breathing difficulty', severity: 'critical' },
    ],
    summary: {
      chiefComplaint: 'Chest pain and shortness of breath since yesterday morning',
      hpi: { site: 'Chest, radiating to left arm', onset: 'Yesterday morning, sudden', character: 'Sharp, throbbing pain', severity: '7-8 (Severe)' },
      pastMedical: 'Hypertension, Pre-diabetes',
      pastSurgical: 'No surgeries',
      allergies: 'No allergies',
      familyHistory: 'Heart disease in family (father)',
      personalHistory: 'Smoker, occasional alcohol',
    },
    docsUploaded: 2,
    timelineEvents: mockTimelineEvents.slice(0, 10),
    labResults: mockLabResults.slice(0, 8),
  },
  {
    id: 'p002',
    name: 'Priya Sharma',
    age: 32,
    gender: 'Female',
    phone: '+91 98123 45678',
    language: 'en',
    ayushMode: true,
    status: 'history_captured',
    checkInTime: '10:15 AM',
    chiefComplaint: 'Joint pain and fatigue',
    redFlags: [],
    summary: {
      chiefComplaint: 'Joint pain and fatigue for past 2 weeks',
      hpi: { site: 'Knees and wrists', onset: '2 weeks ago, gradual', character: 'Dull ache, stiffness', severity: '3-4 (Moderate)' },
      pastMedical: 'Hypothyroidism',
      pastSurgical: 'No surgeries',
      allergies: 'Penicillin',
      familyHistory: 'Arthritis in family (mother)',
      personalHistory: 'Non-smoker, vegetarian',
    },
    docsUploaded: 1,
    timelineEvents: mockTimelineEvents.slice(5, 12),
    labResults: mockLabResults.slice(8, 14),
  },
  {
    id: 'p003',
    name: 'Mohammed Irfan',
    age: 67,
    gender: 'Male',
    phone: '+91 90000 12345',
    language: 'ta',
    ayushMode: false,
    status: 'flagged',
    checkInTime: '10:30 AM',
    chiefComplaint: 'Severe headache and vomiting',
    redFlags: [
      { keyword: 'severe headache', label: 'Severe headache', severity: 'high' },
    ],
    summary: {
      chiefComplaint: 'Severe headache with vomiting since last night',
      hpi: { site: 'Head, frontal region', onset: 'Last night, sudden', character: 'Throbbing, worst headache', severity: '9-10 (Very severe)' },
      pastMedical: 'Hypertension',
      pastSurgical: 'Appendectomy (2015)',
      allergies: 'Sulfa drugs',
      familyHistory: 'No significant family history',
      personalHistory: 'Former smoker, quit 5 years ago',
    },
    docsUploaded: 0,
    timelineEvents: mockTimelineEvents.slice(2, 8),
    labResults: mockLabResults.slice(2, 6),
  },
  {
    id: 'p004',
    name: 'Anita Desai',
    age: 28,
    gender: 'Female',
    phone: '+91 88776 54321',
    language: 'mr',
    ayushMode: true,
    status: 'in_progress',
    checkInTime: '10:45 AM',
    chiefComplaint: 'Digestive issues',
    redFlags: [],
    summary: {
      chiefComplaint: 'In progress — answering AI questions',
      hpi: { site: '-', onset: '-', character: '-', severity: '-' },
      pastMedical: '-',
      pastSurgical: '-',
      allergies: '-',
      familyHistory: '-',
      personalHistory: '-',
    },
    docsUploaded: 0,
    timelineEvents: [],
    labResults: [],
  },
  {
    id: 'p005',
    name: 'Subramanian Iyer',
    age: 45,
    gender: 'Male',
    phone: '+91 99887 76655',
    language: 'ta',
    ayushMode: false,
    status: 'confirmed',
    checkInTime: '08:55 AM',
    chiefComplaint: 'Routine checkup',
    redFlags: [],
    summary: {
      chiefComplaint: 'Routine follow-up for hypertension',
      hpi: { site: 'N/A', onset: 'N/A', character: 'N/A', severity: 'N/A' },
      pastMedical: 'Hypertension, on Telmisartan 40mg',
      pastSurgical: 'No surgeries',
      allergies: 'No allergies',
      familyHistory: 'Hypertension in both parents',
      personalHistory: 'Non-smoker, regular exercise',
    },
    docsUploaded: 3,
    timelineEvents: mockTimelineEvents.slice(0, 15),
    labResults: mockLabResults,
  },
  {
    id: 'p006',
    name: 'Kavya Reddy',
    age: 21,
    gender: 'Female',
    phone: '+91 76543 21098',
    language: 'te',
    ayushMode: false,
    status: 'waiting',
    checkInTime: '11:02 AM',
    chiefComplaint: 'Not yet started',
    redFlags: [],
    summary: {
      chiefComplaint: 'Waiting to start AI interview',
      hpi: { site: '-', onset: '-', character: '-', severity: '-' },
      pastMedical: '-',
      pastSurgical: '-',
      allergies: '-',
      familyHistory: '-',
      personalHistory: '-',
    },
    docsUploaded: 0,
    timelineEvents: [],
    labResults: [],
  },
];

const roleConfig: Record<UserRole, { icon: typeof Stethoscope; label: string; color: string }> = {
  patient: { icon: Users, label: 'Patient', color: 'slate' },
  physician: { icon: Stethoscope, label: 'Physician', color: 'sky' },
  nurse: { icon: Shield, label: 'Triage Nurse', color: 'teal' },
  admin: { icon: UserCog, label: 'Administrator', color: 'slate' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  waiting: { label: 'Waiting', color: 'text-slate-600', bg: 'bg-slate-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-100' },
  history_captured: { label: 'History Captured', color: 'text-teal-600', bg: 'bg-teal-100' },
  flagged: { label: 'Flagged', color: 'text-red-600', bg: 'bg-red-100' },
  confirmed: { label: 'Confirmed', color: 'text-green-600', bg: 'bg-green-100' },
};

export default function StaffDashboard() {
  const { role, email, name, logout } = useStaffStore();
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<MockPatient | null>(null);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'waiting' | 'captured'>('all');

  useEffect(() => {
    if (!role) {
      const savedRole = localStorage.getItem('medikiosk_staff_role');
      if (!savedRole) {
        router.push('/staff/login');
      }
    }
  }, [role, router]);

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  const RoleIcon = roleConfig[role].icon;

  const filteredPatients = useMemo(() => {
    if (filter === 'all') return mockPatients;
    if (filter === 'flagged') return mockPatients.filter(p => p.status === 'flagged');
    if (filter === 'waiting') return mockPatients.filter(p => p.status === 'waiting' || p.status === 'in_progress');
    if (filter === 'captured') return mockPatients.filter(p => p.status === 'history_captured' || p.status === 'confirmed');
    return mockPatients;
  }, [filter]);

  const flaggedCount = mockPatients.filter(p => p.status === 'flagged').length;
  const waitingCount = mockPatients.filter(p => p.status === 'waiting' || p.status === 'in_progress').length;
  const capturedCount = mockPatients.filter(p => p.status === 'history_captured' || p.status === 'confirmed').length;

  const handleLogout = () => {
    logout();
    localStorage.removeItem('medikiosk_staff_role');
    localStorage.removeItem('medikiosk_staff_email');
    localStorage.removeItem('medikiosk_staff_name');
    router.push('/');
  };

  // Patient detail view
  if (selectedPatient) {
    const p = selectedPatient;
    const st = statusConfig[p.status];
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(null)} className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-800">MediKiosk Staff</span>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-slate-600">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
          {/* Patient header card */}
          <Card className="mb-4 border-sky-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100">
                    <Users className="h-7 w-7 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{p.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span>{p.age} yrs, {p.gender}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {p.phone}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Checked in {p.checkInTime}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge className={`${st.bg} ${st.color} border-0`}>{st.label}</Badge>
                      <Badge variant="outline" className="border-slate-200 text-slate-600">
                        {p.language.toUpperCase()}
                      </Badge>
                      {p.ayushMode && (
                        <Badge className="border-0 bg-amber-100 text-amber-700">AYUSH Mode</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Red flag alerts */}
          {p.redFlags.length > 0 && (
            <Card className="mb-4 border-red-300 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-700">Red Flag Alerts</h3>
                    <div className="mt-2 space-y-1">
                      {p.redFlags.map((rf, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Badge className={`border-0 ${
                            rf.severity === 'critical' ? 'bg-red-600 text-white' :
                            rf.severity === 'high' ? 'bg-red-400 text-white' :
                            'bg-orange-400 text-white'
                          }`}>
                            {rf.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-red-700">{rf.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clinical Summary */}
          <Card className="mb-4 border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                <FileText className="h-4 w-4 text-sky-500" /> AI-Captured Clinical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-semibold text-slate-700">Chief Complaint</h4>
                <p className="text-sm text-slate-600">{p.summary.chiefComplaint}</p>
              </div>
              <Separator />
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">History of Present Illness</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-400">Site</span>
                    <p className="text-sm text-slate-600">{p.summary.hpi.site}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-400">Onset</span>
                    <p className="text-sm text-slate-600">{p.summary.hpi.onset}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-400">Character</span>
                    <p className="text-sm text-slate-600">{p.summary.hpi.character}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-400">Severity</span>
                    <p className="text-sm text-slate-600">{p.summary.hpi.severity}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-700">Past Medical History</h4>
                  <p className="text-sm text-slate-600">{p.summary.pastMedical}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-700">Past Surgical History</h4>
                  <p className="text-sm text-slate-600">{p.summary.pastSurgical}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-700">Drug Allergies</h4>
                  <p className="text-sm text-slate-600">{p.summary.allergies}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-700">Family History</h4>
                  <p className="text-sm text-slate-600">{p.summary.familyHistory}</p>
                </div>
                <div className="sm:col-span-2">
                  <h4 className="mb-1 text-sm font-semibold text-slate-700">Personal History</h4>
                  <p className="text-sm text-slate-600">{p.summary.personalHistory}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          <Card className="mb-4 border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                <FileText className="h-4 w-4 text-teal-500" /> Uploaded Documents ({p.docsUploaded})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {p.docsUploaded > 0 ? (
                <div className="space-y-2">
                  {mockOcrResults.slice(0, p.docsUploaded).map((doc, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{doc.hospital} — {doc.date}</p>
                          <p className="text-xs text-slate-500">Diagnoses: {doc.diagnosis.join(', ')}</p>
                        </div>
                        <Badge variant="outline" className="border-teal-200 text-teal-600">OCR Extracted</Badge>
                      </div>
                      {doc.medications.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {doc.medications.map((med, j) => (
                            <span key={j} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700">{med}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No documents uploaded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Lab Results */}
          {p.labResults.length > 0 && (
            <Card className="mb-4 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                  <FlaskConical className="h-4 w-4 text-purple-500" /> Lab Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {p.labResults.map((lab, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{lab.test_name}</p>
                        <p className="text-xs text-slate-400">Range: {lab.reference_range}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">
                          {lab.value} {lab.unit}
                        </span>
                        {lab.flagged ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {p.timelineEvents.length > 0 && (
            <Card className="mb-4 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                  <Activity className="h-4 w-4 text-sky-500" /> Health Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {p.timelineEvents.slice(0, 6).map((event, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                        event.severity === 'critical' ? 'bg-red-400' :
                        event.severity === 'abnormal' ? 'bg-amber-400' : 'bg-teal-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700">{event.title}</p>
                          <span className="text-xs text-slate-400">{event.event_date}</span>
                        </div>
                        <p className="text-xs text-slate-500">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {p.status === 'history_captured' && (
              <Button className="h-12 flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-base font-semibold hover:from-green-600 hover:to-teal-600">
                <CheckCircle2 className="mr-2 h-5 w-5" /> Confirm & Call Patient
              </Button>
            )}
            {p.status === 'flagged' && (
              <Button className="h-12 flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-base font-semibold hover:from-red-600 hover:to-orange-600">
                <AlertTriangle className="mr-2 h-5 w-5" /> Acknowledge Alert & Prioritize
              </Button>
            )}
            <Button variant="outline" className="h-12 border-slate-300">
              <Volume2 className="mr-2 h-4 w-4 text-teal-600" /> Read Summary
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">MediKiosk Staff Portal</h2>
            <p className="text-xs text-slate-500">{name} • {roleConfig[role].label}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-slate-600">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                  <Users className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{mockPatients.length}</p>
                  <p className="text-xs text-slate-500">Total Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{flaggedCount}</p>
                  <p className="text-xs text-slate-500">Red Flag Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{waitingCount}</p>
                  <p className="text-xs text-slate-500">In Queue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-teal-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{capturedCount}</p>
                  <p className="text-xs text-slate-500">Ready for Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All Patients' },
            { key: 'flagged', label: 'Flagged' },
            { key: 'waiting', label: 'In Queue' },
            { key: 'captured', label: 'Ready for Review' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Patient queue */}
        <div className="space-y-3">
          {filteredPatients.map((p) => {
            const st = statusConfig[p.status];
            return (
              <Card
                key={p.id}
                className={`cursor-pointer border-slate-200 shadow-sm transition-all hover:shadow-md ${
                  p.status === 'flagged' ? 'border-l-4 border-l-red-500' : ''
                }`}
                onClick={() => setSelectedPatient(p)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        p.status === 'flagged' ? 'bg-red-100' : 'bg-sky-100'
                      }`}>
                        {p.status === 'flagged' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Users className="h-5 w-5 text-sky-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800">{p.name}</h3>
                          <Badge className={`${st.bg} ${st.color} border-0`}>{st.label}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {p.age} yrs, {p.gender} • {p.language.toUpperCase()} • {p.checkInTime}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{p.chiefComplaint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.redFlags.length > 0 && (
                        <Badge className="border-0 bg-red-600 text-white">
                          {p.redFlags.length} Alert{p.redFlags.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {p.ayushMode && (
                        <Badge className="border-0 bg-amber-100 text-amber-700">AYUSH</Badge>
                      )}
                      {p.docsUploaded > 0 && (
                        <Badge variant="outline" className="border-slate-200 text-slate-500">
                          {p.docsUploaded} doc{p.docsUploaded > 1 ? 's' : ''}
                        </Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPatients.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="text-slate-400">No patients in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
