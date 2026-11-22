import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Zap, Star, Target, Crown, Sparkles, Flame } from 'lucide-react';
import Avatar from './Avatar';
import { sounds } from '../utils/soundFX';

export default function ScoreboardModal({ isOpen, onClose, userProfile }) {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/leaderboard')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (data && data.length) setLeaderboard(data);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const stats = userProfile?.gameStats || {};

  const ALL_GAME_INFO = [
    { key: 'sudoku', name: 'Sudoku Blitz', icon: '🧩', color: 'text-cyan-400' },
    { key: 'riddles', name: 'Cosmic Riddles', icon: '🔮', color: 'text-pink-400' },
    { key: 'logic', name: 'Logic Matrix', icon: '⚡', color: 'text-purple-400' },
    { key: 'math', name: 'Rapid Math Sprint', icon: '🚀', color: 'text-amber-400' },
    { key: 'arrow', name: 'Arrow Quest', icon: '🧭', color: 'text-emerald-400' },
    { key: 'memory', name: 'Quantum Memory Grid', icon: '🌌', color: 'text-blue-400' },
    { key: 'stroop', name: 'Chromatic Reflex', icon: '👁️', color: 'text-cyan-400' },
    { key: 'word', name: 'Cosmic Word Weaver', icon: '🔤', color: 'text-purple-300' },
    { key: 'spatial', name: 'Spatial Matrix', icon: '🧭', color: 'text-emerald-400' },
    { key: 'reactor', name: 'Quantum Reactor', icon: '⚛️', color: 'text-rose-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl p-5 sm:p-8 rounded-3xl glass-panel cyber-hud border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono font-semibold text-amber-300 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>MULTIVERSE INTELLIGENCE MATRIX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-orbitron text-white">
            Scoreboard & Leaderboard
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6 p-1 rounded-2xl bg-black/50 border border-white/10 w-fit mx-auto">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('leaderboard');
            }}
            className={`px-5 py-2 rounded-xl text-xs font-orbitron font-bold transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-102'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Global Leaderboard
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('breakdown');
            }}
            className={`px-5 py-2 rounded-xl text-xs font-orbitron font-bold transition-all cursor-pointer ${
              activeTab === 'breakdown'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-102'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            My IQ Performance
          </button>
        </div>

        {/* Tab 1: Global Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {leaderboard.map((item, index) => {
              const isTop3 = index < 3;
              const medalColor =
                index === 0
                  ? 'text-amber-400 border-amber-400/60 bg-amber-500/20'
                  : index === 1
                  ? 'text-slate-200 border-slate-300/60 bg-slate-400/20'
                  : index === 2
                  ? 'text-amber-600 border-amber-600/60 bg-amber-700/20'
                  : 'text-slate-400 border-white/10 bg-white/5';

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isTop3
                      ? 'bg-white/10 border-white/20 shadow-lg'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-orbitron font-black text-xs border ${medalColor}`}
                    >
                      {index + 1}
                    </span>
                    <Avatar src={item.avatar} name={item.name} size="sm" />
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {index === 0 && <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.title || 'Galactic Polymath'} • {item.dimension || 'Deep Cosmos'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.streak && (
                      <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        <Flame className="w-3 h-3 fill-current text-amber-400" />
                        <span>{item.streak}x</span>
                      </div>
                    )}
                    <span className="font-orbitron font-black text-sm sm:text-base text-cyan-400">
                      {item.score?.toLocaleString()} PTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: My IQ Performance Breakdown */}
        {activeTab === 'breakdown' && (
          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">TOTAL IQ POINTS</span>
                <span className="text-2xl font-orbitron font-black text-cyan-400">
                  {userProfile?.totalScore || 0}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">HIGHEST STREAK</span>
                <span className="text-2xl font-orbitron font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 fill-current" />
                  {userProfile?.highestStreak || 1}x
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_GAME_INFO.map((g) => {
                const s = stats[g.key] || { played: 0, won: 0, score: 0 };
                return (
                  <div
                    key={g.key}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{g.icon}</span>
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block">{g.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Played: {s.played} • Won: {s.won}
                        </span>
                      </div>
                    </div>
                    <span className="font-orbitron font-bold text-sm text-cyan-400">
                      {s.score} PTS
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
