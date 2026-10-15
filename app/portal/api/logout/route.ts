import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CLIENT_COOKIE_NAME } from '@/lib/clientSession';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
