"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/ui/LightRays";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-primary/30 relative">
            <Navbar />

            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <LightRays raysColor="#00ff66" raysSpeed={0.5} />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-40 pb-24">
                <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase tracking-tighter">
                    Terms of <span className="text-primary italic">Service</span>
                </h1>

                <div className="space-y-8 text-gray-400 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-white text-xl font-bold mb-4 uppercase">1. Ethical Use</h2>
                        <p>By accessing OMNI, you agree to use our artificial intelligence systems only for ethical purposes. Misuse for malicious cyber activities is strictly prohibited.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-xl font-bold mb-4 uppercase">2. Neural Liability</h2>
                        <p>OMNI AI provides high-probability insights but is not liable for autonomous decisions made by the user based on these insights.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-xl font-bold mb-4 uppercase">3. Service Evolution</h2>
                        <p>Our systems evolve in real-time. We reserve the right to update intelligence protocols to ensure safety and performance standards.</p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
