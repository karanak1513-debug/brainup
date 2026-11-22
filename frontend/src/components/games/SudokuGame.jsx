import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { CheckCircle2, RotateCcw, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function SudokuGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [size, setSize] = useState(4);
  const [initialGrid, setInitialGrid] = useState([]);
  const [currentGrid, setCurrentGrid] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState([0, 0]);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hintText, setHintText] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [streak, setStreak] = useState(1);
  const [isShaking, setIsShaking] = useState(false);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  // Fetch puzzle for specific level (1-100)
  const fetchPuzzle = async (lvl) => {
    try {
      const res = await fetch(`/api/games/sudoku/generate?level=${lvl}`);
      if (res.ok) {
        const data = await res.json();
        setInitialGrid(data.puzzle);
        setCurrentGrid(JSON.parse(JSON.stringify(data.puzzle)));
        setSolution(data.solution);
        setHintText(null);
        setGameWon(false);
        setMistakes(0);
        return;
      }
    } catch (e) {
      console.log('Using local fallback for Sudoku level', lvl);
    }

    // Fallback deterministic generator
    const baseSol = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1]
    ];
    const baseInit = [
      [1, 0, 3, 0],
      [0, 4, 0, 2],
      [2, 0, 4, 0],
      [0, 3, 0, 1]
    ];
    setInitialGrid(baseInit);
    setCurrentGrid(JSON.parse(JSON.stringify(baseInit)));
    setSolution(baseSol);
    setHintText(null);
    setGameWon(false);
    setMistakes(0);
  };

  useEffect(() => {
    fetchPuzzle(level);
  }, [level]);

  // Timer
  useEffect(() => {
    if (gameWon) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameWon]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Keyboard navigation & entry
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameWon) return;
      const key = e.key;

      if (key >= '1' && key <= '4') {
        handleNumberInput(parseInt(key));
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        handleClearCell();
      } else if (key === 'ArrowUp') {
        setSelectedCell(([r, c]) => [Math.max(0, r - 1), c]);
      } else if (key === 'ArrowDown') {
        setSelectedCell(([r, c]) => [Math.min(3, r + 1), c]);
      } else if (key === 'ArrowLeft') {
        setSelectedCell(([r, c]) => [r, Math.max(0, c - 1)]);
      } else if (key === 'ArrowRight') {
        setSelectedCell(([r, c]) => [r, Math.min(3, c + 1)]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, currentGrid, gameWon]);

  const handleNumberInput = (num) => {
    const [r, c] = selectedCell;
    if (initialGrid[r] && initialGrid[r][c] !== 0) return;

    sounds.playClick();
    const newGrid = JSON.parse(JSON.stringify(currentGrid));
    newGrid[r][c] = num;
    setCurrentGrid(newGrid);

    const isCorrect = solution[r] && solution[r][c] === num;
    if (!isCorrect) {
      setMistakes((m) => m + 1);
      sounds.playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
    } else {
      checkVictory(newGrid);
    }
  };

  const handleClearCell = () => {
    const [r, c] = selectedCell;
    if (initialGrid[r] && initialGrid[r][c] !== 0) return;
    sounds.playClick();
    const newGrid = JSON.parse(JSON.stringify(currentGrid));
    newGrid[r][c] = 0;
    setCurrentGrid(newGrid);
  };

  const checkVictory = (grid) => {
    let complete = true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!grid[r] || grid[r][c] !== solution[r][c]) {
          complete = false;
          break;
        }
      }
    }

    if (complete) {
      setGameWon(true);
      sounds.playVictory();
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
      const pointsWon = Math.max(60, 150 + level * 10 - mistakes * 15);
      onAddScore('sudoku', pointsWon, streak, seconds);
      setStreak((s) => s + 1);
    }
  };

  const handleHint = () => {
    sounds.playClick();
    onAddScore('sudoku', -10, 1, seconds);

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] !== solution[r][c]) {
          const newGrid = JSON.parse(JSON.stringify(currentGrid));
          newGrid[r][c] = solution[r][c];
          setCurrentGrid(newGrid);
          setSelectedCell([r, c]);
          setHintText(`Calibrated Row ${r + 1}, Col ${c + 1} with number ${solution[r][c]}.`);
          checkVictory(newGrid);
          return;
        }
      }
    }
  };

  return (
    <GameWrapper
      title="Sudoku Blitz"
      subtitle={`Level ${level} of 100 // 4x4 Quantum Grid`}
      icon="🧩"
      score={gameWon ? 120 + level * 5 : 0}
      streak={streak}
      time={formatTime(seconds)}
      level={level}
      onLevelChange={setLevel}
      onExit={onExit}
      onHint={handleHint}
      hintDisabled={gameWon}
      hintText={hintText}
    >
      <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl glass-panel cyber-hud border border-cyan-500/40 max-w-xl mx-auto shadow-2xl relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Status banner with Difficulty Badge */}
        <div className="w-full flex items-center justify-between mb-5 px-1 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full border text-[11px] font-bold shadow-md ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
              {diffCfg.label}
            </span>
            <span className={`font-bold flex items-center gap-1 ${mistakes > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              <AlertCircle className="w-3.5 h-3.5" />
              Errors: {mistakes}
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              fetchPuzzle(level);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Grid</span>
          </button>
        </div>

        {/* Sudoku 4x4 Grid Container */}
        <div className={`p-4 bg-black/75 rounded-3xl border-2 border-cyan-500/60 shadow-2xl shadow-cyan-950/60 transition-transform ${isShaking ? 'animate-shake' : ''}`}>
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {currentGrid.map((row, r) =>
              row.map((val, c) => {
                const isInitial = initialGrid[r] && initialGrid[r][c] !== 0;
                const isSelected = selectedCell[0] === r && selectedCell[1] === c;
                const isCorrect = val === 0 || (solution[r] && solution[r][c] === val);
                const isError = val !== 0 && !isCorrect;

                const borderR = (c + 1) % 2 === 0 && c < 3 ? 'border-r-2 border-r-cyan-400/70' : '';
                const borderB = (r + 1) % 2 === 0 && r < 3 ? 'border-b-2 border-b-cyan-400/70' : '';

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedCell([r, c]);
                    }}
                    className={`w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center text-2xl sm:text-3xl font-black font-orbitron rounded-2xl transition-all duration-200 cursor-pointer ${borderR} ${borderB} ${
                      isSelected
                        ? 'ring-3 ring-cyan-400 bg-cyan-950/80 text-cyan-200 scale-108 z-10 shadow-lg shadow-cyan-500/50'
                        : isInitial
                        ? 'bg-white/15 text-white font-black cursor-default shadow-sm'
                        : isError
                        ? 'bg-red-950/80 text-red-300 border-2 border-red-500 shadow-md shadow-red-950/50 animate-shake'
                        : val !== 0
                        ? 'bg-emerald-950/60 text-emerald-300 border-2 border-emerald-500/70 shadow-md shadow-emerald-950/50'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:border-cyan-400/50 border border-transparent'
                    }`}
                  >
                    {val !== 0 ? val : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Input Dial Keypad (1, 2, 3, 4 + Clear) */}
        <div className="flex items-center gap-3 mt-7">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/10 hover:bg-cyan-500/25 border-2 border-cyan-400/40 text-white font-orbitron font-black text-xl sm:text-2xl transition-all duration-200 active:scale-90 hover:border-cyan-400 shadow-xl shadow-cyan-950/50 cursor-pointer hover:scale-105"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClearCell}
            className="px-4 h-13 sm:h-15 rounded-2xl bg-red-950/50 hover:bg-red-950/80 border-2 border-red-500/50 text-red-200 text-xs font-mono font-bold transition-all duration-200 active:scale-90 cursor-pointer hover:border-red-400 shadow-lg"
          >
            Clear
          </button>
        </div>

        {/* Victory Level Clear Banner */}
        {gameWon && (
          <div className="mt-7 p-5 rounded-3xl bg-emerald-950/90 border-2 border-emerald-400 text-center animate-pop-scale w-full shadow-2xl shadow-emerald-950/60">
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-orbitron font-extrabold text-lg sm:text-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>LEVEL {level} HARMONIZED! [{diffCfg.label}]</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1 font-space">
              Solved in {formatTime(seconds)} with {mistakes} error(s). +{120 + level * 5} IQ Points!
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setLevel((l) => (l < 100 ? l + 1 : 1))}
                className="btn-cosmic flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-xs font-bold font-orbitron tracking-wider cursor-pointer shadow-lg"
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
