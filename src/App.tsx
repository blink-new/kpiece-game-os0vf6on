import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  Home, 
  Package2, 
  Map, 
  Users, 
  TrendingUp, 
  Trophy,
  Coins,
  Gem,
  Crown,
  Lock,
  Unlock,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types et interfaces
interface Character {
  id: string;
  name: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'L';
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  aura: 'red' | 'green' | 'blue' | 'yellow';
  bps: number;
  skills: Skill[];
  icon: string;
  saga: string;
  arc: string;
  owned: number;
}

interface Skill {
  name: string;
  type: 'offensive' | 'defensive' | 'utility';
  damage: number;
  description: string;
}

interface GameState {
  berries: number;
  bps: number;
  diamonds: number;
  characters: Character[];
  selectedCrew: string[];
  treasureChestLevel: number;
  lastTreasureOpen: number;
  lastGachaFree: number;
  unlockedSagas: string[];
  unlockedArcs: string[];
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: { berries?: number; diamonds?: number };
  unlocked: boolean;
}

// Données du jeu
const RARITIES = {
  N: { name: 'Normal', color: 'bg-gray-500', probability: 50, bps: 0.5, maxLevel: 45 },
  R: { name: 'Rare', color: 'bg-blue-500', probability: 30, bps: 1, maxLevel: 50 },
  SR: { name: 'Super Rare', color: 'bg-purple-500', probability: 15, bps: 2, maxLevel: 65 },
  SSR: { name: 'Super Super Rare', color: 'bg-orange-500', probability: 4.89, bps: 5, maxLevel: 75 },
  UR: { name: 'Ultra Rare', color: 'bg-red-500', probability: 0.1, bps: 10, maxLevel: 100 },
  L: { name: 'Legendary', color: 'bg-yellow-500', probability: 0.01, bps: 25, maxLevel: 125 }
};

const SAGAS = [
  {
    id: 'east_blue',
    name: 'East Blue',
    arcs: [
      { id: 'romance_dawn', name: 'Romance Dawn', unlocked: true },
      { id: 'orange_town', name: 'Orange Town', unlocked: false },
      { id: 'syrup_village', name: 'Syrup Village', unlocked: false },
      { id: 'baratie', name: 'Baratie', unlocked: false },
      { id: 'arlong_park', name: 'Arlong Park', unlocked: false }
    ]
  },
  {
    id: 'grand_line',
    name: 'Grand Line',
    arcs: [
      { id: 'whisky_peak', name: 'Whisky Peak', unlocked: false },
      { id: 'little_garden', name: 'Little Garden', unlocked: false },
      { id: 'drum_island', name: 'Drum Island', unlocked: false },
      { id: 'alabasta', name: 'Alabasta', unlocked: false }
    ]
  }
];

