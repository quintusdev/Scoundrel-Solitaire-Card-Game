
export type Suit = "Cuori" | "Quadri" | "Fiori" | "Picche";
export type ActionType = "PRIMARY_ACTION" | "FUGA";
export type GameStatus = "start" | "playing" | "won" | "lost";
export type Difficulty = "normal" | "hard" | "inferno" | "god" | "question";

export interface Card {
  id: string;      
  suit: Suit;      
  rank: string;    
  value: number;   
}

export interface RankEntry {
  score: number;
  date: string;
  rooms: number;
}

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
  totalRoomsCleared: number;
  totalDamageTaken: number;
  totalHealingDone: number;
  bestRun: {
    rooms: number;
    enemies: number;
  };
}

export interface SaveMetadata {
  profileNickname: string;
  difficulty: Difficulty;
  health: number;
  rooms: number;
  timestamp: number;
  version: string;
}

export interface SignedSave {
  data: string; // Base64 encoded GameState
  metadata: SaveMetadata;
  signature: string; // HMAC SHA-256
}

export interface ChronicleEntry {
  id: string;
  heroName: string;
  heroClass: string;
  title: string;
  timestamp: number;
  stats: SessionStats;
  rooms: number;
  difficulty: Difficulty;
  variants: string[]; // e.g., ["flawless", "no_potion"]
  status: "won" | "lost";
  p42?: boolean;
}

export interface SignedChronicle {
  data: string;
  signature: string;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  heroClass: string;
  avatar: string;
  version: string;
  lastActivity: string;
  unlocks: { hard: boolean; inferno: boolean; god: boolean };
  achievements: Record<string, boolean>;
  rankings: Record<Difficulty, RankEntry | null>;
  stats: Record<Difficulty | "general", ProfileStats>;
  currentGame: GameState | null;
  lastGame: RunSummary | null;
  saves: Record<Difficulty, (SignedSave | null)[]>;
  eternalUnlocks: Record<string, string[]>; 
  selectedVariant: Record<string, string | null>;
  progression: {
    tier: number; // 0, 1, 2, 3
    paradoxUnlocked: boolean;
    paradoxSeen: boolean;
  };
  eternalHall: ChronicleEntry[];
}

export interface SessionStats {
  roomsReached: number;
  enemiesDefeated: number;
  damageTaken: number;
  healingDone: number;
  weaponsEquipped: number;
  potionsUsed: number;
  retreatsUsed: number;
  minHealthReached: number;
}

export interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  health: number;
  maxHealth: number;
  equippedWeapon: Card | null;
  weaponDurability: number | null; 
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
