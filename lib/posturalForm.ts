// Station 07 · Postural Diagnostic Intake.
// Mirrors the STOTT PILATES Postural Analysis Guide checklist (Posture · Matwork & Reformer
// Support Material, p.18) so the paper sheet can be copied tick for tick.
//
// Stored in postural_assessments.findings as:
//   { form: 'stott-v1',
//     plumb: { off_line: true|false|null, aligned: true|false|null, note },
//     views: { side: { ankle: { plantar_flexed: ['R'], neutral: ['L'] }, pelvis: { anterior_tilt: [] } },
//              front: {...}, back: {...} },
//     sequencing: { flat_areas: 'Y'|'N'|null, flat_where, imbalances: 'Y'|'N'|null, imbalances_where },
//     margin: 'handwritten notes copied from the sheet' }
// An option present with [] means ticked without a side (both sides / whole segment).
// Older rows (before Nov 2026) hold the 7-checkpoint shape { cervical: 'neutral', ... }.

export type Side = 'R' | 'L';
export type Region = 'upper' | 'core' | 'lower';
export type ViewKey = 'side' | 'front' | 'back';

export type FormOption = { value: string; label: string; sided?: boolean; neutral?: boolean };
export type FormSection = { key: string; label: string; region: Region; options: FormOption[] };
export type FormView = { key: ViewKey; label: string; hint?: string; sections: FormSection[] };

const n = (value: string, label: string, sided = false): FormOption => ({ value, label, sided, neutral: true });
const o = (value: string, label: string, sided = false): FormOption => ({ value, label, sided });

export const STOTT_VIEWS: FormView[] = [
  {
    key: 'side',
    label: 'Side view',
    hint: 'Check both sides',
    sections: [
      { key: 'ankle', label: 'Ankle joints', region: 'lower', options: [n('neutral', 'Neutral', true), o('plantar_flexed', 'Plantar flexed', true), o('dorsiflexed', 'Dorsiflexed', true)] },
      { key: 'knees', label: 'Knees', region: 'lower', options: [n('neutral', 'Neutral', true), o('hyperextended', 'Hyperextended', true), o('flexed', 'Flexed', true)] },
      { key: 'hips', label: 'Hip joints', region: 'lower', options: [n('neutral', 'Neutral', true), o('flexed', 'Flexed', true), o('extended', 'Extended', true)] },
      { key: 'pelvis', label: 'Pelvis', region: 'core', options: [n('neutral', 'Neutral', true), o('anterior_tilt', 'Anterior pelvic tilt', true), o('posterior_tilt', 'Posterior pelvic tilt', true)] },
      { key: 'lumbar', label: 'Lumbar spine', region: 'core', options: [n('neutral', 'Neutral'), o('flat', 'Flat (decreased curve)'), o('excessive_extension', 'Excessive extension (increased curve)')] },
      { key: 'lower_thoracic', label: 'Lower thoracic spine', region: 'upper', options: [n('neutral', 'Neutral'), o('flat', 'Flat (decreased curve)'), o('excessive_flexion', 'Excessive flexion (increased curve)')] },
      { key: 'upper_thoracic', label: 'Upper thoracic spine', region: 'upper', options: [n('neutral', 'Neutral'), o('flat', 'Flat (decreased curve)'), o('excessive_flexion', 'Excessive flexion (increased curve)')] },
      { key: 'cervical', label: 'Cervical spine', region: 'upper', options: [n('neutral', 'Neutral'), o('flat', 'Flat (decreased curve)'), o('excessive_extension', 'Excessive extension (increased curve)')] },
      { key: 'head', label: 'Head', region: 'upper', options: [n('neutral', 'Neutral'), o('forward', 'Forward'), o('retracted', 'Retracted')] },
    ],
  },
  {
    key: 'front',
    label: 'Front view',
    hint: 'Confirm from back if necessary',
    sections: [
      { key: 'feet', label: 'Feet', region: 'lower', options: [n('neutral', 'Neutral', true), o('inverted', 'Inverted / supinated', true), o('everted', 'Everted / pronated', true)] },
      { key: 'knees', label: 'Knees', region: 'lower', options: [n('neutral', 'Neutral'), o('valgum', 'Knock-kneed (genu valgum)'), o('varum', 'Bow-legged (genu varum)')] },
      { key: 'pelvis', label: 'Pelvis', region: 'core', options: [n('level', 'Level'), o('elevated', 'Elevated', true), o('rotated_cw', 'Rotated clockwise'), o('rotated_ccw', 'Rotated counter-clockwise')] },
      { key: 'rib_cage', label: 'Rib cage', region: 'core', options: [n('neutral', 'Neutral'), o('elevated', 'Elevated', true), o('shifted', 'Shifted', true), o('rotated_cw', 'Rotated clockwise'), o('rotated_ccw', 'Rotated counter-clockwise')] },
      { key: 'shoulders', label: 'Shoulders', region: 'upper', options: [n('level', 'Level'), o('elevated', 'Elevated', true), o('depressed', 'Depressed', true)] },
      { key: 'head', label: 'Head', region: 'upper', options: [o('rotated_cw', 'Rotated clockwise'), o('rotated_ccw', 'Rotated counter-clockwise'), n('neutral', 'Neutral'), o('tilted', 'Tilted', true), o('shifted', 'Shifted', true)] },
    ],
  },
  {
    key: 'back',
    label: 'Back view',
    sections: [
      { key: 'feet', label: 'Feet', region: 'lower', options: [n('neutral', 'Neutral', true), o('inverted', 'Inverted / supinated', true), o('everted', 'Everted / pronated', true)] },
      { key: 'femurs', label: 'Femurs', region: 'lower', options: [n('neutral', 'Neutral', true), o('medial_rotation', 'Medial rotation', true), o('lateral_rotation', 'Lateral rotation', true)] },
      { key: 'pelvis', label: 'Pelvis', region: 'core', options: [n('level', 'Level'), o('elevated', 'Elevated', true), o('rotated_cw', 'Rotated clockwise'), o('rotated_ccw', 'Rotated counter-clockwise')] },
      {
        key: 'scapulae',
        label: 'Scapulae',
        region: 'upper',
        options: [
          n('neutral', 'Neutral', true),
          o('protracted', 'Protracted', true),
          o('retracted', 'Retracted', true),
          o('elevated', 'Elevated', true),
          o('depressed', 'Depressed', true),
          o('upward_rotated', 'Upwardly rotated', true),
          o('downward_rotated', 'Downwardly rotated', true),
          o('winging', 'Winging', true),
          o('anterior_tipped', 'Anteriorly tipped', true),
        ],
      },
      { key: 'humeri', label: 'Humeri', region: 'upper', options: [n('neutral', 'Neutral', true), o('medially_rotated', 'Medially rotated', true)] },
    ],
  },
];

