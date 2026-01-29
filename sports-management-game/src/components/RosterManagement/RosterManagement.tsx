import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import PlayerCard from '../common/PlayerCard';
import { Player, Position } from '../../data/types';

const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

const RosterManagement: React.FC = () => {
  const { getUserTeam, salaryCap, salaryCapSpace } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [filterPosition, setFilterPosition] = useState<Position | 'ALL'>('ALL');

  const team = getUserTeam();
  if (!team) return null;

  const filteredRoster = filterPosition === 'ALL'
    ? team.roster
    : team.roster.filter(p => p.position === filterPosition);

  const sortedRoster = [...filteredRoster].sort((a, b) => {
    if (a.isStarter !== b.isStarter) return a.isStarter ? -1 : 1;
    return b.overallRating - a.overallRating;
  });

  const positionGroups = POSITIONS.map(pos => ({
    position: pos,
    players: team.roster.filter(p => p.position === pos),
  }));

  const teamStats = {
    avgAge: team.roster.length > 0 ? (team.roster.reduce((s, p) => s + p.age, 0) / team.roster.length).toFixed(1) : '0',
    avgRating: team.roster.length > 0 ? Math.round(team.roster.reduce((s, p) => s + p.overallRating, 0) / team.roster.length) : 0,
    totalSalary: team.roster.reduce((s, p) => s + p.salary, 0).toFixed(1),
    starCount: team.roster.filter(p => p.isStar).length,
    rosterSize: team.roster.length,
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold text-white">Roster Management</h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-arena-mid px-4 py-2 rounded-lg">
            <span className="text-gray-400">Roster: </span>
            <span className="font-stats text-white">{teamStats.rosterSize}/15</span>
          </div>
          <div className="bg-arena-mid px-4 py-2 rounded-lg">
            <span className="text-gray-400">Salary: </span>
            <span className="font-stats text-white">${teamStats.totalSalary}M / ${salaryCap}M</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-arena-mid rounded-xl p-4 text-center border border-gray-700">
          <div className="text-2xl font-stats font-bold text-white">{teamStats.avgRating}</div>
          <div className="text-gray-400 text-xs">Avg Rating</div>
        </div>
        <div className="bg-arena-mid rounded-xl p-4 text-center border border-gray-700">
          <div className="text-2xl font-stats font-bold text-white">{teamStats.avgAge}</div>
          <div className="text-gray-400 text-xs">Avg Age</div>
        </div>
        <div className="bg-arena-mid rounded-xl p-4 text-center border border-gray-700">
          <div className="text-2xl font-stats font-bold text-yellow-400">{teamStats.starCount}</div>
          <div className="text-gray-400 text-xs">Stars</div>
        </div>
        <div className="bg-arena-mid rounded-xl p-4 text-center border border-gray-700">
          <div className="text-2xl font-stats font-bold text-green-400">${salaryCapSpace.toFixed(1)}M</div>
          <div className="text-gray-400 text-xs">Cap Space</div>
        </div>
        <div className="bg-arena-mid rounded-xl p-4 text-center border border-gray-700">
          <div className="text-2xl font-stats font-bold text-basketball-orange">{team.roster.filter(p => p.isStarter).length}</div>
          <div className="text-gray-400 text-xs">Starters</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster List */}
        <div className="lg:col-span-2">
          {/* Position Filter */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilterPosition('ALL')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${filterPosition === 'ALL' ? 'bg-basketball-orange text-white' : 'bg-arena-mid text-gray-300 hover:bg-arena-light'}`}
            >
              All
            </button>
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => setFilterPosition(pos)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${filterPosition === pos ? 'bg-basketball-orange text-white' : 'bg-arena-mid text-gray-300 hover:bg-arena-light'}`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Depth Chart View */}
          <div className="bg-arena-mid rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase">Player</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase">POS</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">OVR</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">POT</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">AGE</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">OFF</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">DEF</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-right">SALARY</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">YRS</th>
                </tr>
              </thead>
              <tbody>
                {sortedRoster.map((player, idx) => {
                  const prevIsStarter = idx > 0 ? sortedRoster[idx - 1].isStarter : true;
                  const showDivider = prevIsStarter && !player.isStarter;

                  return (
                    <React.Fragment key={player.id}>
                      {showDivider && (
                        <tr>
                          <td colSpan={9} className="px-4 py-2 bg-arena-dark">
                            <span className="text-gray-500 text-xs font-medium uppercase">Bench</span>
                          </td>
                        </tr>
                      )}
                      <tr
                        onClick={() => setSelectedPlayer(player)}
                        className={`cursor-pointer transition-colors border-b border-gray-800
                          ${selectedPlayer?.id === player.id ? 'bg-basketball-orange/10' : 'hover:bg-arena-light'}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {player.isStar && <span className="text-yellow-400 text-xs">★</span>}
                            <span className="text-white font-medium text-sm">{player.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-stats text-gray-300">{player.position}</td>
                        <td className={`px-4 py-3 text-sm font-stats text-center font-bold ${ratingColor(player.overallRating)}`}>{player.overallRating}</td>
                        <td className={`px-4 py-3 text-sm font-stats text-center ${ratingColor(player.potential)}`}>{player.potential}</td>
                        <td className="px-4 py-3 text-sm font-stats text-center text-gray-300">{player.age}</td>
                        <td className={`px-4 py-3 text-sm font-stats text-center ${ratingColor(player.offense)}`}>{player.offense}</td>
                        <td className={`px-4 py-3 text-sm font-stats text-center ${ratingColor(player.defense)}`}>{player.defense}</td>
                        <td className="px-4 py-3 text-sm font-stats text-right text-gray-300">${player.salary}M</td>
                        <td className="px-4 py-3 text-sm font-stats text-center text-gray-300">{player.contractYears}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Player Detail Panel */}
        <div>
          {selectedPlayer ? (
            <PlayerCard player={selectedPlayer} />
          ) : (
            <div className="bg-arena-mid rounded-xl p-6 border border-gray-700 text-center">
              <p className="text-gray-500">Select a player to view details</p>
            </div>
          )}

          {/* Depth Chart Summary */}
          <div className="mt-6 bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h3 className="font-heading text-lg font-bold text-white mb-4">Depth Chart</h3>
            {positionGroups.map(group => (
              <div key={group.position} className="mb-3">
                <div className="text-sm text-gray-400 mb-1">{group.position}</div>
                <div className="flex gap-2 flex-wrap">
                  {group.players.sort((a, b) => b.overallRating - a.overallRating).map((p, idx) => (
                    <span
                      key={p.id}
                      className={`text-xs px-2 py-1 rounded ${idx === 0 ? 'bg-basketball-orange/20 text-basketball-orange' : 'bg-arena-dark text-gray-400'}`}
                    >
                      {p.name.split(' ').pop()} ({p.overallRating})
                    </span>
                  ))}
                  {group.players.length === 0 && (
                    <span className="text-xs text-red-400">No players</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function ratingColor(rating: number): string {
  if (rating >= 90) return 'text-green-400';
  if (rating >= 80) return 'text-blue-400';
  if (rating >= 70) return 'text-yellow-400';
  if (rating >= 60) return 'text-orange-400';
  return 'text-red-400';
}

export default RosterManagement;
