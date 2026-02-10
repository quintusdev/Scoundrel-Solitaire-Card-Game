
/**
 * SCOUNDREL - Pixel Art Edition
 */

// --- CONFIG & CONSTANTS ---
const INITIAL_HEALTH = 20;
const POTION_HEAL_BASE = 7;
const STATS_KEY = "scoundrel_stats_v1";
const SUITS = ["Cuori", "Quadri", "Fiori", "Picche"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

// --- VISUAL FEEDBACK ENGINE ---
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
function generatePixelArtSVG(type, value) {
  const pixels = [];
  const size = 16;
  
  // Seed deterministico
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

  if (type === "monster") {
    const bodyColor = value > 10 ? "#ef4444" : "#6366f1";
    const eyeColor = "#ffffff";
    const accentColor = value > 12 ? "#facc15" : "#4338ca";

    for (let y = 4; y <= 12; y++) {
      let width = (y < 6) ? 2 : (y > 10) ? 3 : 5;
      for (let x = 8 - width; x <= 7; x++) {
        let color = (x+y) % 3 === 0 ? accentColor : bodyColor;
        if (seededRandom(x * y) > 0.9) color = color + "aa"; // Texture glitch
        addSymmetric(x, y, color);
      }
    }
    addSymmetric(5, 7, eyeColor);
    if (value > 7) addSymmetric(4, 7, eyeColor);
    if (value > 5) addSymmetric(3, 3, accentColor);
    if (value > 9) addSymmetric(2, 2, accentColor);
    if (value > 12) addSymmetric(4, 2, "#ffffff");

  } else if (type === "weapon") {
    const bladeColor = "#cbd5e1";
    const hiltColor = "#d97706";
    const gemColor = value > 10 ? "#3b82f6" : "#b91c1c";

    const bladeLen = Math.min(10, 3 + Math.floor(value / 1.5));
    const startY = 11 - bladeLen;
    for (let y = startY; y <= 11; y++) {
      let bCol = seededRandom(y) > 0.8 ? "#ffffff" : bladeColor;
      addPixel(7, y, bCol);
      addPixel(8, y, "#94a3b8");
    }
    const guardW = value > 8 ? 3 : 2;
    for (let x = 8 - guardW; x <= 7 + guardW; x++) addPixel(x, 12, hiltColor);
    addPixel(7, 13, "#451a03");
    addPixel(8, 13, "#451a03");
    addPixel(7, 14, gemColor);
    addPixel(8, 14, gemColor);

  } else if (type === "potion") {
    const glassColor = "#93c5fd";
    const liqColor = value > 10 ? "#ec4899" : "#10b981";
    
    const fillH = Math.floor((value / 14) * 8) + 1;
    for (let y = 6; y <= 14; y++) {
      let w = (y < 8) ? 2 : (y > 12) ? 3 : 4;
      for (let x = 8 - w; x <= 7 + w; x++) {
        const isLiquid = y > (14 - fillH);
        const isEdge = x === 8 - w || x === 7 + w || y === 14;
        let color = isEdge ? glassColor : (isLiquid ? liqColor : "#1e293b");
        if (isLiquid && seededRandom(x + y * 5) > 0.92) color = "#ffffff";
        addPixel(x, y, color);
      }
    }
    addPixel(7, 5, glassColor); addPixel(8, 5, glassColor);
    addPixel(7, 4, "#78350f"); addPixel(8, 4, "#78350f");
  }

  // Artefatti glitch extra
  const artifactCount = 2 + Math.floor(value / 4);
  for (let i = 0; i < artifactCount; i++) {
    const rX = Math.floor(seededRandom(i * 10) * 16);
    const rY = Math.floor(seededRandom(i * 20) * 16);
    addPixel(rX, rY, "#ffffff11");
  }

  const pips = value <= 5 ? 1 : value <= 9 ? 2 : value <= 12 ? 3 : 4;
  for (let i = 0; i < pips; i++) {
    addPixel(2 + i*2, 1, value > 12 ? "#facc15" : "#ffffff");
  }

  return `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      ${pixels.join('')}
    </svg>
  `;
}

// --- GAME STATE & LOGIC ---
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
function renderRoom() {
  const container = document.getElementById("room-container");
  if (!container) return;
  container.innerHTML = "";
  
  gameState.room.forEach((card, index) => {
    const cardEl = document.createElement("div");
    const type = getCardType(card.suit);
    const value = card.value;
    
    let rarityClass = "";
    if (value >= 13) rarityClass = "glow-strong";
    else if (value >= 10) rarityClass = "glow-medium";
    else if (value >= 6) rarityClass = "glow-soft";

    // Aggiunta la classe card-entry per l'animazione vanilla
    cardEl.className = `card card-${type} ${rarityClass} card-entry ${gameState.selectedCardId === card.id ? 'selected' : ''}`;
    
    // Impostazione del ritardo basato sull'indice per l'effetto a cascata
    cardEl.style.animationDelay = `${index * 0.1}s`;

    const isRed = card.suit === "Cuori" || card.suit === "Quadri";
    const suitIcon = getSuitIcon(card.suit);

    cardEl.innerHTML = `
      <div class="card-top ${isRed ? 'card-red' : ''}">
        <span>${card.rank}</span>
        <span>${suitIcon}</span>
      </div>
      
      <div class="card-art" aria-hidden="true">
        ${generatePixelArtSVG(type, value)}
      </div>

      <div class="flex flex-col items-center gap-1">
        <div class="card-info-overlay">${getCardTypeLabel(card.suit)}</div>
        <div class="card-value-display">${value}</div>
      </div>

      <div class="card-bottom rotate-180 ${isRed ? 'card-red' : ''}">
        <span>${card.rank}</span>
        <span>${suitIcon}</span>
      </div>
    `;

    cardEl.addEventListener("click", () => {
      gameState.selectedCardId = gameState.selectedCardId === card.id ? null : card.id;
      renderRoom();
      updateHUD();
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

function updateHUD() {
  const bar = document.getElementById("health-bar");
  const hpText = document.getElementById("health-text");
  if (!bar || !hpText) return;

  const pct = (gameState.health / gameState.maxHealth) * 100;
  bar.style.width = `${pct}%`;
  hpText.innerText = `${gameState.health}/${gameState.maxHealth}`;

  const weaponText = document.getElementById("weapon-text");
  if (weaponText) {
    weaponText.innerText = gameState.equippedWeapon 
      ? `${getSuitIcon(gameState.equippedWeapon.suit)}${gameState.equippedWeapon.rank} (${gameState.equippedWeapon.value})`
      : "Nuda";
  }
  
  const potionsText = document.getElementById("potions-text");
  if (potionsText) potionsText.innerText = `🧪 ${gameState.potions}`;

  const roomText = document.getElementById("room-text");
  if (roomText) roomText.innerText = gameState.roomIndex;

  const deckText = document.getElementById("deck-text");
  if (deckText) deckText.innerText = gameState.deck.length;

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

  const fleeBtn = document.getElementById("action-flee");
  if (fleeBtn) fleeBtn.disabled = !gameState.fleeAvailable || gameState.room.length < 2;
}

const statsManager = {
  load() {},
  save() {},
  startSession() {},
  record() {},
  endSession() { return { enemiesDefeated: 0, roomsReached: 0, damageTaken: 0, duration: 0 }; },
  updateUI() {}
};

function initGame() {
  statsManager.load();
  bindEvents();
}

function bindEvents() {
  const startBtn = document.getElementById("btn-start");
  if (startBtn) startBtn.addEventListener("click", () => {
    const checkedMode = document.querySelector('input[name="gameMode"]:checked');
    const mode = checkedMode ? checkedMode.value : "normal";
    startNewGame(mode);
  });
  
  const actionUnarmed = document.getElementById("action-unarmed");
  if (actionUnarmed) actionUnarmed.addEventListener("click", () => handleAction("unarmed"));

  const actionWeapon = document.getElementById("action-weapon");
  if (actionWeapon) actionWeapon.addEventListener("click", () => handleAction("weapon"));

  const actionPotion = document.getElementById("action-potion");
  if (actionPotion) actionPotion.addEventListener("click", () => handleAction("potion"));

  const actionFlee = document.getElementById("action-flee");
  if (actionFlee) actionFlee.addEventListener("click", () => handleAction("flee"));
  
  const restartBtn = document.getElementById("btn-restart");
  if (restartBtn) restartBtn.addEventListener("click", () => showScreen("home-screen"));
}

function startNewGame(mode) {
  gameState = {
    status: "playing",
    mode: mode,
    health: INITIAL_HEALTH,
    maxHealth: INITIAL_HEALTH,
    potions: 3,
    equippedWeapon: null,
    deck: createDeck(),
    room: [],
    selectedCardId: null,
    fleeAvailable: true,
    roomIndex: 0,
    enemiesDefeated: 0
  };
  showScreen("game-screen");
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
  const carry = gameState.room.length === 1 ? gameState.room[0] : null;
  const drawn = gameState.deck.splice(0, carry ? 3 : 4);
  if (drawn.length === 0 && !carry) { endGame("win"); return; }
  gameState.room = carry ? [carry, ...drawn] : drawn;
  gameState.roomIndex++;
  gameState.selectedCardId = null;
  renderRoom();
}

function handleAction(type) {
  const selected = gameState.room.find(c => c.id === gameState.selectedCardId);
  
  if (type === "flee") {
    if (!gameState.fleeAvailable || gameState.room.length < 2) return;
    gameState.deck.push(...gameState.room);
    gameState.room = [];
    gameState.fleeAvailable = false;
    setTimeout(drawRoom, 500); 
    return;
  }
  
  if (type === "potion" && !selected) {
    if (gameState.potions > 0 && gameState.health < gameState.maxHealth) {
      heal(7); gameState.potions--; updateHUD();
    }
    return;
  }
  
  if (!selected) return;

  // Logica di combattimento / uso oggetti in base alla modalità selezionata
  if (type === "unarmed" && (selected.suit === "Fiori" || selected.suit === "Picche")) {
    // senza arma: danno pieno
    damage(selected.value);
    removeCard(selected.id);

  } else if (type === "weapon") {

    if (selected.suit === "Quadri") {
      // equipaggi arma
      gameState.equippedWeapon = selected;
      removeCard(selected.id);
      triggerExplosion("#3b82f6");

    } else if (selected.suit === "Fiori" || selected.suit === "Picche") {
      // con arma: danno = max(0, mostro - arma)
      const weaponValue = gameState.equippedWeapon ? gameState.equippedWeapon.value : 0;
      const dmg = Math.max(0, selected.value - weaponValue);
      damage(dmg);
      removeCard(selected.id);
      triggerExplosion("#3b82f6");
    }

  } else if (type === "potion" && selected.suit === "Cuori") {
    heal(selected.value);
    removeCard(selected.id);
  }
}

function damage(v) { 
  gameState.health = Math.max(0, gameState.health - v); 
  if (gameState.health <= 0) endGame("lose"); 
  updateHUD(); 
  triggerExplosion("#ef4444");
}

function heal(v) { 
  gameState.health = Math.min(gameState.maxHealth, gameState.health + v); 
  updateHUD(); 
  triggerExplosion("#10b981");
}

function removeCard(id) { 
  gameState.room = gameState.room.filter(c => c.id !== id); 
  gameState.selectedCardId = null; 
  renderRoom(); 
  if (gameState.room.length <= 1) { 
    gameState.fleeAvailable = true; 
    setTimeout(drawRoom, 400); 
  } 
}

function showScreen(id) { 
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active")); 
  const target = document.getElementById(id);
  if (target) target.classList.add("active"); 
}

function endGame(res) { 
  const modal = document.getElementById("end-modal");
  if (modal) modal.classList.add("active"); 
}

window.onload = initGame;
