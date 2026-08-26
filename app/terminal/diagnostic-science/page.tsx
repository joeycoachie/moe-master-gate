'use client';

export default function DiagnosticScience() {
  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8">
      <div className="max-w-4xl mx-auto">

        <header className="border-b border-[#222] pb-6 mb-10 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-[#4CAF50] tracking-[4px] uppercase">INSTRUCTOR-ONLY BRIEFING</div>
            <h1 className="text-3xl font-bold mt-1">Kinetic Diagnostic — Question Science</h1>
          </div>
          <a href="/terminal" className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white transition-colors">BACK TO TERMINAL</a>
        </header>

        <p className="text-xs text-[#888] mb-10 leading-relaxed max-w-2xl">
          This page explains the biomechanical reasoning behind the 3 questions in the public Kinetic Diagnostic
          Tool, and the routing logic that turns those 3 answers into a class allocation. It exists here — behind
          the Command Gate — on purpose. This reasoning is for you to understand and explain to clients verbally;
          it should never be printed, linked, or exposed on the QR-coded customer page, since surfacing the
          decision tree there would just create noise for someone trying to answer 3 quick questions.
        </p>

        {/* Q1 */}
        <details className="group bg-[#111] border border-[#222] p-6 mb-4 open:border-[#3b82f6]">
          <summary className="cursor-pointer list-none flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-[#3b82f6] uppercase tracking-widest w-24">PHASE 01</span>
              <h2 className="text-lg font-bold">Core Activation</h2>
            </div>
            <span className="text-[10px] text-[#555] group-open:hidden">EXPAND</span>
          </summary>
          <div className="mt-5 pt-5 border-t border-[#222] space-y-4 text-sm text-[#ccc] leading-relaxed">
            <p className="text-[#888]">
              <span className="text-white">The question:</span> &quot;What happens when you try to brace your core
              (e.g., when you cough or laugh hard)?&quot;
            </p>
            <p>
              This is a reflexive-load proxy for transverse abdominis (TrA) recruitment order. Hodges &amp; Richardson
              (1996) showed TrA should fire automatically, ahead of limb movement, to stabilize intra-abdominal
              pressure (IAP) before load hits the spine. A cough or hard laugh is an involuntary spike in IAP — it
              bypasses conscious bracing cues and shows you someone&apos;s default motor pattern.
            </p>
            <p>
              <span className="text-[#ff9800]">Answer A</span> (pressure in the lower back, or the stomach bulges
              outward) indicates the reflex isn&apos;t there — load is leaking into the linea alba or lumbar spine
              instead of being distributed. This shows up with diastasis recti, postpartum clients, and general
              deconditioning. It is a motor-control finding, not a strength finding — an athletic person can still
              answer A here.
            </p>
            <p>
              <span className="text-[#4CAF50]">Answer B</span> (corset-like draw-in) indicates the automatic
              stabilization sequence is intact.
            </p>
            <p className="text-[#666] italic">
              Why it matters for routing: on its own, A is common and not disqualifying — plenty of capable, athletic
              people brace imperfectly under a reflexive test without it reflecting their trained capacity. It only
              becomes a routing signal when paired with Q2.
            </p>
          </div>
        </details>

        {/* Q2 */}
        <details className="group bg-[#111] border border-[#222] p-6 mb-4 open:border-[#4CAF50]">
          <summary className="cursor-pointer list-none flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-[#4CAF50] uppercase tracking-widest w-24">PHASE 02</span>
              <h2 className="text-lg font-bold">Structural Integrity</h2>
            </div>
            <span className="text-[10px] text-[#555] group-open:hidden">EXPAND</span>
          </summary>
          <div className="mt-5 pt-5 border-t border-[#222] space-y-4 text-sm text-[#ccc] leading-relaxed">
            <p className="text-[#888]">
              <span className="text-white">The question:</span> &quot;In the past 6 months, have you experienced
              lower back or neck pain during workouts?&quot;
            </p>
            <p>
              The 6-month window is deliberate — it mirrors the recency-based red-flag screening used in clinical
              triage tools like STarT Back. It is not asking &quot;have you ever been injured&quot; (almost everyone
              has), it is asking whether tissue is likely still sensitized or under-adapted for load right now.
            </p>
            <p>
              <span className="text-[#ff9800]">Answer A</span> (frequent pain, or currently recovering) flags active
              or recent tissue sensitivity — training capacity may be temporarily reduced independent of overall
              fitness level.
            </p>
            <p>
              <span className="text-[#4CAF50]">Answer B</span> (healthy, pain-free joints) clears this axis.
            </p>
            <p className="text-[#666] italic">
              Why it matters for routing: like Q1, a single A here is a time-boxed flag, not a permanent label — an
              old, fully-healed strain or one bad week doesn&apos;t define someone&apos;s ceiling. It becomes a hard
              routing signal only in combination with Q1.
            </p>
          </div>
        </details>

        {/* Q3 */}
        <details className="group bg-[#111] border border-[#222] p-6 mb-10 open:border-[#ff9800]">
          <summary className="cursor-pointer list-none flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-[#ff9800] uppercase tracking-widest w-24">PHASE 03</span>
              <h2 className="text-lg font-bold">The Objective</h2>
            </div>
            <span className="text-[10px] text-[#555] group-open:hidden">EXPAND</span>
          </summary>
          <div className="mt-5 pt-5 border-t border-[#222] space-y-4 text-sm text-[#ccc] leading-relaxed">
            <p className="text-[#888]">
              <span className="text-white">The question:</span> &quot;What is your primary objective for the next
              90 days?&quot;
            </p>
            <p>
              This is self-selected intent, not a physical measurement. It matters because program adherence tracks
              strongly with whether the training modality matches someone&apos;s actual motivation (Self-Determination
              Theory) — someone who says &quot;fix my pain&quot; but gets dropped into a high-intensity Flow class
              will disengage, regardless of what their body could technically handle.
            </p>
            <p>
              <span className="text-[#ff9800]">Answer A</span> (fix posture, stop hurting, move safely) is treated as
              a direct goal-match to Control — this is honored on its own even if Q1/Q2 came back clean, because it&apos;s
              what the client is asking for.
            </p>
            <p><span className="text-white">Answer B</span> (build strength/endurance under load) → Capacity.</p>
            <p>
              <span className="text-[#4CAF50]">Answer C</span> (advanced, continuous flow) is the only path into Flow,
              and only when it isn&apos;t overridden by the Q1+Q2 compounding safety gate below.
            </p>
          </div>
        </details>

        {/* Routing logic */}
        <div className="bg-[#0a0a0a] border border-[#ec4899]/30 p-6">
          <h2 className="text-sm text-[#ec4899] uppercase tracking-widest mb-4 border-l-2 border-[#ec4899] pl-3">
            Class Allocation Engine — Current Routing Logic
          </h2>
          <ol className="text-sm text-[#ccc] leading-relaxed list-decimal list-inside space-y-2">
            <li><span className="text-white">Q3 = A</span> → Control. (Stated goal is honored directly — this is a preference match, not a safety override.)</li>
            <li><span className="text-white">Q1 = A AND Q2 = A</span> → Control. (Only forced when both red flags compound: no reflexive core control <span className="text-[#888]">and</span> recent/active pain. A single isolated flag no longer blocks Flow.)</li>
            <li><span className="text-white">Q3 = C</span> → Flow.</li>
            <li><span className="text-white">Otherwise</span> → Capacity.</li>
          </ol>
          <p className="text-xs text-[#666] italic mt-4 pt-4 border-t border-[#222]">
            Previously, a single A on Q1 or Q2 alone forced Control regardless of Q3 — that meant a trained athlete
            or instructor answering A once (e.g. an intentional Valsalva brace, or an old healed strain) could never
            reach Flow even with an advanced goal declared. This was corrected 2026-08-26.
          </p>
        </div>

      </div>
    </main>
  );
}
