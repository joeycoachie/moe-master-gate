'use client';

import { useState } from 'react';

// Copies one message; falls back to selecting the text where the phone blocks the clipboard.
export default function CopyButton({ text, targetId }: { text: string; targetId: string }) {
  const [label, setLabel] = useState('Copy');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setLabel('Copied');
    } catch {
      const el = document.getElementById(targetId);
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setLabel('Selected, press copy');
    }
    setTimeout(() => setLabel('Copy'), 2000);
  };
  return (
    <button type="button" onClick={copy} className="copy">
      {label}
    </button>
  );
}
