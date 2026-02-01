
export type Suit = "Cuori" | "Quadri" | "Fiori" | "Picche";

export interface Card {
  id: string;
  suit: Suit;
  rank: string;
  value: number;
}

export type GameMode = "normal" | "easy";

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalRoomsCleared: number;
  totalEnemiesDefeated: number;
  totalDamageTaken: number;
  totalHealingDone: number;
  totalPotionsUsed: number;
  totalRunsUsed: number;
  totalWeaponsEquipped: number;
  bestRun: { rooms: number; enemies: number };
}

export interface SessionStats {
  roomsReached: number;
  enemiesDefeated: number;
  damageTaken: number;
  healingDone: number;
  potionsUsed: number;
  runsUsed: number;
  weaponsEquipped: number;
}

export interface GameState {
  status: "start" | "playing" | "won" | "lost";
  mode: GameMode;
  health: number;
  maxHealth: number;
  potions: number;
  equippedWeapon: Card | null;
  deck: Card[];
  room: Card[];
  selectedCardId: string | null;
  fugaDisponibile: boolean;
  fugaUsataUltimaStanza: boolean;
  roomIndex: number;
  enemiesDefeated: number;
  sessionStats: SessionStats;
}

export interface ActionResponse {
  ok: boolean;
  severity: "block" | "warn" | "success";
  message: string;
}
