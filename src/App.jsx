import { useState } from 'react';
import SetupScreen from './screens/SetupScreen';
import NightPhaseScreen from './screens/NightPhaseScreen';
import DayPhaseScreen from './screens/DayPhaseScreen';
import ResolutionScreen from './screens/ResolutionScreen';
import { useGameStore } from './store/useGameStore';
import { distributeRoles } from './utils/roleDistributor';

function App() {
  const [currentPhase, setCurrentPhase] = useState('setup'); 
  const { players, softResetGame, resetForLobby } = useGameStore();

  const handleQuickRestart = () => {
    // Mevcut başkanı bul ve rolleri arka planda yeni oyun için tekrar dağıt
    const currentMayor = players.find(p => p.isMayor)?.name;
    const playerNames = players.map(p => p.name);
    const newPlayers = distributeRoles(playerNames, currentMayor);
    
    softResetGame(newPlayers);
    setCurrentPhase('night');
  };

  const handleGoToLobby = () => {
    resetForLobby();
    setCurrentPhase('setup');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 flex flex-col items-center justify-center p-4">
      
      {currentPhase === 'setup' && (
        <SetupScreen onComplete={() => setCurrentPhase('night')} />
      )}
      
      {currentPhase === 'night' && (
        <NightPhaseScreen onComplete={() => setCurrentPhase('day')} />
      )}
      
      {currentPhase === 'day' && (
        <DayPhaseScreen onComplete={() => setCurrentPhase('resolution')} />
      )}

      {currentPhase === 'resolution' && (
        <ResolutionScreen 
          onQuickRestart={handleQuickRestart}
          onGoToLobby={handleGoToLobby}
        />
      )}
      
    </div>
  );
}

export default App;