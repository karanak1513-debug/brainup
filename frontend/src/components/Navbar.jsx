import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Trophy,
  UserPlus,
  Sparkles,
  Orbit,
  Crown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Gamepad2,
  LogOut,
  ChevronDown
} from 'lucide-react';
import DimensionSwitcher from './DimensionSwitcher';
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

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
    if (next) sounds.playClick();
  };

  const isSuperAdmin = userProfile?.email?.toLowerCase().trim() === 'anushkabhatt96@gmail.com';
  const isAdmin = userProfile?.isAdmin || isSuperAdmin;
  const isInAdminView = currentView === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full px-3 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-2.5 sm:p-3 rounded-2xl glass-panel border border-white/15 shadow-xl">
        {/* Brand Logo */}
        <div
          onClick={() => {
            sounds.playClick();
            if (isInAdminView && onToggleAdminView) {
              onToggleAdminView();
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center p-[2px] shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-[#070714] rounded-[10px] flex items-center justify-center">
              <Orbit className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '14s' }} />
            </div>
          </div>
          <div className="text-left">
            <span className="font-orbitron font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-1">
              Brain<span className="text-purple-400">Up</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
              Multiverse IQ Hub
            </span>
          </div>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dimension Switcher */}
          <DimensionSwitcher
            currentDimension={currentDimension}
            onSelectDimension={onSelectDimension}
          />

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-slate-200'
                : 'bg-red-950/40 border-red-500/40 text-red-400'
            }`}
            title={soundEnabled ? 'Mute Sci-Fi Audio' : 'Unmute Audio'}
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold font-orbitron text-xs transition-all active:scale-95 shadow-md ${
                isInAdminView
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/50 text-cyan-300 shadow-cyan-950/40'
                  : 'bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 hover:from-amber-500/40 hover:to-orange-500/40 border-amber-400/60 text-amber-300 shadow-amber-950/40 ring-1 ring-amber-400/30'
              }`}
            >
              {isInAdminView ? (
                <>
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">User Panel</span>
                </>
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-extrabold tracking-wide">Admin Panel</span>
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs font-semibold text-amber-300 transition-all active:scale-95"
              title="Request Admin Access from anushkabhatt96@gmail.com"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-space">
                {userProfile?.adminRequestStatus === 'PENDING' ? 'Admin Pending...' : 'Request Admin'}
              </span>
            </button>
          )}

          {/* Scoreboard Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenScoreboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all active:scale-95"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-semibold text-cyan-300 transition-all active:scale-95 shadow-md shadow-cyan-950/40"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-space">Invite</span>
          </button>

          {/* User Profile Badge & Dropdown */}
          {isLoggedIn ? (
            <div className="relative">
              <div
                onClick={() => {
                  sounds.playClick();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className={`flex items-center gap-2 p-1 pr-2.5 rounded-2xl bg-black/40 border transition-all cursor-pointer shadow-md ${
                  isSuperAdmin
                    ? 'border-amber-400/80 ring-1 ring-amber-400/30'
                    : isAdmin
                    ? 'border-cyan-400/80'
                    : 'border-white/20 hover:border-purple-400/80'
                }`}
              >
                <img
                  src={userProfile?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User&backgroundColor=8b5cf6'}
                  alt={userProfile?.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-white/20"
                />
                <div className="text-left hidden lg:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
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
                <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl glass-panel border border-white/20 shadow-2xl z-50 animate-fade-in text-xs font-space">
                  <div className="p-2.5 border-b border-white/10 mb-1">
                    <span className="font-bold text-white block truncate">{userProfile?.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">{userProfile?.email}</span>
                    <div className="mt-1">
                      {isSuperAdmin ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          👑 SUPER ADMIN
                        </span>
                      ) : isAdmin ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          ⚡ ACCEPTED ADMIN
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          EXPLORER
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setProfileDropdownOpen(false);
                        if (onToggleAdminView) onToggleAdminView();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-amber-300 font-semibold text-left"
                    >
                      {isInAdminView ? (
                        <>
                          <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Switch to User Panel</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>Switch to Admin Panel</span>
                        </>
                      )}
                    </button>
                  )}

                  {!isAdmin && (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setProfileDropdownOpen(false);
                        if (onRequestAdmin) onRequestAdmin();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-amber-300 font-semibold text-left"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Request Admin Clearance</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setProfileDropdownOpen(false);
                      onOpenScoreboard();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-slate-200 text-left"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>My IQ & Leaderboard</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setProfileDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-950/40 text-rose-300 text-left mt-1 border-t border-white/10"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out / Switch Identity</span>
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
              className="btn-cosmic px-4 py-1.5 rounded-xl font-orbitron font-bold text-xs"
            >
              LOGIN
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
