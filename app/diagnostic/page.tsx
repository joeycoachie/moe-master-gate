'use client';

import { useRef, useState } from 'react';

type Answers = { q1: string; q2: string; q3: string };
type Tier = 'Control' | 'Capacity' | 'Flow';
type Step = 'q1' | 'q2' | 'q3' | 'lead' | 'result';

const LEAD_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbw1ScZ-8z8rcPyYEQw_URHA4iNx1uUTs_dtlLVu82H1aUsKSLr5Vx4sFJ89tmgRNeLH/exec';
const WHATSAPP_NUMBER = '60102319893';

const COUNTRY_CODES = [
  { code: '+60', flag: '🇲🇾' },
  { code: '+65', flag: '🇸🇬' },
  { code: '+62', flag: '🇮🇩' },
  { code: '+66', flag: '🇹🇭' },
  { code: '+86', flag: '🇨🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+61', flag: '🇦🇺' },
];

const RESULTS: Record<
  Tier,
  { title: string; titleColor: string; desc: string; auth: string; authColor: string; waMessage: string }
> = {
  Control: {
    title: 'Optimum Control',
    titleColor: 'text-white',
    desc: 'Your mechanics require foundational alignment. You are assigned to Optimum Control to master precision, neutral pelvis, and deep core stability. Do not add load until your structure is secure.',
    auth: 'LEVEL 1: CLEARED',
    authColor: 'text-[#e0e0e0]',
    waMessage:
      "Hi! I just completed my Kinetic Diagnostic and unlocked Level 1: Optimum Control. I'm ready to architect my baseline and book my first session. What are the next steps?",
  },
  Capacity: {
    title: 'Optimum Capacity',
    titleColor: 'text-[#3b82f6]',
    desc: 'Your baseline mechanics are stable. You are assigned to Optimum Capacity to test your limits. You are cleared for heavy spring resistance and load to build muscular endurance.',
    auth: 'LEVEL 2: CLEARED',
    authColor: 'text-[#3b82f6]',
    waMessage:
      "Hi! I just completed my Kinetic Diagnostic and unlocked Level 2: Optimum Capacity. I'm ready to build athletic strength and book my first session. What are the next steps?",
  },
  Flow: {
    title: 'Optimum Flow State',
    titleColor: 'text-[#ff9800]',
    desc: 'You possess advanced structural integrity. You are assigned to Optimum Flow State for continuous, uninterrupted motion and total body integration.',
    auth: 'LEVEL 3: CLEARED',
    authColor: 'text-[#ff9800]',
    waMessage:
      "Hi! I just completed my Kinetic Diagnostic and unlocked Level 3: Optimum Flow State. I'm ready for kinetic harmony and want to book my session. What are the next steps?",
  },
};

function computeTier(a: Answers): Tier {
  // Q3=A is a direct goal-match honored on its own. Q1+Q2 only force Control
  // when BOTH red flags compound — a single isolated flag no longer blocks Flow.
  if (a.q3 === 'A') return 'Control';
  if (a.q1 === 'A' && a.q2 === 'A') return 'Control';
  if (a.q3 === 'C') return 'Flow';
  return 'Capacity';
}

