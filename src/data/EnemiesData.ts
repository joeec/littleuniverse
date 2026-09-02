export interface EnemyLoot {
  resourceId: string;
  chance: number; // 0 to 1
  minAmount: number;
  maxAmount: number;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  maxHealth: number;
  damage: number;
  speed: number;
  attackRange: number;
  attackCooldown: number; // in seconds
  aggroRange: number;
  type: 'melee' | 'ranged' | 'fast' | 'tank' | 'flying';
  color: string;
  scale: number;
  loot: EnemyLoot[];
  respawnTime: number; // in seconds
  biome: string;
}

export const ENEMIES_DATA: Record<string, EnemyDefinition> = {
  spore_slime: {
    id: 'spore_slime',
    name: 'Slime de Esporas',
    maxHealth: 35,
    damage: 8,
    speed: 2.2,
    attackRange: 1.2,
    attackCooldown: 1.2,
    aggroRange: 7.0,
    type: 'melee',
    color: '#55A630',
    scale: 0.9,
    loot: [
      { resourceId: 'fiber', chance: 0.9, minAmount: 2, maxAmount: 4 },
      { resourceId: 'gold_coin', chance: 0.6, minAmount: 1, maxAmount: 3 }
    ],
    respawnTime: 20,
    biome: 'verdant'
  },
  forest_bandit: {
    id: 'forest_bandit',
    name: 'Bandido Furtivo',
    maxHealth: 60,
    damage: 15,
    speed: 3.8,
    attackRange: 1.5,
    attackCooldown: 0.9,
    aggroRange: 8.5,
    type: 'fast',
    color: '#8A5A36',
    scale: 1.0,
    loot: [
      { resourceId: 'wood', chance: 0.8, minAmount: 3, maxAmount: 6 },
      { resourceId: 'copper_ore', chance: 0.5, minAmount: 1, maxAmount: 3 },
      { resourceId: 'gold_coin', chance: 0.7, minAmount: 3, maxAmount: 7 }
    ],
    respawnTime: 25,
    biome: 'verdant'
  },
  armored_beetle: {
    id: 'armored_beetle',
    name: 'Escarabajo de Granito',
    maxHealth: 130,
    damage: 22,
    speed: 1.8,
    attackRange: 1.6,
    attackCooldown: 1.8,
    aggroRange: 6.5,
    type: 'tank',
    color: '#495057',
    scale: 1.3,
    loot: [
      { resourceId: 'stone', chance: 1.0, minAmount: 5, maxAmount: 10 },
      { resourceId: 'iron_ore', chance: 0.65, minAmount: 2, maxAmount: 4 },
      { resourceId: 'amber', chance: 0.4, minAmount: 1, maxAmount: 2 }
    ],
    respawnTime: 35,
    biome: 'amberwood'
  },
  crystal_spitter: {
    id: 'crystal_spitter',
    name: 'Lanzador de Esquirlas',
    maxHealth: 85,
    damage: 24,
    speed: 2.8,
    attackRange: 8.0,
    attackCooldown: 2.0,
    aggroRange: 10.0,
    type: 'ranged',
    color: '#9B5DE5',
    scale: 1.1,
    loot: [
      { resourceId: 'crystal', chance: 0.85, minAmount: 2, maxAmount: 5 },
      { resourceId: 'cobalt_ore', chance: 0.4, minAmount: 1, maxAmount: 3 },
      { resourceId: 'soul_essence', chance: 0.35, minAmount: 1, maxAmount: 2 }
    ],
    respawnTime: 30,
    biome: 'crystal_caverns'
  },
  void_wisp: {
    id: 'void_wisp',
    name: 'Fuego Fatuo Etéreo',
    maxHealth: 110,
    damage: 32,
    speed: 4.2,
    attackRange: 5.5,
    attackCooldown: 1.5,
    aggroRange: 9.0,
    type: 'flying',
    color: '#00F5D4',
    scale: 0.9,
    loot: [
      { resourceId: 'soul_essence', chance: 0.95, minAmount: 2, maxAmount: 4 },
      { resourceId: 'crystal', chance: 0.7, minAmount: 3, maxAmount: 6 },
      { resourceId: 'gold_coin', chance: 0.8, minAmount: 10, maxAmount: 20 }
    ],
    respawnTime: 35,
    biome: 'crystal_caverns'
  },
  magma_fiend: {
    id: 'magma_fiend',
    name: 'Demonio de Magma',
    maxHealth: 220,
    damage: 48,
    speed: 3.2,
    attackRange: 2.0,
    attackCooldown: 1.3,
    aggroRange: 9.0,
    type: 'fast',
    color: '#E63946',
    scale: 1.3,
    loot: [
      { resourceId: 'obsidian', chance: 0.9, minAmount: 4, maxAmount: 8 },
      { resourceId: 'fire_core', chance: 0.4, minAmount: 1, maxAmount: 2 },
      { resourceId: 'gold_coin', chance: 1.0, minAmount: 15, maxAmount: 35 }
    ],
    respawnTime: 40,
    biome: 'molten_peaks'
  }
};

