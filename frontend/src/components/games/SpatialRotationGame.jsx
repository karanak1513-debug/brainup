import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { Compass, RotateCw, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';

// Shape templates on 3x3 grid (represented as 0 or 1)
const SHAPE_TEMPLATES = [
  // L-shape
  [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 0]
  ],
  // T-shape
  [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0]
  ],
  // F-shape
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 0]
  ],
  // Z-shape
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  // Plus
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
  // Corner hook
  [
    [1, 1, 0],
    [1, 0, 0],
    [0, 0, 0]
  ],
  // U-shape
  [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1]
  ]
];

// Helper to rotate a 3x3 matrix 90 degrees clockwise
const rotate90 = (grid) => {
  const n = grid.length;
  const res = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      res[c][n - 1 - r] = grid[r][c];
    }
  }
  return res;
};

// Helper to mirror (reflect horizontally)
const mirrorHorizontal = (grid) => {
  return grid.map((row) => [...row].reverse());
};

export default function SpatialRotationGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [targetShape, setTargetShape] = useState([]);
  const [targetAngle, setTargetAngle] = useState(90);
  const [options, setOptions] = useState([]); // [{ id, grid, isCorrect }]
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [hintText, setHintText] = useState(null);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  const generatePuzzle = (lvl) => {
    const baseShape = SHAPE_TEMPLATES[(lvl - 1) % SHAPE_TEMPLATES.length];
    const angles = [90, 180, 270];
    const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
    setTargetAngle(chosenAngle);
    setTargetShape(baseShape);

    // Compute true rotated shape
    let trueRotated = baseShape;
    const rotationsCount = chosenAngle / 90;
    for (let i = 0; i < rotationsCount; i++) {
      trueRotated = rotate90(trueRotated);
    }

    // Generate decoys (e.g. mirrored versions, or wrong angle rotations)
    const decoy1 = mirrorHorizontal(trueRotated);
    const decoy2 = rotate90(decoy1);
    const decoy3 = rotate90(rotate90(decoy1));

    const candidates = [
      { id: 'correct', grid: trueRotated, isCorrect: true },
      { id: 'decoy1', grid: decoy1, isCorrect: false },
      { id: 'decoy2', grid: decoy2, isCorrect: false },
      { id: 'decoy3', grid: decoy3, isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    setOptions(candidates);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setHintText(null);
  };

  useEffect(() => {
    generatePuzzle(level);
  }, [level]);

  // Timer
  useEffect(() => {
    if (isAnswered) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isAnswered]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (candidate) => {
    if (isAnswered) return;
    setSelectedOptionId(candidate.id);
    setIsAnswered(true);

    if (candidate.isCorrect) {
      sounds.playCorrect();
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      const points = (60 + level * 5) * streak;
      setScore((s) => s + points);
      setStreak((st) => st + 1);
      onAddScore('spatial', points, streak, seconds);
    } else {
      sounds.playError();
      setStreak(1);
    }
  };

  const handleHint = () => {
    if (isAnswered) return;
    sounds.playClick();
    setScore((s) => Math.max(0, s - 10));
    onAddScore('spatial', -10, streak, seconds);
    setHintText(
      `Mental Tip: Trace the longest edge of the glyph and mentally rotate it ${targetAngle}° clockwise. Beware of mirror reflections!`
    );
  };

  const renderGridMini = (grid, isSmall = false, activeColor = '#00F0FF') => {
    return (
      <div className={`grid grid-cols-3 gap-1 p-2 rounded-xl bg-black/60 border border-white/10 ${isSmall ? 'w-20 h-20' : 'w-28 h-28'}`}>
        {grid.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`rounded-md transition-all ${
                val === 1
                  ? 'border border-white/30 shadow-sm'
                  : 'bg-white/5 opacity-20'
              }`}
              style={{
                backgroundColor: val === 1 ? activeColor : 'transparent',
                boxShadow: val === 1 ? `0 0 10px ${activeColor}88` : 'none'
              }}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <GameWrapper
      title="Spatial Matrix"
      subtitle={`Level ${level} of 100 // Mental 3D Rotation`}
      icon="🧭"
      score={score}
      streak={streak}
      time={formatTime(seconds)}
      level={level}
      onLevelChange={setLevel}
      onExit={onExit}
      onHint={handleHint}
      hintDisabled={isAnswered}
      hintText={hintText}
    >
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-emerald-500/30 max-w-xl mx-auto shadow-2xl relative text-center">
        {/* Header Info */}
        <div className="flex items-center justify-between mb-4 px-2 text-xs font-mono">
          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
            {diffCfg.label}
          </span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5" />
            ROTATE {targetAngle}° CLOCKWISE
          </span>
        </div>

        {/* Target Glyph Card */}
        <div className="p-5 rounded-2xl bg-black/50 border border-emerald-500/30 mb-6 flex flex-col items-center shadow-lg">
          <span className="text-xs font-mono text-slate-300 uppercase tracking-widest mb-3">
            TARGET QUANTUM GLYPH (BASE ORIENTATION)
          </span>
          {targetShape.length > 0 && renderGridMini(targetShape, false, '#10B981')}
        </div>

        {/* Question Prompt */}
        <p className="text-xs sm:text-sm text-slate-300 font-space mb-5">
          Select the correct glyph after rotating the base orientation <strong className="text-emerald-400">{targetAngle}° clockwise</strong>. Decoys are mirrored or mutated:
        </p>

        {/* 4 Candidate Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {options.map((cand, idx) => {
            const isChosen = selectedOptionId === cand.id;
            const isRight = isAnswered && cand.isCorrect;
            const isWrong = isChosen && !isRight;

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(cand)}
                disabled={isAnswered}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                  isRight
                    ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400 shadow-lg shadow-emerald-950/60'
                    : isWrong
                    ? 'bg-red-950/80 border-red-500 ring-2 ring-red-400'
                    : 'bg-white/5 hover:bg-white/10 border-white/15 hover:border-emerald-400'
                }`}
              >
                {renderGridMini(cand.grid, true, isRight ? '#34D399' : isWrong ? '#F87171' : '#00F0FF')}
                <div className="flex items-center gap-1.5 mt-2 text-xs font-mono font-bold">
                  <span>CHOICE {idx + 1}</span>
                  {isRight && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isWrong && <XCircle className="w-4 h-4 text-red-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Level Complete / Next Level */}
        {isAnswered && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center animate-fade-in">
            <p className="text-xs sm:text-sm text-slate-200 mb-3">
              {selectedOptionId === 'correct'
                ? `Excellent spatial rotation! Mental orientation harmonized.`
                : `Spatial disorientation detected. Study the clockwise transformation.`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setLevel((l) => (l < 100 ? l + 1 : 1))}
                className="btn-cosmic flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs"
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
