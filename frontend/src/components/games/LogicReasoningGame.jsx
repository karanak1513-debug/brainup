import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function LogicReasoningGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [hintText, setHintText] = useState(null);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  // Fetch puzzle by level (1-100)
  const fetchPuzzle = async (lvl) => {
    try {
      const res = await fetch(`/api/games/logic?level=${lvl}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentPuzzle(data);
        setSelectedOption(null);
        setIsAnswered(false);
        setHintText(null);
        return;
      }
    } catch (e) {
      console.log('Using local logic fallback');
    }

    // Fallback
    setCurrentPuzzle({
      id: `logic_lvl_${lvl}`,
      title: `Linear Progression (Lvl ${lvl})`,
      description: `Identify the missing quantum resonance value in this ${difficulty} progression:`,
      sequence: ['3', '5', '9', '17', '33', '?'],
      options: ['49', '65', '64', '57'],
      answer: '65',
      hint: 'Examine the delta between consecutive steps: +2, +4, +8, +16...',
      explanation: 'Each difference doubles: 33 + 32 = 65.'
    });
    setSelectedOption(null);
    setIsAnswered(false);
    setHintText(null);
  };

  useEffect(() => {
    fetchPuzzle(level);
  }, [level]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (opt) => {
    if (isAnswered || !currentPuzzle) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentPuzzle.answer;
    if (isCorrect) {
      sounds.playCorrect();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      const points = (60 + level * 5) * streak;
      setScore((s) => s + points);
      setStreak((st) => st + 1);
      onAddScore('logic', points, streak, seconds);
    } else {
      sounds.playError();
      setStreak(1);
    }
  };

  const handleHint = () => {
    if (!currentPuzzle) return;
    sounds.playClick();
    setHintText(currentPuzzle.hint);
    setScore((s) => Math.max(0, s - 10));
    onAddScore('logic', -10, streak, seconds);
  };

  return (
    <GameWrapper
      title="Logic & Reasoning"
      subtitle={`Level ${level} of 100 // Cognitive Sequences`}
      icon="⚡"
      score={score}
      streak={streak}
      time={formatTime(seconds)}
      level={level}
      onLevelChange={setLevel}
      onExit={onExit}
      onHint={handleHint}
      hintDisabled={isAnswered || hintText !== null}
      hintText={hintText}
    >
      <div className="cyber-hud relative p-6 md:p-8 rounded-3xl glass-panel border border-purple-500/30 max-w-2xl mx-auto shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {currentPuzzle && (
          <>
            <div className="flex items-center justify-between text-xs font-mono text-purple-400 mb-4 uppercase tracking-wider">
              <span className={`px-3 py-1 rounded-full border text-[11px] font-bold ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color} shadow-sm`}>
                {diffCfg.label}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                {currentPuzzle.title}
              </span>
            </div>

            <p className="text-base text-slate-200 mb-5 font-medium leading-relaxed">
              {currentPuzzle.description}
            </p>

            {/* Visual Sequence Card Display with cyber microchip nodes */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-6 rounded-2xl bg-black/60 border border-purple-500/30 mb-6 shadow-inner relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-cyan-500/5 rounded-2xl pointer-events-none" />
              {currentPuzzle.sequence.map((item, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={`relative w-12 h-14 sm:w-16 sm:h-20 flex items-center justify-center rounded-xl text-lg sm:text-2xl font-bold font-orbitron border transition-all duration-300 shadow-md ${
                      item === '?'
                        ? 'border-dashed border-purple-400 bg-purple-950/80 text-purple-200 animate-pulse ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/30'
                        : 'border-white/15 bg-white/5 text-white hover:border-purple-400/50 hover:bg-white/10'
                    }`}
                  >
                    {item}
                    {item === '?' && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                    )}
                  </div>
                  {idx < currentPuzzle.sequence.length - 1 && (
                    <span className="text-purple-400/50 text-xs sm:text-sm font-mono select-none">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Answer Choices */}
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              {currentPuzzle.options.map((opt) => {
                const isChosen = selectedOption === opt;
                const isRight = isAnswered && opt === currentPuzzle.answer;
                const isWrong = isChosen && !isRight;

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-center font-orbitron text-lg font-bold transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 ${
                      isRight
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 shadow-lg shadow-emerald-950/60 animate-pop-scale'
                        : isWrong
                        ? 'bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-400 animate-shake'
                        : 'bg-white/5 hover:bg-white/10 border-white/15 text-white hover:border-purple-400 hover:shadow-md hover:shadow-purple-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>{opt}</span>
                      {isRight && <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />}
                      {isWrong && <XCircle className="w-5 h-5 text-red-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation & Advance */}
            {isAnswered && (
              <div className="p-5 rounded-2xl bg-black/60 border border-purple-500/30 text-xs md:text-sm text-slate-300 animate-fade-in flex flex-col gap-4 shadow-xl">
                <div>
                  <span className="font-bold text-purple-400 font-mono tracking-wide">DEDUCTION PRINCIPLE: </span>
                  <span className="text-slate-200">{currentPuzzle.explanation}</span>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setLevel((l) => (l < 100 ? l + 1 : 1))}
                    className="btn-cosmic flex items-center gap-2 px-6 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                  >
                    <span>{level < 100 ? `ADVANCE TO LEVEL ${level + 1}` : 'RESTART LEVEL 1'}</span>
                    <ArrowRight className="w-4 h-4 animate-pulse" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </GameWrapper>
  );
}
