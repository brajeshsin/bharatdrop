import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/common';
import { adminService } from '../../services/adminService';
import {
    Bike, Phone, TrendingUp, ShieldCheck, ShieldAlert,
    X, MapPin, Star, Calendar, Trash2, ArrowLeft,
    Package, Clock, CheckCircle2
} from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { motion } from 'framer-motion';

const PartnerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setIsLoading } = useLoading();
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartner = async () => {
            setIsLoading(true);
            try {
                const data = await adminService.getPartnerById(id);
                setPartner(data);
                setLoading(false);
            } catch (error) {
                console.error("Partner details load failed:", error);
                setLoading(false);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPartner();
    }, [id, setIsLoading]);

    const toggleStatus = () => {
        setPartner(prev => ({ ...prev, status: prev.status === 'Online' ? 'Offline' : 'Online' }));
    };

    if (loading) return null; // Global loader handles this

    if (!partner) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <p className="font-black text-slate-400 uppercase tracking-widest">Partner Not Found</p>
            <Button onClick={() => navigate('/admin/partners')}>Return to Fleet</Button>
        </div>
    );

    const stats = [
        { label: 'Total Shipments', value: (100 + (partner.id * 7)).toString(), progress: 60 + (partner.id % 40), color: 'bg-primary-800', icon: <Package size={16} /> },
        { label: 'Customer Rating', value: (4.0 + (partner.id % 10) / 10).toFixed(1) + '/5', progress: 80 + (partner.id % 20), color: 'bg-amber-500', icon: <Star size={16} /> },
        { label: 'Response Time', value: (10 + (partner.id % 20)) + ' min', progress: 50 + (partner.id % 50), color: 'bg-blue-600', icon: <Clock size={16} /> },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/partners')}
                    className="flex items-center gap-2 group text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 transition-colors"
                >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Back to Force</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-800/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center relative shadow-2xl border-8 border-white dark:border-slate-800 ring-4 ring-primary-50 dark:ring-primary-900/20 mb-6">
                                <Bike size={64} className="text-primary-800 dark:text-primary-400" />
                                {partner.status === 'Online' && (
                                    <div className="absolute top-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full animate-pulse shadow-lg"></div>
                                )}
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic mb-2">{partner.name}</h2>
                            <div className="flex items-center gap-2 mb-6">
                                <Badge variant={partner.status === 'Online' ? 'success' : 'default'} className="px-6 py-2 font-black uppercase text-xs tracking-widest">{partner.status}</Badge>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">P-{partner.id}00</span>
                            </div>

                            <div className="w-full grid grid-cols-1 gap-3">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Phone size={18} className="text-primary-800 dark:text-primary-400" />
                                        <span className="font-bold text-sm dark:text-slate-300">{partner.phone}</span>
                                    </div>
                                    <button className="text-[10px] font-black text-primary-800 dark:text-primary-400 uppercase tracking-widest hover:underline">CALL</button>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-primary-800 dark:text-primary-400" />
                                        <span className="font-bold text-sm dark:text-slate-300 italic uppercase">Since {['JAN', 'FEB', 'MAR', 'OCT', 'NOV'][partner.id % 5]} 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-none shadow-sm bg-primary-800 text-white rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Lifetime Earnings</h4>
                        <div className="text-4xl font-black">₹{(partner.earnings * 12).toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full">
                            <CheckCircle2 size={12} />
                            Verified Account
                        </div>
                    </Card>
                </div>

                {/* Main Content (Stats & Actions) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Performance Dashboard */}
                    <Card className="p-8 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">Performance Pulse</h3>
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl">
                                <TrendingUp size={16} className="text-emerald-600" />
                                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{90 + (partner.id % 10)}% Rate</span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                {stat.icon}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                <p className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tighter mt-1">{stat.value}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-slate-400 opacity-40">{stat.progress}% Target</span>
                                    </div>
                                    <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.progress}%` }}
                                            transition={{ duration: 1, delay: i * 0.2 }}
                                            className={`h-full ${stat.color} rounded-full shadow-lg`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={toggleStatus}
                            className={`py-6 rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase shadow-2xl transition-all hover:scale-105 ${partner.status === 'Online' ? 'bg-red-600 shadow-red-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}
                        >
                            {partner.status === 'Online' ? <ShieldAlert size={20} className="mr-3" /> : <ShieldCheck size={20} className="mr-3" />}
                            {partner.status === 'Online' ? 'Deactivate Access' : 'Reactivate Access'}
                        </Button>
                        <Button variant="outline" className="py-6 rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase bg-slate-50 dark:bg-slate-800 border-none hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all hover:scale-105">
                            <Trash2 size={20} className="mr-3" /> Terminate Profile
                        </Button>
                    </div>

                    <Card className="p-8 border border-dashed border-slate-200 dark:border-slate-800 bg-transparent rounded-[3rem] flex flex-col items-center justify-center text-center py-12">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-4 italic font-black text-2xl">?</div>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">More Analytics Coming Soon</h4>
                        <p className="text-[10px] text-slate-400/60 uppercase tracking-widest mt-2 max-w-xs">Fuel consumption, route optimization, and customer feedback heatmaps will be available in the next update.</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PartnerDetails;
