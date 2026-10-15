import 'server-only';
import { cookies } from 'next/headers';
import { CLIENT_COOKIE_NAME, readClientSessionToken } from '@/lib/clientSession';
import { ARMORY_PROTOCOLS } from '@/lib/armory';
import fuelCatalog from '@/lib/fuelCatalog.json';

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
  entries: { stations: unknown; audit: unknown; session_date: string; protocol_id: string }[],
) {
  const protocols = new Map(ARMORY_PROTOCOLS.map((p) => [p.id, p]));
  const sessions = entries
    .map((e) => {
      const stations = Object.values((e.stations ?? {}) as Record<string, Station>);
      const audit = (e.audit ?? null) as Audit | null;
      const p = protocols.get(e.protocol_id);
      return {
        date: e.session_date,
        arc: p ? p.arc.replace(/^KIN-P\d+\s*[—-]\s*/, '') : e.protocol_id,
        week: p?.week ?? null,
        title: p?.title ?? e.protocol_id,
        done: stations.filter((s) => s.done).length,
        total: stations.length,
        gates: (audit?.gates ?? []).map((g) => ({ name: (g.name ?? '').replace(/\s*\(P\d\)\s*$|\s*\(Phase \d+[^)]*\)\s*$/i, ''), result: g.label ?? '' })),
        felt: (audit?.somatic ?? []).filter((s) => s.checked).map((s) => s.label ?? ''),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const products = (fuelCatalog as { products: Record<string, CatalogEntry> }).products;
  const fuel = (Array.isArray(client.fuel_unlocked) ? (client.fuel_unlocked as FuelItem[]) : [])
    .filter((f) => f && products[f.key])
    .map((f) => ({ key: f.key, dose: f.dose ?? '', ...products[f.key] }));

  const current = client.current_arc ? ARMORY_PROTOCOLS.find((p) => p.id.startsWith(client.current_arc + '_')) : undefined;
  return {
    firstName: client.full_name.split(/\s+/)[0],
    arc: current ? current.arc.replace(/^KIN-P\d+\s*[—-]\s*/, '') : null,
    sessions,
    fuel,
    recupLinked: !!client.recup_member_code,
  };
}
