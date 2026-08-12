'use client';

export default function Terminal() {
  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8">
      <div className="max-w-7xl mx-auto">
        <header className="border-b border-[#222] pb-6 mb-8 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-[#4CAF50] tracking-[4px] uppercase">ACCESS LEVEL: S-RANK ACTIVE</div>
            <h1 className="text-3xl font-bold mt-1">INSTRUCTOR PROGRAMMING TERMINAL</h1>
          </div>
          <a href="/" className="border border-[#333] px-4 py-2 text-xs text-[#888] hover:text-white">LOCK GATE</a>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-[#222] p-6">
            <span className="text-[10px] text-[#3b82f6] uppercase tracking-widest">STATION 01</span>
            <h2 className="text-xl font-bold mt-2 mb-4">Ladder Barrel Protocol</h2>
            <p className="text-xs text-[#888]">Active hardware operational parameters and clinical sequences.</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-6">
            <span className="text-[10px] text-[#4CAF50] uppercase tracking-widest">STATION 02</span>
            <h2 className="text-xl font-bold mt-2 mb-4">Stability Chair Flow</h2>
            <p className="text-xs text-[#888]">Resistance mapping and foundational tension management.</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-6">
            <span className="text-[10px] text-[#ff9800] uppercase tracking-widest">STATION 03</span>
            <h2 className="text-xl font-bold mt-2 mb-4">Live Shared Feed</h2>
            <p className="text-xs text-[#888]">Global team cue synchronization repository.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
