import * as THREE from 'three';
import { SceneRenderer } from '../rendering/SceneRenderer';
import { InputManager } from './InputManager';
import { EventBus } from './EventBus';
import { Player } from '../entities/Player';
import { ParticleSystem } from '../systems/ParticleSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { QuestSystem } from '../systems/QuestSystem';
import { ResourceSystem } from '../systems/ResourceSystem';
import { BuildingSystem } from '../systems/BuildingSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { WorldManager } from '../systems/WorldManager';
import { SaveManager } from '../systems/SaveManager';
import { UIManager } from '../ui/UIManager';
import { AudioSys } from '../systems/AudioManager';

export class Game {
  private canvas: HTMLCanvasElement;
  private uiRoot: HTMLElement;

  private sceneRenderer: SceneRenderer;
  private inputManager: InputManager;
  private particleSystem: ParticleSystem;
  private inventorySystem: InventorySystem;
  private questSystem: QuestSystem;
  private resourceSystem: ResourceSystem;
  private buildingSystem: BuildingSystem;
  private combatSystem: CombatSystem;
  private worldManager: WorldManager;
  private saveManager: SaveManager;
  private uiManager: UIManager;

  public player: Player;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.uiRoot = document.getElementById('ui-root') as HTMLElement;

    // 1. Inicializar renderizador 3D
    this.sceneRenderer = new SceneRenderer(this.canvas);
    this.particleSystem = new ParticleSystem(this.sceneRenderer.scene);

    // 2. Inicializar jugador
    this.player = new Player(new THREE.Vector3(0, 0, 0));
    this.sceneRenderer.scene.add(this.player.group);

    // 3. Inicializar sistemas
    this.inputManager = new InputManager();
    this.inventorySystem = new InventorySystem();
    this.questSystem = new QuestSystem(this.inventorySystem);
    this.resourceSystem = new ResourceSystem(this.sceneRenderer.scene, this.inventorySystem, this.particleSystem);
    this.buildingSystem = new BuildingSystem(this.inventorySystem, this.particleSystem, this.sceneRenderer.cameraController);
    this.combatSystem = new CombatSystem(this.sceneRenderer.scene, this.particleSystem, this.sceneRenderer.cameraController);
    this.worldManager = new WorldManager(this.sceneRenderer.scene, this.sceneRenderer, this.resourceSystem);
    this.saveManager = new SaveManager();

    // 4. Inicializar interfaz
    this.uiManager = new UIManager(
      this.uiRoot,
      this.player,
      this.inventorySystem,
      this.worldManager,
      this.inputManager,
      this.startNewGame.bind(this),
      this.continueGame.bind(this),
      this.manualSave.bind(this),
      this.resetGame.bind(this)
    );

