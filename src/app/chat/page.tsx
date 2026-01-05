"use client";

import { ArrowRight, MessageSquare, History, Settings, Plus, Bot, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import LightRays from "@/components/ui/LightRays";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function ChatPage() {
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatting) scrollToBottom();
    }, [messages, isChatting]);

    // Fetch history on load
    useEffect(() => {
        if (session?.user?.email) {
            fetchHistory();
        }
    }, [session]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/chats');
            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (res.ok) {
                    if (data.chats) setHistory(data.chats);
                } else {
                    console.error("History API Error:", data.error);
                }
            } else if (!res.ok) {
                throw new Error("Database link offline.");
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput("");
        setIsChatting(true);
        setIsLoading(true);

        // Optimistically add user message
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, chatId }),
            });

            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (res.ok) {
                    setMessages(data.messages);
                    setChatId(data.chatId);
                    fetchHistory(); // Refresh sidebar history
                } else {
                    alert(data.error || "Neural link failed.");
                }
            } else {
                throw new Error("System transmission offline.");
            }
        } catch (error: any) {
            console.error("Chat Error:", error);
            alert(error.message || "Critical failure.");
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setIsChatting(false);
        setMessages([]);
        setChatId(null);
    };

    const loadChat = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chat/${id}`);
            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (res.ok) {
                    setMessages(data.messages);
                    setChatId(data.chatId);
                    setIsChatting(true);
                } else {
                    throw new Error(data.error || "Neural log corrupted.");
                }
            } else {
                throw new Error("Neural link unreachable.");
            }
        } catch (error: any) {
            console.error("Load Chat Error:", error);
            alert(error.message || "System failure.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="h-screen bg-black text-white selection:bg-primary/30 overflow-hidden flex relative">
            {/* Neural Rail v4.0 - Premium Engineering */}
            <motion.div
                className="fixed left-0 top-0 h-full bg-[#050505] border-r border-white/10 z-50 flex flex-col group transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:w-80 w-20 backdrop-blur-3xl shadow-[20px_0_50px_-20px_rgba(0,0,0,0.5)]"
            >
                {/* Mathematical Center Rail Container */}
                <div className="flex flex-col h-full items-center py-8 overflow-hidden">

                    {/* Logo: Neural Centerpiece with Dynamic Glow */}
                    <Link href="/" className="w-full flex items-center justify-center group-hover:justify-start group-hover:px-6 transition-all mb-12 relative">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-[#0c0c0c] border border-white/10 group-hover:border-primary/50 transition-all duration-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,1)] flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Image
                                src="/omni-logo.png"
                                alt="OMNI"
                                width={30}
                                height={30}
                                className="object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 brightness-110"
                                priority
                            />
                            {/* Neural Pulse Edge */}
                            <div className="absolute inset-0 border border-primary/30 rounded-2xl animate-pulse group-hover:animate-none" />
                        </div>

                        <div className="ml-5 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-4 group-hover:translate-x-0 whitespace-nowrap hidden group-hover:block">
                            <h2 className="text-[18px] font-black uppercase tracking-[0.4em] text-white leading-none">
                                OMNI <span className="text-primary italic">AI</span>
                            </h2>
                            <p className="text-[7px] font-bold text-primary/60 tracking-[0.2em] uppercase mt-1">Back To Home</p>
                        </div>
                    </Link>

                    {/* Content Section: Precision Spacing */}
                    <div className="w-full flex-1 flex flex-col px-3 group-hover:px-6 gap-8 scrollbar-hide overflow-y-auto">

                        {/* Action: High-Tech "New Chat" */}
                        <button
                            onClick={startNewChat}
                            className="w-full h-14 rounded-2xl flex items-center justify-start transition-all duration-500 group/item relative overflow-hidden bg-white/[0.04] border border-white/10 shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 relative z-10">
                                <Plus className="w-7 h-7 text-primary group-hover/item:text-black transition-all duration-300 drop-shadow-[0_0_10px_rgba(0,255,102,0.6)]" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white group-hover/item:text-black opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap relative z-10">
                                New Chat
                            </span>
                        </button>

                        {/* Laser Divider */}
                        <div className="relative w-full h-[1px] flex items-center justify-center">
                            <div className="w-8 group-hover:w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700" />
                            <div className="absolute w-1 h-1 bg-primary rounded-full blur-[1px] group-hover:left-[90%] left-1/2 transition-all duration-1000 hidden group-hover:block" />
                        </div>

                        {/* Rail Items: Neural History */}
                        <div className="flex flex-col gap-3">
                            {history.length > 0 ? history.map((chat) => (
                                <button
                                    key={chat._id}
                                    onClick={() => loadChat(chat._id)}
                                    className={`w-full h-12 rounded-xl flex items-center justify-start transition-all group/item relative ${chatId === chat._id ? 'bg-white/[0.05] border-white/10' : 'hover:bg-white/[0.03] border-transparent'}`}
                                >
                                    <div className="w-14 h-12 flex items-center justify-center flex-shrink-0 relative z-10">
                                        <MessageSquare className={`w-6 h-6 transition-colors drop-shadow-[0_0_10px_rgba(0,255,102,0.4)] ${chatId === chat._id ? 'text-primary' : 'text-primary/50 group-hover/item:text-primary'}`} />
                                    </div>
                                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden relative z-10">
                                        <span className="text-[11px] font-medium text-gray-300 group-hover/item:text-white truncate">
                                            {chat.title}
                                        </span>
                                        <span className="text-[7px] uppercase tracking-tighter text-gray-600 font-bold">Encrypted Stream</span>
                                    </div>
                                    {chatId === chat._id && (
                                        <div className="absolute left-0 w-[2px] h-6 bg-primary rounded-full shadow-[0_0_10px_#00ff66]" />
                                    )}
                                </button>
                            )) : (
                                <div className="w-full py-8 flex flex-col items-center group-hover:items-start gap-5 text-primary/20">
                                    <div className="w-12 flex justify-center">
                                        <History className="w-8 h-8 opacity-40 animate-pulse" />
                                    </div>
                                    <span className="text-[10px] uppercase font-black tracking-[0.4em] opacity-0 group-hover:opacity-60 transition-all px-1 whitespace-nowrap">
                                        Zero-Logs Detected
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom: User Profile HUD Component */}
                    <div className="w-full px-3 group-hover:px-6 pt-8 mt-auto border-t border-white/[0.03] bg-gradient-to-t from-black to-transparent">
                        <div className="w-full group/user relative">
                            <div
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center justify-center group-hover:justify-start gap-4 h-16 rounded-2xl hover:bg-white/[0.03] transition-all duration-500 relative overflow-hidden cursor-pointer"
                            >
                                <div className="relative flex-shrink-0">
                                    {/* Scan Ring */}
                                    <div className="absolute -inset-2 border border-primary/0 group-hover/user:border-primary/20 rounded-full animate-[spin_4s_linear_infinite] transition-all" />
                                    <div className="relative w-11 h-11 rounded-full border-2 border-white/5 bg-[#0a0a0a] overflow-hidden flex items-center justify-center shadow-2xl group-hover/user:border-primary/40 transition-all ring-offset-2 ring-offset-black group-hover/user:ring-1 ring-primary/20">
                                        {session?.user?.image ? (
                                            <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover grayscale group-hover/user:grayscale-0 transition-all" />
                                        ) : (
                                            <User className="w-6 h-6 text-gray-500 group-hover/user:text-primary transition-colors" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-black shadow-[0_0_10px_#00ff66]" />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-700 flex-1 overflow-hidden text-left">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-white truncate leading-none mb-1">
                                        {session?.user?.name || "Neural Ghost"}
                                    </p>
                                    <div className="flex items-center gap-2">

                                        <div className="flex gap-0.5">
                                            {[1, 2, 3].map(i => <div key={i} className="w-[2px] h-[2px] bg-primary/40 rounded-full" />)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Overlay: HUD Style */}
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                        className="absolute bottom-20 left-0 w-64 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[60] p-1.5"
                                    >
                                        <div className="px-4 py-2 mb-2 border-b border-white/5">
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">System Commands</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-xl group/cmd"
                                        >
                                            <Settings className="w-4 h-4 group-hover/cmd:rotate-90 transition-transform" />
                                            Core Settings
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                signOut();
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all rounded-xl"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Terminate Session
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>


            <div className="flex-1 flex flex-col items-center relative overflow-hidden">
                {/* Navbar removed as per request */}

                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <LightRays
                        raysOrigin="top-center"
                        raysColor="#00ff66"
                        raysSpeed={1.2}
                        lightSpread={0.6}
                        rayLength={1.5}
                        followMouse={true}
                        mouseInfluence={0.05}
                        noiseAmount={0.05}
                        distortion={0.03}
                    />
                </div>

                {/* Content Area */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
                    <AnimatePresence mode="wait">
                        {!isChatting ? (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="flex flex-col items-center text-center max-w-4xl"
                            >
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-10 tracking-tight leading-tight uppercase">
                                    The Future of <span className="text-primary italic">Artificial</span><br />
                                    Intelligence in <span className="opacity-80">Systems</span>
                                </h1>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat-history"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full max-w-4xl flex-1 mt-24 mb-32 overflow-y-auto custom-scrollbar p-4 space-y-6"
                            >
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border transition-all ${msg.role === 'ai' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/10 text-white border-white/10'}`}>
                                            {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl border leading-relaxed text-[13px] max-w-[80%] ${msg.role === 'ai' ? 'bg-white/5 border-white/10 text-gray-300 rounded-tl-none' : 'bg-primary/10 border-primary/20 text-white rounded-tr-none'}`}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-4"
                                    >
                                        <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border bg-primary/20 text-primary border-primary/30 animate-pulse">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <div className="p-4 rounded-2xl border bg-white/5 border-white/10 text-gray-500 rounded-tl-none italic text-[12px]">
                                            OMNI is thinking...
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={chatEndRef} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Animated Chat Box */}
                    <div className={`w-full max-w-xl group ${isChatting ? 'absolute bottom-8' : 'relative'}`}>
                        <form onSubmit={handleSend} className="relative">
                            <div className="absolute -inset-1 bg-white/10 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-white rounded-full flex items-center p-1.5 shadow-2xl transition-all duration-300">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isLoading}
                                    placeholder={isLoading ? "Please wait..." : "Ask anything"}
                                    className="flex-1 bg-transparent px-6 py-3 text-black text-base focus:outline-none placeholder:text-gray-400 font-medium disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-10 h-10 rounded-full bg-black flex items-center justify-center group-hover:scale-105 transition-transform duration-300 disabled:opacity-50"
                                >
                                    <ArrowRight className="text-white w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Glows */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        </main >
    );
}
