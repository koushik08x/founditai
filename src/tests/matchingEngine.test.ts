import { describe, it, expect } from 'vitest';
import {
  calculateMatchScore,
  computeAllCandidateMatches,
  evaluateColors,
  evaluateDates,
  calculateLocationScore
} from '../services/matchingEngine';
import { INITIAL_DEMO_REPORTS } from '../services/seedData';
import { ItemReport } from '../types';

describe('FoundIt AI Matching Engine', () => {
  const lostWaterBottle = INITIAL_DEMO_REPORTS.find(r => r.id === 'report-lost-001')!;
  const foundFlask = INITIAL_DEMO_REPORTS.find(r => r.id === 'report-found-001')!;
  const foundSportsBottle = INITIAL_DEMO_REPORTS.find(r => r.id === 'report-found-003')!;

  const lostNotebook = INITIAL_DEMO_REPORTS.find(r => r.id === 'report-lost-002')!;
  const foundNotebook = INITIAL_DEMO_REPORTS.find(r => r.id === 'report-found-002')!;

  it('calculates a strong match for plausible pair: "black water bottle near library" and "black flask near reading room"', () => {
    const { score, explanation } = calculateMatchScore(lostWaterBottle, foundFlask);

    // Should receive a high score due to synonyms (water bottle ~ flask), same category, matching color (black), same location (Library), same date
    expect(score).toBeGreaterThanOrEqual(70);
    expect(explanation.confidenceTier).toBe('High Probability');
    expect(explanation.sharedAttributes.length).toBeGreaterThanOrEqual(3);
    expect(explanation.conflictingAttributes.length).toBe(0);
  });

  it('ensures unrelated item (red sports bottle at sports arena) does not receive an unjustifiably high score against black library bottle', () => {
    const { score, explanation } = calculateMatchScore(lostWaterBottle, foundSportsBottle);

    // Must be substantially lower than the true candidate due to color contradiction (Black vs Red) and distant location (Library vs Sports Arena)
    expect(score).toBeLessThan(45);
    expect(explanation.conflictingAttributes.some(c => c.toLowerCase().includes('color contradiction'))).toBe(true);
  });

  it('calculates a strong match for blue spiral notebook lost and found near engineering block', () => {
    const { score, explanation } = calculateMatchScore(lostNotebook, foundNotebook);

    expect(score).toBeGreaterThanOrEqual(75);
    expect(explanation.confidenceTier).toBe('High Probability');
    expect(explanation.sharedAttributes.some(s => s.includes('Blue'))).toBe(true);
  });

  it('rejects lost-to-lost and found-to-found comparisons', () => {
    // Attempting to match lost to lost
    expect(() => calculateMatchScore(lostWaterBottle, lostNotebook as any)).toThrow(
      /Expected lost vs found/
    );

    // Attempting to match found to found
    expect(() => calculateMatchScore(foundFlask as any, foundSportsBottle)).toThrow(
      /Expected lost vs found/
    );
  });

  it('penalizes color contradictions explicitly', () => {
    const evalBlackRed = evaluateColors('Black', 'Red');
    expect(evalBlackRed.isContradiction).toBe(true);
    expect(evalBlackRed.score).toBe(0);

    const evalBlackBlack = evaluateColors('Black', 'Black');
    expect(evalBlackBlack.isMatch).toBe(true);
    expect(evalBlackBlack.score).toBe(1.0);
  });

  it('handles unknown or unspecified colors neutrally without harsh penalty', () => {
    const evalUnspecified = evaluateColors('Black', null);
    expect(evalUnspecified.isUncertain).toBe(true);
    expect(evalUnspecified.isContradiction).toBe(false);
    expect(evalUnspecified.score).toBeGreaterThan(0);
  });

  it('evaluates location proximity correctly for campus zones', () => {
    // Exact or same building
    const exact = calculateLocationScore('Main Library', 'Main Library');
    expect(exact.exactMatch).toBe(true);
    expect(exact.score).toBe(1.0);

    // Different zones
    const distant = calculateLocationScore('Main Library', 'University Sports Arena');
    expect(distant.zoneMatch).toBe(false);
    expect(distant.score).toBeLessThanOrEqual(0.2);
  });

  it('excludes resolved reports from computeAllCandidateMatches', () => {
    const reportsWithResolved: ItemReport[] = [
      { ...lostWaterBottle, status: 'resolved' },
      foundFlask
    ];

    const candidateMatches = computeAllCandidateMatches(reportsWithResolved);
    expect(candidateMatches.length).toBe(0);
  });
});
