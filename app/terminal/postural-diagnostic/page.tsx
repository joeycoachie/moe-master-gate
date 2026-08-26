'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type CheckpointKey = 'cervical' | 'shoulders' | 'thoracic' | 'lumbar' | 'pelvis' | 'knees' | 'feet';

type CheckpointOption = { value: string; label: string };

type Checkpoint = {
  key: CheckpointKey;
  label: string;
  region: 'upper' | 'core' | 'lower';
  options: CheckpointOption[];
};

const CHECKPOINTS: Checkpoint[] = [
  {
    key: 'cervical',
    label: 'Cervical / Head',
    region: 'upper',
    options: [
      { value: 'neutral', label: 'Neutral' },
      { value: 'forward_head', label: 'Forward Head Posture' },
    ],
  },
  {
    key: 'shoulders',
    label: 'Shoulders',
    region: 'upper',
    options: [
      { value: 'level', label: 'Level' },
      { value: 'elevated_left', label: 'Elevated (Left)' },
      { value: 'elevated_right', label: 'Elevated (Right)' },
      { value: 'rounded', label: 'Rounded / Protracted' },
    ],
  },
  {
    key: 'thoracic',
    label: 'Thoracic Spine',
    region: 'upper',
    options: [
      { value: 'neutral', label: 'Neutral' },
      { value: 'kyphotic', label: 'Excessive Kyphosis' },
    ],
  },
  {
    key: 'lumbar',
    label: 'Lumbar Spine',
    region: 'core',
    options: [
      { value: 'neutral', label: 'Neutral' },
      { value: 'lordotic', label: 'Excessive Lordosis' },
      { value: 'flat', label: 'Flat Lumbar' },
    ],
  },
  {
    key: 'pelvis',
    label: 'Pelvis',
    region: 'core',
    options: [
      { value: 'neutral', label: 'Neutral' },
      { value: 'anterior_tilt', label: 'Anterior Tilt' },
      { value: 'posterior_tilt', label: 'Posterior Tilt' },
      { value: 'lateral_shift', label: 'Lateral Shift' },
    ],
  },
  {
    key: 'knees',
    label: 'Knees',
    region: 'lower',
    options: [
      { value: 'neutral', label: 'Neutral' },
      { value: 'valgus', label: 'Genu Valgum (Knock-Knee)' },
      { value: 'varus', label: 'Genu Varum (Bow-Leg)' },
      { value: 'hyperextension', label: 'Hyperextension' },
    ],
  },
  {
    key: 'feet',
    label: 'Feet / Ankles',
    region: 'lower',
    options: [
      { value: 'neutral', label: 'Neutral' },
      { value: 'overpronation', label: 'Overpronation' },
      { value: 'oversupination', label: 'Oversupination' },
    ],
  },
];

const REGION_LABEL: Record<Checkpoint['region'], string> = {
  upper: 'Upper Body Alignment / Thoracic Mobility',
  core: 'Core Activation / Pelvic Stability',
  lower: 'Lower Kinetic Chain / Load Distribution',
};

type Findings = Partial<Record<CheckpointKey, string>>;

type SavedAssessment = {
  id: string;
  client_name: string;
  recommended_focus: string;
  created_at: string;
};

function computeRecommendedFocus(findings: Findings): string {
  const flaggedRegions = new Set<Checkpoint['region']>();
  for (const cp of CHECKPOINTS) {
    const value = findings[cp.key];
    if (value && value !== 'neutral' && value !== 'level') {
      flaggedRegions.add(cp.region);
    }
  }
  if (flaggedRegions.size === 0) {
    return 'General Maintenance / Movement Refinement — no significant postural deviations flagged.';
  }
  return CHECKPOINTS.filter((cp) => flaggedRegions.has(cp.region))
    .map((cp) => cp.region)
    .filter((r, i, arr) => arr.indexOf(r) === i)
    .map((r) => REGION_LABEL[r])
    .join(' + ');
}

