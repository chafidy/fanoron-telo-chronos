
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
  // Responsive board size
  const BOARD_SIZE_DESKTOP = 400;
  const BOARD_SIZE_MOBILE = 280;
  
  const getScreenPosition = (pos: Position, boardSize: number) => ({
    x: pos.x * (boardSize / 2),
    y: pos.y * (boardSize / 2)
  });

  const renderConnections = (boardSize: number) => {
    const lines: JSX.Element[] = [];
    const drawnConnections = new Set<string>();

    VALID_POSITIONS.forEach(pos => {
      const posKey = getPositionKey(pos);
      const connections = CONNECTIONS[posKey] || [];
      const startScreen = getScreenPosition(pos, boardSize);

      connections.forEach(connection => {
        const endScreen = getScreenPosition(connection, boardSize);
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
              strokeWidth={boardSize < 350 ? "3" : "4"}
              opacity="0.8"
            />
          );
        }
      });
    });

    return lines;
  };

  const renderIntersections = (boardSize: number) => {
    const isMobile = boardSize < 350;
    const clickRadius = isMobile ? 20 : 25;
    const intersectionRadius = isMobile ? 10 : 12;
    const validMoveRadius = isMobile ? 14 : 16;
    const pieceRadius = isMobile ? 16 : 20;
    const strokeWidth = isMobile ? 2 : 3;

    return VALID_POSITIONS.map(pos => {
      const screenPos = getScreenPosition(pos, boardSize);
      const piece = pieces.find(p => p.isPlaced && positionsEqual(p.position, pos));
      const isValidMove = validMoves.some(move => positionsEqual(move, pos));
      const isSelected = selectedPiece && positionsEqual(selectedPiece.position, pos);

      return (
        <g key={getPositionKey(pos)}>
          {/* Zone de clic plus large pour améliorer l'UX */}
          <circle
            cx={screenPos.x}
            cy={screenPos.y}
            r={clickRadius}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onPositionClick(pos)}
          />
          
          {/* Intersection de base */}
          <circle
            cx={screenPos.x}
            cy={screenPos.y}
            r={intersectionRadius}
            fill={piece ? 'transparent' : '#D4C5B9'}
            stroke="#8B7355"
            strokeWidth={strokeWidth}
            className="board-intersection"
            style={{ pointerEvents: 'none' }}
          />
          
          {/* Indicateur de mouvement valide */}
          {isValidMove && !piece && (
            <circle
              cx={screenPos.x}
              cy={screenPos.y}
              r={validMoveRadius}
              fill="rgba(74, 144, 226, 0.3)"
              stroke="#4A90E2"
              strokeWidth={strokeWidth}
              className="animate-pulse"
              style={{ pointerEvents: 'none' }}
            />
          )}
          
          {/* Pion */}
          {piece && (
            <circle
              cx={screenPos.x}
              cy={screenPos.y}
              r={pieceRadius}
              fill={piece.playerId === 1 ? player1Color : player2Color}
              stroke={isSelected ? "#FFD700" : "#fff"}
              strokeWidth={isSelected ? (isMobile ? "3" : "4") : strokeWidth}
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
    <div className="flex justify-center items-center p-2 sm:p-6">
      <div className="wood-texture p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl">
        {/* Desktop version */}
        <svg
          width={BOARD_SIZE_DESKTOP}
          height={BOARD_SIZE_DESKTOP}
          viewBox={`0 0 ${BOARD_SIZE_DESKTOP} ${BOARD_SIZE_DESKTOP}`}
          className="bg-transparent hidden sm:block"
        >
          {renderConnections(BOARD_SIZE_DESKTOP)}
          {renderIntersections(BOARD_SIZE_DESKTOP)}
        </svg>
        
        {/* Mobile version */}
        <svg
          width={BOARD_SIZE_MOBILE}
          height={BOARD_SIZE_MOBILE}
          viewBox={`0 0 ${BOARD_SIZE_MOBILE} ${BOARD_SIZE_MOBILE}`}
          className="bg-transparent block sm:hidden"
        >
          {renderConnections(BOARD_SIZE_MOBILE)}
          {renderIntersections(BOARD_SIZE_MOBILE)}
        </svg>
      </div>
    </div>
  );
};
