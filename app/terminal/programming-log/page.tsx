'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MovementLibrary, { LibraryEntry } from './MovementLibrary';
import InfoTooltip from './InfoTooltip';

type ClassTier = 'Control' | 'Capacity' | 'Flow';
type Mode = 'instructor' | 'mentor';
type InstructorView = 'log' | 'history' | 'library';

type MovementRow = { name: string; spring: string; reps: string };

type ProgrammingLog = {
  id: string;
  instructor_id: string | null;
  instructor_name: string;
  client_name: string;
  session_date: string;
  class_tier: ClassTier;
  taxonomy_justification: string;
  apparatus_base: string;
  apparatus_modifiers: string[];
  session_intention: string | null;
  planes_tags: string[];
  stabilisation_tags: string[];
  biomechanical_tags: string[];
  movement_sequence: MovementRow[];
  reflection: string | null;
  biomechanical_score: number | null;
  created_at: string;
};

type VaeFeedback = {
  id: string;
  log_id: string;
  instructor_id: string | null;
  mentor_name: string;
  category: string;
  validate_text: string;
  align_text: string;
  elevate_text: string;
  created_at: string;
};

const CLASS_TIERS: ClassTier[] = ['Control', 'Capacity', 'Flow'];

const TAXONOMY_PRESETS: Record<ClassTier, string> = {
  Control: 'Neutral pelvis and deep core stability drills — precision-focused, low load.',
  Capacity: 'High-spring load, requires deep-core stabilization to prevent spinal flexion.',
  Flow: 'Continuous multi-plane sequencing under load — total-body integration.',
};

const SESSION_INTENTION_PRESETS = [
  'Movement awareness & spinal articulation',
  'Unilateral load transfer & core stabilization',
  'Total-body integration & continuous flow',
  'Postural correction & pain-free mechanics',
  'Athletic endurance under load',
];

const PROP_OPTIONS = ['Foam Roller', 'Magic Circle', 'Sitting Box', 'Hand Weights', 'Resistance Band', 'Mini Stability Ball'];
// Multi-planar demand is derived from how many of these are picked (see biomechanicalScore
// below), so there's no separate "Multi-Planar" tag to self-select any more.
const PLANES_OPTIONS = ['Sagittal', 'Frontal', 'Transverse'];
const STABILISATION_OPTIONS = ['Lumbo-Pelvic', 'Scapulo-Thoracic', 'Glute-Medial'];
const BIOMECHANICAL_OPTIONS = [
  'Rotation', 'Anti-Rotation', 'Extension', 'Flexion',
  'Abduction', 'Adduction', 'Pronation', 'Supination', 'Circumduction',
  'Dorsiflexion', 'Plantarflexion', 'Inversion', 'Eversion',
  'Elevation', 'Depression', 'Protraction', 'Retraction', 'Opposition',
];

const INFO_TEXT = {
  classification: 'Control / Capacity / Flow is the load & complexity tier for the whole class — it drives the taxonomy justification you write below and sets client expectations for intensity.',
  sessionIntention: "The one-sentence goal a client should be able to say out loud after class. It's not the exercise list — it's why this class, for this group, today. Pick a preset or write your own; it should match what you actually programmed below.",
  planes: 'The geometric planes of motion the class moves through: Sagittal (forward/back), Frontal (side-to-side), Transverse (rotation). Selecting more of these raises multi-planar demand in your Biomechanical Score.',
  stabilisation: 'Which stabilization demands the sequence places on the body. More regions selected means the class asks for broader neuromuscular control, not just more reps.',
  biomechanical: 'The specific joint actions programmed — from core actions (flexion, rotation…) to foot/ankle actions (dorsiflexion, inversion…) to regional actions (elevation, protraction…). More variety here means higher kinematic complexity.',
  biomechanicalScore: 'Total = (Planes Score × Actions Score) + Stabilization Score. Planes and Stabilization score 1/3/5 for 1, 2, or 3+ tags selected; Biomechanical Actions scores 1/3/5 for 1–2, 3–4, or 5+ tags (Isolated / Compound / Complex). Range is 2–30. Higher means more multi-planar, joint-varied, stabilization-demanding programming — not "better," just more complex.',
};

const FALLBACK_APPARATUS = 'Reformer + Tower';

type VaeTemplate = { category: string; validate: string; align: string; elevate: string };

