import 'server-only';
import { createHash, createHmac, randomInt, timingSafeEqual } from 'crypto';

// Client portal session: a signed cookie naming one client. Separate from the instructor,
// Ops and Architect sessions so a client code can never open anything but its own file.
export const CLIENT_COOKIE_NAME = 'moe_client_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, so clients aren't asked every visit
const SCOPE = 'client';

function getSecret(): string {
  const secret = process.env.OPS_SESSION_SECRET;
  if (!secret) throw new Error('OPS_SESSION_SECRET is not set');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createClientSessionToken(clientId: string): { token: string; maxAge: number } {
  const payload = `${SCOPE}:${clientId}:${Date.now() + SESSION_TTL_MS}`;
  return { token: `${payload}.${sign(payload)}`, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

// Returns the client id if the token is valid and unexpired, else null.
export function readClientSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const [scope, clientId, expires] = payload.split(':');
  if (scope !== SCOPE || !clientId || !expires) return null;
  const expected = Buffer.from(sign(payload), 'hex');
  const actual = Buffer.from(signature, 'hex');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return Number(expires) >= Date.now() ? clientId : null;
}

// Codes look like MOE-7KQ2M-X9PDA: 10 characters from an alphabet without 0/O/1/I/L,
// about 50 bits, so guessing is not practical. Only the hash is stored.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generatePortalCode(): string {
  const pick = () => Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  return `MOE-${pick()}-${pick()}`;
}

export function normalizePortalCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function hashPortalCode(code: string): string {
  return createHash('sha256').update(`moe-portal:${normalizePortalCode(code)}`).digest('hex');
}
