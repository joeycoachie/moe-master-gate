import 'server-only';
import { cookies } from 'next/headers';
import { CLIENT_COOKIE_NAME, readClientSessionToken } from '@/lib/clientSession';
import { ARMORY_PROTOCOLS, clientArcFor } from '@/lib/armory';
import fuelCatalog from '@/lib/fuelCatalog.json';
import { FUEL_QA, PARTNER_BRAND, PARTNER_PRODUCTS } from '@/lib/fuelQa';

// protocol_id for a session logged outside any arc (see /ops/api/clients/[clientId]/extra-session).
export const EXTRA_SESSION_ID = 'EXTRA';

export async function currentClientId(): Promise<string | null> {
  const cookieStore = await cookies();
  return readClientSessionToken(cookieStore.get(CLIENT_COOKIE_NAME)?.value);
}

type Station = { done?: boolean; movement?: string };
type Audit = { gates?: { name?: string; label?: string }[]; somatic?: { label?: string; checked?: boolean }[] };
type FuelItem = { key: string; dose?: string };
type CatalogEntry = { title: string; group: string; tag: string; desc: string; benefits: string[]; usage: string };

// What a client may see of their own file. Deliberately leaves out instructor notes,
// conditions, history, avoid lists, field notes and routing verdicts (founder's working notes).
export function buildClientView(
  client: { full_name: string; current_arc: string | null; fuel_unlocked: unknown; recup_member_code: string | null },
  entries: { stations: unknown; audit: unknown; session_date: string; protocol_id: string; note?: string | null }[],
) {
  const protocols = new Map(ARMORY_PROTOCOLS.map((p) => [p.id, p]));
  const sessions = entries
    .map((e) => {
      const stations = Object.values((e.stations ?? {}) as Record<string, Station>);
      const audit = (e.audit ?? null) as Audit | null;
      const p = protocols.get(e.protocol_id);
      const ca = clientArcFor(e.protocol_id);
      // Extra sessions (outside the programme) carry their title in the session note and show the
      // movement names, which the founder types in plain words.
      const extra = e.protocol_id === EXTRA_SESSION_ID;
      return {
        date: e.session_date,
        extra,
        arc: extra ? 'Extra session' : (ca?.name ?? 'Your programme'),
        week: extra ? null : (p?.week ?? null),
        title: extra ? e.note || 'Extra session' : (p && ca?.weeks[p.week]) || (p ? `Week ${p.week}` : ''),
        moves: extra ? stations.filter((st) => st.done && st.movement).map((st) => st.movement as string) : [],
        done: stations.filter((s) => s.done).length,
        total: stations.length,
        gates: (audit?.gates ?? []).map((g) => ({
          name: (g.name ?? '').replace(/^(Gate|Test)\s*\d+\s*:\s*/i, '').replace(/\s*\((P\d|Phase \d+[^)]*)\)\s*$/i, ''),
          result: g.label ?? '',
        })),
        felt: (audit?.somatic ?? []).filter((s) => s.checked).map((s) => s.label ?? ''),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const products = (fuelCatalog as { products: Record<string, CatalogEntry> }).products;
  const fuel = (Array.isArray(client.fuel_unlocked) ? (client.fuel_unlocked as FuelItem[]) : [])
    .filter((f) => f && products[f.key])
    .map((f) => ({ key: f.key, dose: f.dose ?? '', ...products[f.key] }));
  const unlocked = new Set(fuel.map((f) => f.key));
  const fuelWithQa = fuel.map((f) => ({
    ...f,
    brand: PARTNER_PRODUCTS.has(f.key) ? PARTNER_BRAND : '',
    qa: FUEL_QA[f.key]?.qa ?? [],
    // Pairings: only products in the client catalog that aren't already in their plan.
    pairs: (FUEL_QA[f.key]?.pairs ?? [])
      .filter((p) => products[p.key] && !unlocked.has(p.key))
      .map((p) => ({ key: p.key, title: products[p.key].title.split(' (')[0], brand: PARTNER_PRODUCTS.has(p.key) ? PARTNER_BRAND : '', why: p.why })),
  }));

  const current = client.current_arc ? clientArcFor(client.current_arc) : undefined;

  // The programme as a path of weeks: which ones have at least one session on record.
  const arcId = client.current_arc?.split('_')[0];
  const weeksDone = new Set(
    entries.filter((e) => e.protocol_id.split('_')[0] === arcId).map((e) => protocols.get(e.protocol_id)?.week).filter(Boolean),
  );
  const knownWeeks = current ? Object.keys(current.weeks).map(Number) : [];
  const weekCount = current ? Math.max(current.totalWeeks ?? 0, ...knownWeeks, ...[...weeksDone].map(Number)) : 0;
  const journey = Array.from({ length: weekCount }, (_, i) => ({
    week: i + 1,
    title: current?.weeks[i + 1] ?? '',
    done: weeksDone.has(i + 1),
  }));

  return {
    firstName: client.full_name.split(/\s+/)[0],
    arc: current?.name ?? null,
    promise: current?.promise ?? null,
    focus: current?.focus ?? [],
    journey,
    sessions,
    fuel: fuelWithQa,
    recupLinked: !!client.recup_member_code,
  };
}
