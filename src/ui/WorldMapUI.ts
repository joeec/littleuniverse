import { WorldManager } from '../systems/WorldManager';
import { Player } from '../entities/Player';
import { BIOMES } from '../data/WorldData';
import { EventBus } from '../core/EventBus';

export class WorldMapUI {
  private root: HTMLElement;
  private modal: HTMLDivElement | null = null;
  private world: WorldManager;
  private player: Player;

  constructor(root: HTMLElement, world: WorldManager, player: Player) {
    this.root = root;
    this.world = world;
    this.player = player;

    EventBus.on('ui:toggle_map', () => this.toggle());
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
      <div class="modal-content glass-panel" style="max-width: 680px;">
        <div class="modal-header">
          <div class="modal-title">🗺️ Mapa del Reino de Aethelgard</div>
          <button class="modal-close-btn" id="map-close">&times;</button>
        </div>
        <div style="font-size: 13px; color: #94A3B8;">Regiones descubiertas y puntos de interés del mundo.</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 8px;" id="map-biomes-grid"></div>
      </div>
    `;

    this.root.appendChild(this.modal);
    this.modal.querySelector('#map-close')!.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.renderBiomes();
  }

  public close(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  private renderBiomes(): void {
    if (!this.modal) return;
    const grid = this.modal.querySelector('#map-biomes-grid')!;

    const unlockedTileIds = new Set(this.world.getUnlockedTileIds());
    let html = '';

    const biomeKeys = ['verdant', 'amberwood', 'crystal_caverns', 'molten_peaks'];
    for (const key of biomeKeys) {
      const def = BIOMES[key];
      // Comprobar si al menos 1 losa de este bioma está desbloqueada
      let isDiscovered = false;
      let totalTilesInBiome = 0;
      let unlockedInBiome = 0;

      for (const tile of this.world.tiles.values()) {
        if (tile.data.biome === key) {
          totalTilesInBiome++;
          if (tile.isUnlocked) {
            isDiscovered = true;
            unlockedInBiome++;
          }
        }
      }

      const isCurrent = this.world.currentBiome === key;

      html += `
        <div style="padding: 14px; background: rgba(0,0,0,0.4); border: 1.5px solid ${isCurrent ? 'var(--accent)' : 'var(--glass-border)'}; border-radius: 14px; display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 15px; font-weight: 800; color: ${isDiscovered ? '#FFD166' : '#64748B'};">${def.name}</div>
            ${isCurrent ? '<span style="font-size: 11px; background: var(--accent); color: black; padding: 2px 6px; border-radius: 10px; font-weight: 800;">AQUÍ</span>' : ''}
          </div>
          <div style="font-size: 12px; color: ${isDiscovered ? '#CBD5E1' : '#475569'};">${isDiscovered ? def.description : '🔒 Región desconocida. Desbloquea losas para llegar.'}</div>
          <div style="font-size: 11px; font-weight: 700; color: ${isDiscovered ? '#06D6A0' : '#64748B'}; margin-top: 4px;">
            ${isDiscovered ? `Losas exploradas: ${unlockedInBiome} / ${totalTilesInBiome}` : '0%'}
          </div>
        </div>
      `;
    }

    grid.innerHTML = html;
  }
}

