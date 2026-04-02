import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/common';
import { adminService } from '../../services/adminService';
import {
    Package, DollarSign, Store, Bike,
    TrendingUp, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';

import { useLoading } from '../../context/LoadingContext';

const AdminDashboard = () => {
    const { setIsLoading } = useLoading();
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [s, o] = await Promise.all([
                    adminService.getStats(),
                    adminService.getOrders()
                ]);
                setStats(s);
                setOrders(o.slice(0, 5));
                setLoading(false);
            } catch (error) {
                console.error("Dashboard data load failed:", error);
                setLoading(false);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [setIsLoading]);

    if (loading || !stats) return <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-4 gap-6"><div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div><div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div><div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div><div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    </div>;

    const cards = [
        { label: 'Total Orders', value: stats?.totalOrders || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12.5%' },
        { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8.2%' },
        { label: 'Active Vendors', value: stats?.activeVendors || 0, icon: Store, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+4.1%' },
        { label: 'Live Deliveries', value: stats?.activeDeliveries || 0, icon: Bike, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'NEW' },
    ];

    return (
        <div className="space-y-8 animate-fade-in uppercase tracking-tight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">System Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase">Real-time platform performance</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="font-black text-[10px] tracking-widest bg-white dark:bg-slate-900 border-none">EXPORT REPORT</Button>
                    <Button size="sm" className="font-black text-[10px] tracking-widest">VIEW ALL ORDERS</Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="p-6 border-none shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden bg-white dark:bg-slate-900">
                            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg}/30 dark:${card.bg}/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform`}></div>
                            <div className="flex items-start justify-between relative z-10">
                                <div className={`${card.bg} dark:bg-slate-800 p-4 rounded-2xl ${card.color}`}>
                                    <card.icon size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={12} /> {card.trend}
                                </div>
                            </div>
                            <div className="mt-4 relative z-10">
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{card.value}</p>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{card.label}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-8 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">Order Trends</h3>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Past 7 days activity</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge className="bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 border-none px-3 font-bold">Daily</Badge>
                            <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-none px-3 font-bold">Weekly</Badge>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: 'Mon', orders: 400 },
                                { name: 'Tue', orders: 300 },
                                { name: 'Wed', orders: 600 },
                                { name: 'Thu', orders: 800 },
                                { name: 'Fri', orders: 500 },
                                { name: 'Sat', orders: 900 },
                                { name: 'Sun', orders: 1100 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="orders" stroke="#2E7D32" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-8 border-none shadow-sm bg-primary-900 dark:bg-slate-800 text-white rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <h3 className="text-xl font-black leading-tight uppercase italic tracking-tighter">Bharat<span className="text-secondary text-2xl font-black block">Drop Insight</span></h3>
                    <p className="text-primary-200 mt-4 font-bold text-xs tracking-widest uppercase leading-relaxed">Your platform has seen a 24% increase in rural commerce this week.</p>

                    <div className="mt-12 space-y-6">
                        {[
                            { label: 'COD Orders', value: '64%', progress: 64 },
                            { label: 'Town Growth', value: '18%', progress: 18 },
                            { label: 'Vendor Satisfaction', value: '92%', progress: 92 },
                        ].map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span>{item.label}</span>
                                    <span>{item.value}</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full" style={{ width: `${item.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button variant="secondary" className="w-full mt-10 py-4 font-black text-xs tracking-[0.2em] shadow-2xl shadow-black/50">UPGRADE PLAN</Button>
                </Card>
            </div>

            {/* Recent Orders Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Latest Requests</h2>
                    <Link to="/admin/orders" className="text-primary-800 dark:text-primary-400 font-black text-xs uppercase tracking-widest hover:underline">View All</Link>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Village</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-8 py-5 font-black text-slate-900 dark:text-white text-sm">{order.orderId}</td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm leading-none">{order.customer?.name || 'Unknown'}</p>
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{order.vendor?.name || 'Direct Shop'}</p>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{order.deliveryAddress?.village || 'N/A'}</td>
                                        <td className="px-8 py-5">
                                            <Badge
                                                variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'error' : 'warning'}
                                                className="px-3 py-1 font-black text-[9px] uppercase tracking-widest"
                                            >
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors">₹{order.total || order.amount || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
