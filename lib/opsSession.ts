import { createHmac, timingSafeEqual } from 'crypto';

export const OPS_COOKIE_NAME = 'moe_ops_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const secret = process.env.OPS_SESSION_SECRET;
  if (!secret) throw new Error('OPS_SESSION_SECRET is not set');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createOpsSessionToken(): { token: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  return { token: `${payload}.${sign(payload)}`, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

export function isValidOpsSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload), 'hex');
  const actual = Buffer.from(signature, 'hex');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() <= expiresAt;
}

export function timingSafeStringsEqual(a: string, b: string): boolean {
  // Hash both to a fixed length first so a raw byte-length mismatch never short-circuits
  // the compare and leaks how much of the passcode was guessed correctly.
  const aHash = createHmac('sha256', 'ops-compare').update(a).digest();
  const bHash = createHmac('sha256', 'ops-compare').update(b).digest();
  return timingSafeEqual(aHash, bHash);
}
