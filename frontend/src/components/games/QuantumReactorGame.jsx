import React, { useState, useEffect, useCallback } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import {
  Atom,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2
} from 'lucide-react';

const ISOTOPES = {
  2: { label: 'H¹', name: 'Hydrogen', bg: 'bg-cyan-500/20', border: 'border-cyan-400', text: 'text-cyan-300' },
  4: { label: 'He²', name: 'Helium', bg: 'bg-sky-500/25', border: 'border-sky-400', text: 'text-sky-300' },
  8: { label: 'Li³', name: 'Lithium', bg: 'bg-blue-500/30', border: 'border-blue-400', text: 'text-blue-300' },
  16: { label: 'C⁶', name: 'Carbon', bg: 'bg-indigo-500/30', border: 'border-indigo-400', text: 'text-indigo-300' },
  32: { label: 'O⁸', name: 'Oxygen', bg: 'bg-purple-500/35', border: 'border-purple-400', text: 'text-purple-300' },
  64: { label: 'Ne¹⁰', name: 'Neon', bg: 'bg-fuchsia-500/40', border: 'border-fuchsia-400', text: 'text-fuchsia-300' },
  128: { label: 'Si¹⁴', name: 'Silicon', bg: 'bg-pink-500/45', border: 'border-pink-400', text: 'text-pink-300' },
  256: { label: 'Fe²⁶', name: 'Iron', bg: 'bg-rose-500/50', border: 'border-rose-400', text: 'text-rose-300' },
  512: { label: 'Au⁷⁹', name: 'Gold', bg: 'bg-amber-500/50', border: 'border-amber-400', text: 'text-amber-300' },
  1024: { label: 'U⁹²', name: 'Uranium', bg: 'bg-emerald-500/60', border: 'border-emerald-400', text: 'text-emerald-300' },
  2048: { label: 'Ω', name: 'Singularity', bg: 'bg-gradient-to-r from-cyan-500 to-purple-500', border: 'border-white', text: 'text-white' }
};