    this.setupGameEvents();
  }

  private setupGameEvents(): void {
    // Dash del jugador
    EventBus.on('input:dash', () => {
      if (!this.isRunning || this.isPaused) return;
      const dashed = this.player.dash();
      if (dashed) {
        AudioSys.playSFX('dash');
        this.particleSystem.spawnDebris(this.player.position.x, 0.2, this.player.position.z, 0x00F5D4, 6);
      }
    });

    // Ataque del jugador
    EventBus.on('input:attack', () => {
      if (!this.isRunning || this.isPaused) return;
      this.combatSystem.executePlayerAttack(this.player, this.worldManager.enemies, this.worldManager.bosses);
    });

    // Interacción [E] (Hablar con NPC o abrir Forja)
    EventBus.on('input:interact', () => {
      if (!this.isRunning || this.isPaused) return;
      this.handlePlayerInteraction();
    });

    // Muerte del jugador
    EventBus.on('player:dead', () => {
      EventBus.emit('hud:toast', { message: '☠️ Has caído en combate. Reapareciendo en el Santuario...', type: 'danger' });
      this.sceneRenderer.cameraController.addScreenShake(0.8);

      setTimeout(() => {
        this.player.position.set(0, 0, 0);
        this.player.currentHealth = this.player.maxHealth;
        this.player.applyEquippedStats();
        EventBus.emit('player:stats_updated', {
          health: this.player.currentHealth,
          maxHealth: this.player.maxHealth,
          damage: this.player.attackDamage,
          capacity: this.player.inventoryCapacity
        });
      }, 1200);
    });

    // Botín al matar enemigo
    EventBus.on('enemy:killed', (data: { enemy: any }) => {
      const enemy = data.enemy;
      for (const loot of enemy.def.loot) {
        if (Math.random() <= loot.chance) {
          const amt = Math.floor(loot.minAmount + Math.random() * (loot.maxAmount - loot.minAmount + 1));
          this.resourceSystem.spawnDrops(loot.resourceId, amt, enemy.position);
        }
      }
    });

    // Recompensas al derrotar jefe
    EventBus.on('boss:defeated', (data: { bossId: string; rewards: { resourceId: string; amount: number }[] }) => {
      const boss = this.worldManager.bosses.find(b => b.id === data.bossId);
      const pos = boss ? boss.position : this.player.position;

      for (const r of data.rewards) {
        this.resourceSystem.spawnDrops(r.resourceId, r.amount, pos);
      }

      this.sceneRenderer.cameraController.addScreenShake(1.0);
      this.particleSystem.spawnAura(pos.x, 1.0, pos.z, 0xFFD166, 50);
      AudioSys.playSFX('level_up');
      EventBus.emit('hud:toast', { message: `🏆 ¡Jefe Derrotado! Nuevos caminos desbloqueados.`, type: 'success' });
    });
  }

  private handlePlayerInteraction(): void {
    // 1. Comprobar NPC cercano
    for (const npc of this.worldManager.npcs) {
      if (this.player.position.distanceTo(npc.position) < 3.0) {
        EventBus.emit('ui:open_dialogue', { npc });
        return;
      }
    }

    // 2. Comprobar Forja / Estación de mejoras construida
    for (const bld of this.worldManager.buildings) {
      if (bld.id === 'forge' && bld.isBuilt && this.player.position.distanceTo(bld.position) < 3.0) {
        EventBus.emit('ui:open_forge');
        return;
      }
    }
  }

  public startNewGame(): void {
    SaveManager.clearSaveGame();
    this.worldManager.cleanup();
    this.worldManager.initWorld(['tile_v_0_0']);

    // Recursos iniciales de cortesía
    this.inventorySystem.addItem('wood', 5);
    this.inventorySystem.addItem('stone', 3);

    this.questSystem.startFirstQuest();
    this.player.position.set(0, 0, 0);

    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  public continueGame(): void {
    this.worldManager.cleanup();
    const loaded = this.saveManager.load(this.player, this.inventorySystem, this.worldManager, this.questSystem);

    if (!loaded) {
      this.startNewGame();
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  public manualSave(): void {
    this.saveManager.save(this.player, this.inventorySystem, this.worldManager, this.questSystem, false);
  }

  public resetGame(): void {
    SaveManager.clearSaveGame();
    this.worldManager.cleanup();
  }

  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.update(delta);
    }

    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }

  private update(delta: number): void {
    // 1. Entrada de usuario
    const inputVec = this.inputManager.update();

    // 2. Actualizar Jugador
    this.player.update(delta, inputVec);

    // 3. Actualizar Mundo (losas, npcs, edificios, bioma)
    this.worldManager.update(delta, this.player.position, this.sceneRenderer.cameraController.camera);

    // 4. Actualizar Sistema de Recursos (recolección, drops)
    this.resourceSystem.update(delta, this.player);

    // 5. Actualizar Sistema de Construcción (depósito en losas y estructuras)
    this.buildingSystem.update(
      delta,
      this.player,
      Array.from(this.worldManager.tiles.values()),
      this.worldManager.buildings,
      (tile) => this.worldManager.onTileUnlocked(tile),
      (bld) => {
        if (bld.id === 'forge') {
          EventBus.emit('hud:toast', { message: '¡Gran Forja lista! Acércate y pulsa [E] para mejorar.', type: 'info' });
        }
      }
    );

    // 6. Actualizar IA de Enemigos
    for (const enemy of this.worldManager.enemies) {
      enemy.update(
        delta,
        this.player.position,
        this.sceneRenderer.cameraController.camera,
        (attackingEnemy) => this.combatSystem.handleEnemyAttack(attackingEnemy, this.player)
      );
    }

    // 7. Actualizar Jefes de Zona
    for (const boss of this.worldManager.bosses) {
      boss.update(
        delta,
        this.player.position,
        (attackingBoss, attackType) =>
          this.combatSystem.handleBossSpecialAttack(
            attackingBoss,
            attackType,
            this.player,
            (enemyId, pos) => this.worldManager.spawnExtraEnemy(enemyId, pos)
          )
      );
    }

    // 8. Actualizar Combate (proyectiles, auto-combate)
    this.combatSystem.update(delta, this.player, this.worldManager.enemies, this.worldManager.bosses);

    // 9. Fuente de curación (si está construida y el jugador está cerca)
    for (const bld of this.worldManager.buildings) {
      if (bld.id === 'healing_fountain' && bld.isBuilt && this.player.position.distanceTo(bld.position) < 3.2) {
        if (this.player.currentHealth < this.player.maxHealth) {
          this.player.heal(15 * delta);
          this.particleSystem.spawnAura(this.player.position.x, 0.2, this.player.position.z, 0x48CAE4, 1);
        }
      }
    }

    // 10. Actualizar Partículas y Textos flotantes
    this.particleSystem.update(delta, this.sceneRenderer.cameraController.camera);

    // 11. Actualizar Cámara y Renderizador
    this.sceneRenderer.update(delta, this.player.position);

    // 12. Actualizar Minimapa y UI
    this.uiManager.update(this.player, this.worldManager);

    // 13. Autoguardado
    this.saveManager.update(delta, this.player, this.inventorySystem, this.worldManager, this.questSystem);
  }

  private render(): void {
    this.sceneRenderer.render();
  }
}

