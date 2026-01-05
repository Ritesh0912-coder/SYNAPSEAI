"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/ui/LightRays";
import { Users, Target, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-x-hidden">
            <Navbar />

            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <LightRays raysColor="#00ff66" raysSpeed={0.5} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <h1 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter">
                        About <span className="text-primary italic">OMNI</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-bold">
                        We are a collective of neural architects and cybersecurity experts dedicated to building the bridge between human intuition and machine intelligence.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-12">
                    {[
                        { icon: <Target />, title: "Our Mission", desc: "To decentralize intelligence and empower every organization with autonomous growth capabilities." },
                        { icon: <Users />, title: "Our Collective", desc: "A global team of experts working remotely to solve the most complex AI challenges of our time." },
                        { icon: <ShieldCheck />, title: "Our Integrity", desc: "We prioritize security and ethical standards in every line of code we write." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-[2rem] p-10 hover:border-primary/50 transition-colors group text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-black mb-4 uppercase">{item.title}</h3>
                            <p className="text-gray-400 leading-relaxed font-medium">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    );
}
