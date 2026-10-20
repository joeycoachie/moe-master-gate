import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

// RECUP.STN team session: a signed cookie naming one outreach partner. Separate from the
// instructor, client, Ops and Architect sessions, so a team code opens only the team pages.
export const TEAM_COOKIE_NAME = 'moe_team_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SCOPE = 'team';

function getSecret(): string {
  const secret = process.env.OPS_SESSION_SECRET;
  if (!secret) throw new Error('OPS_SESSION_SECRET is not set');
  return secret;
}

const sign = (payload: string) => createHmac('sha256', getSecret()).update(payload).digest('hex');

export function createTeamSessionToken(partnerId: string) {
  const payload = `${SCOPE}:${partnerId}:${Date.now() + SESSION_TTL_MS}`;
  return { token: `${payload}.${sign(payload)}`, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

export function readTeamSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const [scope, partnerId, expires] = payload.split(':');
  if (scope !== SCOPE || !partnerId || !expires) return null;
  const expected = Buffer.from(sign(payload), 'hex');
  const actual = Buffer.from(token.slice(dot + 1), 'hex');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return Number(expires) >= Date.now() ? partnerId : null;
}

export async function currentPartnerId(): Promise<string | null> {
  return readTeamSessionToken((await cookies()).get(TEAM_COOKIE_NAME)?.value);
}

export const normalizeTeamCode = (input: string) => input.toUpperCase().replace(/[^A-Z0-9]/g, '');
export const hashTeamCode = (code: string) => createHash('sha256').update(`moe-team:${normalizeTeamCode(code)}`).digest('hex');

// Team codes look like TEAM-AMY-482917, so they never clash with client codes (NAME-123456).
// A partner's code is worked out from their id, a counter and the server secret, so the founder
// can always see the current code again (no "shown once, then lost"). NEW CODE moves the counter on,
// which kills the old code. Only the hash is stored; the code can't be worked out without the secret.
const firstNameOf = (fullName: string) =>
  (fullName.trim().split(/\s+/)[0] || 'PARTNER').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12) || 'PARTNER';

export function teamCodeFor(fullName: string, partnerId: string, n: number): string {
  const digits = parseInt(createHmac('sha256', getSecret()).update(`team-code:${partnerId}:${n}`).digest('hex').slice(0, 10), 16) % 1_000_000;
  return `TEAM-${firstNameOf(fullName)}-${String(digits).padStart(6, '0')}`;
}

// The partner's current code and its counter, or null if the stored code was made another way.
export function currentTeamCode(fullName: string, partnerId: string, codeHash: string | null) {
  if (!codeHash) return null;
  for (let n = 0; n < 200; n++) {
    const code = teamCodeFor(fullName, partnerId, n);
    if (hashTeamCode(code) === codeHash) return { code, n };
  }
  return null;
}

