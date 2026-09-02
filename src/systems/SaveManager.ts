import { Player } from '../entities/Player';
import { InventorySystem } from './InventorySystem';
import { WorldManager } from './WorldManager';
import { QuestSystem } from './QuestSystem';
import { AudioSys } from './AudioManager';
import { ToolType } from '../data/ToolsData';
import { EventBus } from '../core/EventBus';

export interface GameSaveData {
  version: number;
  timestamp: number;
  player: {
    x: number;
    y: number;
    z: number;
    currentHealth: number;
    maxHealth: number;
    toolLevels: Record<ToolType, number>;
  };
  inventory: Record<string, number>;
  world: {
    unlockedTiles: string[];
    builtBuildings: string[];
    defeatedBosses: string[];
  };
  quests: {
    activeQuestId: string | null;
    objectives: any[];
    completedIds: string[];
  };
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    isMuted: boolean;
  };
}

const SAVE_KEY = 'realmcrafter_savegame_v1';

export class SaveManager {
  private autosaveTimer: number = 0;
  private autosaveInterval: number = 15.0; // Guardado cada 15s

  public static hasSaveGame(): boolean {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  public static clearSaveGame(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
      EventBus.emit('hud:toast', { message: 'Partida guardada eliminada', type: 'info' });
    } catch (e) {
      console.error(e);
    }
  }

  public save(
    player: Player,
    inventory: InventorySystem,
    world: WorldManager,
    quest: QuestSystem,
    silent: boolean = false
  ): void {
    try {
      const data: GameSaveData = {
        version: 1,
        timestamp: Date.now(),
        player: {
          x: player.position.x,
          y: player.position.y,
          z: player.position.z,
          currentHealth: player.currentHealth,
          maxHealth: player.maxHealth,
          toolLevels: { ...player.toolLevels }
        },
        inventory: inventory.serialize(),
        world: {
          unlockedTiles: world.getUnlockedTileIds(),
          builtBuildings: world.getBuiltBuildingIds(),
          defeatedBosses: world.bosses.filter(b => b.isDefeated).map(b => b.id)
        },
        quests: quest.serialize(),
        settings: AudioSys.getSettings()
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      if (!silent) {
        EventBus.emit('hud:toast', { message: '💾 Partida guardada con éxito', type: 'info' });
      }
    } catch (e) {
      console.error('[SaveManager] Error al guardar partida:', e);
    }
  }

  public load(
    player: Player,
    inventory: InventorySystem,
    world: WorldManager,
    quest: QuestSystem
  ): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;

      const data: GameSaveData = JSON.parse(raw);

      // Cargar jugador
      player.position.set(data.player.x, data.player.y, data.player.z);
      player.toolLevels = data.player.toolLevels;
      player.currentHealth = data.player.currentHealth;
      player.maxHealth = data.player.maxHealth;
      player.applyEquippedStats();
      player.updateToolMesh();

      // Cargar inventario
      inventory.deserialize(data.inventory);

      // Cargar mundo
      world.cleanup();
      world.initWorld(data.world.unlockedTiles, data.world.builtBuildings);

      // Cargar misiones
      quest.deserialize(data.quests);

      // Cargar audio
      if (data.settings) {
        AudioSys.setMasterVolume(data.settings.masterVolume);
        AudioSys.setMusicVolume(data.settings.musicVolume);
        AudioSys.setSFXVolume(data.settings.sfxVolume);
      }

      EventBus.emit('hud:toast', { message: '🎮 Partida cargada con éxito', type: 'success' });
      return true;
    } catch (e) {
      console.error('[SaveManager] Error al cargar partida:', e);
      return false;
    }
  }

  public update(
    delta: number,
    player: Player,
    inventory: InventorySystem,
    world: WorldManager,
    quest: QuestSystem
  ): void {
    this.autosaveTimer += delta;
    if (this.autosaveTimer >= this.autosaveInterval) {
      this.autosaveTimer = 0;
      this.save(player, inventory, world, quest, true);
    }
  }
}

