export interface ResourceDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 1 | 2 | 3 | 4 | 5; // 1: Common, 2: Uncommon, 3: Rare, 4: Epic, 5: Legendary
  maxStack: number;
  value: number; // Gold value
  biome: string;
}

export const RESOURCES: Record<string, ResourceDefinition> = {
  wood: {
    id: 'wood',
    name: 'Madera de Roble',
    description: 'Madera resistente recolectada de árboles ancestrales.',
    icon: '🪵',
    color: '#8B5A2B',
    rarity: 1,
    maxStack: 999,
    value: 1,
    biome: 'verdant'
  },
  stone: {
    id: 'stone',
    name: 'Piedra de Granito',
    description: 'Piedra común utilizada en cimientos y losas.',
    icon: '🪨',
    color: '#8A8A8A',
    rarity: 1,
    maxStack: 999,
    value: 1,
    biome: 'verdant'
  },
  fiber: {
    id: 'fiber',
    name: 'Fibra Silvestre',
    description: 'Fibras vegetales recolectadas de arbustos mágicos.',
    icon: '🌿',
    color: '#4CAF50',
    rarity: 1,
    maxStack: 999,
    value: 2,
    biome: 'verdant'
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'Mineral de Cobre',
    description: 'Nódulos metálicos de color rojizo para forjar herramientas.',
    icon: '🟤',
    color: '#D2691E',
    rarity: 2,
    maxStack: 999,
    value: 5,
    biome: 'verdant'
  },
  copper_bar: {
    id: 'copper_bar',
    name: 'Lingote de Cobre',
    description: 'Cobre fundido en la forja, listo para herramientas avanzadas.',
    icon: '🥉',
    color: '#E07A5F',
    rarity: 2,
    maxStack: 500,
    value: 15,
    biome: 'verdant'
  },
  amber: {
    id: 'amber',
    name: 'Resina de Ámbar',
    description: 'Gema fosilizada brillante hallada en los árboles del bosque profundo.',
    icon: '🔶',
    color: '#FFB703',
    rarity: 2,
    maxStack: 500,
    value: 12,
    biome: 'amberwood'
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Mineral de Hierro',
    description: 'Metal pesado y robusto extraído de vetas rocosas oscuras.',
    icon: '⚙️',
    color: '#708090',
    rarity: 3,
    maxStack: 999,
    value: 10,
    biome: 'amberwood'
  },
  iron_bar: {
    id: 'iron_bar',
    name: 'Lingote de Hierro',
    description: 'Hierro templado con alta resistencia al impacto.',
    icon: '🥈',
    color: '#A8DADC',
    rarity: 3,
    maxStack: 500,
    value: 30,
    biome: 'amberwood'
  },
  crystal: {
    id: 'crystal',
    name: 'Cristal Amatista',
    description: 'Cristal resonante con energía arcana.',
    icon: '🔮',
    color: '#9B5DE5',
    rarity: 3,
    maxStack: 500,
    value: 25,
    biome: 'crystal_caverns'
  },
  cobalt_ore: {
    id: 'cobalt_ore',
    name: 'Mineral de Cobalto',
    description: 'Metal azul brillante de dureza extraordinaria.',
    icon: '🔷',
    color: '#0077B6',
    rarity: 4,
    maxStack: 999,
    value: 35,
    biome: 'crystal_caverns'
  },
  cobalt_bar: {
    id: 'cobalt_bar',
    name: 'Lingote de Cobalto',
    description: 'Aleación legendaria con propiedades mágicas de corte.',
    icon: '💠',
    color: '#00B4D8',
    rarity: 4,
    maxStack: 500,
    value: 90,
    biome: 'crystal_caverns'
  },
  gold_coin: {
    id: 'gold_coin',
    name: 'Moneda de Oro',
    description: 'Moneda del antiguo imperio de Aethelgard.',
    icon: '🪙',
    color: '#FFD700',
    rarity: 3,
    maxStack: 99999,
    value: 1,
    biome: 'all'
  },
  soul_essence: {
    id: 'soul_essence',
    name: 'Esencia de Guardián',
    description: 'Fragmento de poder dejado por criaturas y guardianes caídos.',
    icon: '✨',
    color: '#F15BB5',
    rarity: 4,
    maxStack: 500,
    value: 50,
    biome: 'all'
  },
  obsidian: {
    id: 'obsidian',
    name: 'Esquirla de Obsidiana',
    description: 'Vidrio volcánico negro afilado como una cuchilla.',
    icon: '🖤',
    color: '#1D3557',
    rarity: 5,
    maxStack: 500,
    value: 75,
    biome: 'molten_peaks'
  },
  fire_core: {
    id: 'fire_core',
    name: 'Núcleo Ígneo',
    description: 'Corazón ardiente extraído de las profundidades volcánicas.',
    icon: '🔥',
    color: '#E63946',
    rarity: 5,
    maxStack: 100,
    value: 150,
    biome: 'molten_peaks'
  }
};

