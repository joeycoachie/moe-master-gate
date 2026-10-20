'use client';

import { useState } from 'react';

// Copies one message; falls back to selecting the text where the phone blocks the clipboard.
type Labels = { copy: string; copied: string; selected: string };
const EN: Labels = { copy: 'Copy', copied: 'Copied', selected: 'Selected, press copy' };

export default function CopyButton({ text, targetId, labels = EN }: { text: string; targetId: string; labels?: Labels }) {
  const [label, setLabel] = useState(labels.copy);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setLabel(labels.copied);
    } catch {
      const el = document.getElementById(targetId);
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setLabel(labels.selected);
    }
    setTimeout(() => setLabel(labels.copy), 2000);
  };
  return (
    <button type="button" onClick={copy} className="copy">
      {label}
    </button>
  );
}