const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'luffy_east_blue',
    name: 'Monkey D. Luffy',
    rarity: 'N',
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 25,
    defense: 15,
    speed: 20,
    aura: 'red',
    bps: 0.5,
    skills: [
      { name: 'Gum-Gum Pistol', type: 'offensive', damage: 60, description: 'Étend son bras pour frapper' },
      { name: 'Gum-Gum Gatling', type: 'offensive', damage: 40, description: 'Multiples coups de poing rapides' },
      { name: 'Détermination', type: 'utility', damage: 0, description: 'Augmente l\'attaque de 20%' },
      { name: 'Esquive', type: 'defensive', damage: 0, description: 'Évite la prochaine attaque' }
    ],
    icon: '🏴‍☠️',
    saga: 'east_blue',
    arc: 'romance_dawn',
    owned: 1
  }
];

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('kpiece-game-state');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      berries: 0,
      bps: 0.5,
      diamonds: 50, // Start avec quelques diamants pour tester
      characters: INITIAL_CHARACTERS,
      selectedCrew: ['luffy_east_blue'],
      treasureChestLevel: 1,
      lastTreasureOpen: 0,
      lastGachaFree: 0,
      unlockedSagas: ['east_blue'],
      unlockedArcs: ['romance_dawn'],
      achievements: []
    };
  });

  const [activeTab, setActiveTab] = useState('home');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showGachaResult, setShowGachaResult] = useState<Character | null>(null);

  // Sauvegarde automatique
  useEffect(() => {
    localStorage.setItem('kpiece-game-state', JSON.stringify(gameState));
  }, [gameState]);

  // BPS automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        berries: prev.berries + prev.bps
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.bps]);

  // Fonctions utilitaires
  const canOpenTreasure = () => {
    return Date.now() - gameState.lastTreasureOpen > 60000; // 1 minute
  };

  const canGachaFree = () => {
    return Date.now() - gameState.lastGachaFree > 300000; // 5 minutes
  };

  const getTreasureReward = () => {
    const baseReward = 100;
    return baseReward * gameState.treasureChestLevel;
  };

  const openTreasure = () => {
    if (!canOpenTreasure()) {
      toast.error('Le coffre n\'est pas encore prêt !');
      return;
    }

    const reward = getTreasureReward();
    setGameState(prev => ({
      ...prev,
      berries: prev.berries + reward,
      lastTreasureOpen: Date.now()
    }));
    toast.success(`+${reward} Berries !`);
  };

  const performGacha = (isFree = false) => {
    if (!isFree && gameState.diamonds < 10) {
      toast.error('Pas assez de diamants !');
      return;
    }

    if (isFree && !canGachaFree()) {
      toast.error('Tirage gratuit pas encore disponible !');
      return;
    }

    // Génération du personnage selon les probabilités
    const rand = Math.random() * 100;
    let rarity: keyof typeof RARITIES = 'N';
    let cumulative = 0;
    
    for (const [r, data] of Object.entries(RARITIES)) {
      cumulative += data.probability;
      if (rand <= cumulative) {
        rarity = r as keyof typeof RARITIES;
        break;
      }
    }

    // Création d'un nouveau personnage (simplifié pour la démo)
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: `Pirate ${rarity}`,
      rarity,
      level: 1,
      hp: 50 + (RARITIES[rarity].maxLevel * 2),
      maxHp: 50 + (RARITIES[rarity].maxLevel * 2),
      attack: 10 + (RARITIES[rarity].maxLevel),
      defense: 5 + (RARITIES[rarity].maxLevel / 2),
      speed: 15 + (RARITIES[rarity].maxLevel / 3),
      aura: (['red', 'green', 'blue', 'yellow'] as const)[Math.floor(Math.random() * 4)] as 'red' | 'green' | 'blue' | 'yellow',
      bps: RARITIES[rarity].bps,
      skills: [
        { name: 'Attaque', type: 'offensive', damage: 50, description: 'Attaque basique' },
        { name: 'Défense', type: 'defensive', damage: 0, description: 'Augmente la défense' },
        { name: 'Soin', type: 'utility', damage: -30, description: 'Restaure des HP' },
        { name: 'Coup spécial', type: 'offensive', damage: 80, description: 'Attaque puissante' }
      ],
      icon: ['⚔️', '🏴‍☠️', '👑', '💎', '🌟'][Math.floor(Math.random() * 5)],
      saga: 'east_blue',
      arc: 'romance_dawn',
      owned: 1
    };

    setGameState(prev => ({
      ...prev,
      diamonds: isFree ? prev.diamonds : prev.diamonds - 10,
      characters: [...prev.characters, newCharacter],
      bps: prev.bps + newCharacter.bps,
      lastGachaFree: isFree ? Date.now() : prev.lastGachaFree
    }));

    setShowGachaResult(newCharacter);
    toast.success(`Nouveau personnage obtenu : ${newCharacter.name} (${rarity}) !`);
  };

  const upgradeCharacter = (characterId: string, levels: number) => {
    const character = gameState.characters.find(c => c.id === characterId);
    if (!character) return;

    const cost = levels * 100 * character.level;
    if (gameState.berries < cost) {
      toast.error('Pas assez de Berries !');
      return;
    }

    const maxLevel = RARITIES[character.rarity].maxLevel;
    if (character.level >= maxLevel) {
      toast.error('Niveau maximum atteint !');
      return;
    }

    setGameState(prev => ({
      ...prev,
      berries: prev.berries - cost,
      characters: prev.characters.map(c => 
        c.id === characterId 
          ? {
              ...c,
              level: Math.min(c.level + levels, maxLevel),
              hp: c.hp + (levels * 10),
              maxHp: c.maxHp + (levels * 10),
              attack: c.attack + (levels * 2),
              defense: c.defense + levels,
              speed: c.speed + levels
            }
          : c
      )
    }));

    toast.success(`${character.name} amélioré de ${levels} niveau(x) !`);
  };

  // Rendu des composants
  const renderHome = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border-yellow-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6" />
              <div>
                <p className="text-sm font-medium">Berries</p>
                <p className="text-2xl font-bold">{Math.floor(gameState.berries).toLocaleString()}</p>
                <p className="text-xs opacity-80">+{gameState.bps.toFixed(1)}/sec</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gem className="w-6 h-6" />
              <div>
                <p className="text-sm font-medium">Diamants</p>
                <p className="text-2xl font-bold">{gameState.diamonds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-500 text-white border-purple-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <div>
                <p className="text-sm font-medium">Équipage</p>
                <p className="text-2xl font-bold">{gameState.selectedCrew.length}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Package2 className="w-6 h-6" />
            Coffre au Trésor (Niveau {gameState.treasureChestLevel})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-amber-700">Récompense: {getTreasureReward()} Berries</span>
              <Badge variant={canOpenTreasure() ? "default" : "secondary"}>
                {canOpenTreasure() ? "Prêt !" : "En cours..."}
              </Badge>
            </div>
            <Button 
              onClick={openTreasure} 
              disabled={!canOpenTreasure()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              Ouvrir le Coffre
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Équipage Sélectionné
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gameState.selectedCrew.map(charId => {
              const character = gameState.characters.find(c => c.id === charId);
              if (!character) return null;
              
              return (
                <div key={charId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{character.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{character.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={RARITIES[character.rarity].color}>
                        {character.rarity}
                      </Badge>
                      <span className="text-sm text-gray-600">Niv. {character.level}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-green-600">❤️ {character.hp}/{character.maxHp}</p>
                    <p className="text-red-600">⚔️ {character.attack}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGacha = () => (
    <div className="space-y-6">
      <Card className="border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Package2 className="w-6 h-6" />
            Recrutement de Pirates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">Diamants disponibles:</span>
            <span className="text-2xl font-bold text-blue-800">{gameState.diamonds}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => performGacha(true)}
              disabled={!canGachaFree()}
              variant="outline"
              className="h-16"
            >
              <div className="text-center">
                <p className="font-bold">Tirage Gratuit</p>
                <p className="text-xs">{canGachaFree() ? "Disponible !" : "5 min"}</p>
              </div>
            </Button>
            
            <Button 
              onClick={() => performGacha(false)}
              disabled={gameState.diamonds < 10}
              className="h-16 bg-blue-600 hover:bg-blue-700"
            >
              <div className="text-center">
                <p className="font-bold">Tirage</p>
                <p className="text-xs">10 💎</p>
              </div>
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Taux de drop:</h4>
            {Object.entries(RARITIES).map(([rarity, data]) => (
              <div key={rarity} className="flex items-center justify-between text-sm">
                <Badge className={data.color}>{data.name} ({rarity})</Badge>
                <span>{data.probability}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showGachaResult && (
        <Card className="border-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 animate-pulse">
          <CardHeader>
            <CardTitle className="text-center text-yellow-800">🎉 Nouveau Pirate Recruté ! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl">{showGachaResult.icon}</div>
            <h3 className="text-2xl font-bold">{showGachaResult.name}</h3>
            <Badge className={`${RARITIES[showGachaResult.rarity].color} text-lg px-4 py-2`}>
              {RARITIES[showGachaResult.rarity].name}
            </Badge>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>❤️ HP: {showGachaResult.hp}</div>
              <div>⚔️ ATK: {showGachaResult.attack}</div>
              <div>🛡️ DEF: {showGachaResult.defense}</div>
              <div>⚡ SPD: {showGachaResult.speed}</div>
            </div>
            <Button onClick={() => setShowGachaResult(null)} className="mt-4">
              Continuer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCrew = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Collection de Pirates ({gameState.characters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameState.characters.map(character => (
              <Card key={character.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{character.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">{character.name}</h4>
                        <span className="text-sm font-medium">Niv. {character.level}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={RARITIES[character.rarity].color}>
                          {character.rarity}
                        </Badge>
                        <div className={`w-3 h-3 rounded-full ${
                          character.aura === 'red' ? 'bg-red-500' :
                          character.aura === 'green' ? 'bg-green-500' :
                          character.aura === 'blue' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`} title={`Aura ${character.aura}`}></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>❤️ {character.hp}/{character.maxHp}</div>
                        <div>⚔️ {character.attack}</div>
                        <div>🛡️ {character.defense}</div>
                        <div>⚡ {character.speed}</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={gameState.selectedCrew.includes(character.id) ? "destructive" : "default"}
                          onClick={() => {
                            if (gameState.selectedCrew.includes(character.id)) {
                              setGameState(prev => ({
                                ...prev,
                                selectedCrew: prev.selectedCrew.filter(id => id !== character.id)
                              }));
                            } else if (gameState.selectedCrew.length < 5) {
                              setGameState(prev => ({
                                ...prev,
                                selectedCrew: [...prev.selectedCrew, character.id]
                              }));
                            } else {
                              toast.error('Équipage complet (5 max) !');
                            }
                          }}
                        >
                          {gameState.selectedCrew.includes(character.id) ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCharacter(character)}
                        >
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUpgrade = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Amélioration des Pirates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {gameState.characters.map(character => (
              <Card key={character.id} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{character.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-bold">{character.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={RARITIES[character.rarity].color}>
                          {character.rarity}
                        </Badge>
                        <span className="text-sm">Niv. {character.level}/{RARITIES[character.rarity].maxLevel}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => upgradeCharacter(character.id, 1)}
                        disabled={character.level >= RARITIES[character.rarity].maxLevel}
                      >
                        +1 Niv ({(100 * character.level).toLocaleString()} 🪙)
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => upgradeCharacter(character.id, 10)}
                        disabled={character.level >= RARITIES[character.rarity].maxLevel}
                      >
                        +10 Niv ({(1000 * character.level).toLocaleString()} 🪙)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNavigation = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-6 h-6" />
            Exploration des Mers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {SAGAS.map(saga => (
              <div key={saga.id} className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {gameState.unlockedSagas.includes(saga.id) ? (
                    <Unlock className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  {saga.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {saga.arcs.map(arc => (
                    <Card key={arc.id} className={`${
                      arc.unlocked ? 'bg-white' : 'bg-gray-100'
                    } border-2`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{arc.name}</h4>
                          {arc.unlocked ? (
                            <Unlock className="w-4 h-4 text-green-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {arc.unlocked && (
                          <div className="mt-3 grid grid-cols-5 gap-1">
                            {Array.from({ length: 10 }, (_, i) => (
                              <Button
                                key={i + 1}
                                size="sm"
                                variant={i === 9 ? "destructive" : "outline"}
                                className="h-8 w-8 p-0"
                                onClick={() => toast.info(`Combat niveau ${i + 1} - Bientôt disponible !`)}
                              >
                                {i === 9 ? <Crown className="w-3 h-3" /> : i + 1}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Succès et Trophées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Les succès seront bientôt disponibles !</p>
            <p className="text-sm">Continuez à jouer pour débloquer des récompenses.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-6 pb-20">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏴‍☠️ KPIECE GAME 🏴‍☠️
          </h1>
          <p className="text-blue-200">L'Aventure Pirate Ultime</p>
        </header>

        <div className="mb-6">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'gacha' && renderGacha()}
          {activeTab === 'navigation' && renderNavigation()}
          {activeTab === 'crew' && renderCrew()}
          {activeTab === 'upgrade' && renderUpgrade()}
          {activeTab === 'achievements' && renderAchievements()}
        </div>
      </div>

      {/* Navigation fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-400 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-6 gap-1">
            {[
              { id: 'home', icon: Home, label: 'Accueil' },
              { id: 'gacha', icon: Package2, label: 'Gacha' },
              { id: 'navigation', icon: Map, label: 'Naviguer' },
              { id: 'crew', icon: Users, label: 'Équipage' },
              { id: 'upgrade', icon: TrendingUp, label: 'Améliorer' },
              { id: 'achievements', icon: Trophy, label: 'Succès' }
            ].map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                className={`h-16 flex-col gap-1 ${
                  activeTab === id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal détails personnage */}
      {selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedCharacter.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCharacter(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-6xl">{selectedCharacter.icon}</span>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Badge className={RARITIES[selectedCharacter.rarity].color}>
                    {RARITIES[selectedCharacter.rarity].name}
                  </Badge>
                  <span>Niveau {selectedCharacter.level}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>❤️ HP: {selectedCharacter.hp}/{selectedCharacter.maxHp}</div>
                  <div>⚔️ Attaque: {selectedCharacter.attack}</div>
                </div>
                <div className="space-y-2">
                  <div>🛡️ Défense: {selectedCharacter.defense}</div>
                  <div>⚡ Vitesse: {selectedCharacter.speed}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Compétences:</h4>
                <div className="space-y-2">
                  {selectedCharacter.skills.map((skill, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{skill.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {skill.type === 'offensive' ? '⚔️' : skill.type === 'defensive' ? '🛡️' : '✨'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;