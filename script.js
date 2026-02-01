
/**
 * SCOUNDREL - Stats Edition
 * Vanilla JS Game Engine
 */

// --- CONFIG & CONSTANTS ---
const INITIAL_HEALTH = 20;
const POTION_HEAL_BASE = 7;
const STATS_KEY = "scoundrel_stats_v1";

const SUITS = ["Cuori", "Quadri", "Fiori", "Picche"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

// --- GAME STATE ---
let gameState = {
  status: "start", // start, playing, won, lost
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

// --- STATS MANAGER ---
const statsManager = {
  global: {
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalRoomsCleared: 0,
    totalEnemiesDefeated: 0,
    totalDamageTaken: 0,
    totalHealingDone: 0,
    totalPotionsUsed: 0,
    totalRunsUsed: 0,
    totalWeaponsEquipped: 0,
    bestRun: { rooms: 0, enemies: 0 },
    lastGame: null
  },
  session: null,

  load() {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      this.global = JSON.parse(saved);
    }
  },

  save() {
    localStorage.setItem(STATS_KEY, JSON.stringify(this.global));
  },

  reset() {
    if (confirm("Sei sicuro di voler cancellare TUTTE le statistiche globali?")) {
      this.global = {
        totalGames: 0, wins: 0, losses: 0,
        totalRoomsCleared: 0, totalEnemiesDefeated: 0,
        totalDamageTaken: 0, totalHealingDone: 0,
        totalPotionsUsed: 0, totalRunsUsed: 0,
        totalWeaponsEquipped: 0,
        bestRun: { rooms: 0, enemies: 0 },
        lastGame: null
      };
      this.save();
      showToast("Statistiche resettate!", "info");
      this.updateUI();
    }
  },

  startSession(mode) {
    this.session = {
      startTime: Date.now(),
      mode: mode,
      roomsReached: 1,
      enemiesDefeated: 0,
      damageTaken: 0,
      healingDone: 0,
      potionsUsed: 0,
      runsUsed: 0,
      weaponsEquipped: 0,
      invalidMoves: 0,
      killsBarehanded: 0,
      killsWeapon: 0
    };
  },

  record(type, value = 1) {
    if (!this.session) return;
    if (this.session[type] !== undefined) {
      this.session[type] += value;
    }
    // Specific counters
    if (type === "monsterKilled") {
      this.session.enemiesDefeated += 1;
    }
    this.updateUI();
  },

  endSession(result) {
    if (!this.session) return;
    const duration = Math.floor((Date.now() - this.session.startTime) / 1000);
    
    // Update Global
    this.global.totalGames += 1;
    if (result === "win") this.global.wins += 1;
    else this.global.losses += 1;

    this.global.totalRoomsCleared += this.session.roomsReached;
    this.global.totalEnemiesDefeated += this.session.enemiesDefeated;
    this.global.totalDamageTaken += this.session.damageTaken;
    this.global.totalHealingDone += this.session.healingDone;
    this.global.totalPotionsUsed += this.session.potionsUsed;
    this.global.totalRunsUsed += this.session.runsUsed;
    this.global.totalWeaponsEquipped += this.session.weaponsEquipped;

    // Record check
    if (this.session.roomsReached > this.global.bestRun.rooms) {
      this.global.bestRun.rooms = this.session.roomsReached;
    }
    if (this.session.enemiesDefeated > this.global.bestRun.enemies) {
      this.global.bestRun.enemies = this.session.enemiesDefeated;
    }

    this.global.lastGame = {
      result,
      mode: this.session.mode,
      rooms: this.session.roomsReached,
      enemies: this.session.enemiesDefeated,
      date: new Date().toISOString()
    };

    this.save();
    return { ...this.session, duration };
  },

  getWinRate() {
    if (this.global.totalGames === 0) return "0%";
    return Math.round((this.global.wins / this.global.totalGames) * 100) + "%";
  },

  updateUI() {
    // Session Tab
    const sCont = document.getElementById("session-stats-container");
    if (!this.session) {
      sCont.innerHTML = `<p class="text-slate italic col-span-full">Nessuna partita attiva.</p>`;
    } else {
      sCont.innerHTML = `
        ${this.renderStat("Stanze", this.session.roomsReached)}
        ${this.renderStat("Mostri", this.session.enemiesDefeated)}
        ${this.renderStat("Danni subiti", this.session.damageTaken)}
        ${this.renderStat("Cure totali", this.session.healingDone)}
        ${this.renderStat("Pozioni scorta", this.session.potionsUsed)}
        ${this.renderStat("Armi equip.", this.session.weaponsEquipped)}
        ${this.renderStat("Ritirate", this.session.runsUsed)}
        ${this.renderStat("Mosse Errate", this.session.invalidMoves)}
      `;
    }

    // Global Tab
    const gCont = document.getElementById("global-stats-container");
    gCont.innerHTML = `
      ${this.renderStat("Partite totali", this.global.totalGames)}
      ${this.renderStat("Vittorie", this.global.wins)}
      ${this.renderStat("Sconfitte", this.global.losses)}
      ${this.renderStat("Win Rate", this.getWinRate())}
      ${this.renderStat("Stanze (Tot)", this.global.totalRoomsCleared)}
      ${this.renderStat("Mostri (Tot)", this.global.totalEnemiesDefeated)}
      ${this.renderStat("Pozioni (Tot)", this.global.totalPotionsUsed)}
      ${this.renderStat("Fughe (Tot)", this.global.totalRunsUsed)}
    `;

    // Records Tab
    const rCont = document.getElementById("records-stats-container");
    const lastStr = this.global.lastGame ? `${this.global.lastGame.result.toUpperCase()} (${this.global.lastGame.rooms} st, ${this.global.lastGame.enemies} m)` : "N/D";
    rCont.innerHTML = `
      <div class="col-span-full border-b border-white/5 pb-2 mb-2"><span class="stat-label">Miglior Partita</span></div>
      ${this.renderStat("Max Stanze", this.global.bestRun.rooms)}
      ${this.renderStat("Max Mostri", this.global.bestRun.enemies)}
      <div class="col-span-full border-b border-white/5 pb-2 mb-2 mt-4"><span class="stat-label">Ultima Partita</span></div>
      <div class="stat-card col-span-full">
        <span class="stat-label">Esito</span>
        <span class="stat-value text-emerald">${lastStr}</span>
      </div>
    `;
  },

  renderStat(label, val) {
    return `
      <div class="stat-card">
        <span class="stat-label">${label}</span>
        <span class="stat-value">${val}</span>
      </div>
    `;
  }
};

// --- GAME LOGIC ---

function initGame() {
  statsManager.load();
  bindEvents();
  renderRules();
}

function bindEvents() {
  document.getElementById("btn-start").addEventListener("click", () => {
    const mode = document.querySelector('input[name="gameMode"]:checked').value;
    startNewGame(mode);
  });

  document.getElementById("btn-open-stats").addEventListener("click", () => {
    statsManager.updateUI();
    document.getElementById("stats-modal").classList.add("active");
  });

  document.querySelectorAll(".btn-close, .btn-close-footer").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal-backdrop").classList.remove("active");
    });
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".modal-content");
      parent.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      parent.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  document.getElementById("btn-reset-stats").addEventListener("click", () => statsManager.reset());

  // Game actions
  document.getElementById("action-unarmed").addEventListener("click", () => handleAction("unarmed"));
  document.getElementById("action-weapon").addEventListener("click", () => handleAction("weapon"));
  document.getElementById("action-potion").addEventListener("click", () => handleAction("potion"));
  document.getElementById("action-flee").addEventListener("click", () => handleAction("flee"));

  document.getElementById("btn-restart").addEventListener("click", () => {
    document.getElementById("end-modal").classList.remove("active");
    showScreen("home-screen");
  });

  document.getElementById("btn-open-rules-home").addEventListener("click", () => openRules());
  document.getElementById("btn-open-rules-game").addEventListener("click", () => openRules());
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
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

  statsManager.startSession(mode);
  showScreen("game-screen");
  drawRoom();
  updateHUD();
}

