import * as THREE from 'three';
import { MeshFactory } from '../rendering/MeshFactory';
import { NPCDefinition, NPCS_DATA } from '../data/NPCsData';

export class NPC {
  public id: string;
  public def: NPCDefinition;
  public group: THREE.Group;
  public position: THREE.Vector3;

  private promptMesh: THREE.Mesh | null = null;
  private promptCanvas: HTMLCanvasElement | null = null;
  private promptTexture: THREE.CanvasTexture | null = null;

  public hasActiveQuest: boolean = true;

  constructor(npcId: string, spawnPos: THREE.Vector3, scene: THREE.Scene) {
    this.id = npcId;
    this.def = NPCS_DATA[npcId] || NPCS_DATA.elder_oakhaven;

    this.group = new THREE.Group();
    this.position = this.group.position;
    this.position.copy(spawnPos);

    // Malla del NPC estilizado
    const bodyMat = MeshFactory.getMaterial(parseInt(this.def.color.replace('#', '0x')), 0.6, 0.1);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.7, 8), bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;

    const headMat = MeshFactory.getMaterial(0xFFD166, 0.7, 0.0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), headMat);
    head.position.y = 1.15;
    head.castShadow = true;

    // Barba o tocado distintivo
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 6), MeshFactory.getMaterial(0xFFFFFF, 0.9, 0.0));
    beard.position.set(0, 0.95, 0.2);
    beard.rotation.x = -0.3;

    this.group.add(body, head, beard);

    this.createPromptBadge();
    scene.add(this.group);
  }

  private createPromptBadge(): void {
    this.promptCanvas = document.createElement('canvas');
    this.promptCanvas.width = 256;
    this.promptCanvas.height = 80;

    this.promptTexture = new THREE.CanvasTexture(this.promptCanvas);
    this.promptTexture.minFilter = THREE.LinearFilter;

    const badgeGeo = new THREE.PlaneGeometry(1.8, 0.55);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: this.promptTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.promptMesh = new THREE.Mesh(badgeGeo, badgeMat);
    this.promptMesh.position.set(0, 1.8, 0);
    this.group.add(this.promptMesh);

    this.updatePromptBadge();
  }

  public updatePromptBadge(): void {
    if (!this.promptCanvas || !this.promptTexture) return;

    const ctx = this.promptCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 80);

    // Fondo redondeado
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(4, 4, 248, 72, 16);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFD166';
    ctx.stroke();

    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${this.hasActiveQuest ? '❗' : '💬'} ${this.def.name}`, 128, 48);

    this.promptTexture.needsUpdate = true;
  }

  public setQuestMarker(active: boolean): void {
    this.hasActiveQuest = active;
    this.updatePromptBadge();
  }

  public update(delta: number, camera: THREE.Camera): void {
    if (this.promptMesh) {
      this.promptMesh.quaternion.copy(camera.quaternion);
      this.promptMesh.position.y = 1.8 + Math.sin(Date.now() * 0.005) * 0.08;
    }
  }
}

