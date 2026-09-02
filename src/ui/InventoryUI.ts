import { InventorySystem } from '../systems/InventorySystem';
import { Player } from '../entities/Player';
import { EventBus } from '../core/EventBus';

export class InventoryUI {
  private root: HTMLElement;
  private modal: HTMLDivElement | null = null;
  private inventory: InventorySystem;
  private player: Player;

  constructor(root: HTMLElement, inventory: InventorySystem, player: Player) {
    this.root = root;
    this.inventory = inventory;
    this.player = player;

    EventBus.on('ui:toggle_inventory', () => this.toggle());
    EventBus.on('inventory:updated', () => {
      if (this.modal) this.renderContent();
    });
  }

  public toggle(): void {
    if (this.modal) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    if (this.modal) return;

    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay interactive';
    this.modal.innerHTML = `
      <div class="modal-content glass-panel">
        <div class="modal-header">
          <div class="modal-title">🎒 Mochila de Aventurero</div>
          <button class="modal-close-btn" id="inv-close">&times;</button>
        </div>
        <div id="inv-capacity-label" style="font-size: 13px; color: #94A3B8; font-weight: 700;"></div>
        <div class="inventory-grid" id="inv-items-grid"></div>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; margin-top: 8px;">
          <div style="font-size: 14px; font-weight: 800; color: #FFD166; margin-bottom: 8px;">⚔️ Estadísticas de Equipamiento</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; color: #E2E8F0;" id="inv-stats-grid"></div>
        </div>
      </div>
    `;

    this.root.appendChild(this.modal);
    this.modal.querySelector('#inv-close')!.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.renderContent();
  }

  public close(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  private renderContent(): void {
    if (!this.modal) return;

    const capLabel = this.modal.querySelector('#inv-capacity-label')!;
    const grid = this.modal.querySelector('#inv-items-grid')!;
    const statsGrid = this.modal.querySelector('#inv-stats-grid')!;

    const total = this.inventory.getTotalItemCount();
    const max = this.inventory.getCapacity();
    capLabel.textContent = `Capacidad: ${total} / ${max} recursos`;

    const items = this.inventory.getAllItems();
    if (items.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #64748B; padding: 24px;">Mochila vacía. ¡Explora y recolecta madera, piedras y minerales!</div>';
    } else {
      let html = '';
      for (const item of items) {
        html += `
          <div class="inv-slot" title="${item.def.name}: ${item.def.description}">
            <div class="inv-icon">${item.def.icon}</div>
            <div class="inv-count">${item.amount}</div>
          </div>
        `;
      }
      grid.innerHTML = html;
    }

    statsGrid.innerHTML = `
      <div>❤️ Vida Máxima: <b>${this.player.maxHealth}</b></div>
      <div>⚔️ Daño Ataque: <b>${this.player.attackDamage}</b></div>
      <div>🪓 Poder Hacha: <b>Nvl ${this.player.toolLevels.axe}</b></div>
      <div>⛏️ Poder Pico: <b>Nvl ${this.player.toolLevels.pickaxe}</b></div>
    `;
  }
}

