
import { GamePiece, Position, Player } from '../types/game';

export const BOARD_SIZE = 3;

// Définit toutes les positions valides sur le plateau (intersections)
export const VALID_POSITIONS: Position[] = [
  // Coins
  { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 },
  // Milieux des côtés
  { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 },
  // Centre
  { x: 1, y: 1 }
];

// Définit les connexions entre les positions (lignes du plateau)
export const CONNECTIONS: { [key: string]: Position[] } = {
  '0,0': [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  '1,0': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
  '2,0': [{ x: 1, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
  '0,1': [{ x: 0, y: 0 }, { x: 0, y: 2 }, { x: 1, y: 1 }],
  '1,1': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  '2,1': [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 1, y: 1 }],
  '0,2': [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 1 }],
  '1,2': [{ x: 0, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 1 }],
  '2,2': [{ x: 2, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 1 }]
};

// Lignes gagnantes (3 pions alignés)
export const WINNING_LINES: Position[][] = [
  // Lignes horizontales
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
  [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  // Lignes verticales
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
  [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
  // Diagonales
  [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
  [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }]
];

export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

export function getPositionKey(position: Position): string {
  return `${position.x},${position.y}`;
}

export function isValidPosition(position: Position): boolean {
  return VALID_POSITIONS.some(pos => positionsEqual(pos, position));
}

export function isPositionOccupied(position: Position, pieces: GamePiece[]): boolean {
  return pieces.some(piece => 
    piece.isPlaced && positionsEqual(piece.position, position)
  );
}

export function canMoveTo(from: Position, to: Position, pieces: GamePiece[]): boolean {
  if (!isValidPosition(to) || isPositionOccupied(to, pieces)) {
    return false;
  }

  const fromKey = getPositionKey(from);
  const connections = CONNECTIONS[fromKey] || [];
  
  return connections.some(pos => positionsEqual(pos, to));
}

export function checkWinner(pieces: GamePiece[]): 1 | 2 | null {
  for (const line of WINNING_LINES) {
    const piecesOnLine = line.map(pos => 
      pieces.find(piece => 
        piece.isPlaced && positionsEqual(piece.position, pos)
      )
    ).filter(Boolean);

    if (piecesOnLine.length === 3) {
      const playerId = piecesOnLine[0]?.playerId;
      if (piecesOnLine.every(piece => piece?.playerId === playerId)) {
        return playerId as 1 | 2;
      }
    }
  }

  return null;
}

export function getPlayerPieces(playerId: 1 | 2, pieces: GamePiece[]): GamePiece[] {
  return pieces.filter(piece => piece.playerId === playerId);
}

export function getPlacedPieces(playerId: 1 | 2, pieces: GamePiece[]): GamePiece[] {
  return pieces.filter(piece => piece.playerId === playerId && piece.isPlaced);
}

export function canPlayerMove(playerId: 1 | 2, pieces: GamePiece[]): boolean {
  const playerPieces = getPlacedPieces(playerId, pieces);
  
  for (const piece of playerPieces) {
    const fromKey = getPositionKey(piece.position);
    const connections = CONNECTIONS[fromKey] || [];
    
    for (const connection of connections) {
      if (!isPositionOccupied(connection, pieces)) {
        return true;
      }
    }
  }
  
  return false;
}

export function getAllValidMoves(playerId: 1 | 2, pieces: GamePiece[]): Array<{from: Position, to: Position}> {
  const moves: Array<{from: Position, to: Position}> = [];
  const playerPieces = getPlacedPieces(playerId, pieces);
  
  for (const piece of playerPieces) {
    const fromKey = getPositionKey(piece.position);
    const connections = CONNECTIONS[fromKey] || [];
    
    for (const connection of connections) {
      if (!isPositionOccupied(connection, pieces)) {
        moves.push({ from: piece.position, to: connection });
      }
    }
  }
  
  return moves;
}
