'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  STOTT_VIEWS,
  countTicks,
  deviationLines,
  emptyFindings,
  recommendedFocus,
  type FormOption,
  type Side,
  type StottFindings,
  type ViewKey,
  type YesNo,
} from '@/lib/posturalForm';

const RECENT_KEY = 'moe_stn07_recent';

type SavedAssessment = {
  id: string;
  client_name: string;
  recommended_focus: string;
  created_at: string;
};

type Tab = ViewKey | 'spine';
const TABS: { key: Tab; label: string }[] = [
  { key: 'side', label: 'Side' },
  { key: 'front', label: 'Front' },
  { key: 'back', label: 'Back' },
  { key: 'spine', label: 'Plumb line & notes' },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

function Chip({ active, onClick, children, small }: { active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${small ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-2 text-xs'} rounded-sm border transition-colors ${
        active ? 'border-[#4CAF50] bg-[#4CAF50]/15 text-white' : 'border-[#333] text-[#9b9b9b] hover:text-white hover:border-[#555]'
      }`}
    >
      {children}
    </button>
  );
}

function YesNoRow({ label, value, onChange }: { label: string; value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[#d4d4d4] flex-1 min-w-[200px]">{label}</span>
      {(['Y', 'N'] as const).map((v) => (
        <Chip key={v} active={value === v} onClick={() => onChange(value === v ? null : v)}>
          {v === 'Y' ? 'Yes' : 'No'}
        </Chip>
      ))}
    </div>
  );
}

export default function PosturalDiagnostic() {
  const [instructorId, setInstructorId] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [clientName, setClientName] = useState('');
  const [assessedOn, setAssessedOn] = useState(todayIso());
  const [findings, setFindings] = useState<StottFindings>(emptyFindings());
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState<Tab>('side');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [result, setResult] = useState<{ recommendedFocus: string; lines: string[] } | null>(null);
  const [recent, setRecent] = useState<SavedAssessment[]>([]);

  useEffect(() => {
    setInstructorId(localStorage.getItem('moe_active_user') || '');
    setInstructorName(localStorage.getItem('moe_active_name') || 'Operator');
    // Assessments hold client health data, so the public key can't read them back (database/24).
    // This list is what was logged on this device; the full record lives in each client file.
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* storage blocked: list starts empty */
    }
  }, []);

  const marksFor = (view: ViewKey, section: string) => findings.views[view][section] ?? {};

  const updateSection = (view: ViewKey, section: string, next: Record<string, Side[]>) => {
    setFindings((prev) => ({
      ...prev,
      views: { ...prev.views, [view]: { ...prev.views[view], [section]: next } },
    }));
  };

  const toggleOption = (view: ViewKey, section: string, opt: FormOption) => {
    const marks = { ...marksFor(view, section) };
    if (marks[opt.value]) delete marks[opt.value];
    else marks[opt.value] = [];
    updateSection(view, section, marks);
  };

  const toggleSide = (view: ViewKey, section: string, opt: FormOption, side: Side) => {
    const marks = { ...marksFor(view, section) };
    const sides = marks[opt.value] ?? [];
    marks[opt.value] = sides.includes(side) ? sides.filter((s) => s !== side) : [...sides, side].sort().reverse() as Side[];
    updateSection(view, section, marks);
  };

  const ticks = countTicks(findings);
  const canSubmit = clientName.trim() !== '' && ticks > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setStatusMsg('WRITING TO DATABASE...');

    const focus = recommendedFocus(findings);
    const row: Record<string, unknown> = {
      instructor_id: instructorId || null,
      instructor_name: instructorName,
      client_name: clientName.trim(),
      findings,
      recommended_focus: focus,
      notes,
    };
    // Back-dated sheets keep their real assessment day.
    if (assessedOn && assessedOn !== todayIso()) row.created_at = `${assessedOn}T12:00:00+08:00`;

    const { error } = await supabase.from('postural_assessments').insert([row]);
    setSubmitting(false);

    if (error) {
      setStatusMsg('WRITE FAILED: ' + error.message);
      return;
    }
    setStatusMsg('');
    setResult({ recommendedFocus: focus, lines: deviationLines(findings) });
    const entry: SavedAssessment = {
      id: `${Date.now()}`,
      client_name: clientName.trim(),
      recommended_focus: focus,
      created_at: (row.created_at as string | undefined) ?? new Date().toISOString(),
    };
    setRecent((prev) => {
      const next = [entry, ...prev].slice(0, 8);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* private window: list just won't persist */
      }
      return next;
    });
  };

  const runNewAssessment = () => {
    setClientName('');
    setAssessedOn(todayIso());
    setFindings(emptyFindings());
    setNotes('');
    setTab('side');
    setResult(null);
    setStatusMsg('');
  };

  const activeView = STOTT_VIEWS.find((v) => v.key === tab);

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-4 sm:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        <header className="border-b border-[#222] pb-6 mb-8 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <div className="text-[10px] text-[#4CAF50] tracking-[4px] uppercase">
              STATION 07 &middot; STOTT POSTURAL ANALYSIS GUIDE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">Postural Diagnostic Intake</h1>
          </div>
          <a href="/terminal" className="border border-[#333] px-4 py-2 text-xs text-[#9b9b9b] hover:text-white transition-colors">
            BACK TO TERMINAL
          </a>
        </header>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-[1fr_200px] gap-4">
              <div>
                <label className="block text-xs text-[#9b9b9b] mb-2 uppercase tracking-wider">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                  placeholder="Same spelling as the client file"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9b9b9b] mb-2 uppercase tracking-wider">Assessed On</label>
                <input
                  type="date"
                  value={assessedOn}
                  max={todayIso()}
                  onChange={(e) => setAssessedOn(e.target.value)}
                  className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                />
              </div>
            </div>

            <p className="text-xs text-[#9b9b9b] leading-relaxed">
              Tap a finding to tick it. For findings with sides, tap R and/or L. No side picked = whole segment / both sides. Leave a section
              blank if you did not check it.
            </p>

            <div className="flex flex-wrap gap-2 border-b border-[#222] pb-3 sticky top-0 bg-[#030303] z-10 pt-2">
              {TABS.map((t) => {
                const count =
                  t.key === 'spine'
                    ? 0
                    : Object.values(findings.views[t.key]).reduce((s, m) => s + Object.keys(m).length, 0);
                return (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                      tab === t.key ? 'border-[#3b82f6] text-white bg-[#3b82f6]/10' : 'border-[#333] text-[#9b9b9b] hover:text-white'
                    }`}
                  >
                    {t.label}
                    {count > 0 && <span className="ml-2 text-[#4CAF50]">{count}</span>}
                  </button>
                );
              })}
            </div>

            {activeView && (
              <div className="space-y-3">
                {activeView.hint && <div className="text-[11px] text-[#9b9b9b] uppercase tracking-wider">{activeView.hint}</div>}
                {activeView.sections.map((section) => {
                  const marks = marksFor(activeView.key, section.key);
                  return (
                    <div key={section.key} className="bg-[#111] border border-[#222] p-4">
                      <div className="text-xs text-[#d4d4d4] uppercase tracking-wider mb-3">{section.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {section.options.map((opt) => {
                          const ticked = Boolean(marks[opt.value]);
                          const sides = marks[opt.value] ?? [];
                          return (
                            <div
                              key={opt.value}
                              className={`flex items-center gap-1 ${ticked && opt.sided ? 'border border-[#4CAF50]/40 rounded-sm p-1' : ''}`}
                            >
                              <Chip active={ticked} onClick={() => toggleOption(activeView.key, section.key, opt)}>
                                {opt.label}
                              </Chip>
                              {ticked && opt.sided &&
                                (['R', 'L'] as Side[]).map((s) => (
                                  <Chip key={s} small active={sides.includes(s)} onClick={() => toggleSide(activeView.key, section.key, opt, s)}>
                                    {s}
                                  </Chip>
                                ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'spine' && (
              <div className="space-y-4">
                <div className="bg-[#111] border border-[#222] p-4 space-y-3">
                  <div className="text-xs text-[#d4d4d4] uppercase tracking-wider">Plumb line</div>
                  <YesNoRow
                    label="Parts of the body forward or behind the plumb line? (head, upper body, shoulders, pelvis, knees)"
                    value={findings.plumb.off_line === null ? null : findings.plumb.off_line ? 'Y' : 'N'}
                    onChange={(v) => setFindings((p) => ({ ...p, plumb: { ...p.plumb, off_line: v === null ? null : v === 'Y' } }))}
                  />
                  <YesNoRow
                    label="Head, thorax and pelvis aligned in relation to each other?"
                    value={findings.plumb.aligned === null ? null : findings.plumb.aligned ? 'Y' : 'N'}
                    onChange={(v) => setFindings((p) => ({ ...p, plumb: { ...p.plumb, aligned: v === null ? null : v === 'Y' } }))}
                  />
                  <input
                    value={findings.plumb.note}
                    onChange={(e) => setFindings((p) => ({ ...p, plumb: { ...p.plumb, note: e.target.value } }))}
                    className="w-full bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
                    placeholder="Which parts? (optional)"
                  />
                </div>

                <div className="bg-[#111] border border-[#222] p-4 space-y-3">
                  <div className="text-xs text-[#d4d4d4] uppercase tracking-wider">Sequencing through the spine</div>
                  <YesNoRow
                    label="Watch from the side: are there flat areas?"
                    value={findings.sequencing.flat_areas}
                    onChange={(v) => setFindings((p) => ({ ...p, sequencing: { ...p.sequencing, flat_areas: v } }))}
                  />
                  <input
                    value={findings.sequencing.flat_where}
                    onChange={(e) => setFindings((p) => ({ ...p, sequencing: { ...p.sequencing, flat_where: e.target.value } }))}
                    className="w-full bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
                    placeholder="Where?"
                  />
                  <YesNoRow
                    label="Watch and palpate from the back: any imbalances?"
                    value={findings.sequencing.imbalances}
                    onChange={(v) => setFindings((p) => ({ ...p, sequencing: { ...p.sequencing, imbalances: v } }))}
                  />
                  <input
                    value={findings.sequencing.imbalances_where}
                    onChange={(e) => setFindings((p) => ({ ...p, sequencing: { ...p.sequencing, imbalances_where: e.target.value } }))}
                    className="w-full bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
                    placeholder="Where?"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9b9b9b] mb-2 uppercase tracking-wider">Margin notes from the sheet</label>
                  <textarea
                    value={findings.margin}
                    onChange={(e) => setFindings((p) => ({ ...p, margin: e.target.value }))}
                    rows={2}
                    className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                    placeholder="Anything handwritten beside the boxes"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9b9b9b] mb-2 uppercase tracking-wider">Additional Notes (posture only)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                    placeholder="Movement observations..."
                  />
                  <p className="text-[11px] text-[#9b9b9b] mt-2 leading-relaxed">
                    This station is open to every instructor. Health, weight, medication and personal notes go in the locked client file
                    (SYS.OP → Clients), not here.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[#4CAF50] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:text-black text-black font-bold uppercase tracking-widest py-3 transition-colors"
            >
              {submitting ? 'Writing...' : `Generate Assessment${ticks ? ` · ${ticks} ticks` : ''}`}
            </button>

            {statusMsg && <div className="text-xs text-center text-[#ff9800] tracking-widest">{statusMsg}</div>}
          </form>
        ) : (
          <div className="bg-[#111] border border-[#222] p-6 sm:p-8">
            <p className="text-[10px] text-[#4CAF50] mb-3 tracking-widest uppercase text-center">Assessment Logged</p>
            <h2 className="text-xl font-bold mb-4 text-center">{clientName}</h2>
            <p className="text-sm text-[#d4d4d4] leading-relaxed mb-6 max-w-md mx-auto text-center">{result.recommendedFocus}</p>
            {result.lines.length > 0 && (
              <ul className="text-xs text-[#d4d4d4] space-y-1 mb-6 border-t border-[#222] pt-4">
                {result.lines.map((l) => (
                  <li key={l}>· {l}</li>
                ))}
              </ul>
            )}
            <div className="text-center">
              <button
                onClick={runNewAssessment}
                className="border border-[#333] text-[#9b9b9b] hover:text-white hover:border-[#888] py-3 px-6 text-xs uppercase tracking-widest transition-colors"
              >
                Run New Assessment
              </button>
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-sm text-[#9b9b9b] mb-4 uppercase tracking-widest border-l-2 border-[#3b82f6] pl-3">
            Logged On This Device
          </h2>
          {recent.length === 0 ? (
            <p className="text-xs text-[#9b9b9b]">Nothing logged on this device yet. Full records sit in each client file (SYS.OP).</p>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="bg-[#111] border border-[#222] p-3 flex justify-between items-center text-xs gap-3">
                  <span className="text-white">{r.client_name}</span>
                  <span className="text-[#9b9b9b] flex-1 truncate">{r.recommended_focus}</span>
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
