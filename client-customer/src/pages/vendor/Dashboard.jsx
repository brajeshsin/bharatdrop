import React, { useState } from 'react';
import { Card, Badge, Button } from '../../components/common';
import { ORDER_STATUS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingBag, CreditCard, TrendingUp, AlertCircle, Clock, DollarSign, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const VendorDashboard = () => {
    const { user } = useAuth();
    const myOrders = [
        { id: '#ORD-101', customer: 'Brajesh Singh', status: ORDER_STATUS.PLACED, total: 450, items: 3, time: '2 mins ago' },
        { id: '#ORD-102', customer: 'Amit Kumar', status: ORDER_STATUS.ACCEPTED, total: 120, items: 1, time: '15 mins ago' },
        { id: '#ORD-103', customer: 'Priya Sharma', status: ORDER_STATUS.READY_FOR_PICKUP, total: 890, items: 5, time: '1 hour ago' },
    ];

    const stats = [
        { label: 'Today Orders', value: '12', icon: Package, color: 'bg-primary-800' },
        { label: 'Total Earnings', value: '₹4,520', icon: DollarSign, color: 'bg-emerald-600' },
        { label: 'Rating', value: '4.5', icon: TrendingUp, color: 'bg-secondary' },
    ];

    if (user?.status === 'PENDING') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 uppercase tracking-tight">
                <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-[2.5rem] flex items-center justify-center text-primary-800 dark:text-primary-400 shadow-xl border-2 border-primary-100 dark:border-primary-800 animate-bounce">
                    <ShieldAlert size={48} />
                </div>
                <div className="space-y-4 max-w-lg">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white leading-tight underline decoration-primary-500 decoration-8 underline-offset-8">Account Under Review</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed">
                        Hello, <span className="text-primary-800 dark:text-primary-400 font-black">{user.name}</span>! Your request to join as a <span className="text-secondary font-black">Merchant</span> is being reviewed by our team.
                    </p>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-50 dark:border-slate-800 shadow-sm inline-block">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Registered Store</p>
                        <p className="text-xl font-black text-slate-800 dark:text-white">{user.storeName || 'My Store'}</p>
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estimated verification time: 24-48 Hours</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10 uppercase tracking-tight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-base leading-tight dark:text-white">Vendor Panel</h1>
                    <p className="text-slate-500 font-bold">Welcome, <span className="text-primary-800 dark:text-primary-400 font-black">{user?.storeName || user?.name}</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="success" className="bg-primary-800 text-white border-none py-2 px-4 shadow-lg ring-4 ring-primary-50">Shop: Open</Badge>
                </div>
            </div>

            {/* Quick Stats - Simple & Bold */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="p-6 flex items-center gap-5 border-none shadow-md bg-white border-t-4 border-primary-800">
                            <div className={`${s.color} p-4 rounded-[1.5rem] text-white shadow-lg`}>
                                <s.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                                <p className="text-3xl font-black text-text-base mt-2">{s.value}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orders List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-slate-800 px-1 border-b-2 border-primary-50 pb-2">New Orders</h2>
                    {myOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[2rem] p-5 border-2 border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary-800 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-800">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-text-base text-lg leading-tight uppercase tracking-tight">{order.id}</h3>
                                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{order.customer} • {order.items} Items</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0">
                                <div className="text-right">
                                    <p className="text-lg font-black text-text-base">₹{order.total}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.time}</p>
                                </div>
                                <Button size="sm" className="bg-primary-800 text-white rounded-xl uppercase tracking-widest text-[10px] px-6">Accept</Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Guide */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-slate-800 px-1 border-b-2 border-primary-50 pb-2">Shop Summary</h2>
                    <Card className="p-8 bg-primary-900 border-none text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
                        <h3 className="text-4xl font-black leading-tight">Your shop is <span className="text-secondary">trending!</span></h3>
                        <p className="text-primary-200 mt-4 font-bold text-sm tracking-widest uppercase">Rank: #3 in Rampur Village</p>
                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/50 mb-1">Weekly Satisfaction</p>
                                <p className="text-2xl font-black">98%</p>
                            </div>
                            <TrendingUp size={32} className="text-secondary" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
