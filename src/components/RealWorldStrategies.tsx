"use client";

import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const strategies = [
    {
        title: "Financial Growth",
        category: "Finance",
        desc: "AI-driven market predictions that outperform traditional analysts.",
        color: "from-blue-500/20 to-purple-500/20",
    },
    {
        title: "Medical Diagnostics",
        category: "Healthcare",
        desc: "Early detection systems powering the next generation of patient care.",
        color: "from-emerald-500/20 to-teal-500/20",
    },
    {
        title: "Smart Cities",
        category: "Infrastructure",
        desc: "Optimizing energy, traffic, and public services with real-time data.",
        color: "from-orange-500/20 to-red-500/20",
    },
];

export default function RealWorldStrategies() {
    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="text-primary text-sm font-bold uppercase tracking-widest">Browser</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 max-w-xl">
                            Real World Strategies <br /> That Deliver <span className="text-primary">Results</span>
                        </h2>
                    </div>
                    <button className="px-6 py-2 rounded-full border border-white/10 hover:border-primary text-white hover:text-primary transition-all flex items-center gap-2 group">
                        View All Cases
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {strategies.map((item, i) => (
                        <ScrollReveal
                            key={i}
                            delay={i * 0.1}
                            className="group relative h-[400px] rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500"
                        >
                            {/* Background Gradient/Image Placeholder */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-50 group-hover:opacity-70 transition-opacity`} />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2">{item.category}</span>
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-gray-300 text-sm mb-6 line-clamp-2">{item.desc}</p>

                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
