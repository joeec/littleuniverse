import { QuestDefinition, QUESTS_DATA, QuestObjective } from '../data/QuestsData';
import { InventorySystem } from './InventorySystem';
import { AudioSys } from './AudioManager';
import { EventBus } from '../core/EventBus';

export class QuestSystem {
  public currentQuest: QuestDefinition | null = null;
  public completedQuestIds: Set<string> = new Set();
  private inventory: InventorySystem;

  constructor(inventory: InventorySystem) {
    this.inventory = inventory;
    this.setupEventListeners();
  }

  public startFirstQuest(): void {
    if (!this.currentQuest) {
      this.setActiveQuest('quest_1_awakening');
    }
  }

  public setActiveQuest(questId: string): void {
    const data = QUESTS_DATA[questId];
    if (!data) return;

    // Clonar para mutar el progreso de objetivos
    this.currentQuest = JSON.parse(JSON.stringify(data));
    this.emitQuestUpdate();
    EventBus.emit('hud:toast', { message: `📜 Nueva Misión: ${this.currentQuest!.title}`, type: 'info' });
  }

  private setupEventListeners(): void {
    EventBus.on('quest:progress', (data: { type: string; targetId: string; amount: number }) => {
      this.handleProgress(data.type, data.targetId, data.amount);
    });

    EventBus.on('boss:defeated', (data: { bossId: string }) => {
      this.handleProgress('defeat_boss', data.bossId, 1);
    });
  }

  public handleProgress(type: string, targetId: string, amount: number): void {
    if (!this.currentQuest) return;

    let changed = false;
    for (const obj of this.currentQuest.objectives) {
      if (obj.type === type && (obj.targetId === targetId || obj.targetId === 'any' || (type === 'unlock_tiles' && obj.targetId === 'tile'))) {
        const prev = obj.currentAmount;
        obj.currentAmount = Math.min(obj.targetAmount, obj.currentAmount + amount);
        if (obj.currentAmount !== prev) {
          changed = true;
        }
      }
    }

    if (changed) {
      this.emitQuestUpdate();
      this.checkCompletion();
    }
  }

  private checkCompletion(): void {
    if (!this.currentQuest) return;

    const allComplete = this.currentQuest.objectives.every(obj => obj.currentAmount >= obj.targetAmount);

    if (allComplete) {
      const finishedQuest = this.currentQuest;
      this.completedQuestIds.add(finishedQuest.id);

      // Entregar recompensas
      for (const reward of finishedQuest.rewards) {
        this.inventory.addItem(reward.resourceId, reward.amount);
      }

      AudioSys.playSFX('quest_complete');
      EventBus.emit('hud:toast', {
        message: `🎉 ¡Misión Completada: ${finishedQuest.title}! Recompensas recibidas.`,
        type: 'success'
      });

      // Avanzar a la siguiente misión si existe
      if (finishedQuest.nextQuestId && QUESTS_DATA[finishedQuest.nextQuestId]) {
        this.setActiveQuest(finishedQuest.nextQuestId);
      } else {
        this.currentQuest = null;
        this.emitQuestUpdate();
      }
    }
  }

  public emitQuestUpdate(): void {
    EventBus.emit('quest:updated', {
      currentQuest: this.currentQuest,
      completedCount: this.completedQuestIds.size
    });
  }

  public serialize(): { activeQuestId: string | null; objectives: QuestObjective[]; completedIds: string[] } {
    return {
      activeQuestId: this.currentQuest ? this.currentQuest.id : null,
      objectives: this.currentQuest ? this.currentQuest.objectives : [],
      completedIds: Array.from(this.completedQuestIds)
    };
  }

  public deserialize(data: { activeQuestId: string | null; objectives: QuestObjective[]; completedIds: string[] }): void {
    this.completedQuestIds = new Set(data.completedIds || []);
    if (data.activeQuestId && QUESTS_DATA[data.activeQuestId]) {
      this.currentQuest = JSON.parse(JSON.stringify(QUESTS_DATA[data.activeQuestId]));
      if (data.objectives) {
        this.currentQuest!.objectives = data.objectives;
      }
    } else {
      this.startFirstQuest();
    }
    this.emitQuestUpdate();
  }
}

