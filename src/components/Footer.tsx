"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="relative pt-24 pb-12 overflow-hidden px-6">
            {/* Curved Top Border Decoration */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-black z-10" style={{ borderTopLeftRadius: '50% 100px', borderTopRightRadius: '50% 100px' }} />

            <div className="max-w-7xl mx-auto relative z-20 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 md:p-16 shadow-2xl">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-8 group">
                            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
                                <Image src="/synapse-logo.png" alt="SYNAPSE AI" fill className="object-contain" />
                            </div>
                            <span className="text-[12px] font-black tracking-[0.5em] uppercase mb-6 inline-block text-white/90">SYNAPSE AI</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                            World-class AI strategic intelligence for global business engineering and high-stakes corporate strategy.
                        </p>
                        <div className="flex gap-6 mt-8">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black hover:scale-110 transition-all border border-white/10">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-8 uppercase tracking-widest text-sm text-primary">Explore</h4>
                        <ul className="space-y-4 text-gray-400 font-medium text-sm">
                            {[
                                { name: 'Home', href: '/' },
                                { name: 'About', href: '/#about' },
                                { name: 'Services', href: '/#services' },
                                { name: 'Browser', href: '/browser' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="hover:text-primary transition-colors flex items-center gap-3 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-8 uppercase tracking-widest text-sm text-primary">Newsletter</h4>
                        <p className="text-gray-400 text-xs mb-6 leading-relaxed">Stay updated with our latest AI breakthroughs and strategic insights.</p>
                        <form className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10 focus-within:border-primary/50 transition-all group">
                            <input type="email" placeholder="Email Address" className="bg-transparent border-none text-white px-4 py-2 w-full focus:outline-none text-xs placeholder:text-gray-600 font-bold" required />
                            <button type="submit" className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    <p>&copy; 2026 SYNAPSE AI Intelligence. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
