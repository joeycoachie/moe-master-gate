import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OPS_ARCHITECT_COOKIE_NAME, isValidOpsArchitectToken } from '@/lib/opsSession';
import { AdminNotConfiguredError } from '@/lib/supabaseAdmin';

// Route handlers for client health data must never assume proxy.ts ran.
export async function isArchitect(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidOpsArchitectToken(cookieStore.get(OPS_ARCHITECT_COOKIE_NAME)?.value);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Architect access required.' }, { status: 401 });
}

// One place that turns a failed admin call into a readable answer for the founder.
export function adminError(err: unknown) {
  if (err instanceof AdminNotConfiguredError) {
    return NextResponse.json(
      { error: 'Client system not set up yet: SUPABASE_SERVICE_ROLE_KEY is missing on the server.', setup: true },
      { status: 503 },
    );
  }
  const message = err instanceof Error ? err.message : String(err);
  const missingTable = /relation .* does not exist|Could not find the table/i.test(message);
  return NextResponse.json(
    missingTable
      ? { error: 'Client system not set up yet: run client_arc_system_schema.sql in Supabase.', setup: true }
      : { error: message },
    { status: missingTable ? 503 : 500 },
  );
}
