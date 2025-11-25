import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Bot, ArrowLeft, Wifi } from 'lucide-react';

interface GameModeSelectionProps {
  onSelectMode: (mode: 'human' | 'ai' | 'online') => void;
  onBack: () => void;
}

export const GameModeSelection: React.FC<GameModeSelectionProps> = ({
  onSelectMode,
  onBack
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Mode de Jeu
        </h2>
        <p className="text-gray-600">
          Choisissez contre qui vous voulez jouer
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Mode Humain vs Humain */}
        <Card className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Users className="w-6 h-6 text-blue-600" />
              Humain vs Humain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Jouez contre un autre joueur en local. Parfait pour s'amuser entre amis !
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Personnalisation complète des joueurs
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Avatars et couleurs personnalisables
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Historique des parties
              </div>
            </div>

            <Button 
              onClick={() => onSelectMode('human')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:scale-105 transition-transform"
            >
              <Users className="w-4 h-4 mr-2" />
              Choisir ce mode
            </Button>
          </CardContent>
        </Card>

        {/* Mode Humain vs IA */}
        <Card className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Bot className="w-6 h-6 text-purple-600" />
              Humain vs IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Défiez un adversaire robotique intelligent. Parfait pour s'entraîner !
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                IA adaptative et stratégique
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Jouez quand vous voulez
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Entraînez-vous seul
              </div>
            </div>

            <Button 
              onClick={() => onSelectMode('ai')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:scale-105 transition-transform"
            >
              <Bot className="w-4 h-4 mr-2" />
              Choisir ce mode
            </Button>
          </CardContent>
        </Card>

        {/* Mode En ligne */}
        <Card className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Wifi className="w-6 h-6 text-green-600" />
              Jeu en ligne
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Jouez contre d'autres joueurs en ligne partout dans le monde !
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Parties synchronisées en temps réel
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Jouez contre le monde entier
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Connexion requise
              </div>
            </div>

            <Button 
              onClick={() => onSelectMode('online')}
              className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:scale-105 transition-transform"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Choisir ce mode
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au menu
        </Button>
      </div>
    </div>
  );
};