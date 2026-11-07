import React, { useState, useEffect } from 'react';
import CosmicCanvas from './components/CosmicCanvas';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import CubeDice from './components/CubeDice';
import AuthModal from './components/AuthModal';
import ScoreboardModal from './components/ScoreboardModal';
import InviteModal from './components/InviteModal';
import AdminPanel from './components/AdminPanel';
import AdminRequestModal from './components/AdminRequestModal';

// 6 Game Components
import SudokuGame from './components/games/SudokuGame';
import CosmicRiddlesGame from './components/games/CosmicRiddlesGame';
import LogicReasoningGame from './components/games/LogicReasoningGame';
import RapidMathGame from './components/games/RapidMathGame';
import ArrowTreasureGame from './components/games/ArrowTreasureGame';
import MemoryGridGame from './components/games/MemoryGridGame';

import { sounds } from './utils/soundFX';

export default function App() {
  const [currentDimension, setCurrentDimension] = useState('cosmos-violet');
  const [view, setView] = useState('landing'); // 'landing' | 'hub' | 'game' | 'admin'
  const [activeGameId, setActiveGameId] = useState(null);
  const [pendingGameId, setPendingGameId] = useState(null);
  const [isWarping, setIsWarping] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scoreboardModalOpen, setScoreboardModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [adminRequestModalOpen, setAdminRequestModalOpen] = useState(false);

  // Broadcast announcement
  const [systemAnnouncement, setSystemAnnouncement] = useState('');

  // User Profile
  const [userProfile, setUserProfile] = useState({
    id: 'explorer_default',
    name: 'Dr. Nova Vance',
    email: 'nova.vance@multiverse.ai',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NovaVance&backgroundColor=8b5cf6',
    role: 'USER',
    isAdmin: false,
    isSuperAdmin: false,
    adminRequestStatus: 'NOT_REQUESTED',
    rank: 'Level 1 Explorer',
    level: 1,
    totalScore: 100,
    currentStreak: 1,
    highestStreak: 1,
    gameStats: {
      sudoku: { played: 0, won: 0, score: 0 },
      riddles: { played: 0, won: 0, score: 0 },
      logic: { played: 0, won: 0, score: 0 },
      math: { played: 0, won: 0, score: 0 },
      arrow: { played: 0, won: 0, score: 0 },
      memory: { played: 0, won: 0, score: 0 }
    }
  });

  // Apply Dimension to HTML root for CSS variable cascading
  useEffect(() => {
    document.documentElement.setAttribute('data-dimension', currentDimension);
  }, [currentDimension]);

  // Load existing profile from backend if available
  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUserProfile(data);
          setIsLoggedIn(true);
          if (data.systemAnnouncement) {
            setSystemAnnouncement(data.systemAnnouncement);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Warp Animation & Transition to Hub
  const triggerHyperspaceWarp = (targetView = 'hub') => {
    setIsWarping(true);
    sounds.playWarp();
    setTimeout(() => {
      setView(targetView);
      setIsWarping(false);
    }, 1300);
  };

  // Begin button on Landing Screen (supports direct launch into an arena)
  const handleBegin = (targetGameId = null) => {
    if (!isLoggedIn) {
      setPendingGameId(targetGameId);
      setAuthModalOpen(true);
    } else if (targetGameId) {
      setActiveGameId(targetGameId);
      triggerHyperspaceWarp('game');
    } else {
      triggerHyperspaceWarp('hub');
    }
  };

  // Login completion
  const handleLoginSuccess = (profile) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
    setIsLoggedIn(true);
    setAuthModalOpen(false);
    if (profile.systemAnnouncement) {
      setSystemAnnouncement(profile.systemAnnouncement);
    }
    if (pendingGameId) {
      setActiveGameId(pendingGameId);
      setPendingGameId(null);
      triggerHyperspaceWarp('game');
    } else {
      triggerHyperspaceWarp('hub');
    }
  };

  // Switch between Admin Panel and User Panel
  const handleToggleAdminView = () => {
    if (view === 'admin') {
      setView('hub');
    } else {
      const isSuper = userProfile?.email?.toLowerCase().trim() === 'anushkabhatt96@gmail.com';
      if (userProfile?.isAdmin || isSuper) {
        setView('admin');
      } else {
        setAdminRequestModalOpen(true);
      }
    }
  };

  // Logout / Switch identity
  const handleLogout = () => {
    sounds.playClick();
    setIsLoggedIn(false);
    setUserProfile({
      id: 'guest',
      name: 'Cosmic Traveler',
      email: '',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest&backgroundColor=8b5cf6',
      role: 'USER',
      isAdmin: false,
      isSuperAdmin: false,
      adminRequestStatus: 'NOT_REQUESTED',
      rank: 'Uncalibrated Traveler',
      level: 1,
      totalScore: 0,
      currentStreak: 0,
      highestStreak: 0,
      gameStats: {
        sudoku: { played: 0, won: 0, score: 0 },
        riddles: { played: 0, won: 0, score: 0 },
        logic: { played: 0, won: 0, score: 0 },
        math: { played: 0, won: 0, score: 0 },
        arrow: { played: 0, won: 0, score: 0 },
        memory: { played: 0, won: 0, score: 0 }
      }
    });
    setView('landing');
    setAuthModalOpen(true);
  };

  // Select game from 3D Cube
  const handleSelectGame = (gameId) => {
    setActiveGameId(gameId);
    triggerHyperspaceWarp('game');
  };

  // Exit from game back to 3D Cube
  const handleExitGame = () => {
    setView('hub');
    setActiveGameId(null);
  };

  // Score update from any game
  const handleAddScore = async (gameId, points, streak, timeSeconds) => {
    // Optimistic UI update
    setUserProfile((prev) => {
      const newScore = Math.max(0, (prev.totalScore || 0) + points);
      const newStreak = Math.max(prev.highestStreak || 1, streak);
      const prevStats = prev.gameStats || {};
      const gameStat = prevStats[gameId] || { played: 0, won: 0, score: 0 };

      return {
        ...prev,
        totalScore: newScore,
        highestStreak: newStreak,
        gameStats: {
          ...prevStats,
          [gameId]: {
            ...gameStat,
            played: gameStat.played + 1,
            won: points > 0 ? gameStat.won + 1 : gameStat.won,
            score: gameStat.score + Math.max(0, points)
          }
        }
      };
    });

    // Send to Python backend
    try {
      await fetch('/api/score/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id || 'explorer_default',
          gameId,
          points,
          streak,
          timeSeconds,
          won: points > 0
        })
      });
    } catch (e) {
      console.log('Saved score locally in session');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* 1. Fullscreen Moving 3D Galaxy Canvas */}
      <CosmicCanvas dimension={currentDimension} isWarping={isWarping} />

      {/* 2. Top Navigation Bar */}
      <Navbar
        userProfile={userProfile}
        currentDimension={currentDimension}
        onSelectDimension={setCurrentDimension}
        onOpenScoreboard={() => setScoreboardModalOpen(true)}
        onOpenInvite={() => setInviteModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        isLoggedIn={isLoggedIn}
        currentView={view}
        onToggleAdminView={handleToggleAdminView}
        onRequestAdmin={() => setAdminRequestModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 3. Main Views */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-2 sm:px-4 py-4">
        {/* System Announcement Ticker */}
        {systemAnnouncement && view !== 'admin' && (
          <div className="w-full max-w-4xl mx-auto mb-3 px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-300 flex items-center justify-center gap-2 text-center animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
            <span className="truncate">{systemAnnouncement}</span>
          </div>
        )}

        {/* View 1: Landing Hero */}
        {view === 'landing' && (
          <LandingHero onBegin={handleBegin} />
        )}

        {/* View 2: User Panel / Game Hub */}
        {view === 'hub' && (
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center animate-fade-in px-2">
            {/* Hub Header & Navigation */}
            <div className="w-full flex items-center justify-between mb-2 px-2 sm:px-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  setView('landing');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md active:scale-95"
              >
                <span>←</span>
                <span>Orbit Home</span>
              </button>

              <div className="text-center">
                <span className="text-[10px] sm:text-xs font-mono tracking-widest text-cyan-400 uppercase">
                  QUANTUM DICE INTERFACE // 6 MIND ARENAS
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-orbitron text-white">
                  Choose Your Cognitive Dimension
                </h2>
              </div>

              <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Drag to Rotate Dice</span>
              </div>
            </div>

            {/* Interactive 3D Cube Dice */}
            <CubeDice
              dimension={currentDimension}
              onSelectGame={handleSelectGame}
              activeGameId={activeGameId}
            />
          </div>
        )}

        {/* View 3: Active Mini Game */}
        {view === 'game' && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            {activeGameId === 'sudoku' && (
              <SudokuGame onExit={handleExitGame} onAddScore={handleAddScore} />
            )}
            {activeGameId === 'riddles' && (
              <CosmicRiddlesGame onExit={handleExitGame} onAddScore={handleAddScore} />
            )}
            {activeGameId === 'logic' && (
              <LogicReasoningGame onExit={handleExitGame} onAddScore={handleAddScore} />
            )}
            {activeGameId === 'math' && (
              <RapidMathGame onExit={handleExitGame} onAddScore={handleAddScore} />
            )}
            {activeGameId === 'arrow' && (
              <ArrowTreasureGame onExit={handleExitGame} onAddScore={handleAddScore} />
            )}
            {activeGameId === 'memory' && (
              <MemoryGridGame onExit={handleExitGame} onAddScore={handleAddScore} />
            )}
          </div>
        )}

        {/* View 4: Admin Panel */}
        {view === 'admin' && (
          <AdminPanel
            currentUser={userProfile}
            onReturnToHub={() => setView('hub')}
          />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="relative z-10 w-full py-4 text-center border-t border-white/10 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>BrainUp Multiverse Engine v1.0 • Built with Three.js, React, Tailwind & Python</span>
          <span>Dimensional Status: <span className="text-emerald-400">Harmonized</span></span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <ScoreboardModal
        isOpen={scoreboardModalOpen}
        onClose={() => setScoreboardModalOpen(false)}
        userProfile={userProfile}
      />
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        userProfile={userProfile}
      />
      <AdminRequestModal
        isOpen={adminRequestModalOpen}
        onClose={() => setAdminRequestModalOpen(false)}
        userProfile={userProfile}
        onStatusUpdated={(newStatus) => {
          setUserProfile((p) => ({ ...p, adminRequestStatus: newStatus }));
        }}
      />
    </div>
  );
}
