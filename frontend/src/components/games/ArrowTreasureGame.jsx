import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Lock, Unlock, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const [activePressedDir, setActivePressedDir] = useState(null);

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
    let speed = 650;

    try {
      const res = await fetch(`/api/games/treasure-hunt/stage?level=${lvl}`);
      if (res.ok) {
        const data = await res.json();
        seq = data.sequence;
        speed = data.flashSpeed || 600;
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
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') handleInput('UP');
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') handleInput('DOWN');
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleInput('LEFT');
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleInput('RIGHT');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMemorizing, isUnlocked, userSteps, sequence]);

  const handleInput = (dir) => {
    if (isMemorizing || isUnlocked) return;

    setActivePressedDir(dir);
    setTimeout(() => setActivePressedDir(null), 180);

    const nextIndex = userSteps.length;
    sounds.playClick();

    if (sequence[nextIndex] === dir) {
      const newSteps = [...userSteps, dir];
      setUserSteps(newSteps);

      if (newSteps.length === sequence.length) {
        setIsUnlocked(true);
        sounds.playVictory();
        confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
        const points = (50 + sequence.length * 10 + level * 5) * streak;
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
      title="Arrow Quest"
      subtitle={`Level ${level} of 100 // Vector Trajectory`}
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
      <div className="p-6 md:p-8 rounded-3xl glass-panel cyber-hud border border-emerald-500/40 max-w-xl mx-auto shadow-2xl relative text-center overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Stage Status with Difficulty */}
        <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-5 px-1 uppercase tracking-wider">
          <span className={`px-3 py-1 rounded-full border text-[11px] font-bold shadow-md ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
            {diffCfg.label}
          </span>
          <span className="font-bold flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isMemorizing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            {isMemorizing ? 'TRANSMITTING BEACON...' : 'INPUT VECTOR PATH'}
          </span>
        </div>

        {/* Chest Centerpiece with holographic lighting */}
        <div className="py-6 flex flex-col items-center justify-center relative">
          <div
            className={`w-30 h-30 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 shadow-2xl ${
              isUnlocked
                ? 'bg-amber-500/25 border-amber-400 shadow-amber-500/60 scale-110 ring-4 ring-amber-400/40 animate-pulse'
                : 'bg-black/60 border-emerald-500/40 shadow-emerald-950/60'
            }`}
          >
            {isUnlocked ? (
              <div className="flex flex-col items-center animate-bounce">
                <span className="text-5xl sm:text-6xl drop-shadow-lg">👑</span>
                <Unlock className="w-6 h-6 text-amber-400 mt-2" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-5xl sm:text-6xl drop-shadow-md">📦</span>
                <Lock className="w-5 h-5 text-emerald-400 mt-2" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-300 font-mono mt-3">
            {isUnlocked
              ? `LEVEL ${level} VAULT HARVESTED!`
              : `Vector Progress: ${userSteps.length} / ${sequence.length}`}
          </p>
        </div>

        {/* Sequence Indicator Dots */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {sequence.map((dir, idx) => {
            const isFlashing = flashIndex === idx;
            const isEntered = idx < userSteps.length;
            const isActive = idx === userSteps.length && !isMemorizing;

            return (
              <div
                key={idx}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-orbitron font-black text-sm sm:text-base border-2 transition-all duration-200 ${
                  isFlashing
                    ? 'bg-cyan-400 text-black border-white ring-4 ring-cyan-400/60 scale-120 shadow-xl shadow-cyan-400/60 animate-bounce'
                    : isEntered
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950/50'
                    : isActive
                    ? 'border-emerald-400 bg-white/10 text-emerald-300 ring-3 ring-emerald-400/40 animate-pulse'
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

        {/* Directional Pad Controls with tactile neon press */}
        <div className="flex flex-col items-center justify-center gap-2.5 mb-6">
          <button
            onClick={() => handleInput('UP')}
            disabled={isMemorizing || isUnlocked}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-150 active:scale-90 cursor-pointer ${
              activePressedDir === 'UP'
                ? 'bg-cyan-400 border-white text-black ring-4 ring-cyan-400/60 scale-105'
                : 'bg-white/10 hover:bg-emerald-500/25 border-white/20 hover:border-emerald-400 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg'
            }`}
          >
            <ArrowUp className="w-6 h-6 text-emerald-400" />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleInput('LEFT')}
              disabled={isMemorizing || isUnlocked}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-150 active:scale-90 cursor-pointer ${
                activePressedDir === 'LEFT'
                  ? 'bg-cyan-400 border-white text-black ring-4 ring-cyan-400/60 scale-105'
                  : 'bg-white/10 hover:bg-emerald-500/25 border-white/20 hover:border-emerald-400 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg'
              }`}
            >
              <ArrowLeft className="w-6 h-6 text-emerald-400" />
            </button>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-500 text-xs font-mono">
              PAD
            </div>
            <button
              onClick={() => handleInput('RIGHT')}
              disabled={isMemorizing || isUnlocked}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-150 active:scale-90 cursor-pointer ${
                activePressedDir === 'RIGHT'
                  ? 'bg-cyan-400 border-white text-black ring-4 ring-cyan-400/60 scale-105'
                  : 'bg-white/10 hover:bg-emerald-500/25 border-white/20 hover:border-emerald-400 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg'
              }`}
            >
              <ArrowRight className="w-6 h-6 text-emerald-400" />
            </button>
          </div>
          <button
            onClick={() => handleInput('DOWN')}
            disabled={isMemorizing || isUnlocked}
            className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-150 active:scale-90 cursor-pointer ${
              activePressedDir === 'DOWN'
                ? 'bg-cyan-400 border-white text-black ring-4 ring-cyan-400/60 scale-105'
                : 'bg-white/10 hover:bg-emerald-500/25 border-white/20 hover:border-emerald-400 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg'
            }`}
          >
            <ArrowDown className="w-6 h-6 text-emerald-400" />
          </button>
        </div>

        {/* Victory Level Clear Banner */}
        {isUnlocked && (
          <div className="p-6 rounded-3xl bg-emerald-950/90 border-2 border-emerald-400 mt-6 animate-pop-scale flex flex-col items-center shadow-2xl shadow-emerald-950/60">
            <div className="flex items-center gap-2 text-emerald-300 font-orbitron font-extrabold text-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>VAULT {level} DECRYPTED! [{diffCfg.label}]</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1.5 mb-5 font-space">
              Solved in {formatTime(seconds)}! +{50 + sequence.length * 10 + level * 5} Vector Points!
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLevel((l) => (l < 100 ? l + 1 : 1))}
                className="btn-cosmic flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-orbitron font-bold cursor-pointer"
              >
                <span>{level < 100 ? `ADVANCE TO LEVEL ${level + 1}` : 'RESTART LEVEL 1'}</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={onExit}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-all"
              >
                Return to Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
