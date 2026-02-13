
import React from 'react';
import { Card as CardType, Difficulty } from '../types';
import Card from './Card';

interface RoomProps {
  cards: CardType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isExiting?: boolean;
  dyingCardId?: string | null;
  difficulty?: Difficulty;
}

const Room: React.FC<RoomProps> = ({ cards, selectedId, onSelect, isExiting = false, dyingCardId = null, difficulty }) => {
  const isQuestion = difficulty === 'question';
  return (
    <div id="room-container" className="flex flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6 w-full h-full max-h-[55vh] px-2 py-2 overflow-visible">
      {cards.map((card, index) => (
        <div key={card.id} className="w-[20vw] h-full max-w-[150px] sm:max-w-[180px] flex items-center">
          <Card 
            card={card} 
            isSelected={selectedId === card.id} 
            onClick={() => onSelect(card.id)} 
            animationDelay={`${index * 0.05}s`}
            isExiting={isExiting}
            isDying={dyingCardId === card.id}
            isQuestionMode={isQuestion}
          />
        </div>
      ))}
      {cards.length === 0 && !isExiting && (
        <div className="py-10 text-slate-700 text-center animate-pulse w-full font-black uppercase tracking-widest text-[10px]">
          Prossima Area...
        </div>
      )}
    </div>
  );
};

export default Room;
