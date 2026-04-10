import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/common';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { loginAdmin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const success = await loginAdmin(email.trim().toLowerCase(), password.trim());
            if (success) {
                toast.success('Welcome back, Administrator');
                navigate('/admin');
            } else {
                setError('Invalid admin credentials. Please try again.');
                toast.error('Authentication failed');
            }
        } catch (err) {
            setError('An error occurred during login.');
            toast.error('Could not connect to authentication server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10 space-y-8">
                {/* Branding */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary-900/40 rotate-3 border-4 border-white/10 group">
                        <Shield className="text-white w-10 h-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                            Bharat<span className="text-primary-400">Drop</span> Admin
                        </h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Secure Command Center</p>
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-slate-900/50 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@bharatdrop.in"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-primary-800 focus:ring-4 focus:ring-primary-900/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-primary-800 focus:ring-4 focus:ring-primary-900/20 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-primary-800 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary-900/40 relative overflow-hidden group active:scale-95 transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    AUTHENTICATE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Lock size={10} /> ENCRYPTED SESSION
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
