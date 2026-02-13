
import { WorldShift, WorldState, ShiftCategory, ShiftSource } from './types';

const SECRET = "scoundrel-paradox-secure-hash-v2";

const TEMPLATES: Record<ShiftCategory, { name: string, description: string, effectId: string }[]> = {
  hostile: [
    { name: "Gravità Instabile", description: "Danno mostri +1.", effectId: "monster_dmg_plus" },
    { name: "Vuoto Entropico", description: "Cura pozioni -2.", effectId: "potion_heal_minus" },
    { name: "Dilemma Temporale", description: "Costo fuga +1 HP.", effectId: "flee_cost_plus" },
    { name: "Lama di Vetro", description: "Le armi si rompono più spesso.", effectId: "weapon_fragile" }
  ],
  beneficial: [
    { name: "Sincronia Quantistica", description: "Valore armi +1.", effectId: "weapon_val_plus" },
    { name: "Memoria Cellulare", description: "Salute massima +5.", effectId: "max_hp_plus" },
    { name: "Flusso di Fortuna", description: "Recupera 1 HP ogni 2 nemici.", effectId: "regen_on_kill" },
    { name: "Resilienza Divina", description: "Cura pozioni +2.", effectId: "potion_heal_plus" }
  ],
  neutral: [
    { name: "Eco del 42", description: "La realtà vibra in toni azzurri.", effectId: "cosmetic_blue" },
    { name: "Glitch Cronico", description: "Nomi delle carte distorti.", effectId: "distort_names" },
    { name: "Spazio Non-Euclideo", description: "Animazioni delle carte alterate.", effectId: "distort_anim" }
  ]
};

export class WorldShiftManager {
  private static async getHMAC(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET);
    const dataToSign = encoder.encode(data);
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  // 3️⃣ GENERAZIONE SHIFT
  public static async generateBalancedShift(currentShifts: WorldShift[]): Promise<WorldShift> {
    const hostile = currentShifts.filter(s => s.category === 'hostile').length;
    const beneficial = currentShifts.filter(s => s.category === 'beneficial').length;

    let category: ShiftCategory;
    if (hostile > beneficial + 1) category = 'beneficial';
    else if (beneficial > hostile + 1) category = 'hostile';
    else {
      const cats: ShiftCategory[] = ['hostile', 'beneficial', 'neutral'];
      category = cats[Math.floor(Math.random() * cats.length)];
    }

    const template = TEMPLATES[category][Math.floor(Math.random() * TEMPLATES[category].length)];
    const id = `shift_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = Date.now();
    const source: ShiftSource = "local";
    
    const signature = await this.getHMAC(id + category + template.effectId + timestamp + source);

    return { id, category, source, timestamp, signature, ...template };
  }

  // 5️⃣ IMPORTAZIONE HALL – FUSIONE ORGANICA (B)
  public static async fuseOrganicShifts(localShifts: WorldShift[], importedShifts: WorldShift[]): Promise<WorldShift[]> {
    // Verifiche di integrità degli shift importati
    const validImported = [];
    for (const s of importedShifts) {
      if (await this.verifyShift(s)) {
        validImported.push({ ...s, source: "imported" as ShiftSource });
      }
    }

    let merged = [...localShifts];
    
    for (const imp of validImported) {
      if (!merged.find(m => m.id === imp.id)) {
        merged.unshift(imp); // Aggiungi nuovi in cima
      }
    }

    // Applicare limite 7
    if (merged.length > 7) {
      // Rimuovere i più vecchi imported prima, mantenendo almeno 1 local
      while (merged.length > 7) {
        const localCount = merged.filter(m => m.source === 'local').length;
        // Trova l'indice del più vecchio imported
        let indexToRemove = -1;
        const importedOnes = merged.filter(m => m.source === 'imported');
        
        if (importedOnes.length > 0) {
          const oldestImported = importedOnes.reduce((prev, curr) => prev.timestamp < curr.timestamp ? prev : curr);
          indexToRemove = merged.indexOf(oldestImported);
        } else if (localCount > 1) {
          const oldestLocal = merged.filter(m => m.source === 'local').reduce((prev, curr) => prev.timestamp < curr.timestamp ? prev : curr);
          indexToRemove = merged.indexOf(oldestLocal);
        } else {
          // Se rimane solo 1 local, non lo rimuoviamo se possibile
          break; 
        }

        if (indexToRemove !== -1) merged.splice(indexToRemove, 1);
        else break;
      }
    }

    return merged.slice(0, 7);
  }

  // 7️⃣ SICUREZZA
  public static async verifyShift(shift: WorldShift): Promise<boolean> {
    const expected = await this.getHMAC(shift.id + shift.category + shift.effectId + shift.timestamp + shift.source);
    return shift.signature === expected;
  }

  public static async signWorldState(shifts: WorldShift[]): Promise<string> {
    const data = shifts.map(s => s.id).sort().join('|');
    return await this.getHMAC(data);
  }

  public static async verifyWorldState(state: WorldState): Promise<boolean> {
    const expected = await this.signWorldState(state.activeShifts);
    return state.signature === expected;
  }

  public static createDefaultState(): WorldState {
    return { activeShifts: [], maxShifts: 7, signature: "" };
  }
}
