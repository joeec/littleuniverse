import * as THREE from 'three';
import { MeshFactory } from '../rendering/MeshFactory';
import { ToolType, TOOLS_DATA } from '../data/ToolsData';
import { MovementVector } from '../core/InputManager';
import { EventBus } from '../core/EventBus';

export class Player {
  public group: THREE.Group;
  public position: THREE.Vector3;
  private bodyMesh: THREE.Mesh;
  private backpackMesh: THREE.Mesh;
  private rightHand: THREE.Group;
  private leftHand: THREE.Group;
  private toolGroup: THREE.Group;
  private capeMesh: THREE.Mesh;
  private hairMesh: THREE.Group;

  // Estadísticas
  public maxHealth: number = 100;
  public currentHealth: number = 100;
  public speed: number = 7.0;
  public attackDamage: number = 15;
  public harvestSpeedMultiplier: number = 1.0;
  public inventoryCapacity: number = 200;

  public toolLevels: Record<ToolType, number> = {
    axe: 1,
    pickaxe: 1,
    sword: 1,
    armor: 1,
    backpack: 1
  };
  public currentToolType: ToolType = 'axe';

  // Animaciones
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private isMoving: boolean = false;
  private moveAngle: number = 0;
  private walkTime: number = 0;

  // Dash
  private isDashing: boolean = false;
  private dashDuration: number = 0.22;
  private dashTimer: number = 0;
  private dashCooldown: number = 0.8;
  private dashCooldownTimer: number = 0;
  private dashDir: THREE.Vector3 = new THREE.Vector3(0, 0, 1);

  // Combate
  public isInvulnerable: boolean = false;
  private invulnerableTimer: number = 0;
  private flashTimer: number = 0;

  private isSwinging: boolean = false;
  private swingTimer: number = 0;
  private swingDuration: number = 0.25;

  constructor(startPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
    const parts = MeshFactory.createPlayerMesh();
    this.group = parts.group;
    this.bodyMesh = parts.bodyMesh;
    this.backpackMesh = parts.backpackMesh;
    this.rightHand = parts.rightHand;
    this.leftHand = parts.leftHand;
    this.toolGroup = parts.toolGroup;
    this.capeMesh = parts.capeMesh;
    this.hairMesh = parts.hairMesh;

    this.position = this.group.position;
    this.position.copy(startPos);

    this.updateToolMesh();
    this.applyEquippedStats();
  }

  public applyEquippedStats(): void {
    const armorLvl = this.toolLevels.armor;
    const armorData = TOOLS_DATA.armor[armorLvl - 1] || TOOLS_DATA.armor[0];
    const prevMax = this.maxHealth;
    this.maxHealth = armorData.statValue;
    if (this.currentHealth > this.maxHealth || prevMax !== this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + (this.maxHealth - prevMax));
    }

    const swordLvl = this.toolLevels.sword;
    const swordData = TOOLS_DATA.sword[swordLvl - 1] || TOOLS_DATA.sword[0];
    this.attackDamage = swordData.statValue;

    const bpLvl = this.toolLevels.backpack;
    const bpData = TOOLS_DATA.backpack[bpLvl - 1] || TOOLS_DATA.backpack[0];
    this.inventoryCapacity = bpData.statValue;

