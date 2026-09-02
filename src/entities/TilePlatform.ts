import * as THREE from 'three';
import { MeshFactory } from '../rendering/MeshFactory';
import { WorldTileDefinition, TILE_SIZE } from '../data/WorldData';
import { RESOURCES } from '../data/ResourcesData';

export class TilePlatform {
  public data: WorldTileDefinition;
  public group: THREE.Group;
  public isUnlocked: boolean = false;
  public isAvailableToUnlock: boolean = false;

  public currentInvested: Record<string, number> = {};
  public requiredTotal: Record<string, number> = {};

  // Badge visual en 3D
  private badgeMesh: THREE.Mesh | null = null;
  private badgeCanvas: HTMLCanvasElement | null = null;
  private badgeTexture: THREE.CanvasTexture | null = null;

  // Animación de aparición
  private isPoppingUp: boolean = false;
  private popVelocity: number = 0;
  private currentY: number = 0;

  constructor(data: WorldTileDefinition, isUnlocked: boolean = false) {
    this.data = data;
    this.isUnlocked = isUnlocked;

    // Inicializar costes
    if (data.cost) {
      for (const req of data.cost) {
        this.requiredTotal[req.resourceId] = req.amount;
        this.currentInvested[req.resourceId] = isUnlocked ? req.amount : 0;
      }
    }

    this.group = new THREE.Group();
    const worldX = data.x * TILE_SIZE;
    const worldZ = data.z * TILE_SIZE;
    this.group.position.set(worldX, isUnlocked ? 0 : 0, worldZ);

    this.rebuildMesh();

    if (!isUnlocked && data.cost && data.cost.length > 0) {
      this.createCostBadge();
    }
  }

  public rebuildMesh(): void {
    // Limpiar hijos existentes de la losa
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
    }

    const tileMesh = MeshFactory.createTileMesh(this.data.biome, !this.isUnlocked);
    this.group.add(tileMesh);

    if (!this.isUnlocked && this.badgeMesh) {
      this.group.add(this.badgeMesh);
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
    this.badgeMesh.position.set(0, 1.8, 0);
    this.group.add(this.badgeMesh);

    this.updateBadgeTexture();
  }

  public updateBadgeTexture(): void {
    if (!this.badgeCanvas || !this.badgeTexture) return;

    const ctx = this.badgeCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 128);

    // Fondo redondeado estilo glassmorphism
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 112, 20);
    ctx.fill();

    // Borde brillante
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00F5D4';
    ctx.stroke();

    if (!this.data.cost) return;

    // Dibujar lista de costes
    const totalItems = this.data.cost.length;
    this.data.cost.forEach((req, idx) => {
      const res = RESOURCES[req.resourceId];
      const icon = res ? res.icon : '📦';
      const invested = this.currentInvested[req.resourceId] || 0;
      const target = req.amount;

      const y = totalItems === 1 ? 70 : 45 + idx * 42;

      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(icon, 24, y);

      ctx.font = 'bold 26px Outfit, sans-serif';
      ctx.fillStyle = invested >= target ? '#06D6A0' : '#FFFFFF';
      ctx.fillText(`${invested}/${target}`, 75, y);

      // Barra de progreso horizontal mini
      const barW = 85;
      const barH = 8;
      const barX = 145;
      const barY = y - 18;

      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(barX, barY, barW, barH);

      const pct = Math.min(1.0, invested / target);
      ctx.fillStyle = invested >= target ? '#06D6A0' : '#FFD166';
      ctx.fillRect(barX, barY, barW * pct, barH);
    });

    this.badgeTexture.needsUpdate = true;
  }

  // Comprobar si está lista para desbloquear
  public isFullyFunded(): boolean {
    if (!this.data.cost || this.data.cost.length === 0) return true;
    for (const req of this.data.cost) {
      if ((this.currentInvested[req.resourceId] || 0) < req.amount) {
        return false;
      }
    }
    return true;
  }

  // Alimentar recursos desde el inventario del jugador
  public feedResource(resourceId: string, amount: number = 1): number {
    if (this.isUnlocked || !this.requiredTotal[resourceId]) return 0;

    const needed = this.requiredTotal[resourceId] - (this.currentInvested[resourceId] || 0);
    if (needed <= 0) return 0;

    const toFeed = Math.min(amount, needed);
    this.currentInvested[resourceId] = (this.currentInvested[resourceId] || 0) + toFeed;
    this.updateBadgeTexture();

    return toFeed;
  }

  // Iniciar animación de desbloqueo y pop-up
  public unlock(): void {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    if (this.badgeMesh) {
      this.group.remove(this.badgeMesh);
      this.badgeMesh = null;
    }

    this.rebuildMesh();

    // Animación de elevación elástica
    this.isPoppingUp = true;
    this.currentY = -4.0;
    this.popVelocity = 18.0;
  }

  public update(delta: number, camera: THREE.Camera): void {
    // Orientar el badge hacia la cámara (billboard)
    if (this.badgeMesh) {
      this.badgeMesh.quaternion.copy(camera.quaternion);
      // Animación suave de flotación
      this.badgeMesh.position.y = 1.8 + Math.sin(Date.now() * 0.004) * 0.12;
    }

    // Animación elástica de emergencia de la losa
    if (this.isPoppingUp) {
      const spring = 80.0;
      const damping = 8.0;
      const force = -spring * this.currentY - damping * this.popVelocity;
      this.popVelocity += force * delta;
      this.currentY += this.popVelocity * delta;

      if (Math.abs(this.currentY) < 0.02 && Math.abs(this.popVelocity) < 0.1) {
        this.currentY = 0;
        this.isPoppingUp = false;
      }

      this.group.position.y = this.currentY;
    }
  }
}

