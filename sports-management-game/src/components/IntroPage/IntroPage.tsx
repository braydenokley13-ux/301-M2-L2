import React, { useState } from 'react';

interface IntroPageProps {
  onContinue: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onContinue }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'welcome',
      title: 'Risk, Volatility & Rational Aggression',
      subtitle: 'Track 301 - Module 2 - Lesson 2',
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-300">
            You're about to run an NBA franchise for <span className="text-basketball-orange font-bold">3 seasons</span>.
          </p>
          <div className="bg-basketball-orange/10 border border-basketball-orange rounded-lg p-4">
            <h3 className="text-basketball-orange font-bold text-xl mb-2">YOUR GOAL</h3>
            <p className="text-white">
              Demonstrate that you understand <strong>when to take risks</strong> and <strong>when to play it safe</strong> based on your team's situation.
            </p>
          </div>
          <p className="text-gray-400 text-sm">
            This isn't just about winning. It's about making decisions that <em>fit your context</em>.
          </p>
        </div>
      ),
    },
    {
      id: 'volatility',
      title: 'The Volatility Lesson',
      subtitle: 'Same Average, Different Experience',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Two teams can have the <strong className="text-white">same average wins</strong> but completely different experiences:</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
              <h4 className="text-blue-400 font-bold mb-2">Team A: Stable</h4>
              <div className="flex items-end gap-1 h-20 mb-2">
                {[44, 46, 45, 43, 47, 45].map((w, i) => (
                  <div key={i} className="flex-1 bg-blue-500 rounded-t transition-all" style={{ height: `${(w / 60) * 100}%` }} />
                ))}
              </div>
              <p className="text-xs text-blue-300">Always 43-47 wins</p>
              <p className="text-xs text-gray-400 mt-1">Predictable, but never great</p>
            </div>

            <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-4">
              <h4 className="text-orange-400 font-bold mb-2">Team B: Volatile</h4>
              <div className="flex items-end gap-1 h-20 mb-2">
                {[58, 32, 55, 28, 62, 35].map((w, i) => (
                  <div key={i} className="flex-1 bg-orange-500 rounded-t transition-all" style={{ height: `${(w / 60) * 100}%` }} />
                ))}
              </div>
              <p className="text-xs text-orange-300">Swings from 28 to 62 wins</p>
              <p className="text-xs text-gray-400 mt-1">Championship shots, but also disasters</p>
            </div>
          </div>

          <div className="bg-arena-dark rounded-lg p-3 text-center">
            <p className="text-gray-300">Both teams average <span className="text-white font-bold">45 wins</span>.</p>
            <p className="text-basketball-orange font-medium mt-1">But which approach is right for YOUR team?</p>
          </div>
        </div>
      ),
    },
    {
      id: 'context',
      title: 'Context Is Everything',
      subtitle: 'The Same Move Can Be Smart OR Reckless',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">The same aggressive trade can be:</p>

          <div className="space-y-3">
            <div className="bg-green-900/20 border border-green-600 rounded-lg p-3 flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h4 className="text-green-400 font-bold">SMART</h4>
                <p className="text-sm text-gray-400">For a small-market team stuck in mediocrity. They <em>need</em> volatility to escape.</p>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 flex items-center gap-3">
              <div className="text-2xl">⚠</div>
              <div>
                <h4 className="text-yellow-400 font-bold">RISKY BUT RATIONAL</h4>
                <p className="text-sm text-gray-400">For a large-market team with financial buffer. They <em>can afford</em> the downside.</p>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 flex items-center gap-3">
              <div className="text-2xl">✗</div>
              <div>
                <h4 className="text-red-400 font-bold">RECKLESS</h4>
                <p className="text-sm text-gray-400">For a revenue-sensitive franchise. One bad season could be catastrophic.</p>
              </div>
            </div>
          </div>

          <p className="text-center text-basketball-orange font-medium">
            Risk isn't about courage. It's about FIT.
          </p>
        </div>
      ),
    },
    {
      id: 'rational',
      title: 'Rational Aggression',
      subtitle: 'The Key Concept',
      content: (
        <div className="space-y-4">
          <div className="bg-arena-dark rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">Great GMs don't ask:</h4>
            <p className="text-gray-400 line-through">"Is this risky?"</p>

            <h4 className="text-basketball-orange font-bold mt-4 mb-3">They ask:</h4>
            <p className="text-white text-lg">"Can our system ABSORB this risk?"</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
              <h5 className="text-green-400 font-bold text-sm">RATIONAL AGGRESSION</h5>
              <p className="text-xs text-gray-400 mt-1">Taking big swings when failure is <em>survivable</em></p>
            </div>
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
              <h5 className="text-blue-400 font-bold text-sm">RATIONAL CAUTION</h5>
              <p className="text-xs text-gray-400 mt-1">Avoiding volatility when downside is <em>catastrophic</em></p>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
            <h5 className="text-red-400 font-bold text-sm">IRRATIONAL RISK</h5>
            <p className="text-xs text-gray-400 mt-1">Big swings when your system can't handle failure = reckless</p>
          </div>
        </div>
      ),
    },
    {
      id: 'challenge',
      title: 'Your 3-Season Challenge',
      subtitle: 'How You\'ll Be Evaluated',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">After 3 seasons, you'll be scored on:</p>

          <div className="space-y-3">
            <div className="bg-arena-dark rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h4 className="text-white font-bold">Risk-Context Alignment</h4>
                <span className="text-basketball-orange font-bold">40%</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Did you take risks appropriate to your team's situation?</p>
            </div>

            <div className="bg-arena-dark rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h4 className="text-white font-bold">Financial Sustainability</h4>
                <span className="text-basketball-orange font-bold">30%</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Did you manage the salary cap and avoid catastrophic losses?</p>
            </div>

            <div className="bg-arena-dark rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h4 className="text-white font-bold">On-Court Results</h4>
                <span className="text-basketball-orange font-bold">30%</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Wins, playoffs, and championships still matter!</p>
            </div>
          </div>

          <div className="bg-basketball-orange/10 border border-basketball-orange rounded-lg p-4 text-center">
            <p className="text-basketball-orange font-bold">Complete all 3 seasons to earn your claim code.</p>
            <p className="text-sm text-gray-400 mt-1">Your code reflects how well you understood the lesson.</p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentStep ? 'bg-basketball-orange scale-125' :
                idx < currentStep ? 'bg-basketball-orange/50' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-arena-mid rounded-xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-basketball-orange/20 to-orange-900/20 border-b border-gray-700 p-6 text-center">
            <p className="text-basketball-orange text-sm font-medium mb-1">{currentStepData.subtitle}</p>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">{currentStepData.title}</h1>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="p-6 pt-0 flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentStep === 0 ? 'invisible' : 'bg-arena-dark text-gray-300 hover:text-white'
              }`}
            >
              Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-8 py-2 bg-basketball-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onContinue}
                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                Choose Your Team
              </button>
            )}
          </div>
        </div>

        {/* Skip */}
        {currentStep < steps.length - 1 && (
          <button
            onClick={onContinue}
            className="w-full mt-4 text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            Skip intro (not recommended)
          </button>
        )}
      </div>
    </div>
  );
};

export default IntroPage;
