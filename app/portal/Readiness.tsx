'use client';

import { useState } from 'react';
import { PARTS, partDone, summarizeReadiness, type Answers, type Part } from '@/lib/readiness';

// Readiness profile in the client portal: three short parts, one tap per answer.
// Shows how complete the profile is, then the readiness score once every part is done.
export default function Readiness({ initial }: { initial: Answers }) {
  const [answers, setAnswers] = useState<Answers>(initial);
  const [open, setOpen] = useState<Part['key'] | null>(null);
  const [draft, setDraft] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const sum = summarizeReadiness(answers);
  const next = PARTS.find((p) => !partDone(p, answers));

  const start = (key: Part['key']) => {
    const part = PARTS.find((p) => p.key === key)!;
    setDraft(Object.fromEntries(part.questions.filter((q) => answers[q.key]).map((q) => [q.key, answers[q.key]])));
    setOpen(key);
    setNote('');
  };

  const save = async (part: Part) => {
    setBusy(true);
    setNote('');
    try {
      const res = await fetch('/portal/api/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: draft }),
      });
      const body = await res.json();
      if (!res.ok) {
        setNote(body.error || 'Could not save.');
        return;
      }
      setAnswers(body.answers);
      setOpen(null);
      setNote(`${part.title} saved.`);
    } catch {
      setNote('Connection failed.');
    } finally {
      setBusy(false);
    }
  };

  const part = open ? PARTS.find((p) => p.key === open)! : null;

  return (
    <div className="border border-[#222] bg-[#0a0a0a] p-5 space-y-4">
      <div className="flex justify-between items-end gap-3">
        <div>
          <div className="text-[10px] text-[#888] uppercase tracking-widest">Your profile</div>
          <div className="text-sm text-white mt-1">{sum.partsDone} of 3 parts done</div>
        </div>
        {sum.score != null && (
          <div className="text-right">
            <div className="text-[10px] text-[#888] uppercase tracking-widest">Readiness score</div>
            <div className="text-3xl text-[#00e5ff] leading-none mt-1">{sum.score}</div>
            <div className="text-[11px] text-[#4CAF50] mt-1">{sum.band}</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {PARTS.map((p) => (
          <button
            key={p.key}
            onClick={() => start(p.key)}
            className={`h-10 border text-[10px] tracking-widest uppercase transition-colors ${
              partDone(p, answers) ? 'bg-[#00e5ff] border-[#00e5ff] text-black font-bold' : open === p.key ? 'border-[#00e5ff] text-[#00e5ff]' : 'border-[#333] text-[#888]'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>
      {sum.safetyFlag && (
        <p className="text-xs text-[#f59e0b] border border-[#f59e0b]/40 bg-[#f59e0b]/5 p-3">
          Thanks for being honest. Your coach will check in with you before harder work.
        </p>
      )}

      {part ? (
        <div className="space-y-4 border-t border-[#1a1a1a] pt-4">
          <p className="text-xs text-[#aaa] font-sans leading-relaxed">{part.intro}</p>
          {part.questions.map((q) => (
            <div key={q.key}>
              <div className="text-[12px] text-[#ddd] font-sans leading-snug mb-2">{q.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {q.choices.map((c) => {
                  const on = draft[q.key] === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setDraft((d) => ({ ...d, [q.key]: c.value }))}
                      className={`px-3 h-9 border text-xs transition-colors ${on ? 'bg-[#00e5ff] border-[#00e5ff] text-black font-bold' : 'border-[#333] text-[#999]'}`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button
              onClick={() => save(part)}
              disabled={busy || !part.questions.every((q) => draft[q.key])}
              className="border border-[#00e5ff] text-[#00e5ff] px-5 py-2 text-xs tracking-widest hover:bg-[#00e5ff] hover:text-black transition-colors disabled:opacity-40"
            >
              {busy ? 'SAVING…' : 'SAVE'}
            </button>
            <button onClick={() => setOpen(null)} className="text-[10px] text-[#666] tracking-widest">
              CLOSE
            </button>
            {note && <span className="text-[11px] text-[#888]">{note}</span>}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {next && (
            <button
              onClick={() => start(next.key)}
              className="border border-[#00e5ff] text-[#00e5ff] px-5 py-2 text-xs tracking-widest hover:bg-[#00e5ff] hover:text-black transition-colors"
            >
              {sum.partsDone === 0 ? 'START · ABOUT 2 MINUTES' : `NEXT · ${next.title.toUpperCase()}`}
            </button>
          )}
          {note && <span className="text-[11px] text-[#888]">{note}</span>}
        </div>
      )}
    </div>
  );
}
