import React from 'react';
import { ArrowRight, Sparkles, Brain, Cpu, Compass, Layers } from 'lucide-react';
import { sounds } from '../utils/soundFX';

export default function LandingHero({ onBegin }) {
  return (
    <div className="relative min-h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center px-4 py-8 z-10">
      {/* Floating Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-white/20 text-xs sm:text-sm font-mono text-cyan-300 mb-6 shadow-xl animate-float">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span className="tracking-widest uppercase">THE COGNITIVE MULTIVERSE AWAITS</span>
      </div>

      {/* Main Center Glowing Hero Text */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-orbitron tracking-tight text-white leading-none mb-4 animate-pulse-glow glow-primary">
          WELCOME TO THE WORLD OF INTELLIGENCE
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-slate-300 font-space font-medium max-w-2xl mx-auto leading-relaxed">
          Embark on a hyper-dimensional odyssey. Rotate the 3D Quantum Dice to unlock 6 brain-expanding mini-games across infinite cosmos.
        </p>
      </div>

      {/* Primary CTA: [ BEGIN TO ACHIEVE ] */}
      <div className="mt-4 mb-12">
        <button
          onClick={() => {
            sounds.playWarp();
            onBegin();
          }}
          className="btn-cosmic group relative px-10 py-5 sm:px-12 sm:py-6 rounded-3xl font-orbitron font-black text-lg sm:text-xl tracking-widest text-white shadow-2xl flex items-center gap-3.5 mx-auto"
        >
          <span>BEGIN TO ACHIEVE</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300 text-cyan-400" />
        </button>
      </div>

      {/* 6 Dimension Badges Showcase */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto w-full">
        {[
          { name: 'Sudoku Blitz', icon: '🧩', tag: 'Matrix Logic' },
          { name: 'Cosmic Riddles', icon: '🔮', tag: 'Lateral Paradox' },
          { name: 'Logic Matrix', icon: '⚡', tag: 'Deduction' },
          { name: 'Math Sprint', icon: '🚀', tag: 'Speed 60s' },
          { name: 'Arrow Quest', icon: '🧭', tag: 'Vector Recall' },
          { name: 'Memory Grid', icon: '🌌', tag: 'Entanglement' }
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl glass-card text-center border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="text-2xl mb-1 block">{item.icon}</span>
            <span className="font-space font-bold text-xs text-white block truncate">
              {item.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
