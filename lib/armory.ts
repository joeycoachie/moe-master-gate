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
