import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Zap, Star, Target } from 'lucide-react';
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

  const stats = userProfile?.gameStats || {
    sudoku: { played: 5, won: 4, score: 240 },
    riddles: { played: 8, won: 7, score: 210 },
    logic: { played: 6, won: 5, score: 180 },
    math: { played: 4, won: 4, score: 120 },
    arrow: { played: 3, won: 3, score: 90 },
    memory: { played: 2, won: 2, score: 60 }
  };

  const GAME_INFO = [
    { key: 'sudoku', name: 'Sudoku Blitz', icon: '🧩', color: 'text-cyan-400' },
    { key: 'riddles', name: 'Cosmic Riddles', icon: '🔮', color: 'text-pink-400' },
    { key: 'logic', name: 'Logic & Reasoning', icon: '⚡', color: 'text-purple-400' },
    { key: 'math', name: 'Rapid Math Sprint', icon: '🚀', color: 'text-amber-400' },
    { key: 'arrow', name: 'Arrow Treasure Hunt', icon: '🧭', color: 'text-emerald-400' },
    { key: 'memory', name: 'Quantum Memory Grid', icon: '🌌', color: 'text-blue-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl glass-panel border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
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
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono font-semibold text-amber-300 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>MULTIVERSE INTELLIGENCE MATRIX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white">
            Scoreboard & Leaderboard
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('leaderboard');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-orbitron font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Global Leaderboard
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('breakdown');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-orbitron font-bold transition-all ${
              activeTab === 'breakdown'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            My IQ Performance
          </button>
        </div>

        {/* Tab 1: Global Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {leaderboard.length === 0 ? (
              <p className="text-center text-slate-400 py-6 font-mono text-xs">
                Scanning quantum dimensions...
              </p>
            ) : (
              leaderboard.map((item, idx) => {
                const isMe = item.name === userProfile?.name;
                const medalColors = ['text-amber-400', 'text-slate-300', 'text-amber-600'];

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all ${
                      isMe
                        ? 'bg-purple-950/60 border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Number / Medal */}
                      <div className="w-7 h-7 flex items-center justify-center font-orbitron font-bold text-sm">
                        {idx < 3 ? (
                          <Medal className={`w-5 h-5 ${medalColors[idx]}`} />
                        ) : (
                          <span className="text-slate-400 font-mono">#{idx + 1}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl bg-black/40 border border-white/15"
                      />

                      {/* Name & Title */}
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-space font-bold text-sm text-white">
                            {item.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-400/40">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono block">
                          {item.title} • {item.dimension}
                        </span>
                      </div>
                    </div>

                    {/* Score & Streak */}
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-orbitron font-bold text-amber-400 block">
                        {item.score} IQ
                      </span>
                      <span className="text-[11px] font-mono text-purple-300">
                        {item.streak}x Best Streak
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: My IQ Performance Breakdown */}
        {activeTab === 'breakdown' && (
          <div className="overflow-y-auto space-y-3 flex-1 pr-1">
            {/* Aggregate Overview Card */}
            <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-black/40 border border-white/10 text-center mb-2">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">TOTAL IQ SCORE</span>
                <span className="text-xl sm:text-2xl font-orbitron font-extrabold text-amber-400">
                  {userProfile?.totalScore || 850}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">CURRENT RANK</span>
                <span className="text-sm sm:text-base font-orbitron font-bold text-cyan-400 truncate block">
                  {userProfile?.rank || 'Level 1 Explorer'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">MAX STREAK</span>
                <span className="text-xl sm:text-2xl font-orbitron font-extrabold text-purple-400">
                  {userProfile?.highestStreak || 9}x
                </span>
              </div>
            </div>

            {/* Per-Game Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GAME_INFO.map((g) => {
                const gameStat = stats[g.key] || { played: 0, won: 0, score: 0 };
                const winRate =
                  gameStat.played > 0
                    ? Math.round((gameStat.won / gameStat.played) * 100)
                    : 0;

                return (
                  <div
                    key={g.key}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{g.icon}</span>
                      <div className="text-left">
                        <span className="font-space font-bold text-xs text-white block">
                          {g.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {gameStat.won}/{gameStat.played} Won ({winRate}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-orbitron font-bold text-sm text-cyan-300">
                        {gameStat.score} PTS
                      </span>
                    </div>
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
