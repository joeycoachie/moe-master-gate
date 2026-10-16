// What a client can open under each fuel product in their portal: short questions and answers,
// and what pairs well with it. Founder-approved wording only (SYS-D028, no health claims, no
// partner-brand names beyond the product title). A product with no entry shows no Q&A.
// The Architect layer of the Product Academy (wolf, shepherd, scripts) never comes here as is.

export type FuelQa = { qa: { q: string; a: string }[]; pairs: { key: string; why: string }[] };

export const FUEL_QA: Record<string, FuelQa> = {
  niteworks: {
    qa: [
      {
        q: 'What is it?',
        a: 'A night-time drink with L-arginine and L-citrulline. Your body uses these two amino acids to make nitric oxide, which helps your blood vessels relax. It also has vitamins C and E.',
      },
      {
        q: 'Why before bed?',
        a: 'Most of your recovery happens while you sleep. Taking it at night lines it up with that.',
      },
      {
        q: 'Anything to check first?',
        a: 'If you take blood pressure medicine or heart medicine, ask your doctor before you start.',
      },
    ],
    pairs: [
      { key: 'omega', why: 'Many people with joint discomfort add Omega-3 to their plan. Ask your coach if it fits yours.' },
      { key: 'collagen', why: 'Collagen is a protein your joints, tendons and skin are made from.' },
    ],
  },
};
