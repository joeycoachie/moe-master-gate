'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type ClassTier = 'Control' | 'Capacity' | 'Flow';
type LibraryStatus = 'draft' | 'locked';
type MovementRow = { name: string; spring: string; reps: string };

export type LibraryEntry = {
  id: string;
  instructor_id: string | null;
  instructor_name: string;
  sequence_name: string;
  class_tier: ClassTier;
  apparatus_base: string;
  apparatus_modifiers: string[];
  movement_sequence: MovementRow[];
  category: string | null;
  status: LibraryStatus;
  parent_sequence_id: string | null;
  use_count: number;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};

const CLASS_TIERS: ClassTier[] = ['Control', 'Capacity', 'Flow'];
const PROP_OPTIONS = ['Foam Roller', 'Magic Circle', 'Sitting Box', 'Hand Weights', 'Resistance Band', 'Mini Stability Ball'];
const EMPTY_MOVEMENT: MovementRow = { name: '', spring: '', reps: '' };

function emptyBuilder() {
  return {
    sequenceName: '',
    classTier: 'Control' as ClassTier,
    apparatusBase: '',
    modifiers: [] as string[],
    movements: [{ ...EMPTY_MOVEMENT }],
  };
}

export default function MovementLibrary({
  instructorId,
  instructorName,
  onUseSequence,
}: {
  instructorId: string;
  instructorName: string;
  onUseSequence: (entry: LibraryEntry) => void;
}) {
  const [scope, setScope] = useState<'mine' | 'shared'>('mine');
  const [mine, setMine] = useState<LibraryEntry[]>([]);
  const [shared, setShared] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<ClassTier | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<'' | '__uncategorized__' | string>('');

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [parentSequenceId, setParentSequenceId] = useState<string | null>(null);
  const [builder, setBuilder] = useState(emptyBuilder());
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Drafts are private working copies — only ever fetched scoped to their own
  // owner, and the shared query only ever asks for status='locked' server-side.
  // No other instructor's draft ever leaves the database, let alone reaches this client.
  const loadMine = async () => {
    if (!instructorId) return;
    const { data } = await supabase
      .from('movement_library')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });
    if (data) setMine(data as LibraryEntry[]);
  };

  const loadShared = async () => {
    const { data } = await supabase
      .from('movement_library')
      .select('*')
      .eq('status', 'locked')
      .order('locked_at', { ascending: false });
    if (data) setShared(data as LibraryEntry[]);
  };

  useEffect(() => {
    Promise.resolve()
      .then(() => setLoading(true))
      .then(() => Promise.all([loadMine(), loadShared()]))
      .then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

  const activeList = scope === 'mine' ? mine : shared;

  const categories = useMemo(() => {
    const set = new Set<string>();
    [...mine, ...shared].forEach((e) => e.category && set.add(e.category));
    return Array.from(set).sort();
  }, [mine, shared]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return activeList.filter((e) => {
      if (term && !e.sequence_name.toLowerCase().includes(term) && !e.apparatus_base.toLowerCase().includes(term)) {
        return false;
      }
      if (tierFilter && e.class_tier !== tierFilter) return false;
      if (categoryFilter === '__uncategorized__' && e.category) return false;
      if (categoryFilter && categoryFilter !== '__uncategorized__' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [activeList, searchTerm, tierFilter, categoryFilter]);

  const updateMovement = (index: number, field: keyof MovementRow, value: string) => {
    setBuilder((prev) => ({
      ...prev,
      movements: prev.movements.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  };

  const toggleModifier = (mod: string) => {
    setBuilder((prev) => ({
      ...prev,
      modifiers: prev.modifiers.includes(mod) ? prev.modifiers.filter((m) => m !== mod) : [...prev.modifiers, mod],
    }));
  };

  const openNewBuilder = () => {
    setBuilder(emptyBuilder());
    setEditingDraftId(null);
    setParentSequenceId(null);
    setStatusMsg('');
    setShowBuilder(true);
  };

  const openEditDraft = (entry: LibraryEntry) => {
    setBuilder({
      sequenceName: entry.sequence_name,
      classTier: entry.class_tier,
      apparatusBase: entry.apparatus_base,
      modifiers: entry.apparatus_modifiers,
      movements: entry.movement_sequence.length ? entry.movement_sequence : [{ ...EMPTY_MOVEMENT }],
    });
    setEditingDraftId(entry.id);
    setParentSequenceId(null);
    setStatusMsg('');
    setShowBuilder(true);
  };

  const openNewVersion = (entry: LibraryEntry) => {
    setBuilder({
      sequenceName: entry.sequence_name,
      classTier: entry.class_tier,
      apparatusBase: entry.apparatus_base,
      modifiers: entry.apparatus_modifiers,
      movements: entry.movement_sequence.length ? entry.movement_sequence : [{ ...EMPTY_MOVEMENT }],
    });
    setEditingDraftId(null);
    setParentSequenceId(entry.id);
    setStatusMsg('This will save as a brand new entry — the locked original stays untouched.');
    setShowBuilder(true);
  };

  const isBuilderComplete = () =>
    builder.sequenceName.trim() &&
    builder.apparatusBase.trim() &&
    builder.movements.some((m) => m.name.trim());

  const buildPayload = () => ({
    instructor_id: instructorId || null,
    instructor_name: instructorName,
    sequence_name: builder.sequenceName.trim(),
    class_tier: builder.classTier,
    apparatus_base: builder.apparatusBase.trim(),
    apparatus_modifiers: builder.modifiers,
    movement_sequence: builder.movements.filter((m) => m.name.trim()),
  });

  const handleSaveDraft = async () => {
    if (!builder.sequenceName.trim()) {
      setStatusMsg('Name the sequence before saving a draft.');
      return;
    }
    setSaving(true);
    setStatusMsg('');

    if (editingDraftId) {
      const { error } = await supabase
        .from('movement_library')
        .update({ ...buildPayload(), updated_at: new Date().toISOString() })
        .eq('id', editingDraftId)
        .eq('status', 'draft'); // guard: never mutate a row that's already locked
      setSaving(false);
      if (error) return setStatusMsg('SAVE FAILED: ' + error.message);
    } else {
      const { data, error } = await supabase
        .from('movement_library')
        .insert([{ ...buildPayload(), status: 'draft', parent_sequence_id: parentSequenceId }])
        .select()
        .single();
      setSaving(false);
      if (error) return setStatusMsg('SAVE FAILED: ' + error.message);
      setEditingDraftId((data as LibraryEntry).id);
    }

    setStatusMsg('Draft saved — private to you until submitted.');
    await loadMine();
  };

  const handleSubmitToLibrary = async () => {
    if (!isBuilderComplete()) {
      setStatusMsg('Incomplete — needs a name, apparatus, and at least one movement before it can join the library.');
      return;
    }
    setSaving(true);
    setStatusMsg('');

    const payload = { ...buildPayload(), status: 'locked' as const, locked_at: new Date().toISOString() };

    if (editingDraftId) {
      const { error } = await supabase
        .from('movement_library')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingDraftId)
        .eq('status', 'draft');
      setSaving(false);
      if (error) return setStatusMsg('SUBMIT FAILED: ' + error.message);
    } else {
      const { error } = await supabase
        .from('movement_library')
        .insert([{ ...payload, parent_sequence_id: parentSequenceId }]);
      setSaving(false);
      if (error) return setStatusMsg('SUBMIT FAILED: ' + error.message);
    }

    setStatusMsg('Locked into the library.');
    setShowBuilder(false);
    await Promise.all([loadMine(), loadShared()]);
  };

  const handleDiscardDraft = async (id: string) => {
    const { error } = await supabase.from('movement_library').delete().eq('id', id).eq('status', 'draft');
    if (error) return setStatusMsg('DELETE FAILED: ' + error.message);
    setMine((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUse = async (entry: LibraryEntry) => {
    onUseSequence(entry);
    await supabase.from('movement_library').update({ use_count: entry.use_count + 1 }).eq('id', entry.id);
    setMine((prev) => prev.map((e) => (e.id === entry.id ? { ...e, use_count: e.use_count + 1 } : e)));
    setShared((prev) => prev.map((e) => (e.id === entry.id ? { ...e, use_count: e.use_count + 1 } : e)));
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setScope('mine')}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              scope === 'mine' ? 'border-[#4CAF50] text-[#4CAF50]' : 'border-[#333] text-[#888] hover:text-white'
            }`}
          >
            My Sequences
          </button>
          <button
            onClick={() => setScope('shared')}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              scope === 'shared' ? 'border-[#a855f7] text-[#a855f7]' : 'border-[#333] text-[#888] hover:text-white'
            }`}
          >
            Shared Library
          </button>
        </div>
        <button
          onClick={openNewBuilder}
          className="border border-[#4CAF50] text-[#4CAF50] px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#4CAF50]/10 transition-colors"
        >
          + New Sequence
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or apparatus..."
          className="flex-1 min-w-[200px] bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as ClassTier | '')}
          className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
        >
          <option value="">All Tiers</option>
          {CLASS_TIERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#4CAF50]"
        >
          <option value="">All Categories</option>
          <option value="__uncategorized__">Uncategorized</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {statusMsg && !showBuilder && (
        <p className="text-xs text-[#ff9800] mb-4">{statusMsg}</p>
      )}

      {showBuilder && (
        <div className="bg-[#111] border border-[#a855f7]/40 p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-white uppercase tracking-widest">
              {editingDraftId ? 'Edit Draft' : parentSequenceId ? 'New Version' : 'New Sequence'}
            </h3>
            <button onClick={() => setShowBuilder(false)} className="text-[10px] text-[#888] hover:text-white uppercase tracking-widest">
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={builder.sequenceName}
              onChange={(e) => setBuilder((p) => ({ ...p, sequenceName: e.target.value }))}
              placeholder="Sequence name"
              className="bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#a855f7]"
            />
            <input
              type="text"
              value={builder.apparatusBase}
              onChange={(e) => setBuilder((p) => ({ ...p, apparatusBase: e.target.value }))}
              placeholder="Apparatus (e.g. Reformer + Tower)"
              className="bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#a855f7]"
            />
          </div>

          <div className="flex gap-2">
            {CLASS_TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setBuilder((p) => ({ ...p, classTier: tier }))}
                className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                  builder.classTier === tier ? 'border-[#a855f7] bg-[#a855f7]/10 text-white' : 'border-[#333] text-[#888]'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {PROP_OPTIONS.map((prop) => {
              const active = builder.modifiers.includes(prop);
              return (
                <button
                  type="button"
                  key={prop}
                  onClick={() => toggleModifier(prop)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    active ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-white' : 'border-[#333] text-[#888]'
                  }`}
                >
                  + {prop}
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">Movements</label>
            <div className="space-y-2">
              {builder.movements.map((m, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMovement(i, 'name', e.target.value)}
                    placeholder="Movement name"
                    className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#a855f7]"
                  />
                  <input
                    type="text"
                    value={m.spring}
                    onChange={(e) => updateMovement(i, 'spring', e.target.value)}
                    placeholder="Spring"
                    className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#a855f7]"
                  />
                  <input
                    type="text"
                    value={m.reps}
                    onChange={(e) => updateMovement(i, 'reps', e.target.value)}
                    placeholder="Reps / Duration"
                    className="bg-black border border-[#333] p-2 text-white text-sm outline-none focus:border-[#a855f7]"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setBuilder((p) => ({ ...p, movements: [...p.movements, { ...EMPTY_MOVEMENT }] }))}
              className="mt-2 text-xs text-[#3b82f6] underline decoration-dotted"
            >
              + Add Another Movement
            </button>
          </div>

          {statusMsg && <p className="text-xs text-[#ff9800]">{statusMsg}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="border border-[#333] text-[#888] hover:text-white px-4 py-2 text-xs uppercase tracking-widest transition-colors disabled:opacity-40"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmitToLibrary}
              disabled={saving}
              className="bg-[#a855f7] text-black font-bold px-4 py-2 text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-40"
            >
              Submit to Library (Locks It)
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading && <p className="text-xs text-[#555]">Loading library…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-xs text-[#555]">
            {scope === 'mine' ? 'No sequences yet — start with "+ New Sequence."' : 'No shared sequences match this filter.'}
          </p>
        )}
        {filtered.map((entry) => (
          <div key={entry.id} className="bg-[#111] border border-[#222] p-4">
            <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
              <div>
                <span className="text-white font-bold">{entry.sequence_name}</span>
                {entry.parent_sequence_id && (
                  <span className="ml-2 text-[10px] text-[#3b82f6] uppercase tracking-widest">↳ new version</span>
                )}
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${
                  entry.status === 'locked'
                    ? 'border-[#4CAF50] text-[#4CAF50]'
                    : 'border-[#eab308] text-[#eab308]'
                }`}
              >
                {entry.status === 'locked' ? '🔒 Locked' : '✎ Draft'}
              </span>
            </div>

            <div className="text-xs text-[#888] mb-3 flex flex-wrap gap-x-4 gap-y-1">
              <span>{entry.class_tier}</span>
              <span>{entry.apparatus_base}</span>
              <span>{entry.category || 'Uncategorized'}</span>
              {scope === 'shared' && <span>by {entry.instructor_name}</span>}
              {entry.use_count > 0 && <span>Used {entry.use_count}×</span>}
            </div>

            <div className="text-xs text-[#ccc] mb-3">
              {entry.movement_sequence.map((m, i) => (
                <span key={i} className="inline-block mr-3">
                  {m.name}{m.spring ? ` (${m.spring})` : ''}{m.reps ? ` — ${m.reps}` : ''}
                </span>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {entry.status === 'locked' && (
                <button
                  onClick={() => handleUse(entry)}
                  className="text-[10px] border border-[#3b82f6] text-[#3b82f6] px-3 py-1 uppercase tracking-widest hover:bg-[#3b82f6]/10 transition-colors"
                >
                  Use in New Log
                </button>
              )}
              {entry.status === 'locked' && entry.instructor_id === instructorId && (
                <button
                  onClick={() => openNewVersion(entry)}
                  className="text-[10px] border border-[#333] text-[#888] px-3 py-1 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Create New Version
                </button>
              )}
              {entry.status === 'draft' && entry.instructor_id === instructorId && (
                <>
                  <button
                    onClick={() => openEditDraft(entry)}
                    className="text-[10px] border border-[#eab308] text-[#eab308] px-3 py-1 uppercase tracking-widest hover:bg-[#eab308]/10 transition-colors"
                  >
                    Continue Editing
                  </button>
                  <button
                    onClick={() => handleDiscardDraft(entry.id)}
                    className="text-[10px] border border-[#ff4444] text-[#ff4444] px-3 py-1 uppercase tracking-widest hover:bg-[#ff4444]/10 transition-colors"
                  >
                    Discard Draft
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
