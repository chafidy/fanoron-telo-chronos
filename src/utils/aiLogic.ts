import { GameState, GamePiece, Position, ValidMove } from '../types/game';
import { 
  canMoveTo, 
  getPlayerPieces, 
  checkWinner, 
  positionsEqual 
} from './gameLogic';

// Positions stratégiques du plateau (coins et centre)
const STRATEGIC_POSITIONS: Position[] = [
  { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 }, // Coins
  { x: 1, y: 1 }, // Centre
  { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 } // Côtés
];

// Lignes gagnantes possibles
const WINNING_LINES: Position[][] = [
  // Horizontales
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
  [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  // Verticales
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
  [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
  // Diagonales
  [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
  [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }]
];

export interface AIMove {
  type: 'place' | 'move';
  piece?: GamePiece;
  from?: Position;
  to: Position;
}

// Vérifie si une position est libre
function isPositionFree(position: Position, pieces: GamePiece[]): boolean {
  return !pieces.some(p => p.isPlaced && positionsEqual(p.position, position));
}

// Génère tous les mouvements valides pour un joueur
function getAllValidMoves(playerId: 1 | 2, pieces: GamePiece[]): ValidMove[] {
  const validMoves: ValidMove[] = [];
  const playerPieces = getPlayerPieces(playerId, pieces);
  
  for (const piece of playerPieces) {
    if (!piece.isPlaced) continue;
    
    // Essayer toutes les positions adjacentes
    const adjacentPositions = [
      { x: piece.position.x - 1, y: piece.position.y },
      { x: piece.position.x + 1, y: piece.position.y },
      { x: piece.position.x, y: piece.position.y - 1 },
      { x: piece.position.x, y: piece.position.y + 1 },
      { x: piece.position.x - 1, y: piece.position.y - 1 },
      { x: piece.position.x + 1, y: piece.position.y + 1 },
      { x: piece.position.x - 1, y: piece.position.y + 1 },
      { x: piece.position.x + 1, y: piece.position.y - 1 }
    ];
    
    for (const pos of adjacentPositions) {
      if (pos.x >= 0 && pos.x <= 2 && pos.y >= 0 && pos.y <= 2 && 
          isPositionFree(pos, pieces) && canMoveTo(piece.position, pos, pieces)) {
        validMoves.push({
          piece,
          from: piece.position,
          to: pos
        });
      }
    }
  }
  
  return validMoves;
}

// Trouve les positions où l'IA peut gagner immédiatement
function findWinningMove(aiPieces: GamePiece[], opponentPieces: GamePiece[], allPieces: GamePiece[]): Position | null {
  const validMoves = getAllValidMoves(2, allPieces);
  
  for (const move of validMoves) {
    // Simuler le mouvement
    const simulatedPieces = allPieces.map(p => {
      if (p.id === move.piece.id) {
        return { ...p, position: move.to };
      }
      return p;
    });
    
    if (checkWinner(simulatedPieces) === 2) {
      return move.to;
    }
  }
  
  return null;
}

// Trouve les positions où l'IA doit bloquer l'adversaire
function findBlockingMove(aiPieces: GamePiece[], opponentPieces: GamePiece[], allPieces: GamePiece[]): Position | null {
  const validMoves = getAllValidMoves(1, allPieces);
  
  for (const move of validMoves) {
    // Simuler le mouvement de l'adversaire
    const simulatedPieces = allPieces.map(p => {
      if (p.id === move.piece.id) {
        return { ...p, position: move.to };
      }
      return p;
    });
    
    if (checkWinner(simulatedPieces) === 1) {
      return move.to;
    }
  }
  
  return null;
}

// Trouve le meilleur mouvement pour la phase de placement
export function getAIPlacementMove(gameState: GameState): Position {
  const aiPieces = getPlayerPieces(2, gameState.pieces);
  const opponentPieces = getPlayerPieces(1, gameState.pieces);
  
  // 1. Chercher une position gagnante
  const winningMove = findWinningMove(aiPieces, opponentPieces, gameState.pieces);
  if (winningMove) {
    return winningMove;
  }
  
  // 2. Bloquer l'adversaire s'il peut gagner
  const blockingMove = findBlockingMove(aiPieces, opponentPieces, gameState.pieces);
  if (blockingMove) {
    return blockingMove;
  }
  
  // 3. Placer sur une position stratégique libre
  for (const position of STRATEGIC_POSITIONS) {
    if (isPositionFree(position, gameState.pieces)) {
      return position;
    }
  }
  
  // 4. Placer sur n'importe quelle position libre
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      const position = { x, y };
      if (isPositionFree(position, gameState.pieces)) {
        return position;
      }
    }
  }
  
  // Fallback (ne devrait pas arriver)
  return { x: 0, y: 0 };
}

// Trouve le meilleur mouvement pour la phase de déplacement
export function getAIMovementMove(gameState: GameState): AIMove | null {
  const aiPieces = getPlayerPieces(2, gameState.pieces);
  const opponentPieces = getPlayerPieces(1, gameState.pieces);
  const validMoves = getAllValidMoves(2, gameState.pieces);
  
  if (validMoves.length === 0) {
    return null;
  }
  
  // 1. Chercher un mouvement gagnant
  for (const move of validMoves) {
    const simulatedPieces = gameState.pieces.map(p => {
      if (p.id === move.piece.id) {
        return { ...p, position: move.to };
      }
      return p;
    });
    
    if (checkWinner(simulatedPieces) === 2) {
      return {
        type: 'move',
        piece: move.piece,
        from: move.from,
        to: move.to
      };
    }
  }
  
  // 2. Bloquer l'adversaire
  for (const move of validMoves) {
    const simulatedPieces = gameState.pieces.map(p => {
      if (p.id === move.piece.id) {
        return { ...p, position: move.to };
      }
      return p;
    });
    
    // Vérifier si ce mouvement empêche l'adversaire de gagner
    const opponentValidMoves = getAllValidMoves(1, simulatedPieces);
    let isBlocking = false;
    
    for (const opponentMove of opponentValidMoves) {
      const opponentSimulated = simulatedPieces.map(p => {
        if (p.id === opponentMove.piece.id) {
          return { ...p, position: opponentMove.to };
        }
        return p;
      });
      
      if (checkWinner(opponentSimulated) === 1) {
        isBlocking = true;
        break;
      }
    }
    
    if (isBlocking) {
      return {
        type: 'move',
        piece: move.piece,
        from: move.from,
        to: move.to
      };
    }
  }
  
  // 3. Mouvement vers position stratégique
  for (const move of validMoves) {
    for (const strategicPos of STRATEGIC_POSITIONS) {
      if (positionsEqual(move.to, strategicPos)) {
        return {
          type: 'move',
          piece: move.piece,
          from: move.from,
          to: move.to
        };
      }
    }
  }
  
  // 4. Mouvement aléatoire
  const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
  return {
    type: 'move',
    piece: randomMove.piece,
    from: randomMove.from,
    to: randomMove.to
  };
}

// Délai pour rendre les mouvements de l'IA plus naturels
export const AI_MOVE_DELAY = 1500; // 1.5 secondes