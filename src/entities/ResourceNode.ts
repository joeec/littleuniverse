import * as THREE from 'three';
import { MeshFactory } from '../rendering/MeshFactory';
import { ToolType } from '../data/ToolsData';

export class ResourceNode {
  public id: string;
  public type: string;
  public resourceDropped: string;
  public requiredTool: ToolType | 'none';
  public requiredLevel: number;
  public maxHealth: number;
  public currentHealth: number;
  public dropAmountPerHit: number;
  public respawnTime: number;

  public group: THREE.Group;
  public position: THREE.Vector3;
  public isDestroyed: boolean = false;

  private shakeTimer: number = 0;
  private originalScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);
  private respawnTimer: number = 0;
  private isRespawning: boolean = false;
  private respawnScale: number = 0;
  private windOffset: number = Math.random() * 10;

  constructor(
    id: string,
    type: string,
    pos: THREE.Vector3,
    levelRequired: number = 1
  ) {
    this.id = id;
    this.type = type;
    this.position = pos.clone();
    this.requiredLevel = levelRequired;

    if (type === 'tree') {
      this.resourceDropped = 'wood';
      this.requiredTool = 'axe';
      this.maxHealth = 40;
      this.dropAmountPerHit = 1;
      this.respawnTime = 12;
    } else if (type === 'rock') {
      this.resourceDropped = 'stone';
      this.requiredTool = 'pickaxe';
      this.maxHealth = 40;
      this.dropAmountPerHit = 1;
      this.respawnTime = 14;
    } else if (type === 'copper') {
      this.resourceDropped = 'copper_ore';
      this.requiredTool = 'pickaxe';
      this.requiredLevel = Math.max(1, levelRequired);
      this.maxHealth = 60;
      this.dropAmountPerHit = 1;
      this.respawnTime = 18;
    } else if (type === 'iron') {
      this.resourceDropped = 'iron_ore';
      this.requiredTool = 'pickaxe';
      this.requiredLevel = Math.max(2, levelRequired);
      this.maxHealth = 90;
      this.dropAmountPerHit = 1;
      this.respawnTime = 22;
    } else if (type === 'amber') {
      this.resourceDropped = 'amber';
      this.requiredTool = 'axe';
      this.requiredLevel = Math.max(2, levelRequired);
      this.maxHealth = 80;
      this.dropAmountPerHit = 1;
      this.respawnTime = 20;
    } else if (type === 'crystal') {
      this.resourceDropped = 'crystal';
      this.requiredTool = 'pickaxe';
      this.requiredLevel = Math.max(3, levelRequired);
      this.maxHealth = 120;
      this.dropAmountPerHit = 1;
      this.respawnTime = 25;
    } else if (type === 'cobalt') {
      this.resourceDropped = 'cobalt_ore';
      this.requiredTool = 'pickaxe';
      this.requiredLevel = Math.max(3, levelRequired);
      this.maxHealth = 150;
      this.dropAmountPerHit = 1;
      this.respawnTime = 28;
    } else if (type === 'obsidian') {
      this.resourceDropped = 'obsidian';
      this.requiredTool = 'pickaxe';
      this.requiredLevel = Math.max(4, levelRequired);
      this.maxHealth = 200;
      this.dropAmountPerHit = 1;
      this.respawnTime = 30;
    } else if (type === 'fiber') {
      this.resourceDropped = 'fiber';
      this.requiredTool = 'none';
      this.maxHealth = 15;
      this.dropAmountPerHit = 2;
      this.respawnTime = 10;
    } else {
      this.resourceDropped = 'wood';
      this.requiredTool = 'axe';
      this.maxHealth = 30;
      this.dropAmountPerHit = 1;
      this.respawnTime = 10;
    }

    this.currentHealth = this.maxHealth;
    this.group = MeshFactory.createResourceNodeMesh(type);
    this.group.position.copy(this.position);
    this.originalScale.copy(this.group.scale);
  }

  public takeHit(power: number): { destroyed: boolean; damageDealt: number; resourceDropped: string; amount: number } {
    if (this.isDestroyed) {
      return { destroyed: false, damageDealt: 0, resourceDropped: this.resourceDropped, amount: 0 };
    }

    const damageDealt = Math.min(this.currentHealth, power);
    this.currentHealth -= damageDealt;
    this.shakeTimer = 0.25;

    const amount = this.dropAmountPerHit;

    if (this.currentHealth <= 0) {
      this.isDestroyed = true;
      this.group.visible = false;
      this.respawnTimer = this.respawnTime;
      return { destroyed: true, damageDealt, resourceDropped: this.resourceDropped, amount: amount * 2 };
    }

    return { destroyed: false, damageDealt, resourceDropped: this.resourceDropped, amount };
  }

  public update(delta: number): void {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= delta;
      const shakeAmt = (this.shakeTimer / 0.25) * 0.18;
      this.group.rotation.z = (Math.random() - 0.5) * shakeAmt;
      this.group.rotation.x = (Math.random() - 0.5) * shakeAmt;
      this.group.scale.set(
        this.originalScale.x * (1 + shakeAmt * 0.6),
        this.originalScale.y * (1 - shakeAmt * 0.6),
        this.originalScale.z * (1 + shakeAmt * 0.6)
      );
    } else {
      // Balanceo suave orgánico por viento para árboles
      if (this.type === 'tree' || this.type === 'amber' || this.type === 'fiber') {
        const time = (Date.now() * 0.002) + this.windOffset;
        this.group.rotation.z = Math.sin(time) * 0.035;
        this.group.rotation.x = Math.cos(time * 0.8) * 0.025;
      } else {
        this.group.rotation.set(0, 0, 0);
      }
    }

    if (this.isDestroyed) {
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.isDestroyed = false;
        this.currentHealth = this.maxHealth;
        this.group.visible = true;
        this.isRespawning = true;
        this.respawnScale = 0.05;
      }
    }

    if (this.isRespawning) {
      this.respawnScale += delta * 2.8;
      if (this.respawnScale >= 1.0) {
        this.respawnScale = 1.0;
        this.isRespawning = false;
      }
      this.group.scale.set(
        this.originalScale.x * this.respawnScale,
        this.originalScale.y * this.respawnScale,
        this.originalScale.z * this.respawnScale
      );
    }
  }
}
