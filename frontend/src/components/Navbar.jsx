import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Trophy,
  UserPlus,
  Orbit,
  Crown,
  Shield,
  Gamepad2,
  LogOut,
  ChevronDown
} from 'lucide-react';
import DimensionSwitcher from './DimensionSwitcher';
import Avatar from './Avatar';
import { sounds } from '../utils/soundFX';

export default function Navbar({
  userProfile,
  currentDimension,
  onSelectDimension,
  onOpenScoreboard,
  onOpenInvite,
  onOpenAuth,
  isLoggedIn,
  currentView,
  onToggleAdminView,
  onRequestAdmin,
  onLogout
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
    if (next) sounds.playClick();
  };

  const isSuperAdmin = userProfile?.email?.toLowerCase().trim() === 'anushkabhatt96@gmail.com';
  const isAdmin = userProfile?.isAdmin || isSuperAdmin;
  const isInAdminView = currentView === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-2 sm:p-3 rounded-2xl glass-panel border border-white/15 shadow-xl">
        {/* Brand Logo */}
        <div
          onClick={() => {
            sounds.playClick();
            if (isInAdminView && onToggleAdminView) {
              onToggleAdminView();
            }
          }}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center p-[2px] shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-[#070714] rounded-[10px] flex items-center justify-center">
              <Orbit className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-spin" style={{ animationDuration: '14s' }} />
            </div>
          </div>
          <div className="text-left">
            <span className="font-orbitron font-black text-base sm:text-xl tracking-wider text-white flex items-center gap-1">
              Brain<span className="text-purple-400">Up</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
              Multiverse IQ Hub
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Dimension Switcher */}
          <DimensionSwitcher
            currentDimension={currentDimension}
            onSelectDimension={onSelectDimension}
          />

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
              soundEnabled
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-slate-200'
                : 'bg-red-950/40 border-red-500/40 text-red-400'
            }`}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Admin / User Panel Toggle (if Admin) */}
          {isLoggedIn && isAdmin && (
            <button
              onClick={() => {
                sounds.playClick();
                if (onToggleAdminView) onToggleAdminView();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold font-orbitron text-[11px] sm:text-xs transition-all active:scale-95 shadow-md cursor-pointer ${
                isInAdminView
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/50 text-cyan-300'
                  : 'bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 hover:from-amber-500/40 hover:to-orange-500/40 border-amber-400/60 text-amber-300 ring-1 ring-amber-400/30'
              }`}
            >
              {isInAdminView ? (
                <>
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">User Hub</span>
                </>
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-extrabold tracking-wide hidden sm:inline">Admin</span>
                </>
              )}
            </button>
          )}

          {/* Request Admin Button (if regular user) */}
          {isLoggedIn && !isAdmin && (
            <button
              onClick={() => {
                sounds.playClick();
                if (onRequestAdmin) onRequestAdmin();
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs font-semibold text-amber-300 transition-all active:scale-95 cursor-pointer"
              title="Request Admin Access"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline font-space">
                {userProfile?.adminRequestStatus === 'PENDING' ? 'Pending...' : 'Req Admin'}
              </span>
            </button>
          )}

          {/* Scoreboard Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenScoreboard();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer"
            title="Open Leaderboard & Stats"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-space">Leaderboard</span>
          </button>

          {/* Invite Friends Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenInvite();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-semibold text-cyan-300 transition-all active:scale-95 shadow-md shadow-cyan-950/40 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-space">Invite</span>
          </button>

          {/* User Profile Badge & Dropdown */}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => {
                  sounds.playClick();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 p-1 pr-2 sm:pr-2.5 rounded-2xl bg-black/40 border transition-all cursor-pointer shadow-md select-none ${
                  isSuperAdmin
                    ? 'border-amber-400/80 ring-1 ring-amber-400/30'
                    : isAdmin
                    ? 'border-cyan-400/80'
                    : 'border-white/20 hover:border-purple-400/80'
                }`}
              >
                <Avatar
                  src={userProfile?.avatar}
                  name={userProfile?.name}
                  size="sm"
                />
                <div className="text-left hidden lg:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white leading-tight truncate max-w-[85px]">
                      {userProfile?.name}
                    </span>
                    {isSuperAdmin && <Crown className="w-3 h-3 text-amber-400" />}
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 block leading-tight">
                    {userProfile?.totalScore || 0} IQ
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl glass-panel border border-white/20 shadow-2xl z-50 animate-fade-in text-left">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 mb-2">
                    <Avatar
                      src={userProfile?.avatar}
                      name={userProfile?.name}
                      size="md"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className="font-space font-bold text-xs text-white truncate block">
                          {userProfile?.name}
                        </span>
                        {isSuperAdmin && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 truncate block">
                        {userProfile?.email}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono mb-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Score:</span>
                      <span className="font-bold text-amber-400">{userProfile?.totalScore || 0} IQ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Streak:</span>
                      <span className="font-bold text-cyan-400">{userProfile?.highestStreak || 1}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rank:</span>
                      <span className="font-bold text-purple-300 truncate max-w-[120px]">{userProfile?.rank || 'Explorer'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Identity / Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAuth();
              }}
              className="btn-cosmic px-3 sm:px-4 py-1.5 rounded-xl font-orbitron font-bold text-xs text-white shadow-md cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
