import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  scale: number;
  gravity: number;
  rotationSpeed: THREE.Vector3;
  active: boolean;
}

interface FloatingText {
  element: HTMLDivElement;
  worldPos: THREE.Vector3;
  life: number;
  maxLife: number;
  velocity: THREE.Vector3;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private poolSize: number = 300;
  private particleGroup: THREE.Group = new THREE.Group();
  private floatingTexts: FloatingText[] = [];
  private textContainer: HTMLElement;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.particleGroup);

    let container = document.getElementById('floating-text-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'floating-text-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '50';
      document.body.appendChild(container);
    }
    this.textContainer = container;

    this.initPool();
  }

  private initPool(): void {
    const geo = new THREE.DodecahedronGeometry(0.1, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    for (let i = 0; i < this.poolSize; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.visible = false;
      this.particleGroup.add(mesh);

      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        scale: 1,
        gravity: 9.8,
        rotationSpeed: new THREE.Vector3(),
        active: false
      });
    }
  }

  public spawnDebris(x: number, y: number, z: number, colorHex: number, count: number = 10, scale: number = 1.0): void {
    let spawned = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.mesh.visible = true;
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
        p.mesh.position.set(x + (Math.random() - 0.5) * 0.4, y + 0.3 + (Math.random() - 0.5) * 0.3, z + (Math.random() - 0.5) * 0.4);

        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 4.0;
        p.velocity.set(Math.cos(angle) * speed, 3.5 + Math.random() * 4.5, Math.sin(angle) * speed);

        p.life = 0;
        p.maxLife = 0.4 + Math.random() * 0.4;
        p.scale = scale * (0.9 + Math.random() * 0.6);
        p.gravity = 15.0;
        p.rotationSpeed.set(Math.random() * 12, Math.random() * 12, Math.random() * 12);

        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  public spawnAura(x: number, y: number, z: number, colorHex: number, count: number = 16): void {
    let spawned = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.mesh.visible = true;
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
        p.mesh.position.set(x + (Math.random() - 0.5) * 1.8, y + 0.2, z + (Math.random() - 0.5) * 1.8);

        p.velocity.set((Math.random() - 0.5) * 1.2, 3.0 + Math.random() * 2.5, (Math.random() - 0.5) * 1.2);
        p.life = 0;
        p.maxLife = 0.7 + Math.random() * 0.6;
        p.scale = 1.4;
        p.gravity = -1.5;
        p.rotationSpeed.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);

        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  public spawnFloatingText(text: string, pos: THREE.Vector3, color: string = '#FFFFFF', isCrit: boolean = false): void {
    const el = document.createElement('div');
    el.className = `floating-dmg-text ${isCrit ? 'crit' : ''}`;
    el.textContent = text;
    el.style.color = color;
    el.style.fontSize = isCrit ? '22px' : '15px';
    el.style.fontWeight = '800';
    el.style.textShadow = '0 2px 6px rgba(0,0,0,0.9), 0 0 10px ' + color;
    el.style.position = 'absolute';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.transition = 'opacity 0.15s ease-out';
    this.textContainer.appendChild(el);

    this.floatingTexts.push({
      element: el,
      worldPos: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.9, (Math.random() - 0.5) * 0.4)),
      life: 0,
      maxLife: 0.9,
      velocity: new THREE.Vector3(0, 2.0, 0)
    });
  }

  public update(delta: number, camera: THREE.Camera): void {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.active) {
        p.life += delta;
        if (p.life >= p.maxLife) {
          p.active = false;
          p.mesh.visible = false;
          continue;
        }

        p.velocity.y -= p.gravity * delta;
        p.mesh.position.addScaledVector(p.velocity, delta);

        p.mesh.rotation.x += p.rotationSpeed.x * delta;
        p.mesh.rotation.y += p.rotationSpeed.y * delta;
        p.mesh.rotation.z += p.rotationSpeed.z * delta;

        const progress = 1 - (p.life / p.maxLife);
        const curScale = p.scale * progress;
        p.mesh.scale.set(curScale, curScale, curScale);
      }
    }

    const screenPos = new THREE.Vector3();
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += delta;

      if (ft.life >= ft.maxLife) {
        ft.element.remove();
        this.floatingTexts.splice(i, 1);
        continue;
      }

      ft.worldPos.addScaledVector(ft.velocity, delta);

      screenPos.copy(ft.worldPos);
      screenPos.project(camera);

      if (screenPos.z > 1) {
        ft.element.style.display = 'none';
      } else {
        ft.element.style.display = 'block';
        const x = (screenPos.x * halfW) + halfW;
        const y = -(screenPos.y * halfH) + halfH;
        ft.element.style.left = `${x}px`;
        ft.element.style.top = `${y}px`;

        const alpha = 1 - Math.pow(ft.life / ft.maxLife, 2);
        ft.element.style.opacity = `${alpha}`;
      }
    }
  }
}
