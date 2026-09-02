export interface TileCost {
  resourceId: string;
  amount: number;
}

export interface TileSpawnNode {
  type: 'tree' | 'rock' | 'copper' | 'iron' | 'amber' | 'crystal' | 'cobalt' | 'obsidian' | 'fiber' | 'gold_chest';
  offsetX: number; // offset relative to tile center
  offsetZ: number;
  levelRequired?: number;
}

export interface TileSpawnEnemy {
  enemyId: string;
  offsetX: number;
  offsetZ: number;
}

export interface TileSpawnBuilding {
  buildingId: string;
  offsetX: number;
  offsetZ: number;
}

export interface TileSpawnNPC {
  npcId: string;
  offsetX: number;
  offsetZ: number;
}

export interface TileSpawnBoss {
  bossId: string;
  offsetX: number;
  offsetZ: number;
}

export interface WorldTileDefinition {
  id: string;
  x: number; // Grid coordinates in world space (e.g. step of 6 units)
  z: number;
  biome: 'verdant' | 'amberwood' | 'crystal_caverns' | 'molten_peaks';
  unlockedByDefault?: boolean;
  cost?: TileCost[];
  prerequisiteTileIds?: string[];
  nodes?: TileSpawnNode[];
  enemies?: TileSpawnEnemy[];
  building?: TileSpawnBuilding;
  npc?: TileSpawnNPC;
  boss?: TileSpawnBoss;
  floorColor?: string;
  elevation?: number;
}

export interface BiomeDefinition {
  id: string;
  name: string;
  description: string;
  ambientColor: string;
  fogColor: string;
  skyColor: string;
  groundColor: string;
  accentColor: string;
  musicTheme: string;
}

export const BIOMES: Record<string, BiomeDefinition> = {
  verdant: {
    id: 'verdant',
    name: 'Valle Esmeralda',
    description: 'Tierras fértiles con robles antiguos, canteras de granito y vetas de cobre brillante.',
    ambientColor: '#F4F1DE',
    fogColor: '#A8DADC',
    skyColor: '#457B9D',
    groundColor: '#588157',
    accentColor: '#386641',
    musicTheme: 'peaceful_meadow'
  },
  amberwood: {
    id: 'amberwood',
    name: 'Bosque de Ámbar',
    description: 'Bosque dorado de densos matorrales, rico en mineral de hierro y resinas preciosas.',
    ambientColor: '#FFE3A8',
    fogColor: '#E9C46A',
    skyColor: '#F4A261',
    groundColor: '#BC6C25',
    accentColor: '#DDA15E',
    musicTheme: 'mystic_forest'
  },
  crystal_caverns: {
    id: 'crystal_caverns',
    name: 'Cavernas de Cristal',
    description: 'Grutas subterráneas iluminadas por amatistas resonantes y yacimientos de cobalto.',
    ambientColor: '#E2C4FF',
    fogColor: '#3A0CA3',
    skyColor: '#1A0033',
    groundColor: '#4A154B',
    accentColor: '#7209B7',
    musicTheme: 'crystal_echoes'
  },
  molten_peaks: {
    id: 'molten_peaks',
    name: 'Cumbres de Magma',
    description: 'Cimas ardientes cubiertas de obsidiana filosa, oro puro y ríos de fuego.',
    ambientColor: '#FFCCD5',
    fogColor: '#6A040F',
    skyColor: '#370617',
    groundColor: '#9D0208',
    accentColor: '#DC2F02',
    musicTheme: 'molten_fury'
  }
};

export const TILE_SIZE = 6.0;

