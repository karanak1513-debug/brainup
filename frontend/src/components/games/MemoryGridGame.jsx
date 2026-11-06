import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

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
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          }
        }, 500);
      } else {
        setTimeout(() => {
          sounds.playError();
          setFlippedIndices([]);
          setStreak(1);
        }, 850);
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
    setHintText(`Quantum radar flashed the [${unmatched[0].name}] entanglements.`);
    setScore((s) => Math.max(0, s - 10));
    onAddScore('memory', -10, streak, seconds);

    setTimeout(() => {
      setHintFlashing([]);
    }, 1200);
  };

  return (
    <GameWrapper
      title="Quantum Memory Grid"
      subtitle={`Level ${level} of 100 // Card Recall`}
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
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-blue-500/30 max-w-xl mx-auto shadow-2xl relative text-center">
        {/* Flips & Matches Stat Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-5 px-1 uppercase tracking-wider">
          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
            {diffCfg.label}
          </span>
          <span>FLIPS: {flipCount}</span>
          <span>MATCHES: {matchedPairs.length} / {targetPairCount}</span>
          <button
            onClick={() => initGame(level)}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>SHUFFLE</span>
          </button>
        </div>

        {/* Card Grid */}
        <div className={`grid gap-2.5 sm:gap-3.5 mb-4 ${
          targetPairCount <= 4 ? 'grid-cols-4' : targetPairCount <= 6 ? 'grid-cols-4' : 'grid-cols-4'
        }`}>
          {cards.map((card, index) => {
            const isFlipped =
              flippedIndices.includes(index) ||
              matchedPairs.includes(card.pairId) ||
              hintFlashing.includes(index);
            const isMatched = matchedPairs.includes(card.pairId);

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={isMatched || isGameOver}
                className={`h-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 transform ${
                  isMatched
                    ? 'bg-emerald-950/70 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-950/50'
                    : isFlipped
                    ? 'bg-black/70 border-cyan-400 ring-2 ring-cyan-400/40 scale-102'
                    : 'bg-white/10 hover:bg-white/15 border-white/15 hover:border-cyan-400/60 active:scale-95'
                }`}
              >
                {isFlipped ? (
                  <div className="flex flex-col items-center animate-fade-in">
                    <span className="text-2xl sm:text-3xl">{card.symbol}</span>
                    <span
                      className="text-[10px] sm:text-xs font-mono font-bold mt-1 tracking-tight"
                      style={{ color: card.color }}
                    >
                      {card.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center opacity-40">
                    <span className="text-xl">🪐</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Level Complete Advance Banner */}
        {isGameOver && (
          <div className="p-5 rounded-2xl bg-cyan-950/80 border border-cyan-400 mt-4 animate-fade-in flex flex-col items-center">
            <div className="flex items-center gap-2 text-cyan-300 font-orbitron font-bold text-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span>LEVEL {level} CALIBRATED! [{diffCfg.label}]</span>
            </div>
            <p className="text-xs text-cyan-200 mt-1 mb-4">
              All {targetPairCount} pairs harmonized in {flipCount} flips ({formatTime(seconds)}). +{score} IQ Points!
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLevel((l) => (l < 100 ? l + 1 : 1))}
                className="btn-cosmic flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-orbitron font-bold"
              >
                <span>{level < 100 ? `ADVANCE TO LEVEL ${level + 1}` : 'RESTART LEVEL 1'}</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
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
