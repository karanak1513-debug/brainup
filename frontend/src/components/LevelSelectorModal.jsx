import React, { useState } from 'react';
import { X, Layers, Sparkles, Check } from 'lucide-react';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../utils/levels';
import { sounds } from '../utils/soundFX';

export default function LevelSelectorModal({ isOpen, onClose, currentLevel, onSelectLevel, gameName = 'Game' }) {
  const [filter, setFilter] = useState('ALL');

  if (!isOpen) return null;

  const allLevels = Array.from({ length: 100 }, (_, i) => i + 1);

  const filteredLevels = allLevels.filter((lvl) => {
    if (filter === 'ALL') return true;
    return getLevelDifficulty(lvl) === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl p-5 sm:p-7 rounded-3xl glass-panel border border-cyan-500/40 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-mono font-semibold text-cyan-300 mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>100 QUANTUM SECTORS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white">
            Select Level (1 - 100)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {gameName} • Shuffled Easy, Medium, Hard & Super Hard Progression
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4">
          {[
            { id: 'ALL', label: 'All (100)' },
            { id: 'EASY', label: 'Easy' },
            { id: 'MEDIUM', label: 'Medium' },
            { id: 'HARD', label: 'Hard' },
            { id: 'SUPER HARD', label: 'Super Hard' }
          ].map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setFilter(tab.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 100 Levels Grid */}
        <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 p-1">
          {filteredLevels.map((lvl) => {
            const diff = getLevelDifficulty(lvl);
            const cfg = DIFFICULTY_CONFIG[diff];
            const isCurrent = lvl === currentLevel;

            return (
              <button
                key={lvl}
                onClick={() => {
                  sounds.playClick();
                  onSelectLevel(lvl);
                  onClose();
                }}
                className={`h-12 sm:h-14 rounded-2xl border flex flex-col items-center justify-center relative transition-all active:scale-95 group ${
                  isCurrent
                    ? 'bg-cyan-500/30 border-cyan-400 ring-2 ring-cyan-400 text-cyan-200 shadow-lg shadow-cyan-950/50'
                    : 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/30 text-white'
                }`}
              >
                {/* Difficulty color dot */}
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5 ${cfg.dot}`}
                  title={diff}
                />
                <span className="font-orbitron font-bold text-sm sm:text-base leading-none">
                  {lvl}
                </span>
                <span className="text-[8px] font-mono text-slate-400 uppercase mt-0.5 leading-none">
                  {diff === 'SUPER HARD' ? 'S.HARD' : diff}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 mt-3 border-t border-white/10 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Easy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Hard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Super Hard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
