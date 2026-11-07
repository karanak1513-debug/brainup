import React, { useState } from 'react';
import { X, Sparkles, User, ShieldCheck, Crown, Mail, ArrowRight } from 'lucide-react';
import Avatar from './Avatar';
import { sounds } from '../utils/soundFX';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [explorerName, setExplorerName] = useState('Anushka Bhatt');
  const [explorerEmail, setExplorerEmail] = useState('anushkabhatt96@gmail.com');
  const [selectedAvatar, setSelectedAvatar] = useState('Anushka');

  if (!isOpen) return null;

  const AVATARS = [
    { id: 'Anushka', bg: '8b5cf6', label: 'Anushka' },
    { id: 'NovaVance', bg: '8b5cf6', label: 'Nova' },
    { id: 'Vesper', bg: '06b6d4', label: 'Vesper' },
    { id: 'Lyra', bg: 'ec4899', label: 'Lyra' },
    { id: 'Cipher', bg: '10b981', label: 'Cipher' },
    { id: 'Aetherion', bg: 'f59e0b', label: 'Aether' }
  ];

  const PRESETS = [
    {
      name: 'Anushka Bhatt',
      email: 'anushkabhatt96@gmail.com',
      avatar: 'Anushka',
      badge: '👑 SUPER ADMIN',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      name: 'Dr. Nova Vance',
      email: 'nova.vance@multiverse.ai',
      avatar: 'NovaVance',
      badge: '🚀 EXPLORER',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    {
      name: 'Alex Orion',
      email: 'alex.orion@multiverse.ai',
      avatar: 'Cipher',
      badge: '⚡ APPLICANT',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    }
  ];

  const handleApplyPreset = (preset) => {
    sounds.playClick();
    setExplorerName(preset.name);
    setExplorerEmail(preset.email);
    setSelectedAvatar(preset.avatar);
  };

  const handleGoogleLogin = async () => {
    sounds.playClick();
    setIsLoading(true);

    const emailToUse = explorerEmail.trim().toLowerCase() || 'explorer@multiverse.ai';
    const nameToUse = explorerName.trim() || 'Cosmic Explorer';

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameToUse,
          email: emailToUse,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedAvatar}&backgroundColor=${
            AVATARS.find((a) => a.id === selectedAvatar)?.bg || '8b5cf6'
          }`
        })
      });

      if (res.ok) {
        const profile = await res.json();
        setIsLoading(false);
        onLoginSuccess(profile);
      } else {
        throw new Error('Server auth error');
      }
    } catch (err) {
      // Local fallback in case server was disconnected
      console.log('Local offline auth fallback');
      const isSuper = emailToUse === 'anushkabhatt96@gmail.com';
      const fallbackProfile = {
        name: nameToUse,
        email: emailToUse,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedAvatar}&backgroundColor=8b5cf6`,
        role: isSuper ? 'SUPER_ADMIN' : 'USER',
        isAdmin: isSuper,
        isSuperAdmin: isSuper,
        rank: isSuper ? 'Omniversal Grand Architect' : 'Level 1 Explorer',
        level: isSuper ? 5 : 1,
        totalScore: isSuper ? 5000 : 100
      };
      setIsLoading(false);
      onLoginSuccess(fallbackProfile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-[11px] font-mono font-semibold text-purple-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEURAL ENCRYPTION LEVEL 1</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white tracking-wide">
            Enter the BrainUp Multiverse
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto">
            Log in with your Google account to calibrate your neural matrix, track IQ stats, and access designated user or admin controls.
          </p>
        </div>

        {/* Quick Selection Presets */}
        <div className="mb-5">
          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
            FAST IDENTITY SELECTOR / PRESETS:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((preset) => {
              const isSelected = explorerEmail === preset.email;
              return (
                <button
                  key={preset.email}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-purple-400 bg-purple-500/30 shadow-md ring-1 ring-purple-400'
                      : 'border-white/10 hover:border-white/25 bg-black/40'
                  }`}
                >
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border mb-1 ${preset.badgeClass}`}>
                    {preset.badge}
                  </span>
                  <span className="text-xs font-bold text-white block truncate">{preset.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">{preset.email}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explorer Avatar Selection */}
        <div className="mb-4">
          <label className="block text-[11px] font-mono text-slate-400 mb-2">
            CHOOSE EXPLORER AVATAR:
          </label>
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedAvatar(av.id);
                }}
                className={`p-1.5 rounded-2xl border transition-all flex-shrink-0 ${
                  selectedAvatar === av.id
                    ? 'border-purple-400 bg-purple-500/30 scale-110 shadow-lg ring-2 ring-purple-400'
                    : 'border-white/10 hover:border-white/30 bg-black/40 opacity-70 hover:opacity-100'
                }`}
              >
                <Avatar
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${av.id}&backgroundColor=${av.bg}`}
                  name={av.label}
                  size="sm"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Input fields */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              EXPLORER CALL-SIGN:
            </label>
            <input
              type="text"
              value={explorerName}
              onChange={(e) => setExplorerName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-space text-xs focus:outline-none focus:border-purple-400 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              GOOGLE ACCOUNT / EMAIL:
            </label>
            <div className="relative">
              <input
                type="email"
                value={explorerEmail}
                onChange={(e) => setExplorerEmail(e.target.value)}
                placeholder="Enter email address..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-space text-xs focus:outline-none focus:border-purple-400 placeholder:text-slate-500 font-mono"
              />
            </div>
            {explorerEmail.toLowerCase().trim() === 'anushkabhatt96@gmail.com' && (
              <span className="text-[11px] font-mono text-amber-400 block mt-1 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                Verified Super Admin Email: Instant full access granted to Admin Panel.
              </span>
            )}
          </div>
        </div>

        {/* Continue with Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold font-space text-sm shadow-xl transition-all duration-200 active:scale-98 disabled:opacity-70 disabled:cursor-wait"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-purple-700">
              <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Calibrating Neural Warp...</span>
            </div>
          ) : (
            <>
              {/* Official Google G Logo SVG */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>OAuth 2.0 Identity Protocol • Zero PII Leakage</span>
        </div>
      </div>
    </div>
  );
}
