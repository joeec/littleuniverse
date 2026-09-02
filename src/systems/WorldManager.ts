import * as THREE from 'three';
import { WORLD_TILES, WorldTileDefinition, TILE_SIZE, BIOMES } from '../data/WorldData';
import { TilePlatform } from '../entities/TilePlatform';
import { ResourceNode } from '../entities/ResourceNode';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { NPC } from '../entities/NPC';
import { Building } from '../entities/Building';
import { ResourceSystem } from './ResourceSystem';
import { SceneRenderer } from '../rendering/SceneRenderer';
import { AudioSys } from './AudioManager';
import { EventBus } from '../core/EventBus';

export class WorldManager {
  private scene: THREE.Scene;
  private renderer: SceneRenderer;
  private resourceSystem: ResourceSystem;

  public tiles: Map<string, TilePlatform> = new Map();
  public nodes: ResourceNode[] = [];
  public enemies: Enemy[] = [];
  public bosses: Boss[] = [];
  public npcs: NPC[] = [];
  public buildings: Building[] = [];

  public currentBiome: string = 'verdant';

  constructor(scene: THREE.Scene, renderer: SceneRenderer, resourceSystem: ResourceSystem) {
    this.scene = scene;
    this.renderer = renderer;
    this.resourceSystem = resourceSystem;
  }

  public initWorld(unlockedTileIds?: string[], builtBuildingIds?: string[]): void {
    const unlockedSet = new Set(unlockedTileIds || ['tile_v_0_0']);
    const builtSet = new Set(builtBuildingIds || []);

    // Crear instancias de todas las losas
    for (const def of WORLD_TILES) {
      const isUnlocked = def.unlockedByDefault || unlockedSet.has(def.id);
      const tile = new TilePlatform(def, isUnlocked);
      this.tiles.set(def.id, tile);
      this.scene.add(tile.group);

      if (isUnlocked) {
        this.spawnTileContents(def, builtSet);
      }
    }

    this.updateAvailableTiles();
  }

  public spawnTileContents(def: WorldTileDefinition, builtSet: Set<string> = new Set()): void {
    const worldX = def.x * TILE_SIZE;
    const worldZ = def.z * TILE_SIZE;

    // 1. Spawn Nodos de recursos
    if (def.nodes) {
      def.nodes.forEach((n, idx) => {
        const nodeId = `${def.id}_node_${idx}`;
        const pos = new THREE.Vector3(worldX + n.offsetX, 0, worldZ + n.offsetZ);
        const node = new ResourceNode(nodeId, n.type, pos, n.levelRequired || 1);
        this.nodes.push(node);
        this.resourceSystem.registerNode(node);
      });
    }

    // 2. Spawn Enemigos
    if (def.enemies) {
      def.enemies.forEach((e, idx) => {
        const enemyId = `${def.id}_enemy_${idx}`;
        const pos = new THREE.Vector3(worldX + e.offsetX, 0, worldZ + e.offsetZ);
        const enemy = new Enemy(enemyId, e.enemyId, pos);
        this.enemies.push(enemy);
        this.scene.add(enemy.group);
      });
    }

    // 3. Spawn NPCs
    if (def.npc) {
      const pos = new THREE.Vector3(worldX + def.npc.offsetX, 0, worldZ + def.npc.offsetZ);
      const npc = new NPC(def.npc.npcId, pos, this.scene);
      this.npcs.push(npc);
    }

    // 4. Spawn Edificios / Estructuras
    if (def.building) {
      const pos = new THREE.Vector3(worldX + def.building.offsetX, 0, worldZ + def.building.offsetZ);
      const isBuilt = builtSet.has(def.building.buildingId);
      const bld = new Building(def.building.buildingId, pos, isBuilt);
      this.buildings.push(bld);
      this.scene.add(bld.group);
    }

    // 5. Spawn Jefe
    if (def.boss) {
      const pos = new THREE.Vector3(worldX + def.boss.offsetX, 0, worldZ + def.boss.offsetZ);
      const boss = new Boss(def.boss.bossId, pos, this.scene);
      this.bosses.push(boss);
    }
  }

