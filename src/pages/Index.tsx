
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
  Timer as TimerIcon
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

  // Chargement initial
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

  // Initialisation d'une nouvelle partie
  const initializeGame = useCallback(() => {
    const pieces: GamePiece[] = [];
    
    // Créer 3 pions pour chaque joueur
    for (let playerId = 1; playerId <= 2; playerId++) {
      for (let i = 0; i < 3; i++) {
        pieces.push({
          id: `p${playerId}-${i}`,
          playerId: playerId as 1 | 2,
          position: { x: -1, y: -1 }, // Position hors plateau
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

  // Gestion des clics sur le plateau
  const handlePositionClick = useCallback((position: Position) => {
    if (!gameState || gameState.status !== 'playing') return;

    const currentPlayerPieces = getPlayerPieces(gameState.currentPlayer, gameState.pieces);
    const unplacedPieces = currentPlayerPieces.filter(p => !p.isPlaced);
    const isPositionOccupied = gameState.pieces.some(p => 
      p.isPlaced && positionsEqual(p.position, position)
    );

    if (gameState.phase === 'placement') {
      // Phase de placement
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

      // Vérifier si tous les pions sont placés
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
      // Phase de mouvement
      const clickedPiece = gameState.pieces.find(p =>
        p.isPlaced && positionsEqual(p.position, position)
      );

      if (clickedPiece && clickedPiece.playerId === gameState.currentPlayer) {
        // Sélectionner un pion du joueur actuel
        setSelectedPiece(clickedPiece);
      } else if (selectedPiece && !isPositionOccupied) {
        // Déplacer le pion sélectionné
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

  // Fin de partie
  const handleGameEnd = useCallback((winner: 1 | 2) => {
    const winnerPlayer = players.find(p => p.id === winner)!;
    const loserPlayer = players.find(p => p.id !== winner)!;
    const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);

    // Mettre à jour le score
    const updatedPlayers = players.map(player =>
      player.id === winner ? { ...player, score: player.score + 1 } : player
    );
    setPlayers(updatedPlayers);
    saveScores(
      updatedPlayers.find(p => p.id === 1)!.score,
      updatedPlayers.find(p => p.id === 2)!.score
    );

    // Ajouter à l'historique
    addGameToHistory({
      date: new Date(),
      winner: winnerPlayer,
      loser: loserPlayer,
      duration: gameDuration,
      totalTurns: turnCount
    });
    setGameHistory(loadGameHistory());

    // Afficher la modale de victoire
    setShowVictoryModal(true);

    toast({
      title: `🎉 ${winnerPlayer.name} gagne !`,
      description: `Partie terminée en ${Math.floor(gameDuration / 60)}:${(gameDuration % 60).toString().padStart(2, '0')}`,
    });
  }, [players, gameStartTime, turnCount, toast]);

  // Gestion du timeout
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

  // Actions du jeu
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

  // Calcul des mouvements valides
  const getValidMoves = useCallback((): Position[] => {
    if (!gameState || !selectedPiece || gameState.phase !== 'movement') {
      return [];
    }
    
    return getAllValidMoves(selectedPiece.playerId, gameState.pieces)
      .filter(move => positionsEqual(move.from, selectedPiece.position))
      .map(move => move.to);
  }, [gameState, selectedPiece]);

  // Rendu des écrans
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
          <div className="min-h-screen p-4">
            {/* Header avec informations de jeu */}
            <div className="max-w-6xl mx-auto mb-6">
              <div className="grid lg:grid-cols-3 gap-4 mb-4">
                {/* Joueur actuel */}
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

                {/* Timer */}
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

                {/* Phase de jeu */}
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

              {/* Actions */}
              <div className="flex justify-center gap-3 mb-4">
                <Button
                  onClick={() => setCurrentScreen('menu')}
                  variant="outline"
                  size="sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Menu
                </Button>
                <Button
                  onClick={initializeGame}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Nouvelle partie
                </Button>
                <Button
                  onClick={() => setCurrentScreen('rules')}
                  variant="outline"
                  size="sm"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Règles
                </Button>
              </div>
            </div>

            {/* Zone de jeu */}
            <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-6">
              {/* Tableau des scores */}
              <div className="lg:col-span-1">
                <ScoreBoard
                  players={players}
                  onResetScores={handleResetScores}
                />
              </div>

              {/* Plateau de jeu */}
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

              {/* Informations adversaire */}
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

            {/* Modale de victoire */}
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
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              {/* Logo et titre */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-6xl font-bold text-gray-800 mb-4 font-comfortaa">
                  Fanoron-telo
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  Jeu traditionnel malgache
                </p>
                <p className="text-gray-500">
                  Alignez vos 3 pions pour remporter la victoire
                </p>
              </motion.div>

              {/* Scores actuels */}
              {players.some(p => p.score > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center justify-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Scores actuels
                      </h3>
                      <div className="flex justify-center gap-8">
                        {players.map(player => (
                          <div key={player.id} className="text-center">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm mx-auto mb-2"
                              style={{ backgroundColor: player.color }}
                            />
                            <div className="font-medium">{player.name}</div>
                            <div className="text-2xl font-bold text-gray-700">
                              {player.score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Menu principal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                <Button
                  onClick={() => setCurrentScreen('customization')}
                  size="lg"
                  className="h-16 bg-wood hover:bg-wood-dark text-white shadow-lg"
                >
                  <Play className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Jouer</div>
                    <div className="text-sm opacity-90">Nouvelle partie</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCurrentScreen('customization')}
                  variant="outline"
                  size="lg"
                  className="h-16 bg-white/80 backdrop-blur-sm"
                >
                  <Users className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Personnaliser</div>
                    <div className="text-sm opacity-70">Joueurs & couleurs</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCurrentScreen('history')}
                  variant="outline"
                  size="lg"
                  className="h-16 bg-white/80 backdrop-blur-sm"
                >
                  <History className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Historique</div>
                    <div className="text-sm opacity-70">{gameHistory.length} parties</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setCurrentScreen('rules')}
                  variant="outline"
                  size="lg"
                  className="h-16 bg-white/80 backdrop-blur-sm"
                >
                  <BookOpen className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Règles</div>
                    <div className="text-sm opacity-70">Comment jouer</div>
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
    </div>
  );
};

export default Index;
