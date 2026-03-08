
import { Card, Suit, Difficulty, AltarNode, Achievement } from './types';

export const GAME_RULES = {
  INITIAL_HEALTH: 20,
  CARDS_PER_ROOM: 4,
  PROFILES_KEY: "scoundrel_meta_v3",
  VERSION: "1.3",
  INFERNO_WINS_FOR_GOD: 3,
  GOD_WINS_FOR_ETERNAL: 3,
};

export interface ChestConfig {
  icon: string;
  label: string;
  glowClass: string;
  particleColor: string;
  animation: string;
  description: string;
}

export const CHEST_VISUALS: Record<number, ChestConfig> = {
  0: {
    icon: "📦",
    label: "Cassa di Legno",
    glowClass: "border-slate-800 shadow-none",
    particleColor: "transparent",
    animation: "animate-none",
    description: "Un umile baule per un nuovo avventuriero."
  },
  1: {
    icon: "🧳",
    label: "Baule di Ferro",
    glowClass: "border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    particleColor: "#3b82f6",
    animation: "chest-pulse-iron",
    description: "Il metallo protegge i primi successi."
  },
  2: {
    icon: "💰",
    label: "Scrigno Dorato",
    glowClass: "border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.4)]",
    particleColor: "#eab308",
    animation: "chest-pulse-gold",
    description: "Splendente di gloria e vittorie infernali."
  },
  3: {
    icon: "💎",
    label: "Forziere Eterno",
    glowClass: "border-cyan-400 god-border-glow shadow-[0_0_40px_rgba(34,211,238,0.6)]",
    particleColor: "#22d3ee",
    animation: "chest-pulse-eternal",
    description: "Un manufatto divino forgiato nell'Abisso."
  }
};

export interface BootConfig {
  overlayClass: string;
  effectClass: string;
  title: string;
  sub: string;
}

export const BOOT_CONFIG: Record<number, BootConfig> = {
  0: {
    overlayClass: "bg-slate-950",
    effectClass: "animate-fade-in",
    title: "SCOUNDREL",
    sub: "PROTOC_INIT_V0"
  },
  1: {
    overlayClass: "bg-slate-950",
    effectClass: "boot-iron",
    title: "IRON SCOUNDREL",
    sub: "VAULT_SECURED"
  },
  2: {
    overlayClass: "bg-slate-950",
    effectClass: "boot-gold",
    title: "GOLDEN LEGACY",
    sub: "INFERNO_RESISTANT"
  },
  3: {
    overlayClass: "bg-slate-950",
    effectClass: "boot-arcane",
    title: "ETERNAL ASCENSION",
    sub: "GOD_TIER_STABILIZED"
  }
};

