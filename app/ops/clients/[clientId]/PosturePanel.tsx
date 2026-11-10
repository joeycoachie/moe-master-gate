'use client';

import { useState } from 'react';
import { deviationLines, type StottFindings } from '@/lib/posturalForm';

export type PostureRow = {
  id: string;
  instructor_name: string | null;
  findings: unknown;
  recommended_focus: string | null;
  notes: string | null;
  created_at: string;
};

function isStott(f: unknown): f is StottFindings {
  return typeof f === 'object' && f !== null && (f as { form?: string }).form === 'stott-v1';
}

function legacyLines(f: unknown): string[] {
  if (typeof f !== 'object' || f === null) return [];
  return Object.entries(f as Record<string, string>)
    .filter(([, v]) => v && v !== 'neutral' && v !== 'level')
    .map(([k, v]) => `${k}: ${String(v).replace(/_/g, ' ')}`);
}

// Station 07 assessments for this client, matched by name. Newest open, older ones folded.
export default function PosturePanel({ rows }: { rows: PostureRow[] }) {
  const [openId, setOpenId] = useState<string | null>(rows[0]?.id ?? null);

  return (
    <section className="border border-[#222] bg-[#0a0a0a] p-5 mb-10">
      <div className="flex justify-between items-baseline flex-wrap gap-2 mb-3">
        <h2 className="text-sm font-bold uppercase tracking-widest">Posture · Station 07</h2>
        <a href="/terminal/postural-diagnostic" className="text-[11px] text-[#3b82f6] hover:text-white">
          + NEW ASSESSMENT
        </a>
      </div>
      {!rows.length && (
        <p className="text-xs text-[#666]">No Station 07 assessment under this exact name yet. Use the same spelling as this file.</p>
      )}
      <ol className="space-y-2">
        {rows.map((r) => {
          const open = openId === r.id;
          const f = r.findings;
          const lines = isStott(f) ? deviationLines(f) : legacyLines(f);
          return (
            <li key={r.id} className="border border-[#222] bg-[#050505]">
              <button
                onClick={() => setOpenId(open ? null : r.id)}
                className="w-full text-left p-3 flex justify-between gap-3 text-xs hover:bg-[#111]"
              >
                <span className="text-white">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="text-[#888] flex-1 truncate">{r.recommended_focus}</span>
                <span className="text-[#555]">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div className="px-3 pb-3 space-y-2 text-xs text-[#d4d4d4]">
                  {r.instructor_name && <div className="text-[#666]">By {r.instructor_name}</div>}
                  <ul className="space-y-1">
                    {lines.map((l) => (
                      <li key={l}>· {l}</li>
                    ))}
                  </ul>
                  {isStott(f) && (f.sequencing.flat_areas || f.sequencing.imbalances) && (
                    <div className="text-[#aaa]">
                      Spine sequencing: flat areas {f.sequencing.flat_areas ?? '–'}
                      {f.sequencing.flat_where && ` (${f.sequencing.flat_where})`} · imbalances {f.sequencing.imbalances ?? '–'}
                      {f.sequencing.imbalances_where && ` (${f.sequencing.imbalances_where})`}
                    </div>
                  )}
                  {isStott(f) && f.margin && <div className="text-[#aaa]">Margin: {f.margin}</div>}
                  {r.notes && <div className="text-[#aaa]">Notes: {r.notes}</div>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
