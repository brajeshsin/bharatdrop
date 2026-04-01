import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input } from '../../components/common';
import { adminService } from '../../services/adminService';
import { MapPin, Plus, Navigation, Maximize, Trash2, Map, Globe } from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { motion } from 'framer-motion';

const ZonesPage = () => {
    const { setIsLoading } = useLoading();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchZones = async () => {
            setIsLoading(true);
            try {
                const data = await adminService.getZones();
                setZones(data);
                setLoading(false);
            } catch (error) {
                console.error("Zones load failed:", error);
                setLoading(false);
            } finally {
                setIsLoading(false);
            }
        };
        fetchZones();
    }, [setIsLoading]);

    return (
        <div className="space-y-8 animate-fade-in uppercase tracking-tight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Logistics Hubs</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Zone-wise coverage & performance</p>
                </div>
                <Button className="font-black text-[10px] tracking-[0.2em] py-4 px-8">EXPAND NETWORK</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    <div className="h-64 bg-slate-100 dark:bg-slate-800/10 rounded-[2.5rem] animate-pulse col-span-full" />
                ) : (
                    zones.map((zone) => (
                        <motion.div key={zone.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <Card className="p-10 border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 rounded-[3rem] relative overflow-hidden group border-t-8 border-primary-800 dark:border-primary-900">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 dark:bg-slate-800/50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform"></div>

                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-[1.5rem] flex items-center justify-center text-primary-800 dark:text-primary-400 shadow-sm border-2 border-white dark:border-slate-800 ring-8 ring-primary-50/50 dark:ring-primary-900/10">
                                            <MapPin size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{zone.town} Hub</h3>
                                            <Badge variant="success" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-none px-3 py-1 font-black text-[8px] uppercase tracking-widest mt-2 italic">Operating Now</Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Range</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">{zone.distance}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">
                                        <span className="text-slate-400">Village List</span>
                                        <span className="text-primary-800 dark:text-primary-400">{zone.villages.length} Localities</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {zone.villages.map((v, i) => (
                                            <Badge key={i} className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none h-10 px-5 flex items-center font-bold text-xs hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-800 dark:hover:text-primary-400 cursor-default transition-colors">
                                                {v}
                                            </Badge>
                                        ))}
                                        <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-800 dark:hover:text-primary-400 transition-all">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-12 flex gap-3 relative z-10">
                                    <Button variant="outline" className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 border-none font-black text-[9px] tracking-widest uppercase hover:bg-slate-100 dark:hover:bg-slate-700">
                                        <Navigation size={14} className="mr-2" /> OPTIMIZE ROUTE
                                    </Button>
                                    <Button variant="outline" className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 border-none font-black text-[9px] tracking-widest uppercase hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400">
                                        <Trash2 size={14} className="mr-2" /> DELETE HUB
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Visual Map Placeholder */}
            <Card className="p-8 border-none shadow-sm bg-primary-900 dark:bg-slate-900 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:shadow-2xl hover:shadow-primary-900/40 transition-all duration-500 overflow-hidden relative border dark:border-slate-800">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10"></div>
                <div className="relative z-10 w-24 h-24 bg-white/10 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-700 ring-8 ring-white/5 dark:ring-white/10">
                    <Globe size={48} className="text-secondary" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-2xl font-black text-white italic tracking-tighter leading-none mb-2">Bharat<span className="text-secondary">Network</span></h4>
                    <p className="text-[10px] font-black text-primary-200 dark:text-slate-500 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">Expand your logistics empire to new towns and panchayats</p>
                </div>
                <Button variant="secondary" className="relative z-10 font-black text-[9px] tracking-widest px-10 py-4 shadow-2xl shadow-black">OPEN LIVE MAP</Button>
            </Card>
        </div>
    );
};

export default ZonesPage;
