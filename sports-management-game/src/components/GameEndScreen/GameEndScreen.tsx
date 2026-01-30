import React, { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';

const GameEndScreen: React.FC = () => {
  const {
    seasonResults,
    riskDecisions,
    getUserTeam,
  } = useGameStore();

  const team = getUserTeam();

  // Calculate final evaluation metrics
  const evaluation = useMemo(() => {
    const totalWins = seasonResults.reduce((sum, s) => sum + s.wins, 0);
    const totalLosses = seasonResults.reduce((sum, s) => sum + s.losses, 0);
    const championships = seasonResults.filter(s => s.playoffResult === 'champion').length;
    const playoffAppearances = seasonResults.filter(s => s.playoffResult !== 'missed').length;

    // Win variance (volatility metric)
    const wins = seasonResults.map(s => s.wins);
    const avgWins = wins.reduce((a, b) => a + b, 0) / wins.length;
    const winVariance = wins.reduce((sum, w) => sum + Math.pow(w - avgWins, 2), 0) / wins.length;
    const winStdDev = Math.sqrt(winVariance);

    // Risk alignment score (did they take appropriate risks for their context?)
    const highRiskMoves = riskDecisions.filter(d => d.riskLevel === 'high').length;
    const successfulHighRisk = riskDecisions.filter(d => d.riskLevel === 'high' && d.outcome === 'success').length;

    // Context-appropriate risk taking
    let contextScore = 50;
    if (team) {
      const shouldBeAggressive = team.contextType === 'small_market_reset' ||
                                  team.contextType === 'cash_rich_expansion';
      const wasAggressive = highRiskMoves > 2;

      if (shouldBeAggressive && wasAggressive) contextScore += 30;
      else if (!shouldBeAggressive && !wasAggressive) contextScore += 30;
      else if (shouldBeAggressive && !wasAggressive) contextScore -= 10; // Too conservative
      else contextScore -= 20; // Too risky for context
    }

    // Financial management score
    const avgProfit = seasonResults.reduce((sum, s) => sum + (s.profit || 0), 0) / seasonResults.length;
    const financialScore = avgProfit > 10 ? 90 : avgProfit > 0 ? 70 : avgProfit > -20 ? 50 : 30;

    // Overall performance score
    const performanceScore = Math.min(100,
      (championships * 30) +
      (playoffAppearances * 10) +
      Math.floor(totalWins / 3)
    );

    // Understanding score (combination of all factors)
    const understandingScore = Math.round(
      (contextScore * 0.4) +
      (financialScore * 0.3) +
      (performanceScore * 0.3)
    );

    return {
      totalWins,
      totalLosses,
      championships,
      playoffAppearances,
      avgWins,
      winStdDev,
      highRiskMoves,
      successfulHighRisk,
      contextScore,
      financialScore,
      performanceScore,
      understandingScore,
      volatilityRating: winStdDev < 5 ? 'Stable' : winStdDev < 10 ? 'Moderate' : winStdDev < 15 ? 'Volatile' : 'Extreme',
    };
  }, [seasonResults, riskDecisions, team]);

  // Generate claim code based on performance
  const claimCode = useMemo(() => {
    const baseCode = 'RISK301';
    const perfCode = evaluation.understandingScore >= 80 ? 'ACE' :
                     evaluation.understandingScore >= 60 ? 'PRO' :
                     evaluation.understandingScore >= 40 ? 'RSK' : 'TRY';
    const champCode = evaluation.championships > 0 ? 'W' : 'X';
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    return `${baseCode}-${perfCode}-${champCode}${timestamp}`;
  }, [evaluation]);

  // Determine GM rating based on understanding score
  const gmRating = useMemo(() => {
    if (evaluation.understandingScore >= 85) return { title: 'Master Strategist', color: 'text-yellow-400', description: 'You demonstrated excellent understanding of rational aggression' };
    if (evaluation.understandingScore >= 70) return { title: 'Savvy Executive', color: 'text-green-400', description: 'You showed strong grasp of risk management' };
    if (evaluation.understandingScore >= 55) return { title: 'Developing GM', color: 'text-blue-400', description: 'You\'re learning to balance risk and reward' };
    if (evaluation.understandingScore >= 40) return { title: 'Rookie Manager', color: 'text-gray-400', description: 'There\'s room to better align risk with context' };
    return { title: 'Learning Experience', color: 'text-red-400', description: 'Review the lesson on risk and volatility' };
  }, [evaluation.understandingScore]);

  // Key lessons based on their performance
  const keyLessons = useMemo(() => {
    const lessons: string[] = [];

    if (evaluation.winStdDev > 12) {
      lessons.push('Your team experienced high volatility. Remember: same average, very different experience.');
    }

    if (evaluation.contextScore < 50) {
      lessons.push('Your risk-taking didn\'t align with your team\'s context. Different systems can absorb different levels of risk.');
    }

    if (evaluation.highRiskMoves > 4 && evaluation.successfulHighRisk < 2) {
      lessons.push('High-risk moves didn\'t pay off. Bold isn\'t always smart - it depends on whether failure is survivable.');
    }

    if (evaluation.championships > 0) {
      lessons.push('Championship achieved! Sometimes the aggressive path is the right one.');
    }

    if (evaluation.financialScore < 50) {
      lessons.push('Financial struggles show that sustainability matters. Risk must account for economic consequences.');
    }

    if (lessons.length === 0) {
      lessons.push('You demonstrated balanced decision-making that considered both opportunity and consequence.');
    }

    return lessons;
  }, [evaluation]);

  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-basketball-orange text-sm font-medium mb-2">
            Track 301 - Module 2 - Lesson 2 Complete
          </div>
          <h1 className="font-heading text-4xl font-bold text-white mb-2">
            Simulation Complete
          </h1>
          <p className="text-gray-400">
            3 Seasons as GM of the {team?.city} {team?.name}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-arena-mid rounded-xl border border-gray-700 overflow-hidden">
          {/* GM Rating Header */}
          <div className="bg-gradient-to-r from-arena-dark to-gray-800 p-6 border-b border-gray-700">
            <div className="text-center">
              <div className={`text-3xl font-heading font-bold ${gmRating.color}`}>
                {gmRating.title}
              </div>
              <div className="text-gray-400 text-sm mt-1">{gmRating.description}</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {evaluation.totalWins}-{evaluation.totalLosses}
              </div>
              <div className="text-xs text-gray-400">Total Record</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-basketball-orange">
                {evaluation.championships}
              </div>
              <div className="text-xs text-gray-400">Championships</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {evaluation.playoffAppearances}/3
              </div>
              <div className="text-xs text-gray-400">Playoff Years</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                evaluation.volatilityRating === 'Stable' ? 'text-blue-400' :
                evaluation.volatilityRating === 'Moderate' ? 'text-green-400' :
                evaluation.volatilityRating === 'Volatile' ? 'text-orange-400' : 'text-red-400'
              }`}>
                {evaluation.volatilityRating}
              </div>
              <div className="text-xs text-gray-400">Team Volatility</div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="px-6 pb-6">
            <h3 className="text-white font-bold mb-4">Understanding Assessment</h3>
            <div className="space-y-3">
              <ScoreBar
                label="Risk-Context Alignment"
                score={evaluation.contextScore}
                description="Did you take appropriate risks for your team's situation?"
              />
              <ScoreBar
                label="Financial Management"
                score={evaluation.financialScore}
                description="Did you manage salary cap and avoid unsustainable spending?"
              />
              <ScoreBar
                label="On-Court Performance"
                score={evaluation.performanceScore}
                description="Wins, playoff success, and championships"
              />
            </div>

            {/* Overall Score */}
            <div className="mt-6 p-4 bg-arena-dark rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Overall Understanding Score</span>
                <span className={`text-3xl font-bold ${
                  evaluation.understandingScore >= 70 ? 'text-green-400' :
                  evaluation.understandingScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {evaluation.understandingScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Key Lessons */}
          <div className="px-6 pb-6">
            <h3 className="text-white font-bold mb-3">Key Takeaways</h3>
            <div className="space-y-2">
              {keyLessons.map((lesson, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-basketball-orange mt-1">•</span>
                  <span className="text-gray-300">{lesson}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Recap */}
          <div className="px-6 pb-6">
            <div className="bg-basketball-orange/10 border border-basketball-orange/30 rounded-lg p-4">
              <h4 className="text-basketball-orange font-bold mb-2">Remember the Lesson</h4>
              <p className="text-sm text-gray-300">
                <strong>Rational aggression</strong> means taking big swings when failure is survivable,
                and avoiding volatility when downside is catastrophic. Risk isn't about courage -
                it's about <strong>fit</strong>. Two teams can make the same move, but context determines
                whether it's smart or reckless.
              </p>
            </div>
          </div>

          {/* Claim Code */}
          <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border-t border-green-600/30 p-6">
            <div className="text-center">
              <div className="text-sm text-green-400 mb-2">Your Claim Code</div>
              <div className="bg-arena-dark rounded-lg py-4 px-6 inline-block">
                <code className="text-2xl font-mono font-bold text-white tracking-wider">
                  {claimCode}
                </code>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Save this code to verify completion of Track 301, Module 2, Lesson 2
              </p>
            </div>
          </div>
        </div>

        {/* Season History */}
        <div className="mt-6 bg-arena-mid rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-bold mb-4">Season History</h3>
          <div className="space-y-3">
            {seasonResults.map((season, idx) => (
              <div key={idx} className="flex items-center justify-between bg-arena-dark rounded-lg p-3">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">Season {season.season}</span>
                  <span className="font-bold text-white">{season.wins}-{season.losses}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${
                    season.playoffResult === 'champion' ? 'text-yellow-400' :
                    season.playoffResult === 'missed' ? 'text-gray-500' : 'text-blue-400'
                  }`}>
                    {season.playoffResult === 'champion' ? 'Champion' :
                     season.playoffResult === 'missed' ? 'Missed Playoffs' :
                     season.playoffResult.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  <span className={`text-sm ${(season.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(season.profit || 0) >= 0 ? '+' : ''}${(season.profit || 0).toFixed(1)}M
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Play Again Button */}
        <div className="mt-6 text-center">
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

// Score bar component
const ScoreBar: React.FC<{ label: string; score: number; description: string }> = ({
  label,
  score,
  description,
}) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-300">{label}</span>
      <span className={`font-bold ${
        score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
      }`}>
        {score}
      </span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
      <div
        className={`h-2 rounded-full transition-all ${
          score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${score}%` }}
      />
    </div>
    <div className="text-xs text-gray-500">{description}</div>
  </div>
);

export default GameEndScreen;
