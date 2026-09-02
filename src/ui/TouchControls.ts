import { InputManager } from '../core/InputManager';

export class TouchControls {
  private root: HTMLElement;
  private container: HTMLDivElement | null = null;
  private inputManager: InputManager;

  private isDragging: boolean = false;
  private touchId: number | null = null;
  private startX: number = 0;
  private startY: number = 0;
  private knobEl!: HTMLDivElement;

  constructor(root: HTMLElement, inputManager: InputManager) {
    this.root = root;
    this.inputManager = inputManager;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || window.innerWidth < 1024) {
      this.init();
    }
  }

  private init(): void {
    this.container = document.createElement('div');
    this.container.className = 'touch-controls interactive';
    this.container.innerHTML = `
      <div class="touch-joystick-zone" id="touch-joystick">
        <div class="touch-joystick-knob" id="touch-knob"></div>
      </div>
      <div class="touch-action-buttons">
        <button class="touch-action-btn" id="btn-touch-dash" title="Dash">💨</button>
        <button class="touch-action-btn" id="btn-touch-attack" title="Ataque">⚔️</button>
      </div>
    `;

    this.root.appendChild(this.container);

    const zone = this.container.querySelector('#touch-joystick') as HTMLDivElement;
    this.knobEl = this.container.querySelector('#touch-knob') as HTMLDivElement;

    // Joystick Touch events
    zone.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isDragging = true;
      this.touchId = e.pointerId;
      const rect = zone.getBoundingClientRect();
      this.startX = rect.left + rect.width / 2;
      this.startY = rect.top + rect.height / 2;
      this.handlePointerMove(e.clientX, e.clientY);
      zone.setPointerCapture(e.pointerId);
    });

    zone.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.isDragging && e.pointerId === this.touchId) {
        this.handlePointerMove(e.clientX, e.clientY);
      }
    });

    const endDrag = (e: PointerEvent) => {
      if (this.isDragging && e.pointerId === this.touchId) {
        this.isDragging = false;
        this.touchId = null;
        this.knobEl.style.transform = 'translate(0px, 0px)';
        this.inputManager.setTouchMovement(0, 0);
      }
    };

    zone.addEventListener('pointerup', endDrag);
    zone.addEventListener('pointercancel', endDrag);

    // Botones de acción táctiles
    this.container.querySelector('#btn-touch-dash')!.addEventListener('click', () => {
      this.inputManager.triggerDash();
    });

    this.container.querySelector('#btn-touch-attack')!.addEventListener('click', () => {
      this.inputManager.triggerAttack();
    });
  }

  private handlePointerMove(clientX: number, clientY: number): void {
    const maxRadius = 45;
    let dx = clientX - this.startX;
    let dy = clientY - this.startY;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    this.knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
    this.inputManager.setTouchMovement(dx / maxRadius, dy / maxRadius);
  }
}

