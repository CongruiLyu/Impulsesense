import { InterventionLevel } from '../types';

/**
 * Maps a raw score (0-1) to an Intervention Level
 */
export const getLevelFromScore = (score: number): InterventionLevel => {
  if (score >= 0.85) return InterventionLevel.L5_SAFE_MODE;
  if (score >= 0.70) return InterventionLevel.L4_MICRO_LOCK;
  if (score >= 0.60) return InterventionLevel.L3_BREATHING;
  if (score >= 0.40) return InterventionLevel.L2_GRAYSCALE;
  if (score >= 0.20) return InterventionLevel.L1_REFLECTION;
  return InterventionLevel.L0_NORMAL;
};

/**
 * Simulates browsing behavior analysis.
 * In a real app, this would use the webcam stream and scroll listeners.
 */
export const calculateImpulseDelta = (
  currentScore: number,
  isScrollingFast: boolean,
  isClickingRapidly: boolean,
  isInterventionActive: boolean
): number => {
  let delta = 0;

  // Shopping Behavior simulation
  if (isScrollingFast) delta += 0.005; // Fast scrolling increases anxiety/hunt
  if (isClickingRapidly) delta += 0.02; // Rapid clicking is a strong signal

  // Natural Decay or Increase based on context
  if (!isScrollingFast && !isClickingRapidly) {
     // If passive, slight decay, unless intervention is active then faster decay
     delta -= isInterventionActive ? 0.01 : 0.001;
  }

  // Random noise (Simulating micro-expressions/heart rate fluctuation)
  // Only add noise if we aren't already saturated or completely calm to prevent getting stuck
  if (Math.random() > 0.7) {
    delta += (Math.random() - 0.5) * 0.01;
  }

  return delta;
};