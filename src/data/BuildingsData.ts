export interface BuildingRequirement {
  resourceId: string;
  amount: number;
}

export interface BuildingDefinition {
  id: string;
  name: string;
  description: string;
  type: 'crafting' | 'bridge' | 'portal' | 'utility';
  requirements: BuildingRequirement[];
  icon: string;
  biome: string;
  unlockedByDefault?: boolean;
}

export const BUILDINGS_DATA: Record<string, BuildingDefinition> = {
  forge: {
    id: 'forge',
    name: 'Gran Forja de Aethelgard',
    description: 'Permite fundir minerales en lingotes y forjar herramientas y armas de nivel superior.',
    type: 'crafting',
    requirements: [
      { resourceId: 'wood', amount: 40 },
      { resourceId: 'stone', amount: 50 },
      { resourceId: 'copper_ore', amount: 15 }
    ],
    icon: '🔥⚒️',
    biome: 'verdant'
  },
  sawmill: {
    id: 'sawmill',
    name: 'Aserradero Arcano',
    description: 'Procesa maderas exóticas para construcciones y ampliaciones de mochila.',
    type: 'crafting',
    requirements: [
      { resourceId: 'wood', amount: 60 },
      { resourceId: 'stone', amount: 30 },
      { resourceId: 'fiber', amount: 20 }
    ],
    icon: '🪵⚙️',
    biome: 'verdant'
  },
  healing_fountain: {
    id: 'healing_fountain',
    name: 'Fuente de la Vida',
    description: 'Manantial de aguas etéreas que regenera la salud del aventurero al acercarse.',
    type: 'utility',
    requirements: [
      { resourceId: 'stone', amount: 40 },
      { resourceId: 'fiber', amount: 30 },
      { resourceId: 'copper_bar', amount: 5 }
    ],
    icon: '⛲✨',
    biome: 'verdant'
  },
  bridge_amberwood: {
    id: 'bridge_amberwood',
    name: 'Puente de Granito',
    description: 'Puente fortificado que cruza el abismo hacia el denso Bosque de Ámbar.',
    type: 'bridge',
    requirements: [
      { resourceId: 'wood', amount: 80 },
      { resourceId: 'stone', amount: 100 },
      { resourceId: 'copper_bar', amount: 8 }
    ],
    icon: '🌉',
    biome: 'verdant'
  },
  crystal_refinery: {
    id: 'crystal_refinery',
    name: 'Refinería de Resonancia',
    description: 'Canaliza la energía de los cristales para infundir armaduras y armas con daño elemental.',
    type: 'crafting',
    requirements: [
      { resourceId: 'iron_bar', amount: 15 },
      { resourceId: 'amber', amount: 10 },
      { resourceId: 'stone', amount: 120 }
    ],
    icon: '🔮⚡',
    biome: 'amberwood'
  },
  bridge_crystal: {
    id: 'bridge_crystal',
    name: 'Viaducto Luminiscente',
    description: 'Vía construida con vigas de hierro para descender a las profundas Cavernas de Cristal.',
    type: 'bridge',
    requirements: [
      { resourceId: 'iron_bar', amount: 20 },
      { resourceId: 'wood', amount: 120 },
      { resourceId: 'amber', amount: 15 }
    ],
    icon: '🌉✨',
    biome: 'amberwood'
  },
  teleport_beacon_verdant: {
    id: 'teleport_beacon_verdant',
    name: 'Baliza del Valle',
    description: 'Monolito de viaje rápido para volver al campamento central instantáneamente.',
    type: 'utility',
    requirements: [
      { resourceId: 'stone', amount: 50 },
      { resourceId: 'copper_bar', amount: 6 },
      { resourceId: 'soul_essence', amount: 2 }
    ],
    icon: '🌀',
    biome: 'verdant'
  },
  teleport_beacon_amber: {
    id: 'teleport_beacon_amber',
    name: 'Baliza del Bosque',
    description: 'Punto de teletransporte en el corazón del Bosque de Ámbar.',
    type: 'utility',
    requirements: [
      { resourceId: 'iron_bar', amount: 10 },
      { resourceId: 'amber', amount: 8 },
      { resourceId: 'soul_essence', amount: 5 }
    ],
    icon: '🌀',
    biome: 'amberwood'
  },
  portal_molten: {
    id: 'portal_molten',
    name: 'Portal a las Cumbres de Magma',
    description: 'Arco rúnico ancestral sellado por la fuerza del Draco de Cristal.',
    type: 'portal',
    requirements: [
      { resourceId: 'cobalt_bar', amount: 25 },
      { resourceId: 'crystal', amount: 20 },
      { resourceId: 'soul_essence', amount: 20 }
    ],
    icon: '🌋⛩️',
    biome: 'crystal_caverns'
  }
};

