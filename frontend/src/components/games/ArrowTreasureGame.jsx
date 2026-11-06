import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Lock, Unlock, Sparkles } from 'lucide-react';

export default function ArrowTreasureGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [sequence, setSequence] = useState([]);
  const [userSteps, setUserSteps] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isMemorizing, setIsMemorizing] = useState(true);
  const [flashIndex, setFlashIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [hintText, setHintText] = useState(null);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  // Initialize stage for level (1-100)
  const initStage = async (lvl) => {
    setIsUnlocked(false);
    setUserSteps([]);
    setHintText(null);
    setIsMemorizing(true);
    setFlashIndex(-1);

    let seq = [];
    let speed = 700;

    try {
      const res = await fetch(`/api/games/treasure-hunt/stage?level=${lvl}`);
      if (res.ok) {
        const data = await res.json();
        seq = data.sequence;
        speed = data.flashSpeed || 650;
      }
    } catch (e) {
      console.log('Using local fallback for arrow hunt');
    }

    if (!seq || seq.length === 0) {
      const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      const len = 4 + (lvl % 6);
      seq = Array.from({ length: len }, () => dirs[Math.floor(Math.random() * dirs.length)]);
    }

    setSequence(seq);

    // Sequence playback animation
    let i = 0;
    const playTimer = setInterval(() => {
      setFlashIndex(i);
      sounds.playClick();
      i++;
      if (i >= seq.length) {
        clearInterval(playTimer);
        setTimeout(() => {
          setFlashIndex(-1);
          setIsMemorizing(false);
        }, 500);
      }
    }, speed);
  };

  useEffect(() => {
    initStage(level);
  }, [level]);

  // Timer
  useEffect(() => {
    if (isUnlocked) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isUnlocked]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Keyboard arrow controls
  useEffect(() => {
    const handleKey = (e) => {
      if (isMemorizing || isUnlocked) return;
      if (e.key === 'ArrowUp') handleInput('UP');
      else if (e.key === 'ArrowDown') handleInput('DOWN');
      else if (e.key === 'ArrowLeft') handleInput('LEFT');
      else if (e.key === 'ArrowRight') handleInput('RIGHT');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMemorizing, isUnlocked, userSteps, sequence]);

  const handleInput = (dir) => {
    if (isMemorizing || isUnlocked) return;

    const nextIndex = userSteps.length;
    sounds.playClick();

    if (sequence[nextIndex] === dir) {
      const newSteps = [...userSteps, dir];
      setUserSteps(newSteps);

      if (newSteps.length === sequence.length) {
        setIsUnlocked(true);
        sounds.playVictory();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
        const points = 80 * streak + level * 5;
        setScore((s) => s + points);
        setStreak((st) => st + 1);
        onAddScore('arrow', points, streak, seconds);
      }
    } else {
      sounds.playError();
      setUserSteps([]);
      setStreak(1);
    }
  };

  const handleHint = () => {
    if (isMemorizing || isUnlocked) return;
    const nextIndex = userSteps.length;
    const nextDir = sequence[nextIndex];
    if (nextDir) {
      sounds.playClick();
      setHintText(`The next vector coordinate is: [ ${nextDir} ]`);
      setScore((s) => Math.max(0, s - 10));
      onAddScore('arrow', -10, streak, seconds);
    }
  };

  return (
    <GameWrapper
      title="Arrow Treasure Hunt"
      subtitle={`Level ${level} of 100 // Vector Navigation`}
      icon="🧭"
      score={score}
      streak={streak}
      time={formatTime(seconds)}
      level={level}
      onLevelChange={setLevel}
      onExit={onExit}
      onHint={handleHint}
      hintDisabled={isMemorizing || isUnlocked}
      hintText={hintText}
    >
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-emerald-500/30 max-w-xl mx-auto shadow-2xl relative text-center">
        {/* Stage Status with Difficulty */}
        <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-4 uppercase tracking-wider">
          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
            {diffCfg.label}
          </span>
          <span>{isMemorizing ? '📡 TRANSMITTING VECTOR DATA...' : 'ENTER VECTOR SEQUENCE'}</span>
        </div>

        {/* Chest Centerpiece */}
        <div className="py-5 flex flex-col items-center justify-center relative">
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 shadow-2xl ${
              isUnlocked
                ? 'bg-amber-500/20 border-amber-400 shadow-amber-500/50 scale-110'
                : 'bg-black/50 border-emerald-500/40 shadow-emerald-950/50'
            }`}
          >
            {isUnlocked ? (
              <div className="flex flex-col items-center animate-bounce">
                <span className="text-5xl">👑</span>
                <Unlock className="w-6 h-6 text-amber-400 mt-1" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-5xl">📦</span>
                <Lock className="w-5 h-5 text-emerald-400 mt-1" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono mt-3">
            {isUnlocked
              ? `LEVEL ${level} VAULT HARVESTED!`
              : `Sequence Step: ${userSteps.length} of ${sequence.length}`}
          </p>
        </div>

        {/* Sequence Indicator Dots */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6">
          {sequence.map((dir, idx) => {
            const isFlashing = flashIndex === idx;
            const isEntered = idx < userSteps.length;
            const isActive = idx === userSteps.length && !isMemorizing;

            return (
              <div
                key={idx}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm border transition-all duration-200 ${
                  isFlashing
                    ? 'bg-cyan-400 text-black border-white ring-4 ring-cyan-400/50 scale-110 shadow-lg'
                    : isEntered
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                    : isActive
                    ? 'border-emerald-400 bg-white/10 text-emerald-300 ring-2 ring-emerald-400/40 animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-500'
                }`}
              >
                {isMemorizing || isEntered ? (
                  dir === 'UP' ? '↑' : dir === 'DOWN' ? '↓' : dir === 'LEFT' ? '←' : '→'
                ) : (
                  '•'
                )}
              </div>
            );
          })}
        </div>

        {/* Directional D-Pad Controls */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <button
            onClick={() => handleInput('UP')}
            disabled={isMemorizing || isUnlocked}
            className="w-16 h-14 rounded-2xl bg-white/10 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
          >
            <ArrowUp className="w-6 h-6 text-cyan-400" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleInput('LEFT')}
              disabled={isMemorizing || isUnlocked}
              className="w-16 h-14 rounded-2xl bg-white/10 hover:bg-purple-500/20 border border-white/20 hover:border-purple-400 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
            >
              <ArrowLeft className="w-6 h-6 text-purple-400" />
            </button>
            <button
              onClick={() => handleInput('DOWN')}
              disabled={isMemorizing || isUnlocked}
              className="w-16 h-14 rounded-2xl bg-white/10 hover:bg-amber-500/20 border border-white/20 hover:border-amber-400 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
            >
              <ArrowDown className="w-6 h-6 text-amber-400" />
            </button>
            <button
              onClick={() => handleInput('RIGHT')}
              disabled={isMemorizing || isUnlocked}
              className="w-16 h-14 rounded-2xl bg-white/10 hover:bg-emerald-500/20 border border-white/20 hover:border-emerald-400 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
            >
              <ArrowRight className="w-6 h-6 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Victory Level Advance */}
        {isUnlocked && (
          <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/80 mt-4 animate-fade-in flex flex-col items-center">
            <div className="flex items-center gap-2 text-amber-300 font-orbitron font-bold text-base">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>LEVEL {level} HARVESTED! [{diffCfg.label}]</span>
            </div>
            <p className="text-xs text-amber-200 mt-1 mb-3">
              Sector {level} completed in {formatTime(seconds)}. +{80 * streak + level * 5} IQ Points!
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLevel((l) => (l < 100 ? l + 1 : 1))}
                className="btn-cosmic px-5 py-2.5 rounded-xl text-xs font-orbitron font-bold"
              >
                {level < 100 ? `ADVANCE TO LEVEL ${level + 1}` : 'RESTART LEVEL 1'}
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Return to Cube
              </button>
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
