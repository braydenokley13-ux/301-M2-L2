import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { TEAM_CONTEXTS } from '../../game/teamContext';

// Brayden White's photo - place in public/images/brayden-white.jpg
const TUTOR_PHOTO = '/301-M2-L2/images/brayden-white.jpg';
const TUTOR_NAME = 'Brayden White';

interface TaskItem {
  id: number;
  text: string;
  hint: string;
}

interface TeamGuidance {
  intro: string;
  riskProfile: 'high' | 'medium' | 'low';
  keyMessage: string;
  tasks: TaskItem[];
}

// Team-specific guidance based on context type
const TEAM_GUIDANCE: Record<string, TeamGuidance> = {
  small_market_reset: {
    intro: "You've inherited a small-market team in rebuild mode. Your fanbase is patient, your owner understands the long game, and you have nothing to lose. This is the perfect situation for RATIONAL AGGRESSION - big swings that could transform your franchise.",
    riskProfile: 'high',
    keyMessage: "When you have little to lose, high-variance plays are mathematically correct. A 30% chance at greatness beats a 100% chance at mediocrity.",
    tasks: [
      { id: 1, text: "Evaluate your roster for tradeable veteran assets", hint: "Veterans on expiring contracts have value to contenders" },
      { id: 2, text: "Identify which young players are worth building around", hint: "Look for high-potential players, not just current ratings" },
      { id: 3, text: "Consider trading established players for draft picks", hint: "Future picks = future volatility = opportunities" },
      { id: 4, text: "Take on 'bad' contracts if they come with assets", hint: "Cap space is a tool, not a trophy" },
      { id: 5, text: "Swing for high-upside trades even if risky", hint: "Your situation allows for gambles that could pay off big" },
      { id: 6, text: "Don't worry about short-term win totals", hint: "Losing now can mean winning later" },
      { id: 7, text: "Accumulate assets for future flexibility", hint: "Draft picks and young players are your currency" },
      { id: 8, text: "Watch for star players requesting trades", hint: "You could be the unexpected destination" },
      { id: 9, text: "Keep payroll flexible for future moves", hint: "Cap space = optionality" },
      { id: 10, text: "Trust the process - volatility is your friend", hint: "Big swings lead to big outcomes, good or bad" },
    ],
  },
  cash_rich_expansion: {
    intro: "Your ownership group has deep pockets and sky-high ambitions. They want to make a splash and establish the franchise quickly. You have financial flexibility that most GMs dream of - use it to accelerate your timeline through aggressive moves.",
    riskProfile: 'high',
    keyMessage: "Money amplifies options. When you can absorb financial risk, you can take roster risks others can't afford.",
    tasks: [
      { id: 1, text: "Scout the trade market for available stars", hint: "Your cap space makes you attractive to teams dumping salary" },
      { id: 2, text: "Be willing to take on expensive contracts for talent", hint: "Luxury tax is a tool, not a punishment" },
      { id: 3, text: "Look for teams in financial distress", hint: "Their pain is your opportunity" },
      { id: 4, text: "Consider overpaying in trades to get your guy", hint: "Premium prices for premium talent can be worth it" },
      { id: 5, text: "Build a contender faster than conventional wisdom suggests", hint: "Money can compress timelines" },
      { id: 6, text: "Don't be afraid to attach picks to dump bad fits", hint: "Roster fit > asset hoarding" },
      { id: 7, text: "Target multiple upgrade opportunities simultaneously", hint: "One trade can trigger others" },
      { id: 8, text: "Use your financial edge as leverage", hint: "Teams know you can absorb what they can't" },
      { id: 9, text: "Prioritize talent acquisition over cap flexibility", hint: "Flexibility without talent is worthless" },
      { id: 10, text: "Make bold moves - your owners expect it", hint: "Playing it safe would be the wrong strategy here" },
    ],
  },
  legacy_power: {
    intro: "You're running a historic franchise with championship expectations. Your fanbase expects excellence, and your roster is already competitive. You have room for calculated risks, but reckless moves could destroy years of foundation-building.",
    riskProfile: 'medium',
    keyMessage: "Contenders should take smart risks to maximize championship windows, but avoid moves that could crater the franchise.",
    tasks: [
      { id: 1, text: "Assess your championship window honestly", hint: "How many years do your stars have at peak performance?" },
      { id: 2, text: "Identify the missing piece(s) for a title run", hint: "What specific skills/positions would elevate you?" },
      { id: 3, text: "Consider trading future assets to win now", hint: "Picks are worth less when you're already good" },
      { id: 4, text: "Balance roster depth with star power", hint: "You need both to win in the playoffs" },
      { id: 5, text: "Monitor your stars' happiness and fit", hint: "Chemistry matters at the highest level" },
      { id: 6, text: "Take calculated risks on proven playoff performers", hint: "Playoff experience has real value" },
      { id: 7, text: "Avoid high-risk moves that could set you back years", hint: "You have more to lose than rebuilding teams" },
      { id: 8, text: "Consider luxury tax implications long-term", hint: "Repeater tax adds up fast" },
      { id: 9, text: "Keep one eye on succession planning", hint: "Who's next when your stars decline?" },
      { id: 10, text: "Make win-now moves while maintaining core stability", hint: "Maximize the present without mortgaging everything" },
    ],
  },
  star_dependent: {
    intro: "Your franchise's fortunes ride on your superstar. They're the engine that drives everything - attendance, revenue, wins. Your job is to maximize the window while keeping the star happy, but be careful not to overextend.",
    riskProfile: 'medium',
    keyMessage: "When one player drives your success, protecting that relationship while building around them requires thoughtful risk-taking.",
    tasks: [
      { id: 1, text: "Understand what your star player values", hint: "Winning? Money? Certain teammates? Location?" },
      { id: 2, text: "Build complementary pieces around your star", hint: "What skills do they need next to them?" },
      { id: 3, text: "Monitor your star's contract situation carefully", hint: "The worst outcome is losing them for nothing" },
      { id: 4, text: "Take moderate risks to show commitment to winning", hint: "Stars want to see investment in winning" },
      { id: 5, text: "Avoid moves that might alienate your franchise player", hint: "Their happiness directly impacts your job security" },
      { id: 6, text: "Plan for life after your star (eventually)", hint: "All windows close - prepare accordingly" },
      { id: 7, text: "Consider whether to trade the star if the writing is on the wall", hint: "Sometimes getting assets back is the smart play" },
      { id: 8, text: "Balance short-term star appeasement with long-term health", hint: "Don't gut the future just to keep them happy" },
      { id: 9, text: "Look for trade targets that elevate your star's game", hint: "The right fit multiplies talent" },
      { id: 10, text: "Make moves that signal 'all-in' without actually being all-in", hint: "Perception matters to stars and fans" },
    ],
  },
  revenue_sensitive: {
    intro: "Your team operates in a challenging financial environment. Every dollar matters, mistakes are costly, and you don't have the margin for error that bigger-market teams enjoy. Stability and smart value plays are your path to success.",
    riskProfile: 'low',
    keyMessage: "When you can't absorb failures, avoiding high-variance plays isn't cowardice - it's intelligence. Play the percentages.",
    tasks: [
      { id: 1, text: "Audit your roster for value contracts", hint: "Who is outperforming their salary?" },
      { id: 2, text: "Identify expensive underperformers to move", hint: "Bad contracts hurt you more than big-market teams" },
      { id: 3, text: "Focus on sustainable, incremental improvements", hint: "Small upgrades compound over time" },
      { id: 4, text: "Avoid high-risk/high-reward trades", hint: "You can't afford the downside" },
      { id: 5, text: "Develop talent through your system rather than buying it", hint: "Homegrown players are cost-effective" },
      { id: 6, text: "Stay under the luxury tax threshold", hint: "Tax payments directly hurt your competitiveness" },
      { id: 7, text: "Target undervalued players other teams overlook", hint: "Market inefficiencies are your edge" },
      { id: 8, text: "Prioritize roster stability over flashy moves", hint: "Continuity has value" },
      { id: 9, text: "Build depth to insulate against injuries", hint: "One injury shouldn't tank your season" },
      { id: 10, text: "Play the long game with patience", hint: "Sustainable success beats boom-bust cycles" },
    ],
  },
};

