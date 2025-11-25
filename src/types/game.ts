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

export interface Player {
  id: 1 | 2;
  name: string;
  color: string;
  score: number;
  avatar?: string;
  isAI?: boolean;
}

export interface GameState {
  phase: 'placement' | 'movement';
  status: 'playing' | 'won';
  currentPlayer: 1 | 2;
  pieces: GamePiece[];
  winner?: 1 | 2;
  turnStartTime: number;
  totalGameTime: number;
  gameMode?: 'human' | 'ai' | 'online';
}

export interface GameHistory {
  date: Date;
  winner: Player;
  loser: Player;
  duration: number;
  totalTurns: number;
}

export interface GameSettings {
  turnTimeLimit: number;
}

export interface ValidMove {
  piece: GamePiece;
  from: Position;
  to: Position;
}