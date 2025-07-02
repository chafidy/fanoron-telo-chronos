
import React from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { Player } from '../types/game';
import { Button } from '@/components/ui/button';

interface ScoreBoardProps {
  players: Player[];
  onResetScores: () => void;
  className?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  onResetScores,
  className = ''
}) => {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-lg">Scores</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onResetScores}
          className="flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-3">
        {players.map(player => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white/50"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: player.color }}
              />
              <span className="font-medium">{player.name}</span>
            </div>
            <div className="text-2xl font-bold text-gray-700">
              {player.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
