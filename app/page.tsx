'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Gate() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('IDLE');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('AUTHENTICATING');

    const { data: instructor, error: dbError } = await supabase
      .from('instructors')
      .select('id, full_name, status')
      .eq('alias', accessCode.trim().toUpperCase())
      .single();

    if (dbError || !instructor) {
      setError('INVALID CREDENTIALS. NODE LOCKED.');
      setStatus('IDLE');
      return;
    }

    setStatus('ROUTING');
    
    localStorage.setItem('moe_active_user', instructor.id);
    localStorage.setItem('moe_active_name', instructor.full_name);

    setTimeout(() => {
      if (instructor.status === 'incubator') {
        router.push('/incubator');
      } else if (instructor.status === 'active') {
        router.push('/terminal');
      } else {
        setError('ACCOUNT SUSPENDED.');
        setStatus('IDLE');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-mono flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md p-6 text-center">
        
        {status === 'IDLE' && (
          <form onSubmit={handleLogin} className="space-y-8 animate-fade-in">
            <div className="text-[10px] text-[#555] tracking-[6px] uppercase mb-8">
              THE M.O.E. COMMAND GATE
            </div>
            
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="ENTER ACCESS KEY"
              className="w-4/5 bg-transparent border-b border-[#333] text-white text-lg py-4 px-2 text-center outline-none tracking-[3px] transition-all focus:border-[#4CAF50]"
              autoComplete="off"
            />
            
            {error && (
              <div className="text-[#ff4444] text-[11px] mt-4 tracking-[1px] animate-pulse">
                {error}
              </div>
            )}
          </form>
        )}

        {status === 'ROUTING' && (
          <div className="animate-fade-in">
            <div className="text-[12px] text-[#4CAF50] tracking-[4px] mb-2 animate-pulse">
              SYSTEM UNLOCKED
            </div>
            <div className="text-[10px] text-[#666] mt-8 tracking-[2px]">
              Syncing neural link...
            </div>
          </div>
        )}

      </div>
    </div>
  );
}