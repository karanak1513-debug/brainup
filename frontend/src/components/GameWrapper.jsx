import React, { useState } from 'react';
import { ArrowLeft, Lightbulb, Zap, Clock, Trophy, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { sounds } from '../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../utils/levels';
import LevelSelectorModal from './LevelSelectorModal';

export default function GameWrapper({
  title,
  subtitle,
  icon,
  score,
  streak,
  time,
  level = 1,
  onLevelChange,
  onExit,
  onHint,
  hintDisabled = false,
  hintText = null,
  children
}) {
  const [levelModalOpen, setLevelModalOpen] = useState(false);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG['EASY'];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-fade-in flex flex-col items-center">
      {/* Top Game Navigation & Live Scoreboard */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel border border-white/15 mb-3 shadow-xl">
        {/* Left: Back to Cube */}
        <button
          onClick={() => {
            sounds.playClick();
            onExit();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 text-slate-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Back to Cube</span>
        </button>

        {/* Center: Title & Level Badge */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <h2 className="text-base sm:text-lg font-extrabold font-orbitron text-white leading-tight">
              {title}
            </h2>

            {/* Level & Difficulty Controls */}
            {onLevelChange && (
              <div className="flex items-center gap-1.5 mt-0.5">
                {/* Prev Level */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    onLevelChange(Math.max(1, level - 1));
                  }}
                  disabled={level <= 1}
                  className="p-0.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                  title="Previous Level"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Level selector pill */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setLevelModalOpen(true);
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-mono font-bold transition-all active:scale-95 shadow-sm ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color} ${diffCfg.glow}`}
                  title="Click to select any level from 1 to 100"
                >
                  <Layers className="w-3 h-3" />
                  <span>LVL {level}/100</span>
                  <span className="px-1 py-0.2 rounded bg-black/40 text-[9px] uppercase tracking-wider">
                    {diffCfg.label}
                  </span>
                </button>

                {/* Next Level */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    onLevelChange(Math.min(100, level + 1));
                  }}
                  disabled={level >= 100}
                  className="p-0.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                  title="Next Level"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Stats (Score, Streak, Time, Hint) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Points */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{score} PTS</span>
          </div>

          {/* Streak Multiplier */}
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold animate-pulse">
              <Zap className="w-3 h-3 fill-current" />
              <span>{streak}x</span>
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold">
            <Clock className="w-3 h-3" />
            <span>{time}</span>
          </div>

          {/* Hint Button (-10 PTS) */}
          <button
            onClick={() => {
              sounds.playClick();
              onHint();
            }}
            disabled={hintDisabled}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Use Hint (-10 Points penalty)"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hint (-10)</span>
            <span className="sm:hidden">-10</span>
          </button>
        </div>
      </div>

      {/* Floating Hint Alert (if active) */}
      {hintText && (
        <div className="w-full mb-3 p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-xs md:text-sm flex items-start gap-2.5 shadow-lg shadow-amber-950/50 animate-bounce">
          <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-amber-300">Quantum Hint: </span>
            <span>{hintText}</span>
          </div>
        </div>
      )}

      {/* Game Body Content */}
      <div className="w-full">
        {children}
      </div>

      {/* Level Selector Modal (1 to 100) */}
      <LevelSelectorModal
        isOpen={levelModalOpen}
        onClose={() => setLevelModalOpen(false)}
        currentLevel={level}
        onSelectLevel={onLevelChange}
        gameName={title}
      />
    </div>
  );
}
