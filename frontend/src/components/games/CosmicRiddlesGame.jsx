import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function CosmicRiddlesGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [hintText, setHintText] = useState(null);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  // Fetch riddle by level (1-100)
  const fetchRiddle = async (lvl) => {
    try {
      const res = await fetch(`/api/games/riddles?level=${lvl}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentRiddle(data);
        setSelectedOption(null);
        setIsAnswered(false);
        setHintText(null);
        return;
      }
    } catch (e) {
      console.log('Using local riddle fallback');
    }

    setCurrentRiddle({
      id: `riddle_lvl_${lvl}`,
      title: `Level ${lvl} // The Singularity Horizon`,
      question: 'I have no voice, but I shout of time\'s end. The faster you rush toward me, the slower your seconds spend. Nothing can escape my gravitational grasp, not even light. What am I?',
      options: ['A Black Hole', 'A Dark Nebula', 'A Neutron Star', 'A Tachyon Beam'],
      answer: 'A Black Hole',
      hint: 'Einstein\'s general relativity predicted my boundary known as the "event horizon".',
      explanation: 'At the event horizon of a black hole, escape velocity equals the speed of light, and gravitational time dilation approaches infinity.'
    });
    setSelectedOption(null);
    setIsAnswered(false);
    setHintText(null);
  };

  useEffect(() => {
    fetchRiddle(level);
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

  const handleSelectOption = (opt) => {
    if (isAnswered || !currentRiddle) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentRiddle.answer;
    if (isCorrect) {
      sounds.playCorrect();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      const points = (50 + level * 5) * streak;
      setScore((s) => s + points);
      setStreak((st) => st + 1);
      onAddScore('riddles', points, streak, seconds);
    } else {
      sounds.playError();
      setStreak(1);
    }
  };

  const handleHint = () => {
    if (!currentRiddle) return;
    sounds.playClick();
    setHintText(currentRiddle.hint);
    setScore((s) => Math.max(0, s - 10));
    onAddScore('riddles', -10, streak, seconds);
  };

  return (
    <GameWrapper
      title="Cosmic Riddles"
      subtitle={`Level ${level} of 100 // Quantum Paradoxes`}
      icon="🔮"
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
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-pink-500/30 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {currentRiddle && (
          <>
            <div className="flex items-center justify-between text-xs font-mono text-pink-400 mb-3 uppercase tracking-wider">
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
                {diffCfg.label}
              </span>
              <span>{currentRiddle.title}</span>
            </div>

            {/* Question Card */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 mb-6">
              <p className="text-base md:text-lg text-slate-100 font-medium leading-relaxed italic">
                "{currentRiddle.question}"
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentRiddle.options.map((opt) => {
                const isChosen = selectedOption === opt;
                const isRight = isAnswered && opt === currentRiddle.answer;
                const isWrong = isChosen && !isRight;

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-left font-space text-sm font-semibold transition-all duration-200 active:scale-98 ${
                      isRight
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 shadow-lg shadow-emerald-950/60'
                        : isWrong
                        ? 'bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-200 hover:border-pink-400/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {isRight && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isWrong && <XCircle className="w-4 h-4 text-red-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation & Advance to Next Level */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs md:text-sm text-slate-300 animate-fade-in flex flex-col gap-3">
                <div>
                  <span className="font-bold text-pink-400 font-mono">ASTROPHYSICAL PRINCIPLE: </span>
                  <span>{currentRiddle.explanation}</span>
                </div>

                <div className="flex justify-end gap-2">
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
