import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OPS_ARCHITECT_COOKIE_NAME, isValidOpsArchitectToken } from '@/lib/opsSession';
import { ARMORY_PROTOCOLS, groupByArc } from '@/lib/armory';

export const metadata = {
  title: 'Armory | M.O.E. Architect',
  robots: { index: false, follow: false },
};

// Architect-only index of every Biomechanical Arc. Every protocol is open once
// SYNC.OP is keyed in — there are no per-protocol locks.
export default async function OpsArmoryPage() {
  const cookieStore = await cookies();
  if (!isValidOpsArchitectToken(cookieStore.get(OPS_ARCHITECT_COOKIE_NAME)?.value)) {
    redirect('/ops/architect?next=/ops/armory');
  }

  const arcs = groupByArc(ARMORY_PROTOCOLS);

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <header className="border-b border-[#222] pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="text-[10px] text-[#a855f7] tracking-[4px] uppercase">ARCHITECT — SYNC.OP</div>
            <h1 className="text-3xl font-bold mt-1">The Armory</h1>
            <p className="text-xs text-[#888] mt-2">
              Biomechanical Arcs · SYS-D022 V2.0 battle cards · {ARMORY_PROTOCOLS.length} protocol
              {ARMORY_PROTOCOLS.length === 1 ? '' : 's'}
            </p>
          </div>
          <a
            href="/ops/architect"
            className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white hover:border-[#a855f7] transition-colors"
          >
            TRAINING COMMAND
          </a>
        </header>

        <div className="space-y-10">
          {arcs.map(([arc, protocols]) => (
            <section key={arc}>
              <h2 className="text-[10px] text-[#888] uppercase tracking-[4px] mb-3">{arc}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {protocols.map((p) => (
                  <a
                    key={p.id}
                    href={`/ops/armory/${p.id}`}
                    className="block border border-[#333] bg-[#0a0a0a] p-5 hover:border-[#00e5ff] transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-[#00e5ff] tracking-widest">{p.id}</span>
                      <span className="text-[10px] text-[#555] border border-[#333] px-2 py-0.5">W{p.week}</span>
                    </div>
                    <div className="text-lg text-white font-bold">{p.title}</div>
                    <p className="text-xs text-[#888] mt-2 leading-relaxed">{p.focus}</p>
                    <div className="text-[10px] text-[#555] mt-4 tracking-wider">
                      {p.doctrine} · ADDED {p.addedOn}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-5xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
