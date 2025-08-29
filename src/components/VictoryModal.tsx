
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Player } from '../types/game';
import { Trophy, Clock, RotateCcw, Home } from 'lucide-react';

// Import avatar images
import avatarBusinessMan from '../assets/avatar-business-man.png';
import avatarOrangeHairWoman from '../assets/avatar-orange-hair-woman.png';
import avatarStripedBoy from '../assets/avatar-striped-boy.png';
import avatarBlondeWoman from '../assets/avatar-blonde-woman.png';
import avatarPunkMan from '../assets/avatar-punk-man.png';
import avatarBeanieMan from '../assets/avatar-beanie-man.png';

const AVATAR_OPTIONS = [
  { id: 'business-man', src: avatarBusinessMan, alt: 'Homme d\'affaires' },
  { id: 'orange-hair-woman', src: avatarOrangeHairWoman, alt: 'Femme aux cheveux orange' },
  { id: 'striped-boy', src: avatarStripedBoy, alt: 'Garçon à rayures' },
  { id: 'blonde-woman', src: avatarBlondeWoman, alt: 'Femme blonde' },
  { id: 'punk-man', src: avatarPunkMan, alt: 'Homme punk' },
  { id: 'beanie-man', src: avatarBeanieMan, alt: 'Homme au bonnet' }
];

interface VictoryModalProps {
  isOpen: boolean;
  winner: Player;
  gameDuration: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winner,
  gameDuration,
  onPlayAgain,
  onBackToMenu
}) => {
  useEffect(() => {
    if (isOpen) {
      // Animation de confettis
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = [winner.color, '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [isOpen, winner.color]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Victoire !
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6 py-4">
          {/* Avatar du gagnant */}
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-lg animate-bounce-in"
                style={{ backgroundColor: winner.color }}
              />
              {winner.avatar && (
                <img 
                  src={AVATAR_OPTIONS.find(a => a.id === winner.avatar)?.src || winner.avatar} 
                  alt="Avatar du gagnant"
                  className="absolute inset-0 w-20 h-20 object-cover rounded-full border-4 border-yellow-400 shadow-lg animate-bounce-in"
                />
              )}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Nom du gagnant */}
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {winner.name}
            </h3>
            <p className="text-lg text-gray-600">
              remporte la partie !
            </p>
          </div>

          {/* Statistiques */}
          <div className="bg-white/70 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span>Durée de la partie: {formatDuration(gameDuration)}</span>
            </div>
            <div className="text-sm text-gray-600">
              Score actuel: {winner.score} victoire{winner.score > 1 ? 's' : ''}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={onPlayAgain}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Rejouer
            </Button>
            <Button 
              onClick={onBackToMenu}
              variant="outline"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Menu principal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
