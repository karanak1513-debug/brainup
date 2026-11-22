import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { CheckCircle2, RotateCcw, ArrowRight, Sparkles, Orbit } from 'lucide-react';

export default function MemoryGridGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [flipCount, setFlipCount] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hintText, setHintText] = useState(null);
  const [hintFlashing, setHintFlashing] = useState([]);
  const [targetPairCount, setTargetPairCount] = useState(8);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  // Fetch cards by level (1-100)
  const initGame = async (lvl) => {
    setFlippedIndices([]);
    setMatchedPairs([]);
    setFlipCount(0);
    setScore(0);
    setStreak(1);
    setSeconds(0);
    setIsGameOver(false);
    setHintText(null);
    setHintFlashing([]);

    try {
      const res = await fetch(`/api/games/memory/deck?level=${lvl}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.deck || []);
        setTargetPairCount(data.pairCount || 8);
        return;
      }
    } catch (e) {
      console.log('Using local memory deck fallback');
    }

    const master = [
      { symbol: '⚡', name: 'Pulsar', color: '#00F0FF' },
      { symbol: '💥', name: 'Supernova', color: '#FF5722' },
      { symbol: '🌀', name: 'Dark Matter', color: '#8B5CF6' },
      { symbol: '🔮', name: 'Quasar', color: '#EC4899' },
      { symbol: '🌌', name: 'Wormhole', color: '#10B981' },
      { symbol: '🕳️', name: 'Black Hole', color: '#6366F1' },
      { symbol: '☀️', name: 'Dyson Sphere', color: '#F59E0B' },
      { symbol: '✨', name: 'Nebula', color: '#14B8A6' }
    ];

    const pairs = difficulty === 'EASY' ? 4 : difficulty === 'MEDIUM' ? 6 : 8;
    setTargetPairCount(pairs);
    const chosen = master.slice(0, pairs);
    const deck = [];
    chosen.forEach((c, i) => {
      deck.push({ id: `${lvl}_${i}_a`, pairId: i, ...c });
      deck.push({ id: `${lvl}_${i}_b`, pairId: i, ...c });
    });
    deck.sort(() => Math.random() - 0.5);
    setCards(deck);
  };

  useEffect(() => {
    initGame(level);
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

  const handleCardClick = (index) => {
    if (
      flippedIndices.length >= 2 ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(cards[index].pairId) ||
      isGameOver
    ) {
      return;
    }

    sounds.playClick();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    setFlipCount((f) => f + 1);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];

      if (card1.pairId === card2.pairId) {
        setTimeout(() => {
          sounds.playCorrect();
          const newMatches = [...matchedPairs, card1.pairId];
          setMatchedPairs(newMatches);
          setFlippedIndices([]);

          const points = (40 + level * 3) * streak;
          setScore((s) => s + points);
          setStreak((st) => st + 1);
          onAddScore('memory', points, streak, seconds);

          if (newMatches.length === targetPairCount) {
            setIsGameOver(true);
            sounds.playVictory();
            confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
          }
        }, 450);
      } else {
        setTimeout(() => {
          sounds.playError();
          setFlippedIndices([]);
          setStreak(1);
        }, 750);
      }
    }
  };

  const handleHint = () => {
    if (isGameOver) return;
    const unmatched = cards.filter((c) => !matchedPairs.includes(c.pairId));
    if (unmatched.length === 0) return;

    const targetPairId = unmatched[0].pairId;
    const targetIndices = cards
      .map((c, i) => (c.pairId === targetPairId ? i : null))
      .filter((i) => i !== null);

    sounds.playClick();
    setHintFlashing(targetIndices);
    setHintText(`Quantum radar temporarily illuminated the [${unmatched[0].name}] entanglement.`);
    setScore((s) => Math.max(0, s - 10));
    onAddScore('memory', -10, streak, seconds);

    setTimeout(() => {
      setHintFlashing([]);
    }, 1400);
  };

  return (
    <GameWrapper
      title="Quantum Memory Grid"
      subtitle={`Level ${level} of 100 // 3D Entangled Recall`}
      icon="🌌"
      score={score}
      streak={streak}
      time={formatTime(seconds)}
      level={level}
      onLevelChange={setLevel}
      onExit={onExit}
      onHint={handleHint}
      hintDisabled={isGameOver || hintFlashing.length > 0}
      hintText={hintText}
    >
      <div className="p-6 md:p-8 rounded-3xl glass-panel cyber-hud border border-blue-500/40 max-w-xl mx-auto shadow-2xl relative text-center overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -top-24 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Flips & Matches Stat Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-6 px-1 uppercase tracking-wider">
          <span className={`px-3 py-1 rounded-full border text-[11px] font-bold shadow-md ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
            {diffCfg.label}
          </span>
          <span className="font-bold text-slate-300">FLIPS: <strong className="text-white">{flipCount}</strong></span>
          <span className="font-bold text-slate-300">MATCHES: <strong className="text-emerald-400">{matchedPairs.length}</strong> / {targetPairCount}</span>
          <button
            onClick={() => {
              sounds.playClick();
              initGame(level);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shuffle</span>
          </button>
        </div>

        {/* 3D Interactive Card Grid */}
        <div className={`grid gap-3 sm:gap-4 mb-4 ${
          targetPairCount <= 4 ? 'grid-cols-4' : targetPairCount <= 6 ? 'grid-cols-4' : 'grid-cols-4'
        }`}>
          {cards.map((card, index) => {
            const isFlipped =
              flippedIndices.includes(index) ||
              matchedPairs.includes(card.pairId) ||
              hintFlashing.includes(index);
            const isMatched = matchedPairs.includes(card.pairId);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                className="perspective-1000 h-22 sm:h-28 cursor-pointer select-none"
              >
                <div
                  className={`w-full h-full relative transform-style-3d transition-transform duration-500 rounded-2xl ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Card Front (Face Down) */}
                  <div
                    className={`absolute inset-0 backface-hidden rounded-2xl flex flex-col items-center justify-center border-2 border-white/15 bg-gradient-to-br from-white/10 to-black/60 hover:border-cyan-400/70 hover:scale-102 transition-all shadow-lg active:scale-95`}
                  >
                    <Orbit className="w-6 h-6 text-purple-400 opacity-60 animate-spin-slow" />
                    <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">
                      QUANTUM
                    </span>
                  </div>

                  {/* Card Back (Face Up / Revealed) */}
                  <div
                    className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all ${
                      isMatched
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-emerald-500/40 ring-2 ring-emerald-400/50'
                        : 'bg-black/85 border-cyan-400 shadow-cyan-500/40 ring-2 ring-cyan-400/40'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl drop-shadow-md">{card.symbol}</span>
                    <span
                      className="text-[10px] sm:text-xs font-mono font-bold mt-1 tracking-tight drop-shadow"
                      style={{ color: card.color }}
                    >
                      {card.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Level Complete Advance Banner */}
        {isGameOver && (
          <div className="p-6 rounded-3xl bg-emerald-950/90 border-2 border-emerald-400 mt-6 animate-pop-scale flex flex-col items-center shadow-2xl shadow-emerald-950/60">
            <div className="flex items-center gap-2 text-emerald-300 font-orbitron font-extrabold text-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>LEVEL {level} CALIBRATED! [{diffCfg.label}]</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1.5 mb-5 font-space">
              All {targetPairCount} pairs harmonized in {flipCount} flips ({formatTime(seconds)}). +{score} IQ Points!
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
