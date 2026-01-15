"use client";



import CreateTeamModal from "@/components/CreateTeamModal";
import InviteModal from "@/components/InviteModal";
import GroupSettingsModal from "@/components/GroupSettingsModal";
import { Bot, UserPlus, ArrowRight, Loader2, AlertCircle, Clock, Bell, X, Users, Settings, LogOut, Copy, RotateCcw, History, MessageSquare, Plus, User, Trash2, MoreVertical, Shield, ImagePlus } from 'lucide-react';
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import LightRays from "@/components/ui/LightRays";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import TextDecode from "@/components/ui/TextDecode";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const businessHeadlines = [
    "Dominance Through Neural Intelligence",
    "Scale Your Empire With Apex Logic",
    "Architecting the Future of Global Trade",
    "Unleashing Superior Strategic Vision",
    "Precision Engineering for Every System"
];

export default function ChatPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState({
        persona: 'business', // 'business' | 'creative' | 'technical'
        encryption: true,
        highLowRes: 'high'
    });
    const [promptsRemaining, setPromptsRemaining] = useState(50);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ role: 'ai' | 'user' | 'tool', content: string, image?: string, senderName?: string, senderImage?: string }[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [placeholder, setPlaceholder] = useState("Ask anything");
    const [headline, setHeadline] = useState(businessHeadlines[0]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    // Group & Notification State
    const [groups, setGroups] = useState<any[]>([]);
    const [activeGroup, setActiveGroup] = useState<any>(null);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
    const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
    const [userNotifications, setUserNotifications] = useState<any[]>([]);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [groupHistories, setGroupHistories] = useState<Record<string, any[]>>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus on mount and when loading finishes
    useEffect(() => {
        if (!isLoading) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isLoading]);

    // Derived: Get current chat title
    const currentChatTitle = (() => {
        if (!chatId) return "New Strategic Session";
        if (activeGroup) {
            const groupHistory = groupHistories[activeGroup._id] || [];
            return groupHistory.find(c => c._id === chatId)?.title || "Unit Intelligence session";
        }
        return history.find(c => c._id === chatId)?.title || "Neural Transmission Session";
    })();

    // Derived state
    const unreadCount = userNotifications.filter(n => !n.read).length;
    const personalHistory = history.filter(chat => !chat.groupId);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Fetch Groups
    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups');
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
                // Set active group if in one or first one
                if (data.length > 0 && !activeGroup) {
                    // Logic to set default group could go here
                }
            }
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        }
    };

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setUserNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        if (session?.user?.email) {
            fetchNotifications();
            fetchGroups();
            fetchHistory(); // Default to personal
            // Poll every 30 seconds
            const interval = setInterval(() => {
                fetchNotifications();
                fetchGroups();
                fetchHistory();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const searchQualities = [
        "Analyze market disruption patterns",
        "Optimize neural business logic",
        "Identify apex strategic advantages",
        "Evaluate global trade scalability",
        "Bridge technical and corporate vision"
    ];

    useEffect(() => {
        const randomPlaceholder = searchQualities[Math.floor(Math.random() * searchQualities.length)];
        setPlaceholder(randomPlaceholder);
        const randomHeadline = businessHeadlines[Math.floor(Math.random() * businessHeadlines.length)];
        setHeadline(randomHeadline);
    }, []);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatting) scrollToBottom();
    }, [messages, isChatting]);


    // Cleanup: Remove the activeGroup refetch effect since group history is nested now
    /*
    useEffect(() => {
        if (session?.user?.email) {
            fetchHistory(activeGroup?._id);
        }
    }, [activeGroup, session]);
    */

    const fetchHistory = async () => {
        try {
            const url = '/api/chats';
            const res = await fetch(url);
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
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("Digital asset too heavy. Limit: 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleLeaveGroup = async () => {
        if (!activeGroup || !session?.user?.email) return;

        const isCreator = activeGroup.createdBy === session.user.email;
        if (isCreator) {
            alert("The unit creator cannot leave. Decommission the unit in settings instead.");
            return;
        }

        if (!confirm(`Are you sure you want to leave ${activeGroup.name}? Your access will be revoked.`)) return;

        try {
            const res = await fetch(`/api/groups/${activeGroup._id}/members`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.email })
            });

            if (res.ok) {
                setActiveGroup(null);
                setMessages([]);
                setIsChatting(false);
                fetchGroups();
                alert(`You have successfully exited "${activeGroup.name}".`);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to exit unit.");
            }
        } catch (error) {
            console.error("Leave Group Error:", error);
            alert("System failure during exit protocol.");
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (promptsRemaining <= 0) {
            setIsUpgradeModalOpen(true);
            return;
        }

        const userMsg = input;
        const userMsgImage = selectedImage; // Capture for signal preservation
        setInput("");
        setSelectedImage(null); // Immediate signal clearance
        setIsChatting(true);
        setIsLoading(true);

        // Decrement prompt count
        setPromptsRemaining(prev => Math.max(0, prev - 1));

        // Optimistically add user message
        setMessages(prev => [...prev, { role: 'user', content: userMsg, image: selectedImage || undefined }]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    chatId,
                    image: selectedImage, // Include the uploaded image
                    groupId: activeGroup?._id, // Pass groupId for shared attribution
                    settings: {
                        persona: settings.persona,
                        encryption: settings.encryption
                    }
                }),
            });



            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (res.ok) {
                    // Signal preservation: Ensure images aren't dropped if server is using cached schema
                    const mergedMessages = data.messages.map((m: any, idx: number) => {
                        if (m.role === 'user' && !m.image && idx === data.messages.length - 2) {
                            return { ...m, image: userMsgImage }; // userMsgImage is the captured optimistic image
                        }
                        return m;
                    });
                    setMessages(mergedMessages);
                    setChatId(data.chatId);
                    if (activeGroup) {
                        fetchGroupHistory(activeGroup._id); // Update nested unit logs
                    } else {
                        fetchHistory(); // Update personal sidebar history
                    }
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
        setActiveGroup(null); // Clear group when starting personal new chat
    };

    const handleGroupSelect = async (group: any) => {
        setActiveGroup(group);
        setIsChatting(true);
        setMessages([]);
        setChatId(null); // Fresh start for group chat
        setIsLoading(false);

        // Fetch this group's specific history for the dropdown
        fetchGroupHistory(group._id);
    };

    const fetchGroupHistory = async (groupId: string) => {
        try {
            const res = await fetch(`/api/chats?groupId=${groupId}`);
            if (res.ok) {
                const data = await res.json();
                setGroupHistories(prev => ({ ...prev, [groupId]: data.chats || [] }));
            }
        } catch (error) {
            console.error("Failed to fetch group history:", error);
        }
    };

    const toggleGroupHistory = (e: React.MouseEvent, groupId: string) => {
        e.stopPropagation();
        const newSet = new Set(expandedGroups);
        if (newSet.has(groupId)) {
            newSet.delete(groupId);
        } else {
            newSet.add(groupId);
            if (!groupHistories[groupId]) {
                fetchGroupHistory(groupId);
            }
        }
        setExpandedGroups(newSet);
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

    const deleteChat = async (e: React.MouseEvent, id: string, targetGroupId?: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this neural log?")) return;

        try {
            const res = await fetch(`/api/chat/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (chatId === id) {
                    startNewChat();
                }
                if (targetGroupId) {
                    fetchGroupHistory(targetGroupId);
                } else {
                    fetchHistory();
                }
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete chat.");
            }
        } catch (error) {
            console.error("Delete Chat Error:", error);
            alert("Critical system failure during deletion.");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const revertMessage = async (index: number) => {
        const messageToRevert = messages[index];
        if (messageToRevert.role !== 'user') return;

        const newMessages = messages.slice(0, index);
        setMessages(newMessages);
        setInput(messageToRevert.content);
        setIsChatting(true);

        if (chatId) {
            try {
                await fetch(`/api/chat/${chatId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: newMessages }),
                });
            } catch (error) {
                console.error("Failed to sync revert with backend:", error);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Digital asset too heavy. Limit: 5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <main className="h-screen bg-black text-white selection:bg-primary/30 flex relative overflow-hidden">
            <motion.div
                initial={false}
                animate={{ width: isSidebarCollapsed ? 80 : 320 }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 40,
                    mass: 0.8
                }}
                onMouseEnter={() => setIsSidebarCollapsed(false)}
                onMouseLeave={() => setIsSidebarCollapsed(true)}
                className="fixed left-0 top-0 h-full bg-[#050505] border-r border-white/10 z-50 flex flex-col backdrop-blur-3xl shadow-[20px_0_50px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Mathematical Center Rail Container */}
                <div className={`flex flex-col h-full items-center py-8 ${isSidebarCollapsed ? 'w-20' : 'w-80'}`}>

                    {/* Logo: Neural Centerpiece with Dynamic Glow */}
                    <Link href="/" className={`w-full flex items-center justify-center ${isSidebarCollapsed ? '' : 'px-6'} transition-all mb-12 relative`}>
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-[#0c0c0c] border border-white/10 transition-all duration-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,1)] flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Image
                                src="/synapse-logo.png"
                                alt="SYNAPSE AI"
                                width={32}
                                height={32}
                                className="object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 brightness-110"
                                priority
                            />
                            <div className="absolute inset-0 border border-primary/30 rounded-2xl animate-pulse" />
                        </div>

                        {!isSidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="ml-5 whitespace-nowrap flex flex-col"
                            >
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white leading-tight">SYNAPSE AI</h2>
                                <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-primary mt-1">Back To Home</span>
                            </motion.div>
                        )}
                    </Link>

                    {/* Content Section: Precision Spacing */}
                    <div className="w-full px-3 flex flex-col gap-6 flex-shrink-0">

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startNewChat}
                                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group overflow-hidden ${isSidebarCollapsed ? 'bg-primary' : 'bg-primary/10 hover:bg-primary border border-primary/20'}`}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <Plus className={`w-5 h-5 relative z-10 ${isSidebarCollapsed ? 'text-black' : 'text-primary group-hover:text-black'}`} />
                                {!isSidebarCollapsed && (
                                    <span className={`ml-3 text-[11px] font-black uppercase tracking-[0.2em] relative z-10 ${isSidebarCollapsed ? '' : 'text-primary group-hover:text-black'}`}>New Operation</span>
                                )}
                            </motion.button>

                            {/* Invite Button (Create Team) */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsCreateTeamOpen(true)}
                                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group overflow-hidden ${isSidebarCollapsed ? 'bg-blue-600' : 'bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20'}`}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <Users className={`w-5 h-5 relative z-10 ${isSidebarCollapsed ? 'text-white' : 'text-blue-500 group-hover:text-white'}`} />
                                {!isSidebarCollapsed && (
                                    <span className={`ml-3 text-[11px] font-black uppercase tracking-[0.2em] relative z-10 ${isSidebarCollapsed ? '' : 'text-blue-500 group-hover:text-white'}`}>Create Team</span>
                                )}
                            </motion.button>
                        </div>

                        {/* Groups List (My Units) */}
                        <div className="flex flex-col gap-2 mt-2">
                            {!isSidebarCollapsed && (
                                <div className="px-2 flex items-center justify-between">
                                    <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Active Units</h3>
                                    <span className="text-[9px] text-gray-600 font-mono">{groups.length}</span>
                                </div>
                            )}
                            <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto scrollbar-hide">
                                {groups.map((group) => (
                                    <div key={group._id} className="flex flex-col gap-1">
                                        <div
                                            onClick={() => handleGroupSelect(group)}
                                            className={`w-full flex items-center p-2 rounded-xl transition-all group/item cursor-pointer ${activeGroup?._id === group._id ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black border ${activeGroup?._id === group._id ? 'bg-blue-500 text-white border-blue-500' : 'bg-[#111] border-white/10 text-gray-400 group-hover/item:border-white/20 group-hover/item:text-white'}`}>
                                                {group.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            {!isSidebarCollapsed && (
                                                <div className="ml-3 flex flex-col items-start min-w-0 flex-1">
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider truncate max-w-[120px] ${activeGroup?._id === group._id ? 'text-white' : 'text-gray-400 group-hover/item:text-white'}`}>
                                                        {group.name}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <div className={`w-1 h-1 rounded-full ${activeGroup?._id === group._id ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                                                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tight">{group.type || 'Private'}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {!isSidebarCollapsed && (
                                                <button
                                                    onClick={(e) => toggleGroupHistory(e, group._id)}
                                                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${expandedGroups.has(group._id) ? 'text-blue-400' : 'text-gray-600'}`}
                                                >
                                                    <History className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Nested Group History */}
                                        <AnimatePresence>
                                            {!isSidebarCollapsed && expandedGroups.has(group._id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden ml-4 pl-4 border-l border-white/5 flex flex-col gap-1 mt-1"
                                                >
                                                    {groupHistories[group._id]?.length > 0 ? (
                                                        groupHistories[group._id].map((chat: any) => (
                                                            <div
                                                                key={chat._id}
                                                                className="group/nested-item relative"
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveGroup(group);
                                                                        loadChat(chat._id);
                                                                    }}
                                                                    className={`w-full text-left p-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all pr-8 ${chatId === chat._id ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <MessageSquare className="w-2.5 h-2.5 opacity-50" />
                                                                        <span className="truncate">{chat.title}</span>
                                                                    </div>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => deleteChat(e, chat._id, group._id)}
                                                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover/nested-item:opacity-100 transition-all"
                                                                    title="Delete mission log"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-[8px] text-gray-700 uppercase p-2">No past intel</p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                                {groups.length === 0 && !isSidebarCollapsed && (
                                    <div className="px-4 py-6 border border-dashed border-white/10 rounded-xl text-center">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">No active units</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={`w-full flex-1 flex flex-col px-3 ${isSidebarCollapsed ? '' : 'px-6'} gap-8 scrollbar-hide overflow-y-auto overflow-x-hidden`}>



                        {!isSidebarCollapsed && (
                            <div className="px-2 flex items-center justify-between mb-2">
                                <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                    Neural Records
                                </h3>
                                <span className="text-[9px] text-gray-600 font-mono">{history.length}</span>
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            {history.length > 0 ? history.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => {
                                        setActiveGroup(null); // Clear group context for personal chat
                                        loadChat(chat._id);
                                    }}
                                    className={`w-full h-12 rounded-xl flex items-center justify-start transition-all group/item relative cursor-pointer ${chatId === chat._id ? 'bg-white/[0.05] border-white/10' : 'hover:bg-white/[0.03] border-transparent'}`}
                                >
                                    <div className="w-14 h-12 flex items-center justify-center flex-shrink-0 relative z-10">
                                        <MessageSquare className={`w-6 h-6 transition-colors drop-shadow-[0_0_10px_rgba(0,255,102,0.4)] ${chatId === chat._id ? 'text-primary' : 'text-primary/50 group-hover/item:text-primary'}`} />
                                    </div>
                                    {!isSidebarCollapsed && (
                                        <div className="flex flex-col overflow-hidden relative z-10 flex-1">
                                            <span className="text-[11px] font-bold text-gray-300 group-hover/item:text-white truncate">
                                                {chat.title}
                                            </span>
                                        </div>
                                    )}
                                    {!isSidebarCollapsed && (
                                        <button
                                            onClick={(e) => deleteChat(e, chat._id)}
                                            className="p-2 hover:text-red-500 transition-all relative z-20 mr-2"
                                            title="Delete neural log"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {chatId === chat._id && (
                                        <div className="absolute left-0 w-[2px] h-6 bg-primary rounded-full shadow-[0_0_10px_#00ff66]" />
                                    )}
                                </div>
                            )) : (
                                <div className="w-full py-8 flex flex-col items-center group-hover:items-start gap-5 text-primary/20">
                                    <div className="w-12 flex justify-center">
                                        <History className="w-8 h-8 opacity-40" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                                            <div className="w-2 h-1 rounded-full bg-white/5" />
                                        </div>
                                    </div>
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
                                {!isSidebarCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="transition-all duration-700 flex-1 overflow-hidden text-left"
                                    >
                                        <p className="text-[11px] font-black uppercase tracking-widest text-white truncate leading-none mb-1">
                                            {session?.user?.name || "Neural Ghost"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3].map(i => <div key={i} className="w-[2px] h-[2px] bg-primary/40 rounded-full" />)}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
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
                                                setIsSettingsOpen(true);
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-xl group/cmd"
                                        >
                                            <Settings className="w-4 h-4 group-hover/cmd:rotate-90 transition-transform" />
                                            Core Settings
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMenuOpen(false);
                                                setIsNotificationsOpen(!isNotificationsOpen);
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-xl group/cmd relative"
                                        >
                                            <div className="relative">
                                                <Bell className="w-4 h-4 group-hover/cmd:animate-pulse transition-transform" />
                                                {unreadCount > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
                                                        <span className="text-[7px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                            Notifications
                                            {unreadCount > 0 && (
                                                <span className="ml-auto text-[8px] font-black text-red-400">
                                                    {unreadCount} NEW
                                                </span>
                                            )}
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


            <div className="flex-1 flex flex-col items-center relative overflow-hidden ml-20">

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

                {/* Group Header */}
                {
                    activeGroup && (
                        <div className="absolute top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-black border border-blue-500/30">
                                    {activeGroup.name ? activeGroup.name.substring(0, 2).toUpperCase() : 'UN'}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-white font-black uppercase tracking-widest text-sm">{currentChatTitle}</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{activeGroup.name}</span>
                                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                                        <button onClick={() => setIsMembersOpen(!isMembersOpen)} className="flex items-center gap-1 group/members">
                                            <span className="text-[9px] text-gray-500 font-mono group-hover/members:text-primary transition-colors">
                                                {activeGroup.members?.length || 1} OPERATIVES
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const currentUserRole = activeGroup.members?.find((m: any) => m.userId === session?.user?.email)?.role;
                                    const isAdminOrCreator = activeGroup.createdBy === session?.user?.email || currentUserRole === 'admin';

                                    return (
                                        <>
                                            {isAdminOrCreator ? (
                                                <>
                                                    <button
                                                        onClick={() => setIsInviteModalOpen(true)}
                                                        className="h-8 px-4 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                                    >
                                                        <UserPlus className="w-3 h-3" />
                                                        <span>Invite</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setIsGroupSettingsOpen(true)}
                                                        className="h-8 w-8 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={handleLeaveGroup}
                                                    className="h-8 px-4 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                                >
                                                    <LogOut className="w-3 h-3" />
                                                    <span>Exit Unit</span>
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )
                }

                {/* Personal Chat Header */}
                {
                    !activeGroup && isChatting && (
                        <div className="absolute top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-white font-black uppercase tracking-widest text-sm">{currentChatTitle}</h2>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Neural Link Transmission Active</span>
                                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Buttons removed per user request */}
                            </div>
                        </div>
                    )
                }

                {/* Content Area */}
                <div className={`relative z-10 w-full h-full flex flex-col items-center px-6 ${!isChatting ? 'justify-start pt-[20vh]' : ''}`}>
                    <AnimatePresence mode="wait">
                        {!isChatting ? (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="flex flex-col items-center text-center max-w-4xl mt-32"
                            >
                                <h1 className="text-xl md:text-2xl lg:text-3xl font-black mb-6 tracking-tight leading-tight uppercase text-white/90">
                                    {headline === "Dominance Through Neural Intelligence" ? (
                                        <>
                                            <span className="text-primary">Dominance</span> Through Neural Intelligence
                                        </>
                                    ) : headline === "Scale Your Empire With Apex Logic" ? (
                                        <>
                                            Scale Your <span className="text-primary">Empire</span> With Apex Logic
                                        </>
                                    ) : headline === "Architecting the Future of Global Trade" ? (
                                        <>
                                            Architecting the <span className="text-primary">Future</span> of Global Trade
                                        </>
                                    ) : headline === "Unleashing Superior Strategic Vision" ? (
                                        <>
                                            Unleashing Superior <span className="text-primary">Strategic</span> Vision
                                        </>
                                    ) : headline === "Precision Engineering for Every System" ? (
                                        <>
                                            Precision <span className="text-primary">Engineering</span> for Every System
                                        </>
                                    ) : (
                                        headline
                                    )}
                                </h1>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat-history"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full max-w-[95%] flex-1 overflow-y-auto scrollbar-hide px-6 pt-32 pb-64 space-y-10"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}
                            >
                                {messages.length === 0 && activeGroup && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-40 py-20">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                                            <Users className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Unit Synchronized</h3>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Initiate team transmission to begin collective analysis.</p>
                                    </div>
                                )}
                                {messages.filter(msg => {
                                    // Hide tool result messages UNLESS they are charts (which we render)
                                    if (msg.role === 'tool' && (msg as any).name !== 'show_stock_chart') return false;

                                    // Hide AI assistant messages that only have tool calls (the "intent" message) 
                                    // if it lacks content/image, as it results in an empty bubble.
                                    if (msg.role === 'ai' && !msg.content.trim() && !msg.image && (msg as any).tool_calls) return false;

                                    // Also hide generic empty AI messages
                                    if (msg.role === 'ai' && !msg.content.trim() && !msg.image && !(msg as any).tool_calls) return false;

                                    return true;
                                }).map((msg, i, filteredArray) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : (msg.role === 'ai' || msg.role === 'tool' ? -20 : 0) }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex gap-4 w-full ${msg.role === 'user' ? 'flex-row-reverse justify-start' : 'justify-start'}`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border transition-all overflow-hidden ${(msg.role === 'ai' || msg.role === 'tool') ? 'bg-[#0a0a0a] border-primary/30' : 'bg-[#0a0a0a] border-white/10'}`}>
                                            {(msg.role === 'ai' || msg.role === 'tool') ? (
                                                <img src="/ai-avatar.png" alt="AI" className="w-full h-full object-cover" />
                                            ) : (
                                                (() => {
                                                    const imgUrl = (msg as any).senderImage || (msg.role === 'user' ? session?.user?.image : null);
                                                    const hasFailed = failedImages.has(i);

                                                    if (imgUrl && !hasFailed) {
                                                        return (
                                                            <img
                                                                src={imgUrl}
                                                                alt={msg.senderName || 'User'}
                                                                className="w-full h-full object-cover grayscale-0"
                                                                onError={() => setFailedImages(prev => new Set(prev).add(i))}
                                                            />
                                                        );
                                                    }

                                                    // High-end Fallback: Initials
                                                    const initials = (msg.senderName || 'U').substring(0, 1).toUpperCase();
                                                    return (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 text-[10px] font-black text-primary">
                                                            {initials}
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </div>
                                        <div className={`p-5 rounded-3xl border leading-[1.8] text-[14px] md:text-[15px] max-w-[92%] relative group/msg shadow-2xl ${msg.role === 'ai' ? 'bg-white/[0.03] border-white/10 text-gray-300 rounded-tl-none' : 'bg-primary/10 border-primary/20 text-white rounded-tr-none'}`}>
                                            {/* Sender Name Branding */}
                                            {(activeGroup || msg.senderName || msg.role === 'tool') && (
                                                <div className={`absolute -top-6 ${msg.role === 'user' ? 'right-0' : 'left-0'} text-[10px] font-black uppercase tracking-[0.2em] ${(msg.role === 'ai' || msg.role === 'tool') ? 'text-primary/60' : 'text-gray-500'} whitespace-nowrap px-1`}>
                                                    {(msg.role === 'ai' || msg.role === 'tool') ? 'SYNAPSE AI' : (msg.senderName || 'Anonymous Participant')}
                                                </div>
                                            )}
                                            {msg.role === 'tool' && (msg as any).name === 'show_stock_chart' ? (() => {
                                                try {
                                                    const chartData = JSON.parse(msg.content);
                                                    return <TradingViewChart symbol={chartData.symbol} interval={chartData.interval} />;
                                                } catch (e) {
                                                    return <div className="text-red-500 text-[10px] font-mono">Chart Transmission Corrupted</div>;
                                                }
                                            })() : (
                                                <>
                                                    {msg.image && (
                                                        <div className="mb-4 relative group/neural-asset">
                                                            <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover/neural-asset:opacity-100 transition-opacity duration-700" />
                                                            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm group/frame">
                                                                <img src={msg.image} alt="Neural Visual Asset" className="w-full h-full object-cover grayscale-[0.3] group-hover/frame:grayscale-0 transition-all duration-700 scale-[1.02] group-hover/frame:scale-100" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                                                {/* Scanning Line Effect - Only active during processing of latest user message */}
                                                                {isLoading && i === filteredArray.length - 1 && (
                                                                    <>
                                                                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-primary/40 shadow-[0_0_10px_#00ff66] animate-[scan_3s_linear_infinite]" />
                                                                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                                            <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.2em]">Neural Signal Lock</span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {((msg as any).tool_calls && (msg as any).tool_calls[0]?.function?.name === 'show_stock_chart') ? (() => {
                                                        try {
                                                            const args = JSON.parse((msg as any).tool_calls[0].function.arguments);
                                                            return <TradingViewChart symbol={args.symbol} interval={args.interval} />;
                                                        } catch (e) {
                                                            return <div className="text-red-500 text-[10px] font-mono">Chart Transmission Corrupted</div>;
                                                        }
                                                    })() : (
                                                        <FormattedMessage content={msg.content} />
                                                    )}
                                                </>
                                            )}

                                            {/* Action Buttons */}
                                            <div className={`absolute -bottom-6 flex gap-2 transition-opacity duration-300 opacity-0 group-hover/msg:opacity-100 ${msg.role === 'user' ? 'left-0' : 'right-0'}`}>
                                                {msg.role === 'ai' ? (
                                                    <button
                                                        onClick={() => copyToClipboard(msg.content)}
                                                        className="p-1 hover:text-primary transition-colors text-gray-500"
                                                        title="Copy message"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => copyToClipboard(msg.content)}
                                                            className="p-1 hover:text-primary transition-colors text-gray-500"
                                                            title="Copy message"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => revertMessage(i)}
                                                            className="p-1 hover:text-primary transition-colors text-gray-500"
                                                            title="Revert and Edit"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-4"
                                    >
                                        <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border bg-[#0a0a0a] border-primary/30 animate-pulse overflow-hidden">
                                            <img src="/ai-avatar.png" alt="AI" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4 rounded-2xl border bg-white/5 border-white/10 text-gray-500 rounded-tl-none italic text-[12px]">
                                            SYNAPSE AI is thinking...
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={chatEndRef} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Command Center: Strategic Input */}
                    <motion.div
                        layout
                        initial={false}
                        className={`w-full max-w-3xl group z-50 fixed left-1/2 -translate-x-1/2 px-6 transition-all duration-1000 ease-in-out ${isChatting ? 'bottom-10 translate-y-0' : 'top-[58%] -translate-y-1/2'}`}
                    >
                        <form
                            onSubmit={handleSend}
                            className="relative"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {/* Image Preview Overlay */}
                            <AnimatePresence>
                                {selectedImage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="absolute bottom-full left-0 mb-6 p-1.5 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group/preview z-30"
                                    >
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group-hover/preview:border-primary/50 transition-colors">
                                            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setSelectedImage(null)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-primary hover:bg-black transition-all opacity-0 group-hover/preview:opacity-100"
                                                title="Remove Signal"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Drag Overlay */}
                            <AnimatePresence>
                                {isDragging && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md rounded-[2.5rem] border-2 border-primary border-dashed flex items-center justify-center pointer-events-none"
                                    >
                                        <div className="flex flex-col items-center gap-2 text-primary animate-pulse">
                                            <ImagePlus className="w-8 h-8" />
                                            <span className="text-xs font-black uppercase tracking-widest">Drop Visual Asset</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />

                            <div className={`absolute -inset-1 bg-primary/20 rounded-[2.5rem] blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 ${isDragging ? 'opacity-100' : ''}`} />
                            <div className={`relative bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border flex items-center p-2 shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-primary/40 ${isDragging ? 'border-primary/50 bg-primary/5' : 'border-white/10'}`}>
                                {activeGroup?.members?.find((m: any) => m.userId === session?.user?.email && m.role === 'viewer') ? (
                                    <div className="flex-1 px-6 py-3 text-gray-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2 cursor-not-allowed">
                                        <Shield className="w-4 h-4" />
                                        Viewer Mode: Read-Only Access
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-shrink-0 ml-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                                                title="Upload strategic asset"
                                            >
                                                <ImagePlus className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            ref={inputRef}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (isLoading) return; // Prevent send while loading
                                                if (e.key === 'Enter' && !e.shiftKey) handleSend(e as any);
                                            }}
                                            placeholder={isLoading ? "Neural Processing..." : (placeholder || "Transmit Strategic Command...")}
                                            className="flex-1 bg-transparent px-6 py-4 text-white text-base md:text-lg focus:outline-none placeholder:text-gray-500 font-medium disabled:opacity-50 min-w-0"
                                            autoFocus
                                        />
                                        <div className="flex-shrink-0 pr-2">
                                            <button
                                                type="submit"
                                                disabled={isLoading || (!input.trim() && !selectedImage)}
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 overflow-hidden relative group/send ${isLoading ? 'bg-gray-800' : 'bg-primary hover:bg-white'}`}
                                            >
                                                <div className="absolute inset-x-0 bottom-0 h-0 bg-white group-hover/send:h-full transition-all duration-500" />
                                                <ArrowRight className={`w-6 h-6 relative z-10 transition-colors duration-500 ${isLoading ? 'text-gray-500' : 'text-black group-hover:text-primary'}`} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Subtle Gradient Glows */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
            {/* Settings Modal Overlay */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                        onClick={() => setIsSettingsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,255,102,0.1)] relative"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">Core Settings</h3>
                                    <p className="text-[10px] font-bold text-primary/60 tracking-widest uppercase mt-1">System Configuration v4.0</p>
                                </div>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                                >
                                    <Plus className="w-5 h-5 text-white rotate-45" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* AI Persona Selection */}
                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-400">Neutral Processor</h4>
                                        <button
                                            onClick={() => setSettings(prev => ({ ...prev, persona: prev.persona === 'business' ? 'technical' : 'business' }))}
                                            className="w-full text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all space-y-3 group/opt"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-white uppercase tracking-tighter">
                                                    {settings.persona === 'business' ? 'Business Intelligence' : 'Technical Analysis'}
                                                </span>
                                                <div className={`w-8 h-4 rounded-full relative border transition-all ${settings.persona === 'business' ? 'bg-primary/20 border-primary/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                                                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full shadow-lg transition-all ${settings.persona === 'business' ? 'right-0.5 bg-primary shadow-[#00ff66]' : 'left-0.5 bg-blue-500 shadow-blue-500'}`} />
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-500 leading-relaxed italic group-hover/opt:text-gray-400 transition-colors">
                                                {settings.persona === 'business' ? 'Currently optimized for high-stakes corporate strategy and world-class deals.' : 'Switched to technical mode for deep code and engineering analysis.'}
                                            </p>
                                        </button>
                                    </div>

                                    {/* Security Protocols */}
                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-400">Security Layer</h4>
                                        <button
                                            onClick={() => setSettings(prev => ({ ...prev, encryption: !prev.encryption }))}
                                            className="w-full text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all space-y-3 group/opt"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-white uppercase tracking-tighter">AES-256 Encryption</span>
                                                <div className={`w-8 h-4 rounded-full relative border transition-all ${settings.encryption ? 'bg-primary/20 border-primary/30' : 'bg-red-500/20 border-red-500/30'}`}>
                                                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full shadow-lg transition-all ${settings.encryption ? 'right-0.5 bg-primary shadow-[#00ff66]' : 'left-0.5 bg-red-500 shadow-red-500'}`} />
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-500 leading-relaxed group-hover/opt:text-gray-400 transition-colors">
                                                {settings.encryption ? 'All transmissions are encrypted via multi-layered quantum-safe protocols.' : 'Encryption disabled. Warning: Transmission is now visible in the neural clear-net.'}
                                            </p>
                                        </button>
                                    </div>

                                    {/* Token/Prompt Management */}
                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-400">Quota Allocation</h4>
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                            <div className="justify-between items-end flex">
                                                <div className="space-y-1">
                                                    <span className="text-[11px] font-bold text-white uppercase tracking-tighter block">Free Tier Quota</span>
                                                    <p className="text-[8px] text-gray-500 uppercase tracking-widest">Resets in 22:14:05</p>
                                                </div>
                                                <span className="text-[14px] font-black text-primary tracking-tighter">{promptsRemaining} <span className="text-[8px] text-gray-500">/ 50 PROMPTS</span></span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(promptsRemaining / 50) * 100}%` }}
                                                    className="h-full bg-gradient-to-r from-primary to-primary/50 shadow-[0_0_10px_#00ff66]"
                                                />
                                            </div>
                                            <Link href="/premium" className="w-full flex items-center justify-center py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-[9px] font-black text-primary uppercase tracking-[0.2em] transition-all">
                                                Unlock Unlimited Access
                                            </Link>
                                        </div>
                                    </div>

                                    {/* User Profile Setting */}
                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-400">User Identification</h4>
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/user">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-black relative">
                                                    {session?.user?.image ? (
                                                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-black text-white uppercase tracking-widest">{session?.user?.name || "Anonymous User"}</p>
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{session?.user?.email || "No email linked"}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // Add sign out logic here if needed
                                                    setIsSettingsOpen(false);
                                                }}
                                                className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all text-red-500"
                                            >
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Note */}
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_5px_#00ff66]" />
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">All Systems Nominal</span>
                                    </div>
                                    <button
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                                    >
                                        Close Configuration
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -z-10" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-[50px] -z-10" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upgrade Modal */}
            <AnimatePresence>
                {isUpgradeModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-lg bg-[#0a0a0a] border border-primary/20 rounded-3xl p-10 text-center relative overflow-hidden shadow-[0_0_100px_rgba(0,255,102,0.1)]"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                                <Bot className="w-10 h-10 text-primary" />
                            </div>

                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Quota Exhausted</h2>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed px-4">
                                You&apos;ve reached the limit for the <span className="text-primary font-bold">Neural Free Tier</span>.
                                Upgrade to <span className="text-primary font-bold">SYNAPSE PRO</span> to unlock unlimited neural bandwidth and apex processing.
                            </p>

                            <div className="flex flex-col gap-4">
                                <Link
                                    href="/premium"
                                    className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,102,0.3)]"
                                >
                                    Unlock Unlimited Access
                                </Link>
                                <button
                                    onClick={() => setIsUpgradeModalOpen(false)}
                                    className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                >
                                    Dismiss Transmission
                                </button>
                            </div>

                            {/* Decorative background glow */}
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Floating Notifications Panel */}
            <AnimatePresence>
                {isNotificationsOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        className="fixed left-24 bottom-24 w-96 max-h-[600px] bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-[70] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">Notifications</h3>
                                <p className="text-[10px] font-bold text-gray-500 mt-0.5">{unreadCount} unread</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {userNotifications.length > 0 && (
                                    <button
                                        onClick={async () => {
                                            if (confirm("Decommission all signals?")) {
                                                await fetch('/api/notifications', {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ action: 'delete_all' })
                                                });
                                                fetchNotifications();
                                            }
                                        }}
                                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-colors group/trash"
                                        title="Clear All"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400 group-hover/trash:text-red-300" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsNotificationsOpen(false)}
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-[500px] scrollbar-hide">
                            {userNotifications.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <Bell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-gray-500">No notifications yet</p>
                                    <p className="text-[10px] text-gray-600 mt-1">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="p-3 space-y-2">
                                    {userNotifications.map((notif) => (
                                        <motion.div
                                            key={notif._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer ${notif.read
                                                ? 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                                : 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
                                                }`}
                                            onClick={async () => {
                                                if (!notif.read) {
                                                    await fetch('/api/notifications', {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ notificationId: notif._id, action: 'read' })
                                                    });
                                                    fetchNotifications();
                                                }
                                                if (notif.link) {
                                                    router.push(notif.link);
                                                    setIsNotificationsOpen(false);
                                                }
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 ${notif.type === 'invite' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {notif.senderImage ? (
                                                        <img src={notif.senderImage} alt={notif.senderName || "Sender"} className="w-full h-full object-cover" />
                                                    ) : (
                                                        notif.senderName && notif.senderName !== 'Unknown' ? (
                                                            <span className="text-[10px] font-black">{notif.senderName.charAt(0).toUpperCase()}</span>
                                                        ) : (
                                                            notif.type === 'invite' ? <UserPlus className="w-4 h-4" /> : <Bell className="w-4 h-4" />
                                                        )
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">{notif.senderName && notif.senderName !== 'Unknown' ? notif.senderName : notif.title}</h4>
                                                    <p className="text-[10px] text-gray-400 leading-relaxed">{notif.message}</p>
                                                    <p className="text-[8px] text-gray-600 mt-2 uppercase tracking-widest">
                                                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                                                )}
                                            </div>
                                            {notif.link && (
                                                <div className="mt-3 pt-3 border-t border-white/5">
                                                    <button className="text-[9px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-2">
                                                        View Invite <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {userNotifications.length > 0 && unreadCount > 0 && (
                            <div className="px-6 py-3 border-t border-white/10 flex gap-2">
                                <button
                                    onClick={async () => {
                                        await fetch('/api/notifications', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ action: 'read_all' })
                                        });
                                        fetchNotifications();
                                    }}
                                    className="flex-1 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-all"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Modals */}
            <CreateTeamModal
                isOpen={isCreateTeamOpen}
                onClose={() => setIsCreateTeamOpen(false)}
                onSuccess={() => {
                    fetchGroups();
                    // Optionally set as active group here, but backend returns simplified obj
                }}
            />

            {
                activeGroup && (
                    <InviteModal
                        isOpen={isInviteModalOpen}
                        onClose={() => setIsInviteModalOpen(false)}
                        groupId={activeGroup._id}
                        groupName={activeGroup.name}
                    />
                )
            }


            {
                activeGroup && session?.user?.email && (
                    <GroupSettingsModal
                        isOpen={isGroupSettingsOpen}
                        onClose={() => setIsGroupSettingsOpen(false)}
                        group={activeGroup}
                        currentUserId={session.user.email}
                        onUpdate={() => {
                            fetchGroups();
                            // Ideally accept the updated group from modal but we just refresh
                        }}
                        onGroupDeleted={() => {
                            setActiveGroup(null);
                            // setMessage("Unit decommissioned.");
                            fetchGroups();
                        }}
                    />
                )
            }
        </main>
    );
}

// TradingView Real-time Chart Component
function TradingViewChart({ symbol, interval }: { symbol: string, interval?: string }) {
    let formattedSymbol = symbol.toUpperCase();
    if (!formattedSymbol.includes(':')) {
        if (['NIFTY', 'SENSEX', 'BANKNIFTY'].includes(formattedSymbol)) {
            formattedSymbol = `NSE:${formattedSymbol}`;
        } else if (['BTC', 'ETH', 'SOL'].includes(formattedSymbol)) {
            formattedSymbol = `BINANCE:${formattedSymbol}USDT`;
        } else {
            formattedSymbol = `NASDAQ:${formattedSymbol}`;
        }
    }
    return (
        <div className="w-full h-[450px] my-6 rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#0c0c0c] relative group/chart">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <iframe
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_762c4&symbol=${formattedSymbol}&interval=${interval || 'D'}&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${formattedSymbol}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowTransparency={true}
                scrolling="no"
                allowFullScreen={true}
                className="relative z-10"
            ></iframe>
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#00ff66]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 drop-shadow-md">Live Transmission: {formattedSymbol}</span>
            </div>
        </div>
    );
}

// Signal Graph Component for Visual Intelligence
function SignalGraph({ data }: { data: any[] }) {
    return (
        <div className="my-6 p-6 bg-black/40 border border-primary/20 rounded-3xl backdrop-blur-xl relative overflow-hidden group/graph">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/graph:opacity-50 transition-opacity">
                <Shield className="w-12 h-12 text-primary" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Neural Intelligence Signal
            </h4>
            <div className="space-y-4 relative z-10">
                {data.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tight">{item.signal}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${item.level === 3 ? 'text-red-500' : item.level === 2 ? 'text-yellow-500' : 'text-primary'}`}>
                                {item.level === 3 ? 'Critical' : item.level === 2 ? 'Active' : 'Stable'}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                            {[1, 2, 3].map((step) => (
                                <motion.div
                                    key={step}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: item.level >= step ? 1 : 0 }}
                                    className={`h-full flex-1 border-r border-black/20 ${step === 3 ? 'bg-red-500' : step === 2 ? 'bg-yellow-500' : 'bg-primary'
                                        } ${item.level >= step ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ transformOrigin: 'left' }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Decision Source: Synapse Core</span>
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                    <div className="w-1 h-1 rounded-full bg-primary/20" />
                </div>
            </div>
        </div>
    );
}

// Imports needed at top of file:
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

function FormattedMessage({ content }: { content: string }) {
    // Extract JSON Signal Blocks first to prevent Markdown parser from breaking them
    const signalRegex = /\[\s*{\s*"signal":\s*".*?"\s*,\s*"level":\s*\d\s*}\s*(?:,\s*{\s*"signal":\s*".*?"\s*,\s*"level":\s*\d\s*}\s*)*\]/g;
    const parts = [];
    let lastIndex = 0;

    // Split content by signal blocks
    let match;
    while ((match = signalRegex.exec(content)) !== null) {
        // Push text before the match
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
        }

        // Push the signal block
        try {
            const signalData = JSON.parse(match[0]);
            parts.push({ type: 'signal', data: signalData });
        } catch (e) {
            // If parse fails, treat as text
            parts.push({ type: 'text', content: match[0] });
        }

        lastIndex = signalRegex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < content.length) {
        parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return (
        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 max-w-none">
            {parts.map((part, idx) => {
                if (part.type === 'signal') {
                    return <SignalGraph key={idx} data={part.data} />;
                }
                return (
                    <ReactMarkdown
                        key={idx}
                        remarkPlugins={[remarkGfm]}
                        components={{
                            table: ({ node, ...props }) => <div className="overflow-x-auto my-4 border border-white/10 rounded-xl"><table className="w-full text-left text-sm" {...props} /></div>,
                            thead: ({ node, ...props }) => <thead className="bg-white/5 text-gray-200 uppercase tracking-wider font-bold" {...props} />,
                            th: ({ node, ...props }) => <th className="px-4 py-3 border-b border-white/10" {...props} />,
                            td: ({ node, ...props }) => <td className="px-4 py-3 border-b border-white/5 text-gray-400" {...props} />,
                            a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} target="_blank" rel="noopener noreferrer" />,
                            strong: ({ node, ...props }) => <strong className="text-white font-black" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 marker:text-primary" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 marker:text-primary" {...props} />,
                            h1: ({ node, ...props }) => <h1 className="text-xl font-black text-white mt-6 mb-4 uppercase tracking-widest" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-lg font-black text-white mt-5 mb-3 uppercase tracking-wider flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full" />{props.children}</h2>,
                            h3: ({ node, ...props }) => <h3 className="text-md font-bold text-gray-200 mt-4 mb-2 uppercase tracking-wide border-l-2 border-primary/50 pl-3" {...props} />,
                            code: ({ node, ...props }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary font-mono text-xs" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 italic text-gray-400 bg-white/[0.02] rounded-r-lg" {...props} />,
                        }}
                    >
                        {part.content}
                    </ReactMarkdown>
                );
            })}
        </div>
    );
}