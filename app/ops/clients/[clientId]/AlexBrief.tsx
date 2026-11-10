'use client';

import { useState } from 'react';
import { deviationLines, type StottFindings } from '@/lib/posturalForm';
import type { PostureRow } from './PosturePanel';

type BriefClient = { full_name: string; format: string; history: string; conditions: string; avoid: string; current_arc: string | null };

// KA-Alex (on Gemini) builds the arcs. This turns the client file + latest Station 07 sheet into one
// paste-ready brief with the name taken out (D3: arcs are client-agnostic). Data in, arc out.
function buildBrief(c: BriefClient, posture: PostureRow[]): string {
  const names = c.full_name.split(/\s+/).filter((n) => n.length > 1);
  const scrub = (t: string) => names.reduce((s, n) => s.replace(new RegExp(`\\b${n}\\b`, 'gi'), 'the client'), t).trim();
  const latest = posture.find((p) => (p.findings as StottFindings | null)?.form === 'stott-v1');
  const f = latest?.findings as StottFindings | undefined;
  const date = latest ? new Date(latest.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const out = [
    `KA-Alex, client brief from the Terminal (${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}). No name by design.`,
    '',
    'Source of truth: the coach\'s STOTT sheet logged in Station 07. Where any earlier dossier disagrees, the sheet wins. Never infer posture from body weight or a typical pattern.',
    '',
    `Format: ${c.format}. Current arc: ${c.current_arc || 'none yet'}.`,
  ];
  if (c.history.trim()) out.push('', 'Background:', scrub(c.history));
  if (f) {
    out.push('', `Posture (Station 07, ${date}), non-neutral findings only:`, ...deviationLines(f).map((l) => `- ${l}`));
    const s = f.sequencing;
    if (s.flat_areas || s.imbalances)
      out.push(`- Spine sequencing: flat areas ${s.flat_areas ?? '-'}${s.flat_where ? ` (${s.flat_where})` : ''}; imbalances ${s.imbalances ?? '-'}${s.imbalances_where ? ` (${s.imbalances_where})` : ''}`);
    if (latest?.notes) out.push(`- Coach note: ${scrub(latest.notes)}`);
  } else {
    out.push('', 'Posture: no Station 07 sheet yet. Ask the coach for one before building.');
  }
  if (c.conditions.trim()) out.push('', 'Conditions (turn into override toggles, never print in the card):', scrub(c.conditions));
  if (c.avoid.trim()) out.push('', 'Avoid:', scrub(c.avoid));
  out.push(
    '',
    'Build rules: SYS-D022 V2.2 (Anchor and Crucible fixed, Primer and Unwind triage). Setup / Action / Breath / Layer format. Overrides carry forward through every week of the arc. Use an existing arc if one fits; propose a new one only if none does.',
    'Return: one complete HTML file per week, nothing after </html>, with ID, arc, week and "Replaces".',
  );
  return out.join('\n');
}

export default function AlexBrief({ client, posture }: { client: BriefClient; posture: PostureRow[] }) {
  const [copied, setCopied] = useState('');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildBrief(client, posture));
      setCopied('Copied. Paste it into KA-Alex on Gemini.');
    } catch {
      setCopied('Copy blocked by the browser. Try again.');
    }
  };
  return (
    <div className="flex items-center gap-3 flex-wrap -mt-6 mb-10">
      <button
        onClick={copy}
        className="border border-[#a855f7] text-[#a855f7] px-4 py-2 text-xs tracking-widest hover:bg-[#a855f7] hover:text-black transition-colors"
      >
        COPY BRIEF FOR KA-ALEX
      </button>
      <span className="text-[11px] text-[#888]">{copied || 'Name removed. Posture from the latest Station 07 sheet, plus conditions and avoid.'}</span>
    </div>
  );
}
