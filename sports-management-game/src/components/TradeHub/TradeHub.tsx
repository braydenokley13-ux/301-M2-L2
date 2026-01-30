import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { calculatePlayerValue, getPlayerTier, PlayerTier } from '../../game/tradeSystem';
import { Player } from '../../data/types';

// Tier badge styling
const TIER_STYLES: Record<PlayerTier, { bg: string; text: string; label: string }> = {
  superstar: { bg: 'bg-yellow-500/30', text: 'text-yellow-400', label: 'SUPERSTAR' },
  star: { bg: 'bg-purple-500/30', text: 'text-purple-400', label: 'STAR' },
  quality_starter: { bg: 'bg-blue-500/30', text: 'text-blue-400', label: 'STARTER' },
  role_player: { bg: 'bg-gray-500/30', text: 'text-gray-400', label: 'ROLE' },
  filler: { bg: 'bg-gray-700/30', text: 'text-gray-500', label: 'FILLER' },
};

const TierBadge: React.FC<{ tier: PlayerTier; compact?: boolean }> = ({ tier, compact }) => {
  const style = TIER_STYLES[tier];
  return (
    <span className={`${style.bg} ${style.text} px-1.5 py-0.5 rounded text-xs font-bold ${compact ? 'text-[10px]' : ''}`}>
      {compact ? tier.charAt(0).toUpperCase() : style.label}
    </span>
  );
};

