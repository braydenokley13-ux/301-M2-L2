import React, { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { TEAM_CONTEXTS } from '../../game/teamContext';

// Risk level expectations by context
const CONTEXT_RISK_EXPECTATIONS: Record<string, 'high' | 'medium' | 'low'> = {
  small_market_reset: 'high',
  cash_rich_expansion: 'high',
  legacy_power: 'medium',
  star_dependent: 'medium',
  revenue_sensitive: 'low',
};

const GameEndScreen: React.FC = () => {
  const { seasonResults, riskDecisions, getUserTeam } = useGameStore();
  const team = getUserTeam();
  const context = team ? TEAM_CONTEXTS[team.contextType] : null;
  const expectedRisk = team ? CONTEXT_RISK_EXPECTATIONS[team.contextType] : 'medium';

  // Calculate comprehensive evaluation
  const evaluation = useMemo(() => {
    // --- PERFORMANCE METRICS ---
    const totalWins = seasonResults.reduce((sum, s) => sum + s.wins, 0);
    const totalLosses = seasonResults.reduce((sum, s) => sum + s.losses, 0);
    const championships = seasonResults.filter(s => s.playoffResult === 'champion').length;
    const playoffAppearances = seasonResults.filter(s => s.playoffResult !== 'missed').length;
    const avgWins = totalWins / seasonResults.length;

    // --- FINANCIAL METRICS ---
    const totalProfit = seasonResults.reduce((sum, s) => sum + (s.profit || 0), 0);
    const totalTaxPaid = seasonResults.reduce((sum, s) => sum + (s.luxuryTaxPaid || 0), 0);
    const hadCatastrophicLoss = seasonResults.some(s => (s.profit || 0) < -30);

    // --- RISK METRICS ---
    const highRiskMoves = riskDecisions.filter(d => d.riskLevel === 'high').length;
    const mediumRiskMoves = riskDecisions.filter(d => d.riskLevel === 'medium').length;
    const lowRiskMoves = riskDecisions.filter(d => d.riskLevel === 'low').length;
    const totalMoves = highRiskMoves + mediumRiskMoves + lowRiskMoves;

    // Calculate actual risk profile
    const riskRatio = totalMoves > 0 ? highRiskMoves / totalMoves : 0;
    const actualRiskLevel: 'high' | 'medium' | 'low' =
      riskRatio > 0.4 ? 'high' : riskRatio > 0.15 ? 'medium' : 'low';

    // --- WIN VOLATILITY ---
    const wins = seasonResults.map(s => s.wins);
    const winStdDev = wins.length > 1
      ? Math.sqrt(wins.reduce((sum, w) => sum + Math.pow(w - avgWins, 2), 0) / wins.length)
      : 0;

    // === SCORING ===

    // 1. RISK-CONTEXT ALIGNMENT (40%)
    // Did they match risk level to their team context?
    let alignmentScore = 50; // Start neutral

    if (expectedRisk === 'high') {
      // Should have taken risks
      if (actualRiskLevel === 'high') alignmentScore = 100;
      else if (actualRiskLevel === 'medium') alignmentScore = 60;
      else alignmentScore = 20; // Too conservative for context
    } else if (expectedRisk === 'low') {
      // Should have avoided risks
      if (actualRiskLevel === 'low') alignmentScore = 100;
      else if (actualRiskLevel === 'medium') alignmentScore = 60;
      else alignmentScore = 20; // Too risky for context
    } else {
      // Medium - flexible
      if (actualRiskLevel === 'medium') alignmentScore = 100;
      else alignmentScore = 70;
    }

    // 2. FINANCIAL SUSTAINABILITY (30%)
    let financialScore = 50;
    if (totalProfit > 50) financialScore = 100;
    else if (totalProfit > 20) financialScore = 80;
    else if (totalProfit > 0) financialScore = 70;
    else if (totalProfit > -30) financialScore = 50;
    else if (hadCatastrophicLoss) financialScore = 20;
    else financialScore = 30;

    // Penalty for repeated luxury tax if context was risk-averse
    if (expectedRisk === 'low' && totalTaxPaid > 20) {
      financialScore = Math.max(20, financialScore - 30);
    }

    // 3. ON-COURT RESULTS (30%)
    let performanceScore = 0;
    performanceScore += championships * 35;
    performanceScore += playoffAppearances * 12;
    performanceScore += Math.min(30, avgWins / 2);
    performanceScore = Math.min(100, performanceScore);

    // === FINAL SCORE ===
    const finalScore = Math.round(
      alignmentScore * 0.4 +
      financialScore * 0.3 +
      performanceScore * 0.3
    );

    // === LESSON UNDERSTANDING ===
    // Key insight: Did they demonstrate they understand when to risk?
    const understoodLesson =
      (expectedRisk === 'high' && actualRiskLevel !== 'low') ||
      (expectedRisk === 'low' && actualRiskLevel !== 'high') ||
      (expectedRisk === 'medium');

    return {
      // Performance
      totalWins,
      totalLosses,
      championships,
      playoffAppearances,
      avgWins,
      winStdDev,
      // Financial
      totalProfit,
      totalTaxPaid,
      hadCatastrophicLoss,
      // Risk
      highRiskMoves,
      mediumRiskMoves,
      lowRiskMoves,
      totalMoves,
      actualRiskLevel,
      expectedRisk,
      // Scores
      alignmentScore,
      financialScore,
      performanceScore,
      finalScore,
      understoodLesson,
    };
  }, [seasonResults, riskDecisions, expectedRisk]);

  // Generate claim code
  const claimCode = useMemo(() => {
    const scoreCode = evaluation.finalScore >= 80 ? 'A' :
                      evaluation.finalScore >= 60 ? 'B' :
                      evaluation.finalScore >= 40 ? 'C' : 'D';
    const riskCode = evaluation.understoodLesson ? 'R' : 'X';
    const champCode = evaluation.championships > 0 ? 'W' : '0';
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    return `M2L2-${scoreCode}${riskCode}${champCode}-${timestamp}`;
  }, [evaluation]);

  // Rating title
  const rating = useMemo(() => {
    if (evaluation.finalScore >= 85) return { title: 'Risk Master', color: 'text-yellow-400', emoji: '🏆' };
    if (evaluation.finalScore >= 70) return { title: 'Rational Executive', color: 'text-green-400', emoji: '📈' };
    if (evaluation.finalScore >= 55) return { title: 'Developing GM', color: 'text-blue-400', emoji: '📊' };
    if (evaluation.finalScore >= 40) return { title: 'Learning Curve', color: 'text-gray-400', emoji: '📚' };
    return { title: 'Needs Review', color: 'text-red-400', emoji: '🔄' };
  }, [evaluation.finalScore]);

  // Feedback messages
  const feedback = useMemo(() => {
    const messages: { type: 'good' | 'bad' | 'neutral'; text: string }[] = [];

    // Risk alignment feedback
    if (evaluation.alignmentScore >= 80) {
      messages.push({
        type: 'good',
        text: `You correctly ${evaluation.expectedRisk === 'high' ? 'took risks' : evaluation.expectedRisk === 'low' ? 'played it safe' : 'balanced risk'} for a ${context?.label || 'your'} team.`,
      });
    } else if (evaluation.alignmentScore <= 40) {
      if (evaluation.expectedRisk === 'high' && evaluation.actualRiskLevel === 'low') {
        messages.push({
          type: 'bad',
          text: 'Your team NEEDED volatility to escape mediocrity, but you played too conservatively.',
        });
      } else if (evaluation.expectedRisk === 'low' && evaluation.actualRiskLevel === 'high') {
        messages.push({
          type: 'bad',
          text: 'Your team couldn\'t afford failure, but you took too many high-risk moves.',
        });
      }
    }

    // Financial feedback
    if (evaluation.hadCatastrophicLoss) {
      messages.push({
        type: 'bad',
        text: 'Catastrophic financial losses. Risk must account for economic consequences.',
      });
    } else if (evaluation.totalProfit > 30) {
      messages.push({
        type: 'good',
        text: 'Strong financial management with sustainable profits.',
      });
    }

    // Championship feedback
    if (evaluation.championships > 0) {
      messages.push({
        type: 'good',
        text: `Championship${evaluation.championships > 1 ? 's' : ''} won! Sometimes the aggressive path pays off.`,
      });
    }

    // Volatility insight
    if (evaluation.winStdDev > 15) {
      messages.push({
        type: 'neutral',
        text: `High volatility (${evaluation.winStdDev.toFixed(1)} win std dev). Your seasons varied dramatically.`,
      });
    }

    return messages;
  }, [evaluation, context]);

  return (
    <div className="min-h-screen bg-arena-dark p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-basketball-orange text-sm font-medium mb-2">Track 301 - Module 2 - Lesson 2</p>
          <h1 className="font-heading text-4xl font-bold text-white mb-2">Challenge Complete</h1>
          <p className="text-gray-400">3 Seasons as GM of the {team?.city} {team?.name}</p>
        </div>

        {/* Rating Card */}
        <div className="bg-arena-mid rounded-xl border border-gray-700 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-basketball-orange/20 to-orange-900/20 p-8 text-center border-b border-gray-700">
            <div className="text-5xl mb-3">{rating.emoji}</div>
            <h2 className={`font-heading text-3xl font-bold ${rating.color}`}>{rating.title}</h2>
            <p className="text-gray-400 mt-2">Final Score: <span className="text-white font-bold text-2xl">{evaluation.finalScore}</span>/100</p>
          </div>

          {/* Score Breakdown */}
          <div className="p-6">
            <h3 className="text-white font-bold mb-4">Score Breakdown</h3>

            <div className="space-y-4">
              <ScoreRow
                label="Risk-Context Alignment"
                score={evaluation.alignmentScore}
                weight="40%"
                detail={`Expected: ${evaluation.expectedRisk} risk | Actual: ${evaluation.actualRiskLevel} risk`}
              />
              <ScoreRow
                label="Financial Sustainability"
                score={evaluation.financialScore}
                weight="30%"
                detail={`Total profit: $${evaluation.totalProfit.toFixed(1)}M | Tax paid: $${evaluation.totalTaxPaid.toFixed(1)}M`}
              />
              <ScoreRow
                label="On-Court Results"
                score={evaluation.performanceScore}
                weight="30%"
                detail={`${evaluation.totalWins}-${evaluation.totalLosses} | ${evaluation.championships} titles | ${evaluation.playoffAppearances} playoff appearances`}
              />
            </div>
          </div>
        </div>

        {/* Key Lesson Box */}
        <div className={`rounded-xl p-6 mb-6 border ${evaluation.understoodLesson ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'}`}>
          <h3 className={`font-bold text-lg mb-2 ${evaluation.understoodLesson ? 'text-green-400' : 'text-red-400'}`}>
            {evaluation.understoodLesson ? '✓ Lesson Understood' : '✗ Key Insight Missed'}
          </h3>
          <p className="text-gray-300">
            {evaluation.understoodLesson
              ? 'You demonstrated understanding that risk should match your team\'s ability to absorb failure.'
              : `Your ${context?.label} team ${evaluation.expectedRisk === 'high' ? 'needed more volatility' : 'needed more stability'}. The same strategy isn't right for every team.`
            }
          </p>
        </div>

        {/* Feedback */}
        {feedback.length > 0 && (
          <div className="bg-arena-mid rounded-xl border border-gray-700 p-6 mb-6">
            <h3 className="text-white font-bold mb-4">Feedback</h3>
            <div className="space-y-3">
              {feedback.map((f, i) => (
                <div key={i} className={`flex items-start gap-3 ${
                  f.type === 'good' ? 'text-green-400' :
                  f.type === 'bad' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  <span className="text-lg">
                    {f.type === 'good' ? '✓' : f.type === 'bad' ? '✗' : '•'}
                  </span>
                  <span className="text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Season History */}
        <div className="bg-arena-mid rounded-xl border border-gray-700 p-6 mb-6">
          <h3 className="text-white font-bold mb-4">Your 3 Seasons</h3>
          <div className="space-y-3">
            {seasonResults.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-arena-dark rounded-lg p-3">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">S{s.season}</span>
                  <span className="font-stats text-white font-bold">{s.wins}-{s.losses}</span>
                  <span className={`text-sm ${
                    s.playoffResult === 'champion' ? 'text-yellow-400 font-bold' :
                    s.playoffResult !== 'missed' ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {s.playoffResult === 'champion' ? '🏆 Champion' :
                     s.playoffResult === 'missed' ? 'Missed Playoffs' :
                     s.playoffResult.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-0.5 rounded ${
                    s.riskRating === 'aggressive' ? 'bg-red-900/30 text-red-400' :
                    s.riskRating === 'balanced' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-blue-900/30 text-blue-400'
                  }`}>
                    {s.riskRating}
                  </span>
                  <span className={`${(s.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(s.profit || 0) >= 0 ? '+' : ''}${(s.profit || 0).toFixed(0)}M
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson Recap */}
        <div className="bg-arena-mid rounded-xl border border-gray-700 p-6 mb-6">
          <h3 className="text-basketball-orange font-bold mb-3">The Lesson</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Volatility</strong> - Same average, different experience. High variance means big highs AND big lows.</p>
            <p><strong className="text-white">Context Matters</strong> - The same aggressive move can be smart for one team and reckless for another.</p>
            <p><strong className="text-white">Rational Aggression</strong> - Take big swings when failure is survivable. Play safe when downside is catastrophic.</p>
          </div>
        </div>

        {/* Claim Code */}
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-xl border border-green-600/30 p-6 text-center">
          <p className="text-green-400 text-sm font-medium mb-2">Your Claim Code</p>
          <div className="bg-arena-dark rounded-lg py-4 px-8 inline-block mb-3">
            <code className="text-3xl font-mono font-bold text-white tracking-widest">{claimCode}</code>
          </div>
          <p className="text-xs text-gray-400">
            Save this code to verify completion of Track 301, Module 2, Lesson 2
          </p>
        </div>

        {/* Play Again */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-basketball-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

// Score row component
const ScoreRow: React.FC<{
  label: string;
  score: number;
  weight: string;
  detail: string;
}> = ({ label, score, weight, detail }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2">
        <span className="text-white font-medium">{label}</span>
        <span className="text-xs text-gray-500">({weight})</span>
      </div>
      <span className={`font-bold ${
        score >= 70 ? 'text-green-400' :
        score >= 50 ? 'text-yellow-400' : 'text-red-400'
      }`}>
        {score}
      </span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
      <div
        className={`h-2 rounded-full transition-all ${
          score >= 70 ? 'bg-green-500' :
          score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${score}%` }}
      />
    </div>
    <p className="text-xs text-gray-500">{detail}</p>
  </div>
);

export default GameEndScreen;
