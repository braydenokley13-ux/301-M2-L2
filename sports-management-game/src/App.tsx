import React, { useState } from 'react';
import { useGameStore } from './store/gameStore';
import TeamSelection from './components/TeamSelection/TeamSelection';
import Dashboard from './components/Dashboard/Dashboard';
import RosterManagement from './components/RosterManagement/RosterManagement';
import TradeHub from './components/TradeHub/TradeHub';
import FreeAgency from './components/FreeAgency/FreeAgency';
import DraftRoom from './components/DraftRoom/DraftRoom';
import SeasonSimulator from './components/SeasonSimulator/SeasonSimulator';
import Navigation from './components/common/Navigation';

function App() {
  const phase = useGameStore(state => state.phase);
  const [currentView, setCurrentView] = useState('dashboard');

  if (phase === 'team_selection') {
    return <TeamSelection />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'roster': return <RosterManagement />;
      case 'trades': return <TradeHub />;
      case 'freeagency': return <FreeAgency />;
      case 'draft': return <DraftRoom />;
      case 'season': return <SeasonSimulator />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-arena-dark">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      <main className="pb-8">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
