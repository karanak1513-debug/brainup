import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { sounds } from '../utils/soundFX';

export const DIMENSIONS = [
  {
    id: 'cosmos-violet',
    name: 'Cosmos Violet',
    primary: '#8B5CF6',
    secondary: '#C084FC',
    accent: 'bg-purple-600',
    border: 'border-purple-500'
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    primary: '#00F0FF',
    secondary: '#FF007F',
    accent: 'bg-cyan-500',
    border: 'border-cyan-400'
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    primary: '#F59E0B',
    secondary: '#FF5722',
    accent: 'bg-amber-500',
    border: 'border-amber-500'
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Emerald',
    primary: '#10B981',
    secondary: '#34D399',
    accent: 'bg-emerald-500',
    border: 'border-emerald-500'
  },
  {
    id: 'quantum-prism',
    name: 'Quantum Prism',
    primary: '#EC4899',
    secondary: '#6366F1',
    accent: 'bg-pink-500',
    border: 'border-pink-500'
  }
];

export default function DimensionSwitcher({ currentDimension, onSelectDimension }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeDim = DIMENSIONS.find((d) => d.id === currentDimension) || DIMENSIONS[0];

  return (
    <div className="relative">
      {/* Dimension Button */}
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
        title="Shift Multiverse Dimension"
      >
        <span
          className="w-3 h-3 rounded-full shadow-md animate-pulse"
          style={{ backgroundColor: activeDim.primary }}
        />
        <span className="hidden sm:inline font-orbitron text-slate-200">
          {activeDim.name}
        </span>
        <Palette className="w-3.5 h-3.5 text-slate-300" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-52 p-2 rounded-2xl glass-panel border border-white/20 shadow-2xl z-50 animate-fade-in flex flex-col gap-1">
            <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
              Multiverse Dimensions
            </div>
            {DIMENSIONS.map((dim) => {
              const isSelected = dim.id === currentDimension;
              return (
                <button
                  key={dim.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectDimension(dim.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-white/20 text-white font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: dim.primary }}
                    />
                    <span className="font-space">{dim.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
