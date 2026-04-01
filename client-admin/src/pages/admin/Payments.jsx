import React, { useState } from 'react';
import { Card, Badge, Button } from '../../components/common';
import {
    CreditCard, DollarSign, Wallet, ArrowUpRight,
    ArrowDownRight, CheckCircle2, Clock, Search, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { useEffect } from 'react';

const PaymentsPage = () => {
    const { setIsLoading } = useLoading();

    useEffect(() => {
        setIsLoading(true);
        try {
            const timer = setTimeout(() => setIsLoading(false), 800);
            return () => clearTimeout(timer);
        } catch (err) {
            setIsLoading(false);
        }
    }, [setIsLoading]);

    const transactions = [
        { id: '#TXN-901', customer: 'Rahul Sharma', method: 'COD', amount: 450, status: 'COLLECTED', date: 'Today, 2:30 PM' },
        { id: '#TXN-902', customer: 'Sneha Patel', method: 'Online (UPI)', amount: 890, status: 'SETTLED', date: 'Today, 1:15 PM' },
        { id: '#TXN-903', customer: 'Amit Verma', method: 'COD', amount: 120, status: 'PENDING', date: 'Today, 12:45 PM' },
    ];

    const stats = [
        { label: 'Total Revenue', value: '₹4.52L', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'COD Pipeline', value: '₹12.4K', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Merchant Payouts', value: '₹3.10L', icon: CreditCard, color: 'text-primary-800', bg: 'bg-primary-50' },
    ];

    return (
        <div className="space-y-8 animate-fade-in uppercase tracking-tight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Settlements</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Manage cashflow and merchant payouts</p>
                </div>
                <Button className="font-black text-[10px] tracking-[0.2em] py-4 px-8 shadow-xl shadow-primary-900/20">
                    <Download size={16} className="mr-2" /> REVENUE REPORT
                </Button>
            </div>

            {/* Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="p-8 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative">
                            <div className={`absolute bottom-0 right-0 w-24 h-24 ${s.bg}/30 dark:${s.bg}/10 rounded-full translate-x-12 translate-y-12 group-hover:scale-110 transition-transform`}></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 leading-none">{s.label}</p>
                                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{s.value}</p>
                            </div>
                            <div className={`${s.bg} dark:bg-slate-800 p-5 rounded-3xl ${s.color} shadow-lg ring-4 ring-white dark:ring-slate-800 relative z-10`}>
                                <s.icon size={28} />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Recent Transactions</h3>
                        <Badge className="bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 px-3 py-1 font-black text-[8px] uppercase border-none ml-2">LIVE FEED</Badge>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-primary-800 dark:group-focus-within:text-primary-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find hash #ORD..."
                            className="pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-2xl focus:border-primary-100 dark:focus:border-primary-900/40 focus:bg-white dark:focus:bg-slate-800 text-sm font-bold w-full md:w-64 outline-none dark:text-slate-200"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Ref</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payer Details</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gateway</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-10 py-6 font-black text-slate-900 dark:text-white text-sm">{t.id}</td>
                                    <td className="px-10 py-6">
                                        <p className="font-bold text-slate-700 dark:text-slate-300 text-sm leading-none">{t.customer}</p>
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 italic">{t.date}</p>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400"><CreditCard size={14} /></div>
                                            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.method}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <Badge
                                            variant={t.status === 'SETTLED' ? 'success' : t.status === 'COLLECTED' ? 'info' : 'warning'}
                                            className="px-3 py-1 font-black text-[8px] uppercase tracking-widest"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                {t.status === 'SETTLED' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                                {t.status}
                                            </span>
                                        </Badge>
                                    </td>
                                    <td className="px-10 py-6 text-right font-black text-slate-900 dark:text-white italic">₹{t.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default PaymentsPage;