export interface EternalVariant {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const ETERNAL_VARIANTS: Record<string, EternalVariant> = {
  standard: {
    id: 'standard',
    name: 'Eterno',
    icon: '✨',
    description: 'Completate 3 spedizioni in modalità GOD.',
    color: 'text-yellow-400'
  },
  flawless: {
    id: 'flawless',
    name: 'Immacolato',
    icon: '🛡️',
    description: 'Vittoria GOD senza mai scendere sotto il 50% HP.',
    color: 'text-cyan-400'
  },
  no_potion: {
    id: 'no_potion',
    name: 'Ascetico',
    icon: '🧪',
    description: 'Vittoria GOD senza utilizzare pozioni.',
    color: 'text-purple-400'
  },
  no_retreat: {
    id: 'no_retreat',
    name: 'Incrollabile',
    icon: '🚩',
    description: 'Vittoria GOD senza mai fuggire.',
    color: 'text-red-500'
  }
};

export const DifficultyRules = {
  canAttack: (monsterVal: number, weaponVal: number, diff: Difficulty): boolean => {
    if (diff === 'inferno' || diff === 'god' || diff === 'question') {
      return weaponVal >= monsterVal;
    }
    return true;
  },
  
  calculateDamage: (monsterVal: number, weaponVal: number, diff: Difficulty): number => {
    if (diff === 'normal') {
      return Math.max(0, monsterVal - weaponVal);
    }
    if (diff === 'hard' || diff === 'inferno' || diff === 'god' || diff === 'question') {
      return weaponVal >= monsterVal ? 0 : monsterVal;
    }
    return monsterVal;
  },

  getHealMultiplier: (diff: Difficulty): number => {
    const multipliers = { normal: 1, hard: 1, inferno: 0.5, god: 0.25, question: 0.5 };
    return multipliers[diff];
  },

  getMaxDurability: (diff: Difficulty): number | null => {
    if (diff === 'inferno') return 3;
    if (diff === 'god') return 2;
    if (diff === 'question') return null; // Logic is probabilistic in App.tsx
    return null;
  },

  getRetreatCost: (diff: Difficulty): number => {
    if (diff === 'god') return 2;
    if (diff === 'inferno' || diff === 'question') return 1;
    return 0;
  }
};

export const DIFFICULTY_CONFIG: Record<Difficulty, { 
  label: string, 
  color: string, 
  bgClass: string,
  description: string,
}> = {
  normal: { 
    label: "Normale", 
    color: "text-blue-400", 
    bgClass: "bg-blue-500/10 border-blue-500/20",
    description: "Danno standard Scoundrel. Salute persistente."
  },
  hard: { 
    label: "Hardcore", 
    color: "text-orange-500", 
    bgClass: "bg-orange-500/10 border-orange-500/20",
    description: "Se Arma < Mostro, subisci danno pieno."
  },
  inferno: { 
    label: "Inferno", 
    color: "text-red-500", 
    bgClass: "bg-red-500/10 border-red-500/20 animate-pulse-slow",
    description: "Arma limitata (3 usi). Blocco attacco se deboli."
  },
  god: { 
    label: "GOD MODE", 
    color: "text-yellow-400", 
    bgClass: "god-card-bg border-yellow-500/50",
    description: "Ironman Run. Nessun salvataggio. Arma 2 usi. Cure -75%."
  },
  question: {
    label: "The Question",
    color: "text-cyan-400",
    bgClass: "bg-slate-950 border-cyan-500/40 stars-container",
    description: "Realtà instabile. Valori fluttuanti. Durabilità incerta."
  }
};

export const ACHIEVEMENTS: Record<string, Achievement> = {
  // 1. INTRO / ONBOARDING
  "FIRST_WIN": { id: "FIRST_WIN", name: "Battesimo del Sangue", desc: "Vinci la tua prima partita.", icon: "🩸", rarity: 'common', category: "intro", hidden: false },
  "FIRST_LOSS": { id: "FIRST_LOSS", name: "Lezione Amara", desc: "Perdi la tua prima partita.", icon: "💀", rarity: 'common', category: "intro", hidden: false },
  "PROFILE_MILESTONE": { id: "PROFILE_MILESTONE", name: "Identità Accertata", desc: "Crea il tuo primo profilo.", icon: "🆔", rarity: 'common', category: "intro", hidden: false },
  "FIRST_SAVE": { id: "FIRST_SAVE", name: "Memoria del Sangue", desc: "Effettua il tuo primo salvataggio.", icon: "💾", rarity: 'common', category: "intro", hidden: false },
  "FIRST_LOAD": { id: "FIRST_LOAD", name: "Ritorno dall'Abisso", desc: "Carica una partita salvata.", icon: "📂", rarity: 'common', category: "intro", hidden: false },
  "VAULT_VISITOR": { id: "VAULT_VISITOR", name: "Custode del Caveau", desc: "Apri il Vault per la prima volta.", icon: "🏛️", rarity: 'common', category: "intro", hidden: false },
  "NICKNAME_CHANGE": { id: "NICKNAME_CHANGE", name: "Nuovo Volto", desc: "Cambia il tuo nickname nel profilo.", icon: "🎭", rarity: 'common', category: "intro", hidden: false },
  "TUTORIAL_AWARE": { id: "TUTORIAL_AWARE", name: "Apprendista", desc: "Visualizza le regole del gioco.", icon: "📖", rarity: 'common', category: "intro", hidden: false },

  // 2. EARLY PROGRESSION
  "FIRST_ACHIEVEMENT": { id: "FIRST_ACHIEVEMENT", name: "Primo Passo", desc: "Sblocca il tuo primo obiettivo.", icon: "🎖️", rarity: 'common', category: "progression", hidden: false },
  "FIRST_SIGIL": { id: "FIRST_SIGIL", name: "Frammento d'Abisso", desc: "Ottieni il tuo primo Sigillo dell'Abisso.", icon: "💠", rarity: 'common', category: "progression", hidden: false },
  "SIGIL_COLLECTOR_10": { id: "SIGIL_COLLECTOR_10", name: "Raccoglitore", desc: "Possiedi 10 Sigilli contemporaneamente.", icon: "💰", rarity: 'common', category: "progression", hidden: false },
  "PROGRESS_5": { id: "PROGRESS_5", name: "In Cammino", desc: "Sblocca 5 obiettivi totali.", icon: "🥉", rarity: 'common', category: "progression", hidden: false },
  "PROGRESS_10": { id: "PROGRESS_10", name: "Riconosciuto", desc: "Sblocca 10 obiettivi totali.", icon: "🥈", rarity: 'common', category: "progression", hidden: false },
  "VAULT_EXPLORER": { id: "VAULT_EXPLORER", name: "Curiosità Insaziabile", desc: "Visita tutte le sezioni del Vault.", icon: "🔍", rarity: 'common', category: "progression", hidden: false },
  "ALTAR_VISITOR": { id: "ALTAR_VISITOR", name: "Ai Piedi dell'Altare", desc: "Apri la sezione Altare nel Vault.", icon: "🕯️", rarity: 'common', category: "progression", hidden: false },
  "BRANCH_START": { id: "BRANCH_START", name: "Scelta di Potere", desc: "Sblocca il primo nodo in due rami diversi dell'Altare.", icon: "🌿", rarity: 'common', category: "progression", hidden: false },

  // 3. COMBAT / SURVIVAL
  "LOW_HP_WIN": { id: "LOW_HP_WIN", name: "Sul Filo del Rasoio", desc: "Vinci una partita con 1 HP rimanente.", icon: "🩸", rarity: 'rare', category: "combat", hidden: false },
  "MONSTER_SLAYER": { id: "MONSTER_SLAYER", name: "Sterminatore", desc: "Sconfiggi 50 mostri in una singola partita.", icon: "⚔️", rarity: 'rare', category: "combat", hidden: false },
  "MINIMAL_HEAL": { id: "MINIMAL_HEAL", name: "Pelle Dura", desc: "Vinci una partita curandoti meno di 10 HP totali.", icon: "🛡️", rarity: 'epic', category: "combat", hidden: false },
  "MANY_RETREATS": { id: "MANY_RETREATS", name: "Vigliacco Sopravvissuto", desc: "Vinci una partita dopo aver usato la fuga 5+ volte.", icon: "🏃", rarity: 'rare', category: "combat", hidden: false },
  "DEEP_ROOMS": { id: "DEEP_ROOMS", name: "Esploratore del Profondo", desc: "Raggiungi la stanza 13.", icon: "🧭", rarity: 'common', category: "combat", hidden: false },
  "CLOSE_CALL": { id: "CLOSE_CALL", name: "Miracolato", desc: "Sopravvivi a un attacco che ti lascia esattamente a 1 HP.", icon: "🚑", rarity: 'rare', category: "combat", hidden: false },
  "OVERKILL": { id: "OVERKILL", name: "Eccesso di Zelo", desc: "Sconfiggi un mostro di valore 2 con un'arma di valore 14.", icon: "💥", rarity: 'common', category: "combat", hidden: false },
  "ENDURANCE": { id: "ENDURANCE", name: "Maratoneta dell'Abisso", desc: "Sopravvivi per 20 stanze in una singola spedizione.", icon: "🏃‍♂️", rarity: 'rare', category: "combat", hidden: false },
  "BOSS_CRUSHER": { id: "BOSS_CRUSHER", name: "Cacciatore di Re", desc: "Sconfiggi 5 mostri di valore 13+ in una singola partita.", icon: "👹", rarity: 'epic', category: "combat", hidden: false },
  "UNTOUCHABLE": { id: "UNTOUCHABLE", name: "Intoccabile", desc: "Completa 3 stanze consecutive senza subire danni.", icon: "✨", rarity: 'rare', category: "combat", hidden: false },
  "LAST_STAND": { id: "LAST_STAND", name: "Ultima Resistenza", desc: "Sconfiggi un mostro quando hai 1 HP e nessuna arma.", icon: "✊", rarity: 'epic', category: "combat", hidden: false },
  "BLOOD_BATH": { id: "BLOOD_BATH", name: "Bagno di Sangue", desc: "Sconfiggi 10 mostri di fila senza mai curarti.", icon: "🛁", rarity: 'epic', category: "combat", hidden: false },

  // 4. WEAPON MASTERY
  "MANY_WEAPONS": { id: "MANY_WEAPONS", name: "Arsenale Mobile", desc: "Equipaggia 10 armi diverse in una partita.", icon: "🗡️", rarity: 'rare', category: "weapon", hidden: false },
  "WEAPON_HEAVY": { id: "WEAPON_HEAVY", name: "Maestro di Scherma", desc: "Sconfiggi l'80% dei mostri usando un'arma.", icon: "🤺", rarity: 'rare', category: "weapon", hidden: false },
  "LOW_DURABILITY": { id: "LOW_DURABILITY", name: "All'Ultimo Respiro", desc: "Sconfiggi un mostro con l'ultimo uso di un'arma.", icon: "🔨", rarity: 'common', category: "weapon", hidden: false },
  "WEAPON_BREAK": { id: "WEAPON_BREAK", name: "Acciaio Infranto", desc: "Rompi 5 armi in una singola partita.", icon: "💔", rarity: 'common', category: "weapon", hidden: false },
  "BLADE_DANCE": { id: "BLADE_DANCE", name: "Danza delle Lame", desc: "Equipaggia 3 armi diverse in una singola stanza.", icon: "💃", rarity: 'rare', category: "weapon", hidden: false },
  "SHARP_EDGE": { id: "SHARP_EDGE", name: "Taglio Netto", desc: "Sconfiggi un mostro di valore 14 con un'arma di valore 14.", icon: "⚔️", rarity: 'rare', category: "weapon", hidden: false },
  "FRAGILE_VICTORY": { id: "FRAGILE_VICTORY", name: "Vittoria Fragile", desc: "Vinci una partita in cui si sono rotte 10+ armi.", icon: "💎", rarity: 'epic', category: "weapon", hidden: false },
  "RUSTED_HERO": { id: "RUSTED_HERO", name: "Eroe Arrugginito", desc: "Vinci usando solo armi di valore 5 o inferiore.", icon: "⛓️", rarity: 'epic', category: "weapon", hidden: false },
  "WEAPON_HOARDER": { id: "WEAPON_HOARDER", name: "Affezionato", desc: "Mantieni la stessa arma equipaggiata per 10 stanze.", icon: "🤝", rarity: 'rare', category: "weapon", hidden: false },
  "MASTER_SMITH": { id: "MASTER_SMITH", name: "Mastro Fabbro", desc: "Raggiungi la stanza 10 senza rompere alcuna arma.", icon: "⚒️", rarity: 'rare', category: "weapon", hidden: false },

  // 5. POTION / RESOURCE MANAGEMENT
  "NO_POTIONS": { id: "NO_POTIONS", name: "Ascetico", desc: "Vinci senza usare alcuna pozione.", icon: "🧪", rarity: 'epic', category: "potion", hidden: false },
  "MANY_POTIONS": { id: "MANY_POTIONS", name: "Alchimista", desc: "Usa 15+ pozioni in una singola partita.", icon: "⚗️", rarity: 'rare', category: "potion", hidden: false },
  "EFFICIENT_HEAL": { id: "EFFICIENT_HEAL", name: "Sanguisuga", desc: "Usa una pozione di valore 10+ quando hai meno di 5 HP.", icon: "💉", rarity: 'common', category: "potion", hidden: false },
  "SCARCE_RESOURCES": { id: "SCARCE_RESOURCES", name: "Sopravvissuto Estremo", desc: "Vinci una partita senza mai avere più di 5 HP per 5 stanze.", icon: "📉", rarity: 'epic', category: "potion", hidden: false },
  "OVERDOSE": { id: "OVERDOSE", name: "Sovradosaggio", desc: "Usa 3 pozioni in una singola stanza.", icon: "😵", rarity: 'common', category: "potion", hidden: false },
  "PURIST": { id: "PURIST", name: "Purista", desc: "Vinci senza mai superare i 15 HP massimi.", icon: "🧘", rarity: 'epic', category: "potion", hidden: false },
  "LIQUID_LUCK": { id: "LIQUID_LUCK", name: "Fortuna Liquida", desc: "Trova 2 pozioni nella stessa stanza.", icon: "🧪🧪", rarity: 'common', category: "potion", hidden: false },
  "WASTEFUL": { id: "WASTEFUL", name: "Sprecone", desc: "Usa una pozione quando sei già al massimo della vita.", icon: "🗑️", rarity: 'common', category: "potion", hidden: false },
  "SOBRIETY": { id: "SOBRIETY", name: "Sobrietà", desc: "Raggiungi la stanza 10 senza usare pozioni.", icon: "🚫", rarity: 'rare', category: "potion", hidden: false },
  "VITALITY_MAX": { id: "VITALITY_MAX", name: "Vigore Divino", desc: "Raggiungi 30+ HP durante una partita.", icon: "💖", rarity: 'rare', category: "potion", hidden: false },

  // 6. FLEE / CONTROL / TACTICS
  "NEVER_FLEE": { id: "NEVER_FLEE", name: "Incrollabile", desc: "Vinci senza mai usare la fuga.", icon: "🚩", rarity: 'rare', category: "flee", hidden: false },
  "FLEE_MANY": { id: "FLEE_MANY", name: "Ombra Sfuggente", desc: "Usa la fuga in ogni stanza possibile e sopravvivi.", icon: "👻", rarity: 'rare', category: "flee", hidden: false },
  "RECOVER_FLEE": { id: "RECOVER_FLEE", name: "Ritorno di Fiamma", desc: "Vinci dopo essere fuggito da una stanza con 1 HP.", icon: "🔥", rarity: 'rare', category: "flee", hidden: false },
  "TACTICAL_WAIT": { id: "TACTICAL_WAIT", name: "Pazienza del Ragno", desc: "Vinci una stanza senza usare l'arma equipaggiata.", icon: "🕷️", rarity: 'common', category: "flee", hidden: false },
  "CALCULATED_RISK": { id: "CALCULATED_RISK", name: "Rischio Calcolato", desc: "Fuggi da un mostro che ti avrebbe lasciato con 1 HP.", icon: "🧮", rarity: 'rare', category: "flee", hidden: false },
  "COWARD_KING": { id: "COWARD_KING", name: "Re dei Codardi", desc: "Usa la fuga 10 volte in una singola partita.", icon: "👑🏃", rarity: 'rare', category: "flee", hidden: false },
  "STALKER": { id: "STALKER", name: "Osservatore", desc: "Passa 3 turni in una stanza prima di compiere un'azione.", icon: "👁️‍🗨️", rarity: 'common', category: "flee", hidden: false },
  "NO_EXIT": { id: "NO_EXIT", name: "Senza Via d'Uscita", desc: "Completa la modalità Hard senza mai fuggire.", icon: "🚪🚫", rarity: 'rare', category: "flee", hidden: false },

  // 7. DIFFICULTY MILESTONES
  "NORMAL_WIN": { id: "NORMAL_WIN", name: "Scoundrel", desc: "Vinci in modalità Normale.", icon: "🃏", rarity: 'common', category: "difficulty", hidden: false },
  "HARD_WIN": { id: "HARD_WIN", name: "Veterano", desc: "Vinci in modalità Hard.", icon: "⚔️", rarity: 'rare', category: "difficulty", hidden: false },
  "INFERNO_WIN": { id: "INFERNO_WIN", name: "Eroe Infernale", desc: "Vinci in modalità Inferno.", icon: "🔥", rarity: 'epic', category: "difficulty", hidden: false },
  "GOD_WIN": { id: "GOD_WIN", name: "Ascendente", desc: "Completa la modalità GOD.", icon: "👑", rarity: 'god', category: "difficulty", hidden: false },
  "QUESTION_WIN": { id: "QUESTION_WIN", name: "Oltre la Realtà", desc: "Vinci in modalità The Question.", icon: "❓", rarity: 'god', category: "difficulty", hidden: false },
  "NORMAL_MASTER": { id: "NORMAL_MASTER", name: "Signore del Mazzo", desc: "Vinci 10 partite in modalità Normale.", icon: "🎴", rarity: 'rare', category: "difficulty", hidden: false },
  "HARD_MASTER": { id: "HARD_MASTER", name: "Tempra d'Acciaio", desc: "Vinci 5 partite in modalità Hard.", icon: "🛡️", rarity: 'epic', category: "difficulty", hidden: false },
  "INFERNO_MASTER": { id: "INFERNO_MASTER", name: "Dominatore delle Fiamme", desc: "Vinci 3 partite in modalità Inferno.", icon: "🌋", rarity: 'god', category: "difficulty", hidden: false },
  "PARADOX_SURVIVOR": { id: "PARADOX_SURVIVOR", name: "Superstite del Paradosso", desc: "Vinci una partita Paradox con 5+ shift attivi.", icon: "🌀", rarity: 'god', category: "difficulty", hidden: false },
  "DIFFICULTY_JUMPER": { id: "DIFFICULTY_JUMPER", name: "Salto nel Buio", desc: "Vinci una partita Hard subito dopo una Normale.", icon: "🦘", rarity: 'rare', category: "difficulty", hidden: false },

  // 8. RUN QUALITY / STYLE
  "FLAWLESS_RUN": { id: "FLAWLESS_RUN", name: "Immacolato", desc: "Vinci una partita senza mai perdere HP.", icon: "💎", rarity: 'god', category: "style", hidden: false },
  "BRUTAL_WIN": { id: "BRUTAL_WIN", name: "Vittoria Brutale", desc: "Vinci sconfiggendo ogni singolo mostro incontrato.", icon: "👊", rarity: 'epic', category: "style", hidden: false },
  "RECKLESS_ABANDON": { id: "RECKLESS_ABANDON", name: "Follia Temeraria", desc: "Vinci senza mai equipaggiare un'arma.", icon: "🧠🚫", rarity: 'god', category: "style", hidden: false },
  "DISCIPLINED": { id: "DISCIPLINED", name: "Disciplinato", desc: "Vinci attaccando mostri solo quando strettamente necessario.", icon: "🧘‍♂️", rarity: 'epic', category: "style", hidden: false },
  "COMEBACK_KID": { id: "COMEBACK_KID", name: "Ritorno dall'Orlo", desc: "Vinci dopo essere sceso a 1 HP prima della stanza 5.", icon: "📈", rarity: 'epic', category: "style", hidden: false },
  "SPEEDRUNNER": { id: "SPEEDRUNNER", name: "Fulmine nell'Abisso", desc: "Vinci una partita in meno di 5 minuti.", icon: "⚡", rarity: 'rare', category: "style", hidden: false },
  "PACIFIST_ISH": { id: "PACIFIST_ISH", name: "Quasi Pacifico", desc: "Vinci sconfiggendo meno di 10 mostri in totale.", icon: "🕊️", rarity: 'epic', category: "style", hidden: false },
  "WEAPONLESS_ROOM": { id: "WEAPONLESS_ROOM", name: "Coraggio Nudo", desc: "Pulisci una stanza con 2+ mostri senza usare armi.", icon: "🥋", rarity: 'rare', category: "style", hidden: false },
  "POTIONLESS_ROOM": { id: "POTIONLESS_ROOM", name: "Astinenza", desc: "Pulisci una stanza con 2+ pozioni senza berne alcuna.", icon: "🚱", rarity: 'common', category: "style", hidden: false },
  "PERFECTIONIST": { id: "PERFECTIONIST", name: "Perfezionista", desc: "Vinci con HP massimi e un'arma integra.", icon: "💯", rarity: 'god', category: "style", hidden: false },

  // 9. STREAK / CONSISTENCY
  "TRIPLE_WIN": { id: "TRIPLE_WIN", name: "Costanza Letale", desc: "Vinci 3 partite consecutive.", icon: "🎯", rarity: 'rare', category: "streak", hidden: false },
  "STREAK_5": { id: "STREAK_5", name: "Inarrestabile", desc: "Vinci 5 partite consecutive.", icon: "⚡", rarity: 'epic', category: "streak", hidden: false },
  "REPEATED_GOD": { id: "REPEATED_GOD", name: "Divinità Stabile", desc: "Vinci 3 volte in modalità GOD.", icon: "☀️", rarity: 'god', category: "streak", hidden: false },
  "INFERNO_STREAK": { id: "INFERNO_STREAK", name: "Dominatore del Fuoco", desc: "Vinci 2 volte consecutive in modalità Inferno.", icon: "🌋", rarity: 'god', category: "streak", hidden: false },
  "UNSTOPPABLE_FORCE": { id: "UNSTOPPABLE_FORCE", name: "Forza Inarrestabile", desc: "Raggiungi un totale di 10 vittorie complessive.", icon: "🚜", rarity: 'rare', category: "streak", hidden: false },
  "ETERNAL_LEGEND": { id: "ETERNAL_LEGEND", name: "Leggenda Eterna", desc: "Raggiungi un totale di 50 vittorie complessive.", icon: "📜", rarity: 'epic', category: "streak", hidden: false },
  "CONSISTENT_HERO": { id: "CONSISTENT_HERO", name: "Eroe Affidabile", desc: "Vinci 3 partite di fila a difficoltà Hard o superiore.", icon: "🎖️", rarity: 'epic', category: "streak", hidden: false },
  "GOD_STREAK": { id: "GOD_STREAK", name: "Scia Divina", desc: "Vinci 2 partite consecutive in modalità GOD.", icon: "👑👑", rarity: 'god', category: "streak", hidden: false },

  // 10. HALL / CHRONICLE / LEGACY
  "HALL_ENTRY": { id: "HALL_ENTRY", name: "Leggenda Immortale", desc: "Entra nell'Eternal Hall per la prima volta.", icon: "🏛️", rarity: 'rare', category: "meta", hidden: false },
  "PARADOX_UNLOCKED": { id: "PARADOX_UNLOCKED", name: "Occhio del Paradosso", desc: "Sblocca la modalità Paradox.", icon: "👁️", rarity: 'epic', category: "meta", hidden: false },
  "WORLD_SHIFT_ACTIVE": { id: "WORLD_SHIFT_ACTIVE", name: "Tessitore di Mondi", desc: "Vinci con 3+ World Shift attivi.", icon: "🌀", rarity: 'rare', category: "meta", hidden: false },
  "CHRONICLE_IMPORT": { id: "CHRONICLE_IMPORT", name: "Eco dal Passato", desc: "Importa una cronaca da un altro mondo.", icon: "📜", rarity: 'common', category: "meta", hidden: false },
  "LEGACY_BUILDER": { id: "LEGACY_BUILDER", name: "Costruttore di Eredità", desc: "Colleziona 10 voci nell'Eternal Hall.", icon: "📚", rarity: 'epic', category: "meta", hidden: false },
  "SHIFT_MASTER": { id: "SHIFT_MASTER", name: "Signore del Mutamento", desc: "Vinci con tutti i World Shift possibili attivi contemporaneamente.", icon: "🌌", rarity: 'god', category: "meta", hidden: false },
  "CHRONICLE_WRITER": { id: "CHRONICLE_WRITER", name: "Scriba dell'Abisso", desc: "Esporta la tua prima Cronaca.", icon: "✍️", rarity: 'common', category: "meta", hidden: false },
  "ANCIENT_ECHO": { id: "ANCIENT_ECHO", name: "Eco Antica", desc: "Importa una Cronaca con rango 'S'.", icon: "🔱", rarity: 'rare', category: "meta", hidden: false },

  // 11. ALTAR / META PROGRESSION
  "ALTAR_FIRST": { id: "ALTAR_FIRST", name: "Primo Sacrificio", desc: "Sblocca il tuo primo nodo nell'Altare.", icon: "🕯️", rarity: 'common', category: "altar", hidden: false },
  "ALTAR_BRANCH_FULL": { id: "ALTAR_BRANCH_FULL", name: "Maestro di un Ramo", desc: "Sblocca tutti i nodi di un singolo ramo.", icon: "📜", rarity: 'rare', category: "altar", hidden: false },
  "ALTAR_ALL_FULL": { id: "ALTAR_ALL_FULL", name: "Onniscienza Oscura", desc: "Sblocca tutti i nodi dell'Altare.", icon: "🌌", rarity: 'god', category: "altar", hidden: false },
  "SPEND_SIGILS_50": { id: "SPEND_SIGILS_50", name: "Generosità Abissale", desc: "Spendi un totale di 50 Sigilli dell'Abisso.", icon: "💰", rarity: 'epic', category: "altar", hidden: false },
  "COLLECT_SIGILS_100": { id: "COLLECT_SIGILS_100", name: "Accumulatore di Anime", desc: "Possiedi 100 Sigilli contemporaneamente.", icon: "💎", rarity: 'god', category: "altar", hidden: false },
  "SIGIL_HOARDER": { id: "SIGIL_HOARDER", name: "Tesoro dell'Abisso", desc: "Accumula un totale di 200 Sigilli posseduti.", icon: "🏦", rarity: 'god', category: "altar", hidden: false },
  "ALTAR_DIVERSITY": { id: "ALTAR_DIVERSITY", name: "Poliedrico", desc: "Sblocca almeno un nodo in ogni ramo dell'Altare.", icon: "🌈", rarity: 'rare', category: "altar", hidden: false },
  "SACRIFICIAL_LAMB": { id: "SACRIFICIAL_LAMB", name: "Agnello Sacrificale", desc: "Spendi 20 Sigilli in una singola sessione all'Altare.", icon: "🐑", rarity: 'rare', category: "altar", hidden: false },

  // 12. SECRET / HIDDEN / DISCOVERY
  "SECRET_42": { id: "SECRET_42", name: "La Risposta", desc: "Hai trovato la risposta a tutto.", icon: "🌌", rarity: 'epic', category: "secret", hidden: true },
  "WEIRD_LUCK": { id: "WEIRD_LUCK", name: "Baciato dalla Sorte", desc: "Trova 3 Assi nella stessa stanza.", icon: "🍀", rarity: 'rare', category: "secret", hidden: true },
  "FULL_ROOM_MONSTERS": { id: "FULL_ROOM_MONSTERS", name: "Circondato", desc: "Entra in una stanza con 4 mostri.", icon: "👹", rarity: 'common', category: "secret", hidden: true },
  "EMPTY_HANDS": { id: "EMPTY_HANDS", name: "A Mani Nude", desc: "Sconfiggi un mostro di valore 10+ senza arma.", icon: "👊", rarity: 'epic', category: "secret", hidden: true },
  "ABYSS_GAZER": { id: "ABYSS_GAZER", name: "Sguardo nell'Abisso", desc: "Resta nel menu principale per 5 minuti consecutivi.", icon: "👁️", rarity: 'common', category: "secret", hidden: true },
  "CLICK_MANIAC": { id: "CLICK_MANIAC", name: "Tic Nervoso", desc: "Clicca sull'avatar del tuo eroe 50 volte.", icon: "🖱️", rarity: 'common', category: "secret", hidden: true },
  "DEVELOPER_THANKS": { id: "DEVELOPER_THANKS", name: "Riconoscenza", desc: "Trova i crediti nascosti del gioco.", icon: "🙏", rarity: 'rare', category: "secret", hidden: true },
  "PARADOX_LOST": { id: "PARADOX_LOST", name: "Paradosso Perduto", desc: "Perdi una partita Paradox nella primissima stanza.", icon: "📉", rarity: 'common', category: "secret", hidden: true },
  "OVERSTACK": { id: "OVERSTACK", name: "Spreco Vitale", desc: "Tenta di curarti quando sei già al massimo della vita.", icon: "💊", rarity: 'common', category: "secret", hidden: true },
  "BROKEN_DREAM": { id: "BROKEN_DREAM", name: "Sogno Infranto", desc: "Subisci la rottura di un'arma contro l'ultimo mostro della partita.", icon: "💔", rarity: 'rare', category: "secret", hidden: true },
};

export const SIGIL_REWARDS: Record<string, number> = {
  common: 1,
  rare: 2,
  epic: 4,
  god: 7
};

export const ALTAR_NODES: AltarNode[] = [
  // BLOOD BRANCH
  { id: 'blood_1', name: 'Sete di Vita', description: 'Le pozioni curano +1 HP addizionale.', branch: 'blood', cost: 2, tier: 1, requires: null, type: 'passive', effectId: 'heal_plus_1' },
  { id: 'blood_2', name: 'Sangue Freddo', description: 'Inizi con +2 HP massimi.', branch: 'blood', cost: 5, tier: 2, requires: 'blood_1', type: 'passive', effectId: 'max_hp_plus_2' },
  { id: 'blood_3', name: 'Patto Oscuro', description: 'Recuperi 1 HP ogni volta che sconfiggi un mostro di valore 10+.', branch: 'blood', cost: 10, tier: 3, requires: 'blood_2', type: 'passive', effectId: 'kill_heal' },
  
  // STEEL BRANCH
  { id: 'steel_1', name: 'Affilatura', description: 'Le armi hanno +1 valore di attacco base.', branch: 'steel', cost: 2, tier: 1, requires: null, type: 'passive', effectId: 'atk_plus_1' },
  { id: 'steel_2', name: 'Tempra', description: 'Le armi hanno +1 durabilità (se applicabile).', branch: 'steel', cost: 5, tier: 2, requires: 'steel_1', type: 'passive', effectId: 'durability_plus_1' },
  { id: 'steel_3', name: 'Maestria d\'Armi', description: 'Puoi attaccare mostri di valore pari alla tua arma senza perdere durabilità (15% chance).', branch: 'steel', cost: 10, tier: 3, requires: 'steel_2', type: 'passive', effectId: 'save_durability' },
  
  // SHADOW BRANCH
  { id: 'shadow_1', name: 'Passo Silenzioso', description: 'La fuga costa -1 HP (minimo 0).', branch: 'shadow', cost: 2, tier: 1, requires: null, type: 'passive', effectId: 'flee_cost_minus_1' },
  { id: 'shadow_2', name: 'Sesto Senso', description: 'Vedi il valore della prima carta del mazzo.', branch: 'shadow', cost: 5, tier: 2, requires: 'shadow_1', type: 'passive', effectId: 'scry_1' },
  { id: 'shadow_3', name: 'Ombra Sfuggente', description: 'Una volta per partita, puoi resettare la stanza corrente.', branch: 'shadow', cost: 10, tier: 3, requires: 'shadow_2', type: 'active', effectId: 'reset_room' },
];

export const HERO_CLASSES = ["Guerriero", "Ladro", "Mago", "Paladino"];
export const AVATARS = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Buddy",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Casper",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Milo"
];

