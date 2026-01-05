"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LogOut, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/#about" },
    { name: "Services", href: "/#services" },
    { name: "Browser", href: "/#strategies" },
];

export default function Navbar() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-6 left-0 right-0 z-50 px-6 flex justify-center">
            <nav className={cn(
                "w-full max-w-5xl rounded-full transition-all duration-500 border border-white/5 backdrop-blur-xl flex items-center justify-between px-8 py-4",
                scrolled ? "bg-black/80 shadow-[0_0_30px_rgba(0,0,0,0.5)] scale-95" : "bg-white/5"
            )}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
                        <Image
                            src="/logo.png"
                            alt="OMNI Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white uppercase sm:block hidden">
                        OMNI
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors duration-300"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center gap-6">
                    {status === "authenticated" && (
                        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                            <div className="w-8 h-8 rounded-full border border-primary/50 overflow-hidden relative">
                                {session.user?.image ? (
                                    <Image src={session.user.image} alt="User" fill />
                                ) : (
                                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] font-black">{session.user?.name?.[0]}</div>
                                )}
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors"
                            >
                                Exit
                            </button>
                        </div>
                    )}
                    <Link
                        href={status === "authenticated" ? "/chat" : "/sign-in"}
                        className="px-6 py-2.5 rounded-full bg-primary text-black hover:bg-white transition-all duration-300 text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,102,0.2)]"
                    >
                        Let's Talk
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-gray-300 hover:text-primary transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-24 left-6 right-6 z-40 md:hidden bg-black/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="flex flex-col p-8 gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-xl font-black uppercase tracking-widest text-white hover:text-primary transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-white/10 w-full" />
                            {status === "authenticated" && (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl border border-primary/50 overflow-hidden relative">
                                        {session.user?.image ? (
                                            <Image src={session.user.image} alt="User" fill />
                                        ) : (
                                            <div className="w-full h-full bg-primary/20 flex items-center justify-center font-black">{session.user?.name?.[0]}</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-black uppercase text-sm">{session.user?.name}</p>
                                        <button
                                            onClick={() => signOut()}
                                            className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                            <Link
                                href="/chat"
                                className="text-center px-6 py-4 rounded-full bg-primary text-black font-black uppercase tracking-widest"
                                onClick={() => setIsOpen(false)}
                            >
                                Let's Talk
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
