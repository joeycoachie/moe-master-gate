'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Team sign-in. The same code also works in the main gate's access box.
export default function RecupTeamLogin() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/recup/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => null);
    if (res?.ok) return router.replace('/recup/team');
    setBusy(false);
    setError('That code didn’t work. Check it, or ask Joey for a new one.');
  };

  return (
    <div className="wrap" style={{ maxWidth: 440 }}>
      <header className="stack">
        <p className="eyebrow">RECUP.STN · by The M.O.E. Group</p>
        <h1>Team sign-in</h1>
        <p className="lede">For partners who reach out to studios with us. Use the team code Joey gave you.</p>
      </header>
      <form className="stack" onSubmit={submit}>
        <label htmlFor="code" className="note">Your team code</label>
        <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="TEAM-NAME-123456" autoComplete="off" autoCapitalize="characters" required />
        {error && <p className="err">{error}</p>}
        <button className="btn" disabled={busy || !code.trim()}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="note">No code yet? Message Joey on WhatsApp at +60 10-231 9893.</p>
    </div>
  );
}
