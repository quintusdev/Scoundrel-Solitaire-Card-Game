
import React, { useState } from 'react';
import { CHEST_VISUALS } from '../constants';

interface EvolutiveChestProps {
  tier: number;
  onClick: () => void;
}

const EvolutiveChest: React.FC<EvolutiveChestProps> = ({ tier, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = CHEST_VISUALS[tier] || CHEST_VISUALS[0];

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      onClick();
      setIsOpen(false);
    }, 400);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-slate-900/20 p-4 sm:p-6 rounded-[32px] border border-white/5 backdrop-blur-sm">
      <button 
        onClick={handleOpen}
        className={`
          relative w-20 h-20 sm:w-32 sm:h-32 rounded-[24px] sm:rounded-[32px] border-2 sm:border-4 flex items-center justify-center transition-all duration-500 shrink-0
          ${config.glowClass}
          ${isOpen ? 'scale-110 rotate-3' : 'hover:scale-105 active:scale-95'}
          ${config.animation}
          group bg-slate-950/40
        `}
        title={config.label}
      >
        {/* Particle System (Simplified for React) */}
        {tier > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 rounded-full animate-float-chest"
                style={{
                  backgroundColor: config.particleColor,
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        )}

        <span className={`text-5xl sm:text-6xl transition-transform duration-300 ${isOpen ? '-translate-y-2' : 'group-hover:scale-110'}`}>
          {config.icon}
        </span>
        
        {/* Tier Indicator */}
        <div className="absolute -top-3 px-3 py-1 bg-slate-950 border border-white/10 rounded-full shadow-xl">
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Archivio Tier {tier}</span>
        </div>
      </button>
      
      <div className="text-center sm:text-left flex flex-col justify-center">
        <p className={`text-xs sm:text-sm font-black uppercase tracking-widest mb-1 ${tier === 3 ? 'text-cyan-400' : tier === 2 ? 'text-yellow-500' : 'text-slate-400'}`}>
          {config.label}
        </p>
        <p className="text-[10px] sm:text-xs text-slate-500 font-bold max-w-[200px] leading-tight italic">
          {config.description}
        </p>
        <div className="mt-2 flex justify-center sm:justify-start">
          <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-slate-600" style={{ width: `${(tier/3)*100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutiveChest;