export default function KineticDiagnostic() {
  const [step, setStep] = useState<Step>('q1');
  const [answers, setAnswers] = useState<Answers>({ q1: '', q2: '', q3: '' });
  const [tier, setTier] = useState<Tier>('Capacity');
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+60');
  const [phone, setPhone] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const answerQ = (q: 1 | 2 | 3, value: string) => {
    const next = { ...answers, [`q${q}`]: value };
    setAnswers(next);
    if (q < 3) {
      setStep((`q${q + 1}` as Step));
    } else {
      setTier(computeTier(next));
      setStep('lead');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Country_Code', countryCode);
    formData.append('Phone', phone);
    formData.append('Class_Result', tier);

    fetch(LEAD_WEBHOOK_URL, { method: 'POST', body: formData })
      .catch((err) => console.error('Error logging lead:', err))
      .finally(() => {
        setSubmitting(false);
        setStep('result');
      });
  };

  const runNewDiagnostic = () => {
    setAnswers({ q1: '', q2: '', q3: '' });
    setName('');
    setPhone('');
    setStep('q1');
  };

  const bookNow = () => {
    runNewDiagnostic();
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const result = RESULTS[tier];
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(result.waMessage)}`;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 space-y-8 py-12"
      style={{ backgroundColor: '#050505', color: '#e0e0e0', fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .kin-serif { font-family: 'Playfair Display', serif; }
        .kin-mono { font-family: 'Courier New', Courier, monospace; }
        .kin-fade-in { animation: kinFadeIn 0.5s ease-in forwards; }
        @keyframes kinFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .kin-loader { border: 2px solid #333; border-top: 2px solid #4CAF50; border-radius: 50%; width: 16px; height: 16px; animation: kinSpin 1s linear infinite; display: inline-block; margin-right: 8px; vertical-align: middle; }
        @keyframes kinSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div
        ref={cardRef}
        className="max-w-2xl w-full bg-[#0a0a0a] border border-[#222] p-8 md:p-12 rounded-sm shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-10 border-b border-[#222] pb-6">
          <span className="kin-mono text-[#4CAF50] text-[10px] tracking-widest uppercase block mb-2">
            Pre-Flight Calibration
          </span>
          <h1 className="text-3xl kin-serif text-white tracking-tight">Kinetic Diagnostic</h1>
          <p className="text-[#888] text-sm mt-2">Identify your baseline. Secure your architecture.</p>
        </div>

        {step === 'q1' && (
          <div className="kin-fade-in">
            <p className="kin-mono text-xs text-[#3b82f6] mb-3 tracking-widest uppercase">Phase 01: Core Activation</p>
            <h2 className="text-xl text-white mb-6 leading-relaxed">
              What happens when you try to brace your core (e.g., when you cough or laugh hard)?
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => answerQ(1, 'A')}
                className="w-full text-left p-4 border border-[#333] hover:border-[#4CAF50] bg-[#111] hover:bg-[#1a1a1a] transition-colors rounded-sm text-sm text-[#a3a3a3] hover:text-white"
              >
                [ A ] I feel pressure in my lower back, or my stomach bulges outward.
              </button>
              <button
                onClick={() => answerQ(1, 'B')}
                className="w-full text-left p-4 border border-[#333] hover:border-[#4CAF50] bg-[#111] hover:bg-[#1a1a1a] transition-colors rounded-sm text-sm text-[#a3a3a3] hover:text-white"
              >
                [ B ] My stomach pulls flat inward, tight like a corset.
              </button>
            </div>
          </div>
        )}

        {step === 'q2' && (
          <div className="kin-fade-in">
            <p className="kin-mono text-xs text-[#3b82f6] mb-3 tracking-widest uppercase">Phase 02: Structural Integrity</p>
            <h2 className="text-xl text-white mb-6 leading-relaxed">
              In the past 6 months, have you experienced lower back or neck pain during workouts?
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => answerQ(2, 'A')}
                className="w-full text-left p-4 border border-[#333] hover:border-[#4CAF50] bg-[#111] hover:bg-[#1a1a1a] transition-colors rounded-sm text-sm text-[#a3a3a3] hover:text-white"
              >
                [ A ] Yes, frequently. Or I am currently recovering from an injury.
              </button>
              <button
                onClick={() => answerQ(2, 'B')}
                className="w-full text-left p-4 border border-[#333] hover:border-[#4CAF50] bg-[#111] hover:bg-[#1a1a1a] transition-colors rounded-sm text-sm text-[#a3a3a3] hover:text-white"
              >
                [ B ] No, my joints are healthy and pain-free.
              </button>
            </div>
          </div>
        )}

        {step === 'q3' && (
          <div className="kin-fade-in">
            <p className="kin-mono text-xs text-[#3b82f6] mb-3 tracking-widest uppercase">Phase 03: The Objective</p>
            <h2 className="text-xl text-white mb-6 leading-relaxed">What is your primary objective for the next 90 days?</h2>
            <div className="space-y-3">
              <button
                onClick={() => answerQ(3, 'A')}
                className="w-full text-left p-4 border border-[#333] hover:border-[#4CAF50] bg-[#111] hover:bg-[#1a1a1a] transition-colors rounded-sm text-sm text-[#a3a3a3] hover:text-white"
              >
                [ A ] To fix my posture, stop hurting, and learn how to use my body safely.
              </button>
              <button
                onClick={() => answerQ(3, 'B')}
                className="w-full text-left p-4 border border-[#333] hover:border-[#4CAF50] bg-[#111] hover:bg-[#1a1a1a] transition-colors rounded-sm text-sm text-[#a3a3a3] hover:text-white"
              >
                [ B ] To build athletic strength, build endurance, and challenge myself under load.
              </button>
              <button
                onClick={() => answerQ(3, 'C')}
                className="w-full text-left p-4 border border-[#333] hover:border-[#4CAF50] bg-[#111] hover:bg-[#1a1a1a] transition-colors rounded-sm text-sm text-[#a3a3a3] hover:text-white"
              >
                [ C ] I am advanced. I want continuous, high-intensity flow and kinetic harmony.
              </button>
            </div>
          </div>
        )}

        {step === 'lead' && (
          <div className="text-center kin-fade-in">
            <h2 className="text-2xl kin-serif text-white mb-2">Diagnostic Complete</h2>
            <p className="text-[#a3a3a3] text-sm mb-6">
              Enter your details to generate your structural profile and unlock your assigned tier.
            </p>

            <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4 mb-4 text-left">
              <div>
                <label className="kin-mono text-[10px] text-[#888] tracking-widest uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050505] border border-[#333] text-white p-3 rounded-sm focus:outline-none focus:border-[#4CAF50] text-sm"
                />
              </div>

              <div>
                <label className="kin-mono text-[10px] text-[#888] tracking-widest uppercase block mb-1">WhatsApp Number</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-[#050505] border border-[#333] text-white p-3 rounded-sm focus:outline-none focus:border-[#4CAF50] text-sm w-[35%] shrink-0"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    placeholder="123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#050505] border border-[#333] text-white p-3 rounded-sm focus:outline-none focus:border-[#4CAF50] text-sm flex-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#4CAF50] hover:bg-[#45a049] disabled:opacity-80 disabled:cursor-not-allowed text-white py-3 rounded-sm transition-colors text-sm font-medium tracking-wide uppercase mt-4"
              >
                {submitting ? (
                  <>
                    <span className="kin-loader" /> CALIBRATING...
                  </>
                ) : (
                  'Unlock Tier'
                )}
              </button>
            </form>
          </div>
        )}

        {step === 'result' && (
          <div className="text-center kin-fade-in">
            <p className="kin-mono text-xs text-[#4CAF50] mb-3 tracking-widest uppercase">System Authorized</p>
            <h2 className={`text-3xl kin-serif mb-4 ${result.titleColor}`}>{result.title}</h2>
            <p className="text-[#a3a3a3] text-sm leading-relaxed mb-8 max-w-md mx-auto">{result.desc}</p>

            <div className="p-4 border border-[#333] bg-[#111] inline-block text-left mb-8 w-full max-w-sm">
              <div className="flex justify-between items-center mb-2 border-b border-[#222] pb-2">
                <span className="kin-mono text-[10px] text-[#888] tracking-widest uppercase">Clearance Level</span>
                <span className={`font-bold uppercase tracking-widest text-xs ${result.authColor}`}>{result.auth}</span>
              </div>
              <p className="text-xs text-[#555] italic">
                Your kinetic profile has been logged. Proceed to secure your session via WhatsApp below.
              </p>
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-sm mx-auto bg-[#222] hover:bg-[#4CAF50] text-white py-4 rounded-sm transition-colors text-sm font-medium tracking-widest uppercase mb-4 shadow-lg"
            >
              BOOK MY SESSION NOW
            </a>

            <button
              onClick={runNewDiagnostic}
              className="block w-full max-w-sm mx-auto border border-[#333] text-[#888] hover:text-white hover:border-[#888] py-3 text-xs uppercase tracking-widest transition-colors"
            >
              Run New Diagnostic
            </button>
          </div>
        )}
      </div>

      {/* THE CLASS TAXONOMY REFERENCE (Client Facing) */}
      <div className="max-w-2xl w-full bg-[#0a0a0a] border border-[#222] p-8 md:p-12 rounded-sm shadow-2xl relative overflow-hidden">
        <section className="space-y-6">
          <h2 className="text-2xl kin-serif italic text-white flex items-center justify-between border-b border-[#222] pb-4">
            The Optimum Fit Taxonomy
            <span className="text-[10px] font-sans text-[#888] not-italic font-light tracking-widest uppercase">
              System Reference
            </span>
          </h2>

          <p className="text-sm text-[#888] mb-4">
            The Rule of Thumb: If you are new or hurting, book <strong>Control</strong>. If you want to build athletic
            strength, book <strong>Capacity</strong>. If you want a seamless, intense challenge, book <strong>Flow</strong>.
          </p>

          <div className="space-y-4">
            <details className="group bg-[#111] border border-[#222] rounded-sm">
              <summary className="cursor-pointer list-none p-5 flex items-center justify-between hover:bg-[#1a1a1a]">
                <div className="flex items-center gap-6">
                  <span className="kin-mono text-[#a3a3a3] text-sm w-20">LEVEL 1</span>
                  <h4 className="text-lg kin-serif text-white">Optimum Control</h4>
                </div>
                <span className="text-[10px] text-[#555] group-open:hidden">EXPAND</span>
              </summary>
              <div className="border-t border-[#222] p-6">
                <p className="text-sm text-[#e0e0e0] leading-relaxed mb-4">
                  <strong>The Foundation</strong>
                </p>
                <p className="text-sm text-[#a3a3a3] leading-relaxed mb-4">
                  Focuses on precision, neutral pelvis and deep core stability.
                </p>
                <p className="text-sm text-[#4CAF50] font-medium mb-4">
                  Ideal for beginners, injury recovery, or anyone fixing movement mechanics.
                </p>
                <p className="kin-mono text-xs text-[#555] tracking-widest uppercase border-t border-[#222] pt-4">
                  Apparatus: Mat, Chair, Reformer
                </p>
              </div>
            </details>

            <details className="group bg-[#111] border border-[#222] rounded-sm">
              <summary className="cursor-pointer list-none p-5 flex items-center justify-between hover:bg-[#1a1a1a]">
                <div className="flex items-center gap-6">
                  <span className="kin-mono text-[#3b82f6] text-sm w-20">LEVEL 2</span>
                  <h4 className="text-lg kin-serif text-white">Optimum Capacity</h4>
                </div>
                <span className="text-[10px] text-[#555] group-open:hidden">EXPAND</span>
              </summary>
              <div className="border-t border-[#222] p-6">
                <p className="text-sm text-[#e0e0e0] leading-relaxed mb-4">
                  <strong>The Athletic Build</strong>
                </p>
                <p className="text-sm text-[#a3a3a3] leading-relaxed mb-4">
                  Tests your limits. We use heavy spring resistance and volume to build muscular ENDURANCE and
                  functional strength under LOAD.
                </p>
                <p className="kin-mono text-xs text-[#555] tracking-widest uppercase border-t border-[#222] pt-4">
                  Apparatus: Reformer, Barrel
                </p>
              </div>
            </details>

            <details className="group bg-[#111] border border-[#ff9800]/20 rounded-sm">
              <summary className="cursor-pointer list-none p-5 flex items-center justify-between hover:bg-[#1a1a1a]">
                <div className="flex items-center gap-6">
                  <span className="kin-mono text-[#ff9800] text-sm w-20">LEVEL 3</span>
                  <h4 className="text-lg kin-serif text-white">Optimum Flow State</h4>
                </div>
                <span className="text-[10px] text-[#555] group-open:hidden">EXPAND</span>
              </summary>
              <div className="border-t border-[#222] p-6">
                <p className="text-sm text-[#e0e0e0] leading-relaxed mb-4">
                  <strong>Kinetic Harmony</strong>
                </p>
                <p className="text-sm text-[#a3a3a3] leading-relaxed mb-4">
                  Continuous, uninterrupted motion linking complex sequences together. High heart rate, total body
                  integration.
                </p>
                <p className="kin-mono text-xs text-[#555] tracking-widest uppercase border-t border-[#222] pt-4">
                  Apparatus: Reformer, Barrel
                </p>
              </div>
            </details>
          </div>

          <button
            onClick={bookNow}
            className="block w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-4 rounded-sm transition-colors text-sm font-medium tracking-widest uppercase shadow-lg mt-2"
          >
            Book Now
          </button>
          <p className="text-center text-[10px] text-[#555] tracking-widest uppercase -mt-2">
            Takes you back to the 3-question diagnostic above
          </p>
        </section>
      </div>
    </div>
  );
}
