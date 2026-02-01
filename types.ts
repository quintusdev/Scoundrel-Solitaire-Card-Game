
export type Suit = "Cuori" | "Quadri" | "Fiori" | "Picche";

export interface Card {
  id: string;
  suit: Suit;
  rank: string;
  value: number;
}

export type GameMode = "normal" | "easy";

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
}

export interface ActionResponse {
  ok: boolean;
  severity: "block" | "warn" | "success";
  message: string;
}
