import 'server-only';
import { createHash, createHmac, randomInt, timingSafeEqual } from 'crypto';
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

// Team codes look like TEAM-AMY-482917, so they never clash with client codes (NAME-123456).
export function generateTeamCode(fullName: string): string {
  const first = (fullName.trim().split(/\s+/)[0] || 'PARTNER').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12) || 'PARTNER';
  return `TEAM-${first}-${String(randomInt(0, 1_000_000)).padStart(6, '0')}`;
}

export const normalizeTeamCode = (input: string) => input.toUpperCase().replace(/[^A-Z0-9]/g, '');
export const hashTeamCode = (code: string) => createHash('sha256').update(`moe-team:${normalizeTeamCode(code)}`).digest('hex');
