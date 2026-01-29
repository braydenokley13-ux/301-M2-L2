import React, { useState } from 'react';
import { TEAM_SEEDS } from '../../data/teams';
import { TEAM_CONTEXTS, STRATEGIES, getDifficultyRating } from '../../game/teamContext';
import { useGameStore } from '../../store/gameStore';
import { StrategyType, TeamContextType } from '../../data/types';

const TeamSelection: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('stability_first');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [step, setStep] = useState<'team' | 'strategy' | 'confirm'>('team');
  const initializeGame = useGameStore(state => state.initializeGame);

  const teamsByConference = {
    Eastern: TEAM_SEEDS.filter(t => t.conference === 'Eastern'),
    Western: TEAM_SEEDS.filter(t => t.conference === 'Western'),
  };

  const selectedTeamData = TEAM_SEEDS.find(t => t.id === selectedTeam);
  const teamContext = selectedTeamData ? TEAM_CONTEXTS[selectedTeamData.contextType] : null;

  const handleStart = () => {
    if (selectedTeam) {
      initializeGame(selectedTeam, selectedDifficulty, selectedStrategy);
    }
  };

  const contextTypeColors: Record<TeamContextType, string> = {
    legacy_power: 'text-purple-400',
    small_market_reset: 'text-blue-400',
    revenue_sensitive: 'text-yellow-400',
    cash_rich_expansion: 'text-green-400',
    star_dependent: 'text-red-400',
  };

  if (step === 'strategy') {
    return (
      <div className="min-h-screen bg-arena-dark flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <button onClick={() => setStep('team')} className="text-gray-400 hover:text-white mb-4 transition-colors">
            ← Back to Team Selection
          </button>
          <h1 className="font-heading text-4xl font-bold text-white mb-2">Choose Your Strategy</h1>
          <p className="text-gray-400 mb-8">How will you build the {selectedTeamData?.city} {selectedTeamData?.name}?</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(Object.entries(STRATEGIES) as [StrategyType, typeof STRATEGIES[StrategyType]][]).map(([key, strategy]) => (
              <div
                key={key}
                onClick={() => setSelectedStrategy(key)}
                className={`rounded-xl p-6 cursor-pointer transition-all border-2
                  ${selectedStrategy === key
                    ? 'bg-basketball-orange/20 border-basketball-orange'
                    : 'bg-arena-mid border-gray-700 hover:border-gray-500'
                  }`}
              >
                <h3 className="font-heading text-xl font-bold text-white mb-2">{strategy.label}</h3>
                <p className="text-gray-300 text-sm mb-4">{strategy.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trade Risk</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i <= strategy.tradeRisk * 5 ? 'bg-basketball-orange' : 'bg-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Now</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i <= strategy.winNowOrientation * 5 ? 'bg-green-500' : 'bg-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Youth Dev</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i <= strategy.youthDevelopment * 5 ? 'bg-blue-500' : 'bg-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Championship Bonus</span>
                    <span className="font-stats text-yellow-400">+{Math.round(strategy.championshipBonus * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-xl font-bold text-white mb-4">Difficulty</h2>
            <div className="flex gap-4">
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all capitalize
                    ${selectedDifficulty === diff
                      ? 'bg-basketball-orange text-white'
                      : 'bg-arena-mid text-gray-300 hover:bg-arena-light'
                    }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-basketball-orange hover:bg-orange-600 text-white font-heading font-bold text-xl rounded-xl transition-colors"
          >
            Start Game as {selectedTeamData?.city} {selectedTeamData?.name} GM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arena-dark p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="font-heading text-5xl font-extrabold text-white mb-2">NBA GM Simulator</h1>
          <p className="text-gray-400 text-lg">Choose your team and build a dynasty</p>
        </div>

        {selectedTeamData && teamContext && (
          <div className="bg-arena-mid rounded-xl p-6 mb-8 border border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: selectedTeamData.primaryColor }}>
                {selectedTeamData.abbreviation}
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  {selectedTeamData.city} {selectedTeamData.name}
                </h2>
                <span className={`text-sm font-medium ${contextTypeColors[selectedTeamData.contextType]}`}>
                  {teamContext.label}
                </span>
              </div>
              <div className="ml-auto flex gap-6">
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Difficulty</div>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-3 h-3 rounded-full ${i <= getDifficultyRating(selectedTeamData.contextType) ? 'bg-basketball-orange' : 'bg-gray-600'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Fanbase</div>
                  <div className="font-stats font-bold text-white">{selectedTeamData.fanbase}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Prestige</div>
                  <div className="font-stats font-bold text-white">{selectedTeamData.prestige}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Proj. Wins</div>
                  <div className="font-stats font-bold text-white">{selectedTeamData.baseWins}</div>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">{teamContext.description}</p>
            <button
              onClick={() => setStep('strategy')}
              className="px-6 py-3 bg-basketball-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
            >
              Select {selectedTeamData.city} {selectedTeamData.name} →
            </button>
          </div>
        )}

        {(['Eastern', 'Western'] as const).map(conf => (
          <div key={conf} className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-white mb-4">{conf} Conference</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {teamsByConference[conf].map(team => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`rounded-lg p-3 cursor-pointer transition-all border-2
                    ${selectedTeam === team.id
                      ? 'border-basketball-orange bg-arena-light'
                      : 'border-transparent bg-arena-mid hover:bg-arena-light'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: team.primaryColor }}
                    >
                      {team.abbreviation}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{team.city}</div>
                      <div className="text-gray-400 text-xs">{team.name}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={contextTypeColors[team.contextType]}>
                      {TEAM_CONTEXTS[team.contextType].label}
                    </span>
                    <span className="text-gray-400">{team.baseWins}W</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSelection;
