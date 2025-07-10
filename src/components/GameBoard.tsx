
import React from 'react';
import { GamePiece, Position } from '../types/game';
import { VALID_POSITIONS, CONNECTIONS, positionsEqual, getPositionKey } from '../utils/gameLogic';

interface GameBoardProps {
  pieces: GamePiece[];
  onPositionClick: (position: Position) => void;
  selectedPiece?: GamePiece;
  validMoves: Position[];
  player1Color: string;
  player2Color: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  pieces,
  onPositionClick,
  selectedPiece,
  validMoves,
  player1Color,
  player2Color
}) => {
  const BOARD_SIZE = 400; // Agrandi de 300 à 400
  const GRID_SIZE = BOARD_SIZE / 2;
  
  const getScreenPosition = (pos: Position) => ({
    x: pos.x * GRID_SIZE,
    y: pos.y * GRID_SIZE
  });

  const renderConnections = () => {
    const lines: JSX.Element[] = [];
    const drawnConnections = new Set<string>();

    VALID_POSITIONS.forEach(pos => {
      const posKey = getPositionKey(pos);
      const connections = CONNECTIONS[posKey] || [];
      const startScreen = getScreenPosition(pos);

      connections.forEach(connection => {
        const endScreen = getScreenPosition(connection);
        const connectionKey = [posKey, getPositionKey(connection)].sort().join('-');
        
        if (!drawnConnections.has(connectionKey)) {
          drawnConnections.add(connectionKey);
          lines.push(
            <line
              key={connectionKey}
              x1={startScreen.x}
              y1={startScreen.y}
              x2={endScreen.x}
              y2={endScreen.y}
              stroke="#8B7355"
              strokeWidth="4"
              opacity="0.8"
            />
          );
        }
      });
    });

    return lines;
  };

  const renderIntersections = () => {
    return VALID_POSITIONS.map(pos => {
      const screenPos = getScreenPosition(pos);
      const piece = pieces.find(p => p.isPlaced && positionsEqual(p.position, pos));
      const isValidMove = validMoves.some(move => positionsEqual(move, pos));
      const isSelected = selectedPiece && positionsEqual(selectedPiece.position, pos);

      return (
        <g key={getPositionKey(pos)}>
          {/* Zone de clic plus large pour améliorer l'UX */}
          <circle
            cx={screenPos.x}
            cy={screenPos.y}
            r="25"
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onPositionClick(pos)}
          />
          
          {/* Intersection de base - plus grosse et fixe */}
          <circle
            cx={screenPos.x}
            cy={screenPos.y}
            r="12"
            fill={piece ? 'transparent' : '#D4C5B9'}
            stroke="#8B7355"
            strokeWidth="3"
            className="board-intersection"
            style={{ pointerEvents: 'none' }}
          />
          
          {/* Indicateur de mouvement valide */}
          {isValidMove && !piece && (
            <circle
              cx={screenPos.x}
              cy={screenPos.y}
              r="16"
              fill="rgba(74, 144, 226, 0.3)"
              stroke="#4A90E2"
              strokeWidth="3"
              className="animate-pulse"
              style={{ pointerEvents: 'none' }}
            />
          )}
          
          {/* Pion */}
          {piece && (
            <circle
              cx={screenPos.x}
              cy={screenPos.y}
              r="20"
              fill={piece.playerId === 1 ? player1Color : player2Color}
              stroke={isSelected ? "#FFD700" : "#fff"}
              strokeWidth={isSelected ? "4" : "3"}
              className={`stone-piece ${isSelected ? 'animate-pulse-glow' : ''}`}
              style={{
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
                pointerEvents: 'none'
              }}
            />
          )}
        </g>
      );
    });
  };

  return (
    <div className="flex justify-center items-center p-6">
      <div className="wood-texture p-8 rounded-2xl shadow-xl">
        <svg
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
          className="bg-transparent"
        >
          {/* Connexions (lignes du plateau) */}
          {renderConnections()}
          
          {/* Intersections et pions */}
          {renderIntersections()}
        </svg>
      </div>
    </div>
  );
};
