import React, { useState } from 'react';
import { ArrowLeft, Lightbulb, Zap, Clock, Trophy, ChevronLeft, ChevronRight, Layers, Flame, Sparkles } from 'lucide-react';
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
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 animate-fade-in flex flex-col items-center">
      {/* Top Game Navigation & Live Cyber HUD Scoreboard */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-3xl glass-panel cyber-hud border border-white/20 mb-4 shadow-2xl relative overflow-hidden">
        {/* Subtle top scanline sweep */}
        <div className="scanline-sweep" />

        {/* Left: Back to Cube / Hub */}
        <button
          onClick={() => {
            sounds.playClick();
            onExit();
          }}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 text-slate-200 hover:text-white cursor-pointer hover:border-cyan-400"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Hub</span>
        </button>

        {/* Center: Title & Level Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl p-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner animate-pulse-glow">
            {icon}
          </span>
          <div className="text-left">
            <h2 className="text-base sm:text-xl font-black font-orbitron text-white leading-tight tracking-wide drop-shadow-md">
              {title}
            </h2>

            {/* Level & Difficulty Controls */}
            {onLevelChange && (
              <div className="flex items-center gap-1.5 mt-1">
                {/* Prev Level */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    onLevelChange(Math.max(1, level - 1));
                  }}
                  disabled={level <= 1}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-all active:scale-90"
                  title="Previous Level"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Level selector pill with glow */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setLevelModalOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border text-[11px] font-mono font-bold transition-all active:scale-95 shadow-lg cursor-pointer ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color} ${diffCfg.glow}`}
                  title="Click to select any level from 1 to 100"
                >
                  <Layers className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>LVL {level}/100</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-black/50 text-[9px] uppercase tracking-wider border border-white/10">
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
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-all active:scale-90"
                  title="Next Level"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Stats (Score, Streak Multiplier, Time, Hint) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Score Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-950/70 border border-purple-500/50 text-purple-200 text-xs font-mono font-bold shadow-lg shadow-purple-950/40">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{score} PTS</span>
          </div>

          {/* Streak Flame Multiplier */}
          {streak > 1 ? (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-amber-950/70 border border-amber-500/60 text-amber-300 text-xs font-mono font-bold shadow-lg shadow-amber-950/50 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current animate-bounce" />
              <span>{streak}x COMBO</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
              <Zap className="w-3 h-3 text-slate-400" />
              <span>1x</span>
            </div>
          )}

          {/* Digital Clock readout */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-200 text-xs font-mono font-bold tracking-wider shadow-lg shadow-cyan-950/40">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{time}</span>
          </div>

          {/* Tactical Hint Button (-10 PTS) */}
          <button
            onClick={() => {
              sounds.playClick();
              onHint();
            }}
            disabled={hintDisabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
            title="Calibrate Matrix (-10 Points penalty)"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Hint (-10)</span>
            <span className="sm:hidden">-10</span>
          </button>
        </div>
      </div>

      {/* Floating Tactical Hint HUD (if active) */}
      {hintText && (
        <div className="w-full mb-4 p-3.5 sm:p-4 rounded-3xl bg-amber-950/80 border-2 border-amber-500/70 text-amber-200 text-xs md:text-sm flex items-start gap-3 shadow-2xl shadow-amber-950/60 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-spin-slow" />
          <div>
            <span className="font-orbitron font-bold uppercase tracking-wider text-amber-300">
              QUANTUM COGNITIVE HINT:
            </span>
            <p className="mt-0.5 text-amber-100 font-space leading-relaxed">{hintText}</p>
          </div>
        </div>
      )}

      {/* Game Arena Body Content */}
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