// World Tiles Graph
export const WORLD_TILES: WorldTileDefinition[] = [
  // --- BIOMA 1: VALLE ESMERALDA (VERDANT) ---
  // Tile Inicial (Centro 0,0) - Spawn del Jugador y Anciano Oakhaven
  {
    id: 'tile_v_0_0',
    x: 0,
    z: 0,
    biome: 'verdant',
    unlockedByDefault: true,
    npc: { npcId: 'elder_oakhaven', offsetX: 1.5, offsetZ: 1.5 },
    nodes: [
      { type: 'tree', offsetX: -1.8, offsetZ: -1.8 },
      { type: 'rock', offsetX: 1.8, offsetZ: -1.8 },
      { type: 'fiber', offsetX: -1.8, offsetZ: 1.8 }
    ]
  },
  // Tile Norte 1: Más árboles y rocas
  {
    id: 'tile_v_0_m1',
    x: 0,
    z: -1,
    biome: 'verdant',
    cost: [{ resourceId: 'wood', amount: 5 }],
    prerequisiteTileIds: ['tile_v_0_0'],
    nodes: [
      { type: 'tree', offsetX: -1.5, offsetZ: -1.5 },
      { type: 'tree', offsetX: 1.5, offsetZ: -1.5 },
      { type: 'rock', offsetX: 0, offsetZ: 1.2 }
    ]
  },
  // Tile Este 1: Hacia la Forja
  {
    id: 'tile_v_1_0',
    x: 1,
    z: 0,
    biome: 'verdant',
    cost: [{ resourceId: 'wood', amount: 8 }, { resourceId: 'stone', amount: 6 }],
    prerequisiteTileIds: ['tile_v_0_0'],
    nodes: [
      { type: 'tree', offsetX: 1.2, offsetZ: -1.5 },
      { type: 'copper', offsetX: 1.5, offsetZ: 1.5, levelRequired: 1 }
    ],
    enemies: [
      { enemyId: 'spore_slime', offsetX: 0, offsetZ: 0 }
    ]
  },
  // Tile Sur 1: Aserradero y Fuente
  {
    id: 'tile_v_0_1',
    x: 0,
    z: 1,
    biome: 'verdant',
    cost: [{ resourceId: 'stone', amount: 8 }, { resourceId: 'fiber', amount: 4 }],
    prerequisiteTileIds: ['tile_v_0_0'],
    building: { buildingId: 'sawmill', offsetX: 0, offsetZ: 0 },
    nodes: [
      { type: 'tree', offsetX: -1.8, offsetZ: 1.5 },
      { type: 'fiber', offsetX: 1.8, offsetZ: 1.5 }
    ]
  },
  // Tile Oeste 1: Fuente Curativa
  {
    id: 'tile_v_m1_0',
    x: -1,
    z: 0,
    biome: 'verdant',
    cost: [{ resourceId: 'wood', amount: 10 }, { resourceId: 'stone', amount: 10 }],
    prerequisiteTileIds: ['tile_v_0_0'],
    building: { buildingId: 'healing_fountain', offsetX: 0, offsetZ: 0 },
    nodes: [
      { type: 'rock', offsetX: -1.5, offsetZ: -1.5 },
      { type: 'copper', offsetX: -1.5, offsetZ: 1.5, levelRequired: 1 }
    ]
  },
  // Tile Forja (1, -1) - Donde se construye la Gran Forja con Maestra Val
  {
    id: 'tile_v_1_m1',
    x: 1,
    z: -1,
    biome: 'verdant',
    cost: [{ resourceId: 'wood', amount: 15 }, { resourceId: 'stone', amount: 12 }],
    prerequisiteTileIds: ['tile_v_1_0', 'tile_v_0_m1'],
    building: { buildingId: 'forge', offsetX: 0, offsetZ: 0 },
    npc: { npcId: 'blacksmith_val', offsetX: 1.8, offsetZ: -1.2 },
    nodes: [
      { type: 'copper', offsetX: -1.8, offsetZ: 1.8, levelRequired: 1 }
    ]
  },
  // Tile Baliza Teletransporte (0, -2)
  {
    id: 'tile_v_0_m2',
    x: 0,
    z: -2,
    biome: 'verdant',
    cost: [{ resourceId: 'stone', amount: 18 }, { resourceId: 'copper_ore', amount: 5 }],
    prerequisiteTileIds: ['tile_v_0_m1'],
    building: { buildingId: 'teleport_beacon_verdant', offsetX: 0, offsetZ: 0 },
    nodes: [
      { type: 'tree', offsetX: -1.5, offsetZ: 0 },
      { type: 'rock', offsetX: 1.5, offsetZ: 0 }
    ]
  },
  // Tile Camino este 2 (2, 0)
  {
    id: 'tile_v_2_0',
    x: 2,
    z: 0,
    biome: 'verdant',
    cost: [{ resourceId: 'wood', amount: 20 }, { resourceId: 'copper_ore', amount: 8 }],
    prerequisiteTileIds: ['tile_v_1_0'],
    enemies: [
      { enemyId: 'forest_bandit', offsetX: 0.5, offsetZ: -0.5 },
      { enemyId: 'spore_slime', offsetX: -1.2, offsetZ: 1.2 }
    ],
    nodes: [
      { type: 'copper', offsetX: 1.5, offsetZ: 1.5, levelRequired: 1 },
      { type: 'rock', offsetX: 1.5, offsetZ: -1.5 }
    ]
  },
  // Tile Campamento del Vigía (3, 0) - Roderick
  {
    id: 'tile_v_3_0',
    x: 3,
    z: 0,
    biome: 'verdant',
    cost: [{ resourceId: 'stone', amount: 25 }, { resourceId: 'copper_bar', amount: 3 }],
    prerequisiteTileIds: ['tile_v_2_0'],
    npc: { npcId: 'scout_roderick', offsetX: 0, offsetZ: 1.5 },
    nodes: [
      { type: 'tree', offsetX: -1.5, offsetZ: -1.5 },
      { type: 'fiber', offsetX: 1.5, offsetZ: -1.5 }
    ]
  },
  // Tile Arena del Jefe Gólem (4, 0) - Jefe Moss Golem!
  {
    id: 'tile_v_4_0',
    x: 4,
    z: 0,
    biome: 'verdant',
    cost: [{ resourceId: 'wood', amount: 35 }, { resourceId: 'stone', amount: 30 }, { resourceId: 'copper_bar', amount: 5 }],
    prerequisiteTileIds: ['tile_v_3_0'],
    boss: { bossId: 'moss_golem', offsetX: 0, offsetZ: 0 },
    nodes: [
      { type: 'rock', offsetX: -2.0, offsetZ: -2.0 },
      { type: 'rock', offsetX: 2.0, offsetZ: 2.0 }
    ]
  },
  // Tile Gran Puente hacia Bosque de Ámbar (5, 0)
  {
    id: 'tile_v_5_0',
    x: 5,
    z: 0,
    biome: 'verdant',
    cost: [{ resourceId: 'wood', amount: 45 }, { resourceId: 'stone', amount: 40 }],
    prerequisiteTileIds: ['tile_v_4_0'],
    building: { buildingId: 'bridge_amberwood', offsetX: 0, offsetZ: 0 }
  },

  // --- BIOMA 2: BOSQUE DE ÁMBAR (AMBERWOOD) ---
  // Entrada Bosque de Ámbar (6, 0)
  {
    id: 'tile_a_6_0',
    x: 6,
    z: 0,
    biome: 'amberwood',
    cost: [{ resourceId: 'wood', amount: 30 }, { resourceId: 'stone', amount: 25 }],
    prerequisiteTileIds: ['tile_v_5_0'],
    nodes: [
      { type: 'amber', offsetX: -1.5, offsetZ: -1.5, levelRequired: 2 },
      { type: 'tree', offsetX: 1.5, offsetZ: 1.5 }
    ],
    enemies: [
      { enemyId: 'forest_bandit', offsetX: 0, offsetZ: 0 }
    ]
  },
  // Tile Baliza Bosque (6, 1)
  {
    id: 'tile_a_6_1',
    x: 6,
    z: 1,
    biome: 'amberwood',
    cost: [{ resourceId: 'amber', amount: 5 }, { resourceId: 'iron_ore', amount: 8 }],
    prerequisiteTileIds: ['tile_a_6_0'],
    building: { buildingId: 'teleport_beacon_amber', offsetX: 0, offsetZ: 0 },
    nodes: [
      { type: 'iron', offsetX: 1.5, offsetZ: -1.5, levelRequired: 2 }
    ]
  },
  // Tile Cantera de Hierro (7, 0)
  {
    id: 'tile_a_7_0',
    x: 7,
    z: 0,
    biome: 'amberwood',
    cost: [{ resourceId: 'wood', amount: 40 }, { resourceId: 'amber', amount: 6 }],
    prerequisiteTileIds: ['tile_a_6_0'],
    nodes: [
      { type: 'iron', offsetX: -1.5, offsetZ: -1.5, levelRequired: 2 },
      { type: 'iron', offsetX: 1.5, offsetZ: 1.5, levelRequired: 2 },
      { type: 'rock', offsetX: 1.5, offsetZ: -1.5 }
    ],
    enemies: [
      { enemyId: 'armored_beetle', offsetX: 0, offsetZ: 0 }
    ]
  },
  // Tile Refinería de Cristal (7, -1)
  {
    id: 'tile_a_7_m1',
    x: 7,
    z: -1,
    biome: 'amberwood',
    cost: [{ resourceId: 'iron_ore', amount: 15 }, { resourceId: 'amber', amount: 8 }],
    prerequisiteTileIds: ['tile_a_7_0'],
    building: { buildingId: 'crystal_refinery', offsetX: 0, offsetZ: 0 },
    nodes: [
      { type: 'amber', offsetX: -1.5, offsetZ: 1.5, levelRequired: 2 }
    ]
  },
  // Tile Matorral de Escarabajos (8, 0)
  {
    id: 'tile_a_8_0',
    x: 8,
    z: 0,
    biome: 'amberwood',
    cost: [{ resourceId: 'iron_bar', amount: 5 }, { resourceId: 'amber', amount: 10 }],
    prerequisiteTileIds: ['tile_a_7_0'],
    enemies: [
      { enemyId: 'armored_beetle', offsetX: -1.0, offsetZ: 0 },
      { enemyId: 'forest_bandit', offsetX: 1.0, offsetZ: 0 }
    ],
    nodes: [
      { type: 'tree', offsetX: 1.8, offsetZ: 1.8 },
      { type: 'iron', offsetX: -1.8, offsetZ: -1.8, levelRequired: 2 }
    ]
  },
  // Tile Viaducto a las Cavernas (9, 0)
  {
    id: 'tile_a_9_0',
    x: 9,
    z: 0,
    biome: 'amberwood',
    cost: [{ resourceId: 'iron_bar', amount: 12 }, { resourceId: 'wood', amount: 60 }],
    prerequisiteTileIds: ['tile_a_8_0'],
    building: { buildingId: 'bridge_crystal', offsetX: 0, offsetZ: 0 }
  },

  // --- BIOMA 3: CAVERNAS DE CRISTAL (CRYSTAL CAVERNS) ---
  // Entrada a las Cavernas (10, 0)
  {
    id: 'tile_c_10_0',
    x: 10,
    z: 0,
    biome: 'crystal_caverns',
    cost: [{ resourceId: 'iron_bar', amount: 15 }, { resourceId: 'amber', amount: 12 }],
    prerequisiteTileIds: ['tile_a_9_0'],
    nodes: [
      { type: 'crystal', offsetX: -1.5, offsetZ: -1.5, levelRequired: 3 },
      { type: 'cobalt', offsetX: 1.5, offsetZ: 1.5, levelRequired: 3 }
    ],
    enemies: [
      { enemyId: 'crystal_spitter', offsetX: 0, offsetZ: 0 }
    ]
  },
  // Tile Veta de Cobalto Profundo (11, 0)
  {
    id: 'tile_c_11_0',
    x: 11,
    z: 0,
    biome: 'crystal_caverns',
    cost: [{ resourceId: 'crystal', amount: 15 }, { resourceId: 'cobalt_ore', amount: 10 }],
    prerequisiteTileIds: ['tile_c_10_0'],
    nodes: [
      { type: 'cobalt', offsetX: -1.5, offsetZ: 1.5, levelRequired: 3 },
      { type: 'cobalt', offsetX: 1.5, offsetZ: -1.5, levelRequired: 3 },
      { type: 'crystal', offsetX: 0, offsetZ: 1.8, levelRequired: 3 }
    ],
    enemies: [
      { enemyId: 'void_wisp', offsetX: 0, offsetZ: -1.0 }
    ]
  },
  // Tile Cripta de Cristales (12, 0)
  {
    id: 'tile_c_12_0',
    x: 12,
    z: 0,
    biome: 'crystal_caverns',
    cost: [{ resourceId: 'cobalt_bar', amount: 8 }, { resourceId: 'crystal', amount: 20 }],
    prerequisiteTileIds: ['tile_c_11_0'],
    enemies: [
      { enemyId: 'crystal_spitter', offsetX: -1.5, offsetZ: 0 },
      { enemyId: 'void_wisp', offsetX: 1.5, offsetZ: 0 }
    ],
    nodes: [
      { type: 'crystal', offsetX: 0, offsetZ: 1.8, levelRequired: 3 }
    ]
  },
  // Tile Arena del Gran Draco de Amatista (13, 0) - BOSS 2!
  {
    id: 'tile_c_13_0',
    x: 13,
    z: 0,
    biome: 'crystal_caverns',
    cost: [{ resourceId: 'cobalt_bar', amount: 15 }, { resourceId: 'crystal', amount: 30 }, { resourceId: 'soul_essence', amount: 15 }],
    prerequisiteTileIds: ['tile_c_12_0'],
    boss: { bossId: 'crystal_drake', offsetX: 0, offsetZ: 0 },
    nodes: [
      { type: 'crystal', offsetX: -2.0, offsetZ: -2.0, levelRequired: 3 },
      { type: 'cobalt', offsetX: 2.0, offsetZ: 2.0, levelRequired: 3 }
    ]
  },
  // Tile Portal de Magma (14, 0) - Puerta a Cumbres de Magma
  {
    id: 'tile_c_14_0',
    x: 14,
    z: 0,
    biome: 'crystal_caverns',
    cost: [{ resourceId: 'cobalt_bar', amount: 20 }, { resourceId: 'soul_essence', amount: 20 }],
    prerequisiteTileIds: ['tile_c_13_0'],
    building: { buildingId: 'portal_molten', offsetX: 0, offsetZ: 0 }
  },

  // --- BIOMA 4: CUMBRES DE MAGMA (MOLTEN PEAKS) ---
  // Tile Entrada Volcánica (15, 0)
  {
    id: 'tile_m_15_0',
    x: 15,
    z: 0,
    biome: 'molten_peaks',
    cost: [{ resourceId: 'cobalt_bar', amount: 25 }, { resourceId: 'crystal', amount: 25 }],
    prerequisiteTileIds: ['tile_c_14_0'],
    nodes: [
      { type: 'obsidian', offsetX: -1.5, offsetZ: -1.5, levelRequired: 4 },
      { type: 'obsidian', offsetX: 1.5, offsetZ: 1.5, levelRequired: 4 }
    ],
    enemies: [
      { enemyId: 'magma_fiend', offsetX: 0, offsetZ: 0 }
    ]
  }
];