export type SectionMarks = Record<string, Side[]>;
export type ViewMarks = Record<string, SectionMarks>;
export type YesNo = 'Y' | 'N' | null;

export type StottFindings = {
  form: 'stott-v1';
  plumb: { off_line: boolean | null; aligned: boolean | null; note: string };
  views: Record<ViewKey, ViewMarks>;
  sequencing: { flat_areas: YesNo; flat_where: string; imbalances: YesNo; imbalances_where: string };
  margin: string;
};

export function emptyFindings(): StottFindings {
  return {
    form: 'stott-v1',
    plumb: { off_line: null, aligned: null, note: '' },
    views: { side: {}, front: {}, back: {} },
    sequencing: { flat_areas: null, flat_where: '', imbalances: null, imbalances_where: '' },
    margin: '',
  };
}

const REGION_LABEL: Record<Region, string> = {
  upper: 'Upper Body Alignment / Thoracic Mobility',
  core: 'Core Activation / Pelvic Stability',
  lower: 'Lower Kinetic Chain / Load Distribution',
};

function sideText(sides: Side[]): string {
  if (sides.length === 0 || sides.length === 2) return sides.length === 2 ? ' (both)' : '';
  return sides[0] === 'R' ? ' (R)' : ' (L)';
}

/** Plain list of every non-neutral tick, e.g. "Side · Ankle joints: Plantar flexed (R)". */
export function deviationLines(f: StottFindings): string[] {
  const lines: string[] = [];
  for (const view of STOTT_VIEWS) {
    for (const section of view.sections) {
      const marks = f.views[view.key]?.[section.key] ?? {};
      const items = section.options
        .filter((opt) => !opt.neutral && marks[opt.value])
        .map((opt) => opt.label + sideText(marks[opt.value]));
      if (items.length) lines.push(`${view.label} · ${section.label}: ${items.join(', ')}`);
    }
  }
  return lines;
}

export function countTicks(f: StottFindings): number {
  return Object.values(f.views).reduce(
    (sum, view) => sum + Object.values(view).reduce((s, marks) => s + Object.keys(marks).length, 0),
    0,
  );
}

export function recommendedFocus(f: StottFindings): string {
  const flagged = new Set<Region>();
  for (const view of STOTT_VIEWS) {
    for (const section of view.sections) {
      const marks = f.views[view.key]?.[section.key] ?? {};
      if (section.options.some((opt) => !opt.neutral && marks[opt.value])) flagged.add(section.region);
    }
  }
  if (flagged.size === 0) {
    return 'General Maintenance / Movement Refinement — no significant postural deviations flagged.';
  }
  return (['upper', 'core', 'lower'] as Region[]).filter((r) => flagged.has(r)).map((r) => REGION_LABEL[r]).join(' + ');
}
