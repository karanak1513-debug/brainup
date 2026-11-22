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
  ChevronDown,
  Sparkles
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
    <header className="sticky top-0 z-40 w-full px-2 sm:px-6 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-2 sm:p-3 rounded-3xl glass-panel cyber-hud border border-white/20 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle scanline effect */}
        <div className="scanline-sweep" />

        {/* Brand Logo with animated orbital ring */}
        <div
          onClick={() => {
            sounds.playClick();
            if (isInAdminView && onToggleAdminView) {
              onToggleAdminView();
            }
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer flex-shrink-0 group"
        >
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-purple-500/40 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#070714] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Orbit className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
          </div>
          <div className="text-left">
            <span className="font-orbitron font-black text-lg sm:text-2xl tracking-wider text-white flex items-center gap-0.5">
              Brain<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Up</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-cyan-400 uppercase hidden sm:block">
              Multiverse IQ Platform
            </span>
          </div>
        </div>

        {/* Action Controls & Navigation Dock */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Dimension Switcher */}
          <DimensionSwitcher
            currentDimension={currentDimension}
            onSelectDimension={onSelectDimension}
          />

          {/* Sound Toggle with Animated Equalizer Bars */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border transition-all active:scale-95 cursor-pointer shadow-md ${
              soundEnabled
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-slate-200 hover:border-cyan-400'
                : 'bg-red-950/40 border-red-500/50 text-red-400'
            }`}
            title={soundEnabled ? 'Audio Active (Click to Mute)' : 'Audio Muted (Click to Unmute)'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                {/* 3 Animated Equalizer Bars */}
                <div className="hidden sm:flex items-end gap-0.5 h-3.5">
                  <span className="w-0.5 bg-cyan-400 rounded-full animate-pulse h-2" style={{ animationDuration: '0.6s' }} />
                  <span className="w-0.5 bg-purple-400 rounded-full animate-pulse h-3.5" style={{ animationDuration: '0.4s' }} />
                  <span className="w-0.5 bg-pink-400 rounded-full animate-pulse h-1.5" style={{ animationDuration: '0.7s' }} />
                </div>
              </>
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Leaderboard Trophy Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenScoreboard();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-950/30 hover:border-amber-400"
            title="Global IQ Leaderboard"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Top IQ</span>
          </button>

          {/* Referral / Teleport Invite Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenInvite();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-purple-950/30 hover:border-purple-400"
            title="Invite & Teleport Explorers"
          >
            <UserPlus className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Invite</span>
          </button>

          {/* Admin Panel Toggle (if authorized) */}
          {isAdmin && (
            <button
              onClick={() => {
                sounds.playClick();
                onToggleAdminView();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-md ${
                isInAdminView
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-cyan-500/40'
                  : 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-300'
              }`}
              title={isInAdminView ? 'Return to Mind Hub' : 'Open Admin Command'}
            >
              {isInAdminView ? <Gamepad2 className="w-4 h-4" /> : <Shield className="w-4 h-4 text-red-400" />}
              <span className="hidden md:inline">{isInAdminView ? 'Hub View' : 'Admin'}</span>
            </button>
          )}

          {/* User Profile / Auth Button */}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  sounds.playClick();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all active:scale-95 cursor-pointer"
              >
                <Avatar
                  src={userProfile?.avatar}
                  name={userProfile?.name}
                  size="sm"
                  className="ring-1 ring-purple-400/50"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-white leading-tight flex items-center gap-1 truncate max-w-[110px]">
                    {userProfile?.name}
                    {isSuperAdmin && <Crown className="w-3 h-3 text-amber-400 fill-current flex-shrink-0" />}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 leading-tight">
                    {userProfile?.totalScore || 0} PTS
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 p-3 rounded-3xl glass-panel border border-white/20 shadow-2xl z-50 animate-pop-scale flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10">
                    <Avatar src={userProfile?.avatar} name={userProfile?.name} size="md" />
                    <div className="overflow-hidden text-left">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {userProfile?.name}
                        {isSuperAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 fill-current flex-shrink-0" />}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {userProfile?.email || 'Quantum Explorer'}
                      </div>
                      <div className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold">
                        {userProfile?.rank || 'Level 1 Explorer'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                    <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30">
                      <span className="text-[10px] text-slate-400 block">TOTAL SCORE</span>
                      <span className="text-sm font-bold text-purple-300">{userProfile?.totalScore || 0}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
                      <span className="text-[10px] text-slate-400 block">BEST STREAK</span>
                      <span className="text-sm font-bold text-amber-300">{userProfile?.highestStreak || 1}x</span>
                    </div>
                  </div>

                  {/* Admin Switcher / Request inside dropdown */}
                  {!isAdmin && onRequestAdmin && (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setProfileDropdownOpen(false);
                        onRequestAdmin();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span>Request Admin Clearance</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Identity / Logout</span>
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
              className="btn-cosmic px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-orbitron font-bold tracking-wider cursor-pointer"
            >
              LOG IN
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
