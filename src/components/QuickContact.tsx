"use client";

import { Phone, MapPin, Mail } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const contactInfo = [
    {
        icon: <Phone className="w-6 h-6 text-primary" />,
        title: "Call Us",
        value: "+1 234 567 890",
        desc: "Mon-Fri from 8am to 6pm"
    },
    {
        icon: <MapPin className="w-6 h-6 text-primary" />,
        title: "Our Location",
        value: "Oxford Street, London",
        desc: "United Kingdom, W1D 1BS"
    },
    {
        icon: <Mail className="w-6 h-6 text-primary" />,
        title: "Email Us",
        value: "hello@omni-ai.com",
        desc: "We'll respond within 24 hours"
    }
];

export default function QuickContact() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-8">
                    {contactInfo.map((info, i) => (
                        <ScrollReveal
                            key={i}
                            delay={i * 0.1}
                            className="glass-card p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all group text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                                {info.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{info.title}</h3>
                            <p className="text-primary font-medium mb-1">{info.value}</p>
                            <p className="text-gray-400 text-sm">{info.desc}</p>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
