"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/chat");
        }
    }, [status, router]);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await signIn("credentials", {
            email,
            password,
            callbackUrl: "/chat",
        });
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-6 relative z-10 pt-20">
                {/* Background Brain */}
                <div className="absolute right-0 bottom-0 w-[600px] h-[600px] opacity-20 pointer-events-none translate-x-1/3 translate-y-1/3">
                    <Image
                        src="/contact-brain-v2.png"
                        alt="Brain Background"
                        fill
                        className="object-contain mix-blend-screen"
                    />
                </div>

                <ScrollReveal className="w-full max-w-md">
                    <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                        <div className="text-center mb-10 relative z-10">
                            <h2 className="text-4xl font-black mb-3 uppercase tracking-tighter text-white">Neural Access</h2>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verify identity to continue</p>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* Google Sign In Button */}
                            <button
                                onClick={() => signIn("google")}
                                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 group transition-all duration-500"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-black px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">OR</span>
                                </div>
                            </div>

                            {/* Credentials Form */}
                            <form onSubmit={handleCredentialsLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure ID</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Identification handle"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Key</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full py-4 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? "Verifying..." : "Access System"}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>

                        <div className="mt-10 text-center relative z-10">
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                                All neural connections are encrypted and monitored.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </main>
    );
}
