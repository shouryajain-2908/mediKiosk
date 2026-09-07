'use client';

import { useStaffStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, HeartPulse, Stethoscope, Shield, UserCog, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/lib/types';

const roles: { value: UserRole; label: string; icon: typeof Stethoscope; desc: string; borderClass: string; bgClass: string; iconBg: string; iconText: string }[] = [
  { value: 'physician', label: 'Physician', icon: Stethoscope, desc: 'Review patient histories and summaries', borderClass: 'border-sky-500', bgClass: 'bg-sky-50', iconBg: 'bg-sky-100', iconText: 'text-sky-600' },
  { value: 'nurse', label: 'Triage Nurse', icon: Shield, desc: 'Monitor red-flag alerts and patient queue', borderClass: 'border-teal-500', bgClass: 'bg-teal-50', iconBg: 'bg-teal-100', iconText: 'text-teal-600' },
  { value: 'admin', label: 'Administrator', icon: UserCog, desc: 'Manage staff and system settings', borderClass: 'border-slate-500', bgClass: 'bg-slate-50', iconBg: 'bg-slate-100', iconText: 'text-slate-600' },
];

export default function StaffLogin() {
  const setStaff = useStaffStore((s) => s.setStaff);
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('medikiosk_staff_role');
    if (saved) setSelectedRole(saved as UserRole);
  }, []);

  const handleLogin = () => {
    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const roleData = roles.find(r => r.value === selectedRole)!;
      setStaff(selectedRole, email, roleData.label);
      localStorage.setItem('medikiosk_staff_role', selectedRole);
      localStorage.setItem('medikiosk_staff_email', email);
      localStorage.setItem('medikiosk_staff_name', roleData.label);
      toast.success(`Welcome back, ${roleData.label}!`);
      router.push('/staff/dashboard');
    }, 800);
  };

  const handleDemoLogin = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(`${role}@medikiosk.in`);
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/30">
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-500/30">
            <HeartPulse className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">MediKiosk</span>
        </div>
        <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Home
        </Button>
      </nav>

      <div className="mx-auto max-w-md px-6 py-8 md:py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100">
            <LogIn className="h-8 w-8 text-sky-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">Staff Login</h1>
          <p className="text-slate-600">Select your role and sign in to access the portal</p>
        </div>

        <Card className="mb-4 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base text-slate-700">Choose Your Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    selectedRole === role.value
                      ? `${role.borderClass} ${role.bgClass} shadow-md`
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${role.iconBg}`}>
                    <Icon className={`h-5 w-5 ${role.iconText}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{role.label}</p>
                    <p className="text-xs text-slate-500">{role.desc}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="mb-4 border-slate-200 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm text-slate-600">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@hospital.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm text-slate-600">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-12 text-base"
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="h-12 w-full bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4">
          <p className="mb-3 text-center text-xs text-slate-500">Quick demo login — click a role to auto-fill</p>
          <div className="flex gap-2">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => handleDemoLogin(role.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-all hover:border-sky-300 hover:bg-sky-50"
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
