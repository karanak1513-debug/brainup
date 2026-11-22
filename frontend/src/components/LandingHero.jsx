import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  Dices,
  Trophy,
  Brain,
  Cpu,
  Compass,
  CheckCircle2,
  Gamepad2,
  Atom,
  Flame,
  MousePointerClick
} from 'lucide-react';
import { sounds } from '../utils/soundFX';

export default function LandingHero({ onBegin }) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const ARENAS = [
    {
      id: 'sudoku',
      category: 'LOGIC',
      pip: 'D1 (1)',
      name: 'Sudoku Blitz',
      icon: '🧩',
      tag: 'Matrix Logic',
      color: '#00F0FF',
      glow: 'hover:border-cyan-400 hover:shadow-cyan-500/40',
      desc: 'Conflict-free 4x4 quantum matrix calculations'
    },
    {
      id: 'riddles',
      category: 'LOGIC',
      pip: 'D2 (2)',
      name: 'Cosmic Riddles',
      icon: '🔮',
      tag: 'Lateral Paradox',
      color: '#EC4899',
      glow: 'hover:border-pink-400 hover:shadow-pink-500/40',
      desc: 'Spacetime paradoxes & astrophysics deduction'
    },
    {
      id: 'logic',
      category: 'LOGIC',
      pip: 'D3 (3)',
      name: 'Logic Matrix',
      icon: '⚡',
      tag: 'Cognitive Deduction',
      color: '#8B5CF6',
      glow: 'hover:border-purple-400 hover:shadow-purple-500/40',
      desc: 'Quantum sequences & geometric algorithmic shifts'
    },
    {
      id: 'math',
      category: 'SPEED',
      pip: 'D4 (4)',
      name: 'Rapid Math',
      icon: '🚀',
      tag: '60s Speed Sprint',
      color: '#F59E0B',
      glow: 'hover:border-amber-400 hover:shadow-amber-500/40',
      desc: 'Rapid mental arithmetic against the cosmic clock'
    },
    {
      id: 'arrow',
      category: 'SPATIAL',
      pip: 'D5 (5)',
      name: 'Arrow Quest',
      icon: '🧭',
      tag: 'Spatial Vectors',
      color: '#10B981',
      glow: 'hover:border-emerald-400 hover:shadow-emerald-500/40',
      desc: 'Memorize trajectory chains & unlock quantum vaults'
    },
    {
      id: 'memory',
      category: 'MEMORY',
      pip: 'D6 (6)',
      name: 'Memory Grid',
      icon: '🌌',
      tag: 'Entanglement Recall',
      color: '#3B82F6',
      glow: 'hover:border-blue-400 hover:shadow-blue-500/40',
      desc: 'Entangled celestial artifact recall and pairing'
    },
    {
      id: 'stroop',
      category: 'SPEED',
      pip: 'A7 (7)',
      name: 'Chromatic Reflex',
      icon: '👁️',
      tag: 'Stroop Inhibition',
      color: '#00F0FF',
      glow: 'hover:border-cyan-400 hover:shadow-cyan-500/40',
      desc: 'High-speed cognitive inhibitory control & reflex matching'
    },
    {
      id: 'word',
      category: 'MEMORY',
      pip: 'A8 (8)',
      name: 'Cosmic Word Weaver',
      icon: '🔤',
      tag: 'Quantum Anagrams',
      color: '#C084FC',
      glow: 'hover:border-purple-400 hover:shadow-purple-500/40',
      desc: 'Synthesize scrambled astrophysical and scientific vocabulary'
    },
    {
      id: 'spatial',
      category: 'SPATIAL',
      pip: 'A9 (9)',
      name: 'Spatial Matrix',
      icon: '🧭',
      tag: '3D Mental Rotation',
      color: '#10B981',
      glow: 'hover:border-emerald-400 hover:shadow-emerald-500/40',
      desc: 'Mentally rotate quantum glyphs and identify true orientations'
    },
    {
      id: 'reactor',
      category: 'LOGIC',
      pip: 'A10 (10)',
      name: 'Quantum Reactor',
      icon: '⚛️',
      tag: '2048 Fusion',
      color: '#F43F5E',
      glow: 'hover:border-rose-400 hover:shadow-rose-500/40',
      desc: 'Slide & synthesize atomic isotopes into the ultimate Singularity'
    }
  ];

  const filteredArenas = activeCategory === 'ALL'
    ? ARENAS
    : ARENAS.filter((a) => a.category === activeCategory);

  return (
    <div className="relative min-h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center px-4 py-8 z-10 w-full max-w-6xl mx-auto animate-fade-in">
      {/* Ambient Cosmic Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-500/20 via-purple-600/25 to-pink-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Floating Hologram Pill */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel border border-cyan-400/40 text-xs sm:text-sm font-mono text-cyan-300 mb-6 shadow-xl shadow-cyan-950/40 animate-float">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="tracking-widest uppercase font-bold">THE MULTIVERSE OF INTELLIGENCE</span>
        <span className="hidden sm:inline text-purple-400 font-bold">• 10 MIND ARENAS • 1,000 LEVELS</span>
      </div>

      {/* Main Epic Hero Heading */}
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-orbitron tracking-tight text-white leading-none mb-4 drop-shadow-2xl">
          WELCOME TO THE{' '}
          <span className="text-shimmer bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            WORLD OF INTELLIGENCE
          </span>
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-slate-300 font-space font-medium max-w-3xl mx-auto leading-relaxed mt-4">
          Embark on a hyper-dimensional odyssey. Rotate the interactive{' '}
          <span className="text-cyan-300 font-semibold drop-shadow">3D Quantum Dice</span> or explore the{' '}
          <span className="text-purple-300 font-semibold drop-shadow">Multiverse Arcade</span> to conquer 10 brain-expanding cognitive arenas across 1,000 levels.
        </p>
      </div>

      {/* Primary Action Button (Mega CTA with energy ring) */}
      <div className="mt-2 mb-10 relative group">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-70 blur-lg group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
        <button
          onClick={() => {
            sounds.playWarp();
            onBegin();
          }}
          className="btn-cosmic relative px-10 py-5 sm:px-14 sm:py-6 rounded-3xl font-orbitron font-black text-lg sm:text-2xl tracking-widest text-white shadow-2xl flex items-center gap-4 mx-auto cursor-pointer border-2 border-cyan-400/80 bg-black/80"
        >
          <Dices className="w-7 h-7 text-cyan-400 group-hover:rotate-180 transition-transform duration-700" />
          <span>BEGIN TO ACHIEVE</span>
          <ArrowRight className="w-7 h-7 group-hover:translate-x-3 transition-transform duration-300 text-purple-300" />
        </button>
      </div>

      {/* Multiverse Metric Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-10 text-xs sm:text-sm font-mono text-slate-300">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md shadow-lg">
          <Dices className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>3D Quantum Dice</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md shadow-lg">
          <Gamepad2 className="w-4 h-4 text-purple-400" />
          <span>10 Mind Arenas</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md shadow-lg">
          <Layers className="w-4 h-4 text-pink-400" />
          <span>1,000 Shuffled Levels</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md shadow-lg">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Global IQ Leaderboard</span>
        </div>
      </div>

      {/* Category Tabs for Arenas */}
      <div className="w-full mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 max-w-5xl mx-auto px-2">
          <span className="text-xs font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            10 COGNITIVE ARENAS • TAP ANY TO LAUNCH
          </span>

          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md shadow-lg">
            {[
              { id: 'ALL', label: 'All (10)' },
              { id: 'LOGIC', label: 'Logic' },
              { id: 'SPEED', label: 'Speed' },
              { id: 'SPATIAL', label: 'Spatial' },
              { id: 'MEMORY', label: 'Memory' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveCategory(tab.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Arenas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto w-full">
          {filteredArenas.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                sounds.playClick();
                onBegin(item.id);
              }}
              className={`p-5 rounded-3xl glass-card text-left border transition-all duration-300 hover:-translate-y-2 cursor-pointer relative overflow-hidden group shadow-xl ${item.glow}`}
            >
              <div
                className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: item.color }}
              />

              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl p-2.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-115 transition-transform duration-300 shadow-inner">
                  {item.icon}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm"
                  style={{
                    color: item.color,
                    borderColor: `${item.color}66`,
                    backgroundColor: `${item.color}15`
                  }}
                >
                  {item.pip} • {item.tag}
                </span>
              </div>

              <h4 className="font-orbitron font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors">
                {item.name}
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-space line-clamp-1">
                {item.desc}
              </p>

              <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>100 LEVELS</span>
                <span className="text-cyan-400 font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                  Launch <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
