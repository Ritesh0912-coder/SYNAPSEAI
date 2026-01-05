"use client";

import { Quote, Star } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const testimonials = [
    {
        name: "Jonathan Vance",
        role: "CTO, Nexus Dynamics",
        content: "The autonomous agents provided by OMNI have revolutionized our customer support operations. We've seen a 40% reduction in response times and unprecedented consistency in service quality.",
        stars: 5,
    },
    {
        name: "Elena Rodriguez",
        role: "Product Strategy, Global Retail",
        content: "Predictive analytics from OMNI allowed us to anticipate inventory needs three months ahead of peak season. The accuracy of their models is simply game-changing for our supply chain.",
        stars: 5,
    },
    {
        name: "Marcus Thorne",
        role: "Founder, Horizon FinTech",
        content: "Implementing OMNI's NLP solutions was seamless. Our multi-lingual user base now interacts with our platform in their native languages with zero friction. Truly a world-class AI partner.",
        stars: 5,
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 relative">
            {/* Background Decoration */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block p-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
                        <Quote className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
                        What our <span className="text-primary">Partners Say</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <ScrollReveal
                            key={i}
                            delay={i * 0.1}
                            className="glass-card p-8 rounded-3xl relative"
                        >
                            {/* Quote Icon */}
                            <Quote className="absolute top-8 right-8 text-white/5 w-12 h-12 rotate-180" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(t.stars)].map((_, si) => (
                                    <Star key={si} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>

                            <p className="text-gray-300 mb-8 leading-relaxed italic">"{t.content}"</p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-white/10 text-primary font-bold">
                                    {t.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{t.name}</h4>
                                    <span className="text-xs text-primary">{t.role}</span>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button className="px-8 py-3 rounded-full border border-white/10 hover:bg-primary hover:text-black transition-all text-white text-sm font-bold">
                        Read All Success Stories
                    </button>
                </div>

            </div>
        </section>
    );
}
