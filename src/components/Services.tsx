"use client";

import { ArrowUpRight, BarChart3, Bot, Code2, Database, Globe, Lock } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";

const services = [
    {
        icon: <Bot className="w-10 h-10 text-primary" />,
        title: "Autonomous Agents",
        desc: "Deploy intelligent agents that handle customer support, scheduling, and repetitive workflows with human-like understanding.",
    },
    {
        icon: <BarChart3 className="w-10 h-10 text-primary" />,
        title: "Predictive Analytics",
        desc: "Harness the power of historical data to forecast market trends, user behavior, and operational risks before they happen.",
    },
    {
        icon: <Code2 className="w-10 h-10 text-primary" />,
        title: "Neural Codeflow",
        desc: "Accelerate development cycles with AI-assisted coding and automated refactoring powered by advanced LLM models.",
    },
    {
        icon: <Database className="w-10 h-10 text-primary" />,
        title: "Intelligent Data",
        desc: "Transform unstructured raw data into actionable knowledge with automated categorization and semantics-aware search.",
    },
    {
        icon: <Globe className="w-10 h-10 text-primary" />,
        title: "Global Intelligence",
        desc: "Navigate international markets with real-time, context-aware translation that preserves cultural nuance and technical accuracy.",
    },
    {
        icon: <Lock className="w-10 h-10 text-primary" />,
        title: "Cyber Resilience",
        desc: "Anticipate threats with a security layer that adapts to new attack vectors in real-time, protecting your most critical assets.",
    },
];

export default function Services() {
    return (
        <section id="services" className="py-24 bg-black/40">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-16">
                    <span className="text-primary text-sm font-semibold tracking-widest uppercase">Our Services</span>
                    <h2 className="mt-4 text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                        Empower Your Business <br />
                        with Our <span className="text-primary">AI Services</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <ScrollReveal
                            key={index}
                            delay={index * 0.1}
                            className="group glass-card p-8 rounded-3xl relative overflow-hidden hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="text-primary" />
                            </div>

                            <div className="mb-6 p-4 rounded-full bg-white/5 w-fit border border-white/10 group-hover:border-primary/50 transition-colors">
                                {service.icon}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                                {service.desc}
                            </p>

                            <Link href="/services" className="flex items-center gap-2 text-sm font-medium text-white group-hover:text-primary transition-colors cursor-pointer">
                                Read More
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </ScrollReveal>
                    ))}
                </div>

            </div>
        </section>
    );
}