const TeamOnboarding: React.FC = () => {
  const { getUserTeam, setPhase } = useGameStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTasks, setShowTasks] = useState(false);

  const team = getUserTeam();
  if (!team) return null;

  const context = TEAM_CONTEXTS[team.contextType];
  const guidance = TEAM_GUIDANCE[team.contextType];

  const tutorialSteps = [
    {
      title: `Welcome to the ${team.city} ${team.name}!`,
      content: guidance.intro,
    },
    {
      title: "Understanding Your Risk Profile",
      content: `Based on your team's situation, your recommended risk profile is: ${guidance.riskProfile.toUpperCase()}. ${guidance.keyMessage}`,
    },
    {
      title: "Your Mission",
      content: `Over the next 3 seasons, demonstrate that you understand when and how to take risks. Your final score will be based on:\n\n• Risk-Context Alignment (40%) - Did your decisions match your situation?\n• Financial Management (30%) - Did you manage money wisely?\n• On-Court Results (30%) - How did the team perform?`,
    },
    {
      title: "Your Guidance Tasks",
      content: "I've prepared 10 tasks to help guide your decision-making. These aren't strict requirements - they're suggestions to help you think like a GM in YOUR specific situation.",
    },
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTasks(true);
    }
  };

  const handleBack = () => {
    if (showTasks) {
      setShowTasks(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartGame = () => {
    setPhase('preseason');
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'low': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return 'SHOULD Take Big Risks';
      case 'medium': return 'CAN Take Calculated Risks';
      case 'low': return 'AVOID High-Risk Plays';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-arena-dark to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Team Header */}
        <div className="text-center mb-6">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white mb-3"
            style={{ backgroundColor: team.primaryColor }}
          >
            {team.abbreviation}
          </div>
          <h1 className="text-3xl font-bold text-white">{team.city} {team.name}</h1>
          <p className="text-gray-400">{context.label}</p>
          <div className={`inline-block mt-2 px-4 py-1 rounded-full border ${getRiskBadgeColor(guidance.riskProfile)}`}>
            {getRiskLabel(guidance.riskProfile)}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-arena-mid rounded-xl border border-gray-700 overflow-hidden">
          {!showTasks ? (
            <>
              {/* Tutorial Content */}
              <div className="p-8">
                <div className="flex items-start gap-6">
                  {/* Tutor Photo */}
                  <div className="flex-shrink-0">
                    <img
                      src={TUTOR_PHOTO}
                      alt={TUTOR_NAME}
                      className="w-24 h-24 rounded-full object-cover border-4 border-basketball-orange"
                      onError={(e) => {
                        // Fallback to initials if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-24 h-24 rounded-full bg-basketball-orange flex items-center justify-center text-2xl font-bold text-white">
                      BW
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-2">{TUTOR_NAME}</p>
                    <p className="text-center text-xs text-basketball-orange">Your Guide</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {tutorialSteps[currentStep].title}
                    </h2>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {tutorialSteps[currentStep].content}
                    </div>
                  </div>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {tutorialSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === currentStep
                          ? 'bg-basketball-orange scale-125'
                          : idx < currentStep
                          ? 'bg-basketball-orange/50'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-arena-dark px-8 py-4 flex justify-between items-center border-t border-gray-700">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    currentStep === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="bg-basketball-orange text-white px-8 py-2 rounded-lg font-medium hover:bg-orange-600 transition-all"
                >
                  {currentStep === tutorialSteps.length - 1 ? 'View Tasks' : 'Continue'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Tasks View */}
              <div className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex-shrink-0">
                    <img
                      src={TUTOR_PHOTO}
                      alt={TUTOR_NAME}
                      className="w-16 h-16 rounded-full object-cover border-2 border-basketball-orange"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Your Guidance Tasks</h2>
                    <p className="text-gray-400 text-sm">
                      These tasks will help guide your decision-making. They're not requirements - think of them as a GM's checklist.
                    </p>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {guidance.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-arena-dark rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-basketball-orange/20 text-basketball-orange flex items-center justify-center font-bold flex-shrink-0">
                          {task.id}
                        </div>
                        <div>
                          <p className="text-white font-medium">{task.text}</p>
                          <p className="text-gray-500 text-sm mt-1 italic">{task.hint}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Reminder */}
                <div className="mt-6 p-4 bg-gradient-to-r from-basketball-orange/10 to-transparent rounded-lg border-l-4 border-basketball-orange">
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-white">REMEMBER:</span> {guidance.keyMessage}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-arena-dark px-8 py-4 flex justify-between items-center border-t border-gray-700">
                <button
                  onClick={handleBack}
                  className="bg-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all"
                >
                  Back to Tutorial
                </button>
                <button
                  onClick={handleStartGame}
                  className="bg-basketball-orange text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-orange-600 transition-all"
                >
                  Start Season 1
                </button>
              </div>
            </>
          )}
        </div>

        {/* Skip Option */}
        {!showTasks && (
          <div className="text-center mt-4">
            <button
              onClick={handleStartGame}
              className="text-gray-500 hover:text-gray-400 text-sm underline"
            >
              Skip tutorial and start playing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamOnboarding;
