'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OpsLoginPage() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'CHECKING'>('IDLE');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('CHECKING');

    try {
      const res = await fetch('/ops/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'ACCESS DENIED.');
        setStatus('IDLE');
        return;
      }

      router.push('/ops/roster');
    } catch {
      setError('CONNECTION FAILED.');
      setStatus('IDLE');
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-mono flex flex-col overflow-hidden">
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="w-full max-w-md p-6 text-center">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-[10px] text-[#555] tracking-[6px] uppercase mb-8">
              GOD MODE TERMINAL — OPS ACCESS
            </div>

            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="ENTER OPS ACCESS CODE"
              autoComplete="off"
              disabled={status === 'CHECKING'}
              className="w-4/5 bg-transparent border-b border-[#333] text-white text-lg py-4 px-2 text-center outline-none tracking-[3px] transition-all focus:border-[#a855f7] disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={status === 'CHECKING' || !passcode}
              className="border border-[#333] px-6 py-2 text-xs text-[#888] hover:text-white hover:border-[#a855f7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'CHECKING' ? 'VERIFYING…' : 'UNLOCK'}
            </button>

            {error && (
              <div className="text-[#ff4444] text-[11px] mt-4 tracking-[1px]">{error}</div>
            )}
          </form>
        </div>
      </div>

      <div className="w-full pt-4 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
}
