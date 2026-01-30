import React, { useState } from 'react';
import { TEAM_SEEDS } from '../../data/teams';
import { TEAM_CONTEXTS, STRATEGIES } from '../../game/teamContext';
import { useGameStore } from '../../store/gameStore';
import { StrategyType, TeamContextType } from '../../data/types';

// Risk recommendation for each context type
const RISK_RECOMMENDATIONS: Record<TeamContextType, {
  level: 'should_risk' | 'can_risk' | 'avoid_risk';
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  small_market_reset: {
    level: 'should_risk',
    label: 'SHOULD Take Risks',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30 border-green-600',
    description: 'Stuck in mediocrity. You NEED volatility to escape. Big swings are rational here.',
  },
  cash_rich_expansion: {
    level: 'can_risk',
    label: 'CAN Afford Risks',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30 border-blue-600',
    description: 'Financial buffer allows aggressive moves. Failure is survivable.',
  },
  legacy_power: {
    level: 'can_risk',
    label: 'CAN Afford Risks',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30 border-blue-600',
    description: 'Brand equity provides cushion. But expectations are high.',
  },
  star_dependent: {
    level: 'can_risk',
    label: 'Moderate Risk OK',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30 border-yellow-600',
    description: 'Must keep star happy. Some aggression needed, but balance required.',
  },
  revenue_sensitive: {
    level: 'avoid_risk',
    label: 'AVOID High Risks',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30 border-red-600',
    description: 'One bad season = catastrophe. Play it safe. Stability over swings.',
  },
};

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
  const riskRec = selectedTeamData ? RISK_RECOMMENDATIONS[selectedTeamData.contextType] : null;

  const handleStart = () => {
    if (selectedTeam) {
      initializeGame(selectedTeam, selectedDifficulty, selectedStrategy);
    }
  };

  // Strategy recommendation based on context
  const getStrategyRecommendation = (stratKey: StrategyType): 'recommended' | 'neutral' | 'warning' => {
    if (!riskRec) return 'neutral';

    const highRisk = stratKey === 'boom_bust_swing';
    const medRisk = stratKey === 'aggressive_push';

    if (riskRec.level === 'should_risk') {
      return highRisk ? 'recommended' : medRisk ? 'neutral' : 'warning';
    } else if (riskRec.level === 'avoid_risk') {
      return highRisk ? 'warning' : medRisk ? 'warning' : 'recommended';
    }
    return 'neutral';
  };

  if (step === 'strategy') {
    return (
      <div className="min-h-screen bg-arena-dark flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <button onClick={() => setStep('team')} className="text-gray-400 hover:text-white mb-4 transition-colors">
            ← Back to Team Selection
          </button>

          <h1 className="font-heading text-3xl font-bold text-white mb-2">Choose Your Strategy</h1>
          <p className="text-gray-400 mb-4">How will you build the {selectedTeamData?.city} {selectedTeamData?.name}?</p>

          {/* Risk Context Reminder */}
          {riskRec && (
            <div className={`rounded-lg p-4 mb-6 border ${riskRec.bgColor}`}>
              <div className="flex items-center gap-3">
                <div className={`text-2xl`}>
                  {riskRec.level === 'should_risk' ? '↑' : riskRec.level === 'avoid_risk' ? '↓' : '↔'}
                </div>
                <div>
                  <h3 className={`font-bold ${riskRec.color}`}>Your Team: {riskRec.label}</h3>
                  <p className="text-sm text-gray-400">{riskRec.description}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {(Object.entries(STRATEGIES) as [StrategyType, typeof STRATEGIES[StrategyType]][]).map(([key, strategy]) => {
              const rec = getStrategyRecommendation(key);
              return (
                <div
                  key={key}
                  onClick={() => setSelectedStrategy(key)}
                  className={`rounded-xl p-5 cursor-pointer transition-all border-2 relative
                    ${selectedStrategy === key
                      ? 'bg-basketball-orange/20 border-basketball-orange'
                      : 'bg-arena-mid border-gray-700 hover:border-gray-500'
                    }`}
                >
                  {rec === 'recommended' && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      FITS CONTEXT
                    </div>
                  )}
                  {rec === 'warning' && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      RISKY FIT
                    </div>
                  )}

                  <h3 className="font-heading text-lg font-bold text-white mb-2">{strategy.label}</h3>
                  <p className="text-gray-300 text-sm mb-4">{strategy.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Volatility</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i <= strategy.outcomeVariance * 5 ? 'bg-orange-500' : 'bg-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Risk Level</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i <= strategy.tradeRisk * 5 ? 'bg-red-500' : 'bg-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-lg font-bold text-white mb-3">Difficulty</h2>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-5 py-2 rounded-lg font-medium transition-all capitalize text-sm
                    ${selectedDifficulty === diff
                      ? 'bg-basketball-orange text-white'
                      : 'bg-arena-mid text-gray-300 hover:bg-arena-light'
                    }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Affects AI trade acceptance and free agent interest</p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-basketball-orange hover:bg-orange-600 text-white font-heading font-bold text-xl rounded-xl transition-colors"
          >
            Begin 3-Season Challenge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arena-dark p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 pt-6">
          <p className="text-basketball-orange text-sm font-medium mb-1">Track 301 - Module 2 - Lesson 2</p>
          <h1 className="font-heading text-4xl font-extrabold text-white mb-2">Choose Your Team</h1>
          <p className="text-gray-400">Each team has a different RISK PROFILE. Choose wisely.</p>
        </div>

        {/* Selected Team Panel */}
        {selectedTeamData && teamContext && riskRec && (
          <div className="bg-arena-mid rounded-xl p-6 mb-6 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Team Info */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: selectedTeamData.primaryColor }}
                >
                  {selectedTeamData.abbreviation}
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white">
                    {selectedTeamData.city} {selectedTeamData.name}
                  </h2>
                  <span className="text-sm text-gray-400">{teamContext.label}</span>
                </div>
              </div>

              {/* Risk Profile - KEY INFO */}
              <div className={`flex-1 rounded-lg p-4 border ${riskRec.bgColor}`}>
                <h3 className={`font-bold text-lg ${riskRec.color}`}>{riskRec.label}</h3>
                <p className="text-sm text-gray-300 mt-1">{riskRec.description}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Market</div>
                  <div className="font-stats font-bold text-white capitalize">{selectedTeamData.marketSize}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Fanbase</div>
                  <div className="font-stats font-bold text-white">{selectedTeamData.fanbase}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Prestige</div>
                  <div className="font-stats font-bold text-white">{selectedTeamData.prestige}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-gray-400 text-sm">{teamContext.description}</p>
              <button
                onClick={() => setStep('strategy')}
                className="px-6 py-3 bg-basketball-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                Select This Team →
              </button>
            </div>
          </div>
        )}

        {/* Risk Profile Legend */}
        <div className="bg-arena-mid rounded-lg p-4 mb-6 border border-gray-700">
          <h3 className="text-white font-bold mb-3">Team Risk Profiles</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-300">Should Take Risks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-300">Can Afford Risks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-300">Moderate Risk OK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-300">Avoid High Risks</span>
            </div>
          </div>
        </div>

        {/* Team Grids */}
        {(['Eastern', 'Western'] as const).map(conf => (
          <div key={conf} className="mb-6">
            <h2 className="font-heading text-xl font-bold text-white mb-3">{conf} Conference</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {teamsByConference[conf].map(team => {
                const rec = RISK_RECOMMENDATIONS[team.contextType];
                const riskColor =
                  rec.level === 'should_risk' ? 'bg-green-500' :
                  rec.level === 'can_risk' ? 'bg-blue-500' :
                  'bg-red-500';

                return (
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
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{team.city}</div>
                        <div className="text-gray-400 text-xs truncate">{team.name}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${riskColor}`} title={rec.label}></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {TEAM_CONTEXTS[team.contextType].label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSelection;
