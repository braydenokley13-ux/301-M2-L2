import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { DraftProspect } from '../../data/types';

const DraftRoom: React.FC = () => {
  const {
    draftProspects, draftPlayer, getUserTeam, draftOrder,
    currentDraftPick, simulateAIDraftPicks, teamId, newsLog,
  } = useGameStore();
  const [selectedProspect, setSelectedProspect] = useState<DraftProspect | null>(null);
  const [filterPosition, setFilterPosition] = useState<string>('ALL');

  const team = getUserTeam();
  if (!team) return null;

  const hasDraftOrder = draftOrder.length > 0;
  const userPickIndices = draftOrder
    .map((tid, idx) => (tid === teamId ? idx : -1))
    .filter(idx => idx >= 0);
  const nextUserPick = userPickIndices.find(idx => idx >= currentDraftPick);
  const isUserPick = hasDraftOrder && draftOrder[currentDraftPick] === teamId;
  const draftComplete = hasDraftOrder && currentDraftPick >= draftOrder.length;

  const filteredProspects = filterPosition === 'ALL'
    ? draftProspects
    : draftProspects.filter(p => p.position === filterPosition);

  const handleAdvanceToPick = () => {
    if (nextUserPick !== undefined && nextUserPick > currentDraftPick) {
      simulateAIDraftPicks(nextUserPick);
    }
  };

  const handleDraft = () => {
    if (!selectedProspect) return;
    const player = draftPlayer(selectedProspect.id);
    if (player) {
      setSelectedProspect(null);
      // Advance AI picks after user pick
      const nextAIPicks = draftOrder
        .slice(currentDraftPick + 1)
        .findIndex(tid => tid === teamId);
      if (nextAIPicks > 0) {
        simulateAIDraftPicks(currentDraftPick + 1 + nextAIPicks);
      }
    }
  };

  const recentDraftNews = newsLog
    .filter(n => n.type === 'draft')
    .slice(-10)
    .reverse();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Draft War Room</h1>
          {hasDraftOrder && (
            <p className="text-gray-400 mt-1">
              Pick #{currentDraftPick + 1} of {draftOrder.length} |
              {isUserPick
                ? <span className="text-basketball-orange font-bold ml-1">YOUR PICK!</span>
                : nextUserPick !== undefined
                  ? <span className="ml-1">Your next pick: #{nextUserPick + 1}</span>
                  : <span className="ml-1 text-gray-500">No more picks</span>
              }
            </p>
          )}
        </div>
        {hasDraftOrder && !isUserPick && !draftComplete && nextUserPick !== undefined && (
          <button
            onClick={handleAdvanceToPick}
            className="px-6 py-3 bg-basketball-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
          >
            Advance to Pick #{nextUserPick + 1}
          </button>
        )}
        {!hasDraftOrder && (
          <div className="bg-arena-mid px-4 py-2 rounded-lg border border-gray-700">
            <span className="text-gray-400 text-sm">Simulate a season first to enter the draft</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prospect Board */}
        <div className="lg:col-span-2">
          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {['ALL', 'PG', 'SG', 'SF', 'PF', 'C'].map(pos => (
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

          <div className="bg-arena-mid rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase w-8">#</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase">Name</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase">POS</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase">School</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">OVR</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">POT</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">Floor</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">Ceil</th>
                  <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">AGE</th>
                </tr>
              </thead>
              <tbody>
                {filteredProspects.map((prospect, idx) => (
                  <tr
                    key={prospect.id}
                    onClick={() => setSelectedProspect(prospect)}
                    className={`cursor-pointer transition-colors border-b border-gray-800
                      ${selectedProspect?.id === prospect.id ? 'bg-basketball-orange/10' : 'hover:bg-arena-light'}`}
                  >
                    <td className="px-4 py-3 text-gray-500 text-sm font-stats">{idx + 1}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{prospect.name}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm font-stats">{prospect.position}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{prospect.college}</td>
                    <td className={`px-4 py-3 text-sm font-stats text-center font-bold ${ratingColor(prospect.overallRating)}`}>{prospect.overallRating}</td>
                    <td className={`px-4 py-3 text-sm font-stats text-center ${ratingColor(prospect.potential)}`}>{prospect.potential}</td>
                    <td className="px-4 py-3 text-sm font-stats text-center text-gray-400">{prospect.floor}</td>
                    <td className="px-4 py-3 text-sm font-stats text-center text-gray-400">{prospect.ceiling}</td>
                    <td className="px-4 py-3 text-sm font-stats text-center text-gray-300">{prospect.age}</td>
                  </tr>
                ))}
                {filteredProspects.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-500">No prospects available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scouting Report & Draft Action */}
        <div className="space-y-4">
          {selectedProspect ? (
            <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
              <h2 className="font-heading text-xl font-bold text-white mb-1">{selectedProspect.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{selectedProspect.position} | {selectedProspect.college} | Age {selectedProspect.age}</p>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-400">Overall</span><span className={`font-stats font-bold ${ratingColor(selectedProspect.overallRating)}`}>{selectedProspect.overallRating}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Potential</span><span className={`font-stats font-bold ${ratingColor(selectedProspect.potential)}`}>{selectedProspect.potential}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Floor</span><span className="font-stats text-red-400">{selectedProspect.floor}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Ceiling</span><span className="font-stats text-green-400">{selectedProspect.ceiling}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Offense</span><span className={`font-stats ${ratingColor(selectedProspect.offense)}`}>{selectedProspect.offense}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Defense</span><span className={`font-stats ${ratingColor(selectedProspect.defense)}`}>{selectedProspect.defense}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Athleticism</span><span className={`font-stats ${ratingColor(selectedProspect.athleticism)}`}>{selectedProspect.athleticism}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Basketball IQ</span><span className={`font-stats ${ratingColor(selectedProspect.basketball_iq)}`}>{selectedProspect.basketball_iq}</span></div>
              </div>

              {/* Variance Bar */}
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Risk/Variance</div>
                <div className="relative w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="absolute top-0 h-4 bg-red-500/30 rounded-l-full"
                    style={{ width: `${(selectedProspect.floor / 99) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 h-4 bg-green-500/30 rounded-r-full"
                    style={{ left: `${(selectedProspect.floor / 99) * 100}%`, width: `${((selectedProspect.ceiling - selectedProspect.floor) / 99) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 h-4 w-1 bg-white rounded"
                    style={{ left: `${(selectedProspect.overallRating / 99) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Floor: {selectedProspect.floor}</span>
                  <span>Current: {selectedProspect.overallRating}</span>
                  <span>Ceiling: {selectedProspect.ceiling}</span>
                </div>
              </div>

              {isUserPick && (
                <button
                  onClick={handleDraft}
                  className="w-full py-3 bg-basketball-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
                >
                  Draft {selectedProspect.name}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-arena-mid rounded-xl p-6 border border-gray-700 text-center">
              <p className="text-gray-500">Select a prospect to view scouting report</p>
            </div>
          )}

          {/* Draft Log */}
          <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
            <h3 className="font-heading text-lg font-bold text-white mb-3">Draft Log</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentDraftNews.map(n => (
                <div key={n.id} className="text-sm border-l-2 border-basketball-orange pl-3">
                  <span className="text-white">{n.title}</span>
                  <p className="text-gray-400 text-xs">{n.body}</p>
                </div>
              ))}
              {recentDraftNews.length === 0 && (
                <p className="text-gray-500 text-sm">No picks made yet.</p>
              )}
            </div>
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

export default DraftRoom;
