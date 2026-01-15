"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Trash2, Shield, AlertTriangle, Loader2, LogOut, Clock, Check, ChevronUp, ChevronDown } from "lucide-react";

interface Member {
    userId: string;
    userName: string;
    role: 'admin' | 'member' | 'viewer';
    joinedAt: string;
}

interface GroupSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: any; // Using any for partial group object
    currentUserId: string;
    onUpdate: () => void; // Refresh group data
    onGroupDeleted: () => void; // Handle deletion redirect
}

export default function GroupSettingsModal({ isOpen, onClose, group, currentUserId, onUpdate, onGroupDeleted }: GroupSettingsModalProps) {
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const isAdmin = group?.createdBy === currentUserId || group?.members?.find((m: any) => m.userId === currentUserId && m.role === 'admin');

    const handleRequest = async (userId: string, action: 'approve' | 'reject') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/groups/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: group._id, userId, action })
            });
            if (res.ok) {
                onUpdate();
            } else {
                alert(`Failed to ${action} request`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: 'admin' | 'member') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/groups/${group._id}/roles`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });
            if (res.ok) {
                onUpdate();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update role");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm(`Remove this operative from the unit?`)) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/groups/${group._id}/members`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                onUpdate();
            } else {
                alert("Failed to remove member");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/groups/${group._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                onGroupDeleted();
                onClose();
            } else {
                alert("Failed to delete unit");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setConfirmDelete(false);
        }
    };

    if (!group) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white uppercase tracking-wide">Unit Command</h2>
                                    <p className="text-xs text-gray-500 font-mono">Manage operatives and protocols</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Operatives List */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-3 h-3" /> Active Operatives
                                </h3>
                                <div className="space-y-2">
                                    {group.members?.map((member: Member) => (
                                        <div key={member.userId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700/50 text-gray-400'}`}>
                                                    {member.userName.substring(0, 1).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white flex items-center gap-2">
                                                        {member.userName}
                                                        {member.role === 'admin' && <Shield className="w-3 h-3 text-yellow-500" />}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-mono">{member.role} • {member.userId}</span>
                                                </div>
                                            </div>
                                            {isAdmin && member.userId !== currentUserId && (
                                                <div className="flex items-center gap-1">
                                                    {/* Role Management */}
                                                    {member.role === 'member' && (
                                                        <button
                                                            onClick={() => handleUpdateRole(member.userId, 'admin')}
                                                            disabled={loading}
                                                            className="p-2 text-yellow-500/50 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-all"
                                                            title="Promote to Admin"
                                                        >
                                                            <ChevronUp className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {member.role === 'admin' && (
                                                        <button
                                                            onClick={() => handleUpdateRole(member.userId, 'member')}
                                                            disabled={loading}
                                                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                            title="Demote to Member"
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleRemoveMember(member.userId)}
                                                        disabled={loading}
                                                        className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Remove Operative"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pending Requests */}
                            {isAdmin && group.pendingMembers && group.pendingMembers.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Pending Approvals
                                    </h3>
                                    <div className="space-y-2">
                                        {group.pendingMembers.map((member: Member) => (
                                            <div key={member.userId} className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center font-bold text-xs text-yellow-500">
                                                        {member.userName.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{member.userName}</span>
                                                        <span className="text-[10px] text-gray-500 font-mono">Requested Access</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleRequest(member.userId, 'approve')}
                                                        disabled={loading}
                                                        className="p-2 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequest(member.userId, 'reject')}
                                                        disabled={loading}
                                                        className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Danger Zone */}
                            {isAdmin && (
                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" /> Danger Zone
                                    </h3>
                                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Decommission Unit</h4>
                                            <p className="text-[10px] text-gray-500 mt-1">Irreversibly delete this unit and all its data.</p>
                                        </div>
                                        <button
                                            onClick={handleDeleteGroup}
                                            disabled={loading}
                                            className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${confirmDelete ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                                        >
                                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : confirmDelete ? "Confirm Deletion?" : "Delete Unit"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
