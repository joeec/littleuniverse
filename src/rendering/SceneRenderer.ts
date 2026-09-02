import * as THREE from 'three';
import { CameraController } from './CameraController';
import { BIOMES } from '../data/WorldData';

export class SceneRenderer {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public cameraController: CameraController;

  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;
  private fog: THREE.FogExp2;

  // Océano estilizado procedural
  private oceanMesh!: THREE.Mesh;
  private oceanGeometry!: THREE.PlaneGeometry;
  private oceanPositions!: Float32Array;

  // Nubes flotantes estilizadas
  private cloudsGroup: THREE.Group = new THREE.Group();
  private clouds: { mesh: THREE.Mesh; speed: number; startX: number }[] = [];

  // Partículas ambientales de bioma (spores, embers, stars)
  private ambientParticles!: THREE.Points;
  private ambientGeo!: THREE.BufferGeometry;
  private ambientPositions!: Float32Array;

  private currentBiome: string = 'verdant';
  private targetFogColor: THREE.Color = new THREE.Color(0xA8DADC);
  private targetSkyColor: THREE.Color = new THREE.Color(0x457B9D);
  private targetLightColor: THREE.Color = new THREE.Color(0xF4F1DE);
  private targetOceanColor: THREE.Color = new THREE.Color(0x1D3557);

  private elapsedTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.cameraController = new CameraController();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Niebla atmosférica profunda
    this.fog = new THREE.FogExp2(0xA8DADC, 0.014);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(0x457B9D);

