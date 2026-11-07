import React, { useState } from 'react';
import { X, Shield, Clock, CheckCircle2, AlertCircle, Send, Sparkles } from 'lucide-react';
import Avatar from './Avatar';
import { sounds } from '../utils/soundFX';

export default function AdminRequestModal({
  isOpen,
  onClose,
  userProfile,
  onStatusUpdated
}) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const currentStatus = userProfile?.adminRequestStatus || 'NOT_REQUESTED';
  const isAdmin = userProfile?.isAdmin;

  const handleSubmitRequest = async () => {
    sounds.playClick();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile?.id || 'user',
          email: userProfile?.email || 'user@multiverse.ai',
          name: userProfile?.name || 'Explorer',
          reason: reason || 'Requesting admin clearance to view the Multiverse Admin Panel.'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        sounds.playSuccess();
        if (onStatusUpdated) {
          onStatusUpdated(data.status || 'PENDING');
        }
      } else {
        setFeedback({ type: 'error', message: data.detail || 'Failed to submit request.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error communicating with Multiverse core.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Ambient Top Amber Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

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
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono font-semibold text-amber-300 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>MULTIVERSE ACCESS RESTRICTION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white tracking-wide">
            Admin Clearance Protocol
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
            The Multiverse Administration Nexus is strictly controlled. Clearance is granted exclusively with approval from the Lead Administrator:
          </p>
          <div className="inline-block mt-2 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold">
            👑 anushkabhatt96@gmail.com
          </div>
        </div>

        {/* User Identity Card */}
        <div className="mb-5 p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
          <Avatar
            src={userProfile?.avatar}
            name={userProfile?.name}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white truncate">{userProfile?.name}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {userProfile?.role || 'EXPLORER'}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400 block truncate">{userProfile?.email}</span>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="mb-5 p-3.5 rounded-2xl border text-xs font-space flex items-start gap-3 bg-slate-900/60 border-slate-700/80">
          {isAdmin ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300 block">Admin Clearance Verified</span>
                <span className="text-slate-400 text-[11px]">
                  You already hold full administrative permissions to access the Admin Panel.
                </span>
              </div>
            </>
          ) : currentStatus === 'PENDING' ? (
            <>
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-amber-300 block">Clearance Request Pending</span>
                <span className="text-slate-400 text-[11px]">
                  Your request has been dispatched and is currently awaiting acceptance by <strong className="text-white">anushkabhatt96@gmail.com</strong>.
                </span>
              </div>
            </>
          ) : currentStatus === 'REJECTED' ? (
            <>
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300 block">Previous Request Declined</span>
                <span className="text-slate-400 text-[11px]">
                  Your previous clearance request was declined. You may submit an appeal note below.
                </span>
              </div>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-300 block">Admin Access Not Granted</span>
                <span className="text-slate-400 text-[11px]">
                  You are currently in Explorer mode. Requesting admin will notify <strong className="text-white">anushkabhatt96@gmail.com</strong> for approval.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Request Input Form */}
        {!isAdmin && currentStatus !== 'PENDING' && (
          <div className="mb-5">
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              REASON FOR ADMIN CLEARANCE:
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need access to user management, game stats, and multiverse settings..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-space text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600 resize-none"
            />
          </div>
        )}

        {/* Feedback message */}
        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-space flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold font-space text-xs transition-all"
          >
            Close
          </button>

          {!isAdmin && currentStatus !== 'PENDING' && (
            <button
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold font-space text-xs shadow-lg shadow-amber-500/25 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request to Admin</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
