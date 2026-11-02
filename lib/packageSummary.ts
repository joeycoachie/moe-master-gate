// Session package maths, shared by the client portal and the founder's client file.
export type ClientPackage = {
  sessions_total: number;
  counts_from: string;
  price_rm: number | null;
  paid_on: string | null;
  payment_due: string | null;
  note: string;
  updated_at: string;
};

export type PackageSummary = {
  total: number;
  used: number;
  left: number;
  countsFrom: string;
  lastSession: string | null;
  updatedOn: string;
  paymentDue: string | null;
  paidOn: string | null;
  renewSoon: boolean;
};

// Every logged session on or after counts_from uses one (arc weeks, load days and extra sessions).
export function summarizePackage(pkg: ClientPackage, sessionDates: string[]): PackageSummary {
  const counted = sessionDates.filter((d) => d >= pkg.counts_from).sort();
  const used = counted.length;
  const lastSession = counted.length ? counted[counted.length - 1] : null;
  const pkgDay = pkg.updated_at.slice(0, 10);
  return {
    total: pkg.sessions_total,
    used,
    left: Math.max(0, pkg.sessions_total - used),
    countsFrom: pkg.counts_from,
    lastSession,
    updatedOn: lastSession && lastSession > pkgDay ? lastSession : pkgDay,
    paymentDue: pkg.payment_due,
    paidOn: pkg.paid_on,
    renewSoon: pkg.sessions_total - used <= 2,
  };
}
