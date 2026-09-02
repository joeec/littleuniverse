import * as THREE from 'three';
import { Player } from '../entities/Player';
import { TilePlatform } from '../entities/TilePlatform';
import { Building } from '../entities/Building';
import { InventorySystem } from './InventorySystem';
import { ParticleSystem } from './ParticleSystem';
import { CameraController } from '../rendering/CameraController';
import { AudioSys } from './AudioManager';
import { EventBus } from '../core/EventBus';

export class BuildingSystem {
  private inventory: InventorySystem;
  private particleSystem: ParticleSystem;
  private cameraController: CameraController;

  private depositTimer: number = 0;
  private depositInterval: number = 0.07; // Ritmo rápido y satisfactorio de transferencia

  constructor(inventory: InventorySystem, particleSystem: ParticleSystem, cameraController: CameraController) {
    this.inventory = inventory;
    this.particleSystem = particleSystem;
    this.cameraController = cameraController;
  }

  public update(
    delta: number,
    player: Player,
    tiles: TilePlatform[],
    buildings: Building[],
    onTileUnlocked: (tile: TilePlatform) => void,
    onBuildingConstructed: (building: Building) => void
  ): void {
    this.depositTimer -= delta;

    // 1. Comprobar Losas de Terreno Bloqueadas
    for (const tile of tiles) {
      if (tile.isUnlocked) continue;

      const tileCenter = new THREE.Vector3(tile.group.position.x, 0, tile.group.position.z);
      const dist = player.position.distanceTo(tileCenter);

      // Si el jugador está parado sobre la losa translúcida
      if (dist < 2.8) {
        if (this.depositTimer <= 0) {
          this.depositTimer = this.depositInterval;

          let transferred = false;
          if (tile.data.cost) {
            for (const req of tile.data.cost) {
              const needed = req.amount - (tile.currentInvested[req.resourceId] || 0);
              if (needed > 0 && this.inventory.hasAmount(req.resourceId, 1)) {
                this.inventory.removeItem(req.resourceId, 1);
                tile.feedResource(req.resourceId, 1);
                transferred = true;

                AudioSys.playSFX('deposit');
                this.particleSystem.spawnDebris(tileCenter.x, 0.5, tileCenter.z, 0x00F5D4, 2, 0.6);
                break; // 1 recurso por tick para animación fluida
              }
            }
          }

          // Si se ha completado la financiación de la losa
          if (tile.isFullyFunded()) {
            tile.unlock();
            AudioSys.playSFX('unlock_tile');
            this.cameraController.addScreenShake(0.3);
            this.particleSystem.spawnAura(tileCenter.x, 0.5, tileCenter.z, 0x00F5D4, 25);
            EventBus.emit('quest:progress', { type: 'unlock_tiles', targetId: 'tile', amount: 1 });
            EventBus.emit('hud:toast', { message: '✨ ¡Nueva zona desbloqueada!', type: 'success' });
            onTileUnlocked(tile);
          }
        }
      }
    }

    // 2. Comprobar Estructuras y Edificios
    for (const bld of buildings) {
      if (bld.isBuilt) continue;

      const bldCenter = bld.position;
      const dist = player.position.distanceTo(bldCenter);

      if (dist < 2.6) {
        if (this.depositTimer <= 0) {
          this.depositTimer = this.depositInterval;

          let transferred = false;
          for (const req of bld.def.requirements) {
            const needed = req.amount - (bld.currentInvested[req.resourceId] || 0);
            if (needed > 0 && this.inventory.hasAmount(req.resourceId, 1)) {
              this.inventory.removeItem(req.resourceId, 1);
              bld.feedResource(req.resourceId, 1);
              transferred = true;

              AudioSys.playSFX('deposit');
              this.particleSystem.spawnDebris(bldCenter.x, 0.5, bldCenter.z, 0xFFD166, 3, 0.6);
              break;
            }
          }

          if (bld.isFullyFunded()) {
            bld.build();
            AudioSys.playSFX('level_up');
            this.cameraController.addScreenShake(0.4);
            this.particleSystem.spawnAura(bldCenter.x, 0.8, bldCenter.z, 0xFFB703, 30);
            EventBus.emit('quest:progress', { type: 'build', targetId: bld.id, amount: 1 });
            EventBus.emit('hud:toast', { message: `🔨 ¡${bld.def.name} construida!`, type: 'success' });
            onBuildingConstructed(bld);
          }
        }
      }
    }
  }
}

