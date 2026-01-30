import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

const SeasonSimulator: React.FC = () => {
  const {
    getUserTeam, teams, phase, setPhase, simulateSeason,
    getStandings, standings, playoffBracket, seasonResults,
    currentSeason, maxSeasons, newsLog, teamId, startNextSeason,
  } = useGameStore();
  const [simulating, setSimulating] = useState(false);

  const team = getUserTeam();
  if (!team) return null;

  const { eastern, western } = getStandings();
  const hasSeasonResults = Object.keys(standings).length > 0;
  const isLastSeason = currentSeason >= maxSeasons;
  const seasonsRemaining = maxSeasons - currentSeason;

  const handleSimulateSeason = () => {
    setSimulating(true);
    setTimeout(() => {
      simulateSeason();
      setSimulating(false);
    }, 100);
  };

  const handleEnterDraft = () => {
    setPhase('offseason_draft');
  };

  const handleStartFreeAgency = () => {
    setPhase('offseason_free_agency');
  };

  const handleStartNextSeason = () => {
    startNextSeason();
  };

  const latestResult = seasonResults[seasonResults.length - 1];
  const userStanding = team.conference === 'Eastern'
    ? eastern.findIndex(t => t.id === team.id) + 1
    : western.findIndex(t => t.id === team.id) + 1;

  const seasonNews = newsLog.filter(n => n.type === 'season').slice(-5).reverse();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="font-heading text-3xl font-bold text-white mb-6">Season Simulator</h1>

      {/* Action Panel */}
      <div className="bg-arena-mid rounded-xl p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">Season {currentSeason} of {maxSeasons}</h2>
            <p className="text-gray-400 mt-1">
              Phase: <span className="text-basketball-orange capitalize">{phase.replace(/_/g, ' ')}</span>
              {seasonsRemaining > 0 && phase !== 'season_end' && (
                <span className="text-gray-500 ml-2">({seasonsRemaining} season{seasonsRemaining > 1 ? 's' : ''} remaining after this)</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            {(phase === 'preseason' || phase === 'regular_season') && (
              <button
                onClick={handleSimulateSeason}
                disabled={simulating}
                className="px-8 py-3 bg-basketball-orange hover:bg-orange-600 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors text-lg"
              >
                {simulating ? 'Simulating 82 Games...' : 'Simulate Season (82 Games)'}
              </button>
            )}
            {phase === 'season_end' && !isLastSeason && (
              <button
                onClick={handleEnterDraft}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Enter Draft
              </button>
            )}
            {phase === 'season_end' && isLastSeason && (
              <button
                onClick={handleStartNextSeason}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                View Final Evaluation & Claim Code
              </button>
            )}
            {phase === 'offseason_draft' && (
              <button
                onClick={handleStartFreeAgency}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                Enter Free Agency
              </button>
            )}
            {phase === 'offseason_free_agency' && (
              <button
                onClick={handleStartNextSeason}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
              >
                {isLastSeason ? 'Complete Your Tenure' : `Start Season ${currentSeason + 1}`}
              </button>
            )}
          </div>
        </div>

        {/* Season Result Summary */}
        {latestResult && phase === 'season_end' && (
          <div className="mt-6">
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="bg-arena-dark rounded-lg p-4 text-center">
                <div className="text-3xl font-stats font-bold text-white">{latestResult.wins}-{latestResult.losses}</div>
                <div className="text-gray-400 text-sm">Record</div>
              </div>
              <div className="bg-arena-dark rounded-lg p-4 text-center">
                <div className="text-3xl font-stats font-bold text-white">#{userStanding}</div>
                <div className="text-gray-400 text-sm">{team.conference} Seed</div>
              </div>
              <div className="bg-arena-dark rounded-lg p-4 text-center">
                <div className={`text-2xl font-heading font-bold ${latestResult.playoffResult === 'champion' ? 'text-yellow-400' : latestResult.playoffResult !== 'missed' ? 'text-green-400' : 'text-gray-400'}`}>
                  {latestResult.playoffResult === 'champion' ? 'CHAMPION!' :
                   latestResult.playoffResult.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
                <div className="text-gray-400 text-sm">Playoffs</div>
              </div>
              <div className="bg-arena-dark rounded-lg p-4 text-center">
                <div className="text-2xl font-stats font-bold text-basketball-orange">{latestResult.fanApproval}%</div>
                <div className="text-gray-400 text-sm">Fan Approval</div>
              </div>
              <div className="bg-arena-dark rounded-lg p-4 text-center">
                <div className={`text-2xl font-stats font-bold ${(latestResult.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(latestResult.profit || 0) >= 0 ? '+' : ''}${(latestResult.profit || 0).toFixed(1)}M
                </div>
                <div className="text-gray-400 text-sm">Profit/Loss</div>
              </div>
            </div>

            {/* Financial & Risk Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-arena-dark rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Payroll</div>
                <div className="text-white font-stats">${(latestResult.payroll || 0).toFixed(1)}M</div>
              </div>
              <div className="bg-arena-dark rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Luxury Tax Paid</div>
                <div className={`font-stats ${(latestResult.luxuryTaxPaid || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ${(latestResult.luxuryTaxPaid || 0).toFixed(1)}M
                </div>
              </div>
              <div className="bg-arena-dark rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Risk Profile</div>
                <div className={`font-stats ${
                  latestResult.riskRating === 'aggressive' ? 'text-red-400' :
                  latestResult.riskRating === 'balanced' ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                  {latestResult.riskRating?.charAt(0).toUpperCase() + (latestResult.riskRating?.slice(1) || '')}
                </div>
              </div>
            </div>

            {/* End of tenure message */}
            {isLastSeason && (
              <div className="mt-4 bg-basketball-orange/10 border border-basketball-orange/30 rounded-lg p-4">
                <h3 className="text-basketball-orange font-bold">Your 3-Season Tenure is Complete!</h3>
                <p className="text-gray-300 text-sm mt-1">
                  Click the button above to see your final evaluation and receive your claim code.
                  You'll see how well you understood the lesson on risk, volatility, and rational aggression.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standings */}
        {hasSeasonResults && (
          <>
            <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
              <h2 className="font-heading text-lg font-bold text-white mb-4">Eastern Conference</h2>
              <div className="space-y-1">
                {eastern.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-sm
                      ${t.id === teamId ? 'bg-basketball-orange/20 border border-basketball-orange' : idx < 8 ? 'bg-arena-dark' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 text-center font-stats ${idx < 8 ? 'text-white' : 'text-gray-500'}`}>{idx + 1}</span>
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                      <span className={t.id === teamId ? 'text-white font-bold' : 'text-gray-300'}>
                        {t.city} {t.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-stats text-white">{t.wins}-{t.losses}</span>
                      <span className="font-stats text-gray-400 w-12 text-right">
                        {(t.wins / Math.max(1, t.wins + t.losses) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
              <h2 className="font-heading text-lg font-bold text-white mb-4">Western Conference</h2>
              <div className="space-y-1">
                {western.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-sm
                      ${t.id === teamId ? 'bg-basketball-orange/20 border border-basketball-orange' : idx < 8 ? 'bg-arena-dark' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 text-center font-stats ${idx < 8 ? 'text-white' : 'text-gray-500'}`}>{idx + 1}</span>
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                      <span className={t.id === teamId ? 'text-white font-bold' : 'text-gray-300'}>
                        {t.city} {t.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-stats text-white">{t.wins}-{t.losses}</span>
                      <span className="font-stats text-gray-400 w-12 text-right">
                        {(t.wins / Math.max(1, t.wins + t.losses) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Playoff Bracket */}
        {playoffBracket.length > 0 && (
          <div className="lg:col-span-2 bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">Playoff Bracket</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {playoffBracket.map(round => (
                <div key={round.round}>
                  <h3 className="text-gray-400 text-sm font-medium mb-3 text-center">{round.round}</h3>
                  <div className="space-y-2">
                    {round.matchups.map((matchup, idx) => {
                      const t1 = teams.find(t => t.id === matchup.team1Id);
                      const t2 = teams.find(t => t.id === matchup.team2Id);
                      return (
                        <div key={idx} className="bg-arena-dark rounded-lg p-2">
                          <div className={`flex items-center gap-2 p-1 rounded ${matchup.winnerId === matchup.team1Id ? 'bg-green-900/30' : ''}`}>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t1?.primaryColor }} />
                            <span className={`text-xs flex-1 ${matchup.winnerId === matchup.team1Id ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                              {t1?.abbreviation}
                            </span>
                            {matchup.winnerId === matchup.team1Id && <span className="text-green-400 text-xs">W</span>}
                          </div>
                          <div className={`flex items-center gap-2 p-1 rounded ${matchup.winnerId === matchup.team2Id ? 'bg-green-900/30' : ''}`}>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t2?.primaryColor }} />
                            <span className={`text-xs flex-1 ${matchup.winnerId === matchup.team2Id ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                              {t2?.abbreviation}
                            </span>
                            {matchup.winnerId === matchup.team2Id && <span className="text-green-400 text-xs">W</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Season News */}
        {seasonNews.length > 0 && (
          <div className="lg:col-span-2 bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">Season News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {seasonNews.map(n => (
                <div key={n.id} className="border-l-2 border-basketball-orange pl-3">
                  <h3 className="text-white text-sm font-medium">{n.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynasty History */}
        {seasonResults.length > 0 && (
          <div className="lg:col-span-2 bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white mb-4">Dynasty History</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="px-4 py-2 text-gray-400 text-xs font-medium uppercase">Season</th>
                  <th className="px-4 py-2 text-gray-400 text-xs font-medium uppercase">Record</th>
                  <th className="px-4 py-2 text-gray-400 text-xs font-medium uppercase">Win %</th>
                  <th className="px-4 py-2 text-gray-400 text-xs font-medium uppercase">Playoffs</th>
                  <th className="px-4 py-2 text-gray-400 text-xs font-medium uppercase">Risk</th>
                  <th className="px-4 py-2 text-gray-400 text-xs font-medium uppercase">Profit</th>
                  <th className="px-4 py-2 text-gray-400 text-xs font-medium uppercase">Fan %</th>
                </tr>
              </thead>
              <tbody>
                {seasonResults.map(result => (
                  <tr key={result.season} className="border-b border-gray-800">
                    <td className="px-4 py-3 text-white font-stats">S{result.season}</td>
                    <td className="px-4 py-3 text-white font-stats">{result.wins}-{result.losses}</td>
                    <td className="px-4 py-3 text-gray-300 font-stats">
                      {((result.wins / (result.wins + result.losses)) * 100).toFixed(1)}%
                    </td>
                    <td className={`px-4 py-3 font-medium ${result.playoffResult === 'champion' ? 'text-yellow-400' : result.playoffResult !== 'missed' ? 'text-green-400' : 'text-gray-500'}`}>
                      {result.playoffResult === 'champion' ? 'CHAMPION' : result.playoffResult.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      result.riskRating === 'aggressive' ? 'text-red-400' :
                      result.riskRating === 'balanced' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {result.riskRating || 'N/A'}
                    </td>
                    <td className={`px-4 py-3 font-stats ${(result.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(result.profit || 0) >= 0 ? '+' : ''}${(result.profit || 0).toFixed(1)}M
                    </td>
                    <td className={`px-4 py-3 font-stats ${result.fanApproval >= 60 ? 'text-green-400' : result.fanApproval >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {result.fanApproval}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* If no season played yet */}
        {!hasSeasonResults && (
          <div className="lg:col-span-2 bg-arena-mid rounded-xl p-10 border border-gray-700 text-center">
            <div className="text-6xl mb-4">🏀</div>
            <h2 className="font-heading text-2xl font-bold text-white mb-2">Ready to Play?</h2>
            <p className="text-gray-400 mb-4 max-w-xl mx-auto">
              Make your roster moves in the Trade Hub and Free Agency, then simulate the season to see how your team performs!
              Each season is 82 games. You have {maxSeasons} seasons to prove yourself.
            </p>
            <div className="bg-arena-dark rounded-lg p-4 max-w-md mx-auto mb-6 text-left">
              <h3 className="text-basketball-orange font-bold mb-2">Remember the Lesson:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Same average outcome, different volatility = different experience</li>
                <li>• Risk is rational when your system can absorb failure</li>
                <li>• Your team context determines what risks make sense</li>
              </ul>
            </div>
            {(phase === 'preseason' || phase === 'regular_season') && (
              <button
                onClick={handleSimulateSeason}
                disabled={simulating}
                className="px-10 py-4 bg-basketball-orange hover:bg-orange-600 disabled:bg-gray-600 text-white font-bold rounded-xl transition-colors text-xl"
              >
                {simulating ? 'Simulating...' : 'Simulate Season (82 Games)'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonSimulator;
