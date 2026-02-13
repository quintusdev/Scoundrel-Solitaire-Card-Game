
import React, { useEffect, useState } from 'react';
import { BOOT_CONFIG, CHEST_VISUALS } from '../constants';

interface BootSequenceProps {
  tier: number;
  onComplete: () => void;
}

const BootSequence: React.FC<BootSequenceProps> = ({ tier, onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'chest' | 'finish'>('intro');
  const config = BOOT_CONFIG[tier] || BOOT_CONFIG[0];
  const chest = CHEST_VISUALS[tier] || CHEST_VISUALS[0];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('chest'), 500);
    const t2 = setTimeout(() => setPhase('finish'), 1300);
    const t3 = setTimeout(() => onComplete(), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center ${config.overlayClass} transition-opacity duration-300 ${phase === 'finish' ? 'opacity-0' : 'opacity-100'}`}>
      
      <div className={`flex flex-col items-center gap-8 ${config.effectClass}`}>
        
        <div className={`transition-all duration-500 transform ${phase === 'chest' ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10'}`}>
           <div className={`w-32 h-32 rounded-[40px] border-4 bg-slate-900/40 flex items-center justify-center text-6xl ${chest.glowClass}`}>
              {chest.icon}
           </div>
        </div>

        <div className="text-center">
           <h1 className={`text-4xl font-black tracking-tighter uppercase mb-2 ${tier === 3 ? 'text-cyan-400' : tier === 2 ? 'text-yellow-500' : 'text-white'}`}>
             {config.title}
           </h1>
           <div className="h-[2px] w-0 bg-blue-500 mx-auto animate-grow-line" />
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">
             {config.sub}
           </p>
        </div>

      </div>

      {tier === 3 && phase === 'chest' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-cyan-400/5 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default BootSequence;
