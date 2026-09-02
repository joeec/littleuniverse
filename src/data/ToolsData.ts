export type ToolType = 'axe' | 'pickaxe' | 'sword' | 'armor' | 'backpack';

export interface ToolUpgradeLevel {
  level: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  statLabel: string;
  statValue: number; // e.g. damage, harvesting power
  power: number; // Node hardness threshold that this tool can harvest (1=Normal, 2=Copper, 3=Iron, 4=Cobalt, 5=Obsidian)
  upgradeCost: { resourceId: string; amount: number }[];
}

export const TOOLS_DATA: Record<ToolType, ToolUpgradeLevel[]> = {
  axe: [
    {
      level: 1,
      name: 'Hacha de Sílex',
      description: 'Herramienta básica para talar árboles comunes del Valle Esmeralda.',
      icon: '🪓',
      color: '#A0522D',
      statLabel: 'Poder de Tala',
      statValue: 10,
      power: 1,
      upgradeCost: []
    },
    {
      level: 2,
      name: 'Hacha de Cobre Reforzada',
      description: 'Cuchilla de cobre que corta árboles duros y reduce el tiempo de tala.',
      icon: '🪓',
      color: '#D2691E',
      statLabel: 'Poder de Tala',
      statValue: 25,
      power: 2,
      upgradeCost: [
        { resourceId: 'wood', amount: 30 },
        { resourceId: 'copper_bar', amount: 5 }
      ]
    },
    {
      level: 3,
      name: 'Hacha de Batalla de Hierro',
      description: 'Hacha pesada capaz de cortar maderas densas del Bosque de Ámbar.',
      icon: '🪓',
      color: '#708090',
      statLabel: 'Poder de Tala',
      statValue: 50,
      power: 3,
      upgradeCost: [
        { resourceId: 'wood', amount: 75 },
        { resourceId: 'iron_bar', amount: 10 },
        { resourceId: 'amber', amount: 6 }
      ]
    },
    {
      level: 4,
      name: 'Hacha Rúnica de Cobalto',
      description: 'Imbuida con energía de las cavernas para talar raíces arcanas con rapidez pasmosa.',
      icon: '🪓',
      color: '#00B4D8',
      statLabel: 'Poder de Tala',
      statValue: 90,
      power: 4,
      upgradeCost: [
        { resourceId: 'wood', amount: 150 },
        { resourceId: 'cobalt_bar', amount: 12 },
        { resourceId: 'crystal', amount: 10 }
      ]
    },
    {
      level: 5,
      name: 'Hacha Ígnea de Obsidiana',
      description: 'Filo forjado en magma volcánico que pulveriza cualquier madera al instante.',
      icon: '🪓',
      color: '#E63946',
      statLabel: 'Poder de Tala',
      statValue: 160,
      power: 5,
      upgradeCost: [
        { resourceId: 'wood', amount: 300 },
        { resourceId: 'obsidian', amount: 20 },
        { resourceId: 'fire_core', amount: 3 }
      ]
    }
  ],
  pickaxe: [
    {
      level: 1,
      name: 'Pico de Piedra Rústico',
      description: 'Pico elemental para extraer piedra de granito y nódulos de superficie.',
      icon: '⛏️',
      color: '#8A8A8A',
      statLabel: 'Poder de Minería',
      statValue: 10,
      power: 1,
      upgradeCost: []
    },
    {
      level: 2,
      name: 'Pico de Cobre Forjado',
      description: 'Permite minar vetas de cobre con mayor velocidad y menos esfuerzo.',
      icon: '⛏️',
      color: '#D2691E',
      statLabel: 'Poder de Minería',
      statValue: 25,
      power: 2,
      upgradeCost: [
        { resourceId: 'stone', amount: 30 },
        { resourceId: 'copper_bar', amount: 6 }
      ]
    },
    {
      level: 3,
      name: 'Pico de Acero y Hierro',
      description: 'Punta templada capaz de penetrar vetas de hierro y cuarzo cristalino.',
      icon: '⛏️',
      color: '#708090',
      statLabel: 'Poder de Minería',
      statValue: 50,
      power: 3,
      upgradeCost: [
        { resourceId: 'stone', amount: 80 },
        { resourceId: 'iron_bar', amount: 12 },
        { resourceId: 'amber', amount: 5 }
      ]
    },
    {
      level: 4,
      name: 'Pico Perforador de Cobalto',
      description: 'Resuena al golpear, extrayendo amatistas y cobalto en fragmentos puros.',
      icon: '⛏️',
      color: '#00B4D8',
      statLabel: 'Poder de Minería',
      statValue: 90,
      power: 4,
      upgradeCost: [
        { resourceId: 'stone', amount: 160 },
        { resourceId: 'cobalt_bar', amount: 14 },
        { resourceId: 'crystal', amount: 12 }
      ]
    },
    {
      level: 5,
      name: 'Pico Rompeabismos de Obsidiana',
      description: 'Desintegra las rocas volcánicas más densas como si fueran arena.',
      icon: '⛏️',
      color: '#E63946',
      statLabel: 'Poder de Minería',
      statValue: 160,
      power: 5,
      upgradeCost: [
        { resourceId: 'stone', amount: 350 },
        { resourceId: 'obsidian', amount: 25 },
        { resourceId: 'fire_core', amount: 4 }
      ]
    }
  ],
  sword: [
    {
      level: 1,
      name: 'Espada de Aprendiz',
      description: 'Espada corta confiable para ahuyentar a criaturas pequeñas del valle.',
      icon: '🗡️',
      color: '#A8DADC',
      statLabel: 'Daño de Ataque',
      statValue: 15,
      power: 1,
      upgradeCost: []
    },
    {
      level: 2,
      name: 'Gladius de Bronce y Cobre',
      description: 'Hoja equilibrada con mayor alcance e impacto contra enemigos rápidos.',
      icon: '⚔️',
      color: '#D2691E',
      statLabel: 'Daño de Ataque',
      statValue: 30,
      power: 2,
      upgradeCost: [
        { resourceId: 'wood', amount: 25 },
        { resourceId: 'copper_bar', amount: 8 }
      ]
    },
    {
      level: 3,
      name: 'Mandoble de Caballero de Hierro',
      description: 'Espada pesada con alto poder de aturdimiento y barrido a múltiples enemigos.',
      icon: '⚔️',
      color: '#708090',
      statLabel: 'Daño de Ataque',
      statValue: 60,
      power: 3,
      upgradeCost: [
        { resourceId: 'iron_bar', amount: 15 },
        { resourceId: 'amber', amount: 8 },
        { resourceId: 'soul_essence', amount: 5 }
      ]
    },
    {
      level: 4,
      name: 'Hoja Reluciente de Cobalto',
      description: 'Genera ondas de choque arcanas y tiene probabilidad de golpe crítico elevado.',
      icon: '✨⚔️',
      color: '#00B4D8',
      statLabel: 'Daño de Ataque',
      statValue: 110,
      power: 4,
      upgradeCost: [
        { resourceId: 'cobalt_bar', amount: 18 },
        { resourceId: 'crystal', amount: 15 },
        { resourceId: 'soul_essence', amount: 12 }
      ]
    },
    {
      level: 5,
      name: 'Filo Vorpal de Obsidiana',
      description: 'Arma legendaria envuelta en fuego cósmico que diezma ejércitos enteros.',
      icon: '🔥🗡️',
      color: '#E63946',
      statLabel: 'Daño de Ataque',
      statValue: 200,
      power: 5,
      upgradeCost: [
        { resourceId: 'obsidian', amount: 30 },
        { resourceId: 'fire_core', amount: 6 },
        { resourceId: 'soul_essence', amount: 25 }
      ]
    }
  ],
  armor: [
    {
      level: 1,
      name: 'Túnica de Explorador',
      description: 'Ropajes de cuero y lino que otorgan resistencia básica.',
      icon: '🥋',
      color: '#4CAF50',
      statLabel: 'Vida Máxima',
      statValue: 100,
      power: 1,
      upgradeCost: []
    },
    {
      level: 2,
      name: 'Cota de Malla de Cobre',
      description: 'Protección metálica que absorbe golpes y aumenta tu vitalidad.',
      icon: '🛡️',
      color: '#D2691E',
      statLabel: 'Vida Máxima',
      statValue: 160,
      power: 2,
      upgradeCost: [
        { resourceId: 'fiber', amount: 40 },
        { resourceId: 'copper_bar', amount: 8 }
      ]
    },
    {
      level: 3,
      name: 'Armadura de Placas de Hierro',
      description: 'Pechera robusta con reducción de daño pasiva contra monstruos feroces.',
      icon: '🛡️',
      color: '#708090',
      statLabel: 'Vida Máxima',
      statValue: 240,
      power: 3,
      upgradeCost: [
        { resourceId: 'iron_bar', amount: 16 },
        { resourceId: 'fiber', amount: 80 },
        { resourceId: 'amber', amount: 6 }
      ]
    },
    {
      level: 4,
      name: 'Coraza Arcana de Cobalto',
      description: 'Genera un escudo de maná que regenera vida lentamente fuera de combate.',
      icon: '💠🛡️',
      color: '#00B4D8',
      statLabel: 'Vida Máxima',
      statValue: 350,
      power: 4,
      upgradeCost: [
        { resourceId: 'cobalt_bar', amount: 20 },
        { resourceId: 'crystal', amount: 15 },
        { resourceId: 'soul_essence', amount: 15 }
      ]
    },
    {
      level: 5,
      name: 'Armadura Titánica de Obsidiana',
      description: 'Inmune a los efectos del calor extremo y con la mayor resistencia del reino.',
      icon: '👑🛡️',
      color: '#E63946',
      statLabel: 'Vida Máxima',
      statValue: 500,
      power: 5,
      upgradeCost: [
        { resourceId: 'obsidian', amount: 35 },
        { resourceId: 'fire_core', amount: 5 },
        { resourceId: 'soul_essence', amount: 30 }
      ]
    }
  ],
  backpack: [
    {
      level: 1,
      name: 'Mochila Pequeña de Tela',
      description: 'Bolsa ligera para cargar los primeros suministros.',
      icon: '🎒',
      color: '#8B5A2B',
      statLabel: 'Capacidad de Carga',
      statValue: 200,
      power: 1,
      upgradeCost: []
    },
    {
      level: 2,
      name: 'Mochila de Cuero Reforzada',
      description: 'Costuras de fibra y refuerzo de cobre para llevar más recursos.',
      icon: '🎒',
      color: '#D2691E',
      statLabel: 'Capacidad de Carga',
      statValue: 500,
      power: 2,
      upgradeCost: [
        { resourceId: 'fiber', amount: 30 },
        { resourceId: 'copper_bar', amount: 4 }
      ]
    },
    {
      level: 3,
      name: 'Mochila de Viajero con Bolsillos',
      description: 'Bolsillos expandidos y correas de hierro para expediciones largas.',
      icon: '🎒',
      color: '#708090',
      statLabel: 'Capacidad de Carga',
      statValue: 1200,
      power: 3,
      upgradeCost: [
        { resourceId: 'fiber', amount: 70 },
        { resourceId: 'iron_bar', amount: 10 }
      ]
    },
    {
      level: 4,
      name: 'Mochila Dimensional de Cobalto',
      description: 'Encantada con espacio comprimido para acumular enormes cargamentos.',
      icon: '🎒',
      color: '#00B4D8',
      statLabel: 'Capacidad de Carga',
      statValue: 3000,
      power: 4,
      upgradeCost: [
        { resourceId: 'crystal', amount: 20 },
        { resourceId: 'cobalt_bar', amount: 15 }
      ]
    },
    {
      level: 5,
      name: 'Bolsa del Infinito',
      description: 'Contiene una microdimensión con almacenamiento prácticamente ilimitado.',
      icon: '🎒✨',
      color: '#E63946',
      statLabel: 'Capacidad de Carga',
      statValue: 99999,
      power: 5,
      upgradeCost: [
        { resourceId: 'obsidian', amount: 25 },
        { resourceId: 'fire_core', amount: 4 },
        { resourceId: 'soul_essence', amount: 20 }
      ]
    }
  ]
};

