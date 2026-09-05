'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type MovementRow = { name: string; spring: string; reps: string };

type SessionLog = {
  id: string;
  instructor_id: string | null;
  instructor_name: string;
  client_name: string;
  session_date: string;
  apparatus: string[];
  max_tension: string;
  movement_sequence: MovementRow[];
  kinetic_deviations: string[];
  performance_score: number;
  saved_sequence_name: string | null;
  created_at: string;
};

type SavedSequence = {
  id: string;
  instructor_id: string | null;
  instructor_name: string;
  sequence_name: string;
  apparatus: string[];
  max_tension: string;
  movement_sequence: MovementRow[];
  use_count: number;
  created_at: string;
};

const APPARATUS_OPTIONS = ['Reformer', 'Tower', 'Chair', 'Barrel', 'Mat'];

const TENSION_OPTIONS = ['1 Red', '1 Green', '1 Blue', '2 Red', '1 Red + 1 Blue'];

const DEVIATION_OPTIONS = [
  'Anterior Tilt (Pelvis)',
  'Rounded / Protracted (Shoulders)',
  'Genu Valgum — Left Knee',
  'Genu Valgum — Right Knee',
  'Excessive Kyphosis (Thoracic)',
];
const NO_DEVIATION = 'None / Neutral Alignment';

const SCORE_RANGE = Array.from({ length: 10 }, (_, i) => i + 1);

