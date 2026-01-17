"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Contact() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                console.error('Failed to send message');
                setStatus('idle'); // or handle error state
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('idle');
        }
    };

    return (
        <section id="contact" className="py-24 relative overflow-hidden">
            {/* Background Noise/Texture */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left: Brain Visual Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative h-[500px] flex items-center justify-center font-black"
                >
                    <div className="relative w-full h-full max-w-md flex items-center justify-center">
                        <Image
                            src="/contact-brain-v2.png"
                            alt="AI Neural Network"
                            width={500}
                            height={500}
                            className="relative z-10 w-full h-auto object-contain mix-blend-screen"
                        />
                    </div>
                </motion.div>

                {/* Right: Form */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="mb-8 text-center lg:text-left">
                        <span className="text-primary text-sm font-bold uppercase tracking-widest">Contact Us</span>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mt-2 uppercase tracking-tight">Tell Us Your Goals</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center space-y-4"
                            >
                                <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                                <h3 className="text-xl font-bold text-white uppercase">Message Sent Successfully</h3>
                                <p className="text-gray-400 text-sm">Target reached. Our intelligence specialists will contact you shortly.</p>
                                <button
                                    type="button"
                                    onClick={() => setStatus('idle')}
                                    className="text-primary text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Send Another
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-1">Message</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full py-4 rounded-xl bg-primary text-black font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,255,102,0.3)] flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {status === 'sending' ? 'Transmitting...' : 'Submit Message'}
                                    {status !== 'sending' && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </>
                        )}
                    </form>
                </motion.div>

            </div>
        </section>
    );
}
