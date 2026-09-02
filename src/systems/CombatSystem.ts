import * as THREE from 'three';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Projectile } from '../entities/Projectile';
import { ParticleSystem } from './ParticleSystem';
import { CameraController } from '../rendering/CameraController';
import { AudioSys } from './AudioManager';
import { EventBus } from '../core/EventBus';

export class CombatSystem {
  private scene: THREE.Scene;
  private particleSystem: ParticleSystem;
  private cameraController: CameraController;
  private projectiles: Projectile[] = [];

  private attackCooldownTimer: number = 0;
  private autoCombatTimer: number = 0;

  constructor(scene: THREE.Scene, particleSystem: ParticleSystem, cameraController: CameraController) {
    this.scene = scene;
    this.particleSystem = particleSystem;
    this.cameraController = cameraController;
  }

  public registerProjectile(proj: Projectile): void {
    this.projectiles.push(proj);
  }

  public unregisterAllProjectiles(): void {
    for (const p of this.projectiles) {
      p.destroy(this.scene);
    }
    this.projectiles = [];
  }

  // Ataque del jugador (Manual o Automático)
  public executePlayerAttack(player: Player, enemies: Enemy[], bosses: Boss[]): boolean {
    if (this.attackCooldownTimer > 0) return false;

    this.attackCooldownTimer = 0.35;
    player.setEquippedTool('sword');
    player.triggerSwing('sword');
    AudioSys.playSFX('attack');

    const attackRadius = 2.8;
    let hitAnything = false;

    // 1. Golpear enemigos comunes
    for (const enemy of enemies) {
      if (enemy.state === 'dead') continue;

      const dist = player.position.distanceTo(enemy.position);
      if (dist <= attackRadius) {
        hitAnything = true;

        const isCrit = Math.random() < 0.25;
        const damage = Math.round(player.attackDamage * (isCrit ? 1.8 : 1.0));
        const knockbackDir = enemy.position.clone().sub(player.position).normalize();

        const result = enemy.takeDamage(damage, knockbackDir);
        AudioSys.playSFX('hit_enemy');
        this.particleSystem.spawnDebris(enemy.position.x, 0.8, enemy.position.z, 0xE76F51, 8);
        this.particleSystem.spawnFloatingText(
          `${isCrit ? 'CRIT! ' : ''}-${damage}`,
          enemy.position,
          isCrit ? '#FFD166' : '#FFFFFF',
          isCrit
        );

        if (result.isDead) {
          EventBus.emit('quest:progress', { type: 'kill', targetId: enemy.typeId, amount: 1 });
          this.particleSystem.spawnAura(enemy.position.x, 0.5, enemy.position.z, 0xFF0055, 15);
          EventBus.emit('enemy:killed', { enemy });
        }
      }
    }

    // 2. Golpear Jefes
    for (const boss of bosses) {
      if (boss.isDefeated) continue;

      const dist = player.position.distanceTo(boss.position);
      if (dist <= attackRadius + 1.5) {
        hitAnything = true;

        const isCrit = Math.random() < 0.2;
        const damage = Math.round(player.attackDamage * (isCrit ? 1.7 : 1.0));

        boss.takeDamage(damage);
        AudioSys.playSFX('hit_enemy');
        this.cameraController.addScreenShake(0.15);
        this.particleSystem.spawnDebris(boss.position.x, 1.5, boss.position.z, 0x9B5DE5, 10);
        this.particleSystem.spawnFloatingText(
          `${isCrit ? 'CRIT! ' : ''}-${damage}`,
          boss.position,
          '#FF0055',
          isCrit
        );
      }
    }

    return hitAnything;
  }

  // Manejo de ataques de enemigos y proyectiles
  public handleEnemyAttack(enemy: Enemy, player: Player): void {
    const dist = enemy.position.distanceTo(player.position);

    if (enemy.def.type === 'ranged') {
      // Disparo de proyectil hacia el jugador
      const dir = player.position.clone().sub(enemy.position).normalize();
      const proj = new Projectile(enemy.position, dir, 8.0, enemy.def.damage, 0x9B5DE5, this.scene, true);
      this.projectiles.push(proj);
      AudioSys.playSFX('attack');
    } else {
      // Golpe cuerpo a cuerpo
      if (dist <= enemy.def.attackRange + 0.5) {
        const damaged = player.takeDamage(enemy.def.damage);
        if (damaged) {
          AudioSys.playSFX('player_hurt');
          this.cameraController.addScreenShake(0.3);
          this.particleSystem.spawnDebris(player.position.x, 0.8, player.position.z, 0xFF0055, 8);
          this.particleSystem.spawnFloatingText(`-${enemy.def.damage}`, player.position, '#FF0055', true);
        }
      }
    }
  }

