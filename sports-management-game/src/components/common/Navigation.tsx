import React from 'react';
import { useGameStore } from '../../store/gameStore';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'roster', label: 'Roster', icon: '👥' },
  { id: 'trades', label: 'Trade Hub', icon: '🔄' },
  { id: 'freeagency', label: 'Free Agency', icon: '📝' },
  { id: 'draft', label: 'Draft Room', icon: '🎯' },
  { id: 'season', label: 'Season', icon: '🏀' },
];

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const { getUserTeam, fanApproval, ownerConfidence, salaryCapSpace, currentSeason, phase } = useGameStore();
  const team = getUserTeam();

  return (
    <nav className="bg-arena-mid border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: team?.primaryColor || '#FF6B35' }}
              />
              <div>
                <h1 className="font-heading font-bold text-white text-sm leading-tight">
                  {team ? `${team.city} ${team.name}` : 'NBA GM'}
                </h1>
                <p className="text-xs text-gray-400">
                  Season {currentSeason} | {phase.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${currentView === item.id
                    ? 'bg-basketball-orange text-white'
                    : 'text-gray-300 hover:text-white hover:bg-arena-light'
                  }`}
              >
                <span className="hidden lg:inline">{item.icon} </span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-400 text-xs">Fans</div>
              <div className={`font-stats font-bold ${fanApproval >= 60 ? 'text-green-400' : fanApproval >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {fanApproval}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">Owner</div>
              <div className={`font-stats font-bold ${ownerConfidence >= 60 ? 'text-green-400' : ownerConfidence >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {ownerConfidence}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">Cap Space</div>
              <div className="font-stats font-bold text-white">${salaryCapSpace.toFixed(1)}M</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
