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
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-purple-500/30 max-w-2xl mx-auto shadow-2xl relative">
        {currentPuzzle && (
          <>
            <div className="flex items-center justify-between text-xs font-mono text-purple-400 mb-3 uppercase tracking-wider">
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
                {diffCfg.label}
              </span>
              <span>{currentPuzzle.title}</span>
            </div>

            <p className="text-base text-slate-200 mb-5 font-medium">
              {currentPuzzle.description}
            </p>

            {/* Visual Sequence Card Display */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-5 rounded-2xl bg-black/50 border border-purple-500/30 mb-6 shadow-inner">
              {currentPuzzle.sequence.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-14 sm:w-16 sm:h-20 flex items-center justify-center rounded-xl text-lg sm:text-2xl font-bold font-orbitron border transition-all ${
                    item === '?'
                      ? 'border-dashed border-purple-400 bg-purple-950/70 text-purple-300 animate-pulse ring-2 ring-purple-400/40'
                      : 'border-white/10 bg-white/5 text-white'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Answer Choices */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {currentPuzzle.options.map((opt) => {
                const isChosen = selectedOption === opt;
                const isRight = isAnswered && opt === currentPuzzle.answer;
                const isWrong = isChosen && !isRight;

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-center font-orbitron text-lg font-bold transition-all duration-200 active:scale-95 ${
                      isRight
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400'
                        : isWrong
                        ? 'bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/15 text-white hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>{opt}</span>
                      {isRight && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isWrong && <XCircle className="w-4 h-4 text-red-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation & Advance */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs md:text-sm text-slate-300 animate-fade-in flex flex-col gap-3">
                <div>
                  <span className="font-bold text-purple-400 font-mono">DEDUCTION PRINCIPLE: </span>
                  <span>{currentPuzzle.explanation}</span>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setLevel((l) => (l < 100 ? l + 1 : 1))}
                    className="btn-cosmic flex items-center gap-2 px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs"
                  >
                    <span>{level < 100 ? `ADVANCE TO LEVEL ${level + 1}` : 'RESTART LEVEL 1'}</span>
                    <ArrowRight className="w-4 h-4" />
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
