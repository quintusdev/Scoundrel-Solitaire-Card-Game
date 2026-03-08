
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'god';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  rarity: AchievementRarity;
  category: string;
  hidden: boolean;
}

export type Suit = "Cuori" | "Quadri" | "Fiori" | "Picche";
export type ActionType = "PRIMARY_ACTION" | "FUGA";
export type GameStatus = "start" | "playing" | "won" | "lost";
export type Difficulty = "normal" | "hard" | "inferno" | "god" | "question";

export type ShiftCategory = "hostile" | "beneficial" | "neutral";
export type ShiftSource = "local" | "imported";

export interface WorldShift {
  id: string;
  name: string;
  category: ShiftCategory;
  description: string;
  effectId: string;
  timestamp: number;
  source: ShiftSource;
  signature: string;
}

export interface WorldState {
  activeShifts: WorldShift[];
  maxShifts: number;
  signature: string;
}

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
  data: string;
  metadata: SaveMetadata;
  signature: string;
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
  variants: string[];
  status: "won" | "lost";
  p42?: boolean;
  worldShifts?: WorldShift[]; // Include world state in the chronicle for B-Fusion
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
    tier: number;
    paradoxUnlocked: boolean;
    paradoxSeen: boolean;
  };
  eternalHall: ChronicleEntry[];
  worldState: WorldState;
  abyssSigils: number;
  altarUnlocks: string[];
  currentWinStreak: number;
  totalSigilsSpent: number;
}

export interface AltarNode {
  id: string;
  name: string;
  description: string;
  branch: 'blood' | 'steel' | 'shadow';
  cost: number;
  tier: number;
  requires: string | null;
  type: 'passive' | 'active';
  effectId: string;
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
  maxHealthReached: number;
  weaponsBroken: number;
  lastDurabilityKill: boolean;
  roomMonstersCount: number;
  acesInRoom: number;
  noWeaponKills10Plus: number;
  lowHPStreak: number;
  maxLowHPStreak: number;
  monstersDefeatedWithoutHealing: number;
  weaponsEquippedInRoom: number;
  potionsUsedInRoom: number;
  turnsInRoom: number;
  monstersOfValue13PlusDefeated: number;
  currentRoomsWithoutDamage: number;
  maxRoomsWithoutDamage: number;
  currentWeaponRooms: number;
  maxWeaponRooms: number;
  maxWeaponValueUsed: number;
  minWeaponValueUsed: number;
  hasEquippedWeapon: boolean;
  potionsFoundInRoom: number;
  reached1HPBeforeRoom5: boolean;
  monstersInRun: number; // Total monsters spawned
  damageTakenInRoom: number;
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