const VAE_TEMPLATES: VaeTemplate[] = [
  { category: 'Room Command', validate: 'Your opening sequence was clear.', align: 'You dropped your vocal power during set-up.', elevate: 'Use the "Late-Night DJ" voice for all instructional starts.' },
  { category: 'Room Command', validate: 'Strong vocal projection.', align: 'You lost command during the transitions; client focus drifted.', elevate: 'Next session: use a 3-second silence to reset the room before moving to the next sequence.' },
  { category: 'Biomechanics', validate: 'Correct setup for Gate 01.', align: 'You missed the cue for Gate 03 (Scapular Anchor).', elevate: 'Drill Gate 03 cues for 5 mins tomorrow.' },
  { category: 'Class Vibe', validate: 'The rhythm was consistent.', align: 'The flow felt disjointed at the 30min mark.', elevate: 'Transition smoothly; use "The Windmill" to bridge segments.' },
  { category: 'Client Sales', validate: 'You caught the lead at the end.', align: 'You explained anatomy instead of the benefit.', elevate: "Pivot to the 'Autonomy' pitch immediately when they ask why." },
  { category: 'Biomechanics', validate: 'Excellent tempo in Flow State.', align: 'Failed Gate 2 (Rib-to-Pelvis) on 3 clients.', elevate: 'Next session: hands-on adjustment for all rib-flare corrections.' },
  { category: 'Room Command', validate: 'The session tempo was consistent with the class objective.', align: "The room was too quiet; the environment lacked the 'Shepherd' energy required for the transition to the Unwind.", elevate: 'Increase vocal projection by 20% and use specific spatial visualization cues to pull the room\'s energy together.' },
  { category: 'Biomechanics', validate: "You successfully identified that the client's Gate 1 was failing.", align: 'But you only used verbal cues — that failed to close the Kinetic Gate.', elevate: 'Execute a physical tactile adjustment (hands-on) immediately after the first verbal cue failure.' },
  { category: 'Client Care', validate: 'You completed the movement protocol within the time block.', align: 'But you skipped the Triage & Handoff — clients walked out without their pain points checked or a Diagnostic desk referral.', elevate: '' },
  { category: 'Class Vibe', validate: 'Your confidence in the basic movements is growing.', align: 'You are over-explaining anatomy (Wolf) in a Flow State class — creating cognitive drag.', elevate: 'Cut your word count by 50%. Switch to purely spatial, System 1 cues for the entire second half of class.' },
];

const VAE_CATEGORIES = Array.from(new Set(VAE_TEMPLATES.map((t) => t.category)));

// Planes are capped at 3 real geometric planes, so 1/2/3+ selections band to 1/3/5
// (Single / Bi- / Tri-Planar). Stabilisation reuses the same bands — there are only
// 3 anchor regions in this app, so selecting all 3 is the "global" end of the scale.
function planeOrStabilisationBand(count: number): 1 | 3 | 5 {
  if (count >= 3) return 5;
  if (count === 2) return 3;
  return 1;
}

// Biomechanical Actions has ~18 possible tags, not 3 — so it keeps the matrix's own
// wider bands (1-2 = Isolated, 3-4 = Compound, 5+ = Complex) instead of the 1/2/3+ scale above.
function actionsBand(count: number): 1 | 3 | 5 {
  if (count >= 5) return 5;
  if (count >= 3) return 3;
  return 1;
}

function computeBiomechanicalScore(planes: string[], stabilisation: string[], biomechanical: string[]): number {
  const planesScore = planeOrStabilisationBand(planes.length);
  const actionsScore = actionsBand(biomechanical.length);
  const stabilisationScore = planeOrStabilisationBand(stabilisation.length);
  return planesScore * actionsScore + stabilisationScore;
}

