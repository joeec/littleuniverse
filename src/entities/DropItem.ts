import * as THREE from 'three';
import { MeshFactory } from '../rendering/MeshFactory';

export class DropItem {
  public mesh: THREE.Mesh;
  public resourceId: string;
  public amount: number;
  public isCollected: boolean = false;

  private velocity: THREE.Vector3;
  private lifeTime: number = 0;
  private magnetSpeed: number = 0;
  private targetPlayer: THREE.Vector3 | null = null;

  constructor(resourceId: string, amount: number, startPos: THREE.Vector3, scene: THREE.Scene) {
    this.resourceId = resourceId;
    this.amount = amount;
    this.mesh = MeshFactory.createDropMesh(resourceId);

    this.mesh.position.copy(startPos);
    this.mesh.position.y += 0.5;

    // Impulso inicial en arco parabólico
    const angle = Math.random() * Math.PI * 2;
    const horizSpeed = 1.5 + Math.random() * 2.0;
    this.velocity = new THREE.Vector3(
      Math.cos(angle) * horizSpeed,
      3.0 + Math.random() * 2.0,
      Math.sin(angle) * horizSpeed
    );

    scene.add(this.mesh);
  }

  public update(delta: number, playerPos: THREE.Vector3): boolean {
    if (this.isCollected) return true;

    this.lifeTime += delta;
    this.mesh.rotation.y += delta * 4.0;
    this.mesh.rotation.x += delta * 2.0;

    // Fase 1: Salto parabólico inicial
    if (this.lifeTime < 0.35) {
      this.velocity.y -= 15.0 * delta;
      this.mesh.position.addScaledVector(this.velocity, delta);
      if (this.mesh.position.y < 0.2) {
        this.mesh.position.y = 0.2;
        this.velocity.set(0, 0, 0);
      }
    } else {
      // Fase 2: Imán hacia el jugador
      const targetPos = playerPos.clone().add(new THREE.Vector3(0, 0.8, 0));
      const dir = targetPos.clone().sub(this.mesh.position);
      const dist = dir.length();

      this.magnetSpeed += delta * 28.0;
      dir.normalize();
      this.mesh.position.addScaledVector(dir, Math.min(this.magnetSpeed * delta, dist));

      // Si ha alcanzado la mochila del jugador
      if (dist < 0.6) {
        this.isCollected = true;
        return true;
      }
    }

    return false;
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.mesh);
    if (this.mesh.geometry) this.mesh.geometry.dispose();
  }
}

