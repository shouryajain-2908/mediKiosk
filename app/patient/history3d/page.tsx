'use client';

import { usePatientStore } from '@/lib/store';
import { mockTimelineEvents } from '@/lib/mock-data';
import { PatientHistory3D, TimelineLegend } from '@/components/patient-history-3d';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Box, List, Activity, Pill, FileText, Stethoscope } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { TimelineEvent, TimelineEventType } from '@/lib/types';

const filterIcons: Record<TimelineEventType, any> = {
  visit: Stethoscope,
  lab: Activity,
  prescription: Pill,
  procedure: Box,
  document: FileText,
};

export default function History3DPage() {
  const { patientName, patientId } = usePatientStore();
  const setStep = usePatientStore((s) => s.setStep);
  const router = useRouter();
  const [show3D, setShow3D] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filters, setFilters] = useState<TimelineEventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data } = await supabase
          .from('timeline_events')
          .select('*')
          .order('event_date', { ascending: false });
        if (data && data.length > 0) {
          setEvents(data as TimelineEvent[]);
        } else {
          // Use mock data with generated IDs
          setEvents(mockTimelineEvents.map((e, i) => ({ ...e, id: `mock-${i}`, patient_id: patientId || 'demo' })) as TimelineEvent[]);
        }
      } catch {
        setEvents(mockTimelineEvents.map((e, i) => ({ ...e, id: `mock-${i}`, patient_id: patientId || 'demo' })) as TimelineEvent[]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [patientId]);

  const toggleFilter = (type: TimelineEventType) => {
    setFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Button variant="ghost" onClick={() => { setStep('home'); router.push('/'); }} className="text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={show3D ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShow3D(true)}
              className={show3D ? 'bg-sky-500 hover:bg-sky-600' : ''}
            >
              <Box className="mr-2 h-4 w-4" /> 3D
            </Button>
            <Button
              variant={!show3D ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShow3D(false)}
              className={!show3D ? 'bg-sky-500 hover:bg-sky-600' : ''}
            >
              <List className="mr-2 h-4 w-4" /> Timeline
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Health Timeline</h1>
            <p className="text-sm text-slate-500">{patientName || 'Patient'} — interactive 3D visualization</p>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(filterIcons) as TimelineEventType[]).map(type => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  filters.length === 0 || filters.includes(type)
                    ? 'border-sky-300 bg-sky-50 text-sky-700'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {(() => { const Icon = filterIcons[type]; return <Icon className="h-3.5 w-3.5" />; })()}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-4">
          <TimelineLegend />
        </div>

        {/* Visualization */}
        <Card className="h-[60vh] overflow-hidden border-slate-200 shadow-lg">
          <CardContent className="h-full p-0">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-slate-400">Loading timeline...</div>
              </div>
            ) : (
              <PatientHistory3D events={events} show3D={show3D} filters={filters} />
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-400">
          {show3D ? 'Drag to rotate • Scroll to zoom • Click a node for details' : 'Scroll to view timeline • Click for details'}
        </p>
      </div>
    </div>
  );
}
