export interface DialogueChoice {
  text: string;
  response: string;
  triggerQuestId?: string;
  reward?: { resourceId: string; amount: number };
}

export interface DialogueNode {
  id: string;
  speakerName: string;
  text: string;
  choices: DialogueChoice[];
}

export interface NPCDefinition {
  id: string;
  name: string;
  role: string;
  color: string;
  position: { x: number; z: number };
  biome: string;
  greeting: string;
  dialogues: Record<string, DialogueNode>;
  associatedQuestId?: string;
}

export const NPCS_DATA: Record<string, NPCDefinition> = {
  elder_oakhaven: {
    id: 'elder_oakhaven',
    name: 'Anciano Oakhaven',
    role: 'Guardián del Santuario',
    color: '#3A86FF',
    position: { x: 2, z: 2 },
    biome: 'verdant',
    greeting: '¡Saludos, viajero! Las tierras de Aethelgard han estado fragmentadas desde el gran cataclismo...',
    associatedQuestId: 'quest_1_awakening',
    dialogues: {
      start: {
        id: 'start',
        speakerName: 'Anciano Oakhaven',
        text: '¡Por fin despiertas! Las losas del mundo han caído al vacío. Usa tu hacha y pico para recolectar madera y piedra. Si te paras sobre las losas etéreas, las reconstruirás con tus recursos.',
        choices: [
          {
            text: '¿Cómo reconstruyo el mundo?',
            response: 'Corta árboles y pica rocas. Luego camina sobre los hexágonos translúcidos; tus materiales fluirán solos para elevar la tierra.'
          },
          {
            text: '¿Hay peligro más adelante?',
            response: 'Criaturas de esporas y bandidos acechan en las afueras. Reconstruye la Gran Forja para mejorar tu armamento antes de adentrarte en el cubil del Gólem.'
          }
        ]
      }
    }
  },
  blacksmith_val: {
    id: 'blacksmith_val',
    name: 'Maestra Forjadora Val',
    role: 'Armera de Aethelgard',
    color: '#FB5607',
    position: { x: 10, z: -4 },
    biome: 'verdant',
    greeting: '¡El fuego de la forja no se apaga! ¿Traes minerales para templar nuevas hojas?',
    associatedQuestId: 'quest_3_forge_glory',
    dialogues: {
      start: {
        id: 'start',
        speakerName: 'Maestra Val',
        text: 'Una espada afilada y un pico reforzado son la diferencia entre la gloria y ser alimento de gólem. Tráeme lingotes de cobre y te forjaré equipo de primera.',
        choices: [
          {
            text: '¿Cómo obtengo lingotes de cobre?',
            response: 'Pica las rocas con vetas anaranjadas en el este del valle. Luego usa la estación de fundición aquí en la forja.'
          },
          {
            text: '¡Quiero mejorar mis herramientas!',
            response: 'Interactúa con el yunque dorado cuando tengas los materiales necesarios en tu mochila.'
          }
        ]
      }
    }
  },
  scout_roderick: {
    id: 'scout_roderick',
    name: 'Explorador Roderick',
    role: 'Vigía del Puente',
    color: '#8338EC',
    position: { x: 20, z: 0 },
    biome: 'verdant',
    greeting: 'Cuidado al avanzar... el Gólem Ancestral bloquea el paso hacia el Bosque de Ámbar.',
    associatedQuestId: 'quest_4_defeat_golem',
    dialogues: {
      start: {
        id: 'start',
        speakerName: 'Explorador Roderick',
        text: 'Esa mole de piedra despierta cuando alguien pisa su claro ceremonial. Sus pisadas generan ondas sísmicas devastadoras. Esquiva con tu dash (espacio o botón de esquive) justo cuando levante sus brazos.',
        choices: [
          {
            text: '¿Cómo derroto al Gólem?',
            response: 'Ataca tras esquivar su golpe de suelo. Cuando entre en furia, ¡mantén la distancia y destruye sus esbirros primero!'
          },
          {
            text: '¿Qué hay al otro lado del puente?',
            response: 'El Bosque de Ámbar, rico en hierro, resina y secretos arcanos que conducen a las profundas Cavernas de Cristal.'
          }
        ]
      }
    }
  }
};

