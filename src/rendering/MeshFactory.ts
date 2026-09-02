import * as THREE from 'three';

export class MeshFactory {
  private static materials: Map<string, THREE.Material> = new Map();

  public static getMaterial(
    color: string | number,
    roughness: number = 0.5,
    metalness: number = 0.1,
    emissive: number = 0x000000,
    emissiveIntensity: number = 1.0,
    transparent: boolean = false,
    opacity: number = 1.0
  ): THREE.MeshStandardMaterial {
    const key = `${color}_${roughness}_${metalness}_${emissive}_${emissiveIntensity}_${transparent}_${opacity}`;
    if (!this.materials.has(key)) {
      this.materials.set(
        key,
        new THREE.MeshStandardMaterial({
          color,
          roughness,
          metalness,
          emissive,
          emissiveIntensity,
          transparent,
          opacity,
          flatShading: true
        })
      );
    }
    return this.materials.get(key) as THREE.MeshStandardMaterial;
  }

  // --- JUGADOR PREMIUM ESTILIZADO ---
  public static createPlayerMesh(): {
    group: THREE.Group;
    bodyMesh: THREE.Mesh;
    backpackMesh: THREE.Mesh;
    rightHand: THREE.Group;
    leftHand: THREE.Group;
    toolGroup: THREE.Group;
    capeMesh: THREE.Mesh;
    hairMesh: THREE.Group;
  } {
    const group = new THREE.Group();

    // Sombra suave proyectada
    const shadowGeo = new THREE.CircleGeometry(0.55, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x070A13, transparent: true, opacity: 0.45 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    group.add(shadowMesh);

    // Torso / Túnica estilizada
    const bodyGeo = new THREE.CylinderGeometry(0.34, 0.38, 0.72, 8);
    const bodyMat = this.getMaterial(0x2B6CB0, 0.4, 0.1);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.62;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Cinturón de aventurero con hebilla dorada
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 8), this.getMaterial(0x5A3E2B, 0.7, 0.0));
    belt.position.y = 0.45;
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.06), this.getMaterial(0xFFD700, 0.2, 0.8));
    buckle.position.set(0, 0.45, 0.36);
    group.add(belt, buckle);

    // Capa de aventurero con física de inercia
    const capeGeo = new THREE.PlaneGeometry(0.48, 0.65, 2, 4);
    const capeMat = this.getMaterial(0xE53E3E, 0.6, 0.0, 0x000000, 1.0, false);
    (capeMat as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    const capeMesh = new THREE.Mesh(capeGeo, capeMat);
    capeMesh.position.set(0, 0.75, -0.32);
    capeMesh.rotation.x = 0.18;
    capeMesh.castShadow = true;
    group.add(capeMesh);

    // Cabeza con piel cálida
    const headGeo = new THREE.SphereGeometry(0.3, 10, 10);
    const headMat = this.getMaterial(0xFFDFC4, 0.6, 0.0);
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.2;
    headMesh.castShadow = true;
    group.add(headMesh);

    // Ojos de anime con brillo especular
    const eyeWhiteGeo = new THREE.BoxGeometry(0.08, 0.1, 0.04);
    const eyeWhiteMat = this.getMaterial(0xFFFFFF, 0.2, 0.0);
    const eyePupilGeo = new THREE.BoxGeometry(0.05, 0.07, 0.05);
    const eyePupilMat = this.getMaterial(0x1A365D, 0.1, 0.0);

    const leftEyeW = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeW.position.set(-0.11, 1.22, 0.27);
    const leftEyeP = new THREE.Mesh(eyePupilGeo, eyePupilMat);
    leftEyeP.position.set(-0.11, 1.22, 0.28);

    const rightEyeW = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEyeW.position.set(0.11, 1.22, 0.27);
    const rightEyeP = new THREE.Mesh(eyePupilGeo, eyePupilMat);
    rightEyeP.position.set(0.11, 1.22, 0.28);
    group.add(leftEyeW, leftEyeP, rightEyeW, rightEyeP);

    // Pelo estilizado con flequillo y mechones
    const hairMesh = new THREE.Group();
    const hairMat = this.getMaterial(0x8C532B, 0.7, 0.0);
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), hairMat);
    hairTop.position.set(0, 1.3, -0.05);
    hairTop.scale.set(1.02, 0.8, 1.05);

    const tuft1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 5), hairMat);
    tuft1.position.set(-0.15, 1.38, 0.22);
    tuft1.rotation.set(-0.4, 0, 0.5);

    const tuft2 = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 5), hairMat);
    tuft2.position.set(0.05, 1.42, 0.24);
    tuft2.rotation.set(-0.5, 0, -0.2);

    hairMesh.add(hairTop, tuft1, tuft2);
    group.add(hairMesh);

    // Mochila detallada con correas y frasco mágico brillante
    const backpackGeo = new THREE.BoxGeometry(0.42, 0.52, 0.26);
    const backpackMat = this.getMaterial(0x7B341E, 0.75, 0.0);
    const backpackMesh = new THREE.Mesh(backpackGeo, backpackMat);
    backpackMesh.position.set(0, 0.68, -0.32);
    backpackMesh.castShadow = true;

    // Frasco de poción lateral con brillo de neón
    const potionGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 6);
    const potionMat = this.getMaterial(0x00F5D4, 0.1, 0.1, 0x00F5D4, 1.5);
    const potion = new THREE.Mesh(potionGeo, potionMat);
    potion.position.set(0.24, 0.68, -0.28);
    potion.rotation.z = 0.2;
    group.add(backpackMesh, potion);

    // Brazos articulados
    const handMat = this.getMaterial(0xFFDFC4, 0.6, 0.0);
    const leftHand = new THREE.Group();
    leftHand.position.set(-0.44, 0.68, 0);
    const lhMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), handMat);
    lhMesh.castShadow = true;
    leftHand.add(lhMesh);

    const rightHand = new THREE.Group();
    rightHand.position.set(0.44, 0.68, 0);
    const rhMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), handMat);
    rhMesh.castShadow = true;
    rightHand.add(rhMesh);

    const toolGroup = new THREE.Group();
    toolGroup.position.set(0, 0, 0.12);
    rightHand.add(toolGroup);

    group.add(leftHand, rightHand);

    return { group, bodyMesh, backpackMesh, rightHand, leftHand, toolGroup, capeMesh, hairMesh };
  }

  // --- HERRAMIENTAS Y ARMAS CON FILO LUMINOSO ---
  public static createToolMesh(type: 'axe' | 'pickaxe' | 'sword', colorHex: number = 0xD2691E): THREE.Group {
    const group = new THREE.Group();
    const handleMat = this.getMaterial(0x5A3E2B, 0.8, 0.0);
    const bladeMat = this.getMaterial(colorHex, 0.2, 0.7, colorHex, 0.4);
    const glowMat = this.getMaterial(0xFFFFFF, 0.1, 0.0, colorHex, 2.0);

    // Mango con empuñadura forrada
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.7, 6);
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 0.28;
    handle.castShadow = true;
    group.add(handle);

    if (type === 'axe') {
      const bladeGeo = new THREE.BoxGeometry(0.3, 0.22, 0.06);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0.13, 0.54, 0);
      blade.castShadow = true;

      const edgeGeo = new THREE.BoxGeometry(0.03, 0.24, 0.07);
      const edge = new THREE.Mesh(edgeGeo, glowMat);
      edge.position.set(0.28, 0.54, 0);

      group.add(blade, edge);
    } else if (type === 'pickaxe') {
      const pickGeo = new THREE.BoxGeometry(0.48, 0.09, 0.07);
      const pick = new THREE.Mesh(pickGeo, bladeMat);
      pick.position.set(0, 0.56, 0);
      pick.rotation.z = 0.18;
      pick.castShadow = true;

      const tipL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 5), glowMat);
      tipL.position.set(-0.25, 0.52, 0);
      tipL.rotation.z = Math.PI / 2 + 0.18;

      const tipR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 5), glowMat);
      tipR.position.set(0.25, 0.60, 0);
      tipR.rotation.z = -Math.PI / 2 + 0.18;

      group.add(pick, tipL, tipR);
    } else if (type === 'sword') {
      const bladeGeo = new THREE.BoxGeometry(0.09, 0.8, 0.04);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, 0.68, 0);
      blade.castShadow = true;

      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 4), bladeMat);
      tip.position.set(0, 1.15, 0);

      const runeLine = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.55, 0.05), glowMat);
      runeLine.position.set(0, 0.65, 0);

      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.08), this.getMaterial(0xFFD700, 0.2, 0.8));
      guard.position.set(0, 0.28, 0);

      group.add(blade, tip, runeLine, guard);
    }

    group.rotation.x = Math.PI / 4;
    return group;
  }

  // --- LOSAS DE TERRENO MULTICAPA CON VEGETACIÓN ---
  public static createTileMesh(biome: string, isGhost: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const size = 5.8;
    const height = 1.6;

    let topColor = 0x48BB78; // Verde exuberante
    let sideColor = 0x2D3748; // Roca oscura estratificada
    let cliffStripeColor = 0x4A5568;

    if (biome === 'amberwood') {
      topColor = 0xD69E2E;
      sideColor = 0x744210;
      cliffStripeColor = 0x975A16;
    } else if (biome === 'crystal_caverns') {
      topColor = 0x6B46C1;
      sideColor = 0x231942;
      cliffStripeColor = 0x3E1F47;
    } else if (biome === 'molten_peaks') {
      topColor = 0xC53030;
      sideColor = 0x1A202C;
      cliffStripeColor = 0x7B1113;
    }

    if (isGhost) {
      const ghostMat = this.getMaterial(0x00F5D4, 0.1, 0.2, 0x00F5D4, 0.8, true, 0.4);
      const topGeo = new THREE.CylinderGeometry(size * 0.55, size * 0.55, 0.2, 6);
      const ghostMesh = new THREE.Mesh(topGeo, ghostMat);
      ghostMesh.position.y = 0.1;

      // Doble aro mágico de runas
      const ring1 = new THREE.Mesh(
        new THREE.RingGeometry(size * 0.42, size * 0.50, 24),
        new THREE.MeshBasicMaterial({ color: 0x00F5D4, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
      );
      ring1.rotation.x = -Math.PI / 2;
      ring1.position.y = 0.22;

      const ring2 = new THREE.Mesh(
        new THREE.RingGeometry(size * 0.25, size * 0.32, 18),
        new THREE.MeshBasicMaterial({ color: 0xFFD166, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
      );
      ring2.rotation.x = -Math.PI / 2;
      ring2.position.y = 0.23;

      group.add(ghostMesh, ring1, ring2);
    } else {
      // Bloque geológico estratificado
      const cliffGeo = new THREE.CylinderGeometry(size * 0.54, size * 0.48, height, 6);
      const cliffMat = this.getMaterial(sideColor, 0.85, 0.05);
      const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
      cliffMesh.position.y = -height * 0.5;
      cliffMesh.receiveShadow = true;

      // Estrato geológico central
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(size * 0.52, size * 0.50, 0.4, 6),
        this.getMaterial(cliffStripeColor, 0.9, 0.0)
      );
      stripe.position.y = -height * 0.5;

      // Capa de césped vibrante con borde redondeado
      const topGeo = new THREE.CylinderGeometry(size * 0.56, size * 0.55, 0.3, 6);
      const topMat = this.getMaterial(topColor, 0.65, 0.0);
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = 0.08;
      topMesh.receiveShadow = true;

      group.add(cliffMesh, stripe, topMesh);

      // Decoración procedural de la losa (flores, briznas de hierba, setas, gemas)
      const decoCount = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < decoCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 0.8 + Math.random() * (size * 0.35);
        const dx = Math.cos(angle) * dist;
        const dz = Math.sin(angle) * dist;

        if (biome === 'verdant') {
          // Flor silvestre o hierba 3D
          const isFlower = i % 2 === 0;
          if (isFlower) {
            const petalMat = this.getMaterial(i % 4 === 0 ? 0xFF6B6B : 0xFFD93D, 0.3, 0.0);
            const flower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), petalMat);
            flower.position.set(dx, 0.28, dz);
            group.add(flower);
          } else {
            const grassMat = this.getMaterial(0x2E8540, 0.6, 0.0);
            const blade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 4), grassMat);
            blade.position.set(dx, 0.32, dz);
            blade.rotation.set((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3);
            group.add(blade);
          }
        } else if (biome === 'crystal_caverns') {
          // Cristales miniatura decorativos
          const gemMat = this.getMaterial(0x9B5DE5, 0.1, 0.3, 0x7209B7, 1.2);
          const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), gemMat);
          gem.position.set(dx, 0.3, dz);
          gem.rotation.set(0.3, Math.random() * Math.PI, 0.2);
          group.add(gem);
        } else if (biome === 'molten_peaks') {
          // Grieta de magma brillante
          const magmaMat = this.getMaterial(0xFF5400, 0.2, 0.1, 0xFF5400, 2.0);
          const ember = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1), magmaMat);
          ember.position.set(dx, 0.26, dz);
          group.add(ember);
        }
      }
    }

    return group;
  }

  // --- NODOS DE RECURSOS CON SHADERS Y BRILLOS ---
  public static createResourceNodeMesh(type: string): THREE.Group {
    const group = new THREE.Group();

    if (type === 'tree' || type === 'amber') {
      // Tronco estilizado con nudos
      const trunkMat = this.getMaterial(0x5C3A21, 0.85, 0.0);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.42, 1.6, 7), trunkMat);
      trunk.position.y = 0.8;
      trunk.castShadow = true;
      group.add(trunk);

      // Raíces visibles
      for (let r = 0; r < 3; r++) {
        const root = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 4), trunkMat);
        const rAngle = (r * Math.PI * 2) / 3;
        root.position.set(Math.cos(rAngle) * 0.32, 0.2, Math.sin(rAngle) * 0.32);
        root.rotation.set(Math.sin(rAngle) * 0.5, rAngle, Math.cos(rAngle) * 0.5);
        group.add(root);
      }

      // Copa de hojas exuberante multicapa
      const isAmber = type === 'amber';
      const leafColor1 = isAmber ? 0xD97706 : 0x22543D;
      const leafColor2 = isAmber ? 0xF59E0B : 0x2F855A;
      const leafColor3 = isAmber ? 0xFBBF24 : 0x48BB78;

      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), this.getMaterial(leafColor1, 0.6, 0.0));
      c1.position.y = 1.9;
      c1.scale.set(1.1, 0.9, 1.1);
      c1.castShadow = true;

      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 1), this.getMaterial(leafColor2, 0.6, 0.0));
      c2.position.y = 2.6;
      c2.scale.set(1.0, 0.85, 1.0);
      c2.castShadow = true;

      const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), this.getMaterial(leafColor3, 0.55, 0.0));
      c3.position.y = 3.2;
      c3.castShadow = true;

      group.add(c1, c2, c3);

      if (isAmber) {
        // Gotas de resina de ámbar brillantes colgando
        const amberDropMat = this.getMaterial(0xFFB703, 0.1, 0.2, 0xFFA200, 1.8);
        for (let a = 0; a < 3; a++) {
          const drop = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), amberDropMat);
          const aAng = (a * Math.PI * 2) / 3;
          drop.position.set(Math.cos(aAng) * 0.8, 1.6, Math.sin(aAng) * 0.8);
          group.add(drop);
        }
      }
    } else if (type === 'rock' || type === 'copper' || type === 'iron' || type === 'crystal' || type === 'cobalt' || type === 'obsidian') {
      // Roca base facetada con chaflanes pronunciados
      let rockColor = 0x4A5568;
      if (type === 'obsidian') rockColor = 0x1A202C;
      if (type === 'crystal') rockColor = 0x2D3748;

      const rockMat = this.getMaterial(rockColor, 0.8, 0.1);
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), rockMat);
      rock.position.y = 0.75;
      rock.scale.set(1.1, 0.85, 1.05);
      rock.castShadow = true;
      group.add(rock);

      // Cristales y vetas incrustadas
      if (type !== 'rock') {
        let oreColor = 0xD2691E;
        let emissive = 0x773300;
        let emissiveIntensity = 1.0;
        let metalness = 0.8;

        if (type === 'iron') {
          oreColor = 0xCBD5E0;
          emissive = 0x4A5568;
          emissiveIntensity = 0.4;
          metalness = 0.9;
        } else if (type === 'crystal') {
          oreColor = 0x9B5DE5;
          emissive = 0x7209B7;
          emissiveIntensity = 1.8;
          metalness = 0.2;
        } else if (type === 'cobalt') {
          oreColor = 0x00B4D8;
          emissive = 0x0077B6;
          emissiveIntensity = 1.5;
          metalness = 0.7;
        } else if (type === 'obsidian') {
          oreColor = 0x7209B7;
          emissive = 0x3A0CA3;
          emissiveIntensity = 2.0;
          metalness = 0.4;
        }

        const oreMat = this.getMaterial(oreColor, 0.15, metalness, emissive, emissiveIntensity);

        for (let i = 0; i < 4; i++) {
          const crystalGeo = new THREE.OctahedronGeometry(0.24, 0);
          const crystal = new THREE.Mesh(crystalGeo, oreMat);
          const angle = (i * Math.PI * 2) / 4 + 0.3;
          crystal.position.set(Math.cos(angle) * 0.65, 0.85 + (i % 2) * 0.25, Math.sin(angle) * 0.65);
          crystal.rotation.set(Math.sin(angle) * 0.6, angle, Math.cos(angle) * 0.6);
          crystal.scale.set(0.8, 1.6, 0.8);
          crystal.castShadow = true;
          group.add(crystal);
        }
      }
    } else if (type === 'fiber') {
      // Arbusto de bayas y hojas mágicas
      const bushMat = this.getMaterial(0x38A169, 0.6, 0.0);
      const b1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 1), bushMat);
      b1.position.set(0, 0.45, 0);

      const berryMat = this.getMaterial(0xE53E3E, 0.2, 0.1, 0xE53E3E, 1.2);
      for (let b = 0; b < 5; b++) {
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), berryMat);
        const bAngle = (b * Math.PI * 2) / 5;
        berry.position.set(Math.cos(bAngle) * 0.38, 0.45 + (b % 2) * 0.15, Math.sin(bAngle) * 0.38);
        group.add(berry);
      }
      group.add(b1);
    }

    return group;
  }

  // --- ENEMIGOS PREMIUM ---
  public static createEnemyMesh(type: string, colorHex: number = 0x55A630): { group: THREE.Group; mesh: THREE.Mesh } {
    const group = new THREE.Group();

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.45, 12),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    let mesh: THREE.Mesh;

    if (type === 'spore_slime') {
      // Slime de gelatina translúcida con núcleo interno brillante
      const slimeGeo = new THREE.SphereGeometry(0.48, 10, 10);
      const slimeMat = this.getMaterial(colorHex, 0.1, 0.1, colorHex, 0.8, true, 0.78);
      mesh = new THREE.Mesh(slimeGeo, slimeMat);
      mesh.position.y = 0.44;
      mesh.scale.set(1.05, 0.8, 1.05);
      mesh.castShadow = true;

      // Núcleo energético interno
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), this.getMaterial(0xFFD166, 0.1, 0.1, 0xFFD166, 2.0));
      core.position.y = 0.44;

      // Ojos con brillo
      const eyeMat = this.getMaterial(0xFFFFFF, 0.1, 0.0);
      const pupilMat = this.getMaterial(0x000000, 0.1, 0.0);
      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
      leftEye.position.set(-0.16, 0.52, 0.38);
      const leftP = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), pupilMat);
      leftP.position.set(-0.16, 0.52, 0.44);

      const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
      rightEye.position.set(0.16, 0.52, 0.38);
      const rightP = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), pupilMat);
      rightP.position.set(0.16, 0.52, 0.44);

      group.add(mesh, core, leftEye, leftP, rightEye, rightP);
    } else if (type === 'armored_beetle') {
      // Escarabajo acorazado con brillo metálico e iridiscencia
      const beetleGeo = new THREE.BoxGeometry(0.95, 0.55, 1.2);
      const beetleMat = this.getMaterial(colorHex, 0.3, 0.7, 0x1A202C, 0.5);
      mesh = new THREE.Mesh(beetleGeo, beetleMat);
      mesh.position.y = 0.38;
      mesh.castShadow = true;

      // Cuerno colosal
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 6), this.getMaterial(0xD69E2E, 0.2, 0.8));
      horn.position.set(0, 0.52, 0.8);
      horn.rotation.x = Math.PI / 3.5;

      // Patas articuladas
      for (let p = 0; p < 6; p++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 4), this.getMaterial(0x1A202C, 0.8, 0.0));
        const side = p % 2 === 0 ? 1 : -1;
        const row = Math.floor(p / 2) - 1;
        leg.position.set(side * 0.55, 0.2, row * 0.35);
        leg.rotation.z = side * (Math.PI / 3);
        group.add(leg);
      }

      group.add(mesh, horn);
    } else if (type === 'crystal_spitter') {
      // Centinela de esquirlas con cristal central y anillos orbitales
      const crystalGeo = new THREE.OctahedronGeometry(0.55, 0);
      const crystalMat = this.getMaterial(colorHex, 0.1, 0.3, colorHex, 1.8);
      mesh = new THREE.Mesh(crystalGeo, crystalMat);
      mesh.position.y = 0.85;
      mesh.castShadow = true;

      const orbitRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.04, 6, 16),
        this.getMaterial(0xFFD166, 0.1, 0.0, 0xFFD166, 1.5)
      );
      orbitRing.position.y = 0.85;
      orbitRing.rotation.x = Math.PI / 3;

      group.add(mesh, orbitRing);
    } else if (type === 'void_wisp') {
      const wispGeo = new THREE.IcosahedronGeometry(0.42, 0);
      const wispMat = this.getMaterial(colorHex, 0.1, 0.1, colorHex, 2.5);
      mesh = new THREE.Mesh(wispGeo, wispMat);
      mesh.position.y = 1.1;

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 8, 8),
        this.getMaterial(0x00F5D4, 0.1, 0.0, 0x00F5D4, 1.0, true, 0.35)
      );
      halo.position.y = 1.1;

      group.add(mesh, halo);
    } else {
      // Bandido furtivo con capucha y dos dagas brillantes
      const banditGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.75, 8);
      mesh = new THREE.Mesh(banditGeo, this.getMaterial(colorHex, 0.6, 0.1));
      mesh.position.y = 0.58;
      mesh.castShadow = true;

      const hood = new THREE.Mesh(new THREE.SphereGeometry(0.28, 7, 7), this.getMaterial(0x742A2A, 0.7, 0.0));
      hood.position.y = 1.1;
      hood.castShadow = true;

      // Ojos brillantes en la sombra
      const glowEyes = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), this.getMaterial(0xFFD700, 0.1, 0.0, 0xFFD700, 2.0));
      glowEyes.position.set(0, 1.1, 0.25);

      group.add(mesh, hood, glowEyes);
    }

    return { group, mesh };
  }

  // --- JEFES CINEMATOGRÁFICOS ---
  public static createBossMesh(bossId: string): { group: THREE.Group; coreMesh: THREE.Mesh } {
    const group = new THREE.Group();

    if (bossId === 'moss_golem') {
      // Gólem de Musgo Ancestral con hombros de roca cubiertos de musgo y runas en el pecho
      const torsoGeo = new THREE.BoxGeometry(2.0, 1.8, 1.5);
      const rockMat = this.getMaterial(0x2D3748, 0.85, 0.1);
      const coreMesh = new THREE.Mesh(torsoGeo, rockMat);
      coreMesh.position.y = 2.3;
      coreMesh.castShadow = true;

      // Runa central incandescente en el pecho
      const chestRune = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.35, 0),
        this.getMaterial(0x48BB78, 0.1, 0.1, 0x48BB78, 2.5)
      );
      chestRune.position.set(0, 2.3, 0.8);

      // Hombreras de roca con matas de musgo 3D
      const mossMat = this.getMaterial(0x22543D, 0.7, 0.0);
      const leftS = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), rockMat);
      leftS.position.set(-1.45, 2.7, 0);
      const leftMoss = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), mossMat);
      leftMoss.position.set(-1.45, 3.2, 0);

      const rightS = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), rockMat);
      rightS.position.set(1.45, 2.7, 0);
      const rightMoss = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), mossMat);
      rightMoss.position.set(1.45, 3.2, 0);

      // Brazos colosales
      const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.6, 6), rockMat);
      leftArm.position.set(-1.5, 1.5, 0.3);
      const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.6, 6), rockMat);
      rightArm.position.set(1.5, 1.5, 0.3);

      // Cabeza con ojos de fuego rúnico
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.8), rockMat);
      head.position.set(0, 3.4, 0.25);

      const eyeMat = this.getMaterial(0xFFD166, 0.1, 0.0, 0xFFD166, 3.0);
      const le = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.1), eyeMat);
      le.position.set(-0.25, 3.4, 0.7);
      const re = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.1), eyeMat);
      re.position.set(0.25, 3.4, 0.7);

      // Piernas robustas
      const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.5, 6), rockMat);
      leftLeg.position.set(-0.65, 0.75, 0);
      const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.5, 6), rockMat);
      rightLeg.position.set(0.65, 0.75, 0);

      group.add(coreMesh, chestRune, leftS, leftMoss, rightS, rightMoss, leftArm, rightArm, head, le, re, leftLeg, rightLeg);
      return { group, coreMesh };
    } else {
      // Gran Draco de Amatista con alas de cristal y espinas dorsales luminosas
      const bodyGeo = new THREE.ConeGeometry(1.3, 3.4, 8);
      const drakeMat = this.getMaterial(0x553C9A, 0.25, 0.4, 0x322659, 0.8);
      const coreMesh = new THREE.Mesh(bodyGeo, drakeMat);
      coreMesh.position.y = 2.2;
      coreMesh.rotation.x = Math.PI / 2;
      coreMesh.castShadow = true;

      // Espinas de amatista afiladas a lo largo del lomo
      const spineMat = this.getMaterial(0x9B5DE5, 0.1, 0.2, 0x7209B7, 2.0);
      for (let s = 0; s < 5; s++) {
        const spine = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 4), spineMat);
        spine.position.set(0, 2.6 + Math.sin(s * 0.5) * 0.2, -1.0 + s * 0.6);
        spine.rotation.x = 0.3;
        group.add(spine);
      }

      // Alas cristalinas
      const wingGeo = new THREE.ConeGeometry(1.8, 3.0, 4);
      const wingMat = this.getMaterial(0x805AD5, 0.2, 0.3, 0x6B46C1, 1.2, true, 0.85);

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-2.0, 2.5, 0.2);
      leftWing.rotation.set(0, 0, Math.PI / 3);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(2.0, 2.5, 0.2);
      rightWing.rotation.set(0, 0, -Math.PI / 3);

      // Cabeza temible de dragón
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.6, 6), drakeMat);
      head.position.set(0, 2.6, 2.1);
      head.rotation.x = Math.PI / 2.2;

      // Ojos de fulgor violeta
      const eyeMat = this.getMaterial(0x00F5D4, 0.1, 0.0, 0x00F5D4, 3.0);
      const le = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), eyeMat);
      le.position.set(-0.35, 2.8, 2.3);
      const re = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), eyeMat);
      re.position.set(0.35, 2.8, 2.3);

      group.add(coreMesh, leftWing, rightWing, head, le, re);
      return { group, coreMesh };
    }
  }

  // --- EDIFICIOS Y ESTRUCTURAS DE ALTA DEFINICIÓN ---
  public static createBuildingMesh(buildingId: string): THREE.Group {
    const group = new THREE.Group();

    if (buildingId === 'forge') {
      // Gran Forja: Horno de piedra con fuego interno, chimenea humeante, fuelle, yunque dorado y barril de agua
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 2.6), this.getMaterial(0x2D3748, 0.9, 0.0));
      base.position.y = 0.3;
      base.receiveShadow = true;

      // Horno de ladrillo refractario
      const furnace = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.4), this.getMaterial(0x7B1113, 0.75, 0.0));
      furnace.position.set(0, 1.1, -0.4);
      furnace.castShadow = true;

      // Fuego ardiente y brasas brillantes
      const fire = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8),
        this.getMaterial(0xFF5400, 0.1, 0.0, 0xFFA200, 3.0)
      );
      fire.position.set(0, 0.85, 0.3);

      // Chimenea alta
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 1.6, 6), this.getMaterial(0x1A202C, 0.9, 0.0));
      chimney.position.set(-0.45, 2.2, -0.45);
      chimney.castShadow = true;

      // Yunque dorado reluciente
      const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.35), this.getMaterial(0xD69E2E, 0.2, 0.8));
      anvil.position.set(0.65, 0.8, 0.45);
      anvil.castShadow = true;

      group.add(base, furnace, fire, chimney, anvil);
    } else if (buildingId === 'healing_fountain') {
      // Fuente de la vida: Estanque de piedra con agua turquesa brillante y obelisco central
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.65, 8), this.getMaterial(0x4A5568, 0.8, 0.0));
      basin.position.y = 0.32;

      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.15, 0.1, 8),
        this.getMaterial(0x00F5D4, 0.1, 0.1, 0x00B4D8, 1.8, true, 0.8)
      );
      water.position.y = 0.62;

      const obelisk = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.45, 0),
        this.getMaterial(0xE2E8F0, 0.1, 0.3, 0x00F5D4, 2.0)
      );
      obelisk.position.y = 1.35;
      obelisk.scale.set(0.8, 1.8, 0.8);

      group.add(basin, water, obelisk);
    } else if (buildingId.includes('bridge')) {
      // Gran puente con tablones, vigas reforzadas y faroles cálidos
      const plankGeo = new THREE.BoxGeometry(4.2, 0.35, 1.8);
      const bridgeMesh = new THREE.Mesh(plankGeo, this.getMaterial(0x5C3A21, 0.8, 0.0));
      bridgeMesh.position.y = 0.18;
      bridgeMesh.receiveShadow = true;

      // Postes y faroles
      const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 5), this.getMaterial(0x2D3748, 0.8, 0.0));
      post1.position.set(-1.8, 0.6, 0.85);
      const lantern1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14), this.getMaterial(0xFFD166, 0.1, 0.0, 0xFFD166, 2.5));
      lantern1.position.set(-1.8, 0.95, 0.85);

      const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 5), this.getMaterial(0x2D3748, 0.8, 0.0));
      post2.position.set(1.8, 0.6, -0.85);
      const lantern2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14), this.getMaterial(0xFFD166, 0.1, 0.0, 0xFFD166, 2.5));
      lantern2.position.set(1.8, 0.95, -0.85);

      group.add(bridgeMesh, post1, lantern1, post2, lantern2);
    } else if (buildingId.includes('teleport')) {
      // Monolito con anillos de energía giratorios
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.35, 8), this.getMaterial(0x1A202C, 0.8, 0.1));
      base.position.y = 0.18;

      const runeRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.09, 8, 16),
        this.getMaterial(0x00F5D4, 0.1, 0.0, 0x00F5D4, 2.5)
      );
      runeRing.position.y = 1.1;
      runeRing.rotation.x = Math.PI / 2;

      group.add(base, runeRing);
    } else {
      const generic = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 2.0), this.getMaterial(0x4A5568, 0.8, 0.0));
      generic.position.y = 0.5;
      group.add(generic);
    }

    return group;
  }

  // --- DROPS CON DESTELLO LUMINOSO ---
  public static createDropMesh(resourceId: string): THREE.Mesh {
    let geo: THREE.BufferGeometry;
    let mat: THREE.Material;

    if (resourceId === 'wood') {
      geo = new THREE.CylinderGeometry(0.1, 0.1, 0.35, 6);
      mat = this.getMaterial(0x8C532B, 0.6, 0.0);
    } else if (resourceId === 'stone') {
      geo = new THREE.DodecahedronGeometry(0.16);
      mat = this.getMaterial(0x718096, 0.7, 0.0);
    } else if (resourceId === 'copper_ore' || resourceId === 'copper_bar') {
      geo = new THREE.DodecahedronGeometry(0.16);
      mat = this.getMaterial(0xDD6B20, 0.2, 0.8, 0xC05621, 0.8);
    } else if (resourceId === 'iron_ore' || resourceId === 'iron_bar') {
      geo = new THREE.BoxGeometry(0.22, 0.14, 0.14);
      mat = this.getMaterial(0xE2E8F0, 0.2, 0.9, 0xA0AEC0, 0.5);
    } else if (resourceId === 'amber') {
      geo = new THREE.OctahedronGeometry(0.18);
      mat = this.getMaterial(0xFFB703, 0.1, 0.2, 0xFFA200, 2.0);
    } else if (resourceId === 'crystal') {
      geo = new THREE.OctahedronGeometry(0.2);
      mat = this.getMaterial(0x9B5DE5, 0.1, 0.2, 0x7209B7, 2.2);
    } else if (resourceId === 'cobalt_ore' || resourceId === 'cobalt_bar') {
      geo = new THREE.DodecahedronGeometry(0.18);
      mat = this.getMaterial(0x00B4D8, 0.1, 0.7, 0x0077B6, 1.8);
    } else if (resourceId === 'gold_coin') {
      geo = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 12);
      mat = this.getMaterial(0xFFD700, 0.15, 0.9, 0xB8860B, 1.5);
    } else if (resourceId === 'soul_essence') {
      geo = new THREE.IcosahedronGeometry(0.18);
      mat = this.getMaterial(0x00F5D4, 0.1, 0.1, 0x00F5D4, 3.0);
    } else {
      geo = new THREE.SphereGeometry(0.15, 8, 8);
      mat = this.getMaterial(0x48BB78, 0.5, 0.0);
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }
}
