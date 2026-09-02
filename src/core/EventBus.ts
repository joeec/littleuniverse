type EventHandler = (...args: any[]) => void;

class EventBusClass {
  private events: Map<string, EventHandler[]> = new Map();

  public on(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  public off(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) return;
    const handlers = this.events.get(event)!.filter(h => h !== handler);
    this.events.set(event, handlers);
  }

  public emit(event: string, ...args: any[]): void {
    if (!this.events.has(event)) return;
    const handlers = this.events.get(event)!;
    for (let i = 0; i < handlers.length; i++) {
      try {
        handlers[i](...args);
      } catch (err) {
        console.error(`[EventBus] Error in event '${event}':`, err);
      }
    }
  }

  public clear(): void {
    this.events.clear();
  }
}

export const EventBus = new EventBusClass();

