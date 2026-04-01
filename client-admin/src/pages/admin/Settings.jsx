import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '../../components/common';
import {
    Settings, Globe, Bell, Shield,
    CreditCard, Server, Smartphone, Save, ToggleRight, ToggleLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { useEffect } from 'react';

const SettingsPage = () => {
    const { setIsLoading } = useLoading();

    useEffect(() => {
        setIsLoading(true);
        try {
            const timer = setTimeout(() => setIsLoading(false), 600);
            return () => clearTimeout(timer);
        } catch (err) {
            setIsLoading(false);
        }
    }, [setIsLoading]);

    const [config, setConfig] = useState({
        codEnabled: true,
        onlinePaymentEnabled: true,
        deliveryFee: 40,
        merchantCommission: 10,
        appStatus: 'Live'
    });

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in uppercase tracking-tight pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase italic">Platform<span className="text-primary-800 dark:text-primary-400 ml-2">Configuration</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase mt-4">Global control station for BharatDrop hub</p>
                </div>
                <Button className="font-black text-[10px] tracking-[0.2em] py-5 px-10 shadow-2xl shadow-primary-900/30">
                    <Save size={18} className="mr-3" /> COMMIT ALL CHANGES
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Logistics Section */}
                <Card className="p-10 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] space-y-10 relative overflow-hidden group border dark:border-slate-800">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 dark:bg-primary-900/10 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform"></div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-primary-800 dark:bg-primary-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Globe size={24} /></div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Logistics & Pricing</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <Input label="Flat Delivery Fee (₹)" type="number" value={config.deliveryFee} onChange={(e) => setConfig({ ...config, deliveryFee: e.target.value })} className="h-16 font-black text-2xl" />
                        <Input label="Merchant Commission (%)" type="number" value={config.merchantCommission} onChange={(e) => setConfig({ ...config, merchantCommission: e.target.value })} className="h-16 font-black text-2xl" />
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            {config.codEnabled ? <ToggleRight className="text-primary-800 dark:text-primary-400" size={40} /> : <ToggleLeft className="text-slate-300 dark:text-slate-600" size={40} />}
                            <div>
                                <p className="font-black text-slate-900 dark:text-white uppercase text-sm">Cash on Delivery (COD)</p>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 italic">Allow customers to pay at the village hub</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className={`px-8 py-3 rounded-xl font-black text-[9px] tracking-widest border-none ${config.codEnabled ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
                            onClick={() => setConfig({ ...config, codEnabled: !config.codEnabled })}
                        >
                            {config.codEnabled ? 'ENABLED' : 'DISABLED'}
                        </Button>
                    </div>
                </Card>

                {/* Security Section */}
                <Card className="p-10 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] space-y-10 relative overflow-hidden group border dark:border-slate-800">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform"></div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Shield size={24} /></div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Security & Access</h3>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem]">
                            <div>
                                <p className="font-black text-slate-900 dark:text-white text-sm">Two-Factor Authentication</p>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Add extra layer of security for admin accounts</p>
                            </div>
                            <Badge className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-2 font-black border-none text-[8px]">RECOMMENDED</Badge>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem]">
                            <div>
                                <p className="font-black text-slate-900 dark:text-white text-sm">API Access Keys</p>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Regenerate global auth tokens for hub network</p>
                            </div>
                            <Button variant="outline" size="sm" className="font-black text-[9px] px-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">ROTATE KEYS</Button>
                        </div>
                    </div>
                </Card>

                {/* System Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-8 border-none shadow-sm bg-slate-900 dark:bg-black text-white rounded-[2.5rem] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Server size={20} className="text-primary-400" /></div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Status</p>
                                <p className="text-xl font-black uppercase text-secondary italic tracking-tighter">ALL NODES ONLINE</p>
                            </div>
                        </div>
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
                    </Card>
                    <Card className="p-8 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-between border dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center"><Smartphone size={20} className="text-slate-400 dark:text-slate-500" /></div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">App Engine</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white uppercase">Version 2.4.0</p>
                            </div>
                        </div>
                        <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-4 py-1.5 font-black border-none text-[8px]">STABLE</Badge>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
