import './style.css';
import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Game();
    (window as any).__game = game;
    console.log('✨ RealmCrafter: Echoes of Aethelgard iniciado correctamente.');
  } catch (err) {
    console.error('Error al inicializar el juego:', err);
  }
});

