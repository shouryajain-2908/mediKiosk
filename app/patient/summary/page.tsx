'use client';

import { usePatientStore } from '@/lib/store';
import { translations } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Volume2, Check, FileText, Activity, Pill, History, User, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SummaryPage() {
  const { language, messages, patientName, uploadedDocs, ayushMode, consent } = usePatientStore();
  const setStep = usePatientStore((s) => s.setStep);
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const t = translations[language] || translations.en;

  // Build structured summary from chat messages
  const summary = useMemo(() => {
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
    const aiMessages = messages.filter(m => m.role === 'assistant').map(m => m.content);

    // Group by sections based on question order
    const sections: { icon: any; title: string; items: string[] }[] = [
      { icon: Activity, title: 'Chief Complaint', items: userMessages.slice(0, 1) },
      { icon: History, title: 'History of Present Illness (SOCRATES)', items: userMessages.slice(1, 9) },
      { icon: History, title: 'Past Medical History', items: userMessages.slice(9, 10) },
      { icon: History, title: 'Past Surgical History', items: userMessages.slice(10, 11) },
      { icon: Shield, title: 'Drug Allergies', items: userMessages.slice(11, 12) },
      { icon: Users, title: 'Family History', items: userMessages.slice(12, 13) },
      { icon: User, title: 'Personal History', items: userMessages.slice(13, 14) },
    ];

    if (ayushMode) {
      return [
        { icon: Activity, title: 'Chief Complaint', items: userMessages.slice(-1) },
        { icon: FileText, title: 'Prakriti (Body Constitution)', items: userMessages.slice(0, 1) },
        { icon: FileText, title: 'Vikriti (Current Imbalance)', items: userMessages.slice(1, 2) },
        { icon: FileText, title: 'Dashavidha Pariksha Details', items: userMessages.slice(2, 10) },
        { icon: Pill, title: 'Ahara-Vihara (Diet & Lifestyle)', items: userMessages.slice(10, 11) },
      ];
    }

    return sections;
  }, [messages, ayushMode]);

  const speakSummary = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Hello ${patientName}. Here is your clinical summary. ${summary.map(s => `${s.title}: ${s.items.join(', ')}`).join('. ')}. Please review and confirm.`;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast.success('Your history has been submitted to your doctor. Please wait in the OPD area.', { duration: 5000 });
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white px-6">
        <Card className="max-w-md border-teal-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <Check className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-800">Submission Complete</h2>
            <p className="mb-6 text-slate-600">
              Your clinical history has been sent to your doctor. Please wait in the OPD seating area.
              Your doctor will call you shortly.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => { setStep('history3d'); router.push('/patient/history3d'); }}
                className="h-12 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
              >
                View My Health Timeline (3D) <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => { usePatientStore.getState().setStep('home'); router.push('/'); }}
                className="h-12 w-full border-slate-300 text-slate-700"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Button variant="ghost" onClick={() => { setStep('upload'); router.push('/patient/upload'); }} className="text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button variant="ghost" onClick={speakSummary} className="text-teal-600">
            <Volume2 className="mr-2 h-4 w-4" /> Play Summary
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-slate-800">{t.reviewSummary}</h1>
          <p className="text-slate-600">Please review your clinical history before sending it to your doctor</p>
        </div>

        {/* Patient info */}
        <Card className="mb-4 border-sky-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-teal-100">
              <User className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{patientName || 'Walk-in Patient'}</h3>
              <p className="text-sm text-slate-500">
                {ayushMode ? 'AYUSH / Ayurveda Mode' : 'Standard Allopathic Mode'} • {uploadedDocs.length} document(s) uploaded
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary sections */}
        <div className="space-y-4">
          {summary.map((section, idx) => (
            <Card key={idx} className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                  <section.icon className="h-4 w-4 text-sky-500" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {section.items.length > 0 ? (
                  <ul className="space-y-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">No information captured for this section.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Consent reminder */}
        {consent && (
          <Card className="mt-4 border-teal-200 bg-teal-50/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                <p className="text-xs text-teal-700">
                  You consented to data capture{consent.share_with_his ? ', sharing with Hospital HIS' : ''}{consent.share_with_abha ? ', and sharing with ABHA PHR' : ''} on {new Date(consent.consented_at).toLocaleString()}.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className="mt-6 h-14 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
        >
          {t.submitToDoctor} <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
