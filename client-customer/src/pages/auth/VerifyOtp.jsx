import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/common';
import { ArrowRight, ShieldCheck, Sun, Moon, Star, MapPin, Shield, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { useTheme } from '../../context/ThemeContext';

const VerifyOtp = () => {
    const { verifyOtp } = useAuth();
    const { setIsLoading } = useLoading();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const { email } = location.state || {};
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await verifyOtp(email, otp);

        if (!result.success) {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col lg:flex-row overflow-hidden font-sans uppercase tracking-tight transition-colors duration-500">
            {/* Left Section - Branding Immersive */}
            <div className="hidden lg:flex w-1/2 bg-primary-800 dark:bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white border-r-8 border-primary-900 dark:border-black shadow-2xl transition-colors duration-500">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full translate-y-32 -translate-x-32"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-6 text-primary-800 dark:text-primary-400 font-black text-4xl">
                            B
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Bharat<span className="text-secondary">Drop</span></h1>
                    </div>

                    <div className="space-y-12 max-w-md">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                            <h2 className="text-4xl font-black leading-tight text-white/90">The heart of <span className="text-secondary underline decoration-4 underline-offset-8">local commerce</span> for our villages.</h2>
                        </motion.div>

                        <div className="space-y-6">
                            {[
                                { icon: Star, text: "Trusted by 500+ Local Shops" },
                                { icon: MapPin, text: "Serving 50+ Gram Panchayats" },
                                { icon: Shield, text: "Official Government Approved" }
                            ].map((item, i) => (
                                <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + (i * 0.1) }} className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 dark:bg-slate-800/50 rounded-xl flex items-center justify-center"><item.icon size={20} className="text-secondary" /></div>
                                    <p className="font-black text-sm tracking-widest leading-none text-white dark:text-slate-300">{item.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-primary-300 dark:text-slate-500 font-black text-[10px] tracking-[0.3em]">
                    <span>MODERN RURAL STACK</span>
                    <div className="w-1 h-1 bg-secondary rounded-full"></div>
                    <span>v2.4.0</span>
                    <div className="w-1 h-1 bg-secondary rounded-full"></div>
                    <span>2026 INDIA</span>
                </div>
            </div>

            {/* Right Section - Verification Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-white dark:bg-slate-900 transition-colors duration-500 overflow-hidden">
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232E7D32' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

                {/* Theme Toggle */}
                <div className="absolute top-8 right-8 z-20">
                    <button
                        onClick={toggleTheme}
                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-primary-800 dark:hover:border-primary-400 transition-all active:scale-95 shadow-sm"
                        title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                    >
                        {theme === 'dark' ? <Sun size={20} className="text-secondary" /> : <Moon size={20} />}
                    </button>
                </div>

                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="space-y-3 relative z-10">
                            <div className="w-12 h-1.5 bg-secondary rounded-full mb-6"></div>
                            <h2 className="text-4xl font-black text-slate-800 dark:text-white leading-[0.9] tracking-tighter">VERIFY<br /><span className="text-secondary">OTP</span></h2>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-widest uppercase text-left italic">Check your email: {email}</p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-4">
                                <Input
                                    label="Verification Code"
                                    placeholder="6 Digits"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="h-16 text-4xl font-black tracking-widest text-center"
                                    autoFocus
                                />
                                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border-2 border-primary-100 dark:border-primary-900 flex gap-4">
                                    <ShieldCheck className="text-primary-800 dark:text-primary-400 shrink-0 mt-0.5" size={24} />
                                    <p className="text-[10px] font-black text-primary-900 dark:text-primary-200 leading-relaxed uppercase tracking-widest text-left">
                                        We've sent a 6-digit code to your email. Check your spam folder if you don't see it.
                                    </p>
                                </div>
                            </div>

                            {error && <p className="text-red-500 font-black text-[10px] uppercase tracking-widest text-center">{error}</p>}

                            <Button className="w-full py-6 text-xl font-black shadow-xl" type="submit" disabled={otp.length < 6}>
                                VERIFY & ENTER <ArrowRight size={24} className="ml-3" />
                            </Button>

                            <button onClick={() => navigate('/login')} className="w-full text-center font-black text-xs text-slate-300 dark:text-slate-600 hover:text-primary-800 dark:hover:text-primary-400 uppercase tracking-widest py-2">
                                Change details
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
