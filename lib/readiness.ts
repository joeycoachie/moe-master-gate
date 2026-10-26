// Readiness profile: three short parts a client fills in their portal.
// 1. Safety check: the seven PAR-Q+ general health questions (any "yes" = talk to the coach first).
// 2. Lifestyle and 3. Commitment: multiple choice, scored into a 0-100 readiness score.
// The score never blocks anything on its own; it tells the coach and client where they stand.

export type Choice = { value: string; label: string; points?: number };
export type Question = { key: string; label: string; choices: Choice[]; scored: boolean };
export type Part = { key: 'safety' | 'lifestyle' | 'commitment'; title: string; intro: string; questions: Question[] };

const YES_NO: Choice[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
];

export const PARTS: Part[] = [
  {
    key: 'safety',
    title: 'Safety check',
    intro: 'Seven standard questions used worldwide before exercise. A "yes" does not stop you. It means your coach checks with you first.',
    questions: [
      'Has a doctor ever said you have a heart condition or high blood pressure?',
      'Do you feel pain in your chest at rest, in daily life, or when you exercise?',
      'In the last 12 months, have you lost your balance from dizziness or passed out?',
      'Has a doctor ever told you that you have another long-term health condition?',
      'Do you take prescribed medicine for a long-term health condition?',
      'In the last 12 months, have you had a bone, joint or muscle problem that more activity could make worse?',
      'Has a doctor ever said you should only exercise under medical supervision?',
    ].map((label, i) => ({ key: `parq${i + 1}`, label, choices: YES_NO, scored: false })),
  },
  {
    key: 'lifestyle',
    title: 'Your week',
    intro: 'How you sleep, how busy life feels, and how much you move now.',
    questions: [
      {
        key: 'sleep',
        label: 'How many hours do you usually sleep?',
        scored: true,
        choices: [
          { value: 'u6', label: 'Under 6', points: 1 },
          { value: '6to7', label: '6 to 7', points: 2 },
          { value: '7to8', label: '7 to 8', points: 4 },
          { value: 'o8', label: 'Over 8', points: 4 },
        ],
      },
      {
        key: 'stress',
        label: 'How stressed do you usually feel?',
        scored: true,
        choices: [
          { value: 'low', label: 'Low', points: 4 },
          { value: 'some', label: 'Some', points: 3 },
          { value: 'high', label: 'High', points: 2 },
          { value: 'vhigh', label: 'Very high', points: 1 },
        ],
      },
      {
        key: 'active',
        label: 'How many days a week do you move or train now?',
        scored: true,
        choices: [
          { value: '0', label: 'None', points: 1 },
          { value: '1to2', label: '1 to 2', points: 2 },
          { value: '3to4', label: '3 to 4', points: 4 },
          { value: '5plus', label: '5 or more', points: 4 },
        ],
      },
      {
        key: 'goal',
        label: 'What matters most to you right now?',
        scored: false,
        choices: [
          { value: 'pain', label: 'Move without pain' },
          { value: 'strong', label: 'Get stronger' },
          { value: 'energy', label: 'More energy' },
          { value: 'recover', label: 'Recover better' },
          { value: 'look', label: 'Look and feel better' },
        ],
      },
    ],
  },
  {
    key: 'commitment',
    title: 'Your commitment',
    intro: 'What you can promise yourself for the next four weeks.',
    questions: [
      {
        key: 'sessions',
        label: 'How many studio sessions a week can you commit to?',
        scored: true,
        choices: [
          { value: '1', label: '1', points: 2 },
          { value: '2', label: '2', points: 3 },
          { value: '3plus', label: '3 or more', points: 4 },
        ],
      },
      {
        key: 'checkins',
        label: 'How many days a week will you do the 60-second check-in?',
        scored: true,
        choices: [
          { value: '1to2', label: '1 to 2', points: 1 },
          { value: '3to4', label: '3 to 4', points: 3 },
          { value: '5to7', label: '5 to 7', points: 4 },
        ],
      },
      {
        key: 'support',
        label: 'What helps you most to stay on track?',
        scored: false,
        choices: [
          { value: 'reminders', label: 'Reminders' },
          { value: 'plan', label: 'A clear plan' },
          { value: 'coach', label: 'A coach checking in' },
        ],
      },
    ],
  },
];

export type Answers = Record<string, string>;

const valid = (q: Question, v: unknown) => typeof v === 'string' && q.choices.some((c) => c.value === v);

// Keep only known questions with known choices.
export function cleanAnswers(raw: unknown): Answers {
  const out: Answers = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const part of PARTS) for (const q of part.questions) {
    const v = (raw as Record<string, unknown>)[q.key];
    if (valid(q, v)) out[q.key] = v as string;
  }
  return out;
}

export function partDone(part: Part, a: Answers) {
  return part.questions.every((q) => a[q.key]);
}

export function summarizeReadiness(a: Answers) {
  const scored = PARTS.flatMap((p) => p.questions.filter((q) => q.scored));
  const answered = scored.filter((q) => a[q.key]);
  const points = answered.reduce((s, q) => s + (q.choices.find((c) => c.value === a[q.key])?.points ?? 0), 0);
  const score = answered.length === scored.length ? Math.round((points / (scored.length * 4)) * 100) : null;
  const safetyFlag = PARTS[0].questions.some((q) => a[q.key] === 'yes');
  const partsDone = PARTS.filter((p) => partDone(p, a)).length;
  const band = score == null ? null : score >= 75 ? 'Ready to push' : score >= 50 ? 'Ready to build' : 'Build the base first';
  return { score, band, safetyFlag, partsDone };
}
