"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Shield, Plus, Loader2, Globe, Lock } from "lucide-react";

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState<'private' | 'public'>('private');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (!name.trim()) return;
        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type })
            });

            if (res.ok) {
                setName("");
                setType("private");
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create unit.");
            }
        } catch (err) {
            setError("Connection failure.");
        } finally {
            setLoading(false);
        }
    };

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
                        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Users className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white uppercase tracking-wide">Initialize Unit</h2>
                                    <p className="text-xs text-gray-500 font-mono">Create a new operational group</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex flex-col gap-6">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                                    {error}
                                </div>
                            )}

                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unit Designation</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. OMEGA PROTOCOL"
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                                />
                            </div>

                            {/* Type Selection */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setType('private')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'private' ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-black border-white/10 text-gray-500 hover:border-white/20'}`}
                                >
                                    <Lock className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Private</span>
                                </button>
                                <button
                                    onClick={() => setType('public')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'public' ? 'bg-green-500/20 border-green-500 text-white' : 'bg-black border-white/10 text-gray-500 hover:border-white/20'}`}
                                >
                                    <Globe className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Public</span>
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                            <button
                                onClick={handleCreate}
                                disabled={loading || !name.trim()}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2 text-white font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                <span>Initialize</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
