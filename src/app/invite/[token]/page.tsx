"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight, Loader2, AlertCircle, Clock } from 'lucide-react';

export default function InvitePage() {
    const { token } = useParams();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status_msg, setStatusMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [groupName, setGroupName] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            signIn(undefined, { callbackUrl: window.location.href });
        } else if (status === 'authenticated' && token) {
            handleJoin();
        }
    }, [status, token]);

    const handleJoin = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/groups/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await res.json();
            if (res.ok) {
                setGroupName(data.groupName);
                if (data.pending) {
                    setIsPending(true);
                    setStatusMsg(data.message);
                } else {
                    setStatusMsg(data.message);
                    // Redirect to chat after a brief delay
                    setTimeout(() => {
                        router.push(`/chat?groupId=${data.groupId}`);
                    }, 2000);
                }
            } else {
                setError(data.error || "Failed to join group.");
            }
        } catch (err) {
            console.error("Join Error:", err);
            setError("A system error occurred while joining.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-primary/30">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-[0_0_100px_rgba(0,255,102,0.1)] text-center relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                        {loading ? (
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        ) : error ? (
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        ) : isPending ? (
                            <Clock className="w-10 h-10 text-yellow-500" />
                        ) : (
                            <Image
                                src="/synapse-logo.png"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain"
                            />
                        )}
                    </div>

                    <h1 className="text-2xl font-black uppercase tracking-widest mb-2">
                        {loading ? "Decrypting Invite..." : error ? "Link Invariant Error" : isPending ? "Approval Required" : "Neural Link Established"}
                    </h1>

                    <p className="text-gray-400 text-sm mb-8">
                        {loading
                            ? "Connecting to the Synapse Network..."
                            : error
                                ? error
                                : status_msg || `You have successfully joined ${groupName || 'the group'}. Initializing group memory...`
                        }
                    </p>

                    {(error || isPending) && (
                        <button
                            onClick={() => router.push('/chat')}
                            className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                            {isPending ? "Back to Command Center" : "Return to Dashboard"} <ArrowRight className="w-4 h-4" />
                        </button>
                    )}

                    {!loading && !error && !isPending && (
                        <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-tighter animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            Redirecting...
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
