import { AudioSys } from '../systems/AudioManager';
import { SaveManager } from '../systems/SaveManager';
import { EventBus } from '../core/EventBus';

export class SettingsUI {
  private root: HTMLElement;
  private modal: HTMLDivElement | null = null;
  private onSaveCallback?: () => void;
  private onResetCallback?: () => void;

  constructor(root: HTMLElement, onSave?: () => void, onReset?: () => void) {
    this.root = root;
    this.onSaveCallback = onSave;
    this.onResetCallback = onReset;

    EventBus.on('ui:toggle_settings', () => this.toggle());
    EventBus.on('ui:toggle_pause', () => this.toggle());
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

    const audioSettings = AudioSys.getSettings();

    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay interactive';
    this.modal.innerHTML = `
      <div class="modal-content glass-panel" style="max-width: 480px;">
        <div class="modal-header">
          <div class="modal-title">⚙️ Configuración del Juego</div>
          <button class="modal-close-btn" id="set-close">&times;</button>
        </div>

        <!-- VOLUMEN GENERAL -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
              <span>🔊 Volumen General</span>
              <span id="vol-master-val">${Math.round(audioSettings.masterVolume * 100)}%</span>
            </div>
            <input type="range" id="vol-master-slider" min="0" max="1" step="0.05" value="${audioSettings.masterVolume}" style="width: 100%; cursor: pointer;" />
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
              <span>🎵 Música Ambiental</span>
              <span id="vol-music-val">${Math.round(audioSettings.musicVolume * 100)}%</span>
            </div>
            <input type="range" id="vol-music-slider" min="0" max="1" step="0.05" value="${audioSettings.musicVolume}" style="width: 100%; cursor: pointer;" />
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
              <span>💥 Efectos de Sonido (SFX)</span>
              <span id="vol-sfx-val">${Math.round(audioSettings.sfxVolume * 100)}%</span>
            </div>
            <input type="range" id="vol-sfx-slider" min="0" max="1" step="0.05" value="${audioSettings.sfxVolume}" style="width: 100%; cursor: pointer;" />
          </div>
        </div>

        <!-- PANTALLA COMPLETA & CONTROLES -->
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px; display: flex; flex-direction: column; gap: 10px;">
          <button class="btn-primary" id="btn-fullscreen" style="background: rgba(255,255,255,0.1); color: white;">🖥️ Alternar Pantalla Completa</button>
          <button class="btn-primary" id="btn-manual-save" style="background: linear-gradient(135deg, #06D6A0, #00F5D4);">💾 Guardar Partida Manual</button>
          <button class="btn-primary" id="btn-reset-game" style="background: rgba(239, 71, 111, 0.2); color: #EF476F; border: 1px solid #EF476F;">⚠️ Borrar Datos y Reiniciar</button>
        </div>
      </div>
    `;

    this.root.appendChild(this.modal);
    this.modal.querySelector('#set-close')!.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Sliders
    const mSlider = this.modal.querySelector('#vol-master-slider') as HTMLInputElement;
    const muSlider = this.modal.querySelector('#vol-music-slider') as HTMLInputElement;
    const sSlider = this.modal.querySelector('#vol-sfx-slider') as HTMLInputElement;

    mSlider.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      AudioSys.setMasterVolume(val);
      this.modal!.querySelector('#vol-master-val')!.textContent = `${Math.round(val * 100)}%`;
    });

    muSlider.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      AudioSys.setMusicVolume(val);
      this.modal!.querySelector('#vol-music-val')!.textContent = `${Math.round(val * 100)}%`;
    });

    sSlider.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      AudioSys.setSFXVolume(val);
      this.modal!.querySelector('#vol-sfx-val')!.textContent = `${Math.round(val * 100)}%`;
      AudioSys.playSFX('ui_click');
    });

    // Pantalla completa
    this.modal.querySelector('#btn-fullscreen')!.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Guardar
    this.modal.querySelector('#btn-manual-save')!.addEventListener('click', () => {
      if (this.onSaveCallback) this.onSaveCallback();
    });

    // Reiniciar
    this.modal.querySelector('#btn-reset-game')!.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas borrar tu progreso y reiniciar el juego?')) {
        SaveManager.clearSaveGame();
        if (this.onResetCallback) this.onResetCallback();
        window.location.reload();
      }
    });
  }

  public close(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}

