import { readFile } from 'fs/promises';
import path from 'path';

// Biomechanical Arc registry. Each protocol is a self-contained SYS-D022 battle card
// stored in armory/protocols/<id>.html — outside public/, so the only way in is the
// Architect-gated route at /ops/armory/<id>.
export type ArmoryProtocol = {
  id: string;
  arc: string;
  week: number;
  title: string;
  focus: string;
  doctrine: string;
  source: string;
  addedOn: string;
};

export const ARMORY_PROTOCOLS: ArmoryProtocol[] = [
  {
    id: 'KIN-P016_W1',
    arc: 'KIN-P016 — Upper Crossed',
    week: 1,
    title: 'Calibration to Long Stretch',
    focus: 'Scapulothoracic Calibration → Oblique Sling Pull → Long Stretch Series',
    doctrine: 'SYS-D022 V2.0',
    source: 'https://github.com/joeycoachie/KIN-P016_W1_Upper-Crossed_Advanced-Kinetic-Load',
    addedOn: '2026-10-01',
  },
  {
    id: 'KIN-P016_W2',
    arc: 'KIN-P016 — Upper Crossed',
    week: 2,
    title: '4s Eccentric Load & Tension',
    focus: '4s Eccentric Scapular Braking → Stable-Base Anterior/Posterior Slings → 5s Long Stretch',
    doctrine: 'SYS-D022 V2.0',
    source: 'movement_os_advanced_upper_crossed_w2.html',
    addedOn: '2026-10-02',
  },
  {
    id: 'KIN-P019_W1',
    arc: 'KIN-P019 — Knee/Nerve Diagnostic & Hip Flow',
    week: 1,
    title: 'Disguised Diagnostic & Hip Engine (generic reissue)',
    focus: 'Calm Sympathetic Nerve Guarding → Eliminate Anterior Knee Shear → Build Proximal Hip Strength',
    doctrine: 'SYS-D022 V2.1',
    source: 'KA-Alex reissue (client-agnostic), 11 Oct 2026; replaces the 8 Oct version',
    addedOn: '2026-10-11',
  },
  {
    id: 'KIN-P019_W2',
    arc: 'KIN-P019 — Knee/Nerve Diagnostic & Hip Flow',
    week: 2,
    title: 'Proximal Hip Armor & Zero Knee Shear',
    focus: 'All load above the knee: glute medius and max, vertical shins, zero popliteal or patellar stress',
    doctrine: 'SYS-D022 V2.1',
    source: 'KA-Alex (KIN-T072), 11 Oct 2026',
    addedOn: '2026-10-11',
  },
];

const PROTOCOL_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function findProtocol(id: string): ArmoryProtocol | undefined {
  if (!PROTOCOL_ID_PATTERN.test(id)) return undefined;
  return ARMORY_PROTOCOLS.find((p) => p.id === id);
}

export async function readProtocolHtml(protocol: ArmoryProtocol): Promise<string> {
  return readFile(path.join(process.cwd(), 'armory', 'protocols', `${protocol.id}.html`), 'utf8');
}

export function groupByArc(protocols: ArmoryProtocol[]): [string, ArmoryProtocol[]][] {
  const arcs = new Map<string, ArmoryProtocol[]>();
  for (const p of protocols) {
    arcs.set(p.arc, [...(arcs.get(p.arc) ?? []), p]);
  }
  return [...arcs.entries()].map(([arc, list]) => [arc, list.sort((a, b) => a.week - b.week)]);
}
