
import { ChronicleEntry, SignedChronicle, GameState } from './types';

const CHRONICLE_SECRET = "eternal-arcane-vault-key-v1";

export class ChronicleManager {
  private static async getHMAC(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(CHRONICLE_SECRET);
    const dataToSign = encoder.encode(data);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  public static isSignificantFall(state: GameState): boolean {
    const isAdvancedRoom = state.roomIndex >= 12;
    const isBloodBath = state.sessionStats.enemiesDefeated >= 35;
    const isHighStakesHero = (state.difficulty === 'god' || state.difficulty === 'inferno') && state.roomIndex >= 8;

    return isAdvancedRoom || isBloodBath || isHighStakesHero;
  }

  public static generateTitle(entry: ChronicleEntry): string {
    const { variants, stats, status, difficulty, p42 } = entry;
    
    if (p42) return "L'Architetto del Paradosso";

    if (status === "won") {
      if (variants.includes('flawless') && variants.includes('no_potion') && variants.includes('no_retreat')) {
        return "L'Assoluto";
      }
      if (variants.includes('flawless')) return "L'Immacolato";
      if (variants.includes('no_potion')) return "L'Ascetico";
      if (variants.includes('no_retreat')) return "L'Incrollabile";
      if (stats.enemiesDefeated > 45) return "Il Flagello dell'Abisso";
      if (stats.healingDone < 5) return "La Lama di Sangue";
      return "L'Eterno";
    } else {
      if (difficulty === 'god') return "L'Eclissi Divina";
      if (stats.roomsReached >= 20) return "L'Ultimo Sospiro del Dungeon";
      if (stats.enemiesDefeated >= 40) return "Il Martire dell'Abisso";
      if (stats.weaponsEquipped >= 6) return "La Lama Spezzata";
      if (stats.retreatsUsed >= 4) return "Il Vagabondo Senza Meta";
      return "Caduto nell'Ombra";
    }
  }

  public static createEntry(state: GameState, heroName: string, heroClass: string, isParadox: boolean = false): ChronicleEntry {
    const variants: string[] = [];
    if (state.sessionStats.minHealthReached >= state.maxHealth / 2) variants.push('flawless');
    if (state.sessionStats.potionsUsed === 0) variants.push('no_potion');
    if (state.sessionStats.retreatsUsed === 0) variants.push('no_retreat');

    const entry: ChronicleEntry = {
      id: `chronicle_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      heroName,
      heroClass,
      title: "",
      timestamp: Date.now(),
      stats: { ...state.sessionStats },
      rooms: state.roomIndex,
      difficulty: state.difficulty,
      variants,
      status: state.status === "won" ? "won" : "lost",
      p42: isParadox
    };

    entry.title = this.generateTitle(entry);
    return entry;
  }

  public static async signChronicle(entry: ChronicleEntry): Promise<string> {
    const data = btoa(JSON.stringify(entry));
    const signature = await this.getHMAC(data);
    return btoa(JSON.stringify({ data, signature }));
  }

  public static async verifyChronicle(shareCode: string): Promise<ChronicleEntry | null> {
    try {
      const { data, signature } = JSON.parse(atob(shareCode)) as SignedChronicle;
      const expected = await this.getHMAC(data);
      if (signature !== expected) return null;
      return JSON.parse(atob(data)) as ChronicleEntry;
    } catch (e) {
      return null;
    }
  }
}
