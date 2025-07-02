
export interface Player {
  id: 1 | 2;
  name: string;
  color: string;
  avatar?: string;
  score: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GamePiece {
  id: string;
  playerId: 1 | 2;
  position: Position;
  isPlaced: boolean;
}

export type GamePhase = 'placement' | 'movement';
export type GameStatus = 'playing' | 'won' | 'draw';

export interface GameState {
  phase: GamePhase;
  status: GameStatus;
  currentPlayer: 1 | 2;
  pieces: GamePiece[];
  winner?: 1 | 2;
  turnStartTime: number;
  totalGameTime: number;
}

export interface GameHistory {
  id: string;
  date: Date;
  winner: Player;
  loser: Player;
  duration: number;
  totalTurns: number;
}

export interface GameSettings {
  turnTimeLimit?: number; // en secondes, undefined = pas de limite
  maxGameTime?: number; // en minutes
}
