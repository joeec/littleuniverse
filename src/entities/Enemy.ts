import * as THREE from 'three';
import { MeshFactory } from '../rendering/MeshFactory';
import { EnemyDefinition, ENEMIES_DATA } from '../data/EnemiesData';
import { EventBus } from '../core/EventBus';

export type EnemyState = 'idle' | 'patrol' | 'chase' | 'windup' | 'attack' | 'hurt' | 'dead';

export class Enemy {
  public id: string;
  public typeId: string;
  public def: EnemyDefinition;
  public group: THREE.Group;
  public mesh: THREE.Mesh;
  public position: THREE.Vector3;
  public spawnPosition: THREE.Vector3;

  public currentHealth: number;
  public maxHealth: number;
  public state: EnemyState = 'idle';

  // Timers
  private stateTimer: number = 0;
  private attackCooldownTimer: number = 0;
  private hurtTimer: number = 0;
  private respawnTimer: number = 0;

  // Movimiento y patrulla
  private patrolTarget: THREE.Vector3 = new THREE.Vector3();
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private knockbackVelocity: THREE.Vector3 = new THREE.Vector3();

  // Barra de salud 3D
  private healthBarMesh: THREE.Mesh | null = null;
  private healthBarCanvas: HTMLCanvasElement | null = null;
  private healthBarTexture: THREE.CanvasTexture | null = null;

  constructor(id: string, typeId: string, spawnPos: THREE.Vector3) {
    this.id = id;
    this.typeId = typeId;
    this.def = ENEMIES_DATA[typeId] || ENEMIES_DATA.spore_slime;
    this.spawnPosition = spawnPos.clone();

    this.maxHealth = this.def.maxHealth;
    this.currentHealth = this.maxHealth;

    const parts = MeshFactory.createEnemyMesh(this.def.type, parseInt(this.def.color.replace('#', '0x')));
    this.group = parts.group;
    this.mesh = parts.mesh;
    this.position = this.group.position;
    this.position.copy(spawnPos);

    this.createHealthBar();
    this.pickNewPatrolTarget();
  }

  private createHealthBar(): void {
    this.healthBarCanvas = document.createElement('canvas');
    this.healthBarCanvas.width = 128;
    this.healthBarCanvas.height = 24;

    this.healthBarTexture = new THREE.CanvasTexture(this.healthBarCanvas);
    this.healthBarTexture.minFilter = THREE.LinearFilter;

    const barGeo = new THREE.PlaneGeometry(1.2, 0.22);
    const barMat = new THREE.MeshBasicMaterial({
      map: this.healthBarTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.healthBarMesh = new THREE.Mesh(barGeo, barMat);
    this.healthBarMesh.position.set(0, 1.4 * this.def.scale, 0);
    this.healthBarMesh.visible = false;
    this.group.add(this.healthBarMesh);

    this.updateHealthBarTexture();
  }

  private updateHealthBarTexture(): void {
    if (!this.healthBarCanvas || !this.healthBarTexture) return;

    const ctx = this.healthBarCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, 128, 24);

    // Fondo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(2, 2, 124, 20, 6);
    ctx.fill();

    // Relleno de vida
    const pct = Math.max(0, Math.min(1, this.currentHealth / this.maxHealth));
    ctx.fillStyle = pct > 0.5 ? '#2ECC71' : pct > 0.25 ? '#F39C12' : '#E74C3C';
    ctx.beginPath();
    ctx.roundRect(4, 4, 120 * pct, 16, 4);
    ctx.fill();

    this.healthBarTexture.needsUpdate = true;
  }

  private pickNewPatrolTarget(): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = 1.5 + Math.random() * 3.0;
    this.patrolTarget.set(
      this.spawnPosition.x + Math.cos(angle) * dist,
      0,
      this.spawnPosition.z + Math.sin(angle) * dist
    );
  }

