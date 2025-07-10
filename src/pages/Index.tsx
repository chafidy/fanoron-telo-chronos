import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GameBoard } from '../components/GameBoard';
import { Timer } from '../components/Timer';
import { ScoreBoard } from '../components/ScoreBoard';
import { PlayerCustomization } from '../components/PlayerCustomization';
import { GameHistory } from '../components/GameHistory';
import { GameRules } from '../components/GameRules';
import { VictoryModal } from '../components/VictoryModal';
import { Copyright } from '../components/Copyright';
import { 
  GameState, 
  GamePiece, 
  Player, 
  Position, 
  GameHistory as GameHistoryType,
  GameSettings 
} from '../types/game';
import { 
  checkWinner, 
  canMoveTo, 
  getPlayerPieces, 
  getPlacedPieces,
  positionsEqual,
  getAllValidMoves,
  canPlayerMove
} from '../utils/gameLogic';
import { 
  loadGameHistory, 
  savePlayerSettings, 
  loadPlayerSettings, 
  addGameToHistory,
  clearGameHistory,
  loadScores,
  saveScores,
  resetScores
} from '../utils/storage';
import { 
  Play, 
  Users, 
  BookOpen, 
  History, 
  Home, 
  RotateCcw, 
  Settings,
  Timer as TimerIcon,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type GameScreen = 'menu' | 'customization' | 'game' | 'history' | 'rules';

const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: 'Joueur 1', color: '#FA7070', score: 0 },
  { id: 2, name: 'Joueur 2', color: '#4A90E2', score: 0 }
];

const DEFAULT_SETTINGS: GameSettings = {
  turnTimeLimit: 60, // 60 secondes par défaut
};

