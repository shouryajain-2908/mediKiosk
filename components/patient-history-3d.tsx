'use client';

import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TimelineEvent, TimelineEventType, Severity } from '@/lib/types';
import { mockTimelineEvents } from '@/lib/mock-data';

const categoryColors: Record<TimelineEventType, string> = {
  visit: '#0ea5e9',       // sky-500
  lab: '#10b981',          // emerald-500
  prescription: '#f59e0b', // amber-500
  procedure: '#8b5cf6',   // violet-500
  document: '#64748b',     // slate-500
};

const severityColors: Record<Severity, string> = {
  normal: '',
  abnormal: '#ef4444',
  critical: '#dc2626',
};

function getNodeColor(event: TimelineEvent): string {
  if (event.severity === 'abnormal' || event.severity === 'critical') {
    return severityColors[event.severity];
  }
  return categoryColors[event.event_type];
}

interface NodeProps {
  event: TimelineEvent;
  position: [number, number, number];
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
  hovered: boolean;
}

function TimelineNode({ event, position, onClick, onHover, onUnhover, hovered }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = getNodeColor(event);
  const baseScale = event.severity === 'abnormal' || event.severity === 'critical' ? 0.35 : 0.28;

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(t + position[0] * 0.5) * 0.05;
      const scale = baseScale + (hovered ? 0.1 : 0) + Math.sin(t * 2 + position[2]) * 0.02;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); onHover(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); onUnhover(); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      {/* Glow ring for abnormal */}
      {(event.severity === 'abnormal' || event.severity === 'critical') && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[0.45, 0.55, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function TimelineAxis({ maxZ }: { maxZ: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let z = 0; z <= maxZ + 2; z += 1) {
      pts.push(new THREE.Vector3(0, 0, z));
    }
    return pts;
  }, [maxZ]);

  return (
    <group>
      <Line points={points} color="#cbd5e1" lineWidth={2} transparent opacity={0.4} />
      {/* Year markers */}
      {Array.from({ length: Math.ceil(maxZ / 4) + 1 }, (_, i) => i * 4).map((z, i) => (
        <Text
          key={i}
          position={[0, -0.5, z]}
          fontSize={0.3}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {z === 0 ? 'Now' : `${z}m ago`}
        </Text>
      ))}
    </group>
  );
}

interface PatientHistory3DProps {
  events: TimelineEvent[];
  onNodeClick?: (event: TimelineEvent) => void;
  show3D: boolean;
  filters?: TimelineEventType[];
}

