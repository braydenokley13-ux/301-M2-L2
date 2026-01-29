import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { TEAM_CONTEXTS, STRATEGIES } from '../../game/teamContext';
import PlayerCard from '../common/PlayerCard';

const Dashboard: React.FC = () => {
  const {
    getUserTeam, fanApproval, ownerConfidence,
    strategy, seasonResults, newsLog,
    getStandings, salaryCapSpace, salaryCap, gmLevel,
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

  return (
    <div className="max-w-7xl mx-auto p-4">
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
        {/* Left Column - Status & News */}
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Salary Cap</span>
                <span className="font-stats text-white">${(salaryCap - salaryCapSpace).toFixed(1)}M / ${salaryCap}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cap Space</span>
                <span className={`font-stats ${salaryCapSpace > 20 ? 'text-green-400' : salaryCapSpace > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                  ${salaryCapSpace.toFixed(1)}M
                </span>
              </div>
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

          {/* Season History */}
          {seasonResults.length > 0 && (
            <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
              <h2 className="font-heading text-lg font-bold text-white mb-4">Season History</h2>
              <div className="space-y-2">
                {seasonResults.map(result => (
                  <div key={result.season} className="flex justify-between items-center text-sm bg-arena-dark rounded-lg p-3">
                    <span className="text-gray-400">Season {result.season}</span>
                    <span className="font-stats text-white">{result.wins}-{result.losses}</span>
                    <span className={`font-medium ${result.playoffResult === 'champion' ? 'text-yellow-400' : result.playoffResult !== 'missed' ? 'text-green-400' : 'text-gray-400'}`}>
                      {result.playoffResult === 'champion' ? 'Champion!' : result.playoffResult.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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

        {/* Right Column - Standings */}
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
