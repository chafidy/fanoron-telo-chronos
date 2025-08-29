
import { GameHistory, Player } from '../types/game';

const STORAGE_KEYS = {
  GAME_HISTORY: 'fanoron-telo-history',
  PLAYER_SETTINGS: 'fanoron-telo-players',
  GAME_SCORES: 'fanoron-telo-scores'
};

export function saveGameHistory(history: GameHistory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.warn('Impossible de sauvegarder l\'historique:', error);
  }
}

export function loadGameHistory(): GameHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      date: new Date(item.date)
    }));
  } catch (error) {
    console.warn('Impossible de charger l\'historique:', error);
    return [];
  }
}

export function clearGameHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
  } catch (error) {
    console.warn('Impossible de vider l\'historique:', error);
  }
}

export function savePlayerSettings(players: Player[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_SETTINGS, JSON.stringify(players));
  } catch (error) {
    console.warn('Impossible de sauvegarder les paramètres des joueurs:', error);
  }
}

export function loadPlayerSettings(): Player[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_SETTINGS);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Impossible de charger les paramètres des joueurs:', error);
    return [];
  }
}

export function saveScores(player1Score: number, player2Score: number): void {
  try {
    const scores = { player1: player1Score, player2: player2Score };
    localStorage.setItem(STORAGE_KEYS.GAME_SCORES, JSON.stringify(scores));
  } catch (error) {
    console.warn('Impossible de sauvegarder les scores:', error);
  }
}

export function loadScores(): { player1: number; player2: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_SCORES);
    if (!stored) return { player1: 0, player2: 0 };
    
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Impossible de charger les scores:', error);
    return { player1: 0, player2: 0 };
  }
}

export function resetScores(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_SCORES);
  } catch (error) {
    console.warn('Impossible de réinitialiser les scores:', error);
  }
}

export function addGameToHistory(game: GameHistory): void {
  const history = loadGameHistory();
  const newGame: GameHistory = {
    ...game
  };
  
  history.unshift(newGame);
  
  // Garde seulement les 50 dernières parties
  if (history.length > 50) {
    history.splice(50);
  }
  
  saveGameHistory(history);
}
