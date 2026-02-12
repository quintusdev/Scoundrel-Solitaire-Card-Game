
import React from 'react';
import { Card as CardType } from '../types';
import Card from './Card';

interface RoomProps {
  cards: CardType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isExiting?: boolean;
  dyingCardId?: string | null;
  weaponDyingCardId?: string | null;
}

const Room: React.FC<RoomProps> = ({ cards, selectedId, onSelect, isExiting = false, dyingCardId = null, weaponDyingCardId = null }) => {
  return (
    <div id="room-container" className="flex flex-row flex-nowrap gap-4 md:gap-8 flex-1 items-center justify-center overflow-x-auto pb-8 scrollbar-hide">
      {cards.map((card, index) => (
        <div key={card.id} className="min-w-[140px] md:min-w-[180px]">
          <Card 
            card={card} 
            isSelected={selectedId === card.id} 
            onClick={() => onSelect(card.id)} 
            animationDelay={`${index * 0.1}s`}
            isExiting={isExiting}
            isDying={dyingCardId === card.id}
            isWeaponDeath={weaponDyingCardId === card.id}
          />
        </div>
      ))}
      {cards.length === 0 && !isExiting && (
        <div className="py-20 text-slate-600 text-center animate-pulse w-full font-black uppercase tracking-[0.2em] text-xs">
          Area svuotata... ricarica mazzo
        </div>
      )}
    </div>
  );
};

export default Room;
