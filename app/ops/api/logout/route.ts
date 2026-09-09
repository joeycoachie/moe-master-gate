import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OPS_COOKIE_NAME } from '@/lib/opsSession';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(OPS_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