  public takeDamage(amount: number, knockbackDir?: THREE.Vector3): { isDead: boolean; damageDealt: number } {
    if (this.state === 'dead') return { isDead: true, damageDealt: 0 };

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateHealthBarTexture();

    if (this.healthBarMesh) {
      this.healthBarMesh.visible = true;
    }

    if (knockbackDir) {
      this.knockbackVelocity.copy(knockbackDir).multiplyScalar(8.0);
    }

    if (this.currentHealth <= 0) {
      this.state = 'dead';
      this.respawnTimer = this.def.respawnTime;
      this.group.visible = false;
      return { isDead: true, damageDealt: amount };
    } else {
      this.state = 'hurt';
      this.hurtTimer = 0.2;
      return { isDead: false, damageDealt: amount };
    }
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    camera: THREE.Camera,
    onAttackTrigger?: (enemy: Enemy) => void
  ): void {
    // Si está muerto, gestionar reaparición
    if (this.state === 'dead') {
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.state = 'idle';
        this.currentHealth = this.maxHealth;
        this.group.visible = true;
        this.position.copy(this.spawnPosition);
        if (this.healthBarMesh) this.healthBarMesh.visible = false;
        this.updateHealthBarTexture();
      }
      return;
    }

    // Orientar barra de vida hacia la cámara
    if (this.healthBarMesh && this.healthBarMesh.visible) {
      this.healthBarMesh.quaternion.copy(camera.quaternion);
    }

    // Cooldown de ataque
    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= delta;
    }

    // Knockback
    if (this.knockbackVelocity.length() > 0.1) {
      this.position.addScaledVector(this.knockbackVelocity, delta);
      this.knockbackVelocity.multiplyScalar(Math.pow(0.1, delta * 5));
    }

    const distToPlayer = this.position.distanceTo(playerPos);

    // Máquina de estados
    switch (this.state) {
      case 'idle':
        this.stateTimer += delta;
        if (distToPlayer < this.def.aggroRange) {
          this.state = 'chase';
        } else if (this.stateTimer > 2.5) {
          this.state = 'patrol';
          this.pickNewPatrolTarget();
          this.stateTimer = 0;
        }
        break;

      case 'patrol': {
        if (distToPlayer < this.def.aggroRange) {
          this.state = 'chase';
          break;
        }

        const toTarget = this.patrolTarget.clone().sub(this.position);
        toTarget.y = 0;
        const dist = toTarget.length();

        if (dist < 0.5) {
          this.state = 'idle';
          this.stateTimer = 0;
        } else {
          toTarget.normalize();
          this.position.addScaledVector(toTarget, this.def.speed * 0.4 * delta);
          this.group.quaternion.slerp(
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(toTarget.x, toTarget.z)),
            8.0 * delta
          );
        }
        break;
      }

      case 'chase': {
        const toPlayer = playerPos.clone().sub(this.position);
        toPlayer.y = 0;

        if (distToPlayer > this.def.aggroRange * 1.5) {
          this.state = 'idle';
          this.stateTimer = 0;
          break;
        }

        if (distToPlayer <= this.def.attackRange && this.attackCooldownTimer <= 0) {
          this.state = 'windup';
          this.stateTimer = 0.35; // 350ms de aviso telegrafiado
          break;
        }

        toPlayer.normalize();
        this.position.addScaledVector(toPlayer, this.def.speed * delta);
        this.group.quaternion.slerp(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(toPlayer.x, toPlayer.z)),
          12.0 * delta
        );

        // Animación de rebote al perseguir
        this.group.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.15;
        break;
      }

      case 'windup': {
        this.stateTimer -= delta;
        // Indicador de peligro: vibración y tinte rojo
        this.group.position.x += (Math.random() - 0.5) * 0.08;

        if (this.stateTimer <= 0) {
          this.state = 'attack';
          this.stateTimer = 0.2;
          this.attackCooldownTimer = this.def.attackCooldown;
          if (onAttackTrigger) onAttackTrigger(this);
        }
        break;
      }

      case 'attack':
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.state = 'chase';
        }
        break;

      case 'hurt':
        this.hurtTimer -= delta;
        if (this.hurtTimer <= 0) {
          this.state = 'chase';
        }
        break;
    }
  }
}

