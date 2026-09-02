import { HUD } from './HUD';
import { InventoryUI } from './InventoryUI';
import { UpgradeUI } from './UpgradeUI';
import { DialogueUI } from './DialogueUI';
import { WorldMapUI } from './WorldMapUI';
import { SettingsUI } from './SettingsUI';
import { MainMenuUI } from './MainMenuUI';
import { TouchControls } from './TouchControls';
import { Player } from '../entities/Player';
import { InventorySystem } from '../systems/InventorySystem';
import { WorldManager } from '../systems/WorldManager';
import { InputManager } from '../core/InputManager';

export class UIManager {
  public root: HTMLElement;
  public hud: HUD;
  public inventoryUI: InventoryUI;
  public upgradeUI: UpgradeUI;
  public dialogueUI: DialogueUI;
  public worldMapUI: WorldMapUI;
  public settingsUI: SettingsUI;
  public mainMenuUI: MainMenuUI;
  public touchControls: TouchControls;

  constructor(
    root: HTMLElement,
    player: Player,
    inventory: InventorySystem,
    world: WorldManager,
    inputManager: InputManager,
    onStartNewGame: () => void,
    onContinueGame: () => void,
    onManualSave: () => void,
    onResetGame: () => void
  ) {
    this.root = root;

    this.hud = new HUD(this.root);
    this.inventoryUI = new InventoryUI(this.root, inventory, player);
    this.upgradeUI = new UpgradeUI(this.root, inventory, player);
    this.dialogueUI = new DialogueUI(this.root);
    this.worldMapUI = new WorldMapUI(this.root, world, player);
    this.settingsUI = new SettingsUI(this.root, onManualSave, onResetGame);
    this.touchControls = new TouchControls(this.root, inputManager);
    this.mainMenuUI = new MainMenuUI(this.root, onStartNewGame, onContinueGame);
  }

  public update(player: Player, world: WorldManager): void {
    this.hud.updateMinimap(player, world);
  }
}

