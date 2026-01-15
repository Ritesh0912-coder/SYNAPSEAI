"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Link as LinkIcon, Mail, User, Shield,
    Copy, Check, Send, Trash2, RotateCcw,
    Users, Clock, AlertCircle, Info, Loader2
} from "lucide-react";

interface Member {
    userId: string;
    userName: string;
    role: 'admin' | 'member' | 'viewer';
    joinedAt: string;
}

interface Invite {
    token: string;
    method: 'link' | 'email' | 'username';
    recipient?: string;
    role: string;
    status: string;
    invitedBy: string;
    expiresAt: string;
    isActive: boolean;
}

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
    defaultTab?: 'link' | 'email' | 'username' | 'tracking' | 'members';
}

export default function InviteModal({ isOpen, onClose, groupId, groupName, defaultTab }: InviteModalProps) {
    const [activeTab, setActiveTab] = useState<'link' | 'email' | 'username' | 'tracking' | 'members'>(defaultTab || 'link');
    const [role, setRole] = useState<'member' | 'admin' | 'viewer'>('member');
    const [expiresDays, setExpiresDays] = useState(7);
    const [emails, setEmails] = useState("");
    const [username, setUsername] = useState("");
    const [personalMessage, setPersonalMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [copied, setCopied] = useState(false);
    const [generatedLink, setGeneratedLink] = useState("");
    const [adminEmail, setAdminEmail] = useState("");

    // Autocomplete State
    const [searchResults, setSearchResults] = useState<{ _id: string, name: string, email: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(async () => {
            if (activeTab === 'username' && username.length >= 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/users/search?q=${encodeURIComponent(username)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(data);
                        setShowDropdown(true);
                    }
                } catch (e) {
                    console.error("Search error:", e);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [username, activeTab]);

    const selectUser = (user: { name: string, email: string }) => {
        // We set the name in the UI, but we'll send the email to the backend for accuracy
        setUsername(user.email);
        setShowDropdown(false);
    };

    useEffect(() => {
        if (isOpen && groupId) {
            fetchInvites();
            fetchMembers();
            if (defaultTab) setActiveTab(defaultTab);
        }
    }, [isOpen, groupId, defaultTab]);

    const fetchInvites = async () => {
        try {
            const res = await fetch(`/api/groups/${groupId}/invites`);
            if (res.ok) {
                const data = await res.json();
                setInvites(data);
            }
        } catch (error) {
            console.error("Error fetching invites:", error);
        }
    };

    const fetchMembers = async () => {
        try {
            // Re-using the existing groups API or current group context would be better,
            // but for simplicity, we can fetch all groups and find current
            const res = await fetch(`/api/groups`);
            if (res.ok) {
                const data = await res.json();
                const currentGroup = data.find((g: any) => g._id === groupId);
                if (currentGroup) {
                    setMembers(currentGroup.members);
                    setAdminEmail(currentGroup.createdBy);
                }
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    const handleGenerateLink = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/groups/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId,
                    method: 'link',
                    role,
                    expiresDays
                })
            });
            const data = await res.json();
            if (res.ok) {
                setGeneratedLink(data.results[0].inviteLink);
                fetchInvites();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailInvites = async () => {
        if (!emails.trim()) return;
        setLoading(true);
        const emailList = emails.split(',').map(e => e.trim()).filter(e => e.includes('@'));

        try {
            const res = await fetch('/api/groups/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId,
                    method: 'email',
                    recipients: emailList,
                    personalMessage,
                    role,
                    expiresDays
                })
            });
            if (res.ok) {
                setEmails("");
                setPersonalMessage("");
                setActiveTab('tracking');
                fetchInvites();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInviteUsername = async () => {
        if (!username.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/groups/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId,
                    method: 'username',
                    recipients: [username],
                    role,
                    expiresDays
                })
            });
            if (res.ok) {
                setUsername("");
                setActiveTab('tracking');
                fetchInvites();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (token: string, action: 'cancel' | 'resend') => {
        try {
            const res = await fetch(`/api/groups/${groupId}/invites`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, action })
            });
            if (res.ok) {
                fetchInvites();
            }
        } catch (error) {
            console.error("Action Error:", error);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this member? They will lose all access to group intelligence.")) return;

        try {
            const res = await fetch(`/api/groups/${groupId}/members`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                fetchMembers();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to remove member");
            }
        } catch (error) {
            console.error("Remove Member Error:", error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,255,102,0.1)] relative flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">Group Intelligence</h3>
                        <p className="text-[10px] font-bold text-primary/60 tracking-widest uppercase mt-1">Invite Members to {groupName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 p-2 gap-2 bg-white/[0.02]">
                    {[
                        { id: 'link', icon: LinkIcon, label: 'Link' },
                        { id: 'email', icon: Mail, label: 'Gmail' },
                        { id: 'username', icon: User, label: 'Username' },
                        { id: 'tracking', icon: Clock, label: 'Tracking' },
                        { id: 'members', icon: Users, label: 'Members' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {activeTab === 'link' && (
                            <motion.div key="link" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Access Level</label>
                                    <div className="flex gap-2">
                                        {['viewer', 'member', 'admin'].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setRole(r as any)}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${role === r ? 'bg-primary/10 border-primary/30 text-white' : 'bg-transparent border-white/5 text-gray-500 hover:border-white/20'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-primary/80">
                                        <Shield className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Secure Transmission</span>
                                    </div>
                                    <p className="text-gray-400 text-[11px] leading-relaxed">
                                        Generating a secure, time-bound link. Anyone with this link can {role === 'admin' ? 'manage' : 'join'} the group.
                                    </p>

                                    {!generatedLink ? (
                                        <button
                                            onClick={handleGenerateLink}
                                            disabled={loading}
                                            className="w-full py-4 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                                            Generate Invite Link
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-[11px] font-mono text-primary truncate flex items-center">
                                                {generatedLink}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(generatedLink)}
                                                className="px-6 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copied ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'email' && (
                            <motion.div key="email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Recipient Emails (Gmail preferred)</label>
                                    <textarea
                                        placeholder="user1@gmail.com, user2@gmail.com..."
                                        value={emails}
                                        onChange={(e) => setEmails(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[13px] text-white focus:outline-none focus:border-primary/50 min-h-[100px] transition-colors"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Personal Message (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Join our elite business intelligence task force..."
                                        value={personalMessage}
                                        onChange={(e) => setPersonalMessage(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-[13px] text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={handleSendEmailInvites}
                                    disabled={loading || !emails.trim()}
                                    className="w-full py-4 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Send Branded Invites
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'username' && (
                            <motion.div key="username" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-4">
                                    {/* Role Selection for Username Invite */}
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Access Level</label>
                                    <div className="flex gap-2">
                                        {['viewer', 'member', 'admin'].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setRole(r as any)}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${role === r ? 'bg-primary/10 border-primary/30 text-white' : 'bg-transparent border-white/5 text-gray-500 hover:border-white/20'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>

                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Search by Name or Email</label>
                                    <div className="flex gap-2 relative">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Start typing name..."
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-[13px] text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                            {/* Autocomplete Dropdown */}
                                            {showDropdown && searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-primary/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[200] max-h-[300px] overflow-y-auto ring-1 ring-primary/20 backdrop-blur-xl">
                                                    <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">Identified Operatives</p>
                                                    </div>
                                                    {searchResults.map(user => (
                                                        <button
                                                            key={user._id}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                selectUser(user);
                                                            }}
                                                            className="w-full text-left p-4 hover:bg-primary/5 flex items-center justify-between group transition-colors border-b border-white/[0.03] last:border-0"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] border border-primary/20">
                                                                    {user.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user.name}</span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 font-mono group-hover:text-primary transition-colors">
                                                                {/* Mask Email: j***@gmail.com */}
                                                                {user.email.substring(0, 2)}***@{user.email.split('@')[1]}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleInviteUsername}
                                            disabled={loading || !username.trim()}
                                            className="px-8 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite"}
                                        </button>
                                    </div>
                                    {isSearching && <p className="text-[10px] text-gray-500 animate-pulse">Scanning user directive...</p>}
                                </div>
                                <div className="flex gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 items-center">
                                    <Info className="w-4 h-4 text-blue-400" />
                                    <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">
                                        Inviting as <span className="text-white underline">{role}</span>. They will receive an instant signal.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'tracking' && (
                            <motion.div key="tracking" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                {invites.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                        <Users className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-center">No active invites found in system</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {invites.map((invite) => (
                                            <div key={invite.token} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/inv hover:bg-white/[0.04] transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${invite.status === 'joined' ? 'bg-green-500/10 text-green-500' :
                                                        invite.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                                                        }`}>
                                                        {invite.method === 'email' ? <Mail className="w-5 h-5" /> : invite.method === 'username' ? <User className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-black uppercase tracking-widest text-white">
                                                                {invite.recipient || "Secret Link"}
                                                            </p>
                                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${invite.status === 'joined' ? 'bg-green-500/20 text-green-500' :
                                                                invite.status === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-500' :
                                                                    invite.status === 'cancelled' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                                                }`}>
                                                                {invite.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                                            {invite.role} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover/inv:opacity-100 transition-opacity">
                                                    {invite.status !== 'joined' && invite.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleAction(invite.token, 'cancel')}
                                                            className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all rounded-lg"
                                                            title="Cancel Invite"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {(invite.status === 'cancelled' || invite.status === 'expired') && (
                                                        <button
                                                            onClick={() => handleAction(invite.token, 'resend')}
                                                            className="p-2 hover:bg-primary/10 text-gray-500 hover:text-primary transition-all rounded-lg"
                                                            title="Resend Invite"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'members' && (
                            <motion.div key="members" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Joined Intelligence Assets</label>
                                    <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">{members.length} Users</span>
                                </div>

                                <div className="space-y-3">
                                    {members.map((member) => (
                                        <div key={member.userId} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/mem hover:bg-white/[0.04] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 font-black text-sm uppercase">
                                                    {member.userName?.substring(0, 2) || "U"}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-black uppercase tracking-widest text-white">
                                                            {member.userName}
                                                        </p>
                                                        {member.userId === adminEmail && (
                                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">Creator</span>
                                                        )}
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${member.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>
                                                            {member.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {member.userId !== adminEmail && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    className="p-2 opacity-0 group-hover/mem:opacity-100 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all rounded-lg"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Info */}
                <div className="p-6 bg-white/[0.02] border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-primary" />
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            End-to-end encrypted neural handshake.
                            <span className="text-primary/60 ml-1">Admin oversight active.</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
