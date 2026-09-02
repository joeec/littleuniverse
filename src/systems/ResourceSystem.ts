import * as THREE from 'three';
import { Player } from '../entities/Player';
import { ResourceNode } from '../entities/ResourceNode';
import { DropItem } from '../entities/DropItem';
import { InventorySystem } from './InventorySystem';
import { ParticleSystem } from './ParticleSystem';
import { AudioSys } from './AudioManager';
import { EventBus } from '../core/EventBus';

export class ResourceSystem {
  private nodes: ResourceNode[] = [];
  private dropItems: DropItem[] = [];
  private scene: THREE.Scene;
  private inventory: InventorySystem;
  private particleSystem: ParticleSystem;

  private harvestTimer: number = 0;
  private harvestInterval: number = 0.32; // Tiempo entre golpes de recolección

  constructor(scene: THREE.Scene, inventory: InventorySystem, particleSystem: ParticleSystem) {
    this.scene = scene;
    this.inventory = inventory;
    this.particleSystem = particleSystem;
  }

  public registerNode(node: ResourceNode): void {
    this.nodes.push(node);
    this.scene.add(node.group);
  }

  public unregisterAll(): void {
    for (const node of this.nodes) {
      this.scene.remove(node.group);
    }
    this.nodes = [];

    for (const drop of this.dropItems) {
      drop.destroy(this.scene);
    }
    this.dropItems = [];
  }

  public spawnDrops(resourceId: string, amount: number, pos: THREE.Vector3): void {
    for (let i = 0; i < amount; i++) {
      const drop = new DropItem(resourceId, 1, pos, this.scene);
      this.dropItems.push(drop);
    }
  }

  public update(delta: number, player: Player): void {
    // 1. Actualizar nodos de recursos (sacudida, respawn)
    for (const node of this.nodes) {
      node.update(delta);
    }

    // 2. Comprobar recolección automática por proximidad
    this.harvestTimer -= delta;

    let nearestNode: ResourceNode | null = null;
    let nearestDist = 2.4; // Rango de recolección

    for (const node of this.nodes) {
      if (node.isDestroyed) continue;
      const dist = player.position.distanceTo(node.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestNode = node;
      }
    }

    if (nearestNode) {
      // Comprobar nivel de herramienta requerida
      const reqTool = nearestNode.requiredTool;
      const playerToolPower = reqTool === 'none' ? 99 : player.getToolPower(reqTool);

      if (playerToolPower < nearestNode.requiredLevel) {
        if (this.harvestTimer <= 0) {
          const toolName = reqTool === 'axe' ? 'Hacha' : 'Pico';
          EventBus.emit('hud:toast', {
            message: `¡Se necesita ${toolName} Nivel ${nearestNode.requiredLevel} para recolectar esto!`,
            type: 'warning'
          });
          this.harvestTimer = 1.5; // No spamear el aviso
        }
      } else {
        // Equipar herramienta adecuada y balancear
        if (reqTool !== 'none') {
          player.setEquippedTool(reqTool);
        }

        if (this.harvestTimer <= 0) {
          this.harvestTimer = this.harvestInterval;
          player.triggerSwing(reqTool !== 'none' ? reqTool : undefined);

          // Calcular daño de cosecha
          const harvestDmg = reqTool === 'none' ? 20 : player.getToolHarvestDamage(reqTool);
          const result = nearestNode.takeHit(harvestDmg);

          // Sonidos y partículas
          if (nearestNode.type === 'tree' || nearestNode.type === 'amber') {
            AudioSys.playSFX('chop');
            this.particleSystem.spawnDebris(nearestNode.position.x, 1.0, nearestNode.position.z, 0x8B5A2B, 6);
          } else if (nearestNode.type === 'fiber') {
            AudioSys.playSFX('harvest');
            this.particleSystem.spawnDebris(nearestNode.position.x, 0.5, nearestNode.position.z, 0x52B788, 5);
          } else {
            AudioSys.playSFX('mine');
            let oreColor = 0x8A8A8A;
            if (nearestNode.type === 'copper') oreColor = 0xD2691E;
            if (nearestNode.type === 'iron') oreColor = 0xCED4DA;
            if (nearestNode.type === 'crystal') oreColor = 0x9B5DE5;
            if (nearestNode.type === 'cobalt') oreColor = 0x00B4D8;
            if (nearestNode.type === 'obsidian') oreColor = 0x212529;
            this.particleSystem.spawnDebris(nearestNode.position.x, 0.8, nearestNode.position.z, oreColor, 7);
          }

          // Generar drops si soltó material
          if (result.amount > 0) {
            this.spawnDrops(result.resourceDropped, result.amount, nearestNode.position);
          }
        }
      }
    }

    // 3. Actualizar items caídos y atracción magnética
    for (let i = this.dropItems.length - 1; i >= 0; i--) {
      const drop = this.dropItems[i];
      const collected = drop.update(delta, player.position);

      if (collected) {
        const added = this.inventory.addItem(drop.resourceId, drop.amount);
        if (added) {
          AudioSys.playSFX('pickup');
          this.particleSystem.spawnFloatingText(
            `+${drop.amount} ${drop.resourceId.replace('_', ' ')}`,
            player.position,
            '#00F5D4'
          );
        }
        drop.destroy(this.scene);
        this.dropItems.splice(i, 1);
      }
    }
  }
}

