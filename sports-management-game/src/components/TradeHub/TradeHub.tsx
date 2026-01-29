import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { calculatePlayerValue } from '../../game/tradeSystem';

const TradeHub: React.FC = () => {
  const { teams, teamId, proposeTrade, getUserTeam } = useGameStore();
  const [selectedTradeTeam, setSelectedTradeTeam] = useState<string | null>(null);
  const [playersOffered, setPlayersOffered] = useState<string[]>([]);
  const [playersRequested, setPlayersRequested] = useState<string[]>([]);
  const [tradeResult, setTradeResult] = useState<{ accepted: boolean; analysis: string } | null>(null);

  const userTeam = getUserTeam();
  if (!userTeam) return null;

  const otherTeams = teams.filter(t => t.id !== teamId);
  const tradePartner = teams.find(t => t.id === selectedTradeTeam);

  const toggleOffered = (playerId: string) => {
    setPlayersOffered(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
    setTradeResult(null);
  };

  const toggleRequested = (playerId: string) => {
    setPlayersRequested(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
    setTradeResult(null);
  };

  const offeredValue = userTeam.roster
    .filter(p => playersOffered.includes(p.id))
    .reduce((sum, p) => sum + calculatePlayerValue(p), 0);

  const requestedValue = tradePartner?.roster
    .filter(p => playersRequested.includes(p.id))
    .reduce((sum, p) => sum + calculatePlayerValue(p), 0) || 0;

  const handleProposeTrade = () => {
    if (!selectedTradeTeam || playersOffered.length === 0 || playersRequested.length === 0) return;

    const result = proposeTrade({
      fromTeamId: teamId,
      toTeamId: selectedTradeTeam,
      playersOffered,
      playersRequested,
      picksOffered: [],
      picksRequested: [],
    });

    setTradeResult(result);
    if (result.accepted) {
      setPlayersOffered([]);
      setPlayersRequested([]);
    }
  };

  const resetTrade = () => {
    setPlayersOffered([]);
    setPlayersRequested([]);
    setTradeResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="font-heading text-3xl font-bold text-white mb-6">Trade Hub</h1>

      {/* Trade Result Banner */}
      {tradeResult && (
        <div className={`mb-6 p-4 rounded-xl border ${tradeResult.accepted ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}>
          <h3 className={`font-bold ${tradeResult.accepted ? 'text-green-400' : 'text-red-400'}`}>
            {tradeResult.accepted ? 'Trade Accepted!' : 'Trade Rejected'}
          </h3>
          <p className="text-gray-300 text-sm mt-1">{tradeResult.analysis}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team Browser */}
        <div className="bg-arena-mid rounded-xl p-4 border border-gray-700">
          <h2 className="font-heading text-lg font-bold text-white mb-3">Select Team</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {otherTeams.sort((a, b) => a.city.localeCompare(b.city)).map(t => (
              <button
                key={t.id}
                onClick={() => { setSelectedTradeTeam(t.id); resetTrade(); }}
                className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors
                  ${selectedTradeTeam === t.id ? 'bg-basketball-orange/20 border border-basketball-orange' : 'hover:bg-arena-light'}`}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                <div>
                  <div className="text-white text-sm font-medium">{t.city}</div>
                  <div className="text-gray-400 text-xs">{t.name} ({t.wins}-{t.losses})</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Your Players */}
        <div className="bg-arena-mid rounded-xl p-4 border border-gray-700">
          <h2 className="font-heading text-lg font-bold text-white mb-1">Your Players</h2>
          <p className="text-gray-400 text-xs mb-3">Select players to offer</p>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {userTeam.roster.sort((a, b) => b.overallRating - a.overallRating).map(player => (
              <div
                key={player.id}
                onClick={() => toggleOffered(player.id)}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm
                  ${playersOffered.includes(player.id) ? 'bg-red-900/30 border border-red-600' : 'hover:bg-arena-light'}`}
              >
                <span className="text-gray-400 text-xs w-7">{player.position}</span>
                <span className="flex-1 text-white">{player.name}</span>
                <span className="font-stats text-gray-400">{player.overallRating}</span>
                <span className="font-stats text-gray-500 text-xs">${player.salary}M</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Partner's Players */}
        <div className="bg-arena-mid rounded-xl p-4 border border-gray-700">
          <h2 className="font-heading text-lg font-bold text-white mb-1">
            {tradePartner ? `${tradePartner.city} Players` : 'Select a Team'}
          </h2>
          <p className="text-gray-400 text-xs mb-3">Select players to request</p>
          {tradePartner ? (
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {tradePartner.roster.sort((a, b) => b.overallRating - a.overallRating).map(player => (
                <div
                  key={player.id}
                  onClick={() => toggleRequested(player.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm
                    ${playersRequested.includes(player.id) ? 'bg-green-900/30 border border-green-600' : 'hover:bg-arena-light'}`}
                >
                  <span className="text-gray-400 text-xs w-7">{player.position}</span>
                  <span className="flex-1 text-white">{player.name}</span>
                  <span className="font-stats text-gray-400">{player.overallRating}</span>
                  <span className="font-stats text-gray-500 text-xs">${player.salary}M</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">Select a team to browse players</div>
          )}
        </div>

        {/* Trade Summary */}
        <div className="bg-arena-mid rounded-xl p-4 border border-gray-700">
          <h2 className="font-heading text-lg font-bold text-white mb-4">Trade Summary</h2>

          {/* Offering */}
          <div className="mb-4">
            <h3 className="text-red-400 text-sm font-medium mb-2">You Send</h3>
            {playersOffered.length > 0 ? (
              <div className="space-y-1">
                {userTeam.roster.filter(p => playersOffered.includes(p.id)).map(p => (
                  <div key={p.id} className="flex justify-between text-sm bg-red-900/20 p-2 rounded">
                    <span className="text-white">{p.name}</span>
                    <span className="text-gray-400">{p.overallRating} OVR</span>
                  </div>
                ))}
                <div className="text-xs text-gray-400 mt-1">Value: {offeredValue}</div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select players to send</p>
            )}
          </div>

          {/* Requesting */}
          <div className="mb-4">
            <h3 className="text-green-400 text-sm font-medium mb-2">You Receive</h3>
            {playersRequested.length > 0 && tradePartner ? (
              <div className="space-y-1">
                {tradePartner.roster.filter(p => playersRequested.includes(p.id)).map(p => (
                  <div key={p.id} className="flex justify-between text-sm bg-green-900/20 p-2 rounded">
                    <span className="text-white">{p.name}</span>
                    <span className="text-gray-400">{p.overallRating} OVR</span>
                  </div>
                ))}
                <div className="text-xs text-gray-400 mt-1">Value: {requestedValue}</div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select players to receive</p>
            )}
          </div>

          {/* Trade Balance */}
          {playersOffered.length > 0 && playersRequested.length > 0 && (
            <div className="mb-4 p-3 bg-arena-dark rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Trade Balance</div>
              <div className={`font-stats font-bold text-lg ${Math.abs(offeredValue - requestedValue) < 20 ? 'text-green-400' : offeredValue > requestedValue ? 'text-red-400' : 'text-blue-400'}`}>
                {offeredValue > requestedValue ? `You overpay by ${offeredValue - requestedValue}` :
                 offeredValue < requestedValue ? `You gain ${requestedValue - offeredValue} in value` :
                 'Fair trade!'}
              </div>
            </div>
          )}

          <button
            onClick={handleProposeTrade}
            disabled={playersOffered.length === 0 || playersRequested.length === 0}
            className="w-full py-3 bg-basketball-orange hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            Propose Trade
          </button>
          {(playersOffered.length > 0 || playersRequested.length > 0) && (
            <button
              onClick={resetTrade}
              className="w-full py-2 mt-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHub;
