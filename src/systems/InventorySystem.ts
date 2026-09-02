import { EventBus } from '../core/EventBus';
import { RESOURCES, ResourceDefinition } from '../data/ResourcesData';

export interface InventoryItem {
  resourceId: string;
  amount: number;
}

export class InventorySystem {
  private items: Map<string, number> = new Map();
  private maxCapacity: number = 200;

  constructor(initialCapacity: number = 200) {
    this.maxCapacity = initialCapacity;

    // Escuchar actualizaciones de capacidad de mochila
    EventBus.on('player:stats_updated', (stats: { capacity: number }) => {
      this.maxCapacity = stats.capacity;
      this.emitChange();
    });
  }

  public getTotalItemCount(): number {
    let total = 0;
    for (const [id, count] of this.items.entries()) {
      // Las monedas de oro no ocupan espacio en mochila
      if (id !== 'gold_coin') {
        total += count;
      }
    }
    return total;
  }

  public getCapacity(): number {
    return this.maxCapacity;
  }

  public getAmount(resourceId: string): number {
    return this.items.get(resourceId) || 0;
  }

  public hasAmount(resourceId: string, amount: number): boolean {
    return this.getAmount(resourceId) >= amount;
  }

  public addItem(resourceId: string, amount: number): boolean {
    if (amount <= 0) return true;

    const current = this.getAmount(resourceId);
    const isGold = resourceId === 'gold_coin';
    const currentTotal = this.getTotalItemCount();

    if (!isGold && currentTotal + amount > this.maxCapacity) {
      const spaceLeft = Math.max(0, this.maxCapacity - currentTotal);
      if (spaceLeft > 0) {
        this.items.set(resourceId, current + spaceLeft);
        this.emitChange();
        EventBus.emit('hud:toast', { message: '¡Mochila Llena! Mejora tu mochila en la Forja.', type: 'warning' });
        return false;
      }
      EventBus.emit('hud:toast', { message: '¡Mochila Llena!', type: 'warning' });
      return false;
    }

    this.items.set(resourceId, current + amount);
    this.emitChange();
    EventBus.emit('quest:progress', { type: 'gather', targetId: resourceId, amount });
    return true;
  }

  public removeItem(resourceId: string, amount: number): boolean {
    const current = this.getAmount(resourceId);
    if (current < amount) return false;

    const remaining = current - amount;
    if (remaining <= 0) {
      this.items.delete(resourceId);
    } else {
      this.items.set(resourceId, remaining);
    }

    this.emitChange();
    return true;
  }

  public getAllItems(): { def: ResourceDefinition; amount: number }[] {
    const result: { def: ResourceDefinition; amount: number }[] = [];
    for (const [id, amount] of this.items.entries()) {
      const def = RESOURCES[id];
      if (def && amount > 0) {
        result.push({ def, amount });
      }
    }
    return result;
  }

  public setCapacity(capacity: number): void {
    this.maxCapacity = capacity;
    this.emitChange();
  }

  public serialize(): Record<string, number> {
    const data: Record<string, number> = {};
    for (const [id, amount] of this.items.entries()) {
      data[id] = amount;
    }
    return data;
  }

  public deserialize(data: Record<string, number>): void {
    this.items.clear();
    for (const [id, amount] of Object.entries(data)) {
      this.items.set(id, amount);
    }
    this.emitChange();
  }

  private emitChange(): void {
    EventBus.emit('inventory:updated', {
      items: this.getAllItems(),
      totalCount: this.getTotalItemCount(),
      maxCapacity: this.maxCapacity
    });
  }
}

