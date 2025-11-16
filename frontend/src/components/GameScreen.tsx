import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { GameState, startNewGame, submitChoice, GameEvent, GameStatus, getApiSource, StartGameRequest } from '../lib/api';
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
  const [characterImage, setCharacterImage] = useState('/person/person_normal.png');

  useEffect(() => {
    initializeGame();
  }, []);

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
      setCurrentEvent(newGame.currentEvent);
      updateApiSource();
      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to start game:', error);
      setErrorMessage('Failed to start game. Please refresh and try again.');
    } finally {
      setInitializing(false);
    }
  };

  const handleChoice = async (choiceId: number) => {
    if (!gameState || !currentEvent) return;

    try {
      setLoading(true);

      const selectedChoice = currentEvent.choices.find(c => c.id === choiceId);
      if (!selectedChoice) {
        throw new Error('Invalid choice');
      }

      const result = await submitChoice(gameState.game_id, selectedChoice.impact);
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
      setResultText(`You chose: ${selectedChoice.text}`);
      setShowResult(true);

      // Determine character image based on status changes
      const moneyChange = changes.money || 0;
      const moodChange = changes.mood || 0;
      
      let newCharacterImage = '/person/person_normal.png';
      
      if (moneyChange > 0) {
        // Money increased
        newCharacterImage = '/person/person_yeah.png';
      } else if (moneyChange < 0 && moodChange > 0) {
        // Money decreased but mood increased
        newCharacterImage = '/person/person_mood.png';
      } else if (moneyChange < 0 && moodChange < 0) {
        // Both money and mood decreased
        newCharacterImage = '/person/person_sad.png';
      }
      
      setCharacterImage(newCharacterImage);

      setTimeout(() => {
        setShowResult(false);
        // Set the next event from the API response
        setCurrentEvent(result.next_event);
        setGameState(prev => {
          if (!prev) return null;
          
          // Apply interest to savings account if it exists
          let updatedSavingsAccount = prev.savingsAccount;
          if (prev.savingsAccount && prev.savingsAccount.amount > 0) {
            // Apply daily interest rate (annual rate / 365)
            const dailyInterestRate = prev.savingsAccount.interest / 100;
            const interestEarned = prev.savingsAccount.amount * dailyInterestRate;
            updatedSavingsAccount = {
              ...prev.savingsAccount,
              amount: prev.savingsAccount.amount + interestEarned,
            };
          }
          
          return {
            ...prev,
            status: result.status, // Status is overwritten by API
            day: result.status.day,
            time_allocation: prev.max_time_allocation, // Reset time allocation for new day
            savingsAccount: updatedSavingsAccount, // Update with interest
            // dailyFinances is kept and accumulated (not reset)
          };
        });
      }, 3000);
      
    } catch (error) {
      console.error('Failed to submit choice:', error);
      setErrorMessage('Failed to submit your choice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSavings = (newSavingsAccount: import('../lib/api').SavingsAccount | undefined, moneyDelta: number) => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev) return null;
      
      const newStatus = { ...prev.status };
      newStatus.money = Math.max(0, newStatus.money + moneyDelta);
      
      return {
        ...prev,
        status: newStatus,
        savingsAccount: newSavingsAccount,
      };
    });
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

    // Update daily finances if there's a money transaction
    const newDailyFinances = { ...gameState.dailyFinances };
    if (action.impact.money) {
      const timestamp = Date.now();
      if (action.impact.money > 0) {
        // Income
        newDailyFinances.incomes = [
          ...newDailyFinances.incomes,
          {
            id: `income_${timestamp}`,
            name: action.name,
            amount: action.impact.money,
            timestamp,
          },
        ];
      } else {
        // Expense
        newDailyFinances.expenses = [
          ...newDailyFinances.expenses,
          {
            id: `expense_${timestamp}`,
            name: action.name,
            amount: Math.abs(action.impact.money),
            timestamp,
          },
        ];
      }
    }

    // Show result
    setStatChanges(changes);
    setResultText(`You chose to: ${action.name}. ${action.description} (Time used: ${action.time_cost}h)`);
    setShowResult(true);

    // Determine character image based on status changes
    const moneyChange = changes.money || 0;
    const moodChange = changes.mood || 0;
    
    let newCharacterImage = '/person/person_normal.png';
    
    if (moneyChange > 0) {
      // Money increased
      newCharacterImage = '/person/person_yeah.png';
    } else if (moneyChange < 0 && moodChange > 0) {
      // Money decreased but mood increased
      newCharacterImage = '/person/person_mood.png';
    } else if (moneyChange < 0 && moodChange < 0) {
      // Both money and mood decreased
      newCharacterImage = '/person/person_sad.png';
    }
    
    setCharacterImage(newCharacterImage);

    setTimeout(() => {
      setShowResult(false);
      setGameState(prev => prev ? {
        ...prev,
        status: newStatus,
        time_allocation: newTimeAllocation,
        dailyFinances: newDailyFinances,
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
      className="min-h-screen h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* <div className="grid grid-cols-2 md:grid-cols-2 gap-2"> */}
        {/* Content - Scrollable Container */}
        <div className="relative z-10 w-full max-w-2xl lg:w-1/2 lg:max-w-none h-full overflow-y-auto py-8">
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
            onUpdateSavings={handleUpdateSavings}
          />
        </div>

        {/* Character Image - Center Position (Hidden on mobile) */}
        <div className="hidden lg:block fixed bottom-0 left-1/2 -translate-x-1/2 z-[5] pointer-events-none">
          <img
            src={characterImage}
            alt="Character"
            className="h-[600px] w-auto object-contain transition-opacity duration-500"
          />
        </div>
      {/* </div> */}
    </div>
  );
}