export default function PosturalDiagnostic() {
  const [instructorId, setInstructorId] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [clientName, setClientName] = useState('');
  const [findings, setFindings] = useState<Findings>({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [result, setResult] = useState<{ recommendedFocus: string } | null>(null);
  const [recent, setRecent] = useState<SavedAssessment[]>([]);

  useEffect(() => {
    setInstructorId(localStorage.getItem('moe_active_user') || '');
    setInstructorName(localStorage.getItem('moe_active_name') || 'Operator');
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('postural_assessments')
      .select('id, client_name, recommended_focus, created_at')
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (!cancelled && data) setRecent(data as SavedAssessment[]);
      });
    return () => {
      cancelled = true;
    };
  }, [result]);

  const setCheckpoint = (key: CheckpointKey, value: string) => {
    setFindings((prev) => ({ ...prev, [key]: value }));
  };

  const allAnswered = CHECKPOINTS.every((cp) => findings[cp.key]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !allAnswered) return;

    setSubmitting(true);
    setStatusMsg('WRITING TO DATABASE...');

    const recommendedFocus = computeRecommendedFocus(findings);

    const { error } = await supabase.from('postural_assessments').insert([
      {
        instructor_id: instructorId || null,
        instructor_name: instructorName,
        client_name: clientName,
        findings,
        recommended_focus: recommendedFocus,
        notes,
      },
    ]);

    setSubmitting(false);

    if (error) {
      setStatusMsg('WRITE FAILED: ' + error.message);
      return;
    }

    setStatusMsg('');
    setResult({ recommendedFocus });
  };

  const runNewAssessment = () => {
    setClientName('');
    setFindings({});
    setNotes('');
    setResult(null);
    setStatusMsg('');
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        <header className="border-b border-[#222] pb-6 mb-10 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-[#4CAF50] tracking-[4px] uppercase">
              INSTRUCTOR-RUN &middot; UNLOCKED &middot; NO CREDIT GATE
            </div>
            <h1 className="text-3xl font-bold mt-1">Postural Diagnostic Intake</h1>
          </div>
          <a href="/terminal" className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors">
            BACK TO TERMINAL
          </a>
        </header>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                placeholder="Enter client name..."
              />
            </div>

            <div className="space-y-4">
              {CHECKPOINTS.map((cp) => (
                <div key={cp.key} className="bg-[#111] border border-[#222] p-4">
                  <div className="text-xs text-[#888] uppercase tracking-wider mb-3">{cp.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {cp.options.map((opt) => {
                      const active = findings[cp.key] === opt.value;
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setCheckpoint(cp.key, opt.value)}
                          className={`px-3 py-2 text-xs rounded-sm border transition-colors ${
                            active
                              ? 'border-[#4CAF50] bg-[#4CAF50]/10 text-white'
                              : 'border-[#333] text-[#888] hover:text-white hover:border-[#555]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                placeholder="Optional observations..."
              />
            </div>

            <button
              type="submit"
              disabled={!clientName || !allAnswered || submitting}
              className="w-full bg-[#4CAF50] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:text-black text-black font-bold uppercase tracking-widest py-3 transition-colors"
            >
              {submitting ? 'Writing...' : 'Generate Assessment'}
            </button>

            {statusMsg && <div className="text-xs text-center text-[#ff9800] tracking-widest">{statusMsg}</div>}
          </form>
        ) : (
          <div className="bg-[#111] border border-[#222] p-8 text-center">
            <p className="text-[10px] text-[#4CAF50] mb-3 tracking-widest uppercase">Assessment Logged</p>
            <h2 className="text-xl font-bold mb-4">{clientName}</h2>
            <p className="text-sm text-[#a3a3a3] leading-relaxed mb-6 max-w-md mx-auto">{result.recommendedFocus}</p>
            <button
              onClick={runNewAssessment}
              className="border border-[#333] text-[#888] hover:text-white hover:border-[#888] py-3 px-6 text-xs uppercase tracking-widest transition-colors"
            >
              Run New Assessment
            </button>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-sm text-[#888] mb-4 uppercase tracking-widest border-l-2 border-[#3b82f6] pl-3">
            Recent Assessments (Studio Dashboard)
          </h2>
          {recent.length === 0 ? (
            <p className="text-xs text-[#555]">No assessments logged yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="bg-[#111] border border-[#222] p-3 flex justify-between items-center text-xs">
                  <span className="text-white">{r.client_name}</span>
                  <span className="text-[#888] flex-1 mx-4 truncate">{r.recommended_focus}</span>
                  <span className="text-[#555]">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-4xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
