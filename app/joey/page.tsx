import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-joey-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-joey-serif' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-joey-mono' });

const SANS = { fontFamily: 'var(--font-joey-sans), Inter, sans-serif' };
const SERIF = { fontFamily: 'var(--font-joey-serif), "Playfair Display", serif' };
const MONO = { fontFamily: 'var(--font-joey-mono), "JetBrains Mono", monospace' };

const WHATSAPP = `https://wa.me/60102319893?text=${encodeURIComponent('Hi Joey, I scanned your card. I would like to know more.')}`;

export const metadata: Metadata = {
  title: 'Joey Tan · The M.O.E. Group',
  description: 'I help studios and gyms keep their clients longer. Kinetic Studio OS for studios, RECUP.STN for gyms and hotels.',
};

// Landing page behind the QR on the printed B2B card (moe-hub-9n57.vercel.app redirects here).
// Five seconds to understand: who it's for, two doors, one next step. Plain words (SYS-D028).
export default function JoeyPage() {
  return (
    <main className={`${inter.variable} ${playfair.variable} ${mono.variable} min-h-screen bg-[#050505] text-white flex flex-col`} style={SANS}>
      <div className="max-w-5xl mx-auto w-full flex-1 px-4 md:px-8 py-14 md:py-20">
        <p style={MONO} className="text-[10px] tracking-[0.25em] uppercase text-[#00e5ff]">
          Joey Tan · The M.O.E. Group · Kuala Lumpur
        </p>
        <h1 style={SERIF} className="text-4xl md:text-6xl leading-tight mt-5 max-w-3xl">
          I help studios and gyms keep their clients longer.
        </h1>
        <p className="text-[#aaa] text-base md:text-lg mt-5">Two ways to work together. Pick the one that fits you.</p>

        <div className="grid md:grid-cols-2 gap-5 mt-12">
          {/* Door 1: studios */}
          <a href="/studio" className="group border border-[#333] bg-[#0a0a0a] p-6 md:p-8 flex flex-col hover:border-[#00e5ff] transition-colors">
            <p style={MONO} className="text-[10px] tracking-[0.2em] uppercase text-[#00e5ff]">For Pilates and movement studios</p>
            <h2 style={SERIF} className="text-3xl mt-3">Kinetic Studio OS</h2>
            <p className="text-sm text-[#ccc] leading-relaxed mt-3">
              One standard for every instructor. Every client&apos;s progress on record, and a portal they open every day.
            </p>
            {/* What a client sees on their phone */}
            <div className="mt-6 mx-auto w-full max-w-[260px] border border-[#333] rounded-[22px] bg-[#030303] p-4" aria-hidden="true">
              <div style={MONO} className="text-[8px] tracking-widest uppercase text-[#888]">Recovery Window</div>
              <div className="flex justify-between items-end mt-1">
                <div className="text-xs">Day 10 of 28</div>
                <div className="text-right">
                  <div className="text-2xl text-[#00e5ff] leading-none">65</div>
                  <div className="text-[9px] text-[#4CAF50] mt-0.5">+22 since you started</div>
                </div>
              </div>
              <div className="h-1 bg-[#1a1a1a] mt-2">
                <div className="h-full w-[36%] bg-[#00e5ff]" />
              </div>
              <div className="flex items-center mt-4">
                {[1, 2, 3, 4, 5].map((w, i) => (
                  <div key={w} className="flex items-center flex-1 last:flex-none">
                    <span
                      className={`w-6 h-6 rounded-full text-[9px] flex items-center justify-center border ${
                        w <= 3 ? 'bg-[#00e5ff] border-[#00e5ff] text-black font-bold' : w === 4 ? 'border-[#00e5ff] text-[#00e5ff]' : 'border-[#333] text-[#555]'
                      }`}
                    >
                      {w}
                    </span>
                    {i < 4 && <span className={`h-px flex-1 mx-1 ${w <= 3 ? 'bg-[#00e5ff]' : 'bg-[#333]'}`} />}
                  </div>
                ))}
              </div>
              <div className="text-[9px] text-[#888] mt-2">Week 4 up next</div>
            </div>
            <span style={MONO} className="mt-auto pt-6 text-[11px] tracking-[0.2em] uppercase text-[#00e5ff] group-hover:text-white">
              See how it works →
            </span>
          </a>

          {/* Door 2: gyms, hotels, run clubs */}
          <a href="/recup/deck" className="group border border-[#333] bg-[#0a0a0a] p-6 md:p-8 flex flex-col hover:border-[#E07A55] transition-colors">
            <p style={MONO} className="text-[10px] tracking-[0.2em] uppercase text-[#E07A55]">For gyms, hotels and run clubs</p>
            <h2 style={SERIF} className="text-3xl mt-3">RECUP.STN</h2>
            <p className="text-sm text-[#ccc] leading-relaxed mt-3">
              Recovery drinks matched to each member&apos;s workout, poured where they train. You get the numbers after.
            </p>
            <ol className="mt-6 space-y-3" aria-label="How a recovery morning works">
              {[
                ['Check in', '60 seconds on their phone.'],
                ['We pour', 'One drink, chosen for their workout.'],
                ['You get the numbers', 'Who came, what they chose, who wants more.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4 items-start border border-[#222] p-3">
                  <span style={MONO} className="w-7 h-7 shrink-0 flex items-center justify-center bg-[#E07A55] text-black text-xs font-bold">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-sm text-white">{t}</span>
                    <span className="block text-xs text-[#999] mt-0.5">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <span style={MONO} className="mt-auto pt-6 text-[11px] tracking-[0.2em] uppercase text-[#E07A55] group-hover:text-white">
              See the deck →
            </span>
          </a>
        </div>

        <div className="mt-12 border-t border-[#222] pt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p style={SERIF} className="text-2xl">Not sure which fits?</p>
            <p className="text-sm text-[#888] mt-2">20 years coaching people through training, pain and recovery. Built and run in Kuala Lumpur.</p>
          </div>
          <a
            href={WHATSAPP}
            style={MONO}
            className="bg-[#00e5ff] text-black px-6 py-4 text-xs font-bold tracking-[0.2em] uppercase text-center hover:bg-white transition-colors"
          >
            Message me on WhatsApp
          </a>
        </div>
      </div>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-5xl mx-auto pt-12 mt-auto px-4">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">Cleared For Human Performance</p>
          <p className="text-[10px] text-[#555] tracking-[0.2em] uppercase">&copy; 2026 The M.O.E. Group. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
