import { SaveManager } from '../systems/SaveManager';
import { AudioSys } from '../systems/AudioManager';
import { EventBus } from '../core/EventBus';

export class MainMenuUI {
  private root: HTMLElement;
  private overlay: HTMLDivElement | null = null;
  private onStartNewGame: () => void;
  private onContinueGame: () => void;

  constructor(root: HTMLElement, onStartNew: () => void, onContinue: () => void) {
    this.root = root;
    this.onStartNewGame = onStartNew;
    this.onContinueGame = onContinue;
    this.show();
  }

  public show(): void {
    if (this.overlay) return;

    const hasSave = SaveManager.hasSaveGame();

    this.overlay = document.createElement('div');
    this.overlay.className = 'main-menu-overlay interactive';
    this.overlay.innerHTML = `
      <div class="menu-title">REALMCRAFTER</div>
      <div class="menu-subtitle">ECHOES OF AETHELGARD</div>

      <div class="menu-btn-group">
        <button class="menu-btn" id="mm-btn-continue" ${!hasSave ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
          ▶️ CONTINUAR PARTIDA
        </button>
        <button class="menu-btn" id="mm-btn-new">
          ⚔️ NUEVA PARTIDA
        </button>
        <button class="menu-btn" id="mm-btn-settings">
          ⚙️ CONFIGURACIÓN
        </button>
        <button class="menu-btn" id="mm-btn-credits">
          📜 CRÉDITOS
        </button>
      </div>

      <div style="font-size: 12px; color: #64748B; margin-top: 18px; text-align: center;">
        Controles: [WASD / Flechas] Moverse &bull; [Espacio] Dash &bull; [Click / E] Atacar/Interpretar &bull; [I] Mochila &bull; [M] Mapa
      </div>
    `;

    this.root.appendChild(this.overlay);

    this.overlay.querySelector('#mm-btn-new')!.addEventListener('click', () => {
      AudioSys.playSFX('ui_click');
      AudioSys.playMusicTheme('peaceful_meadow');
      this.hide();
      this.onStartNewGame();
    });

    if (hasSave) {
      this.overlay.querySelector('#mm-btn-continue')!.addEventListener('click', () => {
        AudioSys.playSFX('ui_click');
        AudioSys.playMusicTheme('peaceful_meadow');
        this.hide();
        this.onContinueGame();
      });
    }

    this.overlay.querySelector('#mm-btn-settings')!.addEventListener('click', () => {
      AudioSys.playSFX('ui_click');
      EventBus.emit('ui:toggle_settings');
    });

    this.overlay.querySelector('#mm-btn-credits')!.addEventListener('click', () => {
      AudioSys.playSFX('ui_click');
      alert('REALMCRAFTER: Echoes of Aethelgard\n\nDesarrollado con Three.js, TypeScript y WebGL.\nDiseño, música sintética, mecánicas y assets 100% originales.');
    });
  }

  public hide(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

