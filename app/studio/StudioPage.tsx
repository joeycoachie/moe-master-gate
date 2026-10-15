'use client';

import { useEffect, useState } from 'react';
import { COPY, LANGS, contactHref, type Lang } from './copy';

const SANS = { fontFamily: 'var(--font-studio-sans), Inter, sans-serif' };
const SERIF = { fontFamily: 'var(--font-studio-serif), "Playfair Display", serif' };
const MONO = { fontFamily: 'var(--font-studio-mono), "JetBrains Mono", monospace' };
const STORAGE_KEY = 'moe-studio-lang';

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl && LANGS.some((l) => l.code === fromUrl)) return fromUrl as Lang;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS.some((l) => l.code === saved)) return saved as Lang;
  } catch {
    // storage blocked: fall back to English
  }
  return 'en';
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={MONO} className="text-[10px] tracking-[0.25em] uppercase text-[#00e5ff] mb-4">
      {children}
    </div>
  );
}

export default function StudioPage() {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    // Read ?lang= and the saved choice after hydration so server and client HTML match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(initialLang());
  }, []);
  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.code === lang)?.html ?? 'en';
  }, [lang]);

  const t = COPY[lang];
  const href = contactHref(lang);
  const choose = (next: Lang) => {
    setLang(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  return (
    <main style={SANS} className="min-h-screen bg-[#050505] text-white flex flex-col antialiased">
      {/* Top bar */}
      <header className="border-b border-[#222] sticky top-0 z-20 bg-[#050505]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <div style={MONO} className="text-[11px] tracking-[0.25em] uppercase">
            The M.O.E. Group
          </div>
          <div className="flex items-center gap-2">
            <label style={MONO} className="sr-only" htmlFor="lang">
              {t.nav.language}
            </label>
            <select
              id="lang"
              value={lang}
              onChange={(e) => choose(e.target.value as Lang)}
              style={MONO}
              className="bg-[#0a0a0a] border border-[#333] text-[11px] text-white px-2 py-2 outline-none focus:border-[#00e5ff] rounded-none"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <a
              href={href}
              style={MONO}
              className="hidden sm:inline-block border border-[#00e5ff] text-[#00e5ff] px-3 py-2 text-[10px] tracking-[0.15em] uppercase hover:bg-[#00e5ff] hover:text-black transition-colors"
            >
              {t.nav.cta}
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-28">
          <Label>{t.hero.eyebrow}</Label>
          <h1 style={SERIF} className="text-4xl md:text-6xl leading-tight max-w-4xl">
            {t.hero.title}
          </h1>
          <p className="text-base md:text-lg text-[#bbb] mt-6 max-w-2xl leading-relaxed">{t.hero.sub}</p>
          <div className="flex flex-wrap gap-3 mt-10">
            <a
              href={href}
              style={MONO}
              className="bg-[#00e5ff] text-black px-5 py-3 text-[11px] tracking-[0.15em] uppercase font-bold hover:bg-white transition-colors"
            >
              {t.hero.cta}
            </a>
            <a
              href="#offer"
              style={MONO}
              className="border border-[#333] text-[#ccc] px-5 py-3 text-[11px] tracking-[0.15em] uppercase hover:border-white hover:text-white transition-colors"
            >
              {t.hero.secondary}
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <h2 style={SERIF} className="text-3xl md:text-4xl mb-8">
            {t.problem.title}
          </h2>
          <ol className="grid md:grid-cols-2 border-l border-t border-[#222]">
            {t.problem.items.map((item, i) => (
              <li key={i} className="bg-[#0a0a0a] p-6 flex gap-4 border-r border-b border-[#222]">
                <span style={MONO} className="text-[#ef4444] text-xs pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[#ddd] leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What you get */}
      <section className="border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <h2 style={SERIF} className="text-3xl md:text-4xl mb-8">
            {t.what.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 border-l border-t border-[#222]">
            {t.what.cards.map((c, i) => (
              <div key={i} className="bg-[#0a0a0a] p-6 border-r border-b border-[#222]">
                <div style={MONO} className="text-[10px] text-[#00e5ff] tracking-[0.2em] mb-3">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 style={SERIF} className="text-xl mb-3">
                  {c.title}
                </h3>
                <p className="text-sm text-[#aaa] leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-3 gap-8">
          <h2 style={SERIF} className="text-3xl md:text-4xl">
            {t.proof.title}
          </h2>
          <p className="md:col-span-2 text-[#ccc] leading-relaxed border-l-2 border-[#00e5ff] pl-6">{t.proof.text}</p>
        </div>
      </section>

      {/* How */}
      <section className="border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <h2 style={SERIF} className="text-3xl md:text-4xl mb-8">
            {t.how.title}
          </h2>
          <div className="grid md:grid-cols-3 border-l border-t border-[#222]">
            {t.how.steps.map((s, i) => (
              <div key={i} className="bg-[#0a0a0a] p-6 border-r border-b border-[#222]">
                <div style={MONO} className="text-[10px] text-[#888] tracking-[0.2em] uppercase mb-2">
                  {String(i + 1).padStart(2, '0')} · {s.title}
                </div>
                <p className="text-sm text-[#ccc] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer */}
      <section id="offer" className="border-b border-[#222] scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <h2 style={SERIF} className="text-3xl md:text-4xl mb-3">
            {t.offer.title}
          </h2>
          <p className="text-sm text-[#888] mb-8 max-w-2xl">{t.offer.note}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {t.offer.cards.map((o, i) => (
              <div key={i} className={`border p-6 flex flex-col ${i === 1 ? 'border-[#00e5ff] bg-[#05101a]' : 'border-[#333] bg-[#0a0a0a]'}`}>
                <div style={MONO} className="text-[10px] tracking-[0.2em] uppercase text-[#00e5ff] mb-3">
                  {o.name}
                </div>
                <div style={SERIF} className="text-3xl">
                  {o.price}
                </div>
                <div style={MONO} className="text-[11px] text-[#888] mt-2 mb-5">
                  {o.terms}
                </div>
                <ul className="space-y-2 text-sm text-[#ccc] border-t border-[#222] pt-4">
                  {o.items.map((item, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-[#00e5ff]">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={MONO} className="text-[10px] text-[#555] mt-4 tracking-wider">
            {t.offer.currency}
          </p>
        </div>
      </section>

      {/* Fit */}
      <section className="border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <h2 style={SERIF} className="text-3xl md:text-4xl mb-8">
            {t.fit.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-[#22c55e]/40 bg-[#0a0a0a] p-6">
              <div style={MONO} className="text-[10px] tracking-[0.2em] uppercase text-[#22c55e] mb-4">
                {t.fit.yesTitle}
              </div>
              <ul className="space-y-3 text-sm text-[#ccc]">
                {t.fit.yes.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="border border-[#333] bg-[#0a0a0a] p-6">
              <div style={MONO} className="text-[10px] tracking-[0.2em] uppercase text-[#888] mb-4">
                {t.fit.noTitle}
              </div>
              <ul className="space-y-3 text-sm text-[#888]">
                {t.fit.no.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Close */}
      <section>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 text-center">
          <h2 style={SERIF} className="text-3xl md:text-5xl">
            {t.close.title}
          </h2>
          <p className="text-[#aaa] mt-4 max-w-xl mx-auto">{t.close.text}</p>
          <a
            href={href}
            style={MONO}
            className="inline-block mt-8 bg-[#00e5ff] text-black px-6 py-3 text-[11px] tracking-[0.15em] uppercase font-bold hover:bg-white transition-colors"
          >
            {t.close.cta}
          </a>
        </div>
      </section>

      {/* ISOLATED ENTERPRISE FOOTER */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-12 mt-auto">
        <footer className="w-full border-t border-[#222] pt-8 pb-4 text-center">
          <p style={MONO} className="text-[10px] text-[#4CAF50] tracking-[0.2em] uppercase mb-2">
            Cleared For Human Performance
          </p>
          <p style={MONO} className="text-[10px] text-[#555] tracking-[0.2em] uppercase">
            &copy; 2026 The M.O.E. Group. All Rights Reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
