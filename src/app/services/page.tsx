"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/Services";
import LightRays from "@/components/ui/LightRays";
import { motion } from "framer-motion";

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-primary/30 relative">
            <Navbar />

            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <LightRays raysColor="#00ff66" raysSpeed={0.5} />
            </div>

            <div className="relative z-10 pt-40 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center px-6"
                >
                    <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter">
                        AI <span className="text-primary italic">Ecosystem</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-widest">
                        Comprehensive solutions for the modern neural enterprise.
                    </p>
                </motion.div>
            </div>

            <ServicesSection />

            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="bg-primary/10 border border-primary/20 rounded-[3rem] p-12 md:p-24 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-8 uppercase">Ready to Evolve?</h2>
                    <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto font-bold uppercase tracking-tight leading-relaxed">
                        Start your transformation today with our baseline integration package.
                    </p>
                    <a href="/chat" className="inline-flex px-12 py-5 rounded-full bg-primary text-black font-black text-lg hover:bg-white transition-all shadow-[0_0_40px_rgba(0,255,102,0.4)] uppercase">
                        Initialize Core
                    </a>
                </div>
            </div>

            <Footer />
        </main>
    );
}
