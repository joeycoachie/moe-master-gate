import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TEAM_COOKIE_NAME } from '@/lib/teamSession';

export async function POST() {
  (await cookies()).delete(TEAM_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