export const isRedSuit = (suit: Suit) => suit === "Cuori" || suit === "Quadri";
export const getBackgroundByRoom = (index: number): string => "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop";
export const SUITS: Suit[] = ["Cuori", "Quadri", "Fiori", "Picche"];
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export const getCardValue = (rank: string): number => {
  const values: Record<string, number> = { "J": 11, "Q": 12, "K": 13, "A": 14 };
  return values[rank] || parseInt(rank);
};

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      if (!isRedSuit(suit) || !["J", "Q", "K", "A"].includes(rank)) {
        deck.push({
          id: `${suit}-${rank}-${Math.random().toString(36).substring(2, 9)}`,
          suit, rank, value: getCardValue(rank)
        });
      }
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

export const getSuitIcon = (suit: Suit) => {
  const icons = { "Cuori": "♥️", "Quadri": "♦️", "Fiori": "♣️", "Picche": "♠️" };
  return icons[suit];
};

export const getCardType = (suit: Suit) => {
  if (suit === "Cuori") return "potion";
  if (suit === "Quadri") return "weapon";
  return "monster";
};

export const generatePixelArtSVG = (type: string, value: number, isBroken: boolean = false): string => {
  const size = 16; 
  const pixels: { x: number, y: number, color: string }[] = [];
  const addPixel = (x: number, y: number, color: string) => pixels.push({ x, y, color });
  const addSymmetric = (x: number, y: number, color: string) => {
    addPixel(x, y, color);
    if (x !== 7 && x !== 8) addPixel(size - 1 - x, y, color);
  };

  if (type === "monster") {
    const mainColor = value > 10 ? "#ef4444" : "#4338ca"; 
    for (let y = 4; y <= 12; y++) {
      let width = y < 6 ? 2 : 4;
      for (let x = 8 - width; x <= 7; x++) addSymmetric(x, y, mainColor);
    }
  } else if (type === "weapon") {
    const bladeColor = isBroken ? "#475569" : "#cbd5e1";
    for (let y = 2; y <= 11; y++) addPixel(7, y, bladeColor);
    for (let x = 6; x <= 9; x++) addPixel(x, 12, "#d97706");
  } else if (type === "potion") {
    const liqColor = value > 10 ? "#ec4899" : "#10b981";
    for (let y = 6; y <= 14; y++) {
       for (let x = 6; x <= 9; x++) addPixel(x, y, liqColor);
    }
  }

  const rects = pixels.map(p => `<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" />`).join("");
  return `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${rects}</svg>`;
};
