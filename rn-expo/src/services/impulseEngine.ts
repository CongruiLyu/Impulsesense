import { InterventionLevel } from '../types';

export const getLevelFromScore = (score: number): InterventionLevel => {
  if (score >= 0.85) return InterventionLevel.L5_SAFE_MODE;
  if (score >= 0.70) return InterventionLevel.L4_MICRO_LOCK;
  if (score >= 0.60) return InterventionLevel.L3_BREATHING;
  if (score >= 0.40) return InterventionLevel.L2_GRAYSCALE;
  if (score >= 0.20) return InterventionLevel.L1_REFLECTION;
  return InterventionLevel.L0_NORMAL;
};

export const calculateImpulseDelta = (
  currentScore: number,
  isScrollingFast: boolean,
  isClickingRapidly: boolean,
  isInterventionActive: boolean
): number => {
  let delta = 0;
  if (isScrollingFast) delta += 0.005;
  if (isClickingRapidly) delta += 0.02;
  if (!isScrollingFast && !isClickingRapidly) delta -= isInterventionActive ? 0.01 : 0.001;
  if (Math.random() > 0.7) delta += (Math.random() - 0.5) * 0.01;
  return delta;
};

