'use client';

import { usePatientStore } from '@/lib/store';
import { translations, ttsLangCodes } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, ArrowRight, Calendar, Clock, Stethoscope, User, Phone,
  CheckCircle2, CalendarDays, Building2, Volume2, Sparkles, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import type { Language } from '@/lib/types';

const departments = [
  { id: 'general', name: { en: 'General Medicine', hi: 'सामान्य चिकित्सा', ta: 'பொது மருத்துவம்', te: 'సాధారణ వైద్యం', bn: 'সাধারণ চিকিৎসা', mr: 'सामान्य औषध' } },
  { id: 'cardiology', name: { en: 'Cardiology', hi: 'हृदय रोग', ta: 'இதயவியல்', te: 'కార్డియాలజీ', bn: 'হৃদরোগ', mr: 'हृदयरोग' } },
  { id: 'orthopedics', name: { en: 'Orthopedics', hi: 'हड्डी रोग', ta: 'எலும்பியல்', te: 'ఆర్థోపెడిక్స్', bn: 'অস্থিচিকিৎসা', mr: 'हाडरोग' } },
  { id: 'pediatrics', name: { en: 'Pediatrics', hi: 'बाल रोग', ta: 'குழந்தையியல்', te: 'పీడియాట్రిక్స్', bn: 'শিশুরোগ', mr: 'बालरोग' } },
  { id: 'dermatology', name: { en: 'Dermatology', hi: 'त्वचा रोग', ta: 'தோலியல்', te: 'డెర్మటాలజీ', bn: 'চর্মরোগ', mr: 'त्वचारोग' } },
  { id: 'ent', name: { en: 'ENT (Ear, Nose, Throat)', hi: 'नाक, कान, गला', ta: 'காது மூக்கு தொண்டை', te: 'ఈఎన్టీ', bn: 'নাক-কান-গলা', mr: 'कान-नाक-घसा' } },
  { id: 'neurology', name: { en: 'Neurology', hi: 'तंत्रिका रोग', ta: 'நரம்பியல்', te: 'న్యూరాలజీ', bn: 'স্নায়ুরোগ', mr: 'मज्जारोग' } },
  { id: 'ayurveda', name: { en: 'Ayurveda (AYUSH)', hi: 'आयुर्वेद (आयुष)', ta: 'ஆயுர்வேதம்', te: 'ఆయుర్వేద', bn: 'আয়ুর্বেদ', mr: 'आयुर्वेद' } },
];

const doctorsByDept: Record<string, { name: string; available: boolean }[]> = {
  general: [{ name: 'Dr. Sharma', available: true }, { name: 'Dr. Patel', available: true }, { name: 'Dr. Reddy', available: true }],
  cardiology: [{ name: 'Dr. Mehta', available: true }, { name: 'Dr. Krishnan', available: true }],
  orthopedics: [{ name: 'Dr. Gupta', available: true }, { name: 'Dr. Nair', available: true }],
  pediatrics: [{ name: 'Dr. Singh', available: true }, { name: 'Dr. Joshi', available: true }],
  dermatology: [{ name: 'Dr. Kapoor', available: true }],
  ent: [{ name: 'Dr. Iyer', available: true }, { name: 'Dr. Rao', available: true }],
  neurology: [{ name: 'Dr. Banerjee', available: true }, { name: 'Dr. Desai', available: true }],
  ayurveda: [{ name: 'Vaidya Agnihotri', available: true }, { name: 'Vaidya Kulkarni', available: true }],
};

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM',
];

const bookedSlots: Record<string, string[]> = {};

function getNext7Days(): { date: string; dayLabel: { en: string; hi: string; ta: string; te: string; bn: string; mr: string }; dayNum: string }[] {
  const days: { date: string; dayLabel: { en: string; hi: string; ta: string; te: string; bn: string; mr: string }; dayNum: string }[] = [];
  const dayNames = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    ta: ['ஞாயி', 'திங்', 'செவ்', 'புத', 'வியா', 'வெள்', 'சனி'],
    te: ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
    bn: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'গুরু', 'শুক্র', 'শনি'],
    mr: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  };
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dow = d.getDay();
    days.push({
      date: dateStr,
      dayLabel: {
        en: dayNames.en[dow],
        hi: dayNames.hi[dow],
        ta: dayNames.ta[dow],
        te: dayNames.te[dow],
        bn: dayNames.bn[dow],
        mr: dayNames.mr[dow],
      },
      dayNum: String(d.getDate()),
    });
  }
  return days;
}

