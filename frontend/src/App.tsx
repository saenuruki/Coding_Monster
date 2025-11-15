import { useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { IntroScreen } from './components/IntroScreen';
import { EndingScreen } from './components/EndingScreen';
import { GameState } from './lib/api';

export type GamePhase = 'intro' | 'game' | 'ending';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [gameState, setGameState] = useState<GameState | null>(null);

  const startGame = async () => {
    setPhase('game');
  };

  return (
    <div className="min-h-screen bg-[#2b2b2b]">
      {phase === 'intro' && <IntroScreen onStart={startGame} />}
      {phase === 'game' && (
        <GameScreen 
          gameState={gameState}
          setGameState={setGameState}
          setPhase={setPhase}
        />
      )}
      {phase === 'ending' && gameState && (
        <EndingScreen gameState={gameState} />
      )}
    </div>
  );
}
