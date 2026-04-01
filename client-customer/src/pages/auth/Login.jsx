import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/common';
import { ArrowRight, Star, MapPin, Shield, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { useTheme } from '../../context/ThemeContext';

const Login = () => {
    const { requestOtp } = useAuth();
    const { setIsLoading } = useLoading();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: ""
    });
    const [error, setError] = useState("");

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.mobile || !formData.name) {
            setError("All fields are required");
            return;
        }

        setIsLoading(true);
        const result = await requestOtp(formData.email, formData.mobile, formData.name);

        if (result.success) {
            navigate('/verify', { state: { email: formData.email, mobile: formData.mobile } });
        } else {
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

            {/* Right Section - Login Form */}
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
                            <div className="w-12 h-1.5 bg-primary-800 dark:bg-primary-500 rounded-full mb-6"></div>
                            <h2 className="text-4xl font-black text-slate-800 dark:text-white leading-[0.9] tracking-tighter">GET<br /><span className="text-primary-800 dark:text-primary-400">STARTED</span></h2>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-widest uppercase text-left">Enter your details to receive an OTP</p>
                        </div>

                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-3">
                                <Input
                                    label="Full Name"
                                    placeholder="John Doe"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 text-lg font-black"
                                    autoFocus
                                />
                                <Input
                                    label="Email Address"
                                    placeholder="john@example.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-12 text-lg font-black"
                                />
                                <Input
                                    label="Mobile Number"
                                    placeholder="10 Digits"
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    maxLength={10}
                                    className="h-12 text-lg font-black"
                                />
                            </div>

                            {error && <p className="text-red-500 font-black text-[10px] uppercase tracking-widest">{error}</p>}

                            <Button className="w-full py-6 text-xl font-black shadow-xl shadow-primary-900/20" type="submit">
                                SEND OTP <ArrowRight size={24} className="ml-3" />
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
