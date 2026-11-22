import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { Zap, RotateCcw, Trophy, ArrowRight, Flame, Clock, Sparkles } from 'lucide-react';

export default function RapidMathGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(true);
  const [problems, setProblems] = useState([]);
  const [problemIndex, setProblemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [combo, setCombo] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [eliminatedChoices, setEliminatedChoices] = useState([]);
  const [hintText, setHintText] = useState(null);
  const [floatingScore, setFloatingScore] = useState(null);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  // Fetch problems by level (1-100)
  const fetchProblems = async (lvl) => {
    try {
      const res = await fetch(`/api/games/math/batch?level=${lvl}&count=25`);
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems || []);
        setProblemIndex(0);
        return;
      }
    } catch (e) {
      console.log('Using local fallback math problems');
    }

    // Local procedural fallback
    const list = [];
    for (let i = 0; i < 20; i++) {
      const a = 12 + i * 3;
      const b = 8 + i * 2;
      const ans = a + b;
      list.push({
        id: `m_${lvl}_${i}`,
        question: `${a} + ${b}`,
        answer: ans,
        choices: [ans - 5, ans + 3, ans - 2, ans].sort(() => Math.random() - 0.5)
      });
    }
    setProblems(list);
    setProblemIndex(0);
  };

  useEffect(() => {
    setTimeLeft(60);
    setIsActive(true);
    setScore(0);
    setCombo(0);
    setStreak(1);
    setSolvedCount(0);
    setEliminatedChoices([]);
    setHintText(null);
    setFloatingScore(null);
    fetchProblems(level);
  }, [level]);

  // 60-second Countdown Timer
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsActive(false);
          sounds.playVictory();
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const currentProblem = problems[problemIndex];
  const isEmergencyTime = timeLeft <= 15 && isActive;

  const handleChoice = (val) => {
    if (!isActive || !currentProblem) return;

    if (val === currentProblem.answer) {
      sounds.playClick();
      const points = 30 + combo * 10 + level * 2;
      setScore((s) => s + points);
      setCombo((c) => c + 1);
      const newStreak = Math.min(5, Math.floor(combo / 3) + 1);
      setStreak(newStreak);
      setSolvedCount((c) => c + 1);
      onAddScore('math', points, newStreak, 60 - timeLeft);

      // Trigger floating score particle
      setFloatingScore(`+${points}`);
      setTimeout(() => setFloatingScore(null), 600);

      setEliminatedChoices([]);
      setHintText(null);
      setProblemIndex((idx) => (idx + 1) % problems.length);
    } else {
      sounds.playError();
      setCombo(0);
      setStreak(1);
    }
  };

  const handleHint = () => {
    if (!currentProblem) return;
    sounds.playClick();
    setScore((s) => Math.max(0, s - 10));
    onAddScore('math', -10, streak, 60 - timeLeft);

    const wrongDecoys = currentProblem.choices.filter((c) => c !== currentProblem.answer);
    setEliminatedChoices(wrongDecoys.slice(0, 2));
    setHintText(`Quantum sensor eliminated two impossible solutions.`);
  };

  const restartGame = () => {
    setTimeLeft(60);
    setIsActive(true);
    setScore(0);
    setCombo(0);
    setStreak(1);
    setSolvedCount(0);
    setEliminatedChoices([]);
    setHintText(null);
    setFloatingScore(null);
    fetchProblems(level);
  };

  return (
    <GameWrapper
      title="Rapid Math Sprint"
      subtitle={`Level ${level} of 100 // Speed Arithmetic`}
      icon="🚀"
      score={score}
      streak={streak}
      time={`${timeLeft}s`}
      level={level}
      onLevelChange={setLevel}
      onExit={onExit}
      onHint={handleHint}
      hintDisabled={!isActive || eliminatedChoices.length > 0}
      hintText={hintText}
    >
      <div className={`p-6 md:p-8 rounded-3xl glass-panel cyber-hud border max-w-xl mx-auto shadow-2xl relative text-center transition-all ${
        isEmergencyTime ? 'border-red-500/80 shadow-red-950/60 ring-2 ring-red-500/30' : 'border-amber-500/40'
      }`}>
        {/* Glow ambient orb */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all ${
          isEmergencyTime ? 'bg-red-500/25' : 'bg-amber-500/20'
        }`} />

        {isActive ? (
          <>
            {/* Header info */}
            <div className="flex items-center justify-between mb-4 px-2 text-xs font-mono">
              <span className={`px-3 py-1 rounded-full border text-[11px] font-bold shadow-md ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
                {diffCfg.label}
              </span>
              <span className="text-amber-400 font-bold">Solved: {solvedCount}</span>
              {combo > 1 && (
                <span className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/70 px-3 py-1 rounded-full border border-amber-500/50 animate-pulse shadow-md">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-current animate-bounce" />
                  {combo} COMBO!
                </span>
              )}
            </div>

            {/* Time progress bar with emergency pulse */}
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden mb-6 border border-white/10 shadow-inner">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  isEmergencyTime
                    ? 'bg-gradient-to-r from-red-600 to-rose-400 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-400'
                }`}
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              />
            </div>

            {/* Math Formula Card with floating score */}
            {currentProblem && (
              <div className="relative py-8 px-4 rounded-3xl bg-black/75 border-2 border-amber-500/50 shadow-2xl mb-6 overflow-hidden">
                <span className="text-xs uppercase font-mono text-amber-400 tracking-widest block mb-2">
                  COMPUTE QUANTUM EXPRESSION:
                </span>
                <span className="text-4xl sm:text-6xl font-black font-orbitron text-white tracking-wider drop-shadow-lg">
                  {currentProblem.question}
                </span>

                {/* Floating Score Popup */}
                {floatingScore && (
                  <div className="absolute top-2 right-4 text-emerald-400 font-orbitron font-black text-2xl animate-pop-scale">
                    {floatingScore}
                  </div>
                )}
              </div>
            )}

            {/* 4 Choices */}
            {currentProblem && (
              <div className="grid grid-cols-2 gap-3.5">
                {currentProblem.choices.map((choice) => {
                  const isEliminated = eliminatedChoices.includes(choice);
                  return (
                    <button
                      key={choice}
                      onClick={() => handleChoice(choice)}
                      disabled={isEliminated}
                      className={`h-18 rounded-2xl border-2 font-orbitron text-2xl sm:text-3xl font-black transition-all duration-150 active:scale-95 cursor-pointer ${
                        isEliminated
                          ? 'opacity-20 line-through bg-black/40 border-white/5 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-amber-500/25 border-white/20 hover:border-amber-400 text-white shadow-xl hover:scale-102 hover:shadow-amber-500/25'
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Time Expired / Final Scoreboard */
          <div className="py-6 flex flex-col items-center animate-pop-scale">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
            <h3 className="text-2xl md:text-3xl font-orbitron font-black text-white">
              LEVEL {level} SPRINT COMPLETE!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-5">
              Difficulty: <span className={`font-bold ${diffCfg.color}`}>{diffCfg.label}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs font-mono text-slate-400 block">TOTAL SCORE</span>
                <span className="text-2xl sm:text-3xl font-orbitron font-black text-amber-400">{score} PTS</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs font-mono text-slate-400 block">SOLVED</span>
                <span className="text-2xl sm:text-3xl font-orbitron font-black text-cyan-400">{solvedCount}</span>
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
                onClick={restartGame}
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
