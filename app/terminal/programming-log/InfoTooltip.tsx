'use client';

import { useState } from 'react';

export default function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block ml-1.5 align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        aria-label="More information"
        className="w-4 h-4 rounded-full border border-[#555] text-[#888] text-[10px] leading-[14px] hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors"
      >
        i
      </button>
      {open && (
        <span className="absolute z-10 left-1/2 -translate-x-1/2 top-6 w-64 bg-[#111] border border-[#333] p-3 text-[11px] leading-relaxed text-[#ccc] normal-case tracking-normal font-normal shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
