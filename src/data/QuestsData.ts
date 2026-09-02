export interface QuestObjective {
  id: string;
  description: string;
  type: 'gather' | 'unlock_tiles' | 'build' | 'upgrade' | 'kill' | 'defeat_boss' | 'talk';
  targetId: string; // Resource ID, Enemy ID, Building ID, etc.
  targetAmount: number;
  currentAmount: number;
}

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  npcId: string;
  objectives: QuestObjective[];
  rewards: { resourceId: string; amount: number }[];
  nextQuestId?: string;
  isMainQuest: boolean;
}

export const QUESTS_DATA: Record<string, QuestDefinition> = {
  quest_1_awakening: {
    id: 'quest_1_awakening',
    title: '1. El Despertar del Reino',
    description: 'Aethelgard está en ruinas. Comienza recolectando madera de los robles cercanos y piedra de granito.',
    npcId: 'elder_oakhaven',
    isMainQuest: true,
    objectives: [
      {
        id: 'gather_wood',
        description: 'Talar madera de roble',
        type: 'gather',
        targetId: 'wood',
        targetAmount: 15,
        currentAmount: 0
      },
      {
        id: 'gather_stone',
        description: 'Picar piedra de granito',
        type: 'gather',
        targetId: 'stone',
        targetAmount: 10,
        currentAmount: 0
      }
    ],
    rewards: [
      { resourceId: 'gold_coin', amount: 15 },
      { resourceId: 'fiber', amount: 10 }
    ],
    nextQuestId: 'quest_2_rebuild_sanctuary'
  },
  quest_2_rebuild_sanctuary: {
    id: 'quest_2_rebuild_sanctuary',
    title: '2. Expansión de Tierras',
    description: 'Párate sobre los hexágonos translúcidos del borde para verter recursos y expandir el mapa.',
    npcId: 'elder_oakhaven',
    isMainQuest: true,
    objectives: [
      {
        id: 'unlock_tiles',
        description: 'Reconstruir losas de terreno',
        type: 'unlock_tiles',
        targetId: 'tile',
        targetAmount: 4,
        currentAmount: 0
      }
    ],
    rewards: [
      { resourceId: 'gold_coin', amount: 25 },
      { resourceId: 'copper_ore', amount: 8 }
    ],
    nextQuestId: 'quest_3_forge_glory'
  },
  quest_3_forge_glory: {
    id: 'quest_3_forge_glory',
    title: '3. La Gran Forja',
    description: 'Reúne materiales para construir la Gran Forja y mejora tu Hacha o Espada con la Maestra Val.',
    npcId: 'blacksmith_val',
    isMainQuest: true,
    objectives: [
      {
        id: 'build_forge',
        description: 'Construir la Gran Forja',
        type: 'build',
        targetId: 'forge',
        targetAmount: 1,
        currentAmount: 0
      },
      {
        id: 'upgrade_tool',
        description: 'Mejorar cualquier herramienta al Nivel 2',
        type: 'upgrade',
        targetId: 'any',
        targetAmount: 1,
        currentAmount: 0
      }
    ],
    rewards: [
      { resourceId: 'copper_bar', amount: 8 },
      { resourceId: 'gold_coin', amount: 35 }
    ],
    nextQuestId: 'quest_4_defeat_golem'
  },
  quest_4_defeat_golem: {
    id: 'quest_4_defeat_golem',
    title: '4. El Guardián del Valle',
    description: 'Avanza hacia el este, cruza el claro ceremonial y derrota al temible Gólem de Musgo Ancestral.',
    npcId: 'scout_roderick',
    isMainQuest: true,
    objectives: [
      {
        id: 'defeat_golem',
        description: 'Derrotar al Gólem de Musgo Ancestral',
        type: 'defeat_boss',
        targetId: 'moss_golem',
        targetAmount: 1,
        currentAmount: 0
      }
    ],
    rewards: [
      { resourceId: 'gold_coin', amount: 100 },
      { resourceId: 'soul_essence', amount: 15 },
      { resourceId: 'copper_bar', amount: 10 }
    ],
    nextQuestId: 'quest_5_amber_expedition'
  },
  quest_5_amber_expedition: {
    id: 'quest_5_amber_expedition',
    title: '5. Expedición al Bosque de Ámbar',
    description: 'Construye el Gran Puente de Granito y adéntrate en el Bosque de Ámbar para recolectar Hierro y Ámbar.',
    npcId: 'scout_roderick',
    isMainQuest: true,
    objectives: [
      {
        id: 'build_bridge',
        description: 'Construir el Puente hacia el Bosque de Ámbar',
        type: 'build',
        targetId: 'bridge_amberwood',
        targetAmount: 1,
        currentAmount: 0
      },
      {
        id: 'gather_iron',
        description: 'Recolectar Mineral de Hierro',
        type: 'gather',
        targetId: 'iron_ore',
        targetAmount: 15,
        currentAmount: 0
      },
      {
        id: 'gather_amber',
        description: 'Recolectar Resina de Ámbar',
        type: 'gather',
        targetId: 'amber',
        targetAmount: 8,
        currentAmount: 0
      }
    ],
    rewards: [
      { resourceId: 'iron_bar', amount: 10 },
      { resourceId: 'gold_coin', amount: 80 }
    ],
    nextQuestId: 'quest_6_crystal_drake'
  },
  quest_6_crystal_drake: {
    id: 'quest_6_crystal_drake',
    title: '6. El Señor de los Cristales',
    description: 'Construye el Viaducto Luminiscente, desciende a las Cavernas de Cristal y vence al Gran Draco de Amatista.',
    npcId: 'elder_oakhaven',
    isMainQuest: true,
    objectives: [
      {
        id: 'build_crystal_bridge',
        description: 'Construir el Viaducto a las Cavernas de Cristal',
        type: 'build',
        targetId: 'bridge_crystal',
        targetAmount: 1,
        currentAmount: 0
      },
      {
        id: 'defeat_drake',
        description: 'Vencer al Gran Draco de Amatista',
        type: 'defeat_boss',
        targetId: 'crystal_drake',
        targetAmount: 1,
        currentAmount: 0
      }
    ],
    rewards: [
      { resourceId: 'gold_coin', amount: 250 },
      { resourceId: 'cobalt_bar', amount: 20 },
      { resourceId: 'crystal', amount: 30 }
    ]
  }
};

