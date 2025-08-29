
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Player } from '../types/game';
import { Palette, User } from 'lucide-react';

// Import avatar images
import avatarBusinessMan from '../assets/avatar-business-man.png';
import avatarOrangeHairWoman from '../assets/avatar-orange-hair-woman.png';
import avatarStripedBoy from '../assets/avatar-striped-boy.png';
import avatarBlondeWoman from '../assets/avatar-blonde-woman.png';
import avatarPunkMan from '../assets/avatar-punk-man.png';
import avatarBeanieMan from '../assets/avatar-beanie-man.png';

interface PlayerCustomizationProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
  onStartGame: () => void;
}

const PRESET_COLORS = [
  '#FA7070', '#4A90E2', '#50C878', '#FFB347', 
  '#DDA0DD', '#87CEEB', '#F0E68C', '#FFA07A'
];

const AVATAR_OPTIONS = [
  { id: 'business-man', src: avatarBusinessMan, alt: 'Homme d\'affaires' },
  { id: 'orange-hair-woman', src: avatarOrangeHairWoman, alt: 'Femme aux cheveux orange' },
  { id: 'striped-boy', src: avatarStripedBoy, alt: 'Garçon à rayures' },
  { id: 'blonde-woman', src: avatarBlondeWoman, alt: 'Femme blonde' },
  { id: 'punk-man', src: avatarPunkMan, alt: 'Homme punk' },
  { id: 'beanie-man', src: avatarBeanieMan, alt: 'Homme au bonnet' }
];

export const PlayerCustomization: React.FC<PlayerCustomizationProps> = ({
  players,
  onPlayersUpdate,
  onStartGame
}) => {
  const [localPlayers, setLocalPlayers] = useState<Player[]>(players);

  const updatePlayer = (playerId: 1 | 2, updates: Partial<Player>) => {
    const updated = localPlayers.map(player =>
      player.id === playerId ? { ...player, ...updates } : player
    );
    setLocalPlayers(updated);
  };

  const handleSave = () => {
    onPlayersUpdate(localPlayers);
    onStartGame();
  };

  const canStart = localPlayers.every(player => 
    player.name.trim().length > 0 && player.color
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Personnalisation des Joueurs
        </h2>
        <p className="text-gray-600">
          Configurez vos noms, couleurs et avatars avant de commencer
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {localPlayers.map(player => (
          <Card key={player.id} className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Joueur {player.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nom du joueur */}
              <div>
                <Label htmlFor={`name-${player.id}`}>Nom</Label>
                <Input
                  id={`name-${player.id}`}
                  value={player.name}
                  onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                  placeholder={`Joueur ${player.id}`}
                  className="mt-1"
                />
              </div>

              {/* Couleur personnalisée */}
              <div>
                <Label>Couleur personnalisée</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={player.color}
                    onChange={(e) => updatePlayer(player.id, { color: e.target.value })}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{player.color}</span>
                </div>
              </div>

              {/* Couleurs prédéfinies */}
              <div>
                <Label>Couleurs prédéfinies</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updatePlayer(player.id, { color })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        player.color === color 
                          ? 'border-gray-800 scale-110' 
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Avatar */}
              <div>
                <Label>Avatar (optionnel)</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {AVATAR_OPTIONS.map(avatar => (
                    <button
                      key={avatar.id}
                      onClick={() => updatePlayer(player.id, { avatar: avatar.id })}
                      className={`p-2 rounded border-2 transition-all ${
                        player.avatar === avatar.id 
                          ? 'border-gray-800 bg-gray-100' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      title={avatar.alt}
                    >
                      <img 
                        src={avatar.src} 
                        alt={avatar.alt}
                        className="w-12 h-12 object-cover rounded-full mx-auto"
                      />
                    </button>
                  ))}
                  <button
                    onClick={() => updatePlayer(player.id, { avatar: undefined })}
                    className={`p-2 text-sm rounded border-2 transition-all ${
                      !player.avatar 
                        ? 'border-gray-800 bg-gray-100' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Aucun
                  </button>
                </div>
              </div>

              {/* Aperçu */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-sm text-gray-600">Aperçu</Label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: player.color }}
                    />
                    {player.avatar && (
                      <img 
                        src={AVATAR_OPTIONS.find(a => a.id === player.avatar)?.src} 
                        alt="Avatar"
                        className="absolute inset-0 w-8 h-8 object-cover rounded-full"
                      />
                    )}
                  </div>
                  <span className="font-medium">{player.name || `Joueur ${player.id}`}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4 pt-6">
        <Button
          onClick={handleSave}
          disabled={!canStart}
          className="px-8 py-3 text-lg bg-wood hover:bg-wood-dark"
        >
          <Palette className="w-5 h-5 mr-2" />
          Commencer la Partie
        </Button>
      </div>
    </div>
  );
};
