import React, { useState, useEffect } from 'react';
import GameWrapper from '../GameWrapper';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../../utils/levels';
import { Type, Sparkles, RotateCcw, Shuffle, Delete, ArrowRight, CheckCircle2 } from 'lucide-react';

const COSMIC_WORDS = [
  // Easy (4-5 letters)
  { word: 'NOVA', category: 'Astronomy', clue: 'A cataclysmic nuclear explosion in a white dwarf star' },
  { word: 'ATOM', category: 'Physics', clue: 'The basic building block of all universal matter' },
  { word: 'SOLAR', category: 'Cosmology', clue: 'Relating to or determined by the Sun' },
  { word: 'ORBIT', category: 'Astrophysics', clue: 'Curved gravitational trajectory of an object around a star or planet' },
  { word: 'COMET', category: 'Celestial', clue: 'An icy small Solar System body with a glowing coma and tail' },
  { word: 'LIGHT', category: 'Optics', clue: 'Electromagnetic radiation traveling at 300,000 km/s in vacuum' },
  { word: 'SPACE', category: 'Cosmology', clue: 'The boundless three-dimensional continuum of existence' },
  { word: 'LUNAR', category: 'Celestial', clue: 'Pertaining to the Moon or its gravitational tides' },
  // Medium (6-7 letters)
  { word: 'PULSAR', category: 'Astrophysics', clue: 'Rapidly rotating magnetized neutron star emitting beams of electromagnetic radiation' },
  { word: 'NEBULA', category: 'Astronomy', clue: 'An interstellar cloud of dust, hydrogen, helium and other ionized gases' },
  { word: 'QUASAR', category: 'Astrophysics', clue: 'Extremely luminous active galactic nucleus powered by a supermassive black hole' },
  { word: 'COSMOS', category: 'Cosmology', clue: 'The universe seen as a well-ordered and harmonious whole' },
  { word: 'GRAVITY', category: 'Physics', clue: 'Fundamental force of universal attraction between objects with mass' },
  { word: 'SYNAPSE', category: 'Neuroscience', clue: 'The junction between two nerve cells across which impulses pass' },
  { word: 'PHOTON', category: 'Quantum', clue: 'A quantum of electromagnetic radiation and force carrier' },
  { word: 'GALAXY', category: 'Astronomy', clue: 'A gravitationally bound system of stars, stellar remnants, interstellar gas, and dark matter' },
  // Hard & Super Hard (7-9 letters)
  { word: 'QUANTUM', category: 'Physics', clue: 'The minimum amount of any physical entity involved in an interaction' },
  { word: 'ECLIPSE', category: 'Celestial', clue: 'An obscuring of light from one celestial body by the passage of another' },
  { word: 'SUPERNOVA', category: 'Astrophysics', clue: 'A powerful and luminous stellar explosion occurring during the last evolutionary stages' },
  { word: 'PARADOX', category: 'Logic', clue: 'A seemingly self-contradictory statement that investigates underlying truth' },
  { word: 'BLACKHOLE', category: 'Astrophysics', clue: 'Region of spacetime where gravity is so strong that nothing, no particles or light, can escape' },
  { word: 'ENTROPY', category: 'Thermodynamics', clue: 'A thermodynamic quantity representing the unavailability of a system\'s thermal energy' },
  { word: 'TELESCOPE', category: 'Instruments', clue: 'An optical instrument designed to make distant celestial objects appear nearer' },
  { word: 'SINGULARITY', category: 'Astrophysics', clue: 'A condition in spacetime where gravitational force is predicted to become infinite' }
];

