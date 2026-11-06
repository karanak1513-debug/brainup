/**
 * BrainUp 100-Level System & Difficulty Shuffler
 * Provides shuffled progression across EASY, MEDIUM, HARD, and SUPER HARD.
 */

export function getLevelDifficulty(level) {
  level = Math.max(1, Math.min(100, Number(level) || 1));
  if (level <= 10) {
    return [4, 7, 9].includes(level) ? 'MEDIUM' : 'EASY';
  } else if (level <= 30) {
    const pattern = ['EASY', 'MEDIUM', 'EASY', 'HARD', 'MEDIUM'];
    return pattern[(level - 11) % pattern.length];
  } else if (level <= 60) {
    const pattern = ['MEDIUM', 'HARD', 'MEDIUM', 'SUPER HARD', 'HARD'];
    return pattern[(level - 31) % pattern.length];
  } else if (level <= 85) {
    const pattern = ['HARD', 'MEDIUM', 'SUPER HARD', 'HARD', 'SUPER HARD'];
    return pattern[(level - 61) % pattern.length];
  } else {
    const pattern = ['HARD', 'SUPER HARD', 'SUPER HARD', 'SUPER HARD'];
    return pattern[(level - 86) % pattern.length];
  }
}

export const DIFFICULTY_CONFIG = {
  EASY: {
    label: 'EASY',
    color: 'text-emerald-300',
    bg: 'bg-emerald-950/80',
    border: 'border-emerald-500/60',
    glow: 'shadow-emerald-900/50',
    dot: 'bg-emerald-400'
  },
  MEDIUM: {
    label: 'MEDIUM',
    color: 'text-amber-300',
    bg: 'bg-amber-950/80',
    border: 'border-amber-500/60',
    glow: 'shadow-amber-900/50',
    dot: 'bg-amber-400'
  },
  HARD: {
    label: 'HARD',
    color: 'text-rose-300',
    bg: 'bg-rose-950/80',
    border: 'border-rose-500/60',
    glow: 'shadow-rose-900/50',
    dot: 'bg-rose-400'
  },
  'SUPER HARD': {
    label: 'SUPER HARD',
    color: 'text-purple-200',
    bg: 'bg-purple-950/80',
    border: 'border-purple-400/80',
    glow: 'shadow-purple-900/70',
    dot: 'bg-purple-400',
    pulse: true
  }
};
