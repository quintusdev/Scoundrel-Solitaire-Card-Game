
import React from 'react';
import { Card as CardType } from '../types';
import Card from './Card';

interface RoomProps {
  cards: CardType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const Room: React.FC<RoomProps> = ({ cards, selectedId, onSelect }) => {
  return (
    <div className="flex flex-row flex-nowrap gap-4 md:gap-8 flex-1 items-center justify-center overflow-x-auto pb-8 scrollbar-hide">
      {cards.map(card => (
        <div key={card.id} className="min-w-[140px] md:min-w-[180px]">
          <Card 
            card={card} 
            isSelected={selectedId === card.id} 
            onClick={() => onSelect(card.id)} 
          />
        </div>
      ))}
      {cards.length === 0 && (
        <div className="py-20 text-slate-600 text-center animate-pulse w-full">
          La stanza è vuota... prossima stanza in arrivo...
        </div>
      )}
    </div>
  );
};

export default Room;