  public onTileUnlocked(tile: TilePlatform): void {
    this.spawnTileContents(tile.data);
    this.updateAvailableTiles();
  }

  public updateAvailableTiles(): void {
    // Comprobar qué losas bloqueadas tienen sus requisitos previos cumplidos para mostrar su holograma
    const unlockedIds = new Set<string>();
    for (const [id, tile] of this.tiles.entries()) {
      if (tile.isUnlocked) unlockedIds.add(id);
    }

    for (const [id, tile] of this.tiles.entries()) {
      if (!tile.isUnlocked) {
        let prereqsMet = false;
        if (!tile.data.prerequisiteTileIds || tile.data.prerequisiteTileIds.length === 0) {
          prereqsMet = true;
        } else {
          prereqsMet = tile.data.prerequisiteTileIds.some(reqId => unlockedIds.has(reqId));
        }

        tile.isAvailableToUnlock = prereqsMet;
        tile.group.visible = prereqsMet;
      } else {
        tile.group.visible = true;
      }
    }
  }

  public spawnExtraEnemy(enemyId: string, pos: THREE.Vector3): void {
    const enemy = new Enemy(`extra_${Date.now()}_${Math.random()}`, enemyId, pos);
    this.enemies.push(enemy);
    this.scene.add(enemy.group);
  }

  public update(delta: number, playerPos: THREE.Vector3, camera: THREE.Camera): void {
    // 1. Actualizar Losas
    for (const tile of this.tiles.values()) {
      if (tile.group.visible) {
        tile.update(delta, camera);
      }
    }

    // 2. Actualizar NPCs
    for (const npc of this.npcs) {
      npc.update(delta, camera);
    }

    // 3. Actualizar Edificios
    for (const bld of this.buildings) {
      bld.update(delta, camera);
    }

    // 4. Detección de bioma actual según posición del jugador
    const currentTileX = Math.round(playerPos.x / TILE_SIZE);
    const currentTileZ = Math.round(playerPos.z / TILE_SIZE);

    for (const tile of this.tiles.values()) {
      if (tile.data.x === currentTileX && tile.data.z === currentTileZ && tile.isUnlocked) {
        if (tile.data.biome !== this.currentBiome) {
          this.currentBiome = tile.data.biome;
          this.renderer.setBiomeColors(this.currentBiome);
          const biomeInfo = BIOMES[this.currentBiome];
          if (biomeInfo) {
            AudioSys.playMusicTheme(biomeInfo.musicTheme as any);
            EventBus.emit('hud:toast', { message: `📍 Has entrado en: ${biomeInfo.name}`, type: 'info' });
          }
        }
        break;
      }
    }
  }

  public getUnlockedTileIds(): string[] {
    const ids: string[] = [];
    for (const [id, tile] of this.tiles.entries()) {
      if (tile.isUnlocked) ids.push(id);
    }
    return ids;
  }

  public getBuiltBuildingIds(): string[] {
    const ids: string[] = [];
    for (const bld of this.buildings) {
      if (bld.isBuilt) ids.push(bld.id);
    }
    return ids;
  }

  public cleanup(): void {
    for (const tile of this.tiles.values()) {
      this.scene.remove(tile.group);
    }
    this.tiles.clear();

    for (const enemy of this.enemies) {
      this.scene.remove(enemy.group);
    }
    this.enemies = [];

    for (const boss of this.bosses) {
      this.scene.remove(boss.group);
    }
    this.bosses = [];

    for (const npc of this.npcs) {
      this.scene.remove(npc.group);
    }
    this.npcs = [];

    for (const bld of this.buildings) {
      this.scene.remove(bld.group);
    }
    this.buildings = [];

    this.resourceSystem.unregisterAll();
  }
}

