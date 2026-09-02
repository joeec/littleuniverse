import { NPC } from '../entities/NPC';
import { EventBus } from '../core/EventBus';
import { AudioSys } from '../systems/AudioManager';

export class DialogueUI {
  private root: HTMLElement;
  private container: HTMLDivElement | null = null;
  private currentNPC: NPC | null = null;

  private typewriterTimer: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    EventBus.on('ui:open_dialogue', (data: { npc: NPC }) => this.open(data.npc));
  }

  public open(npc: NPC): void {
    this.close();
    this.currentNPC = npc;

    this.container = document.createElement('div');
    this.container.className = 'dialogue-box glass-panel interactive';
    this.container.innerHTML = `
      <div class="dialogue-speaker">${npc.def.name} <span style="font-size: 12px; color: #94A3B8; font-weight: 400;">(${npc.def.role})</span></div>
      <div class="dialogue-text" id="dlg-text-content"></div>
      <div class="dialogue-choices" id="dlg-choices-container"></div>
    `;

    this.root.appendChild(this.container);

    const startNode = npc.def.dialogues.start;
    if (startNode) {
      this.displayNode(startNode);
    }
  }

  public close(): void {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.currentNPC = null;
  }

  private displayNode(node: { text: string; choices: any[] }): void {
    if (!this.container) return;

    const textEl = this.container.querySelector('#dlg-text-content')!;
    const choicesEl = this.container.querySelector('#dlg-choices-container')!;

    textEl.textContent = '';
    choicesEl.innerHTML = '';

    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }

    let charIdx = 0;
    const fullText = node.text;

    this.typewriterTimer = window.setInterval(() => {
      if (charIdx < fullText.length) {
        textEl.textContent += fullText.charAt(charIdx);
        charIdx++;
        if (charIdx % 3 === 0) {
          AudioSys.playSFX('ui_click');
        }
      } else {
        clearInterval(this.typewriterTimer!);
        this.typewriterTimer = null;
        this.renderChoices(node.choices);
      }
    }, 18);
  }

  private renderChoices(choices: any[]): void {
    if (!this.container) return;
    const choicesEl = this.container.querySelector('#dlg-choices-container')!;

    let html = '';
    choices.forEach((choice, idx) => {
      html += `<button class="dialogue-choice-btn" data-choice="${idx}">${choice.text}</button>`;
    });
    html += `<button class="dialogue-choice-btn" style="background: rgba(239, 71, 111, 0.2);" id="dlg-btn-leave">👋 Despedirse</button>`;

    choicesEl.innerHTML = html;

    choicesEl.querySelectorAll('button[data-choice]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-choice') || '0');
        const selected = choices[idx];
        if (selected) {
          AudioSys.playSFX('ui_click');
          this.displayNode({
            text: selected.response,
            choices: []
          });
        }
      });
    });

    this.container.querySelector('#dlg-btn-leave')!.addEventListener('click', () => {
      AudioSys.playSFX('ui_click');
      this.close();
    });
  }
}

