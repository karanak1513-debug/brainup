import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { Eye, Zap, Flame, RotateCcw, ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

const PALETTE = [
  { name: 'CYAN', hex: '#00F0FF', bg: 'bg-cyan-500/20', border: 'border-cyan-400' },
  { name: 'PURPLE', hex: '#A855F7', bg: 'bg-purple-500/20', border: 'border-purple-400' },
  { name: 'EMERALD', hex: '#10B981', bg: 'bg-emerald-500/20', border: 'border-emerald-400' },
  { name: 'AMBER', hex: '#F59E0B', bg: 'bg-amber-500/20', border: 'border-amber-400' },
  { name: 'ROSE', hex: '#F43F5E', bg: 'bg-rose-500/20', border: 'border-rose-400' },
  { name: 'INDIGO', hex: '#6366F1', bg: 'bg-indigo-500/20', border: 'border-indigo-400' }
];

export default function ChromaticReflexGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [combo, setCombo] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hintText, setHintText] = useState(null);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];
  const targetRounds = difficulty === 'EASY' ? 10 : difficulty === 'MEDIUM' ? 15 : 20;

  // Generate next Stroop round
  const generateRound = (lvl, roundNum) => {
    const ruleMode = lvl >= 25 && Math.random() > 0.45 ? 'TEXT' : 'INK';

    const wordColorObj = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    let inkColorObj = PALETTE[Math.floor(Math.random() * PALETTE.length)];

    if (Math.random() > 0.25) {
      while (inkColorObj.name === wordColorObj.name) {
        inkColorObj = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      }
    }

    const correctAnswer = ruleMode === 'INK' ? inkColorObj.name : wordColorObj.name;

    const options = [correctAnswer];
    while (options.length < 4) {
      const candidate = PALETTE[Math.floor(Math.random() * PALETTE.length)].name;
      if (!options.includes(candidate)) {
        options.push(candidate);
      }
    }
    options.sort(() => Math.random() - 0.5);

    setCurrentChallenge({
      round: roundNum,
      ruleMode,
      wordText: wordColorObj.name,
      inkColor: inkColorObj.hex,
      correctAnswer,
      options
    });
    setFeedback(null);
    setEliminatedOptions([]);
    setHintText(null);
  };

  useEffect(() => {
    setScore(0);
    setStreak(1);
    setCombo(0);
    setSeconds(0);
    setRound(1);
    setIsGameOver(false);
    generateRound(level, 1);
  }, [level]);

  // Timer
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (choice) => {
    if (isGameOver || !currentChallenge || feedback) return;

    const isCorrect = choice === currentChallenge.correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
      const points = (35 + combo * 10 + level * 3) * streak;
      const newCombo = combo + 1;
      const newStreak = Math.min(5, Math.floor(newCombo / 3) + 1);
      setScore((s) => s + points);
      setCombo(newCombo);
      setStreak(newStreak);
      onAddScore('stroop', points, newStreak, seconds);

      setFeedback({ correct: true, text: `PERFECT REFLEX! +${points} PTS` });

      if (round >= targetRounds) {
        setTimeout(() => {
          setIsGameOver(true);
          sounds.playVictory();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }, 500);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
          generateRound(level, round + 1);
        }, 500);
      }
    } else {
      sounds.playError();
      setCombo(0);
      setStreak(1);
      setFeedback({ correct: false, text: `INTERFERENCE DETECTED! Target was ${currentChallenge.correctAnswer}` });
      setTimeout(() => {
        setRound((r) => r + 1);
        generateRound(level, round + 1);
      }, 850);
    }
  };

  const handleHint = () => {
    if (!currentChallenge || isGameOver) return;
    sounds.playClick();
    onAddScore('stroop', -10, streak, seconds);
    setScore((s) => Math.max(0, s - 10));

    const wrong = currentChallenge.options.filter((o) => o !== currentChallenge.correctAnswer);
    setEliminatedOptions(wrong.slice(0, 2));
    setHintText(
      currentChallenge.ruleMode === 'INK'
        ? `Focus on the PHYSICAL COLOR of the letters, ignore the word spelling!`
        : `Focus on the TEXT SPELLING, ignore the ink color!`
    );
  };

  return (
    <GameWrapper
      title="Chromatic Reflex"
      subtitle={`Level ${level} of 100 // Quantum Stroop Test`}
      icon="👁️"
      score={score}
      streak={streak}
      time={formatTime(seconds)}
      level={level}
      onLevelChange={setLevel}
      onExit={onExit}
      onHint={handleHint}
      hintDisabled={isGameOver || eliminatedOptions.length > 0}
      hintText={hintText}
    >
      <div className="p-6 md:p-8 rounded-3xl glass-panel cyber-hud border border-cyan-500/40 max-w-xl mx-auto shadow-2xl relative text-center overflow-hidden">
        {!isGameOver ? (
          <>
            {/* Round & Difficulty Header */}
            <div className="flex items-center justify-between mb-4 px-2 text-xs font-mono">
              <span className={`px-3 py-1 rounded-full border text-[11px] font-bold shadow-md ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
                {diffCfg.label}
              </span>
              <span className="text-cyan-300 font-bold font-mono">
                STAGE: {round} / {targetRounds}
              </span>
              {combo > 1 && (
                <span className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/70 px-3 py-1 rounded-full border border-amber-500/50 animate-pulse shadow-md">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-current animate-bounce" />
                  {combo} COMBO!
                </span>
              )}
            </div>

            {/* Instruction Rule Banner with Neon Border Beam */}
            {currentChallenge && (
              <div
                className={`py-2.5 px-4 rounded-2xl border-2 text-xs sm:text-sm font-mono font-bold tracking-widest uppercase mb-6 transition-all shadow-lg ${
                  currentChallenge.ruleMode === 'INK'
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-cyan-950/50'
                    : 'bg-purple-950/70 border-purple-400 text-purple-300 shadow-purple-950/50'
                }`}
              >
                RULE: SELECT THE {currentChallenge.ruleMode === 'INK' ? '🎨 PHYSICAL INK COLOR' : '🔤 WRITTEN WORD SPELLING'}
              </div>
            )}

            {/* Central Stroop Stimulus Display with Liquid Energy Glow */}
            {currentChallenge && (
              <div className="relative py-12 px-6 rounded-3xl bg-black/80 border-2 border-white/20 shadow-2xl mb-6 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-25 blur-3xl pointer-events-none transition-all duration-300"
                  style={{ backgroundColor: currentChallenge.inkColor }}
                />

                <span
                  className="relative text-4xl sm:text-6xl font-black font-orbitron tracking-widest transition-all drop-shadow-2xl animate-pop-scale"
                  style={{ color: currentChallenge.inkColor }}
                >
                  {currentChallenge.wordText}
                </span>
              </div>
            )}

            {/* Feedback notification banner */}
            {feedback && (
              <div
                className={`mb-4 py-2 px-4 rounded-2xl border-2 text-xs font-mono font-bold animate-pop-scale flex items-center justify-center gap-2 shadow-lg ${
                  feedback.correct
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-emerald-950/50'
                    : 'bg-red-950/90 border-red-500 text-red-300 shadow-red-950/50 animate-shake'
                }`}
              >
                {feedback.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* 4 Color Options */}
            {currentChallenge && (
              <div className="grid grid-cols-2 gap-3.5">
                {currentChallenge.options.map((opt) => {
                  const isEliminated = eliminatedOptions.includes(opt);
                  const paletteItem = PALETTE.find((p) => p.name === opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      disabled={isEliminated || feedback !== null}
                      className={`h-18 rounded-2xl border-2 font-orbitron text-base sm:text-lg font-black transition-all duration-150 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer ${
                        isEliminated
                          ? 'opacity-20 line-through bg-black/40 border-white/5 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-xl hover:border-cyan-400 hover:scale-102 hover:shadow-cyan-500/30'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: paletteItem?.hex || '#ffffff' }}
                      />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Level Completed Screen */
          <div className="py-6 flex flex-col items-center animate-pop-scale">
            <Zap className="w-16 h-16 text-cyan-400 mb-3 animate-bounce" />
            <h3 className="text-2xl md:text-3xl font-orbitron font-black text-white">
              LEVEL {level} REFLEX HARMONIZED!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-5">
              Difficulty: <span className={`font-bold ${diffCfg.color}`}>{diffCfg.label}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs font-mono text-slate-400 block">TOTAL SCORE</span>
                <span className="text-2xl sm:text-3xl font-orbitron font-black text-cyan-400">{score} PTS</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs font-mono text-slate-400 block">TIME SOLVED</span>
                <span className="text-2xl sm:text-3xl font-orbitron font-black text-amber-400">{formatTime(seconds)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setLevel((l) => (l < 100 ? l + 1 : 1))}
                className="btn-cosmic flex items-center gap-2 px-6 py-3 rounded-2xl font-orbitron font-bold text-xs cursor-pointer shadow-lg"
              >
                <span>{level < 100 ? `ADVANCE TO LEVEL ${level + 1}` : 'RESTART LEVEL 1'}</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={() => {
                  setScore(0);
                  setRound(1);
                  setIsGameOver(false);
                  generateRound(level, 1);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Level</span>
              </button>
              <button
                onClick={onExit}
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-semibold cursor-pointer transition-all"
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
