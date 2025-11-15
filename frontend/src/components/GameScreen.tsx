import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Activity, Heart, Wallet, Zap, Users, Briefcase, Calendar, Loader2 } from 'lucide-react';
import { GameState, startNewGame, getDayEvent, submitChoice, GameEvent, GameStatus, getApiSource } from '../lib/api';
import { GamePhase } from '../App';
import { EndingScreen } from './EndingScreen';

interface GameScreenProps {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  setPhase: React.Dispatch<React.SetStateAction<GamePhase>>;
}

const STAT_CONFIG = [
  { key: 'health' as keyof GameStatus, icon: Activity, label: 'Health', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' },
  { key: 'happiness' as keyof GameStatus, icon: Heart, label: 'Happiness', color: 'text-rose-400', bgColor: 'bg-rose-500/20', borderColor: 'border-rose-500/30' },
  { key: 'money' as keyof GameStatus, icon: Wallet, label: 'Money', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30' },
  { key: 'energy' as keyof GameStatus, icon: Zap, label: 'Energy', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
  { key: 'social' as keyof GameStatus, icon: Users, label: 'Social', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
  { key: 'career' as keyof GameStatus, icon: Briefcase, label: 'Career', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
];

export function GameScreen({ gameState, setGameState, setPhase }: GameScreenProps) {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState('');
  const [statChanges, setStatChanges] = useState<Partial<GameStatus>>({});
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [apiSource, setApiSource] = useState<'api' | 'mock'>(getApiSource());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameState && !showResult) {
      loadNextEvent();
    }
  }, [gameState?.day]);

  const updateApiSource = () => {
    setApiSource(getApiSource());
  };

  const initializeGame = async () => {
    try {
      setInitializing(true);
      const newGame = await startNewGame();
      setGameState(newGame);
      updateApiSource();
      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to start game:', error);
      setErrorMessage('Failed to start game. Please refresh and try again.');
    } finally {
      setInitializing(false);
    }
  };

  const loadNextEvent = async () => {
    if (!gameState) return;
    
    if (gameState.day > 10) {
      setPhase('ending');
      return;
    }

    try {
      setLoading(true);
      const event = await getDayEvent(gameState.game_id, gameState.day);
      setCurrentEvent(event);
      updateApiSource();
      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to load event:', error);
      setErrorMessage('Failed to load the next event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choiceIndex: number) => {
    if (!gameState || !currentEvent) return;

    try {
      setLoading(true);
      
      const result = await submitChoice(gameState.game_id, choiceIndex);
      updateApiSource();
      setErrorMessage(null);
      
      // Calculate changes
      const changes: Partial<GameStatus> = {};
      Object.keys(result.status).forEach(key => {
        const statKey = key as keyof GameStatus;
        const oldValue = gameState.status[statKey];
        const newValue = result.status[statKey];
        if (oldValue !== newValue) {
          changes[statKey] = newValue - oldValue;
        }
      });
      
      setStatChanges(changes);
      setResultText(result.result_message);
      setShowResult(true);

      setTimeout(() => {
        setShowResult(false);
        setGameState(prev => prev ? {
          ...prev,
          status: result.status,
          day: prev.day + 1,
        } : null);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to submit choice:', error);
      setErrorMessage('Failed to submit your choice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Initializing game...</span>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Failed to load game</div>
      </div>
    );
  }

  if (gameState.day > 10) {
    return <EndingScreen gameState={gameState} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        {apiSource === 'mock' && (
          <Card className="bg-yellow-500/10 border-yellow-500/40 text-yellow-100 text-sm p-3">
            Live API unreachable. Showing built-in demo data so play can continue.
          </Card>
        )}

        {errorMessage && (
          <Card className="bg-red-500/10 border-red-500/40 text-red-100 text-sm p-3">
            {errorMessage}
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {STAT_CONFIG.map(({ key, icon: Icon, label, color, bgColor, borderColor }) => (
            <Card key={key} className={`bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-3`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-white text-sm">{label}</span>
                </div>
                <span className="text-white text-sm">{gameState.status[key]}%</span>
              </div>
              <Progress value={gameState.status[key]} className="h-1.5" />
            </Card>
          ))}
        </div>

        {/* Day Counter */}
        <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-4">
          <div className="flex items-center justify-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            <span>Day {gameState.day} / 10</span>
          </div>
        </Card>

        {/* Event Card */}
        <AnimatePresence mode="wait">
          {loading ? (
            <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </Card>
          ) : !showResult && currentEvent ? (
            <motion.div
              key="event"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-6 space-y-6">
                <div>
                  <p className="text-white/90 leading-relaxed text-lg">
                    {currentEvent.event_message}
                  </p>
                </div>

                <div className="space-y-3">
                  {currentEvent.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleChoice(index)}
                      disabled={loading}
                      className="w-full h-auto py-4 px-4 bg-[#2b2b2b] hover:bg-[#4a4a4a] border border-white/10 text-left"
                      variant="outline"
                    >
                      <span className="text-white">{option}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            </motion.div>
          ) : showResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-8 text-center space-y-6">
                <div className="space-y-3">
                  <div className="text-4xl">
                    {Object.values(statChanges).some(v => v && v > 0) ? '✨' : '💭'}
                  </div>
                  <p className="text-white text-lg leading-relaxed">{resultText}</p>
                </div>
                
                {Object.keys(statChanges).length > 0 && (
                  <div className="flex gap-2 justify-center flex-wrap">
                    {STAT_CONFIG.map(({ key, icon: Icon, label, color }) => {
                      const change = statChanges[key];
                      if (!change || change === 0) return null;
                      
                      return (
                        <Badge 
                          key={key}
                          className={`${
                            change > 0 
                              ? 'bg-orange-500/30 text-orange-200 border-orange-500/50' 
                              : 'bg-red-500/30 text-red-200 border-red-500/50'
                          } px-3 py-2`}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {change > 0 ? '+' : ''}{change} {label}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <div className="text-white/50 text-sm pt-4">
                  Moving to day {gameState.day + 1}...
                </div>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