    // Iluminación ambiental cálida + Luz de sol dorada
    this.hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x334155, 0.85);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xF4F1DE, 0.45);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xFFE8B8, 1.4);
    this.dirLight.position.set(25, 45, 25);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 120;
    const d = 35;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0003;
    this.scene.add(this.dirLight);

    this.createStylizedOcean();
    this.createFloatingClouds();
    this.createAmbientBiomeParticles();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  // --- OCÉANO PROCEDURAL CON OLAS Y ESPUMA ---
  private createStylizedOcean(): void {
    const segments = 60;
    const oceanSize = 250;
    this.oceanGeometry = new THREE.PlaneGeometry(oceanSize, oceanSize, segments, segments);
    this.oceanGeometry.rotateX(-Math.PI / 2);

    this.oceanPositions = this.oceanGeometry.attributes.position.array as Float32Array;

    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x1D3557,
      roughness: 0.15,
      metalness: 0.4,
      emissive: 0x0A2540,
      emissiveIntensity: 0.3,
      flatShading: true
    });

    this.oceanMesh = new THREE.Mesh(this.oceanGeometry, oceanMat);
    this.oceanMesh.position.y = -1.2;
    this.oceanMesh.receiveShadow = true;
    this.scene.add(this.oceanMesh);
  }

  // --- NUBES 3D FLOTANTES ---
  private createFloatingClouds(): void {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xF8FAFC,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
      flatShading: true
    });

    for (let i = 0; i < 16; i++) {
      const cloud = new THREE.Group();
      const puffs = 3 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffs; p++) {
        const radius = 2.5 + Math.random() * 2.5;
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), cloudMat);
        puff.position.set((p - puffs / 2) * 2.8, (Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 2.0);
        puff.scale.set(1.2, 0.75, 1.0);
        cloud.add(puff);
      }

      const x = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 160;
      const y = 14 + Math.random() * 6;

      cloud.position.set(x, y, z);
      this.cloudsGroup.add(cloud);
      this.clouds.push({
        mesh: cloud as any,
        speed: 0.8 + Math.random() * 1.2,
        startX: x
      });
    }

    this.scene.add(this.cloudsGroup);
  }

  // --- PARTÍCULAS AMBIENTALES DE POLEN / ESPORAS / CENIZA ---
  private createAmbientBiomeParticles(): void {
    const particleCount = 300;
    this.ambientGeo = new THREE.BufferGeometry();
    this.ambientPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      this.ambientPositions[i] = (Math.random() - 0.5) * 60;
      this.ambientPositions[i + 1] = Math.random() * 12;
      this.ambientPositions[i + 2] = (Math.random() - 0.5) * 60;
    }

    this.ambientGeo.setAttribute('position', new THREE.BufferAttribute(this.ambientPositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00F5D4,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.ambientParticles = new THREE.Points(this.ambientGeo, particleMat);
    this.scene.add(this.ambientParticles);
  }

  public setBiomeColors(biomeId: string): void {
    const biome = BIOMES[biomeId] || BIOMES.verdant;
    this.currentBiome = biomeId;
    this.targetFogColor.set(biome.fogColor);
    this.targetSkyColor.set(biome.skyColor);
    this.targetLightColor.set(biome.ambientColor);

    if (biomeId === 'verdant') {
      this.targetOceanColor.set(0x1D3557);
      (this.ambientParticles.material as THREE.PointsMaterial).color.set(0x00F5D4);
    } else if (biomeId === 'amberwood') {
      this.targetOceanColor.set(0x3D2614);
      (this.ambientParticles.material as THREE.PointsMaterial).color.set(0xFFB703);
    } else if (biomeId === 'crystal_caverns') {
      this.targetOceanColor.set(0x240046);
      (this.ambientParticles.material as THREE.PointsMaterial).color.set(0x9B5DE5);
    } else if (biomeId === 'molten_peaks') {
      this.targetOceanColor.set(0x4A0000);
      (this.ambientParticles.material as THREE.PointsMaterial).color.set(0xFF5400);
    }
  }

  public update(delta: number, playerPos: THREE.Vector3): void {
    this.elapsedTime += delta;
    this.cameraController.setTarget(playerPos.x, playerPos.y, playerPos.z);
    this.cameraController.update(delta);

    // Mover sol y sombra con el jugador
    this.dirLight.position.set(playerPos.x + 25, playerPos.y + 45, playerPos.z + 25);
    this.dirLight.target.position.copy(playerPos);
    this.dirLight.target.updateMatrixWorld();

    // Centrar océano con el jugador
    this.oceanMesh.position.x = playerPos.x;
    this.oceanMesh.position.z = playerPos.z;

    // Animación de olas senoidales en el océano
    const posAttr = this.oceanGeometry.attributes.position;
    const array = posAttr.array as Float32Array;
    for (let i = 0; i < array.length; i += 3) {
      const wx = array[i] + playerPos.x;
      const wz = array[i + 2] + playerPos.z;
      array[i + 1] =
        Math.sin(wx * 0.15 + this.elapsedTime * 1.6) * 0.28 +
        Math.cos(wz * 0.18 + this.elapsedTime * 1.3) * 0.24;
    }
    posAttr.needsUpdate = true;
    this.oceanGeometry.computeVertexNormals();

    // Animar nubes a la deriva
    for (const c of this.clouds) {
      c.mesh.position.x += c.speed * delta;
      if (c.mesh.position.x > playerPos.x + 80) {
        c.mesh.position.x = playerPos.x - 80;
      }
    }

    // Animar partículas ambientales flotantes
    const pArray = this.ambientGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < pArray.length; i += 3) {
      pArray[i + 1] -= delta * 0.6;
      pArray[i] += Math.sin(this.elapsedTime + i) * delta * 0.4;
      if (pArray[i + 1] < 0) {
        pArray[i + 1] = 12;
        pArray[i] = playerPos.x + (Math.random() - 0.5) * 50;
        pArray[i + 2] = playerPos.z + (Math.random() - 0.5) * 50;
      }
    }
    this.ambientGeo.attributes.position.needsUpdate = true;

    // Transición suave de colores del cielo y niebla
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.lerp(this.targetFogColor, 0.05);
    }
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.lerp(this.targetSkyColor, 0.05);
    }
    this.ambientLight.color.lerp(this.targetLightColor, 0.05);
    (this.oceanMesh.material as THREE.MeshStandardMaterial).color.lerp(this.targetOceanColor, 0.05);
  }

  public render(): void {
    this.renderer.render(this.scene, this.cameraController.camera);
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.cameraController.onResize(width, height);
    this.renderer.setSize(width, height);
  }
}