const PlayerRow: React.FC<{
  player: Player;
  isSelected: boolean;
  onClick: () => void;
  variant: 'offered' | 'requested';
}> = ({ player, isSelected, onClick, variant }) => {
  const tier = getPlayerTier(player);
  const value = calculatePlayerValue(player);
  const selectedBg = variant === 'offered' ? 'bg-red-900/30 border border-red-600' : 'bg-green-900/30 border border-green-600';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm
        ${isSelected ? selectedBg : 'hover:bg-arena-light'}`}
    >
      <span className="text-gray-400 text-xs w-7">{player.position}</span>
      <TierBadge tier={tier} compact />
      <span className="flex-1 text-white truncate">{player.name}</span>
      <span className="font-stats text-gray-400">{player.overallRating}</span>
      <span className="font-stats text-gray-500 text-xs w-12 text-right">${player.salary}M</span>
      <span className="font-stats text-basketball-orange text-xs w-8 text-right">{value}</span>
    </div>
  );
};

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

  // Get selected players
  const offeredPlayers = userTeam.roster.filter(p => playersOffered.includes(p.id));
  const requestedPlayers = tradePartner?.roster.filter(p => playersRequested.includes(p.id)) || [];

  // Calculate package values (individual values for display)
  const offeredValue = offeredPlayers.reduce((sum, p) => sum + calculatePlayerValue(p), 0);
  const requestedValue = requestedPlayers.reduce((sum, p) => sum + calculatePlayerValue(p), 0);

  // Check for tier mismatches
  const requestedStars = requestedPlayers.filter(p => getPlayerTier(p) === 'star' || getPlayerTier(p) === 'superstar');
  const offeredStars = offeredPlayers.filter(p => getPlayerTier(p) === 'star' || getPlayerTier(p) === 'superstar');
  const tierMismatch = requestedStars.length > 0 && offeredStars.length === 0;

  // Count by tier for offered
  const offeredTierCounts: Record<PlayerTier, number> = {
    superstar: 0, star: 0, quality_starter: 0, role_player: 0, filler: 0
  };
  offeredPlayers.forEach(p => offeredTierCounts[getPlayerTier(p)]++);

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
      <h1 className="font-heading text-3xl font-bold text-white mb-2">Trade Hub</h1>

      {/* Trade System Explanation */}
      <div className="bg-arena-mid rounded-lg p-3 mb-4 border border-gray-700">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-400">Player Tiers:</span>
          <span className="flex items-center gap-1"><TierBadge tier="superstar" /> 500+ value</span>
          <span className="flex items-center gap-1"><TierBadge tier="star" /> 250+ value</span>
          <span className="flex items-center gap-1"><TierBadge tier="quality_starter" /> 80+ value</span>
          <span className="flex items-center gap-1"><TierBadge tier="role_player" /> 25+ value</span>
          <span className="flex items-center gap-1"><TierBadge tier="filler" /> minimal</span>
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Stars require star-level returns. You cannot trade multiple role players for a star - tier ceilings prevent this.
        </p>
      </div>

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
              <PlayerRow
                key={player.id}
                player={player}
                isSelected={playersOffered.includes(player.id)}
                onClick={() => toggleOffered(player.id)}
                variant="offered"
              />
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
                <PlayerRow
                  key={player.id}
                  player={player}
                  isSelected={playersRequested.includes(player.id)}
                  onClick={() => toggleRequested(player.id)}
                  variant="requested"
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">Select a team to browse players</div>
          )}
        </div>

        {/* Trade Summary */}
        <div className="bg-arena-mid rounded-xl p-4 border border-gray-700">
          <h2 className="font-heading text-lg font-bold text-white mb-4">Trade Summary</h2>

          {/* Tier Warning */}
          {tierMismatch && (
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <p className="text-yellow-400 text-sm font-bold">Tier Mismatch Warning</p>
              <p className="text-yellow-300 text-xs mt-1">
                You're trying to acquire STAR/SUPERSTAR players without offering any stars in return.
                Role players alone cannot match star value due to tier ceilings.
              </p>
            </div>
          )}

          {/* Quantity Warning */}
          {playersOffered.length >= 4 && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded-lg">
              <p className="text-red-400 text-sm font-bold">Roster Dump Detected</p>
              <p className="text-red-300 text-xs mt-1">
                Offering 4+ players triggers diminishing returns penalties. Quality over quantity!
              </p>
            </div>
          )}

          {/* Offering */}
          <div className="mb-4">
            <h3 className="text-red-400 text-sm font-medium mb-2">You Send ({playersOffered.length})</h3>
            {offeredPlayers.length > 0 ? (
              <div className="space-y-1">
                {offeredPlayers.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm bg-red-900/20 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <TierBadge tier={getPlayerTier(p)} compact />
                      <span className="text-white">{p.name}</span>
                    </div>
                    <span className="text-gray-400">{calculatePlayerValue(p)}</span>
                  </div>
                ))}
                <div className="text-xs text-gray-400 mt-1 flex justify-between">
                  <span>Individual Total:</span>
                  <span className="font-stats">{offeredValue}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select players to send</p>
            )}
          </div>

          {/* Requesting */}
          <div className="mb-4">
            <h3 className="text-green-400 text-sm font-medium mb-2">You Receive ({playersRequested.length})</h3>
            {requestedPlayers.length > 0 ? (
              <div className="space-y-1">
                {requestedPlayers.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm bg-green-900/20 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <TierBadge tier={getPlayerTier(p)} compact />
                      <span className="text-white">{p.name}</span>
                    </div>
                    <span className="text-gray-400">{calculatePlayerValue(p)}</span>
                  </div>
                ))}
                <div className="text-xs text-gray-400 mt-1 flex justify-between">
                  <span>Individual Total:</span>
                  <span className="font-stats">{requestedValue}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select players to receive</p>
            )}
          </div>

          {/* Trade Balance */}
          {playersOffered.length > 0 && playersRequested.length > 0 && (
            <div className="mb-4 p-3 bg-arena-dark rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Trade Analysis</div>
              <div className={`font-stats font-bold text-lg ${
                Math.abs(offeredValue - requestedValue) < 30 ? 'text-green-400' :
                offeredValue > requestedValue ? 'text-red-400' : 'text-blue-400'
              }`}>
                {offeredValue > requestedValue
                  ? `You overpay by ~${offeredValue - requestedValue}`
                  : offeredValue < requestedValue
                  ? `You gain ~${requestedValue - offeredValue} in value`
                  : 'Approximately fair'}
              </div>
              {tierMismatch && (
                <p className="text-yellow-400 text-xs mt-1">
                  (Actual value lower due to tier ceilings)
                </p>
              )}
              {playersOffered.length >= 3 && (
                <p className="text-orange-400 text-xs mt-1">
                  (Diminishing returns reduce package value)
                </p>
              )}
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
