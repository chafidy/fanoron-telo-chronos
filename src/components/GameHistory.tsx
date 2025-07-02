
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameHistory as GameHistoryType } from '../types/game';
import { Trophy, Clock, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GameHistoryProps {
  history: GameHistoryType[];
  onClearHistory: () => void;
  onBack: () => void;
}

export const GameHistory: React.FC<GameHistoryProps> = ({
  history,
  onClearHistory,
  onBack
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getWinRate = (playerName: string) => {
    const totalGames = history.length;
    const wins = history.filter(game => game.winner.name === playerName).length;
    return totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  };

  const getAllPlayers = () => {
    const players = new Set<string>();
    history.forEach(game => {
      players.add(game.winner.name);
      players.add(game.loser.name);
    });
    return Array.from(players);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Historique des Parties
        </h2>
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline">
            Retour
          </Button>
          {history.length > 0 && (
            <Button 
              onClick={onClearHistory} 
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Vider l'historique
            </Button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">
              Aucune partie jouée pour le moment
            </p>
            <p className="text-gray-500 mt-2">
              Commencez une partie pour voir votre historique ici !
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistiques */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{history.length}</div>
                <div className="text-sm text-gray-600">Parties jouées</div>
              </CardContent>
            </Card>
            
            {getAllPlayers().slice(0, 2).map(playerName => (
              <Card key={playerName} className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getWinRate(playerName)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Victoires de {playerName}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Liste des parties */}
          <div className="space-y-4">
            {history.map((game, index) => (
              <Card key={game.id} className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-xl">🏆</div>
                      <div>
                        <div className="font-semibold text-lg">
                          <span style={{ color: game.winner.color }}>
                            {game.winner.name}
                          </span>
                          {' vs '}
                          <span style={{ color: game.loser.color }}>
                            {game.loser.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(game.date, 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(game.duration)}
                          </div>
                          <div>
                            {game.totalTurns} tours
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Partie #{history.length - index}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
