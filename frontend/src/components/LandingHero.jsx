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
  Atom
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
      glow: 'hover:border-cyan-400/80 hover:shadow-cyan-500/25',
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
      glow: 'hover:border-pink-400/80 hover:shadow-pink-500/25',
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
      glow: 'hover:border-purple-400/80 hover:shadow-purple-500/25',
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
      glow: 'hover:border-amber-400/80 hover:shadow-amber-500/25',
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
      glow: 'hover:border-emerald-400/80 hover:shadow-emerald-500/25',
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
      glow: 'hover:border-blue-400/80 hover:shadow-blue-500/25',
      desc: 'Entangled celestial artifact recall and pairing'
    },
    {
      id: 'stroop',
      category: 'SPEED',
      pip: 'A7',
      name: 'Chromatic Reflex',
      icon: '👁️',
      tag: 'Stroop Inhibition',
      color: '#00F0FF',
      glow: 'hover:border-cyan-400/80 hover:shadow-cyan-500/25',
      desc: 'High-speed cognitive inhibitory control & reflex matching'
    },
    {
      id: 'word',
      category: 'MEMORY',
      pip: 'A8',
      name: 'Cosmic Word Weaver',
      icon: '🔤',
      tag: 'Quantum Anagrams',
      color: '#C084FC',
      glow: 'hover:border-purple-400/80 hover:shadow-purple-500/25',
      desc: 'Synthesize scrambled astrophysical and scientific vocabulary'
    },
    {
      id: 'spatial',
      category: 'SPATIAL',
      pip: 'A9',
      name: 'Spatial Matrix',
      icon: '🧭',
      tag: '3D Mental Rotation',
      color: '#10B981',
      glow: 'hover:border-emerald-400/80 hover:shadow-emerald-500/25',
      desc: 'Mentally rotate quantum glyphs and identify true orientations'
    },
    {
      id: 'reactor',
      category: 'LOGIC',
      pip: 'A10',
      name: 'Quantum Reactor',
      icon: '⚛️',
      tag: '2048 Fusion',
      color: '#F43F5E',
      glow: 'hover:border-rose-400/80 hover:shadow-rose-500/25',
      desc: 'Slide & synthesize atomic isotopes into the ultimate Singularity'
    }
  ];

  const filteredArenas = activeCategory === 'ALL'
    ? ARENAS
    : ARENAS.filter((a) => a.category === activeCategory);

  return (
    <div className="relative min-h-[calc(100vh-110px)] flex flex-col items-center justify-center text-center px-4 py-8 z-10 w-full max-w-6xl mx-auto">
      {/* Ambient Cosmic Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/15 via-purple-600/20 to-pink-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Floating Hologram Pill */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel border border-cyan-400/30 text-xs sm:text-sm font-mono text-cyan-300 mb-6 shadow-xl shadow-cyan-950/40 animate-float">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="tracking-widest uppercase font-bold">THE MULTIVERSE OF INTELLIGENCE</span>
        <span className="hidden sm:inline text-purple-400 font-bold">• 10 MIND ARENAS • 1,000 LEVELS</span>
      </div>

      {/* Main Epic Hero Heading */}
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-orbitron tracking-tight text-white leading-none mb-4 drop-shadow-2xl">
          WELCOME TO THE{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            WORLD OF INTELLIGENCE
          </span>
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-slate-300 font-space font-medium max-w-3xl mx-auto leading-relaxed mt-4">
          Embark on a hyper-dimensional odyssey. Rotate the interactive{' '}
          <span className="text-cyan-300 font-semibold">3D Quantum Dice</span> or explore the{' '}
          <span className="text-purple-300 font-semibold">Multiverse Arcade</span> to challenge 10 brain-expanding cognitive arenas across 1,000 levels.
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="mt-2 mb-10">
        <button
          onClick={() => {
            sounds.playWarp();
            onBegin();
          }}
          className="btn-cosmic group relative px-10 py-5 sm:px-14 sm:py-6 rounded-3xl font-orbitron font-black text-lg sm:text-2xl tracking-widest text-white shadow-2xl shadow-purple-500/30 flex items-center gap-4 mx-auto cursor-pointer border border-cyan-400/60"
        >
          <Dices className="w-6 h-6 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
          <span>BEGIN TO ACHIEVE</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-2.5 transition-transform duration-300 text-purple-300" />
        </button>
      </div>

      {/* Multiverse Metric Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-10 text-xs sm:text-sm font-mono text-slate-300">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <Dices className="w-3.5 h-3.5 text-cyan-400" />
          <span>3D Quantum Dice</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
          <span>10 Mind Arenas</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-pink-400" />
          <span>1,000 Shuffled Levels</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Global IQ Leaderboard</span>
        </div>
      </div>

      {/* Category Tabs for Arenas */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-between mb-3 max-w-5xl mx-auto px-2">
          <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            EXPLORE 10 COGNITIVE ARENAS • TAP ANY TO LAUNCH
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All (10)' },
              { id: 'LOGIC', label: 'Logic' },
              { id: 'SPEED', label: 'Speed & Reflex' },
              { id: 'SPATIAL', label: 'Spatial' },
              { id: 'MEMORY', label: 'Memory & Words' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveCategory(tab.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Arenas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-5xl mx-auto w-full">
          {filteredArenas.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                sounds.playClick();
                onBegin(item.id);
              }}
              className={`p-4 rounded-2xl glass-card text-left border transition-all duration-300 hover:-translate-y-1.5 cursor-pointer relative overflow-hidden group shadow-lg ${item.glow}`}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none transition-opacity group-hover:opacity-30"
                style={{ backgroundColor: item.color }}
              />

              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border"
                  style={{
                    color: item.color,
                    borderColor: `${item.color}55`,
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

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>100 LEVELS</span>
                <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Launch <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
