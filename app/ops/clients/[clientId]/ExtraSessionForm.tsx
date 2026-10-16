'use client';

import { useState } from 'react';

// Log a session outside the programme (bonus day, cover session). One movement per line, in plain
// words: the client sees the title and these movement names in their portal.
export default function ExtraSessionForm({ clientId, onSaved }: { clientId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(new Date()));
  const [title, setTitle] = useState('');
  const [moves, setMoves] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(`/ops/api/clients/${clientId}/extra-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_date: date, title, movements: moves.split('\n'), coach_note: note }),
      });
      const body = await res.json();
      if (!res.ok) {
        setMsg(body.error || 'Could not save.');
        return;
      }
      setTitle('');
      setMoves('');
      setNote('');
      setOpen(false);
      onSaved();
    } catch {
      setMsg('Connection failed.');
    } finally {
      setBusy(false);
    }
  };

  const field = 'w-full bg-[#050505] border border-[#333] text-white text-xs py-2 px-2 outline-none focus:border-[#a78bfa]';

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-6 border border-[#a78bfa] text-[#a78bfa] px-3 py-2 text-[10px] tracking-widest hover:bg-[#a78bfa] hover:text-black">
        + LOG AN EXTRA SESSION
      </button>
    );
  }
  return (
    <section className="border border-[#a78bfa]/50 bg-[#0a0a0a] p-5 mb-6 space-y-3">
      <div className="text-[10px] text-[#a78bfa] tracking-[4px] uppercase">Extra session · outside the programme</div>
      <div className="grid sm:grid-cols-[160px_1fr] gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title the client sees, e.g. Single-side strength" className={field} />
      </div>
      <textarea
        value={moves}
        onChange={(e) => setMoves(e.target.value)}
        rows={6}
        placeholder={'One movement per line, plain words, e.g.\nSide plank on the Reformer\nStep-up and sit-down'}
        className={field}
      />
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Coach note (private, never shown to the client)" className={field} />
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="border border-[#a78bfa] text-[#a78bfa] px-4 py-2 text-[10px] tracking-widest hover:bg-[#a78bfa] hover:text-black disabled:opacity-40">
          {busy ? 'SAVING…' : 'SAVE SESSION'}
        </button>
        <button onClick={() => setOpen(false)} className="text-[10px] text-[#666] tracking-widest">CANCEL</button>
        {msg && <span className="text-[11px] text-[#ef4444]">{msg}</span>}
      </div>
    </section>
  );
}