function createDeck() {
  const deck = [];
  SUITS.forEach(s => {
    RANKS.forEach(r => {
      const isRedFigure = (s === "Cuori" || s === "Quadri") && ["J", "Q", "K", "A"].includes(r);
      if (!isRedFigure) {
        deck.push({ id: crypto.randomUUID(), suit: s, rank: r, value: getCardValue(r) });
      }
    });
  });
  return shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getCardValue(rank) {
  if (rank === "A") return 14;
  if (rank === "K") return 13;
  if (rank === "Q") return 12;
  if (rank === "J") return 11;
  return parseInt(rank);
}

function drawRoom() {
  // Regola carry-over: se c'era una carta rimasta, tienila
  const carry = gameState.room.length === 1 ? gameState.room[0] : null;
  const needed = carry ? 3 : 4;
  const drawn = gameState.deck.splice(0, Math.min(needed, gameState.deck.length));
  
  if (drawn.length === 0 && !carry) {
    endGame("win");
    return;
  }

  gameState.room = carry ? [carry, ...drawn] : drawn;
  gameState.roomIndex += 1;
  gameState.selectedCardId = null;
  
  // Resetta fuga (tranne se appena usata, ma la logica è: disponibile dopo stanza completa)
  // Qui implementiamo: fuga disponibile a inizio stanza se stanza precedente conclusa normalmente
  
  renderRoom();
  statsManager.record("roomsReached", 0); // Solo trigger update
}

function renderRoom() {
  const container = document.getElementById("room-container");
  container.innerHTML = "";
  gameState.room.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = `card ${gameState.selectedCardId === card.id ? 'selected' : ''}`;
    const isRed = card.suit === "Cuori" || card.suit === "Quadri";
    const suitIcon = getSuitIcon(card.suit);
    const typeLabel = getCardTypeLabel(card.suit);

    cardEl.innerHTML = `
      <div class="card-top ${isRed ? 'card-red' : ''}">
        <span>${card.rank}</span>
        <span>${suitIcon}</span>
      </div>
      <div class="card-center">
        <span class="card-icon ${isRed ? 'card-red' : ''}">${suitIcon}</span>
        <span class="card-type">${typeLabel}</span>
        <span class="card-value">${card.value}</span>
      </div>
      <div class="card-top rotate-180 ${isRed ? 'card-red' : ''}">
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

function getSuitIcon(suit) {
  switch(suit) {
    case "Cuori": return "♥️";
    case "Quadri": return "♦️";
    case "Fiori": return "♣️";
    case "Picche": return "♠️";
  }
}

function getCardTypeLabel(suit) {
  if (suit === "Cuori") return "Pozione";
  if (suit === "Quadri") return "Arma";
  return "Mostro";
}

function updateHUD() {
  const bar = document.getElementById("health-bar");
  const hpText = document.getElementById("health-text");
  const pct = (gameState.health / gameState.maxHealth) * 100;
  bar.style.width = `${pct}%`;
  hpText.innerText = `${gameState.health}/${gameState.maxHealth}`;

  document.getElementById("weapon-text").innerText = gameState.equippedWeapon 
    ? `${getSuitIcon(gameState.equippedWeapon.suit)}${gameState.equippedWeapon.rank} (${gameState.equippedWeapon.value})`
    : "Nuda";
  
  document.getElementById("potions-text").innerText = `🧪 ${gameState.potions}`;
  document.getElementById("room-text").innerText = gameState.roomIndex;
  document.getElementById("deck-text").innerText = gameState.deck.length;

  const targetBox = document.getElementById("target-value");
  const selected = gameState.room.find(c => c.id === gameState.selectedCardId);
  if (selected) {
    targetBox.innerText = `${getSuitIcon(selected.suit)}${selected.rank} (Val: ${selected.value})`;
    targetBox.classList.add("text-emerald");
  } else {
    targetBox.innerText = "Nessuna selezione";
    targetBox.classList.remove("text-emerald");
  }

  // Flee button state
  document.getElementById("action-flee").disabled = !gameState.fleeAvailable || gameState.room.length < 2;
}

// --- ACTIONS ---

function handleAction(type) {
  const selected = gameState.room.find(c => c.id === gameState.selectedCardId);

  // Azione Fuga (indipendente dalla selezione)
  if (type === "flee") {
    if (!gameState.fleeAvailable) {
      invalidMove("Fuga in cooldown!");
      return;
    }
    // Rimescola room in fondo al deck
    gameState.deck.push(...gameState.room);
    gameState.room = [];
    gameState.fleeAvailable = false;
    statsManager.record("runsUsed");
    showToast("Fuga effettuata! Carte rimesse in fondo.", "warning");
    triggerVFX("vfx-weapon");
    checkTransition();
    return;
  }

  // Azione Pozione Scorta (indipendente dalla selezione)
  if (type === "potion" && !selected) {
    if (gameState.potions <= 0) {
      invalidMove("Nessuna pozione in scorta!");
      return;
    }
    if (gameState.health >= gameState.maxHealth) {
      invalidMove("Salute già al massimo!");
      return;
    }
    heal(POTION_HEAL_BASE);
    gameState.potions -= 1;
    statsManager.record("potionsUsed");
    showToast("Pozione scorta usata! +7 HP", "success");
    return;
  }

  if (!selected) {
    invalidMove("Seleziona una carta!");
    return;
  }

  switch(type) {
    case "unarmed":
      if (selected.suit === "Cuori" || selected.suit === "Quadri") {
        invalidMove("Puoi attaccare solo i mostri!");
        return;
      }
      // Mani nude: uccidi ma subisci danni pari al valore
      damage(selected.value);
      killMonster(selected, "barehanded");
      break;

    case "weapon":
      if (selected.suit === "Quadri") {
        gameState.equippedWeapon = selected;
        removeCard(selected.id);
        statsManager.record("weaponsEquipped");
        showToast("Arma equipaggiata!", "success");
        triggerVFX("vfx-weapon");
        checkTransition();
      } else if (selected.suit === "Fiori" || selected.suit === "Picche") {
        if (!gameState.equippedWeapon) {
          invalidMove("Non hai un'arma equipaggiata!");
          return;
        }
        if (gameState.equippedWeapon.value < selected.value) {
          if (gameState.mode === "normal") {
            invalidMove("Arma troppo debole!");
            return;
          } else {
            // Easy mode: permetti attacco fallito con penalità
            damage(2);
            killMonster(selected, "weapon");
            showToast("Attacco debole! Subisci -2 HP (Easy Mode)", "warning");
            triggerExplosion("#3b82f6");
          }
        } else {
          // Successo attacco arma
          killMonster(selected, "weapon");
          showToast("Mostro sconfitto!", "success");
          triggerExplosion("#3b82f6");
        }
      } else {
        invalidMove("Azione non valida per questa carta.");
      }
      break;

    case "potion":
      if (selected.suit !== "Cuori") {
        invalidMove("Questa non è una pozione!");
        return;
      }
      heal(selected.value);
      removeCard(selected.id);
      showToast(`Curato di ${selected.value} HP!`, "success");
      checkTransition();
      break;
  }
}

function damage(val) {
  gameState.health = Math.max(0, gameState.health - val);
  statsManager.record("damageTaken", val);
  triggerVFX("vfx-hit");
  if (gameState.health <= 0) endGame("lose");
  updateHUD();
}

function heal(val) {
  const actual = Math.min(gameState.maxHealth - gameState.health, val);
  gameState.health += actual;
  statsManager.record("healingDone", actual);
  triggerVFX("vfx-heal");
  updateHUD();
}

function killMonster(card, method) {
  removeCard(card.id);
  statsManager.record("monsterKilled");
  if (method === "barehanded") statsManager.record("killsBarehanded");
  else statsManager.record("killsWeapon");
  checkTransition();
}

function removeCard(id) {
  gameState.room = gameState.room.filter(c => c.id !== id);
  gameState.selectedCardId = null;
  renderRoom();
  updateHUD();
}

function checkTransition() {
  // Regola Carry-over: se ne resta 1, o se è vuota
  if (gameState.room.length <= 1) {
    gameState.fleeAvailable = true; // Ripristina fuga dopo aver quasi finito stanza
    setTimeout(() => {
      drawRoom();
      updateHUD();
    }, 600);
  }
}

function invalidMove(msg) {
  showToast(msg, "error");
  if (gameState.mode === "normal") statsManager.record("invalidMoves");
  else statsManager.record("invalidMoves"); // Track generically
}

function endGame(result) {
  gameState.status = result;
  const sessionData = statsManager.endSession(result);
  
  document.getElementById("end-title").innerText = result === "win" ? "VITTORIA" : "SCONFITTA";
  document.getElementById("end-title").className = `title-font text-6xl ${result === "win" ? 'text-emerald' : 'text-primary'}`;
  document.getElementById("end-msg").innerText = result === "win" ? "Hai ripulito il dungeon!" : "Il dungeon ha avuto la meglio.";
  
  document.getElementById("end-monsters").innerText = sessionData.enemiesDefeated;
  document.getElementById("end-rooms").innerText = sessionData.roomsReached;
  document.getElementById("end-damage").innerText = sessionData.damageTaken;
  document.getElementById("end-duration").innerText = sessionData.duration + "s";

  document.getElementById("end-modal").classList.add("active");
}

// --- UTILS ---

function showToast(msg, kind) {
  const cont = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${kind}`;
  toast.innerText = msg;
  cont.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function triggerVFX(cls) {
  const vfx = document.getElementById("vfx-overlay");
  vfx.className = `vfx-overlay pointer-events-none ${cls}`;
  setTimeout(() => vfx.className = "vfx-overlay pointer-events-none", 300);
}

function triggerExplosion(color) {
    const particleCount = 15;
    const container = document.body;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.left = '50%';
        p.style.top = '50%';
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        container.appendChild(p);
        
        let op = 1;
        let x = 0;
        let y = 0;
        const anim = setInterval(() => {
            x += vx;
            y += vy;
            op -= 0.04;
            p.style.transform = `translate(${x}px, ${y}px)`;
            p.style.opacity = op;
            if (op <= 0) {
                clearInterval(anim);
                p.remove();
            }
        }, 16);
    }
}

function openRules() {
  document.getElementById("rules-modal").classList.add("active");
}

function renderRules() {
  const body = document.getElementById("rules-body");
  body.innerHTML = `
    <h3>Obiettivo</h3>
    <p>Svuota il mazzo di 44 carte (senza figure rosse) gestendo la tua salute. Se arrivi alla fine, hai vinto.</p>
    
    <h3>Tipi di Carte</h3>
    <ul>
      <li><strong>♥️ Cuori (Pozioni):</strong> Curano la tua salute del loro valore.</li>
      <li><strong>♦️ Quadri (Armi):</strong> Equipaggiale per sconfiggere mostri senza subire danni.</li>
      <li><strong>♣️/♠️ Mostri:</strong> Se li sconfiggi a mani nude, subisci danni pari al loro valore. Se usi un'arma di valore pari o superiore, subisci 0 danni.</li>
    </ul>

    <h3>Ritirata & Carry-over</h3>
    <p>Puoi fuggire da una stanza se ci sono almeno 2 carte. Le carte tornano in fondo al mazzo. La fuga va in cooldown per una stanza.</p>
    <p>Se resta una sola carta in stanza, essa viene portata nella stanza successiva insieme a 3 nuove carte.</p>
  `;
}

// Boot
window.onload = initGame;
