
export type Suit = "Cuori" | "Quadri" | "Fiori" | "Picche";
export type ActionType = "UNARMED" | "WEAPON" | "POTION_ROOM" | "FUGA";
export type GameStatus = "start" | "playing" | "won" | "lost";

export interface Card {
  id: string;      
  suit: Suit;      
  rank: string;    
  value: number;   
}

export type GameMode = "normal" | "easy";

export interface RunSummary {
  status: "won" | "lost";
  rooms: number;
  enemies: number;
  duration: number; 
  timestamp: number;
}

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalRoomsCleared: number;
  totalEnemiesDefeated: number;
  totalDamageTaken: number;
  totalHealingDone: number;
  totalRunsUsed: number;
  totalWeaponsEquipped: number;
  totalPotionsUsed: number;
  bestRun: { rooms: number; enemies: number };
  lastGame: RunSummary | null;
}

export interface SessionStats {
  roomsReached: number;
  enemiesDefeated: number;
  damageTaken: number;
  healingDone: number;
  runsUsed: number;
  weaponsEquipped: number;
  potionsUsed: number;
}

export interface GameState {
  status: GameStatus;
  mode: GameMode;
  health: number;
  maxHealth: number;
  equippedWeapon: Card | null; 
  deck: Card[];                
  room: Card[];                
  selectedCardId: string | null; 
  fugaDisponibile: boolean;      
  fugaUsataUltimaStanza: boolean; 
  roomIndex: number;             
  enemiesDefeated: number;
  sessionStats: SessionStats;
  startTime: number;
}
