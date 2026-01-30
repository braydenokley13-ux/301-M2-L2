import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { TEAM_CONTEXTS, STRATEGIES } from '../../game/teamContext';
import { SALARY_CAP, LUXURY_TAX_THRESHOLD, SALARY_FLOOR, calculateLuxuryTax } from '../../game/economics';
import PlayerCard from '../common/PlayerCard';

const Dashboard: React.FC = () => {
  const {
    getUserTeam, fanApproval, ownerConfidence,
    strategy, seasonResults, newsLog,
    getStandings, salaryCapSpace, gmLevel,
    currentSeason, maxSeasons, financials, volatility, riskDecisions,
  } = useGameStore();

  const team = getUserTeam();
  if (!team) return null;

  const context = TEAM_CONTEXTS[team.contextType];
  const strat = STRATEGIES[strategy];
  const { eastern, western } = getStandings();
  const conferenceStandings = team.conference === 'Eastern' ? eastern : western;
  const teamRank = conferenceStandings.findIndex(t => t.id === team.id) + 1;

  const starters = team.roster.filter(p => p.isStarter).sort((a, b) => b.overallRating - a.overallRating);
  const bench = team.roster.filter(p => !p.isStarter).sort((a, b) => b.overallRating - a.overallRating);
  const avgRating = team.roster.length > 0
    ? Math.round(team.roster.reduce((s, p) => s + p.overallRating, 0) / team.roster.length)
    : 0;

  const recentNews = newsLog.slice(-5).reverse();
  const seasonsRemaining = maxSeasons - currentSeason + 1;

  // Calculate luxury tax preview
  const projectedTax = calculateLuxuryTax(team.totalSalary, financials.consecutiveTaxYears);

  // Count high-risk decisions this season
  const highRiskThisSeason = riskDecisions.filter(d =>
    d.season === currentSeason && d.riskLevel === 'high'
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Season Progress Banner */}
      <div className="bg-gradient-to-r from-basketball-orange/20 to-orange-900/20 border border-basketball-orange/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-basketball-orange text-sm font-medium">Track 301 - Module 2 - Lesson 2</span>
            <h2 className="text-white font-bold text-lg">Season {currentSeason} of {maxSeasons}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{seasonsRemaining}</div>
              <div className="text-xs text-gray-400">Seasons Left</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${volatility.volatilityRating === 'stable' ? 'text-blue-400' : volatility.volatilityRating === 'moderate' ? 'text-green-400' : volatility.volatilityRating === 'volatile' ? 'text-orange-400' : 'text-red-400'}`}>
                {volatility.volatilityRating.charAt(0).toUpperCase() + volatility.volatilityRating.slice(1)}
              </div>
              <div className="text-xs text-gray-400">Volatility</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{highRiskThisSeason}</div>
              <div className="text-xs text-gray-400">High-Risk Moves</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Header */}
      <div className="bg-arena-mid rounded-xl p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ backgroundColor: team.primaryColor }}
            >
              {team.abbreviation}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">
                {team.city} {team.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-400">{context.label}</span>
                <span className="text-gray-600">|</span>
                <span className="text-basketball-orange font-medium">{strat.label}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-stats font-bold text-white">{team.wins}-{team.losses}</div>
              <div className="text-gray-400 text-sm">Record</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-stats font-bold text-white">#{teamRank || '-'}</div>
              <div className="text-gray-400 text-sm">{team.conference} Rank</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-stats font-bold text-white">{avgRating}</div>
              <div className="text-gray-400 text-sm">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Status & Finance */}
        <div className="space-y-6">
          {/* GM Status */}
          <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">GM Status</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Fan Approval</span>
                  <span className={`font-stats ${fanApproval >= 60 ? 'text-green-400' : fanApproval >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {fanApproval}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${fanApproval >= 60 ? 'bg-green-500' : fanApproval >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${fanApproval}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Owner Confidence</span>
                  <span className={`font-stats ${ownerConfidence >= 60 ? 'text-green-400' : ownerConfidence >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {ownerConfidence}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${ownerConfidence >= 60 ? 'bg-green-500' : ownerConfidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${ownerConfidence}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                <span className="text-gray-400">GM Level</span>
                <span className="font-stats text-basketball-orange font-bold">Lv. {gmLevel}</span>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">Financial Status</h2>
            <div className="space-y-4">
              {/* Payroll Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Payroll</span>
                  <span className="font-stats text-white">${team.totalSalary.toFixed(1)}M</span>
                </div>
                <div className="relative w-full bg-gray-700 rounded-full h-4">
                  {/* Floor marker */}
                  <div
                    className="absolute h-full border-l-2 border-yellow-500"
                    style={{ left: `${(SALARY_FLOOR / 200) * 100}%` }}
                    title="Salary Floor"
                  />
                  {/* Cap marker */}
                  <div
                    className="absolute h-full border-l-2 border-green-500"
                    style={{ left: `${(SALARY_CAP / 200) * 100}%` }}
                    title="Salary Cap"
                  />
                  {/* Tax marker */}
                  <div
                    className="absolute h-full border-l-2 border-red-500"
                    style={{ left: `${(LUXURY_TAX_THRESHOLD / 200) * 100}%` }}
                    title="Luxury Tax"
                  />
                  {/* Current payroll */}
                  <div
                    className={`h-4 rounded-full transition-all ${
                      team.totalSalary > LUXURY_TAX_THRESHOLD ? 'bg-red-500' :
                      team.totalSalary > SALARY_CAP ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((team.totalSalary / 200) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Floor ${SALARY_FLOOR}M</span>
                  <span>Cap ${SALARY_CAP}M</span>
                  <span>Tax ${LUXURY_TAX_THRESHOLD}M</span>
                </div>
              </div>

              {/* Cap Space */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cap Space</span>
                <span className={`font-stats ${salaryCapSpace > 20 ? 'text-green-400' : salaryCapSpace > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                  ${salaryCapSpace.toFixed(1)}M
                </span>
              </div>

              {/* Luxury Tax Warning */}
              {team.totalSalary > LUXURY_TAX_THRESHOLD && (
                <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
                  <div className="text-red-400 font-bold text-sm">Luxury Tax Active</div>
                  <div className="text-red-300 text-xs">
                    Projected tax: ${projectedTax.toFixed(1)}M
                    {financials.consecutiveTaxYears >= 2 && ' (Repeater penalty applies!)'}
                  </div>
                </div>
              )}

              {/* Below Floor Warning */}
              {team.totalSalary < SALARY_FLOOR && (
                <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
                  <div className="text-yellow-400 font-bold text-sm">Below Salary Floor</div>
                  <div className="text-yellow-300 text-xs">
                    Must spend ${(SALARY_FLOOR - team.totalSalary).toFixed(1)}M more
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Risk Context */}
          <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">Team Context & Risk</h2>
            <div className="space-y-3">
              <div className="bg-arena-dark rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">Context Type</div>
                <div className="text-white font-medium">{context.label}</div>
                <p className="text-xs text-gray-500 mt-1">{context.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-arena-dark rounded p-2">
                  <span className="text-gray-400">Fan Patience</span>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full mr-1 ${i < Math.ceil(context.fanPatience / 2) ? 'bg-green-400' : 'bg-gray-600'}`} />
                    ))}
                  </div>
                </div>
                <div className="bg-arena-dark rounded p-2">
                  <span className="text-gray-400">Risk Tolerance</span>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full mr-1 ${i < Math.ceil(context.ownershipRiskTolerance / 2) ? 'bg-orange-400' : 'bg-gray-600'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">
                {context.fanPatience >= 7
                  ? 'Your fans are patient - you can afford to take risks and rebuild.'
                  : context.fanPatience >= 4
                  ? 'Balance is key - some risk is acceptable but prolonged losing will hurt.'
                  : 'High pressure situation - failures have immediate consequences.'}
              </p>
            </div>
          </div>

          {/* News Feed */}
          <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">Latest News</h2>
            <div className="space-y-3">
              {recentNews.map(item => (
                <div key={item.id} className="border-l-2 border-basketball-orange pl-3">
                  <h3 className="text-white text-sm font-medium">{item.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">{item.body}</p>
                </div>
              ))}
              {recentNews.length === 0 && (
                <p className="text-gray-500 text-sm">No news yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column - Roster */}
        <div className="space-y-6">
          <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">
              Starters ({starters.length})
            </h2>
            <div className="space-y-2">
              {starters.map(player => (
                <PlayerCard key={player.id} player={player} compact />
              ))}
            </div>
          </div>
          <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">
              Bench ({bench.length})
            </h2>
            <div className="space-y-2">
              {bench.map(player => (
                <PlayerCard key={player.id} player={player} compact />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Standings & History */}
        <div className="space-y-6">
          <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">{team.conference} Standings</h2>
            <div className="space-y-1">
              {conferenceStandings.map((t, idx) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between text-sm p-2 rounded-lg
                    ${t.id === team.id ? 'bg-basketball-orange/20 border border-basketball-orange' : idx < 8 ? 'bg-arena-dark' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 text-center font-stats ${idx < 8 ? 'text-white' : 'text-gray-500'}`}>{idx + 1}</span>
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                    <span className={t.id === team.id ? 'text-white font-bold' : 'text-gray-300'}>{t.abbreviation}</span>
                  </div>
                  <span className="font-stats text-gray-400">{t.wins}-{t.losses}</span>
                </div>
              ))}
            </div>
            {conferenceStandings.some(t => t.wins > 0) && (
              <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                Top 8 qualify for playoffs
              </div>
            )}
          </div>

          {/* Season History */}
          {seasonResults.length > 0 && (
            <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
              <h2 className="font-heading text-lg font-bold text-white mb-4">Season History</h2>
              <div className="space-y-2">
                {seasonResults.map(result => (
                  <div key={result.season} className="bg-arena-dark rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Season {result.season}</span>
                      <span className="font-stats text-white">{result.wins}-{result.losses}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-sm font-medium ${result.playoffResult === 'champion' ? 'text-yellow-400' : result.playoffResult !== 'missed' ? 'text-green-400' : 'text-gray-400'}`}>
                        {result.playoffResult === 'champion' ? 'Champion!' : result.playoffResult.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <span className={`text-xs ${(result.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(result.profit || 0) >= 0 ? '+' : ''}${(result.profit || 0).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        result.riskRating === 'aggressive' ? 'bg-red-900/30 text-red-400' :
                        result.riskRating === 'balanced' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-blue-900/30 text-blue-400'
                      }`}>
                        {result.riskRating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
