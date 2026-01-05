"use client";

import { Brain, Cpu, Network } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";

const solutions = [
    {
        icon: <Brain className="w-8 h-8 text-primary" />,
        title: "Intelligent Core",
        desc: "Self-learning algorithms that adapt to your unique business data.",
    },
    {
        icon: <Cpu className="w-8 h-8 text-white" />,
        title: "Predictive Analytics",
        desc: "Forecast trends and outcomes with our advanced modeling engine.",
    },
    {
        icon: <Network className="w-8 h-8 text-primary" />,
        title: "Seamless Integration",
        desc: "Drop-in API solutions for your existing enterprise systems.",
    },
];

export default function SmartSolutions() {
    return (
        <section id="about" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left: Text Content */}
                <ScrollReveal className="space-y-6">
                    <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">About Us</div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                        Driven by Intelligence. <br />
                        <span className="text-gray-500">Designed for Impact.</span>
                    </h2>
                    <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-lg">
                        We build AI solutions that solve real-world problems. From automating mundane tasks to providing deep strategic insights, OMNI is the intelligence layer your business needs to thrive.
                    </p>

                    <Link href="/about" className="text-white border-b border-primary hover:text-primary transition-colors pb-1">
                        Read Our Story
                    </Link>
                </ScrollReveal>

                {/* Right: Feature Cards */}
                <div className="grid gap-6">
                    {solutions.map((item, index) => (
                        <ScrollReveal
                            key={index}
                            delay={index * 0.1}
                            className="glass-card p-6 rounded-2xl flex items-start gap-5 hover:bg-white/5 transition-all duration-300 group"
                        >
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/50 transition-colors">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

            </div>

            {/* Decorative Blob */}
            <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[128px] -z-10" />
        </section>
    );
}
