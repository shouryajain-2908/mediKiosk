'use client';

import { usePatientStore } from '@/lib/store';
import { translations, mockTimelineEvents } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Phone, ShieldCheck, UserPlus, Languages, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Language } from '@/lib/types';

const languages: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

export default function PatientFlow() {
  const step = usePatientStore((s) => s.step);
  const setStep = usePatientStore((s) => s.setStep);
  const language = usePatientStore((s) => s.language);
  const setLanguage = usePatientStore((s) => s.setLanguage);
  const setPatient = usePatientStore((s) => s.setPatient);
  const ayushMode = usePatientStore((s) => s.ayushMode);
  const setAyushMode = usePatientStore((s) => s.setAyushMode);
  const consent = usePatientStore((s) => s.consent);
  const setConsent = usePatientStore((s) => s.setConsent);
  const router = useRouter();

  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [walkinName, setWalkinName] = useState('');
  const [walkinDob, setWalkinDob] = useState('');
  const [walkinGender, setWalkinGender] = useState('');
  const [consentToggles, setConsentToggles] = useState({ data_capture: false, share_with_his: false, share_with_abha: false });

  const t = translations[language] || translations.en;

  useEffect(() => {
    if (step === 'home') setStep('auth');
  }, [step, setStep]);

  const handleSendOtp = () => {
    if (mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    toast.success('OTP sent! (Demo: use 1234)');
  };

  const handleVerifyOtp = () => {
    if (otp !== '1234') {
      toast.error('Invalid OTP. Use 1234 for demo.');
      return;
    }
    setPatient('Walk-in Patient (OTP)', `otp-${Date.now()}`, 'otp');
    setStep('language');
    toast.success('Verified successfully!');
  };

  const handleAbha = () => {
    // Simulate ABHA OAuth handshake
    toast.info('Connecting to ABHA...', { duration: 1500 });
    setTimeout(() => {
      setPatient('Rajesh Kumar', 'a0000000-0000-0000-0000-000000000001', 'abha');
      setStep('language');
      toast.success('ABHA ID connected: 12-3456-7890-1234');
    }, 1500);
  };

  const handleWalkin = () => {
    if (!walkinName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setPatient(walkinName, `walkin-${Date.now()}`, 'walkin');
    setStep('language');
    toast.success('Walk-in patient registered');
  };

  const handleConsent = () => {
    if (!consentToggles.data_capture) {
      toast.error('Please consent to data capture to continue');
      return;
    }
    setConsent({
      ...consentToggles,
      consent_text: 'I consent to MediKiosk collecting my clinical history for the purpose of sharing with my treating physician.',
      consented_at: new Date().toISOString(),
    });
    setStep('chat');
    router.push('/patient/chat');
  };

  // Auth step
  if (step === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-md px-6 py-8">
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-4 text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-slate-800">Welcome to MediKiosk</h1>
            <p className="text-slate-600">Choose how you'd like to begin your visit</p>
          </div>

          <Card className="mb-4 border-sky-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-700">
                <Phone className="h-5 w-5 text-sky-500" /> Mobile OTP Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!otpSent ? (
                <>
                  <div>
                    <Label htmlFor="mobile" className="text-sm text-slate-600">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="mt-1 h-12 text-base"
                      maxLength={10}
                    />
                  </div>
                  <Button onClick={handleSendOtp} className="h-12 w-full bg-sky-500 text-base hover:bg-sky-600">
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="otp" className="text-sm text-slate-600">Enter OTP (Demo: 1234)</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mt-1 h-12 text-base tracking-widest"
                      maxLength={4}
                    />
                  </div>
                  <Button onClick={handleVerifyOtp} className="h-12 w-full bg-sky-500 text-base hover:bg-sky-600">
                    Verify & Continue
                  </Button>
                  <Button variant="ghost" onClick={() => setOtpSent(false)} className="w-full text-sm text-slate-500">
                    Change number
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <Card className="mb-4 border-teal-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-700">
                <ShieldCheck className="h-5 w-5 text-teal-500" /> Connect ABHA ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-slate-600">Link your Ayushman Bharat Health Account for a complete medical record.</p>
              <Button onClick={handleAbha} variant="outline" className="h-12 w-full border-teal-300 text-base text-teal-700 hover:bg-teal-50">
                Login with ABHA
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-700">
                <UserPlus className="h-5 w-5 text-slate-500" /> Walk-in Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="walkinName" className="text-sm text-slate-600">Full Name</Label>
                <Input
                  id="walkinName"
                  placeholder="Enter your name"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="mt-1 h-12 text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="walkinDob" className="text-sm text-slate-600">Date of Birth</Label>
                  <Input
                    id="walkinDob"
                    type="date"
                    value={walkinDob}
                    onChange={(e) => setWalkinDob(e.target.value)}
                    className="mt-1 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="walkinGender" className="text-sm text-slate-600">Gender</Label>
                  <select
                    id="walkinGender"
                    value={walkinGender}
                    onChange={(e) => setWalkinGender(e.target.value)}
                    className="mt-1 h-12 w-full rounded-md border border-input bg-background px-3 text-base"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleWalkin} className="h-12 w-full bg-slate-700 text-base hover:bg-slate-800">
                Continue as Walk-in
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Language step
  if (step === 'language') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-md px-6 py-8">
          <Button variant="ghost" onClick={() => setStep('auth')} className="mb-4 text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100">
              <Languages className="h-8 w-8 text-sky-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-800">Select Your Language</h1>
            <p className="text-slate-600">अपनी भाषा चुनें</p>
          </div>
          <div className="grid gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                  language === lang.code
                    ? 'border-sky-500 bg-sky-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-sky-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-slate-700">{lang.native}</span>
                  <span className="text-sm text-slate-400">({lang.label})</span>
                </div>
                {language === lang.code && <Check className="h-5 w-5 text-sky-500" />}
              </button>
            ))}
          </div>
          <Button
            onClick={() => setStep('consent')}
            className="mt-6 h-14 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
          >
            Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Consent step
  if (step === 'consent') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <Button variant="ghost" onClick={() => setStep('language')} className="mb-4 text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100">
              <ShieldCheck className="h-8 w-8 text-teal-600" />
            </div>
            <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">{t.consent}</h1>
            <p className="text-center text-slate-600">{t.consentDesc}</p>
          </div>

          <Card className="mb-4 border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                MediKiosk will collect your clinical history using an AI assistant. Your information
                will be used to help your doctor provide better care. You have control over what is
                shared. Please review each item below and toggle to consent.
              </p>
              <div className="space-y-4">
                {[
                  { key: 'data_capture', label: 'Data Capture', desc: 'I consent to MediKiosk collecting my clinical history, symptoms, and medical background.' },
                  { key: 'share_with_his', label: 'Share with Hospital HIS', desc: 'I consent to sharing my history with the hospital\'s Health Information System for my treating doctor.' },
                  { key: 'share_with_abha', label: 'Share with ABHA PHR', desc: 'I consent to linking and sharing my records with my ABHA Personal Health Record.' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      consentToggles[item.key as keyof typeof consentToggles]
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-800">{item.label}</h3>
                        <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setConsentToggles(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof consentToggles] }))}
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                          consentToggles[item.key as keyof typeof consentToggles] ? 'bg-teal-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            consentToggles[item.key as keyof typeof consentToggles] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleConsent}
            className="h-14 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
          >
            I Consent & Start Interview <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
