export interface BossPhase {
  phaseNumber: number;
  healthThreshold: number; // 1.0 down to 0.0
  name: string;
  speedMultiplier: number;
  damageMultiplier: number;
  specialAttacks: string[];
}

export interface BossDefinition {
  id: string;
  name: string;
  title: string;
  biome: string;
  maxHealth: number;
  baseDamage: number;
  speed: number;
  phases: BossPhase[];
  color: string;
  scale: number;
  arenaCenter: { x: number; z: number };
  arenaRadius: number;
  rewards: { resourceId: string; amount: number }[];
  unlocksFeature: string;
}

export const BOSSES_DATA: Record<string, BossDefinition> = {
  moss_golem: {
    id: 'moss_golem',
    name: 'Gólem de Musgo Ancestral',
    title: 'Guardián del Valle Esmeralda',
    biome: 'verdant',
    maxHealth: 500,
    baseDamage: 25,
    speed: 2.2,
    color: '#386641',
    scale: 2.4,
    arenaCenter: { x: 28, z: 0 },
    arenaRadius: 12,
    phases: [
      {
        phaseNumber: 1,
        healthThreshold: 1.0,
        name: 'Despertar de Piedra',
        speedMultiplier: 1.0,
        damageMultiplier: 1.0,
        specialAttacks: ['ground_slam', 'heavy_swipe']
      },
      {
        phaseNumber: 2,
        healthThreshold: 0.5,
        name: 'Furia de la Tierra',
        speedMultiplier: 1.35,
        damageMultiplier: 1.4,
        specialAttacks: ['rock_shockwave', 'summon_minions', 'ground_slam']
      }
    ],
    rewards: [
      { resourceId: 'copper_bar', amount: 15 },
      { resourceId: 'gold_coin', amount: 50 },
      { resourceId: 'soul_essence', amount: 10 },
      { resourceId: 'amber', amount: 8 }
    ],
    unlocksFeature: 'Puente hacia el Bosque de Ámbar desbloqueado'
  },
  crystal_drake: {
    id: 'crystal_drake',
    name: 'Gran Draco de Amatista',
    title: 'Monarca de las Cavernas Resonantes',
    biome: 'crystal_caverns',
    maxHealth: 1200,
    baseDamage: 45,
    speed: 3.5,
    color: '#7209B7',
    scale: 2.8,
    arenaCenter: { x: 90, z: 25 },
    arenaRadius: 15,
    phases: [
      {
        phaseNumber: 1,
        healthThreshold: 1.0,
        name: 'Vuelo Arcano',
        speedMultiplier: 1.0,
        damageMultiplier: 1.0,
        specialAttacks: ['crystal_breath', 'tail_swipe']
      },
      {
        phaseNumber: 2,
        healthThreshold: 0.5,
        name: 'Tormenta de Cristales',
        speedMultiplier: 1.4,
        damageMultiplier: 1.5,
        specialAttacks: ['crystal_rain', 'laser_sweep', 'crystal_breath']
      }
    ],
    rewards: [
      { resourceId: 'cobalt_bar', amount: 25 },
      { resourceId: 'crystal', amount: 35 },
      { resourceId: 'gold_coin', amount: 200 },
      { resourceId: 'soul_essence', amount: 30 }
    ],
    unlocksFeature: 'Portal a las Cumbres de Magma activado'
  }
};

