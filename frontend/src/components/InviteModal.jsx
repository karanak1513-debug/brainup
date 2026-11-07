import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, MessageCircle, Send } from 'lucide-react';
import { sounds } from '../utils/soundFX';
import confetti from 'canvas-confetti';

export default function InviteModal({ isOpen, onClose, userProfile }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const refCode = (userProfile?.name || 'EXPLORER')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  const userScore = userProfile?.totalScore || 850;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://brainup-dusky.vercel.app';
  const inviteLink = `${baseUrl}?ref=${refCode}&score=${userScore}`;
  const challengeMessage = `⚡ I just achieved a ${userScore} IQ score in the BrainUp Multiverse! Think you have higher cognitive power? Test your mind here: ${inviteLink}`;

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    sounds.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(challengeMessage)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    sounds.playClick();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(challengeMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl overflow-hidden text-center">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-44 h-44 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-mono font-semibold text-cyan-300 mb-3">
          <Share2 className="w-3.5 h-3.5" />
          <span>QUANTUM SOCIAL LINK</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white">
          Invite Friends
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-5 font-space">
          Challenge friends to enter the Multiverse, compare IQ matrices, and earn +200 bonus quantum points!
        </p>

        {/* Referral Link Box */}
        <div className="p-3 rounded-2xl bg-black/60 border border-white/15 mb-4 flex items-center justify-between gap-2 shadow-inner">
          <span className="font-mono text-xs text-slate-300 truncate text-left flex-1 pl-1">
            {inviteLink}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-space text-xs transition-all active:scale-95 flex-shrink-0 cursor-pointer shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Share Shortcuts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 font-bold font-space text-xs transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleTwitter}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/50 text-sky-200 font-bold font-space text-xs transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>X / Twitter</span>
          </button>
        </div>

        {/* Bonus Footer */}
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Both players receive +200 IQ on calibration</span>
        </div>
      </div>
    </div>
  );
}
