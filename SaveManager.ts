
import { GameState, SignedSave, SaveMetadata, Difficulty } from './types';
import { GAME_RULES } from './constants';

const HMAC_SECRET = "scoundrel-vault-key-v3-architect";

export class SaveManager {
  private static async getHMAC(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(HMAC_SECRET);
    const dataToSign = encoder.encode(data);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  public static async createSignedSave(state: GameState, nickname: string): Promise<SignedSave | null> {
    // GOD Mode block
    if (state.difficulty === 'god') return null;

    const stateString = JSON.stringify(state);
    const base64Data = btoa(unescape(encodeURIComponent(stateString)));
    
    const metadata: SaveMetadata = {
      profileNickname: nickname,
      difficulty: state.difficulty,
      health: state.health,
      rooms: state.roomIndex,
      timestamp: Date.now(),
      version: GAME_RULES.VERSION
    };

    const signature = await this.getHMAC(base64Data + JSON.stringify(metadata));
    
    return {
      data: base64Data,
      metadata,
      signature
    };
  }

  public static async verifyAndLoadSave(save: SignedSave): Promise<GameState | null> {
    if (save.metadata.version !== GAME_RULES.VERSION) {
      console.warn("Save version mismatch.");
      return null;
    }

    const calculatedSignature = await this.getHMAC(save.data + JSON.stringify(save.metadata));
    if (calculatedSignature !== save.signature) {
      console.error("CRITICAL: Save file tampered or corrupted.");
      return null;
    }

    try {
      const decoded = decodeURIComponent(escape(atob(save.data)));
      return JSON.parse(decoded) as GameState;
    } catch (e) {
      console.error("Failed to parse save data.", e);
      return null;
    }
  }

  public static canSave(state: GameState): { allowed: boolean; reason?: string } {
    if (state.difficulty === 'god') return { allowed: false, reason: "Nessun salvataggio permesso in GOD MODE." };
    if (state.selectedCardId !== null) return { allowed: false, reason: "Non puoi salvare durante un combattimento." };
    if (state.status !== 'playing') return { allowed: false, reason: "Partita non attiva." };
    return { allowed: true };
  }
}
