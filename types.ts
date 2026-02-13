
export type Suit = "Cuori" | "Quadri" | "Fiori" | "Picche";
export type ActionType = "PRIMARY_ACTION" | "FUGA";
export type GameStatus = "start" | "playing" | "won" | "lost";
export type Difficulty = "normal" | "hard" | "inferno";

export interface Card {
  id: string;      
  suit: Suit;      
  rank: string;    
  value: number;   
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface RankEntry {
  score: number;
  date: string;
  rooms: number;
}

// Added RunSummary to track session details for StatsModal
export interface RunSummary {
  status: GameStatus;
  rooms: number;
  enemies: number;
  duration: number;
  timestamp: number;
}

export interface ProfileStats {
  wins: number;
  losses: number;
  totalGames: number;
  bestScore: number;
  // Added fields required by StatsModal
  totalRoomsCleared: number;
  totalDamageTaken: number;
  totalHealingDone: number;
  bestRun: {
    rooms: number;
    enemies: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  heroClass: string;
  avatar: string;
  version: string;
  lastActivity: string;
  unlocks: { hard: boolean; inferno: boolean };
  achievements: Record<string, boolean>;
  rankings: Record<Difficulty, RankEntry | null>;
  stats: Record<Difficulty | "general", ProfileStats>;
  currentGame: GameState | null;
  // Track last game for the archive view
  lastGame: RunSummary | null;
}

export interface SessionStats {
  roomsReached: number;
  enemiesDefeated: number;
  damageTaken: number;
  healingDone: number;
  weaponsEquipped: number;
  potionsUsed: number;
}

export interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  health: number;
  maxHealth: number;
  equippedWeapon: Card | null;
  weaponDurability: number | null; // Solo Inferno
  deck: Card[];
  room: Card[];
  selectedCardId: string | null;
  fugaDisponibile: boolean;
  fugaUsataUltimaStanza: boolean;
  roomIndex: number;
  enemiesDefeated: number;
  startTime: number;
  sessionStats: SessionStats;
}

export interface ProfilesData {
  activeProfileId: string | null;
  profiles: Record<string, UserProfile>;
}
