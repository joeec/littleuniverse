import { EventBus } from '../core/EventBus';
import { Player } from '../entities/Player';
import { InventorySystem } from '../systems/InventorySystem';
import { WorldManager } from '../systems/WorldManager';
import { TILE_SIZE } from '../data/WorldData';

export class HUD {
  private root: HTMLElement;
  private container: HTMLDivElement;

  private healthBarFill!: HTMLDivElement;
  private healthText!: HTMLSpanElement;
  private quickResContainer!: HTMLDivElement;
  private questTracker!: HTMLDivElement;
  private bossBarWrapper!: HTMLDivElement;
  private bossBarFill!: HTMLDivElement;
  private bossNameText!: HTMLDivElement;
  private bossTitleText!: HTMLDivElement;
  private toastContainer!: HTMLDivElement;
  private minimapCanvas!: HTMLCanvasElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.container = document.createElement('div');
    this.container.className = 'hud-root';
    this.buildHTML();
    this.setupListeners();
  }

  private buildHTML(): void {
    this.container.innerHTML = `
      <!-- TOP HUD -->
      <div class="hud-top">
        <div class="player-card glass-panel interactive">
          <div class="player-avatar">🧙‍♂️</div>
          <div class="health-bar-container">
            <div class="health-bar-bg">
              <div class="health-bar-fill" id="player-hp-fill" style="width: 100%;"></div>
            </div>
            <div class="health-text" id="player-hp-text">100 / 100</div>
          </div>
        </div>

        <!-- RECURSOS RÁPIDOS -->
        <div class="quick-resources glass-panel interactive" id="quick-res-bar">
          <div class="res-chip">🪵 <span id="qc-wood">0</span></div>
          <div class="res-chip">🪨 <span id="qc-stone">0</span></div>
          <div class="res-chip">🪙 <span id="qc-gold">0</span></div>
        </div>

        <!-- BOTONES DE ACCIÓN -->
        <div class="hud-actions interactive">
          <button class="hud-btn" id="btn-inv" title="Inventario [I]">🎒</button>
          <button class="hud-btn" id="btn-quest" title="Misiones [Q]">📜</button>
          <button class="hud-btn" id="btn-map" title="Mapa [M]">🗺️</button>
          <button class="hud-btn" id="btn-settings" title="Ajustes [Esc]">⚙️</button>
        </div>
      </div>

      <!-- RASTREADOR DE MISIÓN -->
      <div class="quest-tracker glass-panel interactive" id="quest-tracker-panel">
        <div class="quest-tracker-title" id="qt-title">Misión Principal</div>
        <div class="quest-tracker-desc" id="qt-desc">Explora y recolecta materiales.</div>
        <div id="qt-objectives"></div>
      </div>

      <!-- MINIMAPA -->
      <div class="minimap-wrapper glass-panel interactive">
        <canvas id="minimap-canvas" width="120" height="120"></canvas>
      </div>

      <!-- BARRA DE JEFE -->
      <div class="boss-bar-wrapper glass-panel" id="boss-bar-panel">
        <div class="boss-name" id="boss-name-label">Gólem Ancestral</div>
        <div class="boss-title" id="boss-title-label">Guardián del Valle</div>
        <div class="boss-bar-bg">
          <div class="boss-bar-fill" id="boss-hp-fill" style="width: 100%;"></div>
        </div>
      </div>

      <!-- CONTENEDOR DE TOASTS -->
      <div class="toast-container" id="toast-list"></div>
    `;

    this.root.appendChild(this.container);

    // Cache elements
    this.healthBarFill = this.container.querySelector('#player-hp-fill')!;
    this.healthText = this.container.querySelector('#player-hp-text')!;
    this.quickResContainer = this.container.querySelector('#quick-res-bar')!;
    this.questTracker = this.container.querySelector('#quest-tracker-panel')!;
    this.bossBarWrapper = this.container.querySelector('#boss-bar-panel')!;
    this.bossBarFill = this.container.querySelector('#boss-hp-fill')!;
    this.bossNameText = this.container.querySelector('#boss-name-label')!;
    this.bossTitleText = this.container.querySelector('#boss-title-label')!;
    this.toastContainer = this.container.querySelector('#toast-list')!;
    this.minimapCanvas = this.container.querySelector('#minimap-canvas')!;

    // Action button events
    this.container.querySelector('#btn-inv')!.addEventListener('click', () => EventBus.emit('ui:toggle_inventory'));
    this.container.querySelector('#btn-quest')!.addEventListener('click', () => EventBus.emit('ui:toggle_quests'));
    this.container.querySelector('#btn-map')!.addEventListener('click', () => EventBus.emit('ui:toggle_map'));
    this.container.querySelector('#btn-settings')!.addEventListener('click', () => EventBus.emit('ui:toggle_settings'));
  }

  private setupListeners(): void {
    EventBus.on('player:stats_updated', (data: { health: number; maxHealth: number }) => {
      this.updateHealth(data.health, data.maxHealth);
    });

    EventBus.on('player:damaged', (data: { currentHealth: number; maxHealth: number }) => {
      this.updateHealth(data.currentHealth, data.maxHealth);
    });

    EventBus.on('player:healed', (data: { currentHealth: number; maxHealth: number }) => {
      this.updateHealth(data.currentHealth, data.maxHealth);
    });

    EventBus.on('inventory:updated', (data: { items: { def: any; amount: number }[] }) => {
      this.updateQuickResources(data.items);
    });

    EventBus.on('quest:updated', (data: { currentQuest: any }) => {
      this.updateQuestTracker(data.currentQuest);
    });

    EventBus.on('boss:engaged', (data: { name: string; title: string; currentHealth: number; maxHealth: number }) => {
      this.showBossBar(data.name, data.title, data.currentHealth, data.maxHealth);
    });

    EventBus.on('boss:health_updated', (data: { currentHealth: number; maxHealth: number }) => {
      this.updateBossHealth(data.currentHealth, data.maxHealth);
    });

    EventBus.on('boss:defeated', () => {
      this.hideBossBar();
    });

    EventBus.on('hud:toast', (data: { message: string; type?: 'info' | 'success' | 'warning' | 'danger' }) => {
      this.showToast(data.message, data.type || 'info');
    });
  }

  public updateHealth(current: number, max: number): void {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    this.healthBarFill.style.width = `${pct}%`;
    this.healthText.textContent = `${Math.round(current)} / ${max}`;
  }

  public updateQuickResources(items: { def: any; amount: number }[]): void {
    const itemMap: Record<string, number> = {};
    for (const item of items) {
      itemMap[item.def.id] = item.amount;
    }

    const resIds = ['wood', 'stone', 'copper_ore', 'iron_ore', 'amber', 'crystal', 'gold_coin'];
    let html = '';
    for (const id of resIds) {
      const count = itemMap[id] || 0;
      if (count > 0 || id === 'wood' || id === 'stone' || id === 'gold_coin') {
        const icon = id === 'wood' ? '🪵' : id === 'stone' ? '🪨' : id === 'copper_ore' ? '🟤' : id === 'iron_ore' ? '⚙️' : id === 'amber' ? '🔶' : id === 'crystal' ? '🔮' : '🪙';
        html += `<div class="res-chip">${icon} <span>${count}</span></div>`;
      }
    }
    this.quickResContainer.innerHTML = html;
  }

  public updateQuestTracker(quest: any): void {
    if (!quest) {
      this.questTracker.style.display = 'none';
      return;
    }

    this.questTracker.style.display = 'flex';
    const titleEl = this.container.querySelector('#qt-title')!;
    const descEl = this.container.querySelector('#qt-desc')!;
    const objListEl = this.container.querySelector('#qt-objectives')!;

    titleEl.textContent = quest.title;
    descEl.textContent = quest.description;

    let objHtml = '';
    for (const obj of quest.objectives) {
      const isDone = obj.currentAmount >= obj.targetAmount;
      objHtml += `
        <div class="quest-obj-item ${isDone ? 'done' : ''}">
          <span>${obj.description}</span>
          <span>${obj.currentAmount} / ${obj.targetAmount}</span>
        </div>
      `;
    }
    objListEl.innerHTML = objHtml;
  }

  public showBossBar(name: string, title: string, current: number, max: number): void {
    this.bossNameText.textContent = name;
    this.bossTitleText.textContent = title;
    this.updateBossHealth(current, max);
    this.bossBarWrapper.style.display = 'block';
  }

  public updateBossHealth(current: number, max: number): void {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    this.bossBarFill.style.width = `${pct}%`;
  }

  public hideBossBar(): void {
    this.bossBarWrapper.style.display = 'none';
  }

  public showToast(msg: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info'): void {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Renderizado dinámico del radar de minimapa
  public updateMinimap(player: Player, world: WorldManager): void {
    const ctx = this.minimapCanvas.getContext('2d');
    if (!ctx) return;

    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const scale = 2.4; // Pixels per world unit

    ctx.clearRect(0, 0, w, h);

    // Fondo del minimapa
    ctx.fillStyle = '#0B132B';
    ctx.fillRect(0, 0, w, h);

    // Dibujar losas descubiertas
    for (const tile of world.tiles.values()) {
      if (!tile.isUnlocked) continue;

      const relX = (tile.group.position.x - player.position.x) * scale;
      const relZ = (tile.group.position.z - player.position.z) * scale;

      const px = centerX + relX;
      const py = centerY + relZ;

      if (px >= -20 && px <= w + 20 && py >= -20 && py <= h + 20) {
        let tileColor = '#3A5A40';
        if (tile.data.biome === 'amberwood') tileColor = '#8C4A15';
        if (tile.data.biome === 'crystal_caverns') tileColor = '#4A154B';
        if (tile.data.biome === 'molten_peaks') tileColor = '#9D0208';

        ctx.fillStyle = tileColor;
        ctx.beginPath();
        ctx.arc(px, py, (TILE_SIZE / 2) * scale * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dibujar NPCs
    for (const npc of world.npcs) {
      const relX = (npc.position.x - player.position.x) * scale;
      const relZ = (npc.position.z - player.position.z) * scale;
      const px = centerX + relX;
      const py = centerY + relZ;

      if (px >= 0 && px <= w && py >= 0 && py <= h) {
        ctx.fillStyle = '#FFD166';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dibujar Jefes
    for (const boss of world.bosses) {
      if (boss.isDefeated) continue;
      const relX = (boss.position.x - player.position.x) * scale;
      const relZ = (boss.position.z - player.position.z) * scale;
      const px = centerX + relX;
      const py = centerY + relZ;

      if (px >= 0 && px <= w && py >= 0 && py <= h) {
        ctx.fillStyle = '#EF476F';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dibujar Jugador en el centro
    ctx.fillStyle = '#00F5D4';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

