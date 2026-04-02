import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/common';
import {
    CreditCard, CheckCircle2, XCircle,
    ToggleRight, ToggleLeft, ShieldCheck,
    Info, RefreshCw, QrCode, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { useLoading } from '../../context/LoadingContext';

const PaymentManagement = () => {
    const [methods, setMethods] = useState([]);
    const { setIsLoading } = useLoading();

    const fetchMethods = async () => {
        setIsLoading(true);
        try {
            const response = await adminService.getPaymentMethods();
            if (response.success) {
                setMethods(response.data);
            } else {
                toast.error(response.message || 'Failed to fetch payment methods');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleToggle = async (id) => {
        try {
            const response = await adminService.togglePaymentMethod(id);
            if (response.success) {
                toast.success('Payment method updated');
                setMethods(methods.map(m => m._id === id ? { ...m, isEnabled: !m.isEnabled } : m));
            } else {
                toast.error(response.message || 'Failed to update');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    };

    const getIcon = (code) => {
        switch (code) {
            case 'cod': return <Truck size={24} />;
            case 'upi': return <QrCode size={24} />;
            default: return <CreditCard size={24} />;
        }
    };

    return (
        <div className="space-y-10 animate-fade-in uppercase tracking-tight pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter italic">
                        Payment<span className="text-primary-800 dark:text-primary-400 ml-3">Governance</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mt-4 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" /> Secure Transaction Control Center
                    </p>
                </div>
                <Button
                    onClick={fetchMethods}
                    variant="outline"
                    className="font-black text-[10px] tracking-[0.2em] py-4 px-8 border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                    <RefreshCw size={16} className="mr-2" /> FORCE REFRESH
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                    {methods.map((method, index) => (
                        <motion.div
                            key={method._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] relative overflow-hidden group transition-all ${!method.isEnabled && 'opacity-70 grayscale'}`}>
                                <div className={`absolute top-0 right-0 w-32 h-32 ${method.isEnabled ? 'bg-primary-50 dark:bg-primary-900/10' : 'bg-slate-100 dark:bg-slate-800/50'} rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform`}></div>

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${method.isEnabled ? 'bg-primary-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                            {getIcon(method.code)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">{method.name}</h3>
                                            <Badge className={`mt-3 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 ${method.isEnabled ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                                                {method.isEnabled ? 'SYSTEM ACTIVE' : 'DISABLED'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleToggle(method._id)}
                                        className="transition-transform active:scale-90"
                                    >
                                        {method.isEnabled ? (
                                            <ToggleRight size={48} className="text-primary-800 dark:text-primary-400" />
                                        ) : (
                                            <ToggleLeft size={48} className="text-slate-300 dark:text-slate-700" />
                                        )}
                                    </button>
                                </div>

                                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 leading-none flex items-center gap-1.5">
                                        <Info size={12} /> Strategy Description
                                    </p>
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        {method.description || 'No description provided for this protocol.'}
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-3 opacity-60">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Hash ID: {method._id.slice(-8)}</span>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Warning Section */}
            <Card className="p-10 border-2 border-amber-100 dark:border-amber-900/20 bg-amber-50/50 dark:bg-amber-900/5 rounded-[3rem] flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-3xl flex items-center justify-center text-amber-600">
                    <ShieldCheck size={32} />
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none">Security Protocol Reminder</h3>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                        Changes to payment methods are reflected instantly across the network. Ensuring at least one payment method is active is critical for checkout continuity.
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-2">
                        {methods.filter(m => m.isEnabled).length > 0 ? (
                            <CheckCircle2 size={24} className="text-emerald-500" />
                        ) : (
                            <XCircle size={24} className="text-rose-500" />
                        )}
                        <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white">
                            {methods.filter(m => m.isEnabled).length}/{methods.length}
                        </span>
                    </div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mr-1">ACTIVE NODES</p>
                </div>
            </Card>
        </div>
    );
};

export default PaymentManagement;
