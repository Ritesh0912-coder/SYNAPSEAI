"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import TextDecode from "@/components/ui/TextDecode";
import Image from "next/image";
import Orb from "./ui/Orb";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Hero() {
    const { status } = useSession();

    return (
        <section className="relative h-screen min-h-[700px] w-full overflow-hidden flex items-center justify-center">
            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-chip.jpg"
                    alt="AI Neural Background"
                    fill
                    className="object-cover opacity-40"
                    priority
                />
                {/* Darker Overlay */}
                <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Background Orb - Centered behind text */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="w-[800px] h-[800px] opacity-80 group-hover:scale-110 transition-transform duration-1000">
                    <Orb
                        hoverIntensity={0.8}
                        rotateOnHover={true}
                        hue={140}
                        forceHoverState={false}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 w-full relative z-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,102,1)]" />
                        Intelligence Redefined
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1] uppercase">
                        <TextDecode text="AI Beyond Your" /> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary relative pb-2 block mt-2">
                            <TextDecode text="Business Limits" delay={1} />
                        </span>
                    </h1>

                    <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-medium">
                        A new era of intelligence where technology understands, adapts, and evolves with you.
                        Empower your vision with our next-gen AI services.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <Link
                            href={status === "authenticated" ? "/chat" : "/sign-in"}
                            className="px-10 py-5 rounded-full bg-primary text-black font-black text-lg hover:bg-white transition-all duration-500 shadow-[0_0_40px_rgba(0,255,102,0.4)] flex items-center gap-2 group transform hover:scale-105 active:scale-95"
                        >
                            Get Started
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button className="px-10 py-5 rounded-full border-2 border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-all duration-500 backdrop-blur-md flex items-center gap-2 group transform hover:scale-105 active:scale-95">
                            <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-current ml-1" />
                            </span>
                            Watch Video
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        </section>
    );
}
