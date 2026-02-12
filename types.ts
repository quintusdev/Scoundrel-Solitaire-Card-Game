
/**
 * SCOPO DEL FILE: Definizione del Domain Model del gioco.
 * RESPONSABILITÀ: Fornire contratti solidi per TypeScript per garantire type-safety.
 * DIPENDENZE: Nessuna.
 * IMPATTO: Centrale. Ogni modifica qui richiede aggiornamenti in App.tsx e nei componenti UI.
 */

// I semi del mazzo standard, mappati a funzioni di gioco (Cuori = Pozione, etc.)
export type Suit = "Cuori" | "Quadri" | "Fiori" | "Picche";

/**
 * Entità base del gioco.
 * @property {string} id - Necessario per la riconciliazione del Virtual DOM di React.
 * @property {number} value - Valore numerico utilizzato per calcoli di danno/cura.
 */
export interface Card {
  id: string;      
  suit: Suit;      
  rank: string;    
  value: number;   
}

export type GameMode = "normal" | "easy";

/**
 * Snapshot dei risultati di una singola partita.
 * Utilizzato per popolare l'Archivio (StatsModal).
 */
export interface RunSummary {
  status: "won" | "lost";
  rooms: number;
  enemies: number;
  duration: number; 
  timestamp: number;
}

/**
 * Schema per la persistenza su LocalStorage.
 */
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

/**
 * Statistiche volatili relative alla partita in corso.
 */
export interface SessionStats {
  roomsReached: number;
  enemiesDefeated: number;
  damageTaken: number;
  healingDone: number;
  runsUsed: number;
  weaponsEquipped: number;
  potionsUsed: number;
}

/**
 * Root State dell'applicazione.
 * NOTA: La separazione tra 'deck' e 'room' simula il tavolo da gioco reale.
 */
export interface GameState {
  status: "start" | "playing" | "won" | "lost";
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
}

/**
 * Contratto per la validazione delle azioni.
 * Permette alla UI di mostrare messaggi di errore (Toast) prima di eseguire logiche.
 */
export interface ActionResponse {
  ok: boolean;
  severity: "block" | "warn" | "success";
  message: string;
}
