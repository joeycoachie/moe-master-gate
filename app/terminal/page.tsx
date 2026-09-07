'use client';

export default function Terminal() {
  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        
        {}
        <header className="border-b border-[#222] pb-6 mb-12 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-[#4CAF50] tracking-[4px] uppercase">ACCESS LEVEL: S-RANK ACTIVE</div>
            <h1 className="text-3xl font-bold mt-1">INSTRUCTOR CALIBRATION TERMINAL</h1>
          </div>
          <a href="/" className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors">LOCK GATE</a>
        </header>

        {}
        <h2 className="text-sm text-[#888] mb-4 uppercase tracking-widest border-l-2 border-[#4CAF50] pl-3">Phase 1: Hardware & Execution</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <a href="https://hardware-doctrine-ladder-barrel.vercel.app/" target="_blank" rel="noopener noreferrer" className="bg-[#111] border border-[#222] p-6 hover:border-[#3b82f6] transition-colors block group">
            <span className="text-[10px] text-[#3b82f6] uppercase tracking-widest">STATION 01</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#3b82f6] transition-colors">Ladder Barrel Protocol</h2>
            <p className="text-xs text-[#888]">Active hardware operational parameters and clinical sequences.</p>
          </a>

          <a href="https://hardware-doctrine-stability-chair-o.vercel.app/" target="_blank" rel="noopener noreferrer" className="bg-[#111] border border-[#222] p-6 hover:border-[#4CAF50] transition-colors block group">
            <span className="text-[10px] text-[#4CAF50] uppercase tracking-widest">STATION 02</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#4CAF50] transition-colors">Stability Chair Flow</h2>
            <p className="text-xs text-[#888]">Resistance mapping and foundational tension management.</p>
          </a>

          <a href="/terminal/reformer-doctrine" className="bg-[#111] border border-[#222] p-6 hover:border-[#06b6d4] transition-colors block group">
            <span className="text-[10px] text-[#06b6d4] uppercase tracking-widest">STATION 03</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#06b6d4] transition-colors">Reformer Carriage Doctrine</h2>
            <p className="text-xs text-[#888]">SYS-HW-003 — spring anchoring, gear bar integrity, and the Setup/De-Setup neutralization protocol.</p>
          </a>

          <a href="https://kin-optimumfit-intructor-terminal-r.vercel.app/" target="_blank" rel="noopener noreferrer" className="bg-[#111] border border-[#222] p-6 hover:border-[#ff9800] transition-colors block group">
            <span className="text-[10px] text-[#ff9800] uppercase tracking-widest">STATION 04</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#ff9800] transition-colors">Live Shared Feed</h2>
            <p className="text-xs text-[#888]">Global team cue synchronization repository.</p>
          </a>

          <a href="/terminal/diagnostic-science" className="bg-[#111] border border-[#222] p-6 hover:border-[#ec4899] transition-colors block group">
            <span className="text-[10px] text-[#ec4899] uppercase tracking-widest">STATION 05</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#ec4899] transition-colors">Diagnostic Question Science</h2>
            <p className="text-xs text-[#888]">Biomechanical rationale behind the 3-question client triage tool and its routing logic.</p>
          </a>

          <a href="/diagnostic" target="_blank" rel="noopener noreferrer" className="bg-[#111] border border-[#222] p-6 hover:border-[#4CAF50] transition-colors block group">
            <span className="text-[10px] text-[#4CAF50] uppercase tracking-widest">STATION 06</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#4CAF50] transition-colors">Public Diagnostic (QR Page)</h2>
            <p className="text-xs text-[#888]">Preview the client-facing, ungated triage tool — the exact page the studio QR code points to.</p>
          </a>

          <a href="/terminal/postural-diagnostic" className="bg-[#111] border border-[#222] p-6 hover:border-[#3b82f6] transition-colors block group">
            <span className="text-[10px] text-[#3b82f6] uppercase tracking-widest">STATION 07</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#3b82f6] transition-colors">Postural Diagnostic Intake</h2>
            <p className="text-xs text-[#888]">Instructor-run posture assessment. Unlocked, no credit gate — writes straight to the studio dashboard.</p>
          </a>

          <a href="/terminal/programming-log" className="bg-[#111] border border-[#222] p-6 hover:border-[#eab308] transition-colors block group">
            <span className="text-[10px] text-[#eab308] uppercase tracking-widest">STATION 08</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#eab308] transition-colors">Instructor Programming &amp; V.A.E. Log</h2>
            <p className="text-xs text-[#888]">Smart-default apparatus, live mentor V.A.E. feedback, taxonomy-justified class programming.</p>
          </a>

          <a href="/terminal/session-log" className="bg-[#111] border border-[#222] p-6 hover:border-[#22d3ee] transition-colors block group">
            <span className="text-[10px] text-[#22d3ee] uppercase tracking-widest">STATION 09</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#22d3ee] transition-colors">1-1 Session Log &amp; Sequence Vault</h2>
            <p className="text-xs text-[#888]">Tap-driven full programming for private sessions — save your own sequences, load them instantly next time.</p>
          </a>

          <a href="/terminal/availability" className="bg-[#111] border border-[#222] p-6 hover:border-[#a855f7] transition-colors block group">
            <span className="text-[10px] text-[#a855f7] uppercase tracking-widest">STATION 10</span>
            <h2 className="text-xl font-bold mt-2 mb-4 group-hover:text-[#a855f7] transition-colors">Instructor Availability &amp; Ops Governance</h2>
            <p className="text-xs text-[#888]">Instructors submit availability directly; Ops gets a live aggregated roster, approvals, and CSV export.</p>
          </a>
        </div>

        {}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#3b82f6] pl-3">Phase 2: The 12-Week Clinical Arc</h2>
          <span className="flex items-center gap-1 text-[9px] text-[#eab308] border border-[#eab308]/40 bg-[#eab308]/10 px-2 py-0.5 uppercase tracking-widest">
            🔒 Locked
          </span>
        </div>
        <p className="text-xs text-[#555] mb-6">Foundation established. Target specific biomechanical failure points.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { id: 'KIN-MOE-007', title: 'Phase 2, Week 1', color: 'border-l-[#ec4899]', link: 'https://kin-013-p2-w1-lhyd.vercel.app/' },
            { id: 'KIN-MOE-008', title: 'Phase 2, Week 2', color: 'border-l-[#ec4899]', link: 'https://kin-013-p2-w2.vercel.app/' },
            { id: 'KIN-MOE-009', title: 'Phase 2, Week 3', color: 'border-l-[#ec4899]', link: 'https://kin-013-p2-w3.vercel.app/' },
            { id: 'KIN-MOE-010', title: 'Phase 2, Week 4', color: 'border-l-[#ec4899]', link: 'https://kin-013-p2-w4.vercel.app/' },
            { id: 'KIN-MOE-013', title: 'Phase 2, W5 (Tension)', color: 'border-l-[#ec4899]', link: 'https://kin-013-p2-w5-tension.vercel.app/' },
            { id: 'KIN-MOE-014', title: 'Phase 2, W5 (Duet)', color: 'border-l-[#ec4899]', link: 'https://kin-013-p2-w5-duet.vercel.app/' },
            { id: 'KIN-MOE-018', title: 'Phase 2, Week 7', color: 'border-l-[#eab308]', link: 'https://kin-014-p3-w1-metabolic-duet-j5qj.vercel.app/' },
            { id: 'KIN-MOE-019', title: 'Phase 2, Week 8', color: 'border-l-[#eab308]', link: 'https://kin-013-p3-w8-apex-load-5y3c.vercel.app/' },
            { id: 'KIN-013_P2_W9', title: 'Phase 2, Week 9 (Flow)', color: 'border-l-[#ec4899]', link: 'https://kin-013-p2-w9-flow.vercel.app/' },
            { id: 'KIN-013_P4', title: 'Phase 2, Week10 Asymmetry', color: 'border-l-[#3b82f6]', link: 'https://kin-013-p4-w10-asymmetry.vercel.app/' },
            { id: 'KIN-013_P4_MAT', title: 'Phase 2, Week Asymmetry MAT', color: 'border-l-[#3b82f6]', link: 'https://kin-013-p4-w10-asymmetry-mat.vercel.app/' },
          ].map((card, i) => (
            <div key={i} aria-disabled="true" title="Locked — instructor calibration in progress" className={`relative bg-[#111] border border-[#222] p-4 border-l-4 ${card.color} opacity-50 cursor-not-allowed select-none grayscale`}>
              <span className="absolute top-2 right-2 text-[10px] text-[#eab308]">🔒</span>
              <span className="text-[9px] text-[#888] uppercase tracking-widest">{card.id}</span>
              <h3 className="text-sm font-bold mt-1 text-[#ccc]">{card.title}</h3>
            </div>
          ))}
        </div>

        {}
        <h2 className="text-sm text-[#888] mb-4 uppercase tracking-widest border-l-2 border-[#ec4899] pl-3">Phase 3: Master Systems & CRM</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div aria-disabled="true" title="Locked — instructor calibration in progress" className="relative bg-[#111] border border-[#222] p-6 opacity-50 cursor-not-allowed select-none grayscale">
            <span className="absolute top-4 right-4 text-[10px] text-[#eab308]">🔒</span>
            <div className="text-[10px] text-[#888] mb-2 uppercase tracking-widest">SYS-MOE-008</div>
            <h3 className="text-lg font-bold mb-2 text-[#ccc]">MOE CRM [Master Data Sync]</h3>
            <p className="text-xs text-[#888]">The secure, live-database terminal for global enterprise management.</p>
          </div>

          <div aria-disabled="true" title="Locked — instructor calibration in progress" className="relative bg-[#111] border border-[#222] p-6 opacity-50 cursor-not-allowed select-none grayscale">
            <span className="absolute top-4 right-4 text-[10px] text-[#eab308]">🔒</span>
            <div className="text-[10px] text-[#888] mb-2 uppercase tracking-widest">MET-MOE-004</div>
            <h3 className="text-lg font-bold mb-2 text-[#ccc]">Metabolic Baseline Eval Intake</h3>
            <p className="text-xs text-[#888]">Mobile-optimized diagnostic capture. Routes data payload directly.</p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-3 mb-4 mt-12">
          <h2 className="text-sm text-[#888] uppercase tracking-widest border-l-2 border-[#a855f7] pl-3">Phase 4: Doctrine &amp; Tool Registry</h2>
          <span className="flex items-center gap-1 text-[9px] text-[#eab308] border border-[#eab308]/40 bg-[#eab308]/10 px-2 py-0.5 uppercase tracking-widest">
            🔒 Locked
          </span>
        </div>
        <p className="text-xs text-[#555] mb-6">IP Armory doctrine, tool, and playbook index. Unlocks as each is brought online.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { id: 'KIN-D004', title: '(Cadillac) Doctrine', color: 'border-l-[#a855f7]' },
            { id: 'KIN-T001', title: 'Posterior Chain & RA Diagnostic (Slump/ASLR)', color: 'border-l-[#3b82f6]' },
            { id: 'KIN-T002', title: 'Master Plumb Line Audit (Influencer UI)', color: 'border-l-[#3b82f6]' },
            { id: 'SYS-T001', title: 'Postural Audit Server Engine (GAS Backend)', color: 'border-l-[#22d3ee]' },
            { id: 'KIN-P016', title: 'Upper Crossed / Rounded Shoulder Arc', color: 'border-l-[#eab308]' },
            { id: 'KIN-P018', title: 'The 20-Week Hyrox KL Periodization Plan', color: 'border-l-[#eab308]' },
            { id: 'KIN-D005', title: 'Fascial Biomechanics & Anatomy Trains', color: 'border-l-[#a855f7]' },
            { id: 'MET-P002', title: 'RA/Inflammatory Defense Protocol', color: 'border-l-[#ff9800]' },
            { id: 'MET-P003', title: 'Hyrox Glycogen Fueling Architecture', color: 'border-l-[#ff9800]' },
            { id: 'KIN-P015', title: 'QL Nerve Impingement Corrective (3-Week Toggle)', color: 'border-l-[#eab308]' },
          ].map((card, i) => (
            <div key={i} aria-disabled="true" title="Locked — instructor calibration in progress" className={`relative bg-[#111] border border-[#222] p-4 border-l-4 ${card.color} opacity-50 cursor-not-allowed select-none grayscale`}>
              <span className="absolute top-2 right-2 text-[10px] text-[#eab308]">🔒</span>
              <span className="text-[9px] text-[#888] uppercase tracking-widest">{card.id}</span>
              <h3 className="text-sm font-bold mt-1 text-[#ccc]">{card.title}</h3>
            </div>
          ))}
        </div>

      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-7xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
          <p className="mt-2 text-[9px] text-[#888] tracking-[0.18em] uppercase">Asset # Stability Chair • Asset # Ladder Barrel</p>
        </footer>
      </div>
    </main>
  );
}