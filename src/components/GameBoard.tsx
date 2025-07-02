
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
  const BOARD_SIZE = 300;
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
              strokeWidth="3"
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
          {/* Intersection de base */}
          <circle
            cx={screenPos.x}
            cy={screenPos.y}
            r="8"
            fill={piece ? 'transparent' : '#D4C5B9'}
            stroke="#8B7355"
            strokeWidth="2"
            className="board-intersection cursor-pointer"
            onClick={() => onPositionClick(pos)}
          />
          
          {/* Indicateur de mouvement valide */}
          {isValidMove && !piece && (
            <circle
              cx={screenPos.x}
              cy={screenPos.y}
              r="12"
              fill="rgba(74, 144, 226, 0.3)"
              stroke="#4A90E2"
              strokeWidth="2"
              className="animate-pulse cursor-pointer"
              onClick={() => onPositionClick(pos)}
            />
          )}
          
          {/* Pion */}
          {piece && (
            <circle
              cx={screenPos.x}
              cy={screenPos.y}
              r="16"
              fill={piece.playerId === 1 ? player1Color : player2Color}
              stroke={isSelected ? "#FFD700" : "#fff"}
              strokeWidth={isSelected ? "4" : "2"}
              className={`stone-piece cursor-pointer ${isSelected ? 'animate-pulse-glow' : ''}`}
              onClick={() => onPositionClick(pos)}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            />
          )}
        </g>
      );
    });
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className="wood-texture p-6 rounded-2xl shadow-xl">
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
