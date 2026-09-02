import * as THREE from 'three';
import { MeshFactory } from '../rendering/MeshFactory';
import { BuildingDefinition, BUILDINGS_DATA } from '../data/BuildingsData';
import { RESOURCES } from '../data/ResourcesData';

export class Building {
  public id: string;
  public def: BuildingDefinition;
  public group: THREE.Group;
  public position: THREE.Vector3;
  public isBuilt: boolean = false;

  public currentInvested: Record<string, number> = {};
  public requiredTotal: Record<string, number> = {};

  private badgeMesh: THREE.Mesh | null = null;
  private badgeCanvas: HTMLCanvasElement | null = null;
  private badgeTexture: THREE.CanvasTexture | null = null;

  constructor(buildingId: string, spawnPos: THREE.Vector3, isBuilt: boolean = false) {
    this.id = buildingId;
    this.def = BUILDINGS_DATA[buildingId] || BUILDINGS_DATA.forge;
    this.isBuilt = isBuilt;

    // Inicializar requerimientos
    for (const req of this.def.requirements) {
      this.requiredTotal[req.resourceId] = req.amount;
      this.currentInvested[req.resourceId] = isBuilt ? req.amount : 0;
    }

    this.group = new THREE.Group();
    this.position = this.group.position;
    this.position.copy(spawnPos);

    this.rebuildMesh();

    if (!isBuilt) {
      this.createCostBadge();
    }
  }

  public rebuildMesh(): void {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    if (this.isBuilt) {
      const mesh = MeshFactory.createBuildingMesh(this.id);
      this.group.add(mesh);
    } else {
      // Pad de construcción translúcido con holograma
      const padGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.2, 8);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0xFFD166,
        transparent: true,
        opacity: 0.45,
        emissive: 0xFFB703,
        emissiveIntensity: 0.3
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.1;
      this.group.add(pad);

      if (this.badgeMesh) {
        this.group.add(this.badgeMesh);
      }
    }
  }

  private createCostBadge(): void {
    this.badgeCanvas = document.createElement('canvas');
    this.badgeCanvas.width = 256;
    this.badgeCanvas.height = 128;

    this.badgeTexture = new THREE.CanvasTexture(this.badgeCanvas);
    this.badgeTexture.minFilter = THREE.LinearFilter;

    const badgeGeo = new THREE.PlaneGeometry(2.2, 1.1);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: this.badgeTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    this.badgeMesh.position.set(0, 2.0, 0);
    this.group.add(this.badgeMesh);

    this.updateBadgeTexture();
  }

  public updateBadgeTexture(): void {
    if (!this.badgeCanvas || !this.badgeTexture) return;

    const ctx = this.badgeCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 128);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 112, 18);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFD166';
    ctx.stroke();

    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.fillStyle = '#FFD166';
    ctx.textAlign = 'center';
    ctx.fillText(this.def.name, 128, 32);

    const total = this.def.requirements.length;
    this.def.requirements.forEach((req, i) => {
      const res = RESOURCES[req.resourceId];
      const icon = res ? res.icon : '📦';
      const inv = this.currentInvested[req.resourceId] || 0;
      const target = req.amount;

      const y = total === 1 ? 75 : 62 + i * 32;

      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`${icon} ${inv}/${target}`, 24, y);

      const pct = Math.min(1.0, inv / target);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(150, y - 14, 80, 8);
      ctx.fillStyle = inv >= target ? '#06D6A0' : '#FFB703';
      ctx.fillRect(150, y - 14, 80 * pct, 8);
    });

    this.badgeTexture.needsUpdate = true;
  }

  public feedResource(resourceId: string, amount: number = 1): number {
    if (this.isBuilt || !this.requiredTotal[resourceId]) return 0;

    const needed = this.requiredTotal[resourceId] - (this.currentInvested[resourceId] || 0);
    if (needed <= 0) return 0;

    const toFeed = Math.min(amount, needed);
    this.currentInvested[resourceId] = (this.currentInvested[resourceId] || 0) + toFeed;
    this.updateBadgeTexture();

    return toFeed;
  }

  public isFullyFunded(): boolean {
    for (const req of this.def.requirements) {
      if ((this.currentInvested[req.resourceId] || 0) < req.amount) {
        return false;
      }
    }
    return true;
  }

  public build(): void {
    this.isBuilt = true;
    if (this.badgeMesh) {
      this.group.remove(this.badgeMesh);
      this.badgeMesh = null;
    }
    this.rebuildMesh();
  }

  public update(delta: number, camera: THREE.Camera): void {
    if (this.badgeMesh) {
      this.badgeMesh.quaternion.copy(camera.quaternion);
      this.badgeMesh.position.y = 2.0 + Math.sin(Date.now() * 0.004) * 0.1;
    }
  }
}