export default function AppointmentPage() {
  const { language, patientName, patientId, setStep } = usePatientStore();
  const router = useRouter();
  const t = translations[language] || translations.en;

  const [step, setBookingStep] = useState<'form' | 'department' | 'doctor' | 'datetime' | 'confirm' | 'success'>('form');
  const [name, setName] = useState(patientName || '');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [reason, setReason] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);

  const days = getNext7Days();

  const speakText = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      utter.lang = ttsLangCodes[language] || 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = (ttsLangCodes[language] || 'en-US').split('-')[0];
      const langVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      if (langVoice) utter.voice = langVoice;
      window.speechSynthesis.speak(utter);
    }
  }, [language]);

  const handleFormSubmit = () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (!phone.trim() || phone.length < 10) { toast.error('Please enter a valid phone number'); return; }
    if (!age.trim()) { toast.error('Please enter your age'); return; }
    if (!gender) { toast.error('Please select your gender'); return; }
    setBookingStep('department');
  };

  const handleBook = async () => {
    setBooking(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_name: name,
          patient_phone: phone,
          patient_age: parseInt(age),
          patient_gender: gender,
          department: departments.find(d => d.id === selectedDept)?.name.en || selectedDept,
          doctor_name: selectedDoctor,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          reason: reason || null,
          language: language,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setConfirmationId(data.id);
      setBookingStep('success');

      const confirmMsg = {
        en: `Appointment confirmed with ${selectedDoctor} on ${selectedDate} at ${selectedTime}. Your appointment ID is ${data.id.slice(0, 8).toUpperCase()}.`,
        hi: `${selectedDoctor} के साथ ${selectedDate} को ${selectedTime} पर अपॉइंटमेंट तय हो गया है। आपका अपॉइंटमेंट आईडी ${data.id.slice(0, 8).toUpperCase()} है।`,
        ta: `${selectedDoctor} உடன் ${selectedDate} அன்று ${selectedTime} மணிக்கு சந்திப்பு உறுதி செய்யப்பட்டது.`,
        te: `${selectedDoctor} తో ${selectedDate} నాడు ${selectedTime} కి అపాయింట్‌మెంట్ నిర్ధారించబడింది.`,
        bn: `${selectedDoctor} এর সাথে ${selectedDate} তারিখে ${selectedTime} সময়ে অ্যাপয়েন্টমেন্ট নিশ্চিত।`,
        mr: `${selectedDoctor} यांच्याशी ${selectedDate} रोजी ${selectedTime} वाजता अपॉइंटमेंट निश्चित झाले आहे.`,
      };
      speakText(confirmMsg[language] || confirmMsg.en);
      toast.success('Appointment booked successfully!');
    } catch (err: any) {
      toast.error('Failed to book appointment. Please try again.');
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  // Success screen
  if (step === 'success' && confirmationId) {
    const shortId = confirmationId.slice(0, 8).toUpperCase();
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white px-6">
        <Card className="max-w-md border-teal-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <CheckCircle2 className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-800">Appointment Confirmed!</h2>
            <p className="mb-2 text-slate-600">
              {name}, your appointment with <span className="font-semibold">{selectedDoctor}</span> has been booked.
            </p>
            <div className="my-4 rounded-xl bg-sky-50 p-4">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
                <Calendar className="h-4 w-4 text-sky-500" />
                <span className="font-medium">{selectedDate}</span>
                <Clock className="ml-2 h-4 w-4 text-teal-500" />
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-700">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span>{departments.find(d => d.id === selectedDept)?.name[language] || departments.find(d => d.id === selectedDept)?.name.en}</span>
              </div>
            </div>
            <p className="mb-4 text-xs text-slate-400">
              Appointment ID: <span className="font-mono font-semibold text-slate-600">{shortId}</span>
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => { setStep('home'); router.push('/'); }}
                className="h-12 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
              >
                Return to Home <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => { setStep('auth'); router.push('/patient'); }}
                className="h-12 w-full border-slate-300 text-slate-700"
              >
                Start Clinical Intake Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confirm step
  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <Button variant="ghost" onClick={() => setBookingStep('datetime')} className="text-slate-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h2 className="text-sm font-semibold text-slate-800">Confirm Appointment</h2>
            <div className="w-16" />
          </div>
        </header>
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
          <Card className="border-sky-200 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-slate-400">Patient</p>
                    <p className="font-semibold text-slate-800">{name}</p>
                    <p className="text-sm text-slate-500">{age} yrs, {gender} • {phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-xs text-slate-400">Department</p>
                    <p className="font-semibold text-slate-800">{departments.find(d => d.id === selectedDept)?.name[language] || departments.find(d => d.id === selectedDept)?.name.en}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-slate-400">Doctor</p>
                    <p className="font-semibold text-slate-800">{selectedDoctor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-xs text-slate-400">Date & Time</p>
                    <p className="font-semibold text-slate-800">{selectedDate} at {selectedTime}</p>
                  </div>
                </div>
                {reason && (
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Reason for Visit</p>
                      <p className="text-sm text-slate-600">{reason}</p>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={handleBook}
                disabled={booking}
                className="h-14 w-full bg-gradient-to-r from-green-500 to-teal-500 text-base font-semibold hover:from-green-600 hover:to-teal-600"
              >
                {booking ? 'Booking...' : 'Confirm & Book Appointment'}
                {!booking && <CheckCircle2 className="ml-2 h-5 w-5" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Datetime step
  if (step === 'datetime') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <Button variant="ghost" onClick={() => setBookingStep('doctor')} className="text-slate-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h2 className="text-sm font-semibold text-slate-800">Select Date & Time</h2>
            <div className="w-16" />
          </div>
        </header>
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
          {/* Date selection */}
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Select a Date</h3>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <button
                key={day.date}
                onClick={() => { setSelectedDate(day.date); setSelectedTime(null); }}
                className={`flex min-w-[72px] flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                  selectedDate === day.date
                    ? 'border-sky-500 bg-sky-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-sky-300'
                }`}
              >
                <span className="text-xs font-medium text-slate-500">{day.dayLabel[language as keyof typeof day.dayLabel] || day.dayLabel.en}</span>
                <span className="text-lg font-bold text-slate-800">{day.dayNum}</span>
              </button>
            ))}
          </div>

          {/* Time slots */}
          {selectedDate && (
            <>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Available Time Slots</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {timeSlots.map((slot) => {
                  const bookedKey = `${selectedDate}-${selectedDoctor}`;
                  const isBooked = bookedSlots[bookedKey]?.includes(slot);
                  return (
                    <button
                      key={slot}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(slot)}
                      className={`flex items-center justify-center gap-1 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                        isBooked
                          ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'
                          : selectedTime === slot
                          ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {slot}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {selectedDate && selectedTime && (
            <Button
              onClick={() => setBookingStep('confirm')}
              className="mt-6 h-14 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
            >
              Continue to Confirm <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Doctor step
  if (step === 'doctor') {
    const doctors = selectedDept ? doctorsByDept[selectedDept] || [] : [];
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <Button variant="ghost" onClick={() => setBookingStep('department')} className="text-slate-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h2 className="text-sm font-semibold text-slate-800">Select Doctor</h2>
            <div className="w-16" />
          </div>
        </header>
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
          <div className="space-y-3">
            {doctors.map((doc) => (
              <button
                key={doc.name}
                onClick={() => { setSelectedDoctor(doc.name); setBookingStep('datetime'); }}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  selectedDoctor === doc.name
                    ? 'border-sky-500 bg-sky-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-sky-300'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-teal-100">
                  <Stethoscope className="h-6 w-6 text-sky-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{doc.name}</p>
                  <p className="text-sm text-slate-500">
                    {departments.find(d => d.id === selectedDept)?.name[language] || departments.find(d => d.id === selectedDept)?.name.en}
                  </p>
                </div>
                {doc.available ? (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Available</span>
                ) : (
                  <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Full</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Department step
  if (step === 'department') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <Button variant="ghost" onClick={() => setBookingStep('form')} className="text-slate-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h2 className="text-sm font-semibold text-slate-800">Select Department</h2>
            <div className="w-16" />
          </div>
        </header>
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => { setSelectedDept(dept.id); setBookingStep('doctor'); }}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  selectedDept === dept.id
                    ? 'border-sky-500 bg-sky-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-sky-300'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-100 to-teal-100">
                  <Building2 className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{dept.name[language] || dept.name.en}</p>
                  <p className="text-xs text-slate-400">{(doctorsByDept[dept.id] || []).length} doctor(s) available</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Form step (default)
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Book Appointment</h2>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100">
            <CalendarDays className="h-8 w-8 text-sky-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            {language === 'hi' ? 'अपॉइंटमेंट बुक करें' :
             language === 'ta' ? 'சந்திப்பு பதிவு செய்யவும்' :
             language === 'te' ? 'అపాయింట్‌మెంట్ బుక్ చేయండి' :
             language === 'bn' ? 'অ্যাপয়েন্টমেন্ট বুক করুন' :
             language === 'mr' ? 'अपॉइंटमेंट बुक करा' :
             'Book an Appointment'}
          </h1>
          <p className="text-slate-600">
            {language === 'hi' ? 'अपनी जानकारी भरें और डॉक्टर के साथ अपॉइंटमेंट तय करें' :
             language === 'ta' ? 'உங்கள் விவரங்களை உள்ளிட்டு மருத்துவருடன் சந்திப்பை பதிவு செய்யவும்' :
             language === 'te' ? 'మీ వివరాలను నమోదు చేసి డాక్టర్‌తో అపాయింట్‌మెంట్ తీసుకోండి' :
             language === 'bn' ? 'আপনার তথ্য পূরণ করে ডাক্তারের সাথে অ্যাপয়েন্টমেন্ট নিন' :
             language === 'mr' ? 'तुमची माहिती भरा आणि डॉक्टरांसोबत अपॉइंटमेंट बुक करा' :
             'Enter your details and schedule a visit with a doctor'}
          </p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm text-slate-600">
                {language === 'hi' ? 'पूरा नाम' : language === 'ta' ? 'முழு பெயர்' : language === 'te' ? 'పూర్తి పేరు' : language === 'bn' ? 'পুরো নাম' : language === 'mr' ? 'पूर्ण नाव' : 'Full Name'}
              </Label>
              <Input
                id="name"
                placeholder={language === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-12 text-base"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone" className="text-sm text-slate-600">
                  {language === 'hi' ? 'मोबाइल नंबर' : language === 'ta' ? 'கைபேசி எண்' : language === 'te' ? 'మొబైల్ నంబర్' : language === 'bn' ? 'মোবাইল নম্বর' : language === 'mr' ? 'मोबाईल नंबर' : 'Mobile Number'}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-12 text-base"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-sm text-slate-600">
                  {language === 'hi' ? 'आयु' : language === 'ta' ? 'வயது' : language === 'te' ? 'వయసు' : language === 'bn' ? 'বয়স' : language === 'mr' ? 'वय' : 'Age'}
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="35"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1 h-12 text-base"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gender" className="text-sm text-slate-600">
                {language === 'hi' ? 'लिंग' : language === 'ta' ? 'பாலினம்' : language === 'te' ? 'లింగం' : language === 'bn' ? 'লিঙ্গ' : language === 'mr' ? 'लिंग' : 'Gender'}
              </Label>
              <div className="mt-1 flex gap-2">
                {[
                  { value: 'male', label: { en: 'Male', hi: 'पुरुष', ta: 'ஆண்', te: 'పురుషుడు', bn: 'পুরুষ', mr: 'पुरुष' } },
                  { value: 'female', label: { en: 'Female', hi: 'महिला', ta: 'பெண்', te: 'మహిళ', bn: 'মহিলা', mr: 'महिला' } },
                  { value: 'other', label: { en: 'Other', hi: 'अन्य', ta: 'மற்றவை', te: 'ఇతర', bn: 'অন্যান্য', mr: 'इतर' } },
                ].map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGender(g.value)}
                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                      gender === g.value
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300'
                    }`}
                  >
                    {g.label[language] || g.label.en}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="reason" className="text-sm text-slate-600">
                {language === 'hi' ? 'मिलने का कारण (वैकल्पिक)' : language === 'ta' ? 'சந்திப்பதற்கான காரணம் (விருப்பத்தேர்வு)' : language === 'te' ? 'సందర్శించడానికి కారణం (ఐచ్ఛిక)' : language === 'bn' ? 'দেখানোর কারণ (ঐচ্ছিক)' : language === 'mr' ? 'भेटण्याचे कारण (पर्यायी)' : 'Reason for Visit (optional)'}
              </Label>
              <Input
                id="reason"
                placeholder={language === 'hi' ? 'लक्षण या समस्या का वर्णन करें' : 'Describe your symptoms or concern'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 h-12 text-base"
              />
            </div>
            <Button
              onClick={handleFormSubmit}
              className="h-14 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
            >
              {language === 'hi' ? 'विभाग चुनें' : language === 'ta' ? 'துறையை தேர்வு செய்யவும்' : language === 'te' ? 'విభాగం ఎంచుకోండి' : language === 'bn' ? 'বিভাগ নির্বাচন করুন' : language === 'mr' ? 'विभाग निवडा' : 'Select Department'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
