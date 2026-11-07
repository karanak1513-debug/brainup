import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Trophy,
  Zap,
  Activity,
  Check,
  X,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  ArrowLeft,
  Radio,
  Clock,
  Sparkles,
  AlertTriangle,
  Crown,
  Trash2,
  Edit3,
  Sliders,
  Flame,
  Gamepad2,
  Layers,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../utils/soundFX';
import Avatar from './Avatar';

export default function AdminPanel({ currentUser, onReturnToHub }) {
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'users' | 'arenas' | 'audit'
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Filter & Search states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Direct Grant input
  const [directGrantEmail, setDirectGrantEmail] = useState('');
  const [isGranting, setIsGranting] = useState(false);

  // Announcement state
  const [announcementText, setAnnouncementText] = useState('');
  const [isUpdatingAnnouncement, setIsUpdatingAnnouncement] = useState(false);

  // Edit user score modal/state
  const [editingUser, setEditingUser] = useState(null);
  const [editScoreValue, setEditScoreValue] = useState(0);

  const actorEmail = currentUser?.email || 'anushkabhatt96@gmail.com';

  const showNotification = (msg, type = 'success') => {
    setActionFeedback({ msg, type });
    if (type === 'success') sounds.playSuccess();
    else sounds.playClick();
    setTimeout(() => setActionFeedback(null), 4500);
  };

  // Fetch all admin data
  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [resOverview, resUsers, resReqs] = await Promise.all([
        fetch(`/api/admin/overview?actor_email=${encodeURIComponent(actorEmail)}`),
        fetch(`/api/admin/users?actor_email=${encodeURIComponent(actorEmail)}`),
        fetch(`/api/admin/requests?actor_email=${encodeURIComponent(actorEmail)}`)
      ]);

      if (resOverview.ok) {
        const dataOverview = await resOverview.json();
        setOverview(dataOverview);
        setAnnouncementText(dataOverview.systemAnnouncement || '');
      }
      if (resUsers.ok) {
        const dataUsers = await resUsers.json();
        setUsersList(dataUsers);
      }
      if (resReqs.ok) {
        const dataReqs = await resReqs.json();
        setRequestsList(dataReqs.requests || []);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [actorEmail]);

  // Handle Review Request (Approve / Reject)
  const handleReviewRequest = async (requestId, action) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/admin/requests/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          reviewerEmail: actorEmail
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(
          action === 'APPROVE'
            ? `Admin clearance APPROVED for ${data.targetEmail}! They can now access the Admin Panel.`
            : `Access request DECLINED for ${data.targetEmail}.`
        );
        fetchAllAdminData();
      } else {
        showNotification(data.detail || 'Failed to review request', 'error');
      }
    } catch (err) {
      showNotification('Network error while processing review', 'error');
    }
  };

  // Handle Direct Grant
  const handleDirectGrant = async (e) => {
    e.preventDefault();
    if (!directGrantEmail.trim()) return;

    sounds.playClick();
    setIsGranting(true);
    try {
      const res = await fetch('/api/admin/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: directGrantEmail.trim(),
          actorEmail
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(`Admin status granted directly to ${directGrantEmail.trim()}`);
        setDirectGrantEmail('');
        fetchAllAdminData();
      } else {
        showNotification(data.detail || 'Failed to grant admin access', 'error');
      }
    } catch (err) {
      showNotification('Network error during admin grant', 'error');
    } finally {
      setIsGranting(false);
    }
  };

  // Handle Revoke Admin Access
  const handleRevokeAdmin = async (targetEmail) => {
    if (targetEmail.toLowerCase().trim() === 'anushkabhatt96@gmail.com') {
      showNotification('Cannot revoke access from the Multiverse Super Admin!', 'error');
      return;
    }

    if (!window.confirm(`Revoke admin privileges from ${targetEmail}?`)) return;

    sounds.playClick();
    try {
      const res = await fetch('/api/admin/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          actorEmail
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(`Admin privileges revoked from ${targetEmail}`);
        fetchAllAdminData();
      } else {
        showNotification(data.detail || 'Failed to revoke admin access', 'error');
      }
    } catch (err) {
      showNotification('Network error during revoke', 'error');
    }
  };

  // Handle Update User Score
  const handleSaveScore = async () => {
    if (!editingUser) return;
    sounds.playClick();
    try {
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          totalScore: parseInt(editScoreValue, 10),
          actorEmail
        })
      });

      if (res.ok) {
        showNotification(`Score updated for ${editingUser.name}`);
        setEditingUser(null);
        fetchAllAdminData();
      }
    } catch (err) {
      showNotification('Error updating score', 'error');
    }
  };

  // Handle Quick Score Boost (+100 IQ)
  const handleQuickBoost = async (user, amount = 100) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          totalScore: (user.totalScore || 0) + amount,
          actorEmail
        })
      });

      if (res.ok) {
        showNotification(`+${amount} IQ awarded to ${user.name}`);
        fetchAllAdminData();
      }
    } catch (err) {
      showNotification('Error boosting score', 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user) => {
    if (user.isSuperAdmin) {
      showNotification('Cannot delete the Multiverse Super Admin!', 'error');
      return;
    }

    if (!window.confirm(`Permanently remove ${user.name} (${user.email}) from the Multiverse?`)) return;

    sounds.playClick();
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          actorEmail
        })
      });

      if (res.ok) {
        showNotification(`User ${user.email} purged from database`);
        fetchAllAdminData();
      }
    } catch (err) {
      showNotification('Error purging user', 'error');
    }
  };

  // Handle Update Broadcast Announcement
  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    sounds.playClick();
    setIsUpdatingAnnouncement(true);
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcement: announcementText,
          actorEmail
        })
      });

      if (res.ok) {
        showNotification('Multiverse announcement broadcasted live across dimensions!');
        fetchAllAdminData();
      }
    } catch (err) {
      showNotification('Error updating announcement', 'error');
    } finally {
      setIsUpdatingAnnouncement(false);
    }
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
    if (roleFilter === 'ALL') return matchesSearch;
    if (roleFilter === 'SUPER_ADMIN') return matchesSearch && u.role === 'SUPER_ADMIN';
    if (roleFilter === 'ADMIN') return matchesSearch && (u.role === 'ADMIN' || u.isAdmin);
    if (roleFilter === 'USER') return matchesSearch && u.role === 'USER';
    return matchesSearch;
  });

  const pendingRequests = requestsList.filter((r) => r.status === 'PENDING');
  const approvedAdmins = overview?.approvedAdmins || ['anushkabhatt96@gmail.com'];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 animate-fade-in text-white font-space">
      {/* Action Notification Toast */}
      {actionFeedback && (
        <div
          className={`fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border transition-all animate-bounce ${
            actionFeedback.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {actionFeedback.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          ) : (
            <Check className="w-5 h-5 text-emerald-400" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{actionFeedback.msg}</span>
        </div>
      )}

      {/* 1. Admin Nexus Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl relative overflow-hidden mb-6">
        {/* Subtle Ambient Cosmic Gold Flare */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-[2px] shadow-lg shadow-amber-500/30 flex-shrink-0">
            <div className="w-full h-full bg-[#070714] rounded-[14px] flex items-center justify-center">
              <Crown className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black font-orbitron text-white tracking-wide">
                BrainUp Admin Nexus
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[11px] font-bold">
                OMNI-CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
              <span>Authorized Authority:</span>
              <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded-md">
                {currentUser?.email || 'anushkabhatt96@gmail.com'}
              </strong>
              {currentUser?.email?.toLowerCase() === 'anushkabhatt96@gmail.com' ? (
                <span className="text-amber-400 font-bold text-[11px]">★ Lead Super Admin</span>
              ) : (
                <span className="text-emerald-400 font-bold text-[11px]">✓ Verified Admin</span>
              )}
            </p>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              fetchAllAdminData();
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            title="Refresh Multiverse Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onReturnToHub();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold font-orbitron text-xs shadow-lg shadow-purple-500/30 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Game Hub</span>
          </button>
        </div>
      </div>

      {/* 2. Omniversal Overview Metrics Cards (4 Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Card 1: Total Explorers */}
        <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Explorers</span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white">
            {overview?.totalUsers || usersList.length || 0}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Across all 5 dimensions</span>
        </div>

        {/* Card 2: Total Omniversal IQ */}
        <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 hover:border-purple-400/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Multiverse Score</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-orbitron text-purple-300">
            {(overview?.totalMultiverseScore || 0).toLocaleString()} <span className="text-xs font-space text-purple-400">IQ</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Cumulative intellectual output</span>
        </div>

        {/* Card 3: Admin Authority */}
        <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 hover:border-amber-400/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Admin Cadre</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-orbitron text-amber-300">
            {approvedAdmins.length}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 truncate">
            Lead: anushkabhatt96@gmail.com
          </span>
        </div>

        {/* Card 4: Pending Access Requests */}
        <div
          onClick={() => setActiveTab('approvals')}
          className={`p-4 sm:p-5 rounded-2xl glass-card border transition-all cursor-pointer ${
            pendingRequests.length > 0
              ? 'border-amber-500/60 bg-amber-950/20 shadow-lg shadow-amber-500/20'
              : 'border-white/10 hover:border-slate-400/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Access Requests</span>
            <div
              className={`p-2 rounded-xl ${
                pendingRequests.length > 0
                  ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white flex items-center gap-2">
            {pendingRequests.length}
            {pendingRequests.length > 0 && (
              <span className="text-xs font-space font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                ACTION REQUIRED
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Pending approval from Lead Admin</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/15 mb-6 overflow-x-auto">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('approvals');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-orbitron text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'approvals'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Admin Approvals & Control</span>
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('users');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-orbitron text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Explorer Matrix ({usersList.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('arenas');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-orbitron text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'arenas'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Arena Telemetry (6 Games)</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('audit');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-orbitron text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Logs & Broadcast</span>
        </button>
      </div>

      {/* 4. Tab 1: Access Approvals & Admins Governance */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Policy Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 block font-orbitron mb-1">
                MULTIVERSE ACCESS CONTROL PROTOCOL
              </strong>
              Admin access is exclusively controlled. <strong className="text-white">anushkabhatt96@gmail.com</strong> is
              the permanent Lead Super Admin. Any other user who signs into BrainUp remains in the standard User Panel
              until accepted and approved by the admin below.
            </div>
          </div>

          {/* Pending Requests Queue */}
          <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-white/15">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="font-orbitron font-bold text-base text-white">
                  Incoming Clearance Requests
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {pendingRequests.length} request(s) awaiting review
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-black/30 border border-white/10">
                <ShieldCheck className="w-10 h-10 text-emerald-400/80 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300 font-space">
                  Zero pending access requests.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  All multiverse clearance queues are currently clear and synchronized.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 hover:border-amber-400/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={req.avatar}
                        name={req.name}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{req.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            PENDING CLEARANCE
                          </span>
                        </div>
                        <span className="text-xs font-mono text-cyan-300 block">{req.email}</span>
                        {req.reason && (
                          <p className="text-xs text-slate-300 mt-1 italic max-w-lg">
                            "{req.reason}"
                          </p>
                        )}
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Requested: {req.requestedAt}
                        </span>
                      </div>
                    </div>

                    {/* Decision Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleReviewRequest(req.id, 'APPROVE')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Grant Admin</span>
                      </button>

                      <button
                        onClick={() => handleReviewRequest(req.id, 'REJECT')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs transition-all active:scale-95"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Admin Cadre & Direct Grant */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Admins List (2 cols) */}
            <div className="lg:col-span-2 p-4 sm:p-6 rounded-3xl glass-panel border border-white/15">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-orbitron font-bold text-base text-white">
                    Active Multiverse Administrators
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {approvedAdmins.length} active
                </span>
              </div>

              <div className="space-y-2.5">
                {approvedAdmins.map((admEmail) => {
                  const isSuper = admEmail.toLowerCase().trim() === 'anushkabhatt96@gmail.com';
                  return (
                    <div
                      key={admEmail}
                      className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 border ${
                        isSuper
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : 'bg-black/30 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSuper
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {isSuper ? <Crown className="w-5 h-5" /> : <Shield className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">{admEmail}</span>
                            {isSuper ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                SUPER ADMIN (PERMANENT)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                ACCEPTED ADMIN
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {isSuper
                              ? 'Full multiversal authority • Cannot be modified or revoked'
                              : 'Admin view enabled via Lead Admin acceptance'}
                          </span>
                        </div>
                      </div>

                      {!isSuper && (
                        <button
                          onClick={() => handleRevokeAdmin(admEmail)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all active:scale-95"
                          title="Revoke Admin Access"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Grant by Email (1 col) */}
            <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-white/15 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-orbitron font-bold text-sm text-white">
                    Direct Admin Grant
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Directly grant admin view access to any explorer's email without requiring them to submit an access request.
                </p>

                <form onSubmit={handleDirectGrant} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      EXPLORER GOOGLE / EMAIL:
                    </label>
                    <input
                      type="email"
                      required
                      value={directGrantEmail}
                      onChange={(e) => setDirectGrantEmail(e.target.value)}
                      placeholder="e.g. explorer@multiverse.ai"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-space text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGranting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/30 transition-all active:scale-95 disabled:opacity-60"
                  >
                    {isGranting ? (
                      <span>Synchronizing Privileges...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Grant Admin Clearance</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-slate-400 font-mono">
                Clearance allows immediate viewing of the Admin Panel upon their next login.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Explorer Matrix (User Management) */}
      {activeTab === 'users' && (
        <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-white/15 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search explorers by call-sign or email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-space text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['ALL', 'SUPER_ADMIN', 'ADMIN', 'USER'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all ${
                    roleFilter === role
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs font-space border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                  <th className="py-3 px-4">Explorer</th>
                  <th className="py-3 px-4">Role & Clearance</th>
                  <th className="py-3 px-4">IQ Score</th>
                  <th className="py-3 px-4">Level & Rank</th>
                  <th className="py-3 px-4">Streak</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => {
                  const isSuper = user.email?.toLowerCase().trim() === 'anushkabhatt96@gmail.com';
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-white/5 transition-all ${
                        isSuper ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={user.avatar}
                            name={user.name}
                            size="sm"
                          />
                          <div>
                            <span className="font-bold text-white block text-xs">{user.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-[10px]">
                            <Crown className="w-3 h-3 text-amber-400" />
                            SUPER ADMIN
                          </span>
                        ) : user.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-[10px]">
                            <ShieldCheck className="w-3 h-3 text-cyan-400" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
                            EXPLORER
                          </span>
                        )}
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 font-orbitron font-bold text-white">
                        {user.totalScore || 0} <span className="text-amber-400 text-[10px]">IQ</span>
                      </td>

                      {/* Level & Rank */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200 block text-xs truncate max-w-[150px]">
                          {user.rank || 'Quantum Novice'}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400">
                          Tier {user.level || 1}
                        </span>
                      </td>

                      {/* Streak */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-orange-400 font-mono font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{user.highestStreak || 1}x</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickBoost(user, 100)}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold"
                            title="Quick +100 IQ"
                          >
                            +100 IQ
                          </button>

                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditScoreValue(user.totalScore || 0);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                            title="Edit User Score"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {!isSuper && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100"
                              title="Delete Explorer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Arena Intelligence (6 Game Analytics) */}
      {activeTab === 'arenas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'sudoku', name: 'Sudoku Blitz', face: 'Face 1', desc: '4x4 Matrix Logic Verification', color: 'from-cyan-500/20 to-blue-600/20', border: 'border-cyan-500/40' },
              { id: 'riddles', name: 'Cosmic Riddles', face: 'Face 2', desc: 'Astrophysical & Paradox Deduction', color: 'from-purple-500/20 to-indigo-600/20', border: 'border-purple-500/40' },
              { id: 'logic', name: 'Logic & Reasoning', face: 'Face 3', desc: 'Cognitive Sequence Pattern Deduction', color: 'from-amber-500/20 to-orange-600/20', border: 'border-amber-500/40' },
              { id: 'math', name: 'Rapid Math Sprint', face: 'Face 4', desc: '60s Arithmetic Under Cosmic Pressure', color: 'from-emerald-500/20 to-teal-600/20', border: 'border-emerald-500/40' },
              { id: 'arrow', name: 'Arrow Treasure Hunt', face: 'Face 5', desc: 'Spatial Vector Memory & Navigation', color: 'from-rose-500/20 to-pink-600/20', border: 'border-rose-500/40' },
              { id: 'memory', name: 'Quantum Memory Grid', face: 'Face 6', desc: 'Entanglement Pair Pattern Recall', color: 'from-violet-500/20 to-fuchsia-600/20', border: 'border-violet-500/40' }
            ].map((arena) => {
              const stats = overview?.gamesBreakdown?.[arena.id] || { played: 0, won: 0, score: 0 };
              const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
              return (
                <div
                  key={arena.id}
                  className={`p-5 rounded-3xl glass-panel border ${arena.border} bg-gradient-to-br ${arena.color}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-bold">
                      {arena.face}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono font-bold text-white">
                      100 LEVELS
                    </span>
                  </div>
                  <h4 className="font-orbitron font-extrabold text-lg text-white mb-1">
                    {arena.name}
                  </h4>
                  <p className="text-xs text-slate-300 mb-4">{arena.desc}</p>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">PLAYED</span>
                      <strong className="text-sm font-bold text-white">{stats.played}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">WIN RATE</span>
                      <strong className="text-sm font-bold text-emerald-300">{winRate}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">TOTAL IQ</span>
                      <strong className="text-sm font-bold text-amber-300">{stats.score}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Tab 4: Audit Telemetry & Live Broadcast */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Broadcast Composer (1 col) */}
          <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-white/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="font-orbitron font-bold text-sm text-white">
                  Multiverse Broadcast Ticker
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Broadcast an official announcement banner directly to all explorers currently calibrated in the Multiverse.
              </p>

              <form onSubmit={handleUpdateAnnouncement} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    CURRENT ANNOUNCEMENT:
                  </label>
                  <textarea
                    rows={4}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter broadcast alert..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-space text-xs focus:outline-none focus:border-rose-400 placeholder:text-slate-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingAnnouncement}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-60"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Update Broadcast Banner</span>
                </button>
              </form>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-300">
              Preview: "{announcementText}"
            </div>
          </div>

          {/* Audit Logs Chronological Feed (2 cols) */}
          <div className="lg:col-span-2 p-4 sm:p-6 rounded-3xl glass-panel border border-white/15">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-orbitron font-bold text-base text-white">
                  Chronological Audit Telemetry
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Latest security and role actions
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {(overview?.recentAuditLogs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {log.action}
                      </span>
                      <span className="font-bold text-white text-xs">{log.actor}</span>
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Score Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm p-6 rounded-3xl glass-panel border border-purple-500/40 shadow-2xl">
            <h3 className="text-lg font-orbitron font-bold text-white mb-2">
              Recalibrate Score
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Updating score for <strong className="text-white">{editingUser.name}</strong> ({editingUser.email}).
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                NEW TOTAL IQ SCORE:
              </label>
              <input
                type="number"
                min="0"
                value={editScoreValue}
                onChange={(e) => setEditScoreValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white font-orbitron font-bold text-base focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScore}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30"
              >
                Save Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
