import React from 'react';
import { Player } from '../../data/types';

interface PlayerCardProps {
  player: Player;
  compact?: boolean;
  onClick?: () => void;
  selected?: boolean;
  showSalary?: boolean;
}

const positionColors: Record<string, string> = {
  PG: 'bg-blue-600',
  SG: 'bg-green-600',
  SF: 'bg-yellow-600',
  PF: 'bg-orange-600',
  C: 'bg-red-600',
};

export function ratingColor(rating: number): string {
  if (rating >= 90) return 'text-green-400';
  if (rating >= 80) return 'text-blue-400';
  if (rating >= 70) return 'text-yellow-400';
  if (rating >= 60) return 'text-orange-400';
  return 'text-red-400';
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, compact, onClick, selected, showSalary = true }) => {
  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all
          ${selected ? 'bg-basketball-orange/20 border border-basketball-orange' : 'bg-arena-mid hover:bg-arena-light'}`}
      >
        <span className={`${positionColors[player.position]} px-2 py-0.5 rounded text-xs font-bold`}>
          {player.position}
        </span>
        <span className="flex-1 font-medium text-sm">{player.name}</span>
        <span className={`font-stats font-bold ${ratingColor(player.overallRating)}`}>
          {player.overallRating}
        </span>
        {showSalary && (
          <span className="text-gray-400 text-xs font-stats">${player.salary}M</span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 cursor-pointer transition-all
        ${selected ? 'bg-basketball-orange/20 border-2 border-basketball-orange' : 'bg-arena-mid hover:bg-arena-light border border-gray-700'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-heading font-semibold text-white">{player.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`${positionColors[player.position]} px-2 py-0.5 rounded text-xs font-bold`}>
              {player.position}
            </span>
            <span className="text-gray-400 text-sm">Age {player.age}</span>
            {player.isStar && <span className="text-yellow-400 text-sm">★ Star</span>}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-stats font-bold ${ratingColor(player.overallRating)}`}>
            {player.overallRating}
          </div>
          <div className="text-xs text-gray-400">OVR</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">OFF</span>
          <span className={`font-stats ${ratingColor(player.offense)}`}>{player.offense}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">DEF</span>
          <span className={`font-stats ${ratingColor(player.defense)}`}>{player.defense}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">ATH</span>
          <span className={`font-stats ${ratingColor(player.athleticism)}`}>{player.athleticism}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">IQ</span>
          <span className={`font-stats ${ratingColor(player.basketball_iq)}`}>{player.basketball_iq}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">POT</span>
          <span className={`font-stats ${ratingColor(player.potential)}`}>{player.potential}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">DUR</span>
          <span className={`font-stats ${ratingColor(player.durability)}`}>{player.durability}</span>
        </div>
      </div>

      {showSalary && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-sm">
          <span className="text-gray-400">Contract</span>
          <span className="font-stats text-white">${player.salary}M / {player.contractYears}yr</span>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
