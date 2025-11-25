import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { GameBoard } from '@/components/GameBoard';
import { ScoreBoard } from '@/components/ScoreBoard';
import { VictoryModal } from '@/components/VictoryModal';
import { Timer } from '@/components/Timer';
import { GameState, GamePiece, Player, Position } from '@/types/game';
import { isValidPosition, isPositionOccupied, canMoveTo, checkWinner } from '@/utils/gameLogic';
import { Loader2 } from 'lucide-react';

const OnlineGame: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<GamePiece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  useEffect(() => {
    if (!gameId) {
      navigate('/');
      return;
    }

    loadGame();

    // Subscribe to game changes
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          if (payload.new) {
            const game = payload.new as any;
            updateGameState(game);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const loadGame = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load game data
      const { data: game, error: gameError } = await supabase
        .from('online_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      // Load participants
      const { data: participants, error: participantsError } = await supabase
        .from('game_participants')
        .select('*, profiles(*)')
        .eq('game_id', gameId);

      if (participantsError) throw participantsError;

      // Find my player number
      const myParticipant = participants?.find(p => p.user_id === user.id);
      if (!myParticipant) {
        toast({
          title: "Erreur",
          description: "Vous n'êtes pas dans cette partie",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setMyPlayerNumber(myParticipant.player_number);

      // Set up players
      const playersData: Player[] = participants.map(p => ({
        id: p.player_number as 1 | 2,
        name: p.profiles?.username || `Joueur ${p.player_number}`,
        color: p.color,
        score: 0,
        avatar: p.profiles?.avatar || undefined
      }));

      setPlayers(playersData);
      updateGameState(game);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading game:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      navigate('/');
    }
  };

  const updateGameState = (game: any) => {
    const state: GameState = {
      phase: game.phase || 'placement',
      status: game.status === 'completed' ? 'won' : 'playing',
      currentPlayer: game.current_player || 1,
      pieces: game.game_state?.pieces || [],
      winner: game.winner,
      turnStartTime: game.game_state?.turnStartTime || Date.now(),
      totalGameTime: game.game_state?.totalGameTime || 0,
      gameMode: 'human'
    };
    setGameState(state);
  };

  const updateGame = async (updates: Partial<GameState>) => {
    if (!gameState) return;

    const newState = { ...gameState, ...updates };
    
    try {
      const { error } = await supabase
        .from('online_games')
        .update({
          current_player: newState.currentPlayer,
          phase: newState.phase,
          status: newState.status === 'won' ? 'completed' : 'in_progress',
          winner: newState.winner,
          game_state: {
            pieces: newState.pieces,
            turnStartTime: newState.turnStartTime,
            totalGameTime: newState.totalGameTime
          } as any
        })
        .eq('id', gameId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating game:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la partie",
        variant: "destructive",
      });
    }
  };

  const handlePositionClick = (position: Position) => {
    if (!gameState || gameState.currentPlayer !== myPlayerNumber) {
      toast({
        title: "Pas votre tour",
        description: "Attendez que l'adversaire joue",
      });
      return;
    }

    if (gameState.phase === 'placement') {
      handlePlacement(position);
    } else {
      handleMovement(position);
    }
  };

  const handlePlacement = (position: Position) => {
    if (!gameState) return;

    if (!isValidPosition(position) || isPositionOccupied(position, gameState.pieces)) {
      toast({
        title: "Position invalide",
        description: "Choisissez une position valide",
        variant: "destructive",
      });
      return;
    }

    const playerPieces = gameState.pieces.filter(p => p.playerId === gameState.currentPlayer);
    if (playerPieces.filter(p => p.isPlaced).length >= 9) return;

    const newPiece: GamePiece = {
      id: `piece-${gameState.currentPlayer}-${Date.now()}`,
      playerId: gameState.currentPlayer,
      position,
      isPlaced: true
    };

    const newPieces = [...gameState.pieces, newPiece];
    const winner = checkWinner(newPieces);

    const allPlaced = newPieces.filter(p => p.isPlaced).length === 18;
    const newPhase = allPlaced ? 'movement' : 'placement';

    updateGame({
      pieces: newPieces,
      currentPlayer: gameState.currentPlayer === 1 ? 2 : 1,
      phase: newPhase as 'placement' | 'movement',
      winner: winner || undefined,
      status: winner ? 'won' : 'playing',
      turnStartTime: Date.now()
    });
  };

  const handleMovement = (position: Position) => {
    if (!gameState) return;

    if (!selectedPiece) {
      const piece = gameState.pieces.find(
        p => p.playerId === gameState.currentPlayer &&
             p.position.x === position.x &&
             p.position.y === position.y
      );

      if (piece) {
        setSelectedPiece(piece);
        const moves: Position[] = [];
        // Calculate valid moves
        setValidMoves(moves);
      }
    } else {
      if (canMoveTo(selectedPiece.position, position, gameState.pieces)) {
        const newPieces = gameState.pieces.map(p =>
          p.id === selectedPiece.id ? { ...p, position } : p
        );

        const winner = checkWinner(newPieces);

        updateGame({
          pieces: newPieces,
          currentPlayer: gameState.currentPlayer === 1 ? 2 : 1,
          winner: winner || undefined,
          status: winner ? 'won' : 'playing',
          turnStartTime: Date.now()
        });

        setSelectedPiece(null);
        setValidMoves([]);
      }
    }
  };

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === gameState.currentPlayer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <ScoreBoard
          players={players}
          onResetScores={() => {}}
        />

        <Timer
          isActive={gameState.status === 'playing'}
          startTime={gameState.turnStartTime}
        />

        <GameBoard
          pieces={gameState.pieces}
          onPositionClick={handlePositionClick}
          selectedPiece={selectedPiece}
          validMoves={validMoves}
          player1Color={players[0]?.color || '#3B82F6'}
          player2Color={players[1]?.color || '#EF4444'}
        />

        {gameState.status === 'won' && gameState.winner && (
          <VictoryModal
            isOpen={true}
            winner={players.find(p => p.id === gameState.winner)!}
            gameDuration={Math.floor(gameState.totalGameTime / 1000)}
            onPlayAgain={() => navigate('/')}
            onBackToMenu={() => navigate('/')}
          />
        )}
      </div>
    </div>
  );
};

export default OnlineGame;