  // Manejo de ataques especiales de jefes
  public handleBossSpecialAttack(
    boss: Boss,
    attackType: string,
    player: Player,
    onSpawnMinion?: (enemyId: string, pos: THREE.Vector3) => void
  ): void {
    AudioSys.playSFX('boss_slam');
    this.cameraController.addScreenShake(0.6);

    const bossPos = boss.position;
    const dist = bossPos.distanceTo(player.position);

    if (attackType === 'ground_slam') {
      this.particleSystem.spawnDebris(bossPos.x, 0.2, bossPos.z, 0x386641, 25, 2.0);
      if (dist <= 5.5) {
        const dmg = Math.round(boss.def.baseDamage * 1.5);
        player.takeDamage(dmg);
        this.particleSystem.spawnFloatingText(`-${dmg}`, player.position, '#FF0000', true);
      }
    } else if (attackType === 'rock_shockwave') {
      // Disparar 4 rocas en cruz
      const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      for (const angle of angles) {
        const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
        const proj = new Projectile(bossPos, dir, 7.0, boss.def.baseDamage, 0x6C757D, this.scene, true);
        this.projectiles.push(proj);
      }
    } else if (attackType === 'summon_minions') {
      if (onSpawnMinion) {
        onSpawnMinion('spore_slime', bossPos.clone().add(new THREE.Vector3(-2, 0, 2)));
        onSpawnMinion('spore_slime', bossPos.clone().add(new THREE.Vector3(2, 0, -2)));
      }
      this.particleSystem.spawnAura(bossPos.x, 0.5, bossPos.z, 0x55A630, 20);
    } else if (attackType === 'crystal_breath' || attackType === 'crystal_rain') {
      // Salva de cristales teledirigidos en abanico
      const baseDir = player.position.clone().sub(bossPos).normalize();
      for (let i = -2; i <= 2; i++) {
        const dir = baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), i * 0.25);
        const proj = new Projectile(bossPos, dir, 10.0, boss.def.baseDamage, 0x7209B7, this.scene, true);
        this.projectiles.push(proj);
      }
    }
  }

  public update(delta: number, player: Player, enemies: Enemy[], bosses: Boss[]): void {
    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= delta;
    }

    // Auto-combate si hay enemigos muy cerca y no estamos recolectando
    this.autoCombatTimer -= delta;
    if (this.autoCombatTimer <= 0) {
      let hostileNear = false;
      for (const enemy of enemies) {
        if (enemy.state !== 'dead' && player.position.distanceTo(enemy.position) < 2.5) {
          hostileNear = true;
          break;
        }
      }
      for (const boss of bosses) {
        if (!boss.isDefeated && player.position.distanceTo(boss.position) < 4.0) {
          hostileNear = true;
          break;
        }
      }

      if (hostileNear) {
        this.autoCombatTimer = 0.45;
        this.executePlayerAttack(player, enemies, bosses);
      }
    }

    // Actualizar proyectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const expired = proj.update(delta);

      if (expired) {
        proj.destroy(this.scene);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Colisión de proyectil con jugador
      if (proj.isEnemy) {
        const dist = proj.mesh.position.distanceTo(player.position.clone().add(new THREE.Vector3(0, 0.6, 0)));
        if (dist <= proj.radius + 0.4) {
          const damaged = player.takeDamage(proj.damage);
          if (damaged) {
            AudioSys.playSFX('player_hurt');
            this.cameraController.addScreenShake(0.25);
            this.particleSystem.spawnDebris(player.position.x, 0.8, player.position.z, 0x9B5DE5, 6);
            this.particleSystem.spawnFloatingText(`-${proj.damage}`, player.position, '#FF0055', true);
          }
          proj.destroy(this.scene);
          this.projectiles.splice(i, 1);
        }
      }
    }
  }
}

