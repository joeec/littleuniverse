import { Player } from '../entities/Player';
import { InventorySystem } from '../systems/InventorySystem';
import { ToolType, TOOLS_DATA } from '../data/ToolsData';
import { RESOURCES } from '../data/ResourcesData';
import { AudioSys } from '../systems/AudioManager';
import { EventBus } from '../core/EventBus';

export class UpgradeUI {
  private root: HTMLElement;
  private modal: HTMLDivElement | null = null;
  private inventory: InventorySystem;
  private player: Player;

  constructor(root: HTMLElement, inventory: InventorySystem, player: Player) {
    this.root = root;
    this.inventory = inventory;
    this.player = player;

    EventBus.on('ui:open_forge', () => this.open());
    EventBus.on('inventory:updated', () => {
      if (this.modal) this.renderList();
    });
  }

  public open(): void {
    if (this.modal) return;

    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay interactive';
    this.modal.innerHTML = `
      <div class="modal-content glass-panel" style="max-width: 620px;">
        <div class="modal-header">
          <div class="modal-title">🔥 Gran Forja de Aethelgard</div>
          <button class="modal-close-btn" id="forge-close">&times;</button>
        </div>
        <div style="font-size: 13px; color: #CBD5E1;">Mejora tus herramientas, armas y equipamiento para recolectar minerales más duros y resistir a los enemigos.</div>
        <div class="upgrade-list" id="forge-upgrade-list"></div>
      </div>
    `;

    this.root.appendChild(this.modal);
    this.modal.querySelector('#forge-close')!.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.renderList();
  }

  public close(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  private renderList(): void {
    if (!this.modal) return;
    const listEl = this.modal.querySelector('#forge-upgrade-list')!;

    const toolTypes: ToolType[] = ['axe', 'pickaxe', 'sword', 'armor', 'backpack'];
    let html = '';

    for (const tool of toolTypes) {
      const curLvl = this.player.toolLevels[tool] || 1;
      const curData = TOOLS_DATA[tool][curLvl - 1];
      const nextData = TOOLS_DATA[tool][curLvl];
      const isMax = !nextData;

      let costHtml = '';
      let canAfford = true;

      if (!isMax && nextData) {
        costHtml = '<div class="upgrade-cost">';
        for (const req of nextData.upgradeCost) {
          const res = RESOURCES[req.resourceId];
          const has = this.inventory.getAmount(req.resourceId);
          const icon = res ? res.icon : '📦';
          const ok = has >= req.amount;
          if (!ok) canAfford = false;

          costHtml += `<span style="color: ${ok ? '#06D6A0' : '#EF476F'};">${icon} ${has}/${req.amount}</span> `;
        }
        costHtml += '</div>';
      }

      html += `
        <div class="upgrade-card">
          <div style="font-size: 36px;">${curData ? curData.icon : '⚒️'}</div>
          <div class="upgrade-info" style="flex: 1;">
            <div class="upgrade-name">${curData ? curData.name : tool} (Nvl ${curLvl})</div>
            <div class="upgrade-desc">${isMax ? '¡Nivel Máximo Alcanzado!' : nextData.description}</div>
            ${!isMax ? `<div style="font-size: 12px; color: #00F5D4; font-weight: 700;">Próximo: ${nextData.statLabel} +${nextData.statValue}</div>` : ''}
            ${costHtml}
          </div>
          <div>
            ${
              isMax
                ? '<button class="btn-primary" disabled>MÁXIMO</button>'
                : `<button class="btn-primary" data-tool="${tool}" ${!canAfford ? 'disabled' : ''}>MEJORAR</button>`
            }
          </div>
        </div>
      `;
    }

    listEl.innerHTML = html;

    // Conectar botones de mejora
    listEl.querySelectorAll('button[data-tool]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetTool = (e.currentTarget as HTMLElement).getAttribute('data-tool') as ToolType;
        this.performUpgrade(targetTool);
      });
    });
  }

  private performUpgrade(tool: ToolType): void {
    const curLvl = this.player.toolLevels[tool] || 1;
    const nextData = TOOLS_DATA[tool][curLvl];
    if (!nextData) return;

    // Verificar y descontar recursos
    for (const req of nextData.upgradeCost) {
      if (!this.inventory.hasAmount(req.resourceId, req.amount)) return;
    }

    for (const req of nextData.upgradeCost) {
      this.inventory.removeItem(req.resourceId, req.amount);
    }

    // Aumentar nivel
    this.player.toolLevels[tool] = curLvl + 1;
    this.player.applyEquippedStats();
    this.player.updateToolMesh();

    AudioSys.playSFX('level_up');
    EventBus.emit('quest:progress', { type: 'upgrade', targetId: tool, amount: 1 });
    EventBus.emit('hud:toast', {
      message: `✨ ¡${nextData.name} forjado con éxito!`,
      type: 'success'
    });

    this.renderList();
  }
}