export default function CosmicWordGame({ onExit, onAddScore, initialLevel = 1 }) {
  const [level, setLevel] = useState(initialLevel);
  const [targetWord, setTargetWord] = useState('');
  const [clue, setClue] = useState('');
  const [category, setCategory] = useState('');
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [assembledLetters, setAssembledLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [hintText, setHintText] = useState(null);

  const difficulty = getLevelDifficulty(level);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  // Initialize word based on level
  const initWord = (lvl) => {
    let pool = COSMIC_WORDS;
    if (difficulty === 'EASY') {
      pool = COSMIC_WORDS.filter((w) => w.word.length <= 5);
    } else if (difficulty === 'MEDIUM') {
      pool = COSMIC_WORDS.filter((w) => w.word.length >= 6 && w.word.length <= 7);
    } else {
      pool = COSMIC_WORDS.filter((w) => w.word.length >= 7);
    }

    const item = pool[(lvl - 1) % pool.length];
    setTargetWord(item.word);
    setClue(item.clue);
    setCategory(item.category);

    const letters = item.word.split('').map((char, idx) => ({
      id: `${char}_${idx}_${Math.random()}`,
      char,
      used: false
    }));

    let scrambled = [...letters].sort(() => Math.random() - 0.5);
    if (scrambled.map((l) => l.char).join('') === item.word && scrambled.length > 2) {
      scrambled.reverse();
    }

    setScrambledLetters(scrambled);
    setAssembledLetters([]);
    setIsVictory(false);
    setHintText(null);
  };

  useEffect(() => {
    initWord(level);
  }, [level]);

  // Timer
  useEffect(() => {
    if (isVictory) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isVictory]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Keyboard typing support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isVictory) return;
      const key = e.key.toUpperCase();

      if (key === 'BACKSPACE') {
        handleBackspace();
      } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        const availableIndex = scrambledLetters.findIndex((l) => !l.used && l.char === key);
        if (availableIndex !== -1) {
          handlePickLetter(scrambledLetters[availableIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrambledLetters, assembledLetters, isVictory, targetWord]);

  const handlePickLetter = (letterId) => {
    if (isVictory) return;
    const itemIndex = scrambledLetters.findIndex((l) => l.id === letterId);
    if (itemIndex === -1 || scrambledLetters[itemIndex].used) return;

    sounds.playClick();

    const picked = scrambledLetters[itemIndex];
    const newScrambled = [...scrambledLetters];
    newScrambled[itemIndex] = { ...picked, used: true };

    const newAssembled = [...assembledLetters, { id: picked.id, char: picked.char }];
    setScrambledLetters(newScrambled);
    setAssembledLetters(newAssembled);

    if (newAssembled.length === targetWord.length) {
      const spelled = newAssembled.map((a) => a.char).join('');
      if (spelled === targetWord) {
        setIsVictory(true);
        sounds.playVictory();
        confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
        const points = (50 + targetWord.length * 15 + level * 5) * streak;
        setScore((s) => s + points);
        setStreak((st) => st + 1);
        onAddScore('word', points, streak, seconds);
      } else {
        sounds.playError();
      }
    }
  };

  const handleBackspace = () => {
    if (assembledLetters.length === 0 || isVictory) return;
    sounds.playClick();
    const last = assembledLetters[assembledLetters.length - 1];
    setAssembledLetters((prev) => prev.slice(0, prev.length - 1));

    setScrambledLetters((prev) =>
      prev.map((l) => (l.id === last.id ? { ...l, used: false } : l))
    );
  };

  const handleShuffle = () => {
    sounds.playClick();
    const unused = scrambledLetters.filter((l) => !l.used);
    const shuffledUnused = [...unused].sort(() => Math.random() - 0.5);

    let idx = 0;
    setScrambledLetters((prev) =>
      prev.map((l) => {
        if (!l.used) {
          const replacement = shuffledUnused[idx];
          idx++;
          return replacement;
        }
        return l;
      })
    );
  };

  const handleHint = () => {
    if (isVictory) return;
    sounds.playClick();
    setScore((s) => Math.max(0, s - 10));
    onAddScore('word', -10, streak, seconds);

    const currentLen = assembledLetters.length;
    if (currentLen < targetWord.length) {
      const nextChar = targetWord[currentLen];
      setHintText(`Next calibrated letter is [${nextChar}]. Clue: ${clue}`);
    } else {
      setHintText(`Clue: ${clue}`);
    }
  };

  return (
    <GameWrapper
      title="Cosmic Word Weaver"
      subtitle={`Level ${level} of 100 // Quantum Anagrams`}
      icon="🔤"
      score={score}
      streak={streak}
      time={formatTime(seconds)}
      level={level}
      onLevelChange={setLevel}
      onExit={onExit}
      onHint={handleHint}
      hintDisabled={isVictory}
      hintText={hintText}
    >
      <div className="p-6 md:p-8 rounded-3xl glass-panel cyber-hud border border-purple-500/40 max-w-xl mx-auto shadow-2xl relative text-center overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Info */}
        <div className="flex items-center justify-between mb-4 px-2 text-xs font-mono">
          <span className={`px-3 py-1 rounded-full border text-[11px] font-bold shadow-md ${diffCfg.bg} ${diffCfg.border} ${diffCfg.color}`}>
            {diffCfg.label}
          </span>
          <span className="text-purple-300 font-bold uppercase tracking-wider">
            DOMAIN: {category}
          </span>
          <span className="text-slate-400 font-mono">
            {targetWord.length} CHARACTERS
          </span>
        </div>

        {/* Clue Box */}
        <div className="p-4 rounded-2xl bg-black/60 border border-white/15 mb-6 shadow-inner">
          <span className="text-[10px] font-mono uppercase text-purple-400 tracking-widest block mb-1">
            ASTROPHYSICAL DEFINITION
          </span>
          <p className="text-xs sm:text-sm text-slate-100 font-space italic leading-relaxed">
            "{clue}"
          </p>
        </div>

        {/* Word Assembly Slots with animated glow */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {Array.from({ length: targetWord.length }).map((_, idx) => {
            const letter = assembledLetters[idx];
            return (
              <div
                key={idx}
                className={`w-12 h-15 sm:w-14 sm:h-18 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-black font-orbitron transition-all duration-200 ${
                  letter
                    ? isVictory
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 ring-4 ring-emerald-400/50 scale-108 shadow-xl shadow-emerald-950/70'
                      : 'bg-purple-950/80 border-purple-400 text-white shadow-lg ring-2 ring-purple-400/50 animate-pop-scale'
                    : 'bg-black/60 border-white/20 text-transparent border-dashed'
                }`}
              >
                {letter?.char || ''}
              </div>
            );
          })}
        </div>

        {/* Available Scrambled Letter Tiles */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-7">
          {scrambledLetters.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePickLetter(item.id)}
              disabled={item.used || isVictory}
              className={`w-13 h-15 sm:w-15 sm:h-17 rounded-2xl border-2 font-orbitron font-black text-2xl sm:text-3xl transition-all duration-150 active:scale-90 cursor-pointer ${
                item.used
                  ? 'opacity-20 border-white/5 bg-black/40 cursor-not-allowed scale-95'
                  : 'bg-white/10 hover:bg-purple-500/30 border-white/20 text-white hover:border-purple-400 shadow-xl hover:scale-105 hover:shadow-purple-500/30'
              }`}
            >
              {item.char}
            </button>
          ))}
        </div>

        {/* Action Controls (Backspace & Shuffle) */}
        {!isVictory && (
          <div className="flex items-center justify-center gap-3.5">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Shuffle className="w-4 h-4 text-cyan-400" />
              <span>Shuffle Tiles</span>
            </button>
            <button
              onClick={handleBackspace}
              disabled={assembledLetters.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/50 text-xs font-mono font-bold text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Delete className="w-4 h-4" />
              <span>Backspace</span>
            </button>
          </div>
        )}

        {/* Victory Level Clear Banner */}
        {isVictory && (
          <div className="mt-6 p-6 rounded-3xl bg-emerald-950/90 border-2 border-emerald-400 text-center animate-pop-scale w-full shadow-2xl shadow-emerald-950/60">
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-orbitron font-extrabold text-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>SYNTHESIZED: {targetWord}!</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1.5 mb-5 font-space">
              Decoded in {formatTime(seconds)}! +{50 + targetWord.length * 15 + level * 5} Cosmic Points!
            </p>
            <div className="flex items-center justify-center gap-3">
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