export default function SessionLogPage() {
  const [instructorId, setInstructorId] = useState('');
  const [instructorName, setInstructorName] = useState('');

  const [mySequences, setMySequences] = useState<SavedSequence[]>([]);
  const [myLogs, setMyLogs] = useState<SessionLog[]>([]);

  const [clientName, setClientName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [apparatus, setApparatus] = useState<string[]>([]);
  const [maxTension, setMaxTension] = useState('');
  const [movements, setMovements] = useState<MovementRow[]>([{ name: '', spring: '', reps: '' }]);
  const [deviations, setDeviations] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);

  const [saveAsSequence, setSaveAsSequence] = useState(true);
  const [sequenceName, setSequenceName] = useState('');
  const [loadedSequenceId, setLoadedSequenceId] = useState('');

  const [sliderValue, setSliderValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    setInstructorId(localStorage.getItem('moe_active_user') || '');
    setInstructorName(localStorage.getItem('moe_active_name') || 'Operator');
    setSessionDate(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!instructorId) return;
    supabase
      .from('saved_sequences')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('use_count', { ascending: false })
      .then(({ data }) => data && setMySequences(data as SavedSequence[]));

    supabase
      .from('session_logs_1on1')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => data && setMyLogs(data as SessionLog[]));
  }, [instructorId]);

  const isReady = useMemo(
    () => clientName.trim() !== '' && apparatus.length > 0 && maxTension !== '' && score !== null,
    [clientName, apparatus, maxTension, score]
  );

  const toggleApparatus = (a: string) => {
    setApparatus((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const toggleDeviation = (d: string) => {
    if (d === NO_DEVIATION) {
      setDeviations([NO_DEVIATION]);
      return;
    }
    setDeviations((prev) => {
      const withoutNone = prev.filter((x) => x !== NO_DEVIATION);
      return withoutNone.includes(d) ? withoutNone.filter((x) => x !== d) : [...withoutNone, d];
    });
  };

  const updateMovement = (index: number, field: keyof MovementRow, value: string) => {
    setMovements((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const loadSequence = async (seq: SavedSequence) => {
    setApparatus(seq.apparatus);
    setMaxTension(seq.max_tension);
    setMovements(seq.movement_sequence.length > 0 ? seq.movement_sequence : [{ name: '', spring: '', reps: '' }]);
    setLoadedSequenceId(seq.id);
    setSequenceName(seq.sequence_name);
    await supabase
      .from('saved_sequences')
      .update({ use_count: seq.use_count + 1 })
      .eq('id', seq.id);
    setMySequences((prev) =>
      prev
        .map((s) => (s.id === seq.id ? { ...s, use_count: s.use_count + 1 } : s))
        .sort((a, b) => b.use_count - a.use_count)
    );
  };

  const resetForm = () => {
    setClientName('');
    setApparatus([]);
    setMaxTension('');
    setMovements([{ name: '', spring: '', reps: '' }]);
    setDeviations([]);
    setScore(null);
    setSequenceName('');
    setLoadedSequenceId('');
    setSliderValue(0);
  };

  const completeSession = async () => {
    if (!isReady || submitting) {
      setSliderValue(0);
      return;
    }
    setSubmitting(true);
    setStatusMsg('TRANSMITTING...');

    const cleanMovements = movements.filter((m) => m.name.trim());

    const { data, error } = await supabase
      .from('session_logs_1on1')
      .insert([
        {
          instructor_id: instructorId || null,
          instructor_name: instructorName,
          client_name: clientName,
          session_date: sessionDate,
          apparatus,
          max_tension: maxTension,
          movement_sequence: cleanMovements,
          kinetic_deviations: deviations,
          performance_score: score,
          saved_sequence_name: saveAsSequence && sequenceName.trim() ? sequenceName.trim() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      setSubmitting(false);
      setSliderValue(0);
      setStatusMsg('WRITE FAILED: ' + error.message);
      return;
    }

    setMyLogs((prev) => [data as SessionLog, ...prev]);

    if (saveAsSequence && sequenceName.trim()) {
      if (loadedSequenceId) {
        await supabase
          .from('saved_sequences')
          .update({ apparatus, max_tension: maxTension, movement_sequence: cleanMovements, sequence_name: sequenceName.trim() })
          .eq('id', loadedSequenceId);
      } else {
        const { data: seqData } = await supabase
          .from('saved_sequences')
          .insert([
            {
              instructor_id: instructorId || null,
              instructor_name: instructorName,
              sequence_name: sequenceName.trim(),
              apparatus,
              max_tension: maxTension,
              movement_sequence: cleanMovements,
            },
          ])
          .select()
          .single();
        if (seqData) setMySequences((prev) => [seqData as SavedSequence, ...prev]);
      }
    }

    setSubmitting(false);
    setStatusMsg('SESSION LOGGED — READY FOR PAYOUT REVIEW.');
    resetForm();
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full">
        <header className="border-b border-[#222] pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="text-[10px] text-[#22d3ee] tracking-[4px] uppercase">1-1 SESSION LOG</div>
            <h1 className="text-3xl font-bold mt-1">Quick Capture &amp; Sequence Vault</h1>
          </div>
          <a href="/terminal" className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors">
            BACK
          </a>
        </header>

        {mySequences.length > 0 && (
          <div className="mb-8 bg-[#111] border border-[#222] p-4">
            <div className="text-[10px] text-[#22d3ee] uppercase tracking-widest mb-3">
              My Sequences — tap to load full programming instantly
            </div>
            <div className="flex flex-wrap gap-2">
              {mySequences.slice(0, 8).map((seq) => (
                <button
                  key={seq.id}
                  type="button"
                  onClick={() => loadSequence(seq)}
                  className={`text-left px-3 py-2 text-xs border rounded-sm transition-colors ${
                    loadedSequenceId === seq.id ? 'border-[#22d3ee] text-white bg-[#22d3ee]/10' : 'border-[#333] text-[#ccc] hover:border-[#22d3ee]'
                  }`}
                >
                  <div className="font-bold">{seq.sequence_name}</div>
                  <div className="text-[10px] text-[#888]">
                    {seq.apparatus.join(' + ')} &middot; {seq.movement_sequence.length} moves &middot; used {seq.use_count}x
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#22d3ee]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Session Date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#22d3ee]"
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-[#888] mb-2 uppercase tracking-wider">Step 1 — Apparatus Used</div>
            <div className="flex flex-wrap gap-2">
              {APPARATUS_OPTIONS.map((a) => {
                const active = apparatus.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleApparatus(a)}
                    className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                      active ? 'border-[#22d3ee] bg-[#22d3ee]/10 text-white' : 'border-[#333] text-[#888]'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#888] mb-2 uppercase tracking-wider">Step 2 — Max Spring Tension</div>
            <div className="flex flex-wrap gap-2">
              {TENSION_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMaxTension(t)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                    maxTension === t ? 'border-[#22d3ee] bg-[#22d3ee]/10 text-white' : 'border-[#333] text-[#888]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#888] mb-2 uppercase tracking-wider">Full Programming — Movement / Spring / Reps</div>
            <div className="space-y-2">
              {movements.map((m, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMovement(i, 'name', e.target.value)}
                    placeholder="Movement (e.g., Single Leg Extension)"
                    className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#22d3ee]"
                  />
                  <input
                    type="text"
                    value={m.spring}
                    onChange={(e) => updateMovement(i, 'spring', e.target.value)}
                    placeholder="Spring"
                    className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#22d3ee]"
                  />
                  <input
                    type="text"
                    value={m.reps}
                    onChange={(e) => updateMovement(i, 'reps', e.target.value)}
                    placeholder="Reps / Duration"
                    className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#22d3ee]"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMovements((prev) => [...prev, { name: '', spring: '', reps: '' }])}
              className="mt-2 text-xs text-[#22d3ee] underline decoration-dotted"
            >
              + Add Another Movement
            </button>
          </div>

          <div>
            <div className="text-xs text-[#888] mb-2 uppercase tracking-wider">Step 3 — Kinetic Deviations Observed</div>
            <div className="flex flex-wrap gap-2">
              {[...DEVIATION_OPTIONS, NO_DEVIATION].map((d) => {
                const active = deviations.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDeviation(d)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      active
                        ? d === NO_DEVIATION
                          ? 'border-[#4CAF50] bg-[#4CAF50]/10 text-white'
                          : 'border-[#ff9800] bg-[#ff9800]/10 text-white'
                        : 'border-[#333] text-[#888]'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] p-4">
            <label className="flex items-center gap-2 text-xs text-[#888] uppercase tracking-wider mb-3">
              <input
                type="checkbox"
                checked={saveAsSequence}
                onChange={(e) => setSaveAsSequence(e.target.checked)}
                className="accent-[#22d3ee]"
              />
              Step 4 — Save this to My Sequences library
            </label>
            {saveAsSequence && (
              <input
                type="text"
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
                placeholder="Sequence name (e.g., Client Core Flow v1)"
                className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#22d3ee]"
              />
            )}
          </div>

          <div>
            <div className="text-xs text-[#888] mb-2 uppercase tracking-wider">Step 5 — Client Performance Score</div>
            <div className="flex flex-wrap gap-2">
              {SCORE_RANGE.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScore(n)}
                  className={`w-9 h-9 text-xs border transition-colors ${
                    score === n ? 'border-[#22d3ee] bg-[#22d3ee]/10 text-white' : 'border-[#333] text-[#888]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">
              {isReady ? 'Slide to Complete Session & Unlock Payout' : 'Complete Steps 1, 2 & 5 to unlock the slider'}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderValue}
              disabled={!isReady || submitting}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              onMouseUp={() => (sliderValue >= 90 ? completeSession() : setSliderValue(0))}
              onTouchEnd={() => (sliderValue >= 90 ? completeSession() : setSliderValue(0))}
              className="w-full accent-[#22d3ee] disabled:opacity-30"
            />
            {statusMsg && <div className="text-xs text-center text-[#ff9800] tracking-widest mt-2">{statusMsg}</div>}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-sm text-[#888] mb-4 uppercase tracking-widest border-l-2 border-[#22d3ee] pl-3">
            Your Recent 1-1 Sessions
          </h2>
          <div className="space-y-3">
            {myLogs.length === 0 && <p className="text-xs text-[#555]">No sessions logged yet.</p>}
            {myLogs.map((log) => (
              <div key={log.id} className="bg-[#111] border border-[#222] p-4">
                <div className="flex justify-between text-xs text-[#888]">
                  <span className="text-white">{log.client_name}</span>
                  <span>
                    {log.apparatus.join(' + ')} &middot; {log.max_tension} &middot; Score {log.performance_score}/10
                  </span>
                </div>
                {log.kinetic_deviations.length > 0 && (
                  <div className="text-[10px] text-[#ff9800] mt-1">{log.kinetic_deviations.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-2xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