    EventBus.emit('player:stats_updated', {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      damage: this.attackDamage,
      capacity: this.inventoryCapacity
    });
  }

  public setEquippedTool(type: ToolType): void {
    if (this.currentToolType !== type) {
      this.currentToolType = type;
      this.updateToolMesh();
    }
  }

  public updateToolMesh(): void {
    while (this.toolGroup.children.length > 0) {
      this.toolGroup.remove(this.toolGroup.children[0]);
    }

    const lvl = this.toolLevels[this.currentToolType] || 1;
    let colorHex = 0xD2691E;
    if (lvl === 1) colorHex = 0x8A8A8A;
    if (lvl === 3) colorHex = 0xCBD5E0;
    if (lvl === 4) colorHex = 0x00B4D8;
    if (lvl === 5) colorHex = 0xE63946;

    if (this.currentToolType === 'axe' || this.currentToolType === 'pickaxe' || this.currentToolType === 'sword') {
      const mesh = MeshFactory.createToolMesh(this.currentToolType, colorHex);
      this.toolGroup.add(mesh);
    }
  }

  public getToolPower(type: ToolType): number {
    const lvl = this.toolLevels[type] || 1;
    const data = TOOLS_DATA[type]?.[lvl - 1];
    return data ? data.power : 1;
  }

  public getToolHarvestDamage(type: ToolType): number {
    const lvl = this.toolLevels[type] || 1;
    const data = TOOLS_DATA[type]?.[lvl - 1];
    return data ? data.statValue : 10;
  }

  public triggerSwing(toolType?: ToolType): void {
    if (toolType) this.setEquippedTool(toolType);
    this.isSwinging = true;
    this.swingTimer = this.swingDuration;
  }

  public dash(): boolean {
    if (this.dashCooldownTimer > 0 || this.isDashing) return false;

    this.isDashing = true;
    this.dashTimer = this.dashDuration;
    this.dashCooldownTimer = this.dashCooldown;
    this.isInvulnerable = true;
    this.invulnerableTimer = this.dashDuration + 0.12;

    if (this.velocity.length() > 0.1) {
      this.dashDir.copy(this.velocity).normalize();
    } else {
      this.dashDir.set(Math.sin(this.moveAngle), 0, Math.cos(this.moveAngle));
    }

    return true;
  }

  public takeDamage(amount: number): boolean {
    if (this.isInvulnerable || this.currentHealth <= 0) return false;

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.isInvulnerable = true;
    this.invulnerableTimer = 0.6;

    EventBus.emit('player:damaged', {
      amount,
      currentHealth: this.currentHealth,
      maxHealth: this.maxHealth
    });

    if (this.currentHealth <= 0) {
      EventBus.emit('player:dead');
    }

    return true;
  }

  public heal(amount: number): void {
    if (this.currentHealth >= this.maxHealth) return;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    EventBus.emit('player:healed', {
      amount,
      currentHealth: this.currentHealth,
      maxHealth: this.maxHealth
    });
  }

  public update(delta: number, input: MovementVector): void {
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= delta;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.group.visible = true;
      } else {
        this.flashTimer += delta * 25;
        this.group.visible = Math.floor(this.flashTimer) % 2 === 0;
      }
    }

    if (this.isDashing) {
      this.dashTimer -= delta;
      const dashSpeed = this.speed * 2.8;
      this.position.addScaledVector(this.dashDir, dashSpeed * delta);

      // Inclinación y cape flameo hacia atrás durante el dash
      this.capeMesh.rotation.x = 0.75;

      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    } else {
      const targetVx = input.x * this.speed;
      const targetVz = input.z * this.speed;

      this.velocity.x += (targetVx - this.velocity.x) * 16.0 * delta;
      this.velocity.z += (targetVz - this.velocity.z) * 16.0 * delta;

      this.position.addScaledVector(this.velocity, delta);

      this.isMoving = input.length > 0.05;
      if (this.isMoving) {
        this.moveAngle = Math.atan2(input.x, input.z);
        const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.moveAngle);
        this.group.quaternion.slerp(targetQuat, 18.0 * delta);
        this.walkTime += delta * 14.0;
      }
    }

    // Animación de correr con inercia de capa y pelo
    if (this.isMoving && !this.isDashing) {
      this.bodyMesh.position.y = 0.62 + Math.abs(Math.sin(this.walkTime)) * 0.09;
      this.leftHand.position.z = Math.sin(this.walkTime) * 0.22;
      this.leftHand.position.y = 0.68 + Math.cos(this.walkTime) * 0.06;

      // Cape ondea con el movimiento
      this.capeMesh.rotation.x = 0.25 + Math.abs(Math.sin(this.walkTime)) * 0.25;

      if (!this.isSwinging) {
        this.rightHand.position.z = -Math.sin(this.walkTime) * 0.22;
        this.rightHand.position.y = 0.68 - Math.cos(this.walkTime) * 0.06;
        this.rightHand.rotation.x = 0;
      }
    } else if (!this.isSwinging) {
      this.bodyMesh.position.y = 0.62 + Math.sin(Date.now() * 0.003) * 0.02;
      this.capeMesh.rotation.x = 0.18 + Math.sin(Date.now() * 0.004) * 0.05;
      this.leftHand.position.set(-0.44, 0.68, 0);
      this.rightHand.position.set(0.44, 0.68, 0);
      this.rightHand.rotation.set(0, 0, 0);
    }

    // Animación de ataque / tala fluida
    if (this.isSwinging) {
      this.swingTimer -= delta;
      const progress = 1 - (this.swingTimer / this.swingDuration);
      const swingAngle = Math.sin(progress * Math.PI) * 1.6;
      this.rightHand.rotation.x = -swingAngle;
      this.rightHand.position.z = Math.sin(progress * Math.PI) * 0.35;

      if (this.swingTimer <= 0) {
        this.isSwinging = false;
        this.rightHand.rotation.x = 0;
      }
    }
  }
}
