
/**
 * SCOPO DEL FILE: Engine Logico Legacy (Vanilla JS).
 * RESPONSABILITÀ: Gestione stato, rendering DOM manuale e meccaniche di gioco originali.
 * DIPENDENZE: Nessuna (Self-contained).
 * IMPATTO: Questo file contiene la logica di riferimento per le meccaniche di Scoundrel.
 * 
 * NOTE DI MANUTENZIONE: 
 * Questo modulo utilizza il rendering imperativo. Ogni modifica allo stato richiede 
 * una chiamata esplicita alle funzioni di render (renderRoom, updateHUD).
 */

// --- CONFIG & CONSTANTS ---
const INITIAL_HEALTH = 20;
const POTION_HEAL_BASE = 7;
const STATS_KEY = "scoundrel_stats_v1";
const SUITS = ["Cuori", "Quadri", "Fiori", "Picche"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

// --- VISUAL FEEDBACK ENGINE ---
/**
 * Genera un effetto visivo di esplosione/onda d'urto nel punto di impatto.
 */
function triggerExplosion(color = "#ef4444") {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 pointer-events-none z-[1000] flex items-center justify-center';
  overlay.innerHTML = `<div class="shockwave" style="border-color: ${color}; width: 100px; height: 100px; border-width: 4px; border-style: solid; border-radius: 50%; animation: shockwave-animate 0.8s ease-out forwards;"></div>`;
  document.body.appendChild(overlay);
  
  if (!document.getElementById('shockwave-style')) {
    const style = document.createElement('style');
    style.id = 'shockwave-style';
    style.innerHTML = `
      @keyframes shockwave-animate {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => overlay.remove(), 800);
}

// --- PIXEL ART ENGINE ---
/**
 * Genera grafiche procedurali in formato SVG.
 * @param {string} type - Tipo di entità (monster, weapon, potion).
 * @param {number} value - Forza/Valore dell'entità.
 */
function generatePixelArtSVG(type, value) {
  const pixels = [];
  const size = 16;
  
  const stringSeed = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (stringSeed + value) * 1337;
  const seededRandom = (s) => {
    const x = Math.sin(seed + s) * 10000;
    return x - Math.floor(x);
  };

  const addPixel = (x, y, color) => pixels.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />`);
  const addSymmetric = (x, y, color) => {
    addPixel(x, y, color);
    if (x !== 7 && x !== 8) addPixel(size - 1 - x, y, color);
  };

  // Logica di disegno specifica per categoria
  if (type === "monster") {
    const bodyColor = value > 10 ? "#ef4444" : "#6366f1";
    const eyeColor = "#ffffff";
    const accentColor = value > 12 ? "#facc15" : "#4338ca";

    for (let y = 4; y <= 12; y++) {
      let width = (y < 6) ? 2 : (y > 10) ? 3 : 5;
      for (let x = 8 - width; x <= 7; x++) {
        let color = (x+y) % 3 === 0 ? accentColor : bodyColor;
        if (seededRandom(x * y) > 0.9) color = color + "aa"; 
        addSymmetric(x, y, color);
      }
    }
    addSymmetric(5, 7, eyeColor);
    if (value > 7) addSymmetric(4, 7, eyeColor);
  } else if (type === "weapon") {
    const bladeColor = "#cbd5e1";
    const hiltColor = "#d97706";
    const gemColor = value > 10 ? "#3b82f6" : "#b91c1c";

    const bladeLen = Math.min(10, 3 + Math.floor(value / 1.5));
    const startY = 11 - bladeLen;
    for (let y = startY; y <= 11; y++) {
      addPixel(7, y, bladeColor);
      addPixel(8, y, "#94a3b8");
    }
    const guardW = value > 8 ? 3 : 2;
    for (let x = 8 - guardW; x <= 7 + guardW; x++) addPixel(x, 12, hiltColor);
    addPixel(7, 14, gemColor);
  } else if (type === "potion") {
    const glassColor = "#93c5fd";
    const liqColor = value > 10 ? "#ec4899" : "#10b981";
    const fillH = Math.floor((value / 14) * 8) + 1;
    for (let y = 6; y <= 14; y++) {
      let w = (y < 8) ? 2 : (y > 12) ? 3 : 4;
      for (let x = 8 - w; x <= 7 + w; x++) {
        const isLiquid = y > (14 - fillH);
        addPixel(x, y, isLiquid ? liqColor : "#1e293b");
      }
    }
  }

  return `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      ${pixels.join('')}
    </svg>
  `;
}

// --- GAME STATE ---
let gameState = {
  status: "start",
  mode: "normal",
  health: INITIAL_HEALTH,
  maxHealth: INITIAL_HEALTH,
  potions: 3,
  equippedWeapon: null,
  deck: [],
  room: [],
  selectedCardId: null,
  fleeAvailable: true,
  roomIndex: 0,
  enemiesDefeated: 0
};

// --- RENDER CORE ---
/**
 * Cicla le carte nella stanza e genera gli elementi DOM.
 * Gestisce l'aggiornamento dei listener di interazione.
 */
function renderRoom() {
  const container = document.getElementById("room-container");
  if (!container) return;
  container.innerHTML = "";
  
  gameState.room.forEach((card, index) => {
    const cardEl = document.createElement("div");
    const type = getCardType(card.suit);
    const value = card.value;
    const isSelected = gameState.selectedCardId === card.id;

    // Gestione classi CSS basate sullo stato
    let rarityClass = value >= 13 ? "glow-strong" : (value >= 10 ? "glow-medium" : "glow-soft");
    cardEl.className = `card card-${type} ${rarityClass} card-entry ${isSelected ? 'selected pulse-glow' : ''}`;
    cardEl.style.animationDelay = `${index * 0.1}s`;

    const isRed = card.suit === "Cuori" || card.suit === "Quadri";
    const suitIcon = getSuitIcon(card.suit);

    cardEl.innerHTML = `
      <div class="card-top ${isRed ? 'card-red' : ''}">
        <span>${card.rank}</span>
        <span>${suitIcon}</span>
      </div>
      <div class="card-art" aria-hidden="true">${generatePixelArtSVG(type, value)}</div>
      <div class="flex flex-col items-center gap-1">
        <div class="card-info-overlay">${getCardTypeLabel(card.suit)}</div>
        <div class="card-value-display">${value}</div>
      </div>
      <div class="card-bottom rotate-180 ${isRed ? 'card-red' : ''}">
        <span>${card.rank}</span>
        <span>${suitIcon}</span>
      </div>
    `;

    /**
     * EVENT LISTENER: Gestione Selezione Carta
     * LOGICA: Implementa il pattern 'Toggle'. 
     * Se la carta è già selezionata, viene deselezionata (null).
     * Altrimenti, diventa la nuova carta selezionata.
     */
    cardEl.addEventListener("click", () => {
      // Cambio di stato atomico
      const isAlreadySelected = gameState.selectedCardId === card.id;
      gameState.selectedCardId = isAlreadySelected ? null : card.id;
      
      // In Vanilla JS dobbiamo notificare manualmente gli altri componenti della UI
      renderRoom(); // Aggiorna le classi CSS delle carte
      updateHUD();  // Aggiorna il pannello informativo
    });

    container.appendChild(cardEl);
  });
}

function getCardType(suit) {
  if (suit === "Cuori") return "potion";
  if (suit === "Quadri") return "weapon";
  return "monster";
}

function getCardTypeLabel(suit) {
  const type = getCardType(suit);
  return type === "potion" ? "Pozione" : type === "weapon" ? "Arma" : "Mostro";
}

function getSuitIcon(suit) {
  switch(suit) {
    case "Cuori": return "♥️";
    case "Quadri": return "♦️";
    case "Fiori": return "♣️";
    case "Picche": return "♠️";
  }
}

/**
 * Sincronizza lo stato di gioco con gli elementi HUD del DOM.
 */
function updateHUD() {
  const bar = document.getElementById("health-bar");
  const hpText = document.getElementById("health-text");
  if (bar && hpText) {
    const pct = (gameState.health / gameState.maxHealth) * 100;
    bar.style.width = `${pct}%`;
    hpText.innerText = `${gameState.health}/${gameState.maxHealth}`;
  }

  const targetBox = document.getElementById("target-value");
  if (targetBox) {
    const selected = gameState.room.find(c => c.id === gameState.selectedCardId);
    if (selected) {
      targetBox.innerText = `${getSuitIcon(selected.suit)}${selected.rank} (Val: ${selected.value})`;
      targetBox.classList.add("text-emerald");
    } else {
      targetBox.innerText = "Nessuna selezione";
      targetBox.classList.remove("text-emerald");
    }
  }
}

// ... Resto della logica (Inizializzazione, Combattimento, etc.) ...
function initGame() { bindEvents(); }

function bindEvents() {
  const startBtn = document.getElementById("btn-start");
  if (startBtn) startBtn.addEventListener("click", () => startNewGame("normal"));
  
  const actionUnarmed = document.getElementById("action-unarmed");
  if (actionUnarmed) actionUnarmed.addEventListener("click", () => handleAction("unarmed"));

  const actionWeapon = document.getElementById("action-weapon");
  if (actionWeapon) actionWeapon.addEventListener("click", () => handleAction("weapon"));

  const actionPotion = document.getElementById("action-potion");
  if (actionPotion) actionPotion.addEventListener("click", () => handleAction("potion"));

  const actionFlee = document.getElementById("action-flee");
  if (actionFlee) actionFlee.addEventListener("click", () => handleAction("flee"));
}

function startNewGame(mode) {
  gameState.status = "playing";
  gameState.health = INITIAL_HEALTH;
  gameState.deck = createDeck();
  drawRoom();
  updateHUD();
}

function createDeck() {
  const deck = [];
  SUITS.forEach(s => {
    RANKS.forEach(r => {
      if (!((s === "Cuori" || s === "Quadri") && ["J", "Q", "K", "A"].includes(r))) {
        deck.push({ id: Math.random().toString(36), suit: s, rank: r, value: getCardValue(r) });
      }
    });
  });
  return shuffle(deck);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getCardValue(r) {
  if (r === "A") return 14;
  if (r === "K") return 13;
  if (r === "Q") return 12;
  if (r === "J") return 11;
  return parseInt(r);
}

function drawRoom() {
  gameState.room = gameState.deck.splice(0, 4);
  gameState.roomIndex++;
  gameState.selectedCardId = null;
  renderRoom();
}

function handleAction(type) {
  const selected = gameState.room.find(c => c.id === gameState.selectedCardId);
  if (!selected && type !== "potion") return;
  // ... Logica di azione ...
}

window.onload = initGame;
