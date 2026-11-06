import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

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
    } else {
      checkVictory(newGrid);
    }
  };

  const handleClearCell = () => {
    const [r, c] = selectedCell;
    if (initialGrid[r] && initialGrid[r][c] !== 0) return;
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
        particleCount: 100,
        spread: 70,
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
      <div className="flex flex-col items-center justify-center p-6 rounded-3xl glass-panel border border-cyan-500/30 max-w-xl mx-auto shadow-2xl">
        {/* Status banner with Difficulty Badge */}
        <div className="w-full flex items-center justify-between mb-4 px-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
              {diffCfg.label}
            </span>
            <span className="text-red-400 font-bold">Errors: {mistakes}</span>
          </div>
          <button
            onClick={() => fetchPuzzle(level)}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Grid</span>
          </button>
        </div>

        {/* Sudoku Grid */}
        <div className="p-3 bg-black/60 rounded-2xl border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/40">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {currentGrid.map((row, r) =>
              row.map((val, c) => {
                const isInitial = initialGrid[r] && initialGrid[r][c] !== 0;
                const isSelected = selectedCell[0] === r && selectedCell[1] === c;
                const isCorrect = val === 0 || (solution[r] && solution[r][c] === val);
                const isError = val !== 0 && !isCorrect;

                const borderR = (c + 1) % 2 === 0 && c < 3 ? 'border-r-2 border-r-cyan-400/60' : '';
                const borderB = (r + 1) % 2 === 0 && r < 3 ? 'border-b-2 border-b-cyan-400/60' : '';

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedCell([r, c]);
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-bold font-orbitron rounded-xl transition-all duration-150 ${borderR} ${borderB} ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 bg-cyan-950/70 text-cyan-200 scale-105 z-10'
                        : isInitial
                        ? 'bg-white/10 text-white font-extrabold cursor-default'
                        : isError
                        ? 'bg-red-950/60 text-red-400 border border-red-500'
                        : val !== 0
                        ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/60'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {val !== 0 ? val : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Input Dial (1, 2, 3, 4 + Clear) */}
        <div className="flex items-center gap-2.5 mt-6">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-white font-orbitron font-bold text-lg transition-all duration-150 active:scale-90 hover:border-cyan-400 shadow-md shadow-cyan-950/50"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClearCell}
            className="px-3.5 h-12 rounded-2xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono font-bold transition-all duration-150 active:scale-90"
          >
            Clear
          </button>
        </div>

        {/* Victory Level Clear Banner */}
        {gameWon && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-center animate-fade-in w-full">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-orbitron font-bold text-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span>LEVEL {level} HARMONIZED! [{diffCfg.label}]</span>
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              Solved in {formatTime(seconds)} with {mistakes} error(s). +{120 + level * 5} IQ Points!
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
                Return to Cube
              </button>
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
