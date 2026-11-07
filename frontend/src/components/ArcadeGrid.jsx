import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Zap,
  ArrowRight,
  Dices,
  Trophy,
  Flame,
  Brain,
  Layers,
  Clock
} from 'lucide-react';
import { sounds } from '../utils/soundFX';

export const ALL_GAMES = [
  {
    id: 'sudoku',
    name: 'Sudoku Blitz',
    icon: '🧩',
    tag: 'Matrix Logic',
    category: 'LOGIC',
    color: '#00F0FF',
    glow: 'hover:border-cyan-400 hover:shadow-cyan-500/30',
    desc: 'Conflict-free 4x4 quantum matrix deduction. Quadrant & axis calibration.',
    levels: 100
  },
  {
    id: 'riddles',
    name: 'Cosmic Riddles',
    icon: '🔮',
    tag: 'Lateral Paradox',
    category: 'LOGIC',
    color: '#EC4899',
    glow: 'hover:border-pink-400 hover:shadow-pink-500/30',
    desc: 'Spacetime paradoxes, general relativity, quantum phenomena, astrophysics.',
    levels: 100
  },
  {
    id: 'logic',
    name: 'Logic Matrix',
    icon: '⚡',
    tag: 'Cognitive Deduction',
    category: 'LOGIC',
    color: '#8B5CF6',
    glow: 'hover:border-purple-400 hover:shadow-purple-500/30',
    desc: 'Detect missing sequence values across exponential and quantum progressions.',
    levels: 100
  },
  {
    id: 'math',
    name: 'Rapid Math Sprint',
    icon: '🚀',
    tag: '60s Arithmetic',
    category: 'SPEED',
    color: '#F59E0B',
    glow: 'hover:border-amber-400 hover:shadow-amber-500/30',
    desc: '60-second high-speed arithmetic sprint with combo multipliers.',
    levels: 100
  },
  {
    id: 'arrow',
    name: 'Arrow Quest',
    icon: '🧭',
    tag: 'Spatial Vectors',
    category: 'SPATIAL',
    color: '#10B981',
    glow: 'hover:border-emerald-400 hover:shadow-emerald-500/30',
    desc: 'Memorize rapid multi-directional trajectory chains and unlock quantum vaults.',
    levels: 100
  },
  {
    id: 'memory',
    name: 'Quantum Memory Grid',
    icon: '🌌',
    tag: 'Entanglement Recall',
    category: 'MEMORY',
    color: '#3B82F6',
    glow: 'hover:border-blue-400 hover:shadow-blue-500/30',
    desc: 'Recall and align entangled cosmic particle cards before thermal decay.',
    levels: 100
  },
  {
    id: 'stroop',
    name: 'Chromatic Reflex',
    icon: '👁️',
    tag: 'Stroop Inhibition',
    category: 'SPEED',
    color: '#00F0FF',
    glow: 'hover:border-cyan-400 hover:shadow-cyan-500/30',
    desc: 'Master cognitive interference: choose ink colors vs word spellings under time pressure.',
    levels: 100
  },
  {
    id: 'word',
    name: 'Cosmic Word Weaver',
    icon: '🔤',
    tag: 'Quantum Anagrams',
    category: 'MEMORY',
    color: '#C084FC',
    glow: 'hover:border-purple-400 hover:shadow-purple-500/30',
    desc: 'Unscramble deep astrophysical and cosmological vocabulary into quantum slots.',
    levels: 100
  },
  {
    id: 'spatial',
    name: 'Spatial Matrix',
    icon: '🧭',
    tag: '3D Mental Rotation',
    category: 'SPATIAL',
    color: '#10B981',
    glow: 'hover:border-emerald-400 hover:shadow-emerald-500/30',
    desc: 'Rotate complex 3D quantum glyphs in your mind and distinguish true rotations from mirror decoys.',
    levels: 100
  },
  {
    id: 'reactor',
    name: 'Quantum Reactor',
    icon: '⚛️',
    tag: '2048 Fusion',
    category: 'LOGIC',
    color: '#F43F5E',
    glow: 'hover:border-rose-400 hover:shadow-rose-500/30',
    desc: 'Slide & synthesize atomic isotopes into Hydrogen, Helium, Iron, Uranium, and the Singularity.',
    levels: 100
  }
];

export default function ArcadeGrid({ onSelectGame, userProfile }) {
  const [filter, setFilter] = useState('ALL');

  const filteredGames = filter === 'ALL'
    ? ALL_GAMES
    : ALL_GAMES.filter((g) => g.category === filter);

  const stats = userProfile?.gameStats || {};

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 animate-fade-in">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {[
          { id: 'ALL', label: 'All 10 Arenas' },
          { id: 'LOGIC', label: 'Logic & Deductive' },
          { id: 'SPEED', label: 'Speed & Reflex' },
          { id: 'SPATIAL', label: 'Spatial & Orientation' },
          { id: 'MEMORY', label: 'Memory & Words' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playClick();
              setFilter(tab.id);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filter === tab.id
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Games */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => {
          const gameStat = stats[game.id] || { played: 0, won: 0, score: 0 };
          return (
            <div
              key={game.id}
              onClick={() => {
                sounds.playClick();
                onSelectGame(game.id);
              }}
              className={`p-5 rounded-3xl glass-card text-left border transition-all duration-300 hover:-translate-y-1.5 cursor-pointer relative overflow-hidden group shadow-xl ${game.glow}`}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none transition-opacity group-hover:opacity-30"
                style={{ backgroundColor: game.color }}
              />

              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl p-2.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  {game.icon}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border"
                    style={{
                      color: game.color,
                      borderColor: `${game.color}55`,
                      backgroundColor: `${game.color}15`
                    }}
                  >
                    {game.tag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {game.levels} LEVELS
                  </span>
                </div>
              </div>

              <h3 className="font-orbitron font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors">
                {game.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-space line-clamp-2 leading-relaxed">
                {game.desc}
              </p>

              {/* Player Stats preview for this game */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Played: <strong className="text-slate-200">{gameStat.played}</strong></span>
                  <span>•</span>
                  <span>Score: <strong className="text-amber-400">{gameStat.score}</strong></span>
                </div>
                <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Play <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
