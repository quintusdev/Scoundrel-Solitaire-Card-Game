
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
    <div className="flex flex-col items-center gap-3">
      <button 
        onClick={handleOpen}
        className={`
          relative w-28 h-28 rounded-[32px] border-4 flex items-center justify-center transition-all duration-500
          ${config.glowClass}
          ${isOpen ? 'scale-110 rotate-3' : 'hover:scale-105 active:scale-95'}
          ${config.animation}
          group bg-slate-900/40
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

        <span className={`text-5xl transition-transform duration-300 ${isOpen ? '-translate-y-2' : 'group-hover:scale-110'}`}>
          {config.icon}
        </span>
        
        {/* Tier Indicator */}
        <div className="absolute -top-3 px-2 py-0.5 bg-slate-950 border border-white/10 rounded-full">
           <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Archivio Tier {tier}</span>
        </div>
      </button>
      
      <div className="text-center">
        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${tier === 3 ? 'text-cyan-400' : tier === 2 ? 'text-yellow-500' : 'text-slate-400'}`}>
          {config.label}
        </p>
        <p className="text-[8px] text-slate-600 font-bold max-w-[120px] leading-tight italic">
          {config.description}
        </p>
      </div>
    </div>
  );
};

export default EvolutiveChest;
