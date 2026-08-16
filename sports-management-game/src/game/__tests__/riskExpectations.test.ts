import {
  CONTEXT_RISK_EXPECTATIONS,
  getRiskExpectation,
  riskBandCoaching,
  riskBandLabel,
  getContextCompatibility,
  TEAM_CONTEXTS,
  type RiskBand,
} from '../teamContext';
import type { TeamContextType, StrategyType } from '../../data/types';

/**
 * The whole simulation teaches one thing: match your risk to your situation.
 * These tests pin the property that was broken — the advice a student reads
 * while deciding must name the same band the final grade is computed from.
 *
 * The defect was a unit mismatch. `ownershipRiskTolerance` is stored 0–1, and
 * the dashboard compared it against 7 and 4 as though it were 0–10, so four of
 * the five contexts were told to play it safe regardless. For the two contexts
 * the game rewards for swinging, following that advice scored 20/100 on a
 * component worth 40% of the final grade.
 */

// Mirrors the alignment scoring in GameEndScreen.
const alignment = (expected: RiskBand, actual: RiskBand): number =>
  expected === 'medium'
    ? actual === 'medium' ? 100 : 70
    : expected === actual ? 100 : actual === 'medium' ? 60 : 20;

const CONTEXTS = Object.keys(CONTEXT_RISK_EXPECTATIONS) as TeamContextType[];

test('every context the game ships has a stated risk expectation', () => {
  const declared = Object.keys(TEAM_CONTEXTS) as TeamContextType[];
  for (const c of declared) expect(CONTEXT_RISK_EXPECTATIONS[c]).toBeDefined();
  expect(CONTEXTS.length).toBe(declared.length);
});

test('following the coaching always scores full alignment', () => {
  for (const c of CONTEXTS) {
    const band = getRiskExpectation(c);
    expect(alignment(band, band)).toBe(100);
  }
});

test('the coaching sentence names the band it is derived from', () => {
  const wording: Record<RiskBand, RegExp> = {
    high: /SHOULD take big risks/i,
    medium: /Moderate risk/i,
    low: /AVOID high risk/i,
  };
  for (const c of CONTEXTS) {
    const band = getRiskExpectation(c);
    expect(riskBandCoaching(band)).toMatch(wording[band]);
  }
});

test('badge label and coaching never disagree about the band', () => {
  for (const c of CONTEXTS) {
    const band = getRiskExpectation(c);
    const label = riskBandLabel(band);
    if (band === 'high') expect(label).toMatch(/SHOULD/);
    if (band === 'low') expect(label).toMatch(/AVOID/);
    if (band === 'medium') expect(label).toMatch(/CAN/);
  }
});

test('ownershipRiskTolerance is a 0-1 fraction, which is why it must not be compared against 7', () => {
  for (const c of CONTEXTS) {
    const t = TEAM_CONTEXTS[c].ownershipRiskTolerance;
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThanOrEqual(1);
    // The shipped bug in one line: no team could ever clear these thresholds.
    expect(t >= 7).toBe(false);
    expect(t >= 4).toBe(false);
  }
});

test('the old comparison mislabelled four of the five contexts', () => {
  const oldBand = (t: number): RiskBand => (t >= 7 ? 'high' : t >= 4 ? 'medium' : 'low');
  const wrong = CONTEXTS.filter(
    (c) => oldBand(TEAM_CONTEXTS[c].ownershipRiskTolerance) !== getRiskExpectation(c),
  );
  // revenue_sensitive is the one that was accidentally right: its expectation
  // is 'low', and the broken comparison collapsed everything to 'low'.
  expect(wrong).toHaveLength(4);
  expect(wrong).not.toContain('revenue_sensitive');
});

test('a student who followed the old advice lost up to 32 points of 100', () => {
  const oldBand = (t: number): RiskBand => (t >= 7 ? 'high' : t >= 4 ? 'medium' : 'low');
  const losses = CONTEXTS.map((c) => {
    const expected = getRiskExpectation(c);
    const followed = oldBand(TEAM_CONTEXTS[c].ownershipRiskTolerance);
    return (alignment(expected, expected) - alignment(expected, followed)) * 0.4;
  });
  expect(Math.max(...losses)).toBeCloseTo(32);
  expect(Math.min(...losses)).toBe(0);
});

test('strategy compatibility agrees with the risk band, so wiring it up cannot contradict scoring', () => {
  const strategies: StrategyType[] = ['stability_first', 'aggressive_push', 'boom_bust_swing'];
  for (const c of CONTEXTS) {
    const band = getRiskExpectation(c);
    const scores = strategies.map((s) => [s, getContextCompatibility(c, s)] as const);
    const best = scores.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    if (band === 'high') expect(best).toBe('boom_bust_swing');
    if (band === 'low') expect(best).toBe('stability_first');
  }
});

/**
 * The results screen renders each component score directly, so a component that
 * carries a fraction shows every digit of it. `performanceScore` mixes integer
 * bonuses with `avgWins / 2`, which is where "43.666666666666664" came from.
 */
test('a component score built from a mean is a whole number by the time it is shown', () => {
  const performance = (championships: number, playoffs: number, avgWins: number) =>
    Math.round(Math.min(100, championships * 35 + playoffs * 12 + Math.min(30, avgWins / 2)));

  // 131 wins across 3 seasons — the shape of run that produced the raw float.
  expect(Number.isInteger(performance(0, 1, 131 / 3))).toBe(true);
  for (let wins = 0; wins <= 82 * 3; wins += 7) {
    for (const champs of [0, 1, 2]) {
      for (const playoffs of [0, 1, 2, 3]) {
        const v = performance(champs, playoffs, wins / 3);
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeLessThanOrEqual(100);
        expect(v).toBeGreaterThanOrEqual(0);
      }
    }
  }
});