function Scene({ events, onNodeClick, filters }: Omit<PatientHistory3DProps, 'show3D'>) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedEvent, setClickedEvent] = useState<TimelineEvent | null>(null);

  const filteredEvents = useMemo(() => {
    if (!filters || filters.length === 0) return events;
    return events.filter(e => filters.includes(e.event_type));
  }, [events, filters]);

  // Position events: z = time (older = further), x = category, y = slight variation
  const positionedEvents = useMemo(() => {
    const now = new Date();
    const sorted = [...filteredEvents].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
    const categoryX: Record<string, number> = {
      visit: -2,
      lab: -1,
      prescription: 1,
      procedure: 2,
      document: 0,
    };
    return sorted.map((event, idx) => {
      const monthsAgo = (now.getTime() - new Date(event.event_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
      const z = Math.min(monthsAgo, 20);
      const x = categoryX[event.event_type] || 0;
      const y = (idx % 3 - 1) * 0.4;
      return { event, position: [x, y, z] as [number, number, number] };
    });
  }, [filteredEvents]);

  const maxZ = positionedEvents.length > 0 ? Math.max(...positionedEvents.map(p => p.position[2])) : 10;

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, 5]} intensity={0.4} color="#0ea5e9" />
      <TimelineAxis maxZ={maxZ} />

      {positionedEvents.map(({ event, position }) => (
        <TimelineNode
          key={event.id}
          event={event}
          position={position}
          hovered={hoveredId === event.id}
          onHover={() => setHoveredId(event.id)}
          onUnhover={() => setHoveredId(null)}
          onClick={() => {
            setClickedEvent(event);
            onNodeClick?.(event);
          }}
        />
      ))}

      {/* Hover tooltip */}
      {hoveredId && positionedEvents.find(p => p.event.id === hoveredId) && (
        <Html
          position={positionedEvents.find(p => p.event.id === hoveredId)!.position}
          center
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div className="whitespace-nowrap rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-white shadow-xl">
            <p className="font-semibold">{positionedEvents.find(p => p.event.id === hoveredId)!.event.title}</p>
            <p className="text-slate-300">{new Date(positionedEvents.find(p => p.event.id === hoveredId)!.event.event_date).toLocaleDateString()}</p>
          </div>
        </Html>
      )}

      {/* Click detail */}
      {clickedEvent && (
        <Html position={[0, 2, maxZ / 2]} center distanceFactor={10}>
          <div className="max-w-xs rounded-xl bg-white p-4 shadow-2xl border border-slate-200" style={{ pointerEvents: 'auto' }}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800">{clickedEvent.title}</h3>
              <button onClick={() => setClickedEvent(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            {clickedEvent.description && <p className="mt-1 text-sm text-slate-600">{clickedEvent.description}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${categoryColors[clickedEvent.event_type]}20`, color: categoryColors[clickedEvent.event_type] }}>
                {clickedEvent.category}
              </span>
              {clickedEvent.severity !== 'normal' && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">{clickedEvent.severity}</span>
              )}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                {new Date(clickedEvent.event_date).toLocaleDateString()}
              </span>
            </div>
            {clickedEvent.metadata && Object.keys(clickedEvent.metadata).length > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-2">
                {Object.entries(clickedEvent.metadata).map(([k, v]) => (
                  <p key={k} className="text-xs text-slate-500"><span className="font-medium">{k}:</span> {String(v)}</p>
                ))}
              </div>
            )}
          </div>
        </Html>
      )}
    </>
  );
}

export function PatientHistory3D({ events, onNodeClick, show3D, filters }: PatientHistory3DProps) {
  if (!show3D) {
    return <FlatTimeline events={events} filters={filters} onNodeClick={onNodeClick} />;
  }

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [5, 4, 12], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene events={events} onNodeClick={onNodeClick} filters={filters} />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={5}
            maxDistance={30}
            target={[0, 0, 8]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Flat 2D fallback timeline
function FlatTimeline({ events, filters, onNodeClick }: { events: TimelineEvent[]; filters?: TimelineEventType[]; onNodeClick?: (e: TimelineEvent) => void }) {
  const filtered = useMemo(() => {
    if (!filters || filters.length === 0) return events;
    return events.filter(e => filters.includes(e.event_type));
  }, [events, filters]);

  const sorted = [...filtered].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="relative">
        {sorted.map((event, idx) => (
          <div key={event.id} className="mb-4 flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="h-4 w-4 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: getNodeColor(event) }}
                onClick={() => onNodeClick?.(event)}
              />
              {idx < sorted.length - 1 && <div className="w-0.5 flex-1 bg-slate-200" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700">{event.title}</h4>
                  <span className="text-xs text-slate-400">{new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                {event.description && <p className="mt-1 text-xs text-slate-500">{event.description}</p>}
                <div className="mt-2 flex gap-2">
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${categoryColors[event.event_type]}20`, color: categoryColors[event.event_type] }}>
                    {event.category}
                  </span>
                  {event.severity !== 'normal' && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{event.severity}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Legend component
export function TimelineLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {(Object.entries(categoryColors) as [TimelineEventType, string][]).map(([type, color]) => (
        <div key={type} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-slate-600 capitalize">{type}s</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="text-slate-600">Abnormal</span>
      </div>
    </div>
  );
}
