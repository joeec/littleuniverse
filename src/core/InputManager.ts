import { EventBus } from './EventBus';

export interface MovementVector {
  x: number; // -1 to 1
  z: number; // -1 to 1
  length: number;
}

export class InputManager {
  private keys: Set<string> = new Set();
  private movementVector: MovementVector = { x: 0, z: 0, length: 0 };
  private touchVector: MovementVector = { x: 0, z: 0, length: 0 };
  private isDashPressed: boolean = false;
  private isAttackPressed: boolean = false;
  private isInteractPressed: boolean = false;
  private isMouseMoving: boolean = false;
  private mouseTarget: { x: number; z: number } | null = null;
  private gamepadIndex: number | null = null;

  constructor() {
    this.setupKeyboardListeners();
    this.setupGamepadListeners();
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Avoid hotkey interference when user is typing in inputs if any
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      this.keys.add(e.code);

      if (e.code === 'Space') {
        e.preventDefault();
        this.isDashPressed = true;
        EventBus.emit('input:dash');
      }

      if (e.code === 'KeyE' || e.code === 'KeyF') {
        this.isInteractPressed = true;
        EventBus.emit('input:interact');
      }

      if (e.code === 'KeyI' || e.code === 'Tab') {
        e.preventDefault();
        EventBus.emit('ui:toggle_inventory');
      }

      if (e.code === 'KeyM') {
        EventBus.emit('ui:toggle_map');
      }

      if (e.code === 'KeyQ' || e.code === 'KeyL') {
        EventBus.emit('ui:toggle_quests');
      }

      if (e.code === 'Escape') {
        EventBus.emit('ui:toggle_pause');
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keys.delete(e.code);

      if (e.code === 'Space') {
        this.isDashPressed = false;
      }
      if (e.code === 'KeyE' || e.code === 'KeyF') {
        this.isInteractPressed = false;
      }
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.movementVector = { x: 0, z: 0, length: 0 };
    });
  }

  private setupGamepadListeners(): void {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      console.log(`Gamepad conectado: ${e.gamepad.id}`);
      this.gamepadIndex = e.gamepad.index;
      EventBus.emit('hud:toast', { message: '🎮 Control conectado', type: 'info' });
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadIndex = null;
      EventBus.emit('hud:toast', { message: 'Control desconectado', type: 'info' });
    });
  }

  public setTouchMovement(x: number, z: number): void {
    const len = Math.sqrt(x * x + z * z);
    if (len > 0.05) {
      this.touchVector = {
        x: x / (len > 1 ? len : 1),
        z: z / (len > 1 ? len : 1),
        length: Math.min(len, 1.0)
      };
    } else {
      this.touchVector = { x: 0, z: 0, length: 0 };
    }
  }

  public triggerDash(): void {
    EventBus.emit('input:dash');
  }

  public triggerAttack(): void {
    EventBus.emit('input:attack');
  }

  public triggerInteract(): void {
    EventBus.emit('input:interact');
  }

  public update(): MovementVector {
    let x = 0;
    let z = 0;

    // Keyboard WASD & Arrows
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) z -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) z += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;

    // Normalizar teclado
    const keyLen = Math.sqrt(x * x + z * z);
    if (keyLen > 0) {
      x /= keyLen;
      z /= keyLen;
    }

    // Touch Input
    if (this.touchVector.length > 0) {
      x = this.touchVector.x;
      z = this.touchVector.z;
    }

    // Gamepad Input
    if (this.gamepadIndex !== null) {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[this.gamepadIndex];
      if (gp) {
        const deadzone = 0.2;
        const axisX = gp.axes[0] || 0;
        const axisZ = gp.axes[1] || 0;
        const gpLen = Math.sqrt(axisX * axisX + axisZ * axisZ);
        if (gpLen > deadzone) {
          x = axisX;
          z = axisZ;
        }

        // Gamepad buttons (0 = A/Cross, 1 = B/Circle, 2 = X/Square, 3 = Y/Triangle)
        if (gp.buttons[0]?.pressed && !this.isDashPressed) {
          this.isDashPressed = true;
          this.triggerDash();
        } else if (!gp.buttons[0]?.pressed) {
          this.isDashPressed = false;
        }

        if (gp.buttons[2]?.pressed && !this.isAttackPressed) {
          this.isAttackPressed = true;
          this.triggerAttack();
        } else if (!gp.buttons[2]?.pressed) {
          this.isAttackPressed = false;
        }

        if (gp.buttons[9]?.pressed) { // Start button
          EventBus.emit('ui:toggle_pause');
        }
      }
    }

    const totalLen = Math.sqrt(x * x + z * z);
    this.movementVector = {
      x,
      z,
      length: Math.min(totalLen, 1.0)
    };

    return this.movementVector;
  }

  public getMovementVector(): MovementVector {
    return this.movementVector;
  }
}

