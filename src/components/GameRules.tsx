import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Target, Move, Crown } from 'lucide-react';
import { Copyright } from './Copyright';

interface GameRulesProps {
  onBack: () => void;
}

export const GameRules: React.FC<GameRulesProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-3xl font-bold text-gray-800">
          Règles du Fanoron-telo
        </h2>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Objectif du jeu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Le <strong>Fanoron-telo</strong> est un jeu traditionnel malgache pour 2 joueurs. 
              Le but est d'être le premier à aligner ses 3 pions sur le plateau.
            </p>
          </CardContent>
        </Card>

        {/* Matériel */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Matériel</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>• Un plateau de 9 intersections disposées en carré 3×3</li>
              <li>• Des lignes connectent les intersections (horizontales, verticales et diagonales)</li>
              <li>• 3 pions par joueur (de couleurs différentes)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Phase 1 */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Phase 1: Placement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p>Chaque joueur place à tour de rôle ses 3 pions sur les intersections libres du plateau.</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-800">Règles du placement:</p>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Un seul pion par intersection</li>
                  <li>• Vous pouvez placer sur n'importe quelle intersection libre</li>
                  <li>• Le joueur 1 commence toujours</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase 2 */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Move className="w-5 h-5 text-orange-600" />
              Phase 2: Déplacement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p>Une fois tous les pions placés, les joueurs déplacent à tour de rôle un de leurs pions.</p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="font-semibold text-orange-800">Règles du déplacement:</p>
                <ul className="mt-2 space-y-1 text-orange-700">
                  <li>• Vous ne pouvez déplacer qu'un seul pion par tour</li>
                  <li>• Le déplacement se fait uniquement vers une intersection voisine reliée par une ligne</li>
                  <li>• L'intersection de destination doit être libre</li>
                  <li>• Vous ne pouvez pas revenir sur votre dernière position</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Victoire */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Conditions de victoire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p>Un joueur gagne dès qu'il réussit à aligner ses 3 pions.</p>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-semibold text-yellow-800">Alignements gagnants:</p>
                <ul className="mt-2 space-y-1 text-yellow-700">
                  <li>• Ligne horizontale (3 pions sur la même ligne)</li>
                  <li>• Ligne verticale (3 pions sur la même colonne)</li>
                  <li>• Ligne diagonale (3 pions en diagonale)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stratégies */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Conseils stratégiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Placement optimal:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Contrôlez le centre (position la plus connectée)</li>
                  <li>• Créer plusieurs menaces simultanées</li>
                  <li>• Bloquez les alignements adverses</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Déplacement tactique:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Anticipez les mouvements adverses</li>
                  <li>• Créez des "fourchettes" (double menace)</li>
                  <li>• Gardez vos pions connectés</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note culturelle */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-none">
          <CardHeader>
            <CardTitle className="text-center">🇲🇬 Note culturelle</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="italic">
              Le Fanoron-telo fait partie de la famille des jeux Fanorona, 
              traditionnels à Madagascar. Ces jeux développent la réflexion stratégique 
              et sont transmis de génération en génération.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Copyright />
    </div>
  );
};
