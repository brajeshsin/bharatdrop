import React from 'react';
import { Card, Badge, Button } from '../../components/common';
import {
    BarChart3, TrendingUp, PieChart,
    ArrowUpRight, Users, Store, Bike, Calendar, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RePie, Pie, Cell, Legend
} from 'recharts';
import { useLoading } from '../../context/LoadingContext';
import { useEffect } from 'react';

const ReportsPage = () => {
    const { setIsLoading } = useLoading();

    useEffect(() => {
        setIsLoading(true);
        try {
            const timer = setTimeout(() => setIsLoading(false), 1000);
            return () => clearTimeout(timer);
        } catch (err) {
            setIsLoading(false);
        }
    }, [setIsLoading]);

    const revenueData = [
        { name: 'Mon', revenue: 45000 },
        { name: 'Tue', revenue: 52000 },
        { name: 'Wed', revenue: 48000 },
        { name: 'Thu', revenue: 61000 },
        { name: 'Fri', revenue: 55000 },
        { name: 'Sat', revenue: 78000 },
        { name: 'Sun', revenue: 85000 },
    ];

    const categoryData = [
        { name: 'Grocery', value: 450 },
        { name: 'Sweets', value: 300 },
        { name: 'Veg', value: 200 },
        { name: 'Others', value: 100 },
    ];

    const COLORS = ['#2E7D32', '#F4D56F', '#FF6F00', '#1C1C1C'];

    return (
        <div className="space-y-8 animate-fade-in uppercase tracking-tight pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">BI Intel</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Deep dive into platform analytics</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] tracking-widest hover:border-primary-800 transition-all text-slate-900 dark:text-white">
                        <Calendar size={16} /> MARCH 2026 <ArrowUpRight size={14} className="text-primary-800 dark:text-primary-400" />
                    </button>
                    <Button className="font-black text-[10px] tracking-[0.2em] py-4 px-8">
                        <Download size={16} className="mr-2" /> GENERATE MASTER SQL
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Breakdown Chart */}
                <Card className="p-10 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] h-[500px] flex flex-col">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">Revenue Velocity</h3>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mt-2 uppercase">Daily gross turnover analysis</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹4.2L</p>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-1">TOTAL THIS WEEK</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip cursor={{ fill: '#f8fafc', opacity: 0.05 }} contentStyle={{ borderRadius: '1.5rem', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                                <Bar dataKey="revenue" fill="#2E7D32" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Category Mix Chart */}
                <Card className="p-10 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] h-[500px] flex flex-col">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">Category Mix</h3>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mt-2 uppercase">Order volume distribution</p>
                        </div>
                        <PieChart size={24} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePie>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </RePie>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Performance Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Vendor Retention', value: '98%', icon: Store, trend: 'UP' },
                    { label: 'Avg Delivery Time', value: '24m', icon: Bike, trend: 'FAST' },
                    { label: 'Conversion Rate', value: '12.4%', icon: TrendingUp, trend: 'HIGH' }
                ].map((item, i) => (
                    <Card key={i} className="p-8 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center gap-6 group hover:bg-primary-800 dark:hover:bg-primary-900 transition-all duration-500">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-primary-800 dark:text-primary-400 shadow-sm group-hover:scale-110 transition-transform">
                            <item.icon size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 group-hover:text-primary-200 transition-colors">{item.label}</p>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-white transition-colors">{item.value}</p>
                                <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-none font-black text-[8px] group-hover:bg-white group-hover:text-primary-800">{item.trend}</Badge>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ReportsPage;