const Index = () => {
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu');
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryType[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  useEffect(() => {
    const savedPlayers = loadPlayerSettings();
    if (savedPlayers.length === 2) {
      const scores = loadScores();
      setPlayers([
        { ...savedPlayers[0], score: scores.player1 },
        { ...savedPlayers[1], score: scores.player2 }
      ]);
    }
    setGameHistory(loadGameHistory());
  }, []);

  const initializeGame = useCallback(() => {
    const pieces: GamePiece[] = [];
    
    for (let playerId = 1; playerId <= 2; playerId++) {
      for (let i = 0; i < 3; i++) {
        pieces.push({
          id: `p${playerId}-${i}`,
          playerId: playerId as 1 | 2,
          position: { x: -1, y: -1 },
          isPlaced: false
        });
      }
    }

    const newGameState: GameState = {
      phase: 'placement',
      status: 'playing',
      currentPlayer: 1,
      pieces,
      turnStartTime: Date.now(),
      totalGameTime: 0
    };

    setGameState(newGameState);
    setSelectedPiece(null);
    setGameStartTime(Date.now());
    setTurnCount(0);
    setCurrentScreen('game');
  }, []);

  const handlePositionClick = useCallback((position: Position) => {
    if (!gameState || gameState.status !== 'playing') return;

    const currentPlayerPieces = getPlayerPieces(gameState.currentPlayer, gameState.pieces);
    const unplacedPieces = currentPlayerPieces.filter(p => !p.isPlaced);
    const isPositionOccupied = gameState.pieces.some(p => 
      p.isPlaced && positionsEqual(p.position, position)
    );

    if (gameState.phase === 'placement') {
      if (isPositionOccupied) {
        toast({
          title: "Position occupée",
          description: "Cette intersection est déjà occupée par un pion.",
          variant: "destructive"
        });
        return;
      }

      if (unplacedPieces.length === 0) return;

      const pieceToPlace = unplacedPieces[0];
      const updatedPieces = gameState.pieces.map(piece =>
        piece.id === pieceToPlace.id
          ? { ...piece, position, isPlaced: true }
          : piece
      );

      const allPlaced = updatedPieces.every(p => p.isPlaced);
      const nextPlayer = gameState.currentPlayer === 1 ? 2 : 1;

      setGameState({
        ...gameState,
        pieces: updatedPieces,
        phase: allPlaced ? 'movement' : 'placement',
        currentPlayer: nextPlayer,
        turnStartTime: Date.now()
      });
      setTurnCount(prev => prev + 1);

    } else {
      const clickedPiece = gameState.pieces.find(p =>
        p.isPlaced && positionsEqual(p.position, position)
      );

      if (clickedPiece && clickedPiece.playerId === gameState.currentPlayer) {
        setSelectedPiece(clickedPiece);
      } else if (selectedPiece && !isPositionOccupied) {
        if (canMoveTo(selectedPiece.position, position, gameState.pieces)) {
          const updatedPieces = gameState.pieces.map(piece =>
            piece.id === selectedPiece.id
              ? { ...piece, position }
              : piece
          );

          const winner = checkWinner(updatedPieces);
          const nextPlayer = gameState.currentPlayer === 1 ? 2 : 1;

          setGameState({
            ...gameState,
            pieces: updatedPieces,
            status: winner ? 'won' : 'playing',
            winner,
            currentPlayer: nextPlayer,
            turnStartTime: Date.now()
          });
          setSelectedPiece(null);
          setTurnCount(prev => prev + 1);

          if (winner) {
            handleGameEnd(winner);
          }
        } else {
          toast({
            title: "Mouvement invalide",
            description: "Vous ne pouvez déplacer le pion que vers une intersection adjacente libre.",
            variant: "destructive"
          });
        }
      }
    }
  }, [gameState, selectedPiece, toast]);

  const handleGameEnd = useCallback((winner: 1 | 2) => {
    const winnerPlayer = players.find(p => p.id === winner)!;
    const loserPlayer = players.find(p => p.id !== winner)!;
    const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);

    const updatedPlayers = players.map(player =>
      player.id === winner ? { ...player, score: player.score + 1 } : player
    );
    setPlayers(updatedPlayers);
    saveScores(
      updatedPlayers.find(p => p.id === 1)!.score,
      updatedPlayers.find(p => p.id === 2)!.score
    );

    addGameToHistory({
      date: new Date(),
      winner: winnerPlayer,
      loser: loserPlayer,
      duration: gameDuration,
      totalTurns: turnCount
    });
    setGameHistory(loadGameHistory());

    setShowVictoryModal(true);

    toast({
      title: `🎉 ${winnerPlayer.name} gagne !`,
      description: `Partie terminée en ${Math.floor(gameDuration / 60)}:${(gameDuration % 60).toString().padStart(2, '0')}`,
    });
  }, [players, gameStartTime, turnCount, toast]);

  const handleTimeUp = useCallback(() => {
    if (!gameState) return;
    
    const loser = gameState.currentPlayer;
    const winner = loser === 1 ? 2 : 1;
    
    toast({
      title: "Temps écoulé !",
      description: `${players.find(p => p.id === loser)?.name} a dépassé le temps limite.`,
      variant: "destructive"
    });
    
    handleGameEnd(winner);
  }, [gameState, players, handleGameEnd, toast]);

  const handlePlayersUpdate = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    savePlayerSettings(updatedPlayers);
  };

  const handleResetScores = () => {
    const resetPlayers = players.map(p => ({ ...p, score: 0 }));
    setPlayers(resetPlayers);
    resetScores();
    toast({
      title: "Scores réinitialisés",
      description: "Les scores ont été remis à zéro."
    });
  };

  const handleClearHistory = () => {
    clearGameHistory();
    setGameHistory([]);
    toast({
      title: "Historique vidé",
      description: "L'historique des parties a été supprimé."
    });
  };

  const getValidMoves = useCallback((): Position[] => {
    if (!gameState || !selectedPiece || gameState.phase !== 'movement') {
      return [];
    }
    
    return getAllValidMoves(selectedPiece.playerId, gameState.pieces)
      .filter(move => positionsEqual(move.from, selectedPiece.position))
      .map(move => move.to);
  }, [gameState, selectedPiece]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'customization':
        return (
          <PlayerCustomization
            players={players}
            onPlayersUpdate={handlePlayersUpdate}
            onStartGame={initializeGame}
          />
        );

      case 'history':
        return (
          <GameHistory
            history={gameHistory}
            onClearHistory={handleClearHistory}
            onBack={() => setCurrentScreen('menu')}
          />
        );

      case 'rules':
        return (
          <GameRules onBack={() => setCurrentScreen('menu')} />
        );

      case 'game':
        if (!gameState) return null;

        const currentPlayerInfo = players.find(p => p.id === gameState.currentPlayer)!;
        const otherPlayerInfo = players.find(p => p.id !== gameState.currentPlayer)!;

        return (
          <div className="min-h-screen p-2 sm:p-4">
            <div className="max-w-6xl mx-auto mb-4 sm:mb-6">
              {/* Mobile layout - stacked */}
              <div className="block sm:hidden space-y-3 mb-4">
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: currentPlayerInfo.color }}
                        />
                        <div>
                          <div className="font-semibold text-sm">{currentPlayerInfo.name}</div>
                          <div className="text-xs text-gray-600">
                            {gameState.phase === 'placement' ? 'Place tes pions' : 'À ton tour'}
                          </div>
                        </div>
                      </div>
                      <Timer
                        startTime={gameState.turnStartTime}
                        timeLimit={gameSettings.turnTimeLimit}
                        onTimeUp={handleTimeUp}
                        isActive={gameState.status === 'playing'}
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Desktop layout - grid */}
              <div className="hidden sm:grid lg:grid-cols-3 gap-4 mb-4">
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: currentPlayerInfo.color }}
                      />
                      <div>
                        <div className="font-semibold">{currentPlayerInfo.name}</div>
                        <div className="text-sm text-gray-600">
                          {gameState.phase === 'placement' ? 'Place tes pions' : 'À ton tour'}
                        </div>
                      </div>
                      {currentPlayerInfo.avatar && (
                        <span className="text-lg ml-auto">{currentPlayerInfo.avatar}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4 flex justify-center">
                    <Timer
                      startTime={gameState.turnStartTime}
                      timeLimit={gameSettings.turnTimeLimit}
                      onTimeUp={handleTimeUp}
                      isActive={gameState.status === 'playing'}
                      className="text-center"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="font-semibold text-lg">
                      {gameState.phase === 'placement' ? 'Placement' : 'Déplacement'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Tour {turnCount + 1}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile buttons - more compact */}
              <div className="flex flex-wrap justify-center gap-2 mb-4 sm:gap-3">
                <Button
                  onClick={() => setCurrentScreen('menu')}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Menu
                </Button>
                <Button
                  onClick={initializeGame}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Nouvelle
                </Button>
                <Button
                  onClick={() => setCurrentScreen('rules')}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Règles
                </Button>
              </div>
            </div>

            {/* Game layout - responsive */}
            <div className="max-w-6xl mx-auto">
              {/* Mobile layout - stacked */}
              <div className="block lg:hidden space-y-4">
                <div className="flex justify-center">
                  <GameBoard
                    pieces={gameState.pieces}
                    onPositionClick={handlePositionClick}
                    selectedPiece={selectedPiece}
                    validMoves={getValidMoves()}
                    player1Color={players[0].color}
                    player2Color={players[1].color}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ScoreBoard
                    players={players}
                    onResetScores={handleResetScores}
                  />
                  
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Adversaire</h3>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: otherPlayerInfo.color }}
                        />
                        <div>
                          <div className="font-medium">{otherPlayerInfo.name}</div>
                          <div className="text-sm text-gray-600">
                            Score: {otherPlayerInfo.score}
                          </div>
                        </div>
                        {otherPlayerInfo.avatar && (
                          <span className="text-lg ml-auto">{otherPlayerInfo.avatar}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Desktop layout - grid */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <ScoreBoard
                    players={players}
                    onResetScores={handleResetScores}
                  />
                </div>

                <div className="lg:col-span-2">
                  <GameBoard
                    pieces={gameState.pieces}
                    onPositionClick={handlePositionClick}
                    selectedPiece={selectedPiece}
                    validMoves={getValidMoves()}
                    player1Color={players[0].color}
                    player2Color={players[1].color}
                  />
                </div>

                <div className="lg:col-span-1">
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Adversaire</h3>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: otherPlayerInfo.color }}
                        />
                        <div>
                          <div className="font-medium">{otherPlayerInfo.name}</div>
                          <div className="text-sm text-gray-600">
                            Score: {otherPlayerInfo.score}
                          </div>
                        </div>
                        {otherPlayerInfo.avatar && (
                          <span className="text-lg ml-auto">{otherPlayerInfo.avatar}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {showVictoryModal && gameState.winner && (
              <VictoryModal
                isOpen={showVictoryModal}
                winner={players.find(p => p.id === gameState.winner)!}
                gameDuration={Math.floor((Date.now() - gameStartTime) / 1000)}
                onPlayAgain={() => {
                  setShowVictoryModal(false);
                  initializeGame();
                }}
                onBackToMenu={() => {
                  setShowVictoryModal(false);
                  setCurrentScreen('menu');
                }}
              />
            )}
          </div>
        );

      default: // menu
        return (
          <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
            <div className="max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src="/lovable-uploads/3d15f755-165e-4895-9a3c-997698489bba.png"
                  alt="Fanoron-telo"
                  className="mx-auto mb-4 max-w-xs sm:max-w-md w-full h-auto"
                />
                <p className="text-lg sm:text-xl text-gray-600 mb-2">
                  Jeu traditionnel malgache
                </p>
                <p className="text-sm sm:text-base text-gray-500">
                  Alignez vos 3 pions pour remporter la victoire
                </p>
              </motion.div>

              {players.some(p => p.score > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold mb-3 flex items-center justify-center gap-2 text-sm sm:text-base">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                        Scores actuels
                      </h3>
                      <div className="flex justify-center gap-6 sm:gap-8">
                        {players.map(player => (
                          <div key={player.id} className="text-center">
                            <div
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm mx-auto mb-2"
                              style={{ backgroundColor: player.color }}
                            />
                            <div className="font-medium text-sm sm:text-base">{player.name}</div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-700">
                              {player.score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                <Button
                  onClick={() => setCurrentScreen('customization')}
                  size="lg"
                  className="h-14 sm:h-16 bg-wood hover:bg-wood-dark text-white shadow-lg"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">Jouer</div>
                    <div className="text-xs sm:text-sm opacity-90">Nouvelle partie</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCurrentScreen('customization')}
                  variant="outline"
                  size="lg"
                  className="h-14 sm:h-16 bg-white/80 backdrop-blur-sm"
                >
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">Personnaliser</div>
                    <div className="text-xs sm:text-sm opacity-70">Joueurs & couleurs</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCurrentScreen('history')}
                  variant="outline"
                  size="lg"
                  className="h-14 sm:h-16 bg-white/80 backdrop-blur-sm"
                >
                  <History className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">Historique</div>
                    <div className="text-xs sm:text-sm opacity-70">{gameHistory.length} parties</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCurrentScreen('rules')}
                  variant="outline"
                  size="lg"
                  className="h-14 sm:h-16 bg-white/80 backdrop-blur-sm"
                >
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">Règles</div>
                    <div className="text-xs sm:text-sm opacity-70">Comment jouer</div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-wood font-comfortaa">
      {renderScreen()}
      <Copyright />
    </div>
  );
};

export default Index;
