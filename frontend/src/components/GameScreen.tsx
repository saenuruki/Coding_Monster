import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { GameState, startNewGame, getDayEvent, submitChoice, GameEvent, GameStatus, getApiSource, StartGameRequest } from '../lib/api';
import { GamePhase } from '../App';
import { EndingScreen } from './EndingScreen';
import { GamePlayPanel } from './GamePlayPanel';
import { ActionItem } from './ActionsPanel';

interface GameScreenProps {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  setPhase: React.Dispatch<React.SetStateAction<GamePhase>>;
}

type StatChanges = {
  health?: number;
  money?: number;
  mood?: number;
};

export function GameScreen({ gameState, setGameState, setPhase }: GameScreenProps) {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState('');
  const [statChanges, setStatChanges] = useState<StatChanges>({});
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
      // Default user parameters
      const defaultParams: StartGameRequest = {
        age: 25,
        gender: 'other',
        character_name: 'Player',
        work: true,
      };
      const newGame = await startNewGame(defaultParams);
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
      const dayEvent = await getDayEvent(gameState.game_id, gameState.day);
      // Convert DayEvent to GameEvent format
      const gameEvent: GameEvent = {
        event_message: dayEvent.description,
        choices: dayEvent.choices,
      };
      setCurrentEvent(gameEvent);
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
      
      const result = await submitChoice(gameState.game_id, choiceIndex, gameState.day);
      updateApiSource();
      setErrorMessage(null);
      
      // Calculate changes for numeric stats only
      const changes: StatChanges = {};
      const numericKeys: (keyof StatChanges)[] = ['health', 'money', 'mood'];
      
      numericKeys.forEach(key => {
        const oldValue = gameState.status[key];
        const newValue = result.status[key];
        if (oldValue !== newValue) {
          changes[key] = newValue - oldValue;
        }
      });
      
      setStatChanges(changes);
      setResultText(`You chose: ${result.applied_choice.text}`);
      setShowResult(true);

      setTimeout(() => {
        setShowResult(false);
        setGameState(prev => prev ? {
          ...prev,
          status: result.status,
          day: result.status.day,
          time_allocation: prev.max_time_allocation, // Reset time allocation for new day
        } : null);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to submit choice:', error);
      setErrorMessage('Failed to submit your choice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionSelected = (action: ActionItem) => {
    if (!gameState) return;

    // Check if enough time is available
    if (gameState.time_allocation < action.time_cost) {
      setErrorMessage(`Not enough time! You need ${action.time_cost} hours but only have ${gameState.time_allocation} hours left.`);
      return;
    }

    // Clear any previous error messages
    setErrorMessage(null);

    // Calculate new status
    const newStatus = { ...gameState.status };
    const changes: StatChanges = {};
    
    Object.entries(action.impact).forEach(([key, value]) => {
      if (typeof value === 'number' && (key === 'health' || key === 'money' || key === 'mood')) {
        const statKey = key as keyof StatChanges;
        const currentValue = newStatus[statKey];
        newStatus[statKey] = Math.max(0, Math.min(100, currentValue + value));
        changes[statKey] = value;
      }
    });

    // Deduct time allocation
    const newTimeAllocation = Math.max(0, gameState.time_allocation - action.time_cost);

    // Show result
    setStatChanges(changes);
    setResultText(`You chose to: ${action.name}. ${action.description} (Time used: ${action.time_cost}h)`);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      setGameState(prev => prev ? {
        ...prev,
        status: newStatus,
        time_allocation: newTimeAllocation,
      } : null);
    }, 3000);
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

  // Get background image based on current day
  const currentDay = Math.min(gameState.day, 10);
  const backgroundImage = `/background/bg_${currentDay}.png`;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className="relative z-10">
        <GamePlayPanel
          gameState={gameState}
          apiSource={apiSource}
          errorMessage={errorMessage}
          currentEvent={currentEvent}
          loading={loading}
          showResult={showResult}
          statChanges={statChanges}
          resultText={resultText}
          onChooseOption={handleChoice}
          onActionSelected={handleActionSelected}
        />
      </div>
    </div>
  );
}
