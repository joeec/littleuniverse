import * as THREE from 'three';
import { MeshFactory } from '../rendering/MeshFactory';
import { BossDefinition, BOSSES_DATA } from '../data/BossesData';
import { EventBus } from '../core/EventBus';

export type BossState = 'dormant' | 'active' | 'windup' | 'special_attack' | 'hurt' | 'dead';

export class Boss {
  public id: string;
  public def: BossDefinition;
  public group: THREE.Group;
  public coreMesh: THREE.Mesh;
  public position: THREE.Vector3;

  public maxHealth: number;
  public currentHealth: number;
  public currentPhaseIndex: number = 0;
  public state: BossState = 'dormant';
  public isDefeated: boolean = false;

  private attackCooldownTimer: number = 0;
  private attackTimer: number = 0;
  private currentSpecialAttack: string = '';
  private attackTelegraphMesh: THREE.Mesh | null = null;

  constructor(bossId: string, spawnPos: THREE.Vector3, scene: THREE.Scene) {
    this.id = bossId;
    this.def = BOSSES_DATA[bossId] || BOSSES_DATA.moss_golem;
    this.maxHealth = this.def.maxHealth;
    this.currentHealth = this.maxHealth;

    const parts = MeshFactory.createBossMesh(bossId);
    this.group = parts.group;
    this.coreMesh = parts.coreMesh;
    this.position = this.group.position;
    this.position.copy(spawnPos);

    // Indicador de peligro en el suelo (círculo rojo para telegrafiar ataques)
    const telGeo = new THREE.RingGeometry(0.5, 4.0, 32);
    const telMat = new THREE.MeshBasicMaterial({ color: 0xFF0055, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    this.attackTelegraphMesh = new THREE.Mesh(telGeo, telMat);
    this.attackTelegraphMesh.rotation.x = -Math.PI / 2;
    this.attackTelegraphMesh.position.y = 0.05;
    this.attackTelegraphMesh.visible = false;
    this.group.add(this.attackTelegraphMesh);

    scene.add(this.group);
  }

  public takeDamage(amount: number): { isDead: boolean; damageDealt: number } {
    if (this.state === 'dead' || this.isDefeated) return { isDead: true, damageDealt: 0 };

    this.currentHealth = Math.max(0, this.currentHealth - amount);

    // Comprobar cambio de fase
    const healthRatio = this.currentHealth / this.maxHealth;
    if (this.currentPhaseIndex === 0 && healthRatio <= 0.5 && this.def.phases.length > 1) {
      this.currentPhaseIndex = 1;
      EventBus.emit('boss:phase_change', {
        bossId: this.id,
        phase: this.def.phases[1].name
      });
    }

    EventBus.emit('boss:health_updated', {
      bossId: this.id,
      name: this.def.name,
      title: this.def.title,
      currentHealth: this.currentHealth,
      maxHealth: this.maxHealth
    });

    if (this.currentHealth <= 0) {
      this.state = 'dead';
      this.isDefeated = true;
      this.group.visible = false;
      EventBus.emit('boss:defeated', { bossId: this.id, rewards: this.def.rewards });
      return { isDead: true, damageDealt: amount };
    }

    return { isDead: false, damageDealt: amount };
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    onSpecialAttackTrigger?: (boss: Boss, attackType: string) => void
  ): void {
    if (this.state === 'dead' || this.isDefeated) return;

    const distToPlayer = this.position.distanceTo(playerPos);
    const currentPhase = this.def.phases[this.currentPhaseIndex];

    // Activar combate cuando el jugador se acerca a la arena
    if (this.state === 'dormant') {
      if (distToPlayer < this.def.arenaRadius) {
        this.state = 'active';
        EventBus.emit('boss:engaged', {
          bossId: this.id,
          name: this.def.name,
          title: this.def.title,
          currentHealth: this.currentHealth,
          maxHealth: this.maxHealth
        });
      }
      return;
    }

    // Cooldown
    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= delta;
    }

    // Rotar hacia el jugador
    const toPlayer = playerPos.clone().sub(this.position);
    toPlayer.y = 0;
    if (toPlayer.length() > 0.1) {
      toPlayer.normalize();
      this.group.quaternion.slerp(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(toPlayer.x, toPlayer.z)),
        6.0 * delta
      );
    }

    switch (this.state) {
      case 'active': {
        // Moverse hacia el jugador si está lejos
        if (distToPlayer > 3.0) {
          const moveSpeed = this.def.speed * currentPhase.speedMultiplier;
          this.position.addScaledVector(toPlayer, moveSpeed * delta);
        }

        // Si está en rango e idle, lanzar ataque especial aleatorio
        if (this.attackCooldownTimer <= 0) {
          const attacks = currentPhase.specialAttacks;
          this.currentSpecialAttack = attacks[Math.floor(Math.random() * attacks.length)];
          this.state = 'windup';
          this.attackTimer = 0.8; // 800ms de carga telegrafiada

          if (this.attackTelegraphMesh) {
            this.attackTelegraphMesh.visible = true;
          }
        }
        break;
      }

      case 'windup': {
        this.attackTimer -= delta;

        // Pulso visual del círculo telegrafiado
        if (this.attackTelegraphMesh) {
          const scale = 1.0 + (1 - this.attackTimer / 0.8) * 0.5;
          this.attackTelegraphMesh.scale.set(scale, scale, scale);
        }

        if (this.attackTimer <= 0) {
          this.state = 'special_attack';
          this.attackTimer = 0.4;
          this.attackCooldownTimer = 2.0;

          if (this.attackTelegraphMesh) {
            this.attackTelegraphMesh.visible = false;
          }

          if (onSpecialAttackTrigger) {
            onSpecialAttackTrigger(this, this.currentSpecialAttack);
          }
        }
        break;
      }

      case 'special_attack': {
        this.attackTimer -= delta;
        if (this.attackTimer <= 0) {
          this.state = 'active';
        }
        break;
      }
    }
  }
}

