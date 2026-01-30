import React, { useState } from 'react';

interface IntroPageProps {
  onContinue: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onContinue }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to NBA GM Simulator',
      subtitle: 'Track 301 - Module 2 - Lesson 2',
      content: 'You\'re about to become a General Manager. But this isn\'t just about winning games - it\'s about understanding how risk shapes every decision in sports business.',
      highlight: 'Your mission: Build a franchise over 3 seasons while learning when to take big swings... and when to play it safe.',
      visual: 'intro',
    },
    {
      title: 'Same Average, Different Experience',
      subtitle: 'Understanding Volatility',
      content: 'Imagine two teams that both average 45 wins per season.',
      details: [
        { label: 'Team A (Stable)', value: 'Wins 42-48 games every year', color: 'blue' },
        { label: 'Team B (Volatile)', value: 'Swings between 30 and 60 wins', color: 'orange' },
      ],
      highlight: 'Same average outcome. Completely different experience. This spread is called VOLATILITY - and it changes everything about how you should manage.',
      visual: 'volatility',
    },
    {
      title: 'Bad Results ≠ Bad Strategy',
      subtitle: 'Thinking in Distributions',
      content: 'Fans judge decisions by results: "You lost, so the plan was bad."',
      details: [
        { label: 'Fan Thinking', value: '"They lost = bad decision"', color: 'red' },
        { label: 'GM Thinking', value: '"Was this likely to create value?"', color: 'green' },
      ],
      highlight: 'A high-risk strategy can fail and still be rational. A low-risk strategy can succeed and still be weak. You\'ll learn to judge moves by their logic, not just their outcome.',
      visual: 'distribution',
    },
    {
      title: 'Risk ≠ Being Reckless',
      subtitle: 'Context Determines Rationality',
      content: 'The same aggressive move can be smart for one team and disastrous for another.',
      details: [
        { label: 'Small Market Team', value: 'NEEDS volatility to escape mediocrity', color: 'green' },
        { label: 'Legacy Franchise', value: 'Can AFFORD volatility due to brand equity', color: 'blue' },
        { label: 'Revenue-Sensitive Team', value: 'Must AVOID volatility - failure is catastrophic', color: 'red' },
      ],
      highlight: 'Risk isn\'t about courage. It\'s about whether your system can ABSORB the consequences of failure.',
      visual: 'context',
    },
    {
      title: 'Rational Aggression',
      subtitle: 'The Key Concept',
      content: 'Great GMs don\'t ask "Is this risky?" They ask "Can our system absorb this risk?"',
      details: [
        { label: 'Rational Aggression', value: 'Big swings when failure is survivable', color: 'green' },
        { label: 'Rational Caution', value: 'Avoiding volatility when downside is catastrophic', color: 'blue' },
        { label: 'Irrational Risk', value: 'Big swings when you can\'t afford to fail', color: 'red' },
      ],
      highlight: 'Your goal over 3 seasons: Make decisions that match your team\'s ability to handle volatility. Sometimes the bold move is right. Sometimes it\'s reckless.',
      visual: 'rational',
    },
    {
      title: 'Your Challenge',
      subtitle: '3 Seasons to Prove Yourself',
      content: 'You\'ll manage a team through 3 complete seasons. At the end, you\'ll be evaluated on:',
      details: [
        { label: 'On-Court Success', value: 'Wins, playoffs, championships', color: 'blue' },
        { label: 'Financial Management', value: 'Salary cap, luxury tax, profitability', color: 'green' },
        { label: 'Risk Alignment', value: 'Did your aggression match your context?', color: 'orange' },
      ],
      highlight: 'Complete all 3 seasons to receive your claim code and see how well you understood the lesson.',
      visual: 'challenge',
    },
  ];

  const currentStepData = steps[currentStep];

  const renderVisual = () => {
    switch (currentStepData.visual) {
      case 'volatility':
        return (
          <div className="flex gap-4 justify-center my-6">
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 w-40">
              <div className="text-blue-400 font-bold text-sm mb-2">Team A (Stable)</div>
              <div className="flex gap-1 items-end h-16">
                {[44, 46, 45, 43, 47].map((w, i) => (
                  <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${(w / 60) * 100}%` }} />
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">42-48 wins</div>
            </div>
            <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-4 w-40">
              <div className="text-orange-400 font-bold text-sm mb-2">Team B (Volatile)</div>
              <div className="flex gap-1 items-end h-16">
                {[58, 32, 55, 38, 62].map((w, i) => (
                  <div key={i} className="flex-1 bg-orange-500 rounded-t" style={{ height: `${(w / 60) * 100}%` }} />
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">30-60 wins</div>
            </div>
          </div>
        );
      case 'context':
        return (
          <div className="flex justify-center my-6">
            <div className="bg-arena-dark rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Same Trade Proposal:</div>
              <div className="text-white font-bold mb-3">"Trade star player for 3 draft picks"</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-green-900/30 border border-green-600 rounded p-2 text-center">
                  <div className="text-green-400">Small Market</div>
                  <div className="text-green-300">SMART</div>
                </div>
                <div className="bg-blue-900/30 border border-blue-600 rounded p-2 text-center">
                  <div className="text-blue-400">Legacy Team</div>
                  <div className="text-blue-300">RISKY</div>
                </div>
                <div className="bg-red-900/30 border border-red-600 rounded p-2 text-center">
                  <div className="text-red-400">Revenue-Dep.</div>
                  <div className="text-red-300">RECKLESS</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'rational':
        return (
          <div className="flex justify-center my-6">
            <div className="relative w-64 h-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-24 border-2 border-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Your Decision Space</span>
                </div>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
                <div className="text-xs text-blue-400">Safe</div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                <div className="text-xs text-orange-400">Risky</div>
              </div>
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-4">
                <div className="text-xs text-green-400">Context determines what's rational</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
                idx <= currentStep ? 'bg-basketball-orange' : 'bg-gray-600'
              }`}
              onClick={() => setCurrentStep(idx)}
            />
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-arena-mid rounded-xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-basketball-orange text-sm font-medium mb-1">
              {currentStepData.subtitle}
            </div>
            <h1 className="font-heading text-3xl font-bold text-white">
              {currentStepData.title}
            </h1>
          </div>

          {/* Main content */}
          <p className="text-gray-300 text-lg mb-4 text-center">
            {currentStepData.content}
          </p>

          {/* Visual */}
          {renderVisual()}

          {/* Details list */}
          {currentStepData.details && (
            <div className="bg-arena-dark rounded-lg p-4 mb-6">
              {currentStepData.details.map((detail, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between py-3 border-b border-gray-700 last:border-0`}
                >
                  <span className={`font-medium ${
                    detail.color === 'blue' ? 'text-blue-400' :
                    detail.color === 'orange' ? 'text-orange-400' :
                    detail.color === 'green' ? 'text-green-400' :
                    detail.color === 'red' ? 'text-red-400' : 'text-gray-300'
                  }`}>
                    {detail.label}
                  </span>
                  <span className="text-gray-400 text-sm text-right max-w-xs">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Highlight box */}
          {currentStepData.highlight && (
            <div className="bg-basketball-orange/10 border border-basketball-orange/30 rounded-lg p-4 mb-6">
              <p className="text-basketball-orange text-sm font-medium">
                {currentStepData.highlight}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 justify-center">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 bg-arena-dark text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-8 py-3 bg-basketball-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onContinue}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                Choose Your Team
              </button>
            )}
          </div>
        </div>

        {/* Skip option */}
        {currentStep < steps.length - 1 && (
          <button
            onClick={onContinue}
            className="w-full mt-4 text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            Skip Tutorial
          </button>
        )}
      </div>
    </div>
  );
};

export default IntroPage;
