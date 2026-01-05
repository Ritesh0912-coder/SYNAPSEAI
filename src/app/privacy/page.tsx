"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/ui/LightRays";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-primary/30 relative">
            <Navbar />

            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <LightRays raysColor="#00ff66" raysSpeed={0.5} />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-40 pb-24">
                <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase tracking-tighter">
                    Privacy <span className="text-primary italic">Policy</span>
                </h1>

                <div className="space-y-8 text-gray-400 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-white text-xl font-bold mb-4 uppercase">1. Data Encryption</h2>
                        <p>All neural data transmitted through the OMNI interface is encrypted using quantum-resistant protocols. We do not store raw biological or cognitive patterns.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-xl font-bold mb-4 uppercase">2. Intelligence Privacy</h2>
                        <p>Your interactions with the OMNI AI are private. We do not use individual session data to train global models without explicit, multi-factor authorization.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-xl font-bold mb-4 uppercase">3. Third-Party Access</h2>
                        <p>OMNI does not sell or distribute your data to third-party entities. Integration with external systems is managed through secure, user-controlled API keys.</p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