function topApparatusPicks(logs: ProgrammingLog[], instructorId: string): string[] {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const counts = new Map<string, number>();
  for (const log of logs) {
    if (log.instructor_id !== instructorId) continue;
    if (new Date(log.created_at).getTime() < sevenDaysAgo) continue;
    counts.set(log.apparatus_base, (counts.get(log.apparatus_base) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([apparatus]) => apparatus);
}

export default function ProgrammingLogPage() {
  const [mode, setMode] = useState<Mode>('instructor');
  const [instructorView, setInstructorView] = useState<InstructorView>('log');
  const [instructorId, setInstructorId] = useState('');
  const [instructorName, setInstructorName] = useState('');

  const [allLogs, setAllLogs] = useState<ProgrammingLog[]>([]);
  const [myFullHistory, setMyFullHistory] = useState<ProgrammingLog[]>([]);
  const [myFeedback, setMyFeedback] = useState<VaeFeedback[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyTierFilter, setHistoryTierFilter] = useState<ClassTier | ''>('');

  // Instructor form state
  const [clientName, setClientName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [classTier, setClassTier] = useState<ClassTier>('Control');
  const [taxonomyJustification, setTaxonomyJustification] = useState('');
  const [apparatusBase, setApparatusBase] = useState('');
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [sessionIntention, setSessionIntention] = useState('');
  const [planesTags, setPlanesTags] = useState<string[]>([]);
  const [stabilisationTags, setStabilisationTags] = useState<string[]>([]);
  const [biomechanicalTags, setBiomechanicalTags] = useState<string[]>([]);
  const [movements, setMovements] = useState<MovementRow[]>([{ name: '', spring: '', reps: '' }]);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Mentor form state
  const [selectedLogId, setSelectedLogId] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [vaeCategory, setVaeCategory] = useState(VAE_CATEGORIES[0]);
  const [validateText, setValidateText] = useState('');
  const [alignText, setAlignText] = useState('');
  const [elevateText, setElevateText] = useState('');
  const [mentorSubmitting, setMentorSubmitting] = useState(false);
  const [mentorStatus, setMentorStatus] = useState('');

  useEffect(() => {
    setInstructorId(localStorage.getItem('moe_active_user') || '');
    setInstructorName(localStorage.getItem('moe_active_name') || 'Operator');
    setSessionDate(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    supabase
      .from('programming_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => data && setAllLogs(data as ProgrammingLog[]));
  }, []);

  useEffect(() => {
    if (!instructorId) return;
    // Dedicated, uncapped query scoped server-side to this instructor — the
    // "last 10" list below (allLogs) stays as-is for mentor-mode and quick-pick use.
    supabase
      .from('programming_logs')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setMyFullHistory(data as ProgrammingLog[]));
  }, [instructorId]);

  useEffect(() => {
    if (!instructorId) return;

    supabase
      .from('vae_feedback')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setMyFeedback(data as VaeFeedback[]));

    const channel = supabase
      .channel('vae_feedback_live_' + instructorId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vae_feedback', filter: `instructor_id=eq.${instructorId}` },
        (payload) => {
          setMyFeedback((prev) => [payload.new as VaeFeedback, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [instructorId]);

  const topPicks = useMemo(
    () => (instructorId ? topApparatusPicks(allLogs, instructorId) : []),
    [allLogs, instructorId]
  );
  const smartDefault = topPicks[0] || FALLBACK_APPARATUS;

  const filteredHistory = useMemo(() => {
    const term = historySearch.trim().toLowerCase();
    return myFullHistory.filter((log) => {
      if (term && !log.client_name.toLowerCase().includes(term) && !log.apparatus_base.toLowerCase().includes(term)) {
        return false;
      }
      if (historyTierFilter && log.class_tier !== historyTierFilter) return false;
      return true;
    });
  }, [myFullHistory, historySearch, historyTierFilter]);

  const liveBiomechanicalScore = useMemo(
    () => computeBiomechanicalScore(planesTags, stabilisationTags, biomechanicalTags),
    [planesTags, stabilisationTags, biomechanicalTags]
  );

  // A log a mentor has already reviewed stays locked — editing it after the fact
  // would let an instructor quietly rewrite what the V.A.E. feedback was actually about.
  const editableLogIds = useMemo(() => {
    const reviewedIds = new Set(myFeedback.map((f) => f.log_id));
    return new Set(myFullHistory.filter((l) => !reviewedIds.has(l.id)).map((l) => l.id));
  }, [myFullHistory, myFeedback]);

  const startEditLog = (log: ProgrammingLog) => {
    setEditingLogId(log.id);
    setClientName(log.client_name);
    setSessionDate(log.session_date);
    setClassTier(log.class_tier);
    setTaxonomyJustification(log.taxonomy_justification);
    setApparatusBase(log.apparatus_base);
    setModifiers(log.apparatus_modifiers);
    setSessionIntention(log.session_intention || '');
    setPlanesTags(log.planes_tags);
    setStabilisationTags(log.stabilisation_tags);
    setBiomechanicalTags(log.biomechanical_tags);
    setMovements(log.movement_sequence.length ? log.movement_sequence : [{ name: '', spring: '', reps: '' }]);
    setReflection(log.reflection || '');
    setStatusMsg('');
    setInstructorView('log');
  };

  const cancelEdit = () => {
    setEditingLogId(null);
    resetForm();
    setStatusMsg('');
  };

  const loadLibrarySequenceIntoForm = (entry: LibraryEntry) => {
    setEditingLogId(null);
    setClassTier(entry.class_tier);
    setApparatusBase(entry.apparatus_base);
    setModifiers(entry.apparatus_modifiers);
    setMovements(entry.movement_sequence.length ? entry.movement_sequence : [{ name: '', spring: '', reps: '' }]);
    setInstructorView('log');
    setStatusMsg(`Loaded "${entry.sequence_name}" from the library — fill in client + date and log it.`);
  };

  const toggleTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };

  const updateMovement = (index: number, field: keyof MovementRow, value: string) => {
    setMovements((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const resetForm = () => {
    setClientName('');
    setClassTier('Control');
    setTaxonomyJustification('');
    setApparatusBase('');
    setModifiers([]);
    setSessionIntention('');
    setPlanesTags([]);
    setStabilisationTags([]);
    setBiomechanicalTags([]);
    setMovements([{ name: '', spring: '', reps: '' }]);
    setReflection('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingLogId && !editableLogIds.has(editingLogId)) {
      setStatusMsg('This log already has mentor feedback attached and can no longer be edited.');
      return;
    }

    setSubmitting(true);
    setStatusMsg(editingLogId ? 'SAVING CHANGES...' : 'TRANSMITTING...');

    const payload = {
      instructor_id: instructorId || null,
      instructor_name: instructorName,
      client_name: clientName,
      session_date: sessionDate,
      class_tier: classTier,
      taxonomy_justification: taxonomyJustification,
      apparatus_base: apparatusBase || smartDefault,
      apparatus_modifiers: modifiers,
      session_intention: sessionIntention,
      planes_tags: planesTags,
      stabilisation_tags: stabilisationTags,
      biomechanical_tags: biomechanicalTags,
      movement_sequence: movements.filter((m) => m.name.trim()),
      reflection,
      biomechanical_score: liveBiomechanicalScore,
    };

    if (editingLogId) {
      const { data, error } = await supabase
        .from('programming_logs')
        .update(payload)
        .eq('id', editingLogId)
        .select()
        .single();

      setSubmitting(false);

      if (error) {
        setStatusMsg('SAVE FAILED: ' + error.message);
        return;
      }

      const updated = data as ProgrammingLog;
      setAllLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setMyFullHistory((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setStatusMsg('LOG UPDATED.');
      setEditingLogId(null);
      resetForm();
      return;
    }

    const { data, error } = await supabase
      .from('programming_logs')
      .insert([payload])
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      setStatusMsg('WRITE FAILED: ' + error.message);
      return;
    }

    const inserted = data as ProgrammingLog;
    setAllLogs((prev) => [inserted, ...prev]);
    setMyFullHistory((prev) => [inserted, ...prev]);
    setStatusMsg('LOG RECORDED.');
    resetForm();
  };

  const applyTemplate = (t: VaeTemplate) => {
    setVaeCategory(t.category);
    setValidateText(t.validate);
    setAlignText(t.align);
    setElevateText(t.elevate);
  };

  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogId) return;
    const targetLog = allLogs.find((l) => l.id === selectedLogId);
    if (!targetLog) return;

    setMentorSubmitting(true);
    setMentorStatus('TRANSMITTING...');

    const { error } = await supabase.from('vae_feedback').insert([
      {
        log_id: selectedLogId,
        instructor_id: targetLog.instructor_id,
        mentor_name: mentorName || 'Mentor',
        category: vaeCategory,
        validate_text: validateText,
        align_text: alignText,
        elevate_text: elevateText,
      },
    ]);

    setMentorSubmitting(false);

    if (error) {
      setMentorStatus('WRITE FAILED: ' + error.message);
      return;
    }

    setMentorStatus('FEEDBACK DELIVERED — LIVE ON INSTRUCTOR VIEW.');
    setValidateText('');
    setAlignText('');
    setElevateText('');
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        <header className="border-b border-[#222] pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="text-[10px] text-[#4CAF50] tracking-[4px] uppercase">
              {mode === 'instructor' ? 'INSTRUCTOR SELF-LOG' : 'MENTOR / AUDITOR MODE'}
            </div>
            <h1 className="text-3xl font-bold mt-1">Class Programming &amp; V.A.E. Log</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('instructor')}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                mode === 'instructor' ? 'border-[#4CAF50] text-[#4CAF50]' : 'border-[#333] text-[#888] hover:text-white'
              }`}
            >
              I&apos;m an Instructor
            </button>
            <button
              onClick={() => setMode('mentor')}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                mode === 'mentor' ? 'border-[#eab308] text-[#eab308]' : 'border-[#333] text-[#888] hover:text-white'
              }`}
            >
              I&apos;m a Mentor / Auditor
            </button>
            <a href="/terminal" className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors">
              BACK
            </a>
          </div>
        </header>

        {mode === 'instructor' ? (
          <>
            <div className="flex gap-2 mb-8">
              {([
                ['log', 'Log New Class'],
                ['history', 'My History'],
                ['library', 'Movement Library'],
              ] as [InstructorView, string][]).map(([view, label]) => (
                <button
                  key={view}
                  onClick={() => setInstructorView(view)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                    instructorView === view ? 'border-[#a855f7] text-[#a855f7]' : 'border-[#333] text-[#888] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {instructorView === 'log' && (
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                // A stray Enter while typing a movement name used to submit (and lock) the
                // whole log. Only the actual submit button should ever trigger this now.
                if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
                  e.preventDefault();
                }
              }}
              className="space-y-6"
            >
              {editingLogId && (
                <div className="border border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308] text-xs p-3 flex items-center justify-between gap-3">
                  <span>Editing an existing log — saving will update this record in place.</span>
                  <button type="button" onClick={cancelEdit} className="underline decoration-dotted whitespace-nowrap">
                    Cancel Edit
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Session Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    required
                    className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">
                  Classification
                  <InfoTooltip text={INFO_TEXT.classification} />
                </label>
                <div className="flex gap-2">
                  {CLASS_TIERS.map((tier) => (
                    <button
                      type="button"
                      key={tier}
                      onClick={() => setClassTier(tier)}
                      className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                        classTier === tier ? 'border-[#4CAF50] bg-[#4CAF50]/10 text-white' : 'border-[#333] text-[#888]'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">
                  Taxonomy Justification — why is this {classTier}?
                </label>
                <button
                  type="button"
                  onClick={() => setTaxonomyJustification(TAXONOMY_PRESETS[classTier])}
                  className="text-[11px] text-[#3b82f6] mb-2 underline decoration-dotted"
                >
                  use suggested phrase
                </button>
                <textarea
                  value={taxonomyJustification}
                  onChange={(e) => setTaxonomyJustification(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                  placeholder={TAXONOMY_PRESETS[classTier]}
                />
              </div>

              <div className="bg-[#111] border border-[#222] p-4">
                <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Apparatus (Zero-Scroll)</label>
                {topPicks.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[10px] text-[#4CAF50] uppercase tracking-widest mr-2">Quick Access:</span>
                    {topPicks.map((pick) => (
                      <button
                        type="button"
                        key={pick}
                        onClick={() => setApparatusBase(pick)}
                        className="text-xs px-2 py-1 mr-2 border border-[#4CAF50]/40 text-[#4CAF50] rounded-sm"
                      >
                        {pick}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={apparatusBase}
                  onChange={(e) => setApparatusBase(e.target.value)}
                  placeholder={smartDefault}
                  className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50] mb-3"
                />
                <div className="flex flex-wrap gap-2">
                  {PROP_OPTIONS.map((prop) => {
                    const active = modifiers.includes(prop);
                    return (
                      <button
                        type="button"
                        key={prop}
                        onClick={() => toggleTag(modifiers, setModifiers, prop)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          active ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-white' : 'border-[#333] text-[#888]'
                        }`}
                      >
                        + {prop}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">
                  Session Intention
                  <InfoTooltip text={INFO_TEXT.sessionIntention} />
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SESSION_INTENTION_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setSessionIntention(preset)}
                      className={`text-xs px-2 py-1 border rounded-sm ${
                        sessionIntention === preset ? 'border-[#4CAF50] text-white' : 'border-[#333] text-[#888]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={sessionIntention}
                  onChange={(e) => setSessionIntention(e.target.value)}
                  className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                  placeholder="Overwrite or append custom intention..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Planes of Motion', info: INFO_TEXT.planes, options: PLANES_OPTIONS, list: planesTags, set: setPlanesTags },
                  { label: 'Stabilisation', info: INFO_TEXT.stabilisation, options: STABILISATION_OPTIONS, list: stabilisationTags, set: setStabilisationTags },
                  { label: 'Biomechanical Action', info: INFO_TEXT.biomechanical, options: BIOMECHANICAL_OPTIONS, list: biomechanicalTags, set: setBiomechanicalTags },
                ].map((group) => (
                  <div key={group.label} className="bg-[#111] border border-[#222] p-3">
                    <div className="text-[10px] text-[#888] uppercase tracking-wider mb-2">
                      {group.label}
                      <InfoTooltip text={group.info} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((opt) => {
                        const active = group.list.includes(opt);
                        return (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => toggleTag(group.list, group.set, opt)}
                            className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${
                              active ? 'border-[#ff9800] bg-[#ff9800]/10 text-white' : 'border-[#333] text-[#888]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#111] border border-[#a855f7]/30 p-3 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] text-[#888] uppercase tracking-wider">
                  Biomechanical Score
                  <InfoTooltip text={INFO_TEXT.biomechanicalScore} />
                </span>
                <span className="text-lg font-bold text-[#a855f7]">{liveBiomechanicalScore} / 30</span>
              </div>

              <div>
                <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">
                  Movement Sequence (Springs &amp; Reps)
                </label>
                <div className="space-y-2">
                  {movements.map((m, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => updateMovement(i, 'name', e.target.value)}
                        placeholder="Movement name (e.g., Single Leg Extension)"
                        className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
                      />
                      <input
                        type="text"
                        value={m.spring}
                        onChange={(e) => updateMovement(i, 'spring', e.target.value)}
                        placeholder="Spring (e.g., 1 Red / 1/2)"
                        className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
                      />
                      <input
                        type="text"
                        value={m.reps}
                        onChange={(e) => updateMovement(i, 'reps', e.target.value)}
                        placeholder="Reps / Duration (e.g., 2x10)"
                        className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setMovements((prev) => [...prev, { name: '', spring: '', reps: '' }])}
                  className="mt-2 text-xs text-[#3b82f6] underline decoration-dotted"
                >
                  + Add Another Movement
                </button>
              </div>

              <div>
                <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">
                  Instructor / Mentee&apos;s Reflection
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                  placeholder="e.g., Programming was challenging for the group; need solid foundations before complex loading."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#4CAF50] disabled:opacity-40 hover:bg-white hover:text-black text-black font-bold uppercase tracking-widest py-3 transition-colors"
              >
                {submitting ? 'Writing...' : editingLogId ? 'Save Changes' : 'Log Programming'}
              </button>
              {statusMsg && <div className="text-xs text-center text-[#ff9800] tracking-widest">{statusMsg}</div>}
            </form>
            )}

            {instructorView === 'history' && (
              <div>
                <h2 className="text-sm text-[#888] mb-4 uppercase tracking-widest border-l-2 border-[#4CAF50] pl-3">
                  Your Full Programming History
                </h2>

                <div className="flex flex-wrap gap-3 mb-6">
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search by client or apparatus..."
                    className="flex-1 min-w-[200px] bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
                  />
                  <select
                    value={historyTierFilter}
                    onChange={(e) => setHistoryTierFilter(e.target.value as ClassTier | '')}
                    className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
                  >
                    <option value="">All Tiers</option>
                    {CLASS_TIERS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  {filteredHistory.length === 0 && (
                    <p className="text-xs text-[#555]">
                      {myFullHistory.length === 0 ? 'No logs yet.' : 'No logs match this filter.'}
                    </p>
                  )}
                  {filteredHistory.map((log) => {
                    const feedback = myFeedback.filter((f) => f.log_id === log.id);
                    const canEdit = editableLogIds.has(log.id);
                    return (
                      <div key={log.id} className="bg-[#111] border border-[#222] p-4">
                        <div className="flex justify-between text-xs text-[#888] mb-1 flex-wrap gap-2">
                          <span className="text-white">
                            {log.client_name} <span className="text-[#555]">&middot; {new Date(log.session_date).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            {log.class_tier} &middot; {log.apparatus_base}
                            {typeof log.biomechanical_score === 'number' && (
                              <span className="text-[10px] text-[#a855f7] uppercase tracking-widest border border-[#a855f7]/40 px-1.5 py-0.5">
                                Score {log.biomechanical_score}/30
                              </span>
                            )}
                            {canEdit ? (
                              <button
                                onClick={() => startEditLog(log)}
                                className="text-[10px] text-[#eab308] uppercase tracking-widest border border-[#eab308]/40 px-1.5 py-0.5 hover:bg-[#eab308]/10 transition-colors"
                              >
                                ✎ Edit
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#4CAF50] uppercase tracking-widest border border-[#4CAF50]/40 px-1.5 py-0.5">
                                🔒 Reviewed — Locked
                              </span>
                            )}
                          </span>
                        </div>
                        {feedback.map((f) => (
                          <div key={f.id} className="mt-3 border-t border-[#222] pt-3">
                            <p className="text-[10px] text-[#eab308] uppercase tracking-widest mb-2">
                              Coaching Note from {f.mentor_name} &middot; {f.category}
                            </p>
                            <p className="text-sm text-[#e0e0e0] leading-relaxed mb-1">
                              <span className="text-[#4CAF50]">What went right:</span> {f.validate_text}
                            </p>
                            <p className="text-sm text-[#e0e0e0] leading-relaxed mb-1">
                              <span className="text-[#3b82f6]">Where to grow:</span> {f.align_text}
                            </p>
                            {f.elevate_text && (
                              <p className="text-sm text-[#e0e0e0] leading-relaxed">
                                <span className="text-[#ff9800]">Next step:</span> {f.elevate_text}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {instructorView === 'library' && (
              <MovementLibrary
                instructorId={instructorId}
                instructorName={instructorName}
                onUseSequence={loadLibrarySequenceIntoForm}
              />
            )}
          </>
        ) : (
          <form onSubmit={handleMentorSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Mentor Name</label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                required
                className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#eab308]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Select Log to Audit</label>
              <select
                value={selectedLogId}
                onChange={(e) => setSelectedLogId(e.target.value)}
                required
                className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#eab308]"
              >
                <option value="">Choose a session...</option>
                {allLogs.map((log) => (
                  <option key={log.id} value={log.id}>
                    {log.instructor_name} &middot; {log.client_name} &middot; {log.class_tier} &middot;{' '}
                    {new Date(log.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-[#888] mb-2 uppercase tracking-wider">V.A.E. Template Library</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {VAE_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setVaeCategory(cat)}
                    className={`text-xs px-3 py-1.5 border rounded-sm ${
                      vaeCategory === cat ? 'border-[#eab308] text-[#eab308]' : 'border-[#333] text-[#888]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {VAE_TEMPLATES.filter((t) => t.category === vaeCategory).map((t, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => applyTemplate(t)}
                    className="text-left bg-[#111] border border-[#222] hover:border-[#eab308] p-3 text-xs transition-colors"
                  >
                    <p className="text-[#4CAF50] mb-1">V: {t.validate}</p>
                    <p className="text-[#3b82f6] mb-1">A: {t.align}</p>
                    <p className="text-[#ff9800]">E: {t.elevate || '[add your Elevate directive]'}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#4CAF50] mb-1 uppercase tracking-wider">Validate</label>
                <textarea
                  value={validateText}
                  onChange={(e) => setValidateText(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#4CAF50]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#3b82f6] mb-1 uppercase tracking-wider">Align</label>
                <textarea
                  value={alignText}
                  onChange={(e) => setAlignText(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#ff9800] mb-1 uppercase tracking-wider">Elevate</label>
                <textarea
                  value={elevateText}
                  onChange={(e) => setElevateText(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#ff9800]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mentorSubmitting || !selectedLogId}
              className="w-full bg-[#eab308] disabled:opacity-40 hover:bg-white text-black font-bold uppercase tracking-widest py-3 transition-colors"
            >
              {mentorSubmitting ? 'Delivering...' : 'Deliver V.A.E. Feedback'}
            </button>
            {mentorStatus && <div className="text-xs text-center text-[#4CAF50] tracking-widest">{mentorStatus}</div>}
          </form>
        )}
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
