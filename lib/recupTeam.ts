import { WAIT_WORKING_DAYS, workingDaysSince } from '@/lib/outreach';

// RECUP.STN team log: the Fuel road only, in the partner's words. Pure helpers shared by the
// partner's page, the founder's /ops/partners page and their API routes.

export const TEAM_STAGES = ['found', 'messaged', 'replied', 'booked', 'held'] as const;
export type TeamStage = (typeof TEAM_STAGES)[number] | 'no';

export const TEAM_STAGE_LABEL: Record<TeamStage, string> = {
  found: 'Found',
  messaged: 'Messaged',
  replied: 'Replied',
  booked: 'Tasting booked',
  held: 'Tasting held',
  no: 'Not now',
};

export type TeamTarget = {
  id: string;
  partner_id: string;
  studio: string;
  area: string;
  contact: string;
  stage: TeamStage;
  stage_at: Partial<Record<TeamStage, string>>;
  next_step: string;
  next_date: string | null;
  notes: string;
  last_touch_at: string | null;
  created_at: string;
};

// One claim per studio: "Sofitel FITNESS" and "sofitel fitness " are the same studio.
export const studioKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const DAY = 86_400_000;

// Calendar days since the last touch (or since it was added), for the founder's overview.
export function daysSince(t: Pick<TeamTarget, 'last_touch_at' | 'created_at'>, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(t.last_touch_at ?? t.created_at).getTime()) / DAY));
}

// Messaged and quiet for WAIT_WORKING_DAYS working days: time for the next touch.
export function needsTouch(t: TeamTarget, now = Date.now()) {
  if (!['found', 'messaged'].includes(t.stage)) return false;
  if (t.stage === 'found') return true;
  const last = t.last_touch_at ?? t.stage_at.messaged;
  return Boolean(last) && workingDaysSince(last!, now) >= WAIT_WORKING_DAYS;
}
