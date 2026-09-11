'use client';

import { usePatientStore } from '@/lib/store';
import { useStaffStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Stethoscope, HeartPulse, Shield, Activity, Users, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const setStep = usePatientStore((s) => s.setStep);
  const setPatient = usePatientStore((s) => s.setPatient);
  const setStaff = useStaffStore((s) => s.setStaff);
  const router = useRouter();

  useEffect(() => {
    // Check for existing staff session in localStorage
    const staffRole = localStorage.getItem('medikiosk_staff_role');
    if (staffRole) {
      // Don't auto-redirect, let them choose
    }
  }, []);

  const startPatientVisit = () => {
    setStep('auth');
    router.push('/patient');
  };

  const goToStaffLogin = () => {
    router.push('/staff/login');
  };

  const goToAppointment = () => {
    router.push('/appointment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-teal-50/30">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-500/30">
            <HeartPulse className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">MediKiosk</span>
        </div>
        <Button variant="ghost" onClick={goToStaffLogin} className="text-slate-600 hover:text-slate-900">
          Staff Login
        </Button>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:px-12 md:pt-20 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="animate-slide-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-medium text-sky-700">
              <Activity className="h-4 w-4" />
              AI-Powered Clinical Intake
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-800 md:text-5xl">
              Your health story,
              <span className="bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent"> told with care.</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-slate-600">
              MediKiosk guides patients through a friendly, conversational interview
              that captures a complete clinical history — then turns it into a clear
              picture for your doctor. Available in multiple languages, with voice
              support and AYUSH mode.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={startPatientVisit}
                className="h-14 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-8 text-base font-semibold text-white shadow-lg shadow-sky-500/30 hover:from-sky-600 hover:to-teal-600"
              >
                Start My Visit
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={goToAppointment}
                className="h-14 rounded-xl border-teal-300 px-8 text-base font-semibold text-teal-700 hover:bg-teal-50"
              >
                <CalendarDays className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={goToStaffLogin}
                className="h-14 rounded-xl border-slate-300 px-8 text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                Staff Portal
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative animate-fade-in">
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-200/40 to-teal-200/40 blur-3xl" />
              <div className="relative grid h-full grid-cols-2 gap-4 p-4">
                <Card className="flex flex-col items-center justify-center gap-2 border-sky-200 bg-white/80 shadow-lg backdrop-blur">
                  <Stethoscope className="h-8 w-8 text-sky-500" />
                  <span className="text-sm font-medium text-slate-600">AI Interview</span>
                </Card>
                <Card className="flex flex-col items-center justify-center gap-2 border-teal-200 bg-white/80 shadow-lg backdrop-blur mt-8">
                  <Shield className="h-8 w-8 text-teal-500" />
                  <span className="text-sm font-medium text-slate-600">Secure & Private</span>
                </Card>
                <Card className="flex flex-col items-center justify-center gap-2 border-sky-200 bg-white/80 shadow-lg backdrop-blur">
                  <Users className="h-8 w-8 text-sky-600" />
                  <span className="text-sm font-medium text-slate-600">Multi-language</span>
                </Card>
                <Card className="flex flex-col items-center justify-center gap-2 border-teal-200 bg-white/80 shadow-lg backdrop-blur mt-8">
                  <Activity className="h-8 w-8 text-teal-600" />
                  <span className="text-sm font-medium text-slate-600">3D Timeline</span>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-100 bg-white/50 py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <h2 className="mb-12 text-center text-2xl font-bold text-slate-800 md:text-3xl">
            Designed for Indian healthcare
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Stethoscope, title: 'Conversational AI Intake', desc: 'SOCRATES-based questioning adapts to your answers. Voice input and audio playback for accessibility.' },
              { icon: Shield, title: 'ABHA & Consent First', desc: 'Connect your ABHA ID or walk in. Granular consent controls ensure you decide what is shared.' },
              { icon: Activity, title: '3D Health Timeline', desc: 'See your complete medical history as an interactive 3D visualization — visits, labs, prescriptions.' },
            ].map((f, i) => (
              <Card key={i} className="border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-teal-100">
                    <f.icon className="h-6 w-6 text-sky-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-800">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row md:px-12">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-sky-500" />
            <span className="font-semibold text-slate-700">MediKiosk</span>
            <span className="text-sm text-slate-400">— AI-Powered Patient Intake</span>
          </div>
          <p className="text-sm text-slate-400">For hospital OPDs across India</p>
        </div>
      </footer>
    </div>
  );
}