export default function QuantumReactorGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [board, setBoard] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [score, setScore] = useState(0);
  const [highestTile, setHighestTile] = useState(2);
  const [streak, setStreak] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hintText, setHintText] = useState(null);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  // Target milestone to clear this level
  const targetTile =
    level <= 5 ? 64 : level <= 15 ? 128 : level <= 30 ? 256 : level <= 60 ? 512 : level <= 90 ? 1024 : 2048;

  // Add random tile (2 or 4) to empty spot
  const addRandomTile = (grid) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return grid;

    const [randR, randC] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() > 0.85 ? 4 : 2;
    const newGrid = grid.map((row) => [...row]);
    newGrid[randR][randC] = val;
    return newGrid;
  };

  // Initialize board
  const initBoard = () => {
    let fresh = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    fresh = addRandomTile(fresh);
    fresh = addRandomTile(fresh);
    setBoard(fresh);
    setScore(0);
    setHighestTile(2);
    setStreak(1);
    setSeconds(0);
    setIsLevelCleared(false);
    setIsGameOver(false);
    setHintText(null);
  };

  useEffect(() => {
    initBoard();
  }, [level]);

  // Timer
  useEffect(() => {
    if (isLevelCleared || isGameOver) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isLevelCleared, isGameOver]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Slide & Merge a single row
  const slideRow = (row) => {
    let filtered = row.filter((val) => val !== 0);
    let ptsEarned = 0;
    let mergedRow = [];
    let i = 0;
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        mergedRow.push(mergedVal);
        ptsEarned += mergedVal;
        i += 2;
      } else {
        mergedRow.push(filtered[i]);
        i++;
      }
    }
    while (mergedRow.length < 4) {
      mergedRow.push(0);
    }
    return { row: mergedRow, points: ptsEarned };
  };

  const moveLeft = (grid) => {
    let totalPts = 0;
    let changed = false;
    const newGrid = grid.map((row) => {
      const { row: newRow, points } = slideRow(row);
      totalPts += points;
      if (newRow.some((val, idx) => val !== row[idx])) changed = true;
      return newRow;
    });
    return { newGrid, changed, points: totalPts };
  };

  const rotateClockwise = (grid) => {
    const res = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        res[c][3 - r] = grid[r][c];
      }
    }
    return res;
  };

  const handleMove = useCallback(
    (direction) => {
      if (isLevelCleared || isGameOver) return;

      let current = board;
      let rotCount = 0;

      if (direction === 'LEFT') rotCount = 0;
      else if (direction === 'DOWN') rotCount = 1;
      else if (direction === 'RIGHT') rotCount = 2;
      else if (direction === 'UP') rotCount = 3;

      for (let i = 0; i < rotCount; i++) {
        current = rotateClockwise(current);
      }

      const { newGrid, changed, points } = moveLeft(current);

      if (!changed) return;

      let finalGrid = newGrid;
      for (let i = 0; i < (4 - rotCount) % 4; i++) {
        finalGrid = rotateClockwise(finalGrid);
      }

      finalGrid = addRandomTile(finalGrid);
      sounds.playClick();

      // Check max tile
      let maxVal = highestTile;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (finalGrid[r][c] > maxVal) maxVal = finalGrid[r][c];
        }
      }
      setHighestTile(maxVal);

      if (points > 0) {
        const newScore = score + points;
        setScore(newScore);
        const newStreak = Math.min(5, streak + 1);
        setStreak(newStreak);
        onAddScore('reactor', points, newStreak, seconds);

        // Check if reached target tile
        if (maxVal >= targetTile && !isLevelCleared) {
          setIsLevelCleared(true);
          sounds.playVictory();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }
      }

      setBoard(finalGrid);
    },
    [board, isLevelCleared, isGameOver, highestTile, targetTile, score, streak, seconds, onAddScore]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleMove('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleMove('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMove('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMove('RIGHT');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove]);

  const handleHint = () => {
    sounds.playClick();
    onAddScore('reactor', -10, streak, seconds);
    setScore((s) => Math.max(0, s - 10));
    setHintText(
      `Quantum Strategy: Keep your highest element locked into a corner (e.g. bottom-right) and avoid moving opposite!`
    );
  };

  return (
    <GameWrapper
      title="Quantum Reactor"
      subtitle={`Level ${level} of 100 // 2048 Isotope Fusion`}
      icon="⚛️"
      score={score}
      streak={streak}
      time={formatTime(seconds)}
      level={level}
      onLevelChange={setLevel}
      onExit={onExit}
      onHint={handleHint}
      hintDisabled={isLevelCleared}
      hintText={hintText}
    >
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-cyan-500/30 max-w-lg mx-auto shadow-2xl relative text-center">
        {/* Header Info */}
        <div className="flex items-center justify-between mb-4 px-2 text-xs font-mono">
          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
            {diffCfg.label}
          </span>
          <span className="text-cyan-400 font-bold">
            TARGET: {ISOTOPES[targetTile]?.label || targetTile} ({targetTile})
          </span>
          <span className="text-slate-400">
            HIGHEST: {ISOTOPES[highestTile]?.label || highestTile}
          </span>
        </div>

        {/* 4x4 Grid Field */}
        <div className="p-3.5 bg-black/70 rounded-3xl border-2 border-cyan-500/40 shadow-2xl mx-auto w-full max-w-sm mb-6">
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, r) =>
              row.map((val, c) => {
                const iso = ISOTOPES[val] || ISOTOPES[2048];
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-orbitron transition-all duration-150 ${
                      val === 0
                        ? 'bg-white/5 border border-white/10'
                        : `${iso.bg} border ${iso.border} ${iso.text} shadow-lg scale-100`
                    }`}
                  >
                    {val !== 0 && (
                      <>
                        <span className="text-lg sm:text-2xl font-black">{iso.label}</span>
                        <span className="text-[9px] font-mono opacity-70 uppercase tracking-tighter">
                          {val}
                        </span>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* D-Pad Directional Controls for Mobile / Touch */}
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <button
            onClick={() => handleMove('UP')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-cyan-500/25 border border-white/20 active:scale-90 text-white"
            title="Slide Up"
          >
            <ArrowUp className="w-5 h-5 text-cyan-400" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleMove('LEFT')}
              className="p-3 rounded-2xl bg-white/10 hover:bg-cyan-500/25 border border-white/20 active:scale-90 text-white"
              title="Slide Left"
            >
              <ArrowLeft className="w-5 h-5 text-cyan-400" />
            </button>
            <button
              onClick={initBoard}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-90 text-slate-400 hover:text-white"
              title="Reset Board"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleMove('RIGHT')}
              className="p-3 rounded-2xl bg-white/10 hover:bg-cyan-500/25 border border-white/20 active:scale-90 text-white"
              title="Slide Right"
            >
              <ArrowRight className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
          <button
            onClick={() => handleMove('DOWN')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-cyan-500/25 border border-white/20 active:scale-90 text-white"
            title="Slide Down"
          >
            <ArrowDown className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

        {/* Victory Level Clear Banner */}
        {isLevelCleared && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-center animate-fade-in w-full">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-orbitron font-bold text-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span>REACTOR TARGET {targetTile} SYNTHESIZED!</span>
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              Harmonized in {formatTime(seconds)}! +{score} Reactor Points!
            </p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                onClick={() => setLevel((l) => (l < 100 ? l + 1 : 1))}
                className="btn-cosmic flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-bold font-orbitron tracking-wider transition-all"
              >
                <span>{level < 100 ? `ADVANCE TO LEVEL ${level + 1}` : 'RESTART LEVEL 1'}</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
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
