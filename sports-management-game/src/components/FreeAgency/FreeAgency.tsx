import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { calculatePlayerInterest } from '../../game/freeAgency';
import { FreeAgent } from '../../data/types';

const FreeAgency: React.FC = () => {
  const { freeAgents, getUserTeam, signPlayer, salaryCapSpace } = useGameStore();
  const [selectedAgent, setSelectedAgent] = useState<FreeAgent | null>(null);
  const [offerSalary, setOfferSalary] = useState<number>(5);
  const [offerYears, setOfferYears] = useState<number>(2);
  const [signResult, setSignResult] = useState<{ success: boolean; message: string } | null>(null);

  const team = getUserTeam();
  if (!team) return null;

  const handleSign = () => {
    if (!selectedAgent) return;
    const result = signPlayer(selectedAgent.player.id, offerSalary, offerYears);
    setSignResult(result);
    if (result.success) {
      setSelectedAgent(null);
    }
  };

  const interest = selectedAgent
    ? calculatePlayerInterest(selectedAgent.player, team, offerSalary, selectedAgent.askingPrice)
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="font-heading text-3xl font-bold text-white mb-2">Free Agency Center</h1>
      <p className="text-gray-400 mb-6">Cap Space: <span className="font-stats text-white">${salaryCapSpace.toFixed(1)}M</span></p>

      {signResult && (
        <div className={`mb-4 p-4 rounded-xl border ${signResult.success ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}>
          <p className={signResult.success ? 'text-green-400' : 'text-red-400'}>{signResult.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Free Agents */}
        <div className="lg:col-span-2 bg-arena-mid rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-heading text-lg font-bold text-white">Available Players ({freeAgents.length})</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase">Player</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase">POS</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">OVR</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">POT</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">AGE</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-right">Asking</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-medium uppercase text-center">YRS</th>
              </tr>
            </thead>
            <tbody>
              {freeAgents.map(fa => (
                <tr
                  key={fa.player.id}
                  onClick={() => {
                    setSelectedAgent(fa);
                    setOfferSalary(fa.askingPrice);
                    setOfferYears(fa.yearsWanted);
                    setSignResult(null);
                  }}
                  className={`cursor-pointer transition-colors border-b border-gray-800
                    ${selectedAgent?.player.id === fa.player.id ? 'bg-basketball-orange/10' : 'hover:bg-arena-light'}`}
                >
                  <td className="px-4 py-3 text-white text-sm font-medium">{fa.player.name}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm font-stats">{fa.player.position}</td>
                  <td className={`px-4 py-3 text-sm font-stats text-center font-bold ${ratingColor(fa.player.overallRating)}`}>{fa.player.overallRating}</td>
                  <td className={`px-4 py-3 text-sm font-stats text-center ${ratingColor(fa.player.potential)}`}>{fa.player.potential}</td>
                  <td className="px-4 py-3 text-sm font-stats text-center text-gray-300">{fa.player.age}</td>
                  <td className="px-4 py-3 text-sm font-stats text-right text-green-400">${fa.askingPrice}M</td>
                  <td className="px-4 py-3 text-sm font-stats text-center text-gray-300">{fa.yearsWanted}</td>
                </tr>
              ))}
              {freeAgents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">No free agents available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Offer Panel */}
        <div className="space-y-4">
          {selectedAgent ? (
            <>
              <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
                <h2 className="font-heading text-xl font-bold text-white mb-1">{selectedAgent.player.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{selectedAgent.player.position} | Age {selectedAgent.player.age}</p>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-gray-400">OVR</span><span className={`font-stats font-bold ${ratingColor(selectedAgent.player.overallRating)}`}>{selectedAgent.player.overallRating}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">POT</span><span className={`font-stats font-bold ${ratingColor(selectedAgent.player.potential)}`}>{selectedAgent.player.potential}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">OFF</span><span className={`font-stats ${ratingColor(selectedAgent.player.offense)}`}>{selectedAgent.player.offense}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">DEF</span><span className={`font-stats ${ratingColor(selectedAgent.player.defense)}`}>{selectedAgent.player.defense}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">ATH</span><span className={`font-stats ${ratingColor(selectedAgent.player.athleticism)}`}>{selectedAgent.player.athleticism}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">IQ</span><span className={`font-stats ${ratingColor(selectedAgent.player.basketball_iq)}`}>{selectedAgent.player.basketball_iq}</span></div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Asking Price</span>
                    <span className="font-stats text-green-400">${selectedAgent.askingPrice}M/yr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Years Wanted</span>
                    <span className="font-stats text-white">{selectedAgent.yearsWanted}</span>
                  </div>
                </div>
              </div>

              <div className="bg-arena-mid rounded-xl p-5 border border-gray-700">
                <h3 className="font-heading text-lg font-bold text-white mb-4">Make an Offer</h3>

                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-2">
                    Salary: <span className="text-white font-stats">${offerSalary}M/yr</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={Math.min(50, Math.floor(salaryCapSpace))}
                    value={offerSalary}
                    onChange={e => setOfferSalary(parseInt(e.target.value))}
                    className="w-full accent-basketball-orange"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$1M</span>
                    <span>${Math.min(50, Math.floor(salaryCapSpace))}M</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-2">
                    Years: <span className="text-white font-stats">{offerYears}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={offerYears}
                    onChange={e => setOfferYears(parseInt(e.target.value))}
                    className="w-full accent-basketball-orange"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1yr</span>
                    <span>5yr</span>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-arena-dark rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Player Interest</span>
                    <span className={`font-stats font-bold ${interest >= 65 ? 'text-green-400' : interest >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {interest}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${interest >= 65 ? 'bg-green-500' : interest >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${interest}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {interest >= 65 ? 'Likely to accept' : interest >= 40 ? 'Might accept' : 'Unlikely to accept'}
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-4">
                  Total cost: <span className="text-white font-stats">${offerSalary * offerYears}M</span> over {offerYears} year(s)
                </div>

                <button
                  onClick={handleSign}
                  disabled={offerSalary > salaryCapSpace}
                  className="w-full py-3 bg-basketball-orange hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                >
                  {offerSalary > salaryCapSpace ? 'Not Enough Cap Space' : 'Submit Offer'}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-arena-mid rounded-xl p-6 border border-gray-700 text-center">
              <p className="text-gray-500">Select a free agent to make an offer</p>
            </div>
          )}
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

export default FreeAgency;
