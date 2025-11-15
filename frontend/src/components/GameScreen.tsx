import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { GameState, startNewGame, getDayEvent, submitChoice, GameEvent, GameStatus, getApiSource } from '../lib/api';
import { GamePhase } from '../App';
import { EndingScreen } from './EndingScreen';
import { GamePlayPanel } from './GamePlayPanel';
import { ActionItem } from './ActionsPanel';

interface GameScreenProps {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  setPhase: React.Dispatch<React.SetStateAction<GamePhase>>;
}

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
          time_allocation: prev.max_time_allocation, // Restore time allocation for new day
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

    // Calculate new status
    const newStatus = { ...gameState.status };
    Object.entries(action.impact).forEach(([key, value]) => {
      if (value) {
        const statKey = key as keyof GameStatus;
        newStatus[statKey] = Math.max(0, Math.min(100, newStatus[statKey] + value));
      }
    });

    // Deduct time allocation
    const newTimeAllocation = Math.max(0, gameState.time_allocation - action.time_cost);

    // Show result
    setStatChanges(action.impact);
    setResultText(`You chose to: ${action.name}. ${action.description} (Time used: ${action.time_cost} hrs)`);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
  );
}
