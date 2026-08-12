'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Incubator() {
  const [wolfCue, setWolfCue] = useState('');
  const [shepherdCue, setShepherdCue] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('moe_active_name') || 'Operator';
    const id = localStorage.getItem('moe_active_user') || '';
    setUserName(name);
    setUserId(id);
  }, []);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wolfCue || !shepherdCue) return;

    setStatusMsg('TRANSMITTING...');

    const { error } = await supabase
      .from('cues')
      .insert([{ instructor_id: userId, wolf_cue: wolfCue, shepherd_cue: shepherdCue }]);

    if (error) {
      setStatusMsg('TRANSMISSION FAILED.');
    } else {
      setStatusMsg('LOG RECORDED SUCCESSFULLY.');
      setWolfCue('');
      setShepherdCue('');
    }
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-mono p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl bg-[#111] border border-[#222] p-8 rounded-sm">
        <div className="text-[10px] text-[#3b82f6] tracking-[4px] uppercase mb-2">BASE CAMP INCUBATOR</div>
        <h1 className="text-2xl font-bold mb-6">WELCOME, {userName}</h1>
        
        <form onSubmit={handleLogSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">WOLF CUE (Assertive Command)</label>
            <input
              type="text"
              value={wolfCue}
              onChange={(e) => setWolfCue(e.target.value)}
              className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#3b82f6]"
              placeholder="Enter kinetic execution command..."
            />
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-2 uppercase tracking-wider">SHEPHERD CUE (Tactile/Form Guidance)</label>
            <input
              type="text"
              value={shepherdCue}
              onChange={(e) => setShepherdCue(e.target.value)}
              className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#3b82f6]"
              placeholder="Enter correction guidance..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#3b82f6] text-black font-bold uppercase tracking-widest py-3 hover:bg-white transition-colors"
          >
            Submit Cue Log
          </button>
        </form>

        {statusMsg && <div className="text-xs text-center mt-4 tracking-widest text-[#4CAF50]">{statusMsg}</div>}
      </div>
    </main>
  );
}