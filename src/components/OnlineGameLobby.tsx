import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnlineGameLobbyProps {
  onGameStart: (gameId: string, playerNumber: 1 | 2) => void;
  onBack: () => void;
}

interface Game {
  id: string;
  status: string;
  created_at: string;
  participant_count: number;
}

export const OnlineGameLobby: React.FC<OnlineGameLobbyProps> = ({ onGameStart, onBack }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchGames = async () => {
    try {
      const { data: gamesData, error } = await supabase
        .from('online_games')
        .select(`
          id,
          status,
          created_at,
          game_participants (count)
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGames = (gamesData || []).map((game: any) => ({
        id: game.id,
        status: game.status,
        created_at: game.created_at,
        participant_count: game.game_participants?.[0]?.count || 0
      }));

      setGames(formattedGames);
    } catch (error: any) {
      console.error('Error fetching games:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les parties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();

    // Subscribe to new games
    const channel = supabase
      .channel('online-games-lobby')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_games'
        },
        () => {
          fetchGames();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants'
        },
        () => {
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createGame = async () => {
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Create game
      const { data: game, error: gameError } = await supabase
        .from('online_games')
        .insert({
          status: 'waiting',
          current_player: 1,
          phase: 'placement'
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Join as player 1
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          game_id: game.id,
          user_id: user.id,
          player_number: 1,
          color: '#3B82F6'
        });

      if (participantError) throw participantError;

      toast({
        title: "Partie créée",
        description: "En attente d'un adversaire...",
      });

      onGameStart(game.id, 1);
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const joinGame = async (gameId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Join as player 2
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          game_id: gameId,
          user_id: user.id,
          player_number: 2,
          color: '#EF4444'
        });

      if (participantError) throw participantError;

      // Update game status
      const { error: updateError } = await supabase
        .from('online_games')
        .update({ status: 'in_progress' })
        .eq('id', gameId);

      if (updateError) throw updateError;

      toast({
        title: "Partie rejointe",
        description: "La partie commence !",
      });

      onGameStart(gameId, 2);
    } catch (error: any) {
      console.error('Error joining game:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Parties en ligne
        </h2>
        <p className="text-gray-600">
          Créez une partie ou rejoignez-en une
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={createGame}
          disabled={creating}
          className="bg-primary hover:bg-primary/90"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            'Créer une partie'
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parties disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : games.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucune partie disponible. Créez-en une !
            </p>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Partie en attente</p>
                      <p className="text-sm text-gray-500">
                        {game.participant_count}/2 joueurs
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => joinGame(game.id)}>
                    Rejoindre
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>
    </div>
  );
};
