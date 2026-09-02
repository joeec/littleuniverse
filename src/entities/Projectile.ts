import * as THREE from 'three';
import { MeshFactory } from '../rendering/MeshFactory';

export class Projectile {
  public mesh: THREE.Mesh;
  public velocity: THREE.Vector3;
  public damage: number;
  public isEnemy: boolean;
  public lifeTime: number = 0;
  public maxLifeTime: number = 4.0;
  public radius: number = 0.35;
  public isDestroyed: boolean = false;

  constructor(
    startPos: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    damage: number,
    colorHex: number,
    scene: THREE.Scene,
    isEnemy: boolean = true
  ) {
    this.damage = damage;
    this.isEnemy = isEnemy;
    this.velocity = direction.clone().normalize().multiplyScalar(speed);

    const geo = new THREE.OctahedronGeometry(0.25, 0);
    const mat = MeshFactory.getMaterial(colorHex, 0.1, 0.1, colorHex);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(startPos);
    this.mesh.position.y += 0.6;

    scene.add(this.mesh);
  }

  public update(delta: number): boolean {
    if (this.isDestroyed) return true;

    this.lifeTime += delta;
    this.mesh.position.addScaledVector(this.velocity, delta);
    this.mesh.rotation.x += delta * 10;
    this.mesh.rotation.y += delta * 8;

    if (this.lifeTime >= this.maxLifeTime) {
      this.isDestroyed = true;
      return true;
    }

    return false;
  }

  public destroy(scene: THREE.Scene): void {
    this.isDestroyed = true;
    scene.remove(this.mesh);
  }
}

