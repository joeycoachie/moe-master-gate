'use client';

import { useState } from 'react';

const roles = [
  {
    role: 'Owner',
    sub: '(The Architect)',
    color: 'text-white',
    responsibility: 'Defines Reformer tension standards and hardware neutralization protocols.',
  },
  {
    role: 'Executor',
    sub: '(Instructor)',
    color: 'text-[#06b6d4]',
    responsibility: 'Secures the gear bar, spots the mount, and strips springs post-session.',
  },
  {
    role: 'Approver',
    sub: '(QA/Danny)',
    color: 'text-amber-500',
    responsibility: 'Audits end-of-class machine resets and spring safety states.',
  },
];

const checklist = [
  {
    title: 'The Spring Test',
    body: 'Are the springs securely fastened to anchor the carriage BEFORE the client touches the machine?',
  },
  {
    title: 'The Gear Bar Test',
    body: 'Is the wooden gear block perfectly horizontal and locked into the tracking slot?',
  },
];

export default function ReformerDoctrine() {
  const [tab, setTab] = useState<'setup' | 'de-setup'>('setup');

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full">

        <header className="border-b border-[#222] pb-6 mb-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-red-500 tracking-[4px] uppercase font-bold">S-Rank Operational Protocol</span>
            </div>
            <h1 className="text-3xl font-bold font-serif tracking-wide">Reformer Carriage</h1>
            <div className="text-[10px] text-[#06b6d4] tracking-[0.2em] uppercase mt-1">SYS-HW-003 // T-013 IRON SKELETON (USPT)</div>
          </div>
          <a href="/terminal" className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors shrink-0">BACK TO TERMINAL</a>
        </header>

        {/* 1.0 & 2.0 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <section className="bg-[#111] border border-[#222] p-6 border-l-4 border-l-red-500/50">
            <h2 className="text-[10px] text-[#888] tracking-widest uppercase mb-4 border-b border-[#222] pb-2">1.0 Commander&apos;s Intent</h2>
            <div className="mb-4">
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">⚠ The Friction</p>
              <p className="text-[#888] text-sm leading-relaxed">
                The Reformer is a dynamic, frictionless surface. The primary risks are carriage slip during
                mount/dismount, gear bar pop-out under heavy leg loading, and rogue spring snap-back. Improper
                setup creates an unstable base, leading directly to lumbopelvic shear.
              </p>
            </div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">♞ The Strategy</p>
              <p className="text-[#888] text-sm leading-relaxed">
                Enforce strict spring anchoring before the client makes contact with the carriage. Mandate a
                universal &quot;De-Setup&quot; protocol to strip tension and reset the gear bar, ensuring the
                apparatus is perfectly neutralized for the next user.
              </p>
            </div>
          </section>

          <section className="bg-[#111] border border-[#222] p-6 border-l-4 border-l-[#06b6d4]/50">
            <h2 className="text-[10px] text-[#888] tracking-widest uppercase mb-4 border-b border-[#222] pb-2">2.0 Objectives (The End State)</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-[#06b6d4] mt-0.5">⚓</span>
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">Zero Slip Risk</p>
                  <p className="text-[#888] text-xs">Carriage is physically locked by spring tension before any human weight is transferred onto it.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#06b6d4] mt-0.5">🔒</span>
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">Gear Bar Integrity</p>
                  <p className="text-[#888] text-xs">100% visual and physical verification that the gear bar block is deeply seated in the slot before leg pressing.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#06b6d4] mt-0.5">↺</span>
                <div>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">Standardized Neutralization</p>
                  <p className="text-[#888] text-xs">Instructor executes the &quot;De-Setup Strip&quot; post-session, returning springs and gear bar to absolute baseline.</p>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <h2 className="text-2xl font-bold font-serif mb-8 border-b border-[#222] pb-4">
          3.0 Standard Procedures <span className="text-[#555] text-sm font-sans italic tracking-wide">(The Execution Cycle)</span>
        </h2>

        {/* PHASE 1 */}
        <section className="mb-12">
          <h3 className="text-sm text-[#06b6d4] uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="bg-[#06b6d4]/10 px-2 py-1 border border-[#06b6d4]/30 text-[10px]">Phase 1</span> Calibration &amp; Gear Dynamics
          </h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-[#111] border border-[#222] p-5">
                <p className="text-white text-xs font-bold uppercase tracking-wider mb-2">📏 1. The Gear Bar Placement</p>
                <p className="text-[#888] text-sm">Adjust the gear bar and stopper block to accommodate client height. The goal is a 90-degree hip/knee angle when feet are on the bar.</p>
              </div>
              <div className="bg-[#111] border border-[#222] p-5">
                <p className="text-white text-xs font-bold uppercase tracking-wider mb-2">🎚 2. Tension Mapping</p>
                <p className="text-[#888] text-sm"><strong className="text-[#ccc]">Red (Heavy):</strong> Base stability &amp; leg drive.<br /><strong className="text-[#ccc]">Blue (Medium):</strong> Core support &amp; arm lines.<br /><strong className="text-[#ccc]">White/Yellow (Light):</strong> High instability &amp; neuromuscular tax.</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#06b6d4]/30 p-5 border-l-4 border-l-[#06b6d4]">
                <p className="text-[#06b6d4] text-xs font-bold uppercase tracking-wider mb-2">✔ 3. Verify the Hook Seating</p>
                <p className="text-[#ccc] text-sm">Ensure the spring rings are fully seated over the gear bar pegs, AND the wooden block is pushed perfectly horizontal into the slot. Angled blocks will violently snap out.</p>
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] p-8 flex items-center justify-center">
              <svg viewBox="0 0 400 300" className="w-full h-full max-w-[300px]">
                <rect x="20" y="140" width="360" height="20" fill="#111" stroke="#333" strokeWidth={4} />
                <line x1="50" y1="140" x2="80" y2="60" stroke="#666" strokeWidth={6} />
                <line x1="40" y1="60" x2="90" y2="60" stroke="#06b6d4" strokeWidth={6} />
                <rect x="90" y="140" width="10" height="10" fill="#000" />
                <rect x="110" y="140" width="10" height="10" fill="#000" />
                <rect x="130" y="140" width="10" height="10" fill="#000" />
                <rect x="160" y="125" width="140" height="15" fill="#222" stroke="#06b6d4" strokeWidth={2} />
                <text x="230" y="110" fill="#06b6d4" fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="2">CARRIAGE</text>
                <path d="M 130 132 L 135 125 L 140 140 L 145 125 L 150 140 L 155 125 L 160 132" stroke="#ef4444" fill="none" strokeWidth={2} />
                <path d="M 130 135 L 135 128 L 140 143 L 145 128 L 150 143 L 155 128 L 160 135" stroke="#ef4444" fill="none" strokeWidth={2} />
                <circle cx="130" cy="140" r="5" fill="#ef4444" />
                <text x="130" y="165" fill="#ef4444" fontFamily="monospace" fontSize="9" textAnchor="middle">GEAR BAR SEATING</text>
              </svg>
            </div>
          </div>
        </section>

        {/* PHASE 2 */}
        <section className="mb-12">
          <h3 className="text-sm text-[#06b6d4] uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="bg-[#06b6d4]/10 px-2 py-1 border border-[#06b6d4]/30 text-[10px]">Phase 2</span> Load &amp; Strip Protocol
          </h3>

          <div className="flex gap-3 mb-6 border-b border-[#222] pb-4">
            <button
              onClick={() => setTab('setup')}
              className={`px-5 py-2.5 border text-[10px] uppercase tracking-widest transition-colors ${
                tab === 'setup' ? 'border-[#06b6d4] text-[#06b6d4] bg-[#06b6d4]/10' : 'border-[#222] text-[#666] hover:border-[#444] hover:text-[#aaa]'
              }`}
            >
              🔒 The Set-Up (Mounting)
            </button>
            <button
              onClick={() => setTab('de-setup')}
              className={`px-5 py-2.5 border text-[10px] uppercase tracking-widest transition-colors ${
                tab === 'de-setup' ? 'border-[#06b6d4] text-[#06b6d4] bg-[#06b6d4]/10' : 'border-[#222] text-[#666] hover:border-[#444] hover:text-[#aaa]'
              }`}
            >
              🔓 The De-Setup (Neutralizing)
            </button>
          </div>

          {tab === 'setup' ? (
            <div className="space-y-5">
              <div className="border-b border-[#1a1a1a] pb-5">
                <div className="text-white text-sm font-bold tracking-wide mb-1">1. SPRINGS FIRST</div>
                <p className="text-[#888] text-sm mb-1">Instructor anchors the carriage with at least 1 Heavy spring BEFORE client approaches the machine.</p>
                <p className="text-[#06b6d4]/80 text-sm italic font-serif">&quot;Do not step on until I lock the carriage.&quot;</p>
              </div>
              <div className="border-b border-[#1a1a1a] pb-5">
                <div className="text-white text-sm font-bold tracking-wide mb-1">2. FOOTBAR CHECK</div>
                <p className="text-[#888] text-sm mb-1">Visually inspect the footbar locking pins to ensure they are seated deeply into the track.</p>
                <p className="text-[#06b6d4]/80 text-sm italic font-serif">&quot;Give the bar a solid shake to test the anchor.&quot;</p>
              </div>
              <div>
                <div className="text-[#06b6d4] text-sm font-bold tracking-wide mb-1">3. TRANSFER LOAD</div>
                <p className="text-[#888] text-sm mb-1">Client sits on the carriage first, then articulates down safely onto their back.</p>
                <p className="text-[#06b6d4]/80 text-sm italic font-serif">&quot;Sit gracefully, then melt onto your back.&quot;</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border-b border-[#1a1a1a] pb-5">
                <div className="text-amber-500 text-sm font-bold tracking-wide mb-1">1. UNLOAD CLIENT</div>
                <p className="text-[#888] text-sm mb-1">Ensure the carriage is resting completely against the stopper before the client sits up or removes feet.</p>
                <p className="text-[#06b6d4]/80 text-sm italic font-serif">&quot;Keep the carriage completely still against the bumper, then sit up.&quot;</p>
              </div>
              <div className="border-b border-[#1a1a1a] pb-5">
                <div className="text-white text-sm font-bold tracking-wide mb-1">2. STRIP SPRINGS</div>
                <p className="text-[#888] text-sm mb-1">Once client is off, strip ALL high-tension springs to neutralize the machine. Prevent rogue snapping.</p>
                <p className="text-[#06b6d4]/80 text-sm italic font-serif">&quot;Remove the load to make the machine inert.&quot;</p>
              </div>
              <div>
                <div className="text-white text-sm font-bold tracking-wide mb-1">3. GEAR BAR RESET</div>
                <p className="text-[#888] text-sm mb-1">Return the gear bar and block to Slot 1 (Standard Baseline) for the next instructor.</p>
                <p className="text-[#06b6d4]/80 text-sm italic font-serif">&quot;Reset the room. Leave it perfectly neutral.&quot;</p>
              </div>
            </div>
          )}
        </section>

        {/* PHASE 3 */}
        <section className="mb-12">
          <h3 className="text-sm text-[#06b6d4] uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="bg-[#06b6d4]/10 px-2 py-1 border border-[#06b6d4]/30 text-[10px]">Phase 3</span> The Execution
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-[#222] p-6">
              <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">Lumbopelvic Friction <span className="text-[#666] text-[9px]">(Technical)</span></p>
              <p className="text-[#888] text-sm leading-relaxed">
                &quot;Maintain absolute lumbopelvic neutrality against the moving carriage. Prevent lumbar
                extension (arching) when the carriage presses out, and prevent tucking when it returns.&quot;
              </p>
            </div>
            <div className="bg-[#111] border border-[#222] p-6">
              <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">The Shepherd Cue <span className="text-[#666] text-[9px]">(Imagery)</span></p>
              <p className="text-[#c4f1f9] text-base leading-relaxed font-serif italic">
                &quot;The carriage glides on a sheet of glass. Do not slam it against the stopper; kiss the bumper softly on every return.&quot;
              </p>
            </div>
          </div>
          <div className="bg-[#111] border border-[#222] p-4 mt-6 text-center">
            <p className="text-[#06b6d4] text-[10px] tracking-widest uppercase">▶ Execute: Only move the carriage once the core anchor is established.</p>
          </div>
        </section>

        {/* 4.0 & 5.0 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <section>
            <h2 className="text-sm text-white tracking-widest uppercase mb-4 border-b border-[#222] pb-2">4.0 Roles &amp; Responsibilities</h2>
            <div className="border border-[#222] bg-[#0a0a0a]">
              <div className="grid grid-cols-3 bg-[#111] border-b border-[#222] p-3">
                <div className="text-[10px] text-[#888] uppercase tracking-widest col-span-1">Role</div>
                <div className="text-[10px] text-[#888] uppercase tracking-widest col-span-2">Responsibility</div>
              </div>
              {roles.map((r) => (
                <div key={r.role} className="grid grid-cols-3 p-4 border-b border-[#1a1a1a] last:border-b-0">
                  <div className={`text-xs font-bold uppercase col-span-1 pr-2 ${r.color}`}>
                    {r.role}
                    <span className="block text-[10px] text-[#666] font-normal mt-1">{r.sub}</span>
                  </div>
                  <div className="text-xs text-[#888] col-span-2 leading-relaxed">{r.responsibility}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm text-white tracking-widest uppercase mb-4 border-b border-[#222] pb-2">5.0 Compliance &amp; QA (Litmus Test)</h2>
            <p className="text-xs text-[#666] mb-4">Before the client loads the carriage, verify:</p>
            <div className="space-y-3">
              {checklist.map((item) => (
                <label key={item.title} className="flex items-start gap-4 p-4 bg-[#111] border border-[#222] hover:border-[#06b6d4]/50 cursor-pointer transition-colors">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 mt-0.5 border border-[#444] flex items-center justify-center bg-black shrink-0 peer-checked:bg-[#06b6d4] peer-checked:border-[#06b6d4] transition-colors">
                    <span className="text-black text-xs hidden peer-checked:block">✓</span>
                  </div>
                  <div>
                    <span className="text-white text-sm font-bold block mb-1">{item.title}</span>
                    <span className="text-[#888] text-xs">{item.body}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* 6.0 */}
        <section className="border border-[#222] bg-[#0a0a0a] mb-12">
          <div className="bg-[#111] px-4 py-2 flex items-center justify-between border-b border-[#222]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className="text-[9px] text-[#888] uppercase tracking-widest">6.0 Feedback &amp; Iteration (The Loop)</span>
          </div>
          <div className="p-6 text-sm">
            <div className="flex gap-4 mb-4">
              <span className="text-amber-500 font-bold">IF</span>
              <p className="text-[#ccc]">the carriage bumps violently against the stopper on the return phase...</p>
            </div>
            <div className="flex gap-4 mb-6">
              <span className="text-[#06b6d4] font-bold">THEN</span>
              <p className="text-[#ccc]">the instructor must cue deeper eccentric core deceleration, or <span className="bg-red-900/30 text-red-400 px-2 py-0.5">add spring tension</span> to assist the client in controlling the return phase. The machine must never crash.</p>
            </div>
            <div className="border-t border-[#222] border-dashed pt-5">
              <p className="text-[10px] text-[#666] tracking-widest uppercase mb-2">&gt; SYSTEM STATUS:</p>
              <p className="text-xs text-[#888] leading-relaxed">The T-013 USPT Reformer doctrine is now locked. The Setup/De-Setup protocol is mandatory for all lab operations.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end mb-8">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors"
          >
            BACK
          </button>
        </div>

      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-5xl mx-auto pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
          <p className="mt-2 text-[9px] text-[#888] tracking-[0.18em] uppercase">Asset # Stability Chair • Asset # Ladder Barrel</p>
        </footer>
      </div>
    </main>
  );
}
